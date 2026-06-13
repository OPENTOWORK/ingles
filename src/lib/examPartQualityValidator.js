import { cambridgeChatCompletion } from '@/lib/draloAiEngine';

/**
 * Validador de calidad (IA) para B2 Reading & Use of English Part 1 (multiple-choice cloze).
 * Server-side only. Dos comprobaciones:
 *  1. "Blind solve": un modelo resuelve la parte SIN ver el answer key; los desacuerdos
 *     delatan ítems ambiguos o keys incorrectos.
 *  2. Rúbrica: nivel CEFR, naturalidad, claridad, calidad de distractores y variedad
 *     léxica (que no todos los ítems sean de verbos).
 */

function getValidatorModel() {
  const m = String(process.env.DRALO_OPENAI_MODEL_VALIDATOR || '').trim();
  return m || undefined;
}

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Quality validator returned invalid JSON.');
  }
}

function buildExamView(generated) {
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const itemLines = questions
    .map((q) => {
      const options = (Array.isArray(q?.options) ? q.options : []).join('   ');
      return `${q?.number}. ${options}`;
    })
    .join('\n');
  return `TITLE: ${generated?.title || ''}\n\nPASSAGE:\n${generated?.passage || ''}\n\nOPTIONS PER GAP:\n${itemLines}`;
}

function expectedAnswersByNumber(generated) {
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const modelAnswers = Array.isArray(generated?.modelAnswers) ? generated.modelAnswers : [];
  const byId = new Map(modelAnswers.map((m) => [String(m?.id), m]));
  const out = new Map();
  questions.forEach((q, i) => {
    const entry = byId.get(String(q?.id)) ?? modelAnswers[i];
    const letter = String(entry?.answer ?? '').trim().toUpperCase();
    if (q?.number != null && /^[A-D]$/.test(letter)) out.set(Number(q.number), letter);
  });
  return out;
}

async function blindSolve(generated) {
  const examView = buildExamView(generated);
  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system: `You are a Cambridge B2 First examiner. Solve this Use of English Part 1 (multiple-choice cloze) WITHOUT any answer key.

Return ONLY JSON:
{"answers":[{"number":1,"letter":"A"}, …],"ambiguous":[{"number":3,"letters":["A","C"],"reason":"both collocate naturally with …"}]}

- "answers": your single best letter for every gap.
- "ambiguous": ONLY gaps where you genuinely consider two or more options defensible for a strong B2 candidate (empty array if none).`,
    messages: [{ role: 'user', content: examView }],
    temperature: 0,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  });

  const parsed = parseJsonFromModel(text);
  const solved = new Map(
    (Array.isArray(parsed?.answers) ? parsed.answers : [])
      .map((a) => [Number(a?.number), String(a?.letter ?? '').trim().toUpperCase()])
      .filter(([n, l]) => Number.isInteger(n) && /^[A-D]$/.test(l)),
  );
  const ambiguous = Array.isArray(parsed?.ambiguous) ? parsed.ambiguous : [];

  const expected = expectedAnswersByNumber(generated);
  const mismatches = [];
  for (const [number, keyLetter] of expected) {
    const solverLetter = solved.get(number);
    if (solverLetter && solverLetter !== keyLetter) {
      mismatches.push({ number, key: keyLetter, solver: solverLetter });
    }
  }

  return { mismatches, ambiguous, solvedCount: solved.size };
}

