/**
 * Local dry-run: generate ONE B2 R&UoE Part 1 with the code prompt (no Supabase write).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part1-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('use-of-english', 'multiple-choice-cloze', 'B2', {
  topic: 'urban green spaces and community life',
  varietySeed: Date.now(),
  partNumber: 1,
  questionCount: 8,
});

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading and Use of English Part 1 (multiple-choice cloze).';

console.error('Generating Part 1 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 1, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const options = questions.flatMap((q) => q.options || []);
  const oneWordOk = options.every((opt) => {
    const m = String(opt).match(/^([A-D])\)\s*(\S+)$/i);
    return Boolean(m) && !/\s/.test(m[2]);
  });
  const passage = String(normalized.passage || '');
  const gapNums = [...passage.matchAll(/\((\d+)\)\s*_+/g)].map((m) => Number(m[1]));
  const hasExampleGap = gapNums.includes(0);
  const scoredGaps = [...new Set(gapNums.filter((n) => n >= 1 && n <= 8))].sort((a, b) => a - b);
  const optionWords = options
    .map((opt) => String(opt).match(/^([A-D])\)\s*(.+)$/i)?.[2]?.trim().toLowerCase())
    .filter(Boolean);
  const PLACEHOLDER_WORDS = new Set(['word', 'option', 'answer', 'choice', 'example', 'placeholder']);
  const hasPlaceholder = optionWords.some((w) => PLACEHOLDER_WORDS.has(w));

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 8 questions', ok: questions.length === 8 },
    {
      name: 'Question numbers 1–8',
      ok:
        scoredGaps.join(',') === '1,2,3,4,5,6,7,8' &&
        questions.every((q) => Number(q.number) >= 1 && Number(q.number) <= 8),
    },
    { name: 'No Q9', ok: !gapNums.includes(9) && !questions.some((q) => Number(q.number) === 9) },
    { name: 'Example gap (0) in passage', ok: hasExampleGap },
    { name: 'Options are one word', ok: oneWordOk && options.length === 32 },
    {
      name: 'Answer key complete (8)',
      ok:
        modelAnswers.length >= 8 &&
        modelAnswers.slice(0, 8).every((m) => /^[A-D]$/i.test(String(m.answer || ''))),
    },
    { name: 'No placeholders', ok: !hasPlaceholder },
    { name: 'Has title + passage', ok: Boolean(String(normalized.title || '').trim() && passage.trim()) },
  ];

  return { validation, normalized, checks, allChecksOk: checks.every((c) => c.ok) };
}

let attempt = 0;
let lastEval = null;
let lastGenerated = null;
const MAX_ATTEMPTS = 3;

while (attempt < MAX_ATTEMPTS) {
  attempt += 1;
  console.error(`Attempt ${attempt}/${MAX_ATTEMPTS}…`);
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  try {
    lastGenerated = JSON.parse(raw);
  } catch {
    const failPath = path.join(outDir, `b2-part1-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath);
    continue;
  }

  lastEval = evaluateGenerated(lastGenerated);
  if (lastEval.allChecksOk) break;
  console.error(`Attempt ${attempt} failed:`, lastEval.validation.errors);
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
    mentionsQ1to8: /Q1–8|questions numbered 1–8|exactly 8 questions/i.test(userPrompt),
    forbidsQ9: /Do NOT create question 9|beyond \(8\)/i.test(userPrompt),
    wordCountTarget: /150–180 words/i.test(userPrompt),
  },
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
const outPath = path.join(outDir, `b2-part1-dry-run-${stamp}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify({ ok: report.allChecksOk, outPath, checks, errors: validation.errors, warnings: validation.warnings }, null, 2));
if (!report.allChecksOk) process.exit(1);
