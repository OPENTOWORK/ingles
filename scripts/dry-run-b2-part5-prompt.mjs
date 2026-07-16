/**
 * Local dry-run: generate ONE B2 Reading Part 5 with the code prompt (no Supabase write).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part5-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { countWords, extractMcqLetter, extractMcqOptionText } from '../src/lib/b2RuoeExamQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('reading', 'multiple-choice', 'B2', {
  topic: 'urban green spaces and changing work habits',
  varietySeed: Date.now(),
  partNumber: 5,
  questionCount: 6,
});

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading Part 5 (multiple choice). The passage MUST contain at least 580 words and at most 650 words (target ~600). Count words carefully before returning. Exactly 6 questions numbered 31–36 with exactly four options each: A) B) C) D). Mix question types. Prefer answer-key pattern like A,C,B,D,A,C (no three consecutive identical letters). No placeholders. No student-facing mention of Cambridge.';

console.error('Generating Part 5 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function trimToFourOptions(generated) {
  const questions = Array.isArray(generated.questions) ? generated.questions : [];
  questions.forEach((q) => {
    if (!Array.isArray(q.options)) return;
    const cleaned = [];
    for (const o of q.options) {
      const letter = extractMcqLetter(o);
      if (!letter || !/^[A-D]$/.test(letter)) continue;
      if (cleaned.some((c) => extractMcqLetter(c) === letter)) continue;
      const text = extractMcqOptionText(o);
      cleaned.push(`${letter}) ${text}`);
      if (cleaned.length === 4) break;
    }
    if (cleaned.length === 4) q.options = cleaned;
  });
  generated.questions = questions;
  return generated;
}

function rebalanceAnswerLetters(generated) {
  const desired = ['A', 'C', 'B', 'D', 'A', 'C'];
  const questions = Array.isArray(generated.questions) ? generated.questions : [];
  const modelAnswers = Array.isArray(generated.modelAnswers) ? [...generated.modelAnswers] : [];

  questions.forEach((q, i) => {
    const opts = Array.isArray(q.options) ? q.options : [];
    const byLetter = {};
    opts.forEach((o, oi) => {
      const letter = extractMcqLetter(o) || 'ABCD'[oi];
      if (/^[A-D]$/.test(letter) && !byLetter[letter]) {
        byLetter[letter] = extractMcqOptionText(o);
      }
    });
    const currentAnswer =
      String(q.answer || '').trim().toUpperCase() ||
      String(
        modelAnswers.find((m) => String(m?.id) === String(q?.id))?.answer ||
          modelAnswers[i]?.answer ||
          '',
      )
        .trim()
        .toUpperCase();
    const correctText = byLetter[currentAnswer] || byLetter.A || Object.values(byLetter)[0] || 'Correct idea';
    const distractors = Object.entries(byLetter)
      .filter(([L, t]) => L !== currentAnswer && t !== correctText)
      .map(([, t]) => t);
    while (distractors.length < 3) distractors.push(`Alternative view ${distractors.length + 1}`);

    const target = desired[i] || 'A';
    const texts = { A: '', B: '', C: '', D: '' };
    texts[target] = correctText;
    let di = 0;
    for (const L of ['A', 'B', 'C', 'D']) {
      if (L === target) continue;
      texts[L] = distractors[di] || `Distractor ${L}`;
      di += 1;
    }
    q.options = ['A', 'B', 'C', 'D'].map((L) => `${L}) ${texts[L]}`);
    q.answer = target;
    const maIdx = modelAnswers.findIndex((m) => String(m?.id) === String(q?.id));
    if (maIdx >= 0) modelAnswers[maIdx] = { ...modelAnswers[maIdx], answer: target, number: q.number };
    else modelAnswers[i] = { id: q.id || `q${i + 1}`, number: q.number, answer: target };
  });

  generated.questions = questions;
  generated.modelAnswers = modelAnswers;
  return generated;
}

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 5, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const nums = questions.map((q) => Number(q.number)).sort((a, b) => a - b);
  const passageWordCount = countWords(normalized.passage);
  const letters = questions.map((q, i) => {
    const fromQ = String(q?.answer || '').trim().toUpperCase();
    if (/^[A-D]$/.test(fromQ)) return fromQ;
    const entry = modelAnswers.find((m) => String(m?.id) === String(q?.id)) || modelAnswers[i];
    return String(entry?.answer || '').trim().toUpperCase();
  });
  const fourOptions = questions.every((q) => Array.isArray(q?.options) && q.options.length === 4);
  const optionLettersOk = questions.every((q) => {
    const opts = q.options || [];
    const ls = opts.map((o, oi) => extractMcqLetter(o) || 'ABCD'[oi]);
    return new Set(ls).size === 4;
  });
  const PLACEHOLDER = /\b(placeholder|lorem ipsum|TODO|option text|question text)\b/i;
  const noPlaceholders = !PLACEHOLDER.test(JSON.stringify(normalized));
  let consecutiveOk = true;
  let run = 1;
  for (let i = 1; i < letters.length; i += 1) {
    if (letters[i] === letters[i - 1]) run += 1;
    else run = 1;
    if (run > 2) consecutiveOk = false;
  }

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 6 questions', ok: questions.length === 6 },
    { name: 'Question numbers 31–36', ok: nums.join(',') === '31,32,33,34,35,36' },
    { name: 'Four options each', ok: fourOptions },
    { name: 'Option letters A–D', ok: optionLettersOk },
    {
      name: 'Answer key complete A–D',
      ok: letters.length === 6 && letters.every((l) => /^[A-D]$/.test(l)),
    },
    {
      name: 'Passage 550–650 words',
      ok: passageWordCount >= 550 && passageWordCount <= 650,
      detail: `${passageWordCount} words`,
    },
    { name: 'Max 2 consecutive same letter', ok: consecutiveOk },
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
    prevFailed.every((n) => n === 'Passage 550–650 words' || n === 'Validator ok') &&
    prevErrors.every((e) => /words; minimum is 550|words; maximum is 650/.test(e));
  const repairHint =
    attempt > 1
      ? onlyLength
        ? `\n\nRETRY NOTE: Length only failed (${lastEval.passageWordCount} words). KEEP the same title, questions, options and answers. EXPAND the passage with 1–2 additional natural paragraphs so the total is 580–620 words. Do not exceed 650.`
        : `\n\nRETRY NOTE: Previous output failed.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none'}.
HARD REQUIREMENTS:
1) Passage MUST be 580–620 words (min 550, max 650).
2) Exactly 6 questions 31–36 with exactly 4 options A) B) C) D) each.
3) modelAnswers like A,C,B,D,A,C — no three consecutive identical letters.
4) Mix questionType; evidence/rationale ok; no placeholders; no Cambridge.`
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
    const failPath = path.join(outDir, `b2-part5-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath);
    continue;
  }

  lastGenerated = trimToFourOptions(lastGenerated);
  lastEval = evaluateGenerated(lastGenerated);

  const failedNames = lastEval.checks.filter((c) => !c.ok).map((c) => c.name);
  const onlyConsecutive =
    !lastEval.allChecksOk &&
    failedNames.every((n) => ['Max 2 consecutive same letter', 'Validator ok'].includes(n)) &&
    (lastEval.validation.errors || []).every((e) => /consecutive/.test(e));

  if (onlyConsecutive) {
    lastGenerated = rebalanceAnswerLetters(structuredClone(lastGenerated));
    lastEval = evaluateGenerated(lastGenerated);
    console.error(`Attempt ${attempt}: rebalanced letters, ok=${lastEval.allChecksOk}`);
  } else {
    console.error(
      `Attempt ${attempt}: ${lastEval.passageWordCount} words, ok=${lastEval.allChecksOk}`,
    );
  }

  if (lastEval.allChecksOk) break;
  console.error(`Attempt ${attempt} failed:`, lastEval.validation.errors.slice(0, 10));
  console.error('Failed checks:', failedNames);
}

if (!lastEval || !lastGenerated) {
  console.error('Dry-run failed: no parseable JSON after retries.');
  process.exit(1);
}

const { validation, normalized, checks } = lastEval;
const report = {
  generatedAt: new Date().toISOString(),
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  attempts: attempt,
  promptSnippet: {
    mentionsQ31to36: /Q31–36|questions numbered 31–36/i.test(userPrompt),
    wordCountTarget: /550–650 words/i.test(userPrompt),
    strictMax650: /maximum 650|Do NOT exceed 650/i.test(userPrompt),
  },
  passageWordCount: lastEval.passageWordCount,
  validation: {
    ok: validation.ok,
    errors: validation.errors,
    warnings: validation.warnings,
  },
  checks,
  allChecksOk: lastEval.allChecksOk,
  generated: normalized,
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = path.join(outDir, `b2-part5-dry-run-${stamp}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log(
  JSON.stringify(
    {
      ok: report.allChecksOk,
      outPath,
      checks,
      errors: validation.errors,
      warnings: validation.warnings,
    },
    null,
    2,
  ),
);
if (!report.allChecksOk) process.exit(1);
