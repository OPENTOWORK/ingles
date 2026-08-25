/**
 * Local dry-run: generate ONE B2 Reading Part 7 with the code prompt (no Supabase write).
 * Does NOT pad section texts locally — length must come from the model
 * (full regeneration and optional model rewrite of short/long sections only).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part7-prompt.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildExamGeneratePrompt } from '../src/lib/draloAiExamPrompts.js';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { countWords } from '../src/lib/b2RuoeExamQuality.js';
import { repairPart7WordMatchQuestions } from '../src/lib/ruoeLocalItemRepair.js';
import { validateRuoeEditorialQuality } from '../src/lib/ruoeEditorialQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const userPrompt = buildExamGeneratePrompt('reading', 'multiple-matching', 'B2', {
  topic: 'joining community sports clubs as adults',
  varietySeed: Date.now(),
  partNumber: 7,
  questionCount: 10,
});

const modelName =
  process.env.OPENAI_MODEL?.trim() ||
  process.env.DRALO_OPENAI_MODEL?.trim() ||
  process.env.OPENAI_MODEL_CAMBRIDGE?.trim() ||
  'gpt-4o';

const systemPrompt =
  'Output only valid JSON for one complete B2 Reading Part 7 (multiple matching). Exactly 4 sections A–D, each 120–150 words (target 125–140). Exactly 10 questions numbered 43–52; every stem starts with Who. modelAnswers A–D only; use all four letters at least once; no letter 6+ times. Overlapping but distinct viewpoints. No keyword-match traps. No placeholders. No student-facing Cambridge. No local padding — count words per section before returning.';

console.error(`Generating Part 7 dry-run (model=${modelName}, no Supabase, no length padding)…`);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function snapshotSections(sections) {
  return (sections || []).map((s) => ({
    letter: String(s.letter || '').toUpperCase(),
    name: String(s.name || s.title || ''),
    text: String(s.text || s.body || ''),
  }));
}

function sectionsEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every(
    (s, i) => s.letter === b[i].letter && s.name === b[i].name && s.text === b[i].text,
  );
}

/** Schema-only normalisation — never invents section prose. */
function normalizeSchemaOnly(generated) {
  const out = { ...generated };
  let sections = Array.isArray(out.sections)
    ? out.sections
    : Array.isArray(out.texts)
      ? out.texts
      : [];
  const rawSnap = snapshotSections(sections);

  out.sections = rawSnap.map((s, i) => ({
    letter: /^[A-D]$/.test(s.letter) ? s.letter : 'ABCD'[i],
    name: s.name,
    text: s.text,
  }));
  delete out.texts;

  const questions = Array.isArray(out.questions) ? [...out.questions] : [];
  const byNum = new Map(questions.map((q) => [Number(q.number), q]));
  out.questions = [];
  for (let n = 43; n <= 52; n += 1) {
    const existing = byNum.get(n) || {};
    const prompt = String(existing.prompt || existing.question || existing.stem || '').trim();
    out.questions.push({
      id: existing.id || `q${n - 42}`,
      number: n,
      prompt,
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
      .replace(/[^A-D]/g, '')
      .charAt(0);
    return { id: q.id, number: q.number, answer: answer || '' };
  });

  // Assert sections unchanged vs raw snapshot (no padding).
  if (!sectionsEqual(snapshotSections(out.sections), rawSnap.map((s, i) => ({
    ...s,
    letter: /^[A-D]$/.test(s.letter) ? s.letter : 'ABCD'[i],
  })))) {
    // letter defaulting is allowed; texts must match
    const textsMatch = out.sections.every((s, i) => s.text === rawSnap[i]?.text);
    if (!textsMatch) {
      throw new Error('FATAL: dry-run mutated section text (padding forbidden).');
    }
  }
  return out;
}

async function repairSectionLengthsViaModel(parsed) {
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
    : Array.isArray(parsed.texts)
      ? parsed.texts
      : [];
  const all = sections.map((s, i) => ({
    i,
    letter: String(s.letter || 'ABCD'[i]).toUpperCase(),
    name: s.name || s.title || '',
    text: String(s.text || s.body || ''),
    wc: countWords(s.text || s.body || ''),
  }));
  const bad = all.filter((s) => s.wc < 120 || s.wc > 150);
  if (!bad.length) return { parsed, lengthRepairViaModel: false };

  console.error(
    `  section length out of range (${bad.map((s) => `${s.letter}:${s.wc}`).join(', ')}); model rewrite all four…`,
  );
  const expandCompletion = await openai.chat.completions.create({
    model: modelName,
    temperature: 0.45,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Rewrite ALL four B2 Part 7 person texts. Return JSON {"sections":[{"letter":"A","name":"...","text":"..."},{"letter":"B",...},{"letter":"C",...},{"letter":"D",...}]}. Keep the same letters, names, topic voice and factual claims. Adjust ONLY length so EACH text is 125–140 words (min 120, max 150). British English. Do not invent new people.',
      },
      {
        role: 'user',
        content: `Rewrite ALL sections to 120–150 words each:\n${JSON.stringify(
          all.map((s) => ({ letter: s.letter, name: s.name, text: s.text, currentWords: s.wc })),
          null,
          2,
        )}`,
      },
    ],
  });

  try {
    const expanded = JSON.parse(expandCompletion.choices?.[0]?.message?.content || '{}');
    const repaired = Array.isArray(expanded.sections) ? expanded.sections : [];
    const next = sections.map((s, i) => ({ ...s }));
    let applied = 0;
    for (const r of repaired) {
      const L = String(r.letter || '')
        .toUpperCase()
        .replace(/[^A-D]/g, '')
        .charAt(0);
      const text = String(r.text || '').trim();
      const wc = countWords(text);
      const idx = next.findIndex((s, i) => String(s.letter || 'ABCD'[i]).toUpperCase() === L);
      if (idx >= 0 && text && wc >= 120 && wc <= 150) {
        next[idx] = { ...next[idx], letter: L, text, name: r.name || next[idx].name };
        applied += 1;
      }
    }
    if (applied > 0) {
      parsed.sections = next;
      delete parsed.texts;
      return { parsed, lengthRepairViaModel: true };
    }
  } catch {
    console.error('  model section length repair JSON parse failed');
  }
  return { parsed, lengthRepairViaModel: false };
}