async function rubricReview(generated) {
  const examView = buildExamView(generated);
  const key = [...expectedAnswersByNumber(generated)]
    .map(([n, l]) => `${n}=${l}`)
    .join(', ');

  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system: `You are a strict Cambridge item writer reviewing a B2 First Use of English Part 1 task (multiple-choice cloze). Judge honestly; do not inflate.

Return ONLY JSON:
{
 "cefrLevel": "A2|B1|B1+|B2|C1|C2",
 "textNaturalness": 1-5,
 "questionClarity": 1-5,
 "distractorQuality": 1-5,
 "verbOnlyItems": <how many of the items have options that are ALL verbs>,
 "categoriesTested": ["collocation","fixed-expression","preposition","close-meaning-noun", …],
 "weakItems": [{"number":n,"problem":"short, specific"}],
 "realisticB2": true|false,
 "issues": ["short, specific issue", …],
 "verdict": "pass" | "revise"
}

Verdict "revise" if ANY of: text is clearly below or above B2; any item has two defensible answers; distractors are absurd or grammatically impossible; all items test only verbs; an option has more than one word.`,
    messages: [
      { role: 'user', content: `${examView}\n\nOFFICIAL KEY: ${key}` },
    ],
    temperature: 0,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  });

  return parseJsonFromModel(text);
}

/* ------------------------------------------------------------------ */
/* B2 Part 2 — open cloze                                              */
/* ------------------------------------------------------------------ */

function buildOpenClozeView(generated) {
  return `TITLE: ${generated?.title || ''}\n\nPASSAGE (fill each numbered gap with ONE word):\n${generated?.passage || ''}`;
}

function expectedOpenAnswersByNumber(generated) {
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const modelAnswers = Array.isArray(generated?.modelAnswers) ? generated.modelAnswers : [];
  const byId = new Map(modelAnswers.map((m) => [String(m?.id), m]));
  const out = new Map();
  questions.forEach((q, i) => {
    const entry = byId.get(String(q?.id)) ?? modelAnswers[i];
    const word = String(entry?.answer ?? '').trim().toLowerCase();
    if (q?.number != null && word) out.set(Number(q.number), word);
  });
  return out;
}

async function blindSolveOpenCloze(generated) {
  const examView = buildOpenClozeView(generated);
  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system: `You are a Cambridge B2 First examiner. Solve this Use of English Part 2 (open cloze) WITHOUT any answer key. Each gap takes exactly ONE word (grammar/function words: prepositions, relatives, auxiliaries, determiners, linkers…).

Return ONLY JSON:
{"answers":[{"number":9,"word":"of","alternatives":["about"]}, …],"ambiguous":[{"number":12,"words":["which","that"],"reason":"both relatives are grammatical here"}]}

- "answers": your single best word for every gap, plus any OTHER words you consider fully correct in "alternatives" (empty array if none).
- "ambiguous": ONLY gaps where two or more different words are equally defensible for a strong B2 candidate (empty array if none).`,
    messages: [{ role: 'user', content: examView }],
    temperature: 0,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  });

  const parsed = parseJsonFromModel(text);
  const solved = new Map();
  for (const a of Array.isArray(parsed?.answers) ? parsed.answers : []) {
    const n = Number(a?.number);
    const best = String(a?.word ?? '').trim().toLowerCase();
    if (!Number.isInteger(n) || !best) continue;
    const alts = (Array.isArray(a?.alternatives) ? a.alternatives : [])
      .map((w) => String(w ?? '').trim().toLowerCase())
      .filter(Boolean);
    solved.set(n, { best, accepted: new Set([best, ...alts]) });
  }
  const ambiguous = Array.isArray(parsed?.ambiguous) ? parsed.ambiguous : [];

  const expected = expectedOpenAnswersByNumber(generated);
  const mismatches = [];
  for (const [number, keyWord] of expected) {
    const entry = solved.get(number);
    if (entry && !entry.accepted.has(keyWord)) {
      mismatches.push({ number, key: keyWord, solver: entry.best });
    }
  }

  return { mismatches, ambiguous, solvedCount: solved.size };
}

