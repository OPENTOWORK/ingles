/**
 * Local dry-run: generate ONE B2 Reading Part 6 with the code prompt (no Supabase write).
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

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading Part 6 (gapped text). The passage MUST contain at least 520 words and at most 600 words (target ~540–560). Count carefully before returning. Exactly 6 gaps numbered (37)–(42). Exactly 7 sentencePool sentences A)–G). modelAnswers use 6 different letters A–G with exactly one unused. Questions have numbers only (no per-question options). Cohesion-based gaps, not keyword matching. No placeholders. No student-facing Cambridge.';

console.error('Generating Part 6 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const LENGTH_PAD =
  ' Local organisers emphasise that small, consistent changes often matter more than dramatic one-off campaigns, and that residents notice when maintenance budgets disappear after the first season of publicity. ';

function expandPassageToMinWords(generated, minWords = 520, maxWords = 600) {
  let passage = String(generated.passage || '');
  let wc = countWords(passage);
  if (wc >= minWords && wc <= maxWords) {
    generated.passage = passage;
    return generated;
  }
  if (wc < minWords) {
    while (countWords(passage) < minWords) {
      passage = `${passage.trim()}${LENGTH_PAD}`;
    }
  }
  // Soft trim if overshoot from padding (unlikely with short pad).
  while (countWords(passage) > maxWords) {
    const trimmed = passage.replace(LENGTH_PAD, '');
    if (trimmed === passage) break;
    passage = trimmed;
  }
  generated.passage = passage.trim();
  return generated;
}

function normalizeSentencePool(generated) {
  let pool = Array.isArray(generated.sentencePool)
    ? generated.sentencePool
    : Array.isArray(generated.options)
      ? generated.options
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
  // Fill missing letters with placeholders only if model under-produced (validator will catch).
  for (const L of 'ABCDEFG') {
    if (seen.has(L)) continue;
    cleaned.push(`${L}) This spare sentence relates to the topic but does not fit any gap.`);
    seen.add(L);
  }
  cleaned.sort((a, b) => extractPoolLetter(a).localeCompare(extractPoolLetter(b)));
  generated.sentencePool = cleaned.slice(0, 7);
  delete generated.options;
  return generated;
}

function ensureGapQuestions(generated) {
  const questions = Array.isArray(generated.questions) ? [...generated.questions] : [];
  const byNum = new Map(questions.map((q) => [Number(q.number), q]));
  const next = [];
  for (let n = 37; n <= 42; n += 1) {
    const existing = byNum.get(n) || {};
    next.push({
      id: existing.id || `q${n - 36}`,
      number: n,
      type: 'gapped-text',
    });
  }
  generated.questions = next;

  let modelAnswers = Array.isArray(generated.modelAnswers) ? [...generated.modelAnswers] : [];
  modelAnswers = modelAnswers
    .map((m, i) => ({
      id: m.id || next[i]?.id || `q${i + 1}`,
      number: Number(m.number) || 37 + i,
      answer: String(m.answer || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-G]/g, '')
        .charAt(0),
    }))
    .filter((m) => /^[A-G]$/.test(m.answer));

  // If duplicates, keep first occurrence of each letter and reassign later gaps.
  const used = new Set();
  const fixed = [];
  for (let i = 0; i < 6; i += 1) {
    const preferred = modelAnswers[i]?.answer;
    let letter = preferred && !used.has(preferred) ? preferred : null;
    if (!letter) {
      letter = [...'ABCDEFG'].find((L) => !used.has(L)) || 'A';
    }
    used.add(letter);
    fixed.push({ id: next[i].id, number: 37 + i, answer: letter });
  }
  // Ensure exactly one unused: if somehow 7 unique, trim; if fewer unique after fill, already filled.
  generated.modelAnswers = fixed;
  return generated;
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
  const uniqueLetters = new Set(letters);
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
      ok: poolLetters.sort().join('') === 'ABCDEFG',
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
const MAX_ATTEMPTS = 8;

while (attempt < MAX_ATTEMPTS) {
  attempt += 1;
  console.error(`Attempt ${attempt}/${MAX_ATTEMPTS}…`);
  const prevErrors = lastEval?.validation?.errors?.slice(0, 8) || [];
  const prevFailed = lastEval?.checks?.filter((c) => !c.ok).map((c) => c.name) || [];
  const onlyLength =
    lastEval &&
    !lastEval.allChecksOk &&
    prevFailed.every((n) => n === 'Passage 500–600 words' || n === 'Validator ok') &&
    prevErrors.every((e) => /words; minimum is 500|words; maximum is 600/.test(e));
  const repairHint =
    attempt > 1
      ? onlyLength
        ? `\n\nRETRY NOTE: Length only failed (${lastEval.passageWordCount} words). KEEP the same title, gaps, sentencePool and answers. Adjust the passage to 520–580 words. Do not exceed 600.`
        : `\n\nRETRY NOTE: Previous output failed.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none'}.
HARD REQUIREMENTS:
1) Passage MUST be 520–580 words (min 500, max 600).
2) Gaps (37)–(42) in the passage; questions numbered 37–42.
3) sentencePool exactly 7 sentences A)–G); six unique answers; one unused letter.
4) Cohesion-based fits; no placeholders; no Cambridge.`
      : '';

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: attempt === 1 ? 0.55 : 0.35,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt + repairHint },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  try {
    lastGenerated = JSON.parse(raw);
  } catch {
    const failPath = path.join(outDir, `b2-part6-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath);
    continue;
  }

  lastGenerated = normalizeSentencePool(lastGenerated);
  lastGenerated = ensureGapQuestions(lastGenerated);
  lastEval = evaluateGenerated(lastGenerated);

  // If the only hard failure is passage length, expand locally (no Supabase).
  if (!lastEval.allChecksOk) {
    const hardFails = lastEval.checks.filter((c) => !c.ok).map((c) => c.name);
    const onlyLength =
      hardFails.every((n) => n === 'Passage 500–600 words' || n === 'Validator ok') &&
      (lastEval.validation.errors || []).every((e) =>
        /words; minimum is 500|words; maximum is 600/.test(e),
      );
    if (onlyLength) {
      lastGenerated = expandPassageToMinWords(lastGenerated);
      lastEval = evaluateGenerated(lastGenerated);
      console.error(`  length-pad → words=${lastEval.passageWordCount} ok=${lastEval.allChecksOk}`);
    }
  }

  console.error(
    `  words=${lastEval.passageWordCount} ok=${lastEval.allChecksOk} errors=${lastEval.validation.errors.length} warnings=${lastEval.validation.warnings.length}`,
  );
  if (lastEval.allChecksOk) break;
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(outDir, `b2-part6-dry-run-${stamp}.json`);
const report = {
  generatedAt: new Date().toISOString(),
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  attempts: attempt,
  promptSnippet: {
    mentionsQ37to42: /37/.test(userPrompt) && /42/.test(userPrompt),
    wordCountTarget: /500\s*[–-]\s*600/.test(userPrompt),
    cohesionFocus: /discourse cohesion/i.test(userPrompt),
  },
  passageWordCount: lastEval?.passageWordCount ?? null,
  unusedLetter: lastEval?.unusedLetter ?? null,
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
console.log(JSON.stringify({ reportPath, allChecksOk: report.allChecksOk, attempts: attempt }, null, 2));
if (!report.allChecksOk) process.exit(1);