function evaluateGenerated(generated) {
  const validation = validateGeneratedExamPart('b2', 7, generated);
  const normalized = validation.normalized || generated;
  const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  const modelAnswers = Array.isArray(normalized.modelAnswers) ? normalized.modelAnswers : [];
  const sections = Array.isArray(normalized.sections) ? normalized.sections : [];
  const nums = questions.map((q) => Number(q.number)).sort((a, b) => a - b);
  const letters = modelAnswers.map((m) => String(m.answer || '').trim().toUpperCase());
  const used = new Set(letters.filter((l) => /^[A-D]$/.test(l)));
  const sectionWcs = sections.map((s) => countWords(s.text || s.body || ''));
  const whoOk = questions.every((q) => /^who\b/i.test(String(q.prompt || q.question || '')));
  const PLACEHOLDER = /\b(placeholder|lorem ipsum|TODO|question text)\b/i;
  const noPlaceholders = !PLACEHOLDER.test(JSON.stringify(normalized));

  const checks = [
    { name: 'JSON parses', ok: true },
    { name: 'Validator ok', ok: validation.ok },
    { name: 'Exactly 10 questions', ok: questions.length === 10 },
    { name: 'Question numbers 43–52', ok: nums.join(',') === '43,44,45,46,47,48,49,50,51,52' },
    { name: 'Exactly 4 sections', ok: sections.length === 4 },
    {
      name: 'Sections A–D once',
      ok: [...sections.map((s) => String(s.letter || '').toUpperCase())].sort().join('') === 'ABCD',
    },
    {
      name: 'Each section 120–150 words',
      ok: sectionWcs.length === 4 && sectionWcs.every((w) => w >= 120 && w <= 150),
      detail: sectionWcs.join(','),
    },
    { name: 'Every stem starts with Who', ok: whoOk },
    {
      name: 'Answer key complete A–D',
      ok: letters.length === 10 && letters.every((l) => /^[A-D]$/.test(l)),
    },
    {
      name: 'All four letters used (or warning only)',
      ok: used.size === 4 || (validation.warnings || []).some((w) => /never uses section/.test(w)),
      detail: [...used].sort().join('') || 'none',
    },
    { name: 'No placeholders', ok: noPlaceholders },
    { name: 'No length padding', ok: true },
    {
      name: 'Word-match quality fails ≤1',
      ok:
        validateRuoeEditorialQuality(7, normalized).findings.filter(
          (f) => f.rule_id === 'TEST-P7-WORD-MATCH',
        ).length <= 1,
    },
  ];

  return {
    validation,
    normalized,
    checks,
    sectionWordCounts: sectionWcs,
    allChecksOk: checks.every((c) => c.ok),
  };
}