async function rubricReviewOpenCloze(generated) {
  const examView = buildOpenClozeView(generated);
  const key = [...expectedOpenAnswersByNumber(generated)]
    .map(([n, w]) => `${n}=${w}`)
    .join(', ');
  const exampleSentence = String(
    generated?.example?.sentence || generated?.example?.text || '',
  ).trim();
  const exampleAnswer = String(generated?.example?.answer || '').trim();

  const { text } = await cambridgeChatCompletion({
    model: getValidatorModel(),
    system: `You are a strict Cambridge item writer reviewing a B2 First Use of English Part 2 task (open cloze: ONE word per gap, mainly grammar/function words). Judge honestly; do not inflate.

Return ONLY JSON:
{
 "cefrLevel": "A2|B1|B1+|B2|C1|C2",
 "textNaturalness": 1-5,
 "exampleValid": true|false,
 "vocabularyStyleItems": [<numbers of gaps that test Part 1-style content vocabulary instead of grammar/function words>],
 "multipleAnswerItems": [{"number":n,"words":["…","…"],"reason":"short"}],
 "tooObviousItems": [<numbers of gaps trivially easy for B1>],
 "categoriesTested": ["preposition","relative","auxiliary","determiner","linker","quantifier", …],
 "weakItems": [{"number":n,"problem":"short, specific"}],
 "realisticB2": true|false,
 "issues": ["short, specific issue", …],
 "verdict": "pass" | "revise"
}

Verdict "revise" if ANY of: text is clearly below or above B2; any gap accepts several equally correct words; any keyed answer is not clearly supported by grammar/context; the part mostly tests content vocabulary; the example has no real gap or an illogical answer.`,
    messages: [
      {
        role: 'user',
        content: `${examView}\n\nEXAMPLE (separate from passage): ${exampleSentence || '—'} → ${exampleAnswer || '—'}\n\nOFFICIAL KEY: ${key}`,
      },
    ],
    temperature: 0,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  });

  return parseJsonFromModel(text);
}

/**
 * @returns {Promise<{ ok: boolean, errors: string[], warnings: string[], blindSolve: object, rubric: object }>}
 */
