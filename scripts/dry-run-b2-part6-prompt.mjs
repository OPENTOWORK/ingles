/**
 * Local dry-run: generate ONE B2 Reading Part 6 with the code prompt (no Supabase write).
 * Does NOT pad/expand the passage after generation — length must come from the model
 * (with optional full regeneration retries only).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part6-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import {
  countWords,
  extractPoolLetter,
  extractPoolSentenceText,
} from '../src/lib/b2RuoeExamQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('reading', 'gapped-text', 'B2', {
  topic: 'community libraries and changing reading habits',
  varietySeed: Date.now(),
  partNumber: 6,
  questionCount: 6,
});

const modelName =
  process.env.OPENAI_MODEL?.trim() ||
  process.env.DRALO_OPENAI_MODEL?.trim() ||
  process.env.OPENAI_MODEL_CAMBRIDGE?.trim() ||
  'gpt-4o';

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading Part 6 (gapped text). CRITICAL LENGTH: the passage field MUST be 500–600 words (target 540–570). Count every word in the passage before returning and set passageWordCount to that integer. Reject drafts under 500 words — expand paragraphs first. Prefer about seven paragraphs of ~70–90 words each. Exactly 6 gaps numbered (37)–(42). Exactly 7 sentencePool sentences A)–G). modelAnswers use 6 different letters A–G with exactly one unused. Questions have numbers only (no per-question options). Cohesion-based gaps, not keyword matching. No placeholders. No student-facing Cambridge.';

console.error(`Generating Part 6 dry-run (model=${modelName}, no Supabase, no length padding)…`);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/** Schema-only normalisation — NEVER mutates passage text/length. */
function normalizeSchemaOnly(generated) {
  const out = { ...generated };
  const rawPassage = String(out.passage || '');

  let pool = Array.isArray(out.sentencePool)
    ? out.sentencePool
    : Array.isArray(out.options)
      ? out.options
      : [];
  const cleaned = [];
  const seen = new Set();
  for (let i = 0; i < pool.length; i += 1) {
    const item = pool[i];
    const letter = extractPoolLetter(item) || 'ABCDEFG'[cleaned.length];
    if (!/^[A-G]$/.test(letter) || seen.has(letter)) continue;
    const text = extractPoolSentenceText(item);
    if (!text) continue;
    cleaned.push(`${letter}) ${text}`);
    seen.add(letter);
  }
  out.sentencePool = cleaned;
  delete out.options;

  const questions = Array.isArray(out.questions) ? [...out.questions] : [];
  const byNum = new Map(questions.map((q) => [Number(q.number), q]));
  out.questions = [];
  for (let n = 37; n <= 42; n += 1) {
    const existing = byNum.get(n) || {};
    out.questions.push({
      id: existing.id || `q${n - 36}`,
      number: n,
      type: 'gapped-text',
    });
  }

  const modelAnswers = Array.isArray(out.modelAnswers) ? out.modelAnswers : [];
  out.modelAnswers = out.questions.map((q, i) => {
    const entry =
      modelAnswers.find((m) => Number(m?.number) === q.number) ||
      modelAnswers.find((m) => String(m?.id) === String(q.id)) ||
      modelAnswers[i] ||
      {};
    const answer = String(entry.answer || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-G]/g, '')
      .charAt(0);
    return { id: q.id, number: q.number, answer: answer || '' };
  });

  // Assert: passage must be byte-identical to the raw model passage (no padding).
  out.passage = rawPassage;
  return out;
}

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 6, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const pool = Array.isArray(normalized.sentencePool) ? normalized.sentencePool : [];
  const nums = questions.map((q) => Number(q.number)).sort((a, b) => a - b);
  const passageWordCount = countWords(normalized.passage);
  const letters = modelAnswers.map((m) => String(m.answer || '').trim().toUpperCase());
  const uniqueLetters = new Set(letters.filter((l) => /^[A-G]$/.test(l)));
  const unused = [...'ABCDEFG'].filter((L) => !uniqueLetters.has(L));
  const PLACEHOLDER = /\b(placeholder|lorem ipsum|TODO|option text|question text|extra sentence\.\.\.)\b/i;
  const noPlaceholders = !PLACEHOLDER.test(JSON.stringify(normalized));
  const markersOk = [37, 38, 39, 40, 41, 42].every((n) =>
    new RegExp(`\\(${n}\\)`).test(String(normalized.passage || '')),
  );
  const poolLetters = pool.map((s, i) => extractPoolLetter(s) || 'ABCDEFG'[i]);

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 6 questions', ok: questions.length === 6 },
    { name: 'Question numbers 37–42', ok: nums.join(',') === '37,38,39,40,41,42' },
    { name: 'Gap markers (37)–(42)', ok: markersOk },
    { name: 'Exactly 7 sentencePool', ok: pool.length === 7 },
    {
      name: 'Pool letters A–G once',
      ok: [...poolLetters].sort().join('') === 'ABCDEFG',
    },
    {
      name: 'Answer key 6 unique A–G',
      ok: letters.length === 6 && uniqueLetters.size === 6 && letters.every((l) => /^[A-G]$/.test(l)),
    },
    { name: 'Exactly one unused letter', ok: unused.length === 1, detail: unused.join('') || 'none' },
    {
      name: 'Passage 500–600 words',
      ok: passageWordCount >= 500 && passageWordCount <= 600,
      detail: `${passageWordCount} words`,
    },
    {
      name: 'Has title + passage',
      ok: Boolean(String(normalized.title || '').trim() && String(normalized.passage || '').trim()),
    },
    { name: 'No placeholders', ok: noPlaceholders },
    { name: 'No length padding', ok: true },
  ];

  return {
    validation,
    normalized,
    checks,
    passageWordCount,
    unusedLetter: unused[0] || null,
    allChecksOk: checks.every((c) => c.ok),
  };
}