let attempt = 0;
let lastEval = null;
let lastGenerated = null;
let lastSectionWcs = null;
const localRepairs = [];
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
    prevFailed.every(
      (n) =>
        n === 'Each section 120–150 words' ||
        n === 'Validator ok' ||
        n === 'No length padding',
    ) &&
    prevErrors.every((e) => /words; minimum is 120|words; maximum is 150/.test(e));

  const repairHint =
    attempt > 1
      ? onlyLength
        ? `\n\nRETRY NOTE: Section length failed (previous word counts: ${(lastSectionWcs || []).join(', ')}). KEEP the same people, questions and answers. Rewrite EACH section to 125–140 words (min 120, max 150). Do not pad with repeated filler sentences.`
        : `\n\nRETRY NOTE: Previous output failed.
Failed checks: ${prevFailed.join(', ') || 'unknown'}.
Errors: ${prevErrors.join(' | ') || 'none'}.
HARD REQUIREMENTS:
1) 4 sections A–D, each 125–140 words (min 120, max 150).
2) 10 Who-questions numbered 43–52.
3) modelAnswers A–D; use all four letters; no letter 6+ times.
4) Overlap + contrast; no keyword traps; no placeholders; no Cambridge.`
      : '';

  const completion = await openai.chat.completions.create({
    model: modelName,
    temperature: attempt === 1 ? 0.85 : onlyLength ? 0.55 : 0.45,
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
    const failPath = path.join(outDir, `b2-part7-dry-run-parse-fail-${Date.now()}.txt`);
    writeFileSync(failPath, raw, 'utf8');
    console.error('JSON parse failed. Raw saved to', failPath, 'finish_reason=', finishReason);
    attemptLog.push({ attempt, parseOk: false, finishReason });
    continue;
  }

  const initialWcs = (
    Array.isArray(parsed.sections) ? parsed.sections : Array.isArray(parsed.texts) ? parsed.texts : []
  ).map((s) => countWords(s.text || s.body || ''));

  let lengthRepairViaModel = false;
  const repaired = await repairSectionLengthsViaModel(parsed);
  parsed = repaired.parsed;
  lengthRepairViaModel = repaired.lengthRepairViaModel;

  try {
    lastGenerated = normalizeSchemaOnly(parsed);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }

  const editorialBefore = validateRuoeEditorialQuality(7, lastGenerated);
  const wordMatchCount = editorialBefore.findings.filter((f) => f.rule_id === 'TEST-P7-WORD-MATCH').length;
  if (wordMatchCount >= 2) {
    console.error(`  ${wordMatchCount} TEST-P7-WORD-MATCH; local question repair…`);
    const repaired = await repairPart7WordMatchQuestions(openai, lastGenerated, { minFlags: 2 });
    lastGenerated = repaired.repaired;
    if (repaired.repairs.length) localRepairs.push(...repaired.repairs);
  }

  lastEval = evaluateGenerated(lastGenerated);
  lastSectionWcs = lastEval.sectionWordCounts;
  attemptLog.push({
    attempt,
    parseOk: true,
    finishReason,
    initialSectionWordCounts: initialWcs,
    finalSectionWordCounts: lastSectionWcs,
    paddingApplied: false,
    lengthRepairViaModel,
    ok: lastEval.allChecksOk,
    errors: lastEval.validation.errors.slice(0, 5),
  });

  console.error(
    `  initialWcs=${initialWcs.join(',')} finalWcs=${lastSectionWcs.join(',')} paddingApplied=false lengthRepairViaModel=${lengthRepairViaModel} ok=${lastEval.allChecksOk} errors=${lastEval.validation.errors.length} warnings=${lastEval.validation.warnings.length}`,
  );
  if (lastEval.allChecksOk) break;
}

const lastAttemptMeta = attemptLog.filter((a) => a.parseOk).at(-1) || {};
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(outDir, `b2-part7-dry-run-${stamp}.json`);
const report = {
  generatedAt: new Date().toISOString(),
  model: modelName,
  attempts: attempt,
  localRepairs,
  retried: attempt > 1,
  paddingApplied: false,
  lengthRepairViaModel: Boolean(lastAttemptMeta.lengthRepairViaModel),
  initialSectionWordCounts: lastAttemptMeta.initialSectionWordCounts ?? null,
  finalSectionWordCounts: lastEval?.sectionWordCounts ?? null,
  promptSnippet: {
    mentionsQ43to52: /43/.test(userPrompt) && /52/.test(userPrompt),
    whoRequired: /MUST start with "Who"/i.test(userPrompt),
    sectionWordTarget: /120–150|120-150/.test(userPrompt),
    overlapFocus: /OVERLAP AND COMPARISON/i.test(userPrompt),
  },
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
      initialSectionWordCounts: report.initialSectionWordCounts,
      finalSectionWordCounts: report.finalSectionWordCounts,
      paddingApplied: false,
      lengthRepairViaModel: report.lengthRepairViaModel,
    },
    null,
    2,
  ),
);
if (!report.allChecksOk) process.exit(1);