export async function validateB2Part2Quality(generated) {
  const errors = [];
  const warnings = [];

  const [solve, rubric] = await Promise.all([
    blindSolveOpenCloze(generated),
    rubricReviewOpenCloze(generated),
  ]);

  if (solve.mismatches.length >= 2) {
    errors.push(
      `Blind-solve disagreed with the answer key on ${solve.mismatches.length} gaps: ${solve.mismatches
        .map((m) => `Q${m.number} (key "${m.key}", solver "${m.solver}")`)
        .join(', ')}. Likely ambiguous gaps or wrong keys.`,
    );
  } else if (solve.mismatches.length === 1) {
    const m = solve.mismatches[0];
    warnings.push(`Blind-solve disagreed on Q${m.number} (key "${m.key}", solver "${m.solver}"). Review this gap.`);
  }
  for (const a of solve.ambiguous) {
    warnings.push(
      `Solver flagged Q${a?.number} as ambiguous (${(a?.words || []).join('/')}): ${a?.reason || 'no reason given'}.`,
    );
  }

  const multi = Array.isArray(rubric?.multipleAnswerItems) ? rubric.multipleAnswerItems : [];
  if (multi.length >= 2) {
    errors.push(
      `${multi.length} gaps accept several equally correct words: ${multi
        .map((m) => `Q${m?.number} (${(m?.words || []).join('/')})`)
        .join(', ')}. Each gap must have one clear best answer.`,
    );
  } else if (multi.length === 1) {
    const m = multi[0];
    warnings.push(`Q${m?.number} may accept several words (${(m?.words || []).join('/')}): ${m?.reason || ''}`);
  }

  const vocabStyle = Array.isArray(rubric?.vocabularyStyleItems) ? rubric.vocabularyStyleItems : [];
  if (vocabStyle.length >= 4) {
    errors.push(
      `Gaps ${vocabStyle.join(', ')} test content vocabulary (Part 1 style) — Part 2 must test grammar/function words.`,
    );
  } else if (vocabStyle.length > 0) {
    warnings.push(`Gaps ${vocabStyle.join(', ')} lean towards vocabulary rather than grammar/function words.`);
  }

  if (rubric?.exampleValid === false) {
    errors.push('The example is invalid (no real gap or illogical answer).');
  }

  const cefr = String(rubric?.cefrLevel || '').toUpperCase();
  if (cefr && ['A1', 'A2', 'C1', 'C2'].includes(cefr)) {
    errors.push(`Estimated CEFR level is ${cefr}; the text and gaps must sit at B2.`);
  } else if (cefr === 'B1') {
    warnings.push('Estimated CEFR level is B1 — the text or gaps may be too easy for B2.');
  }

  const obvious = Array.isArray(rubric?.tooObviousItems) ? rubric.tooObviousItems : [];
  if (obvious.length) {
    warnings.push(`Gaps ${obvious.join(', ')} look trivially easy for B2.`);
  }

  if (rubric?.verdict === 'revise') {
    const issues = Array.isArray(rubric?.issues) ? rubric.issues.filter(Boolean) : [];
    warnings.push(`Rubric verdict: revise.${issues.length ? ` Issues: ${issues.join(' | ')}` : ''}`);
  }
  for (const w of Array.isArray(rubric?.weakItems) ? rubric.weakItems : []) {
    if (w?.number != null && w?.problem) warnings.push(`Weak item Q${w.number}: ${w.problem}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    blindSolve: solve,
    rubric,
  };
}

/**
 * @returns {Promise<{ ok: boolean, errors: string[], warnings: string[], blindSolve: object, rubric: object }>}
 */
export async function validateB2Part1Quality(generated) {
  const errors = [];
  const warnings = [];

  const [solve, rubric] = await Promise.all([blindSolve(generated), rubricReview(generated)]);

  if (solve.mismatches.length >= 2) {
    errors.push(
      `Blind-solve disagreed with the answer key on ${solve.mismatches.length} items: ${solve.mismatches
        .map((m) => `Q${m.number} (key ${m.key}, solver ${m.solver})`)
        .join(', ')}. Likely ambiguous items or wrong keys.`,
    );
  } else if (solve.mismatches.length === 1) {
    const m = solve.mismatches[0];
    warnings.push(`Blind-solve disagreed on Q${m.number} (key ${m.key}, solver ${m.solver}). Review this item.`);
  }
  for (const a of solve.ambiguous) {
    warnings.push(
      `Solver flagged Q${a?.number} as ambiguous (${(a?.letters || []).join('/')}): ${a?.reason || 'no reason given'}.`,
    );
  }

  const verbOnly = Number(rubric?.verbOnlyItems);
  const totalItems = Array.isArray(generated?.questions) ? generated.questions.length : 8;
  if (Number.isFinite(verbOnly) && totalItems > 0 && verbOnly >= totalItems) {
    errors.push('All items test only verbs — Part 1 must mix collocations, prepositions, nouns, adjectives and adverbs.');
  } else if (Number.isFinite(verbOnly) && verbOnly > 4) {
    warnings.push(`${verbOnly} of ${totalItems} items have all-verb options; aim for at most 4.`);
  }

  const cefr = String(rubric?.cefrLevel || '').toUpperCase();
  if (cefr && ['A1', 'A2', 'C1', 'C2'].includes(cefr)) {
    errors.push(`Estimated CEFR level is ${cefr}; the text and items must sit at B2.`);
  } else if (cefr === 'B1') {
    warnings.push('Estimated CEFR level is B1 — the text or gaps may be too easy for B2.');
  }

  if (rubric?.verdict === 'revise') {
    const issues = Array.isArray(rubric?.issues) ? rubric.issues.filter(Boolean) : [];
    warnings.push(`Rubric verdict: revise.${issues.length ? ` Issues: ${issues.join(' | ')}` : ''}`);
  }
  for (const w of Array.isArray(rubric?.weakItems) ? rubric.weakItems : []) {
    if (w?.number != null && w?.problem) warnings.push(`Weak item Q${w.number}: ${w.problem}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    blindSolve: solve,
    rubric,
  };
}
