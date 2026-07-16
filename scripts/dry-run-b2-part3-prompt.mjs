/**
 * Local dry-run: generate ONE B2 R&UoE Part 3 with the code prompt (no Supabase write).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part3-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';

function countPart3Words(passage) {
  return String(passage || '')
    .replace(/\(\d+\)\s*(?:_+|\.{2,}|…+)/g, ' ')
    .replace(/\(([A-Z][A-Z-]*)\)/g, ' $1 ')
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('use-of-english', 'word-formation', 'B2', {
  topic: 'digital habits and sleep quality',
  varietySeed: Date.now(),
  partNumber: 3,
  questionCount: 8,
});

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading and Use of English Part 3 (word formation). The passage MUST include gaps (0) and (17)–(24) with CAPITAL stems after each gap, and MUST be between 150 and 180 words inclusive (prefer ~165). Never exceed 180 words. modelAnswers must be objects with an "answer" field, never a bare string array. Answers are ONE derived word each. No multiple-choice options.';

console.error('Generating Part 3 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function resolveStem(obj) {
  return String(obj?.stem || obj?.baseWord || '').trim();
}

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 3, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const passage = String(normalized.passage || '');
  const gapNums = [...passage.matchAll(/\((\d+)\)\s*_+/g)].map((m) => Number(m[1]));
  const hasExampleGap = gapNums.includes(0);
  const scoredGaps = [...new Set(gapNums.filter((n) => n >= 17 && n <= 24))].sort((a, b) => a - b);
  const answers = modelAnswers.map((m) => String(m?.answer || '').trim());
  const oneWordOk =
    answers.length >= 8 && answers.slice(0, 8).every((a) => /^[A-Za-z'’-]+$/.test(a) && !/\s/.test(a));
  const stemsOk = questions.every((q) => /^[A-Z]+(?:-[A-Z]+)?$/.test(resolveStem(q)));
  const noOptions = questions.every((q) => !Array.isArray(q?.options) || q.options.length === 0);
  const PLACEHOLDER_WORDS = new Set([
    'word',
    'option',
    'answer',
    'choice',
    'example',
    'placeholder',
    'gap',
    'stem',
    'root',
  ]);
  const hasPlaceholder = answers.some((w) => PLACEHOLDER_WORDS.has(w.toLowerCase()));
  const passageWordCount = countPart3Words(passage);
  const exampleAnswer = String(normalized.example?.answer || '').trim();
  const exampleStem = resolveStem(normalized.example || {});

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 8 questions', ok: questions.length === 8 },
    {
      name: 'Question numbers 17–24',
      ok:
        scoredGaps.join(',') === '17,18,19,20,21,22,23,24' &&
        questions.every((q) => Number(q.number) >= 17 && Number(q.number) <= 24),
    },
    { name: 'No gap (25)+', ok: !gapNums.some((n) => n >= 25) },
    { name: 'Example gap (0) in passage', ok: hasExampleGap },
    {
      name: 'Example stem + one-word answer',
      ok: /^[A-Z]+(?:-[A-Z]+)?$/.test(exampleStem) && /^[A-Za-z'’-]+$/.test(exampleAnswer),
    },
    { name: 'Stems CAPITALS', ok: stemsOk },
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
const MAX_ATTEMPTS = 8;

while (attempt < MAX_ATTEMPTS) {
  attempt += 1;
  console.error(`Attempt ${attempt}/${MAX_ATTEMPTS}…`);
  const prevErrors = lastEval?.validation?.errors?.slice(0, 8) || [];
  const prevFailed = lastEval?.checks?.filter((c) => !c.ok).map((c) => c.name) || [];
  const repairHint =
    attempt > 1
      ? `\n\nRETRY NOTE: Previous output failed validation.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none listed'}.
HARD REQUIREMENTS:
1) passage MUST be 150–180 words AFTER removing gap markers like (17) ___ (stems in CAPITALS still count as words if written). Prefer ~165 content words.
2) Include ALL gaps literally: (0) ___ (STEM) (17) ___ (STEM) (18) ___ (STEM) (19) ___ (STEM) (20) ___ (STEM) (21) ___ (STEM) (22) ___ (STEM) (23) ___ (STEM) (24) ___ (STEM).
3) modelAnswers MUST be objects: {"id":"q1","number":17,"answer":"fitness"} — never a bare string array.
4) Exactly 8 questions numbered 17–24 with CAPITAL stems; one-word derived answers; no options.`
      : '';
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: attempt === 1 ? 0.55 : attempt < 4 ? 0.4 : 0.3,
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
    const failPath = path.join(outDir, `b2-part3-dry-run-parse-fail-${Date.now()}.txt`);
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
    mentionsQ17to24: /Q17–24|questions numbered 17–24/i.test(userPrompt),
    forbidsGap25: /gap \(25\)|Do NOT create gap \(25\)/i.test(userPrompt),
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
const outPath = path.join(outDir, `b2-part3-dry-run-${stamp}.json`);
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
