/**
 * Local dry-run: generate ONE B2 R&UoE Part 4 with the code prompt (no Supabase write).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part4-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { countCambridgeKeyWordWords } from '../src/lib/countCambridgeKeyWordWords.js';
import { validateB2KeyWordAnswerKey } from '../src/lib/validateB2KeyWordAnswerKey.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';
import { keywordInPart4Answer } from '../src/lib/b2RuoeExamQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('use-of-english', 'key-word', 'B2', {
  topic: 'travel, work and everyday decisions',
  varietySeed: Date.now(),
  partNumber: 4,
  questionCount: 6,
});

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading and Use of English Part 4 (key word transformations). Exactly 6 scored questions numbered 25–30 plus example 0. Every scored item MUST include grading_metadata with type b2_key_word_transformation, version 1, fullAnswers, and exactly 2 markingPoints that PARTITION the fullAnswer in order with no leftover words. Example: answer "do not need to use" → MP1 accepted ["do not need","don\'t need"], MP2 accepted ["to use"]. Answers are 2–5 Cambridge words including the CAPITAL keyword unchanged (written in normal case inside the answer). No multiple-choice options.';

console.error('Generating Part 4 dry-run (no Supabase)…');
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 4, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const nums = questions.map((q) => Number(q.number)).sort((a, b) => a - b);
  const PLACEHOLDER = new Set(['word', 'answer', 'keyword', 'gap', 'example', 'placeholder', 'xxx']);

  let metadataOk = true;
  let keywordsUpper = true;
  let answersWordCountOk = true;
  let keywordInAnswers = true;
  let twoMarkingPoints = true;
  let graderCompatible = true;
  let noPlaceholders = true;
  let noOptions = true;

  questions.forEach((q, i) => {
    const keyword = String(q?.keyword || q?.keyWord || '').trim();
    if (!keyword || keyword !== keyword.toUpperCase()) keywordsUpper = false;
    if (Array.isArray(q?.options) && q.options.length) noOptions = false;

    const answer = String(
      q?.answer || modelAnswers.find((m) => String(m?.id) === String(q?.id))?.answer || modelAnswers[i]?.answer || '',
    ).trim();
    const wc = countCambridgeKeyWordWords(answer);
    if (wc < 2 || wc > 5) answersWordCountOk = false;
    if (keyword && !keywordInPart4Answer(keyword, answer)) keywordInAnswers = false;
    if (PLACEHOLDER.has(answer.toLowerCase())) noPlaceholders = false;

    const meta = q?.grading_metadata || q?.gradingMetadata;
    if (!meta) {
      metadataOk = false;
      twoMarkingPoints = false;
      graderCompatible = false;
      return;
    }
    const keyCheck = validateB2KeyWordAnswerKey({
      ...meta,
      type: meta.type || 'b2_key_word_transformation',
      version: meta.version ?? 1,
      keyword: meta.keyword || keyword,
    });
    if (!keyCheck.valid) graderCompatible = false;
    if (!Array.isArray(meta.markingPoints) || meta.markingPoints.length !== 2) {
      twoMarkingPoints = false;
    }
    const grade = gradeB2KeyWordTransformation(answer, {
      ...meta,
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: meta.keyword || keyword,
      fullAnswers: ['__no_full_match_placeholder__'],
    });
    if (grade.score !== 2) graderCompatible = false;
  });

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 6 questions', ok: questions.length === 6 },
    { name: 'Question numbers 25–30', ok: nums.join(',') === '25,26,27,28,29,30' },
    { name: 'Example 0 present', ok: Boolean(normalized.example) },
    { name: 'Keywords UPPERCASE', ok: keywordsUpper },
    { name: 'Answers 2–5 Cambridge words', ok: answersWordCountOk },
    { name: 'Keyword in answers', ok: keywordInAnswers },
    { name: 'grading_metadata present', ok: metadataOk },
    { name: 'Exactly 2 marking points each', ok: twoMarkingPoints },
    { name: 'Metadata grader-compatible (2/2)', ok: graderCompatible },
    { name: 'No options', ok: noOptions },
    { name: 'No placeholders', ok: noPlaceholders },
  ];

  return {
    validation,
    normalized,
    checks,
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
  const prevErrors = lastEval?.validation?.errors?.slice(0, 10) || [];
  const prevFailed = lastEval?.checks?.filter((c) => !c.ok).map((c) => c.name) || [];
  const repairHint =
    attempt > 1
      ? `\n\nRETRY NOTE: Previous output failed.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none'}.
HARD REQUIREMENTS:
1) Exactly 6 questions numbered 25–30 + example 0.
2) Each question needs sentence1, CAPITAL keyword, sentence2Start with __________________, answer (2–5 Cambridge words).
3) Each question MUST include grading_metadata: {type:"b2_key_word_transformation", version:1, keyword, fullAnswers:[...], markingPoints:[{id:1,accepted:[...]},{id:2,accepted:[...]}]}.
4) fullAnswers must include the primary answer; marking points must PARTITION it in order with no leftover words (score 2/2).
   Example: "looking forward to hearing" → MP1 ["looking forward"] + MP2 ["to hearing"].
5) Distinct keywords; answers in normal case (not ALL CAPS); only superficial contraction variants; no different grammar routes.`
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
    const failPath = path.join(outDir, `b2-part4-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath);
    continue;
  }

  lastEval = evaluateGenerated(lastGenerated);
  console.error(`Attempt ${attempt}: ok=${lastEval.allChecksOk}`);
  if (lastEval.allChecksOk) break;
  console.error(`Attempt ${attempt} failed:`, lastEval.validation.errors.slice(0, 12));
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
    mentionsQ25to30: /Q25–30|questions numbered 25–30/i.test(userPrompt),
    requiresMetadata: /grading_metadata/i.test(userPrompt),
    requiresTwoMarkingPoints: /Exactly TWO marking points/i.test(userPrompt),
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
const outPath = path.join(outDir, `b2-part4-dry-run-${stamp}.json`);
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