let attempt = 0;
let lastEval = null;
let lastGenerated = null;
let lastRawWordCount = null;
let lastRawPassage = null;
const MAX_ATTEMPTS = 8;
const attemptLog = [];

while (attempt < MAX_ATTEMPTS) {
  attempt += 1;
  console.error(`Attempt ${attempt}/${MAX_ATTEMPTS}…`);
  const prevErrors = lastEval?.validation?.errors?.slice(0, 8) || [];
  const prevFailed = lastEval?.checks?.filter((c) => !c.ok).map((c) => c.name) || [];
  const onlyLength =
    lastEval &&
    !lastEval.allChecksOk &&
    prevFailed.every((n) => n === 'Passage 500–600 words' || n === 'Validator ok' || n === 'No length padding') &&
    prevErrors.every((e) => /words; minimum is 500|words; maximum is 600/.test(e));
  const repairHint =
    attempt > 1
      ? onlyLength
        ? `\n\nRETRY NOTE: Length only failed (previous passage had ${lastRawWordCount} words). Regenerate the FULL passage to 540–570 words (min 500, max 600). Use ~seven paragraphs of 70–90 words each. Do NOT return a short article. Keep gaps (37)–(42), sentencePool A–G, and a valid unique answer key.`
        : `\n\nRETRY NOTE: Previous output failed.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none'}.
HARD REQUIREMENTS:
1) Passage MUST be 540–570 words (min 500, max 600). About seven paragraphs of 70–90 words each.
2) Gaps (37)–(42) in the passage; questions numbered 37–42.
3) sentencePool exactly 7 sentences A)–G); six unique answers; one unused letter.
4) Cohesion-based fits; no placeholders; no Cambridge.`
      : '';

  const completion = await openai.chat.completions.create({
    model: modelName,
    temperature: attempt === 1 ? 0.9 : onlyLength ? 0.7 : 0.5,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt + repairHint },
    ],
  });

  const finishReason = completion.choices?.[0]?.finish_reason;
  const raw = completion.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const failPath = path.join(outDir, `b2-part6-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath, 'finish_reason=', finishReason);
    attemptLog.push({ attempt, parseOk: false, finishReason });
    continue;
  }

  lastRawPassage = String(parsed.passage || '');
  lastRawWordCount = countWords(lastRawPassage);
  const initialGenerationWordCount = lastRawWordCount;

  // Model-only length repair (second generation pass) — never local string padding.
  let lengthRepairViaModel = false;
  if (lastRawWordCount < 500 || lastRawWordCount > 600) {
    console.error(`  length out of range (${lastRawWordCount}); requesting model rewrite of passage only…`);
    const expandCompletion = await openai.chat.completions.create({
      model: modelName,
      temperature: 0.55,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You rewrite ONE B2 Part 6 article passage. Return JSON {"passage":"...","passageWordCount":N}. Keep ALL gap markers (37) (38) (39) (40) (41) (42) exactly once each. Expand or trim so the passage is 540–570 words (min 500, max 600). Use about seven paragraphs of 70–90 words. Do not invent new gap numbers. British English magazine style.',
        },
        {
          role: 'user',
          content: `Current passage is ${lastRawWordCount} words (invalid). Rewrite/expand to 540–570 words.\n\nTITLE: ${parsed.title || ''}\n\nPASSAGE:\n${lastRawPassage}`,
        },
      ],
    });
    try {
      const expanded = JSON.parse(expandCompletion.choices?.[0]?.message?.content || '{}');
      const newPassage = String(expanded.passage || '');
      const newWc = countWords(newPassage);
      const markersOk = [37, 38, 39, 40, 41, 42].every((n) =>
        new RegExp(`\\(${n}\\)`).test(newPassage),
      );
      if (newPassage && markersOk && newWc >= 500 && newWc <= 600) {
        parsed.passage = newPassage;
        parsed.passageWordCount = newWc;
        lastRawPassage = newPassage;
        lastRawWordCount = newWc;
        lengthRepairViaModel = true;
        console.error(`  model length repair → ${newWc} words`);
      } else {
        console.error(
          `  model length repair rejected (words=${newWc}, markersOk=${markersOk})`,
        );
      }
    } catch {
      console.error('  model length repair JSON parse failed');
    }
  }

  lastGenerated = normalizeSchemaOnly(parsed);

  // Hard assert: schema normalisation must not alter passage text.
  if (String(lastGenerated.passage || '') !== lastRawPassage) {
    console.error('FATAL: dry-run mutated passage text (padding forbidden).');
    process.exit(2);
  }
  if (countWords(lastGenerated.passage) !== lastRawWordCount) {
    console.error('FATAL: dry-run mutated passage word count (padding forbidden).');
    process.exit(2);
  }

  lastEval = evaluateGenerated(lastGenerated);
  attemptLog.push({
    attempt,
    parseOk: true,
    finishReason,
    initialGenerationWordCount,
    rawWordCount: lastRawWordCount,
    finalWordCount: lastEval.passageWordCount,
    paddingApplied: false,
    lengthRepairViaModel,
    ok: lastEval.allChecksOk,
    errors: lastEval.validation.errors.slice(0, 5),
  });

  console.error(
    `  initialWords=${initialGenerationWordCount} rawWords=${lastRawWordCount} finalWords=${lastEval.passageWordCount} paddingApplied=false lengthRepairViaModel=${lengthRepairViaModel} ok=${lastEval.allChecksOk} errors=${lastEval.validation.errors.length} warnings=${lastEval.validation.warnings.length}`,
  );
  if (lastEval.allChecksOk) break;
}

const lastAttemptMeta = attemptLog.filter((a) => a.parseOk).at(-1) || {};
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(outDir, `b2-part6-dry-run-${stamp}.json`);
const report = {
  generatedAt: new Date().toISOString(),
  model: modelName,
  attempts: attempt,
  retried: attempt > 1,
  paddingApplied: false,
  lengthRepairViaModel: Boolean(lastAttemptMeta.lengthRepairViaModel),
  initialGenerationWordCount: lastAttemptMeta.initialGenerationWordCount ?? null,
  rawModelWordCount: lastRawWordCount,
  finalValidatedWordCount: lastEval?.passageWordCount ?? null,
  promptSnippet: {
    mentionsQ37to42: /37/.test(userPrompt) && /42/.test(userPrompt),
    wordCountTarget: /500\s*[–-]\s*600/.test(userPrompt),
    strictMin500: /500 words is the STRICT minimum/i.test(userPrompt),
    target540570: /540\s*[–-]\s*570/.test(userPrompt),
    cohesionFocus: /discourse cohesion/i.test(userPrompt),
  },
  unusedLetter: lastEval?.unusedLetter ?? null,
  attemptLog,
  validation: {
    ok: lastEval?.validation?.ok ?? false,
    errors: lastEval?.validation?.errors ?? [],
    warnings: lastEval?.validation?.warnings ?? [],
  },
  checks: lastEval?.checks ?? [],
  allChecksOk: lastEval?.allChecksOk ?? false,
  generated: lastEval?.normalized || lastGenerated,
};

writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(
  JSON.stringify(
    {
      reportPath,
      allChecksOk: report.allChecksOk,
      attempts: attempt,
      retried: attempt > 1,
      initialGenerationWordCount: report.initialGenerationWordCount,
      rawModelWordCount: lastRawWordCount,
      finalValidatedWordCount: lastEval?.passageWordCount ?? null,
      paddingApplied: false,
      lengthRepairViaModel: report.lengthRepairViaModel,
    },
    null,
    2,
  ),
);
if (!report.allChecksOk) process.exit(1);
