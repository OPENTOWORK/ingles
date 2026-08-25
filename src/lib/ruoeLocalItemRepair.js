/**
 * Local item-level repair for dry-runs (v1.1.2) — no DB, no full-part regen when possible.
 */
import { validateRuoeEditorialQuality } from './ruoeEditorialQuality.js';
import { countWords } from './b2RuoeExamQuality.js';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function parseJson(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Invalid JSON from repair model');
  }
}

function resolveStem(q) {
  return String(q?.stem || q?.baseWord || '').trim();
}

/** Items where stem equals answer (case-insensitive). */
export function findPart3NoTransformItems(gen) {
  const questions = asArray(gen?.questions);
  const modelAnswers = asArray(gen?.modelAnswers);
  const bad = [];
  questions.forEach((q, i) => {
    const entry =
      modelAnswers.find((m) => String(m?.id) === String(q?.id)) ||
      modelAnswers.find((m) => Number(m?.number) === Number(q?.number)) ||
      modelAnswers[i];
    const stem = resolveStem(q);
    const answer = String(entry?.answer || '').trim();
    if (stem && answer && stem.toLowerCase() === answer.toLowerCase()) {
      bad.push({ index: i, number: q?.number, stem, answer, id: q?.id || `q${i + 1}` });
    }
  });
  return bad;
}

/**
 * Regenerate only Part 3 items with stem==answer.
 * @returns {Promise<{ repaired: object, repairs: string[] }>}
 */
export async function repairPart3NoTransformItems(openai, gen, { model = 'gpt-4o-mini' } = {}) {
  const bad = findPart3NoTransformItems(gen);
  if (!bad.length) return { repaired: gen, repairs: [] };

  const repairs = [];
  const passage = String(gen.passage || '');
  const title = String(gen.title || '');

  for (const item of bad) {
    const { text } = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You fix ONE B2 Part 3 word-formation item. Return JSON only: {"stem":"CAPITALS","answer":"derivedword","passageSnippet":"optional one-sentence context if gap sentence needs tweak"}. The answer MUST be a genuine one-word derivation DIFFERENT from the stem (never identical). British English B2.',
        },
        {
          role: 'user',
          content: `TITLE: ${title}\nPASSAGE excerpt: ${passage.slice(0, 800)}\nBAD ITEM gap (${item.number}): stem "${item.stem}" → answer "${item.answer}" (INVALID: no transformation).\nProvide new stem (CAPITALS) and derived answer for the SAME gap context.`,
        },
      ],
    }).then((c) => ({ text: c.choices?.[0]?.message?.content || '{}' }));

    const fixed = parseJson(text);
    const newStem = String(fixed.stem || '').trim().toUpperCase();
    const newAnswer = String(fixed.answer || '').trim().toLowerCase();
    if (!newStem || !newAnswer || newStem.toLowerCase() === newAnswer) continue;

    const qIdx = gen.questions.findIndex((q) => Number(q.number) === Number(item.number));
    if (qIdx >= 0) {
      gen.questions[qIdx] = { ...gen.questions[qIdx], stem: newStem };
    }
    const maIdx = gen.modelAnswers.findIndex(
      (m) => Number(m.number) === Number(item.number) || String(m.id) === String(item.id),
    );
    if (maIdx >= 0) {
      gen.modelAnswers[maIdx] = { ...gen.modelAnswers[maIdx], answer: newAnswer };
    } else {
      gen.modelAnswers.push({ id: item.id, number: item.number, answer: newAnswer });
    }

    const gapRe = new RegExp(
      `\\(${item.number}\\)\\s*(?:_+|\\.{2,}|…+)\\s*\\(${item.stem}\\)`,
      'i',
    );
    if (gapRe.test(gen.passage)) {
      gen.passage = gen.passage.replace(gapRe, `(${item.number}) ___ (${newStem})`);
    }
    repairs.push(`Q${item.number}: ${item.stem}→${item.answer} repaired to ${newStem}→${newAnswer}`);
  }

  return { repaired: gen, repairs };
}

/** Model rewrite passage only for Part 5 length. */
export async function repairPart5PassageLength(openai, gen, { model = 'gpt-4o-mini', targetMin = 560, targetMax = 620 } = {}) {
  const wc = countWords(gen.passage);
  if (wc >= 550 && wc <= 650) return { repaired: gen, repairs: [] };

  const { text } = await openai.chat.completions.create({
    model,
    temperature: 0.5,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Rewrite ONE B2 Reading Part 5 passage to ${targetMin}–${targetMax} words (target 580–620). Return JSON {"passage":"...","passageWordCount":N}. Keep title themes and facts; expand or trim without changing question focus.`,
      },
      {
        role: 'user',
        content: `TITLE: ${gen.title}\nCURRENT (${wc} words):\n${gen.passage}`,
      },
    ],
  }).then((c) => ({ text: c.choices?.[0]?.message?.content || '{}' }));

  const parsed = parseJson(text);
  const newPassage = String(parsed.passage || '').trim();
  const newWc = countWords(newPassage);
  if (!newPassage || newWc < 550 || newWc > 650) {
    return { repaired: gen, repairs: [] };
  }
  gen.passage = newPassage;
  gen.passageWordCount = newWc;
  return { repaired: gen, repairs: [`passage length ${wc}→${newWc}`] };
}

/** Regenerate Part 7 questions flagged for word-match. */
export async function repairPart7WordMatchQuestions(openai, gen, { model = 'gpt-4o-mini', minFlags = 2 } = {}) {
  const editorial = validateRuoeEditorialQuality(7, gen);
  const flagged = editorial.findings.filter((f) => f.rule_id === 'TEST-P7-WORD-MATCH');
  if (flagged.length < minFlags) return { repaired: gen, repairs: [] };

  const sections = asArray(gen.sections).map((s) => ({
    letter: s.letter,
    name: s.name || s.title,
    text: String(s.text || s.body || '').slice(0, 500),
  }));
  const flaggedNumbers = flagged.map((f) => {
    const m = String(f.location || '').match(/Q(\d+)/);
    return m ? Number(m[1]) : null;
  }).filter(Boolean);

  const repairs = [];
  for (const num of flaggedNumbers) {
    const qIdx = gen.questions.findIndex((q) => Number(q.number) === num);
    if (qIdx < 0) continue;
    const q = gen.questions[qIdx];
    const correctLetter =
      String(
        gen.modelAnswers.find((m) => Number(m.number) === num)?.answer || '',
      ).trim().toUpperCase() || 'A';

    const { text } = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Rewrite ONE B2 Part 7 matching question. Return JSON {"prompt":"Who ...?"}. Must start with Who. Paraphrase — do NOT copy 4+ consecutive words from any profile. Test meaning/attitude/motivation, not keywords.',
        },
        {
          role: 'user',
          content: `SECTIONS:\n${sections.map((s) => `${s.letter}) ${s.name}\n${s.text}`).join('\n\n')}\n\nBAD QUESTION Q${num} (copies profile wording): ${q.prompt || q.question}\nCorrect answer: section ${correctLetter}. Rewrite paraphrased.`,
        },
      ],
    }).then((c) => ({ text: c.choices?.[0]?.message?.content || '{}' }));

    const parsed = parseJson(text);
    const newPrompt = String(parsed.prompt || '').trim();
    if (!newPrompt || !/^who\b/i.test(newPrompt)) continue;
    gen.questions[qIdx] = { ...q, prompt: newPrompt, question: newPrompt };
    repairs.push(`Q${num} paraphrased`);
  }

  return { repaired: gen, repairs };
}
