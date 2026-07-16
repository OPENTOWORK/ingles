/**
 * Local dry-run: generate ONE B2 R&UoE Part 2 with the code prompt (no Supabase write).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part2-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { countWords } from '../src/lib/b2RuoeExamQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('use-of-english', 'open-cloze', 'B2', {
  topic: 'community gardens and urban wildlife',
  varietySeed: Date.now(),
  partNumber: 2,
  questionCount: 8,
});

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading and Use of English Part 2 (open cloze). The passage MUST include gaps (0) and (9)–(16), and MUST be between 150 and 180 words inclusive. Never exceed 180 words. Answers are ONE grammar/function word each. No multiple-choice options.';

console.error('Generating Part 2 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 2, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const passage = String(normalized.passage || '');
  const gapNums = [...passage.matchAll(/\((\d+)\)\s*_+/g)].map((m) => Number(m[1]));
  const hasExampleGap = gapNums.includes(0);
  const scoredGaps = [...new Set(gapNums.filter((n) => n >= 9 && n <= 16))].sort((a, b) => a - b);
  const answers = modelAnswers.map((m) => String(m?.answer || '').trim());
  const oneWordOk = answers.length >= 8 && answers.slice(0, 8).every((a) => /^[A-Za-z'’-]+$/.test(a) && !/\s/.test(a));
  const noOptions = questions.every((q) => !Array.isArray(q?.options) || q.options.length === 0);
  const PLACEHOLDER_WORDS = new Set(['word', 'option', 'answer', 'choice', 'example', 'placeholder', 'gap']);
  const hasPlaceholder = answers.some((w) => PLACEHOLDER_WORDS.has(w.toLowerCase()));
  const passageWordCount = countWords(passage);
  const exampleAnswer = String(normalized.example?.answer || '').trim();

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 8 questions', ok: questions.length === 8 },
    {
      name: 'Question numbers 9–16',
      ok:
        scoredGaps.join(',') === '9,10,11,12,13,14,15,16' &&
        questions.every((q) => Number(q.number) >= 9 && Number(q.number) <= 16),
    },
    { name: 'No gap (17)+', ok: !gapNums.some((n) => n >= 17) },
    { name: 'Example gap (0) in passage', ok: hasExampleGap },
    { name: 'Example answer one word', ok: /^[A-Za-z'’-]+$/.test(exampleAnswer) },
    { name: 'No options', ok: noOptions },
    { name: 'Answers are one word', ok: oneWordOk },
    { name: 'No placeholders', ok: !hasPlaceholder },
    { name: 'Has title + passage', ok: Boolean(String(normalized.title || '').trim() && passage.trim()) },
    {
      name: 'Passage 150–180 words',
      ok: passageWordCount >= 150 && passageWordCount <= 180,
      detail: `${passageWordCount} words`,
    },
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
const MAX_ATTEMPTS = 6;

while (attempt < MAX_ATTEMPTS) {
  attempt += 1;
  console.error(`Attempt ${attempt}/${MAX_ATTEMPTS}…`);
  const repairHint =
    attempt > 1
      ? `\n\nRETRY NOTE: Previous output failed validation. You MUST include gaps (0) ___ (9) ___ (10) ___ (11) ___ (12) ___ (13) ___ (14) ___ (15) ___ (16) ___ literally in the passage, keep exactly 8 questions numbered 9–16, one-word grammar/function answers only, no options, and keep the passage between 150 and 180 words.`
      : '';
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: attempt === 1 ? 0.7 : 0.45,
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
    const failPath = path.join(outDir, `b2-part2-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath);
    continue;
  }

  lastEval = evaluateGenerated(lastGenerated);
  console.error(
    `Attempt ${attempt}: ${lastEval.passageWordCount} words, ok=${lastEval.allChecksOk}`,
  );
  if (lastEval.allChecksOk) break;
  console.error(`Attempt ${attempt} failed:`, lastEval.validation.errors);
  console.error(
    'Failed checks:',
    lastEval.checks.filter((c) => !c.ok).map((c) => c.name),
  );
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
    mentionsQ9to16: /Q9–16|questions numbered 9–16|exactly 8 questions numbered 9–16/i.test(userPrompt),
    forbidsGap17: /gap \(17\)|Do NOT create gap \(17\)/i.test(userPrompt),
    wordCountTarget: /150–180 words/i.test(userPrompt),
    strictMax180: /maximum 180|Do NOT exceed 180/i.test(userPrompt),
    exampleInPassage: /example gap \(0\).*passage|Include the example gap \(0\)/i.test(userPrompt),
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
const outPath = path.join(outDir, `b2-part2-dry-run-${stamp}.json`);
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
