/**
 * Phase 2B — fetch live B2 Part 4 items (read-only), merge candidate keys, write review artifacts.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/review-b2-part4-answer-keys.mjs
 *
 * Outputs (gitignored under scripts/generated/):
 *   reviews/b2-part4-live-items.json
 *   reviews/b2-part4-answer-key-review.json
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';
import {
  B2_PART4_CANDIDATE_ANSWER_KEYS,
  E2Q26_PROPOSED_REWRITE,
  summarizeReviewCounts,
} from './b2-part4-candidate-answer-keys.mjs';
import { parseB2KeyWordTransformItems } from '../src/utils/b2ExamTextBlocks.js';
import { countCambridgeKeyWordWords } from '../src/lib/countCambridgeKeyWordWords.js';
import { validateB2KeyWordAnswerKey } from '../src/lib/validateB2KeyWordAnswerKey.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = path.join(__dirname, 'generated', 'reviews');

const B2_PART4_PARTE_ID = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d';
const EXAM_SLOTS = [1, 2, 3];

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
async function fetchLivePart4Items(client) {
  const { data: level, error: levelErr } = await client
    .from('levels')
    .select('id')
    .ilike('nombre', 'b2')
    .single();

  if (levelErr || !level?.id) {
    throw new Error(`B2 level not found: ${levelErr?.message || 'unknown'}`);
  }

  const { data: examenes, error: examErr } = await client
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', level.id)
    .order('nombre');

  if (examErr) throw examErr;

  const slotExamMap = new Map();
  for (const row of examenes || []) {
    const slot = parseInt(String(row.nombre || '').match(/\d+/)?.[0] || '0', 10);
    if (EXAM_SLOTS.includes(slot)) slotExamMap.set(slot, row);
  }

  /** @type {Array<object>} */
  const liveItems = [];

  for (const slot of EXAM_SLOTS) {
    const examRow = slotExamMap.get(slot);
    if (!examRow) {
      console.warn(`Exam slot ${slot} not found in levels_examenes`);
      continue;
    }

    const { data: preguntas, error: pregErr } = await client
      .from('levels_preguntas')
      .select('id, enunciado')
      .eq('examen_id', examRow.id)
      .eq('parte_id', B2_PART4_PARTE_ID)
      .limit(1);

    if (pregErr) throw pregErr;
    const pregunta = preguntas?.[0];
    if (!pregunta) {
      console.warn(`No Part 4 pregunta for exam slot ${slot}`);
      continue;
    }

    const { data: openAnswers, error: ansErr } = await client
      .from('levels_respuestas_abiertas')
      .select('respuesta_texto')
      .eq('pregunta_id_abierta', pregunta.id);

    if (ansErr) throw ansErr;

    const parsed = parseB2KeyWordTransformItems(pregunta.enunciado);
    const answerByQ = new Map();
    for (const row of openAnswers || []) {
      const text = String(row.respuesta_texto || '').trim();
      const m = text.match(/^(\d{1,2})\s+(.+)$/);
      if (m) answerByQ.set(Number(m[1]), m[2].trim());
    }

    for (const item of parsed.filter((p) => !p.isExample && p.questionNumber >= 25)) {
      const canonical = answerByQ.get(item.questionNumber) || null;
      liveItems.push({
        examSlot: slot,
        examName: String(examRow.nombre || '').trim(),
        examenId: examRow.id,
        preguntaId: pregunta.id,
        questionNumber: item.questionNumber,
        sentence1: item.sentence1,
        keyword: item.keyword,
        sentence2Before: item.sentence2Before,
        sentence2After: item.sentence2After,
        sentence2Full: `${item.sentence2Before}____${item.sentence2After}`.replace(/\s+/g, ' '),
        canonicalAnswer: canonical,
        canonicalWordCount: canonical ? countCambridgeKeyWordWords(canonical) : null,
        variantsInDb: canonical ? [canonical] : [],
      });
    }
  }

  return liveItems;
}

/**
 * @param {typeof B2_PART4_CANDIDATE_ANSWER_KEYS[0]} candidate
 */
function runTestCases(candidate) {
  const validation = validateB2KeyWordAnswerKey(candidate.answerKey);
  /** @type {Array<object>} */
  const caseResults = [];

  for (const tc of candidate.testCases) {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    let result;
    try {
      result = gradeB2KeyWordTransformation(tc.answer, candidate.answerKey);
    } finally {
      process.env.NODE_ENV = prev;
    }
    caseResults.push({
      ...tc,
      actualScore: result.score,
      reason: result.reason,
      keywordStatus: result.keywordStatus,
      keywordOccurrences: result.keywordOccurrences,
      wordCount: result.wordCount,
      pass: result.score === tc.expectedScore,
    });
  }

  return {
    validation,
    caseResults,
    allCasesPass: caseResults.every((c) => c.pass),
  };
}

async function main() {
  mkdirSync(GENERATED_DIR, { recursive: true });

  console.error('Fetching live Part 4 items from Supabase (read-only)…');
  const liveItems = await fetchLivePart4Items(admin);

  const livePath = path.join(GENERATED_DIR, 'b2-part4-live-items.json');
  writeFileSync(
    livePath,
    JSON.stringify({ fetchedAt: new Date().toISOString(), count: liveItems.length, items: liveItems }, null, 2),
    'utf8',
  );
  console.error(`Wrote ${livePath} (${liveItems.length} items)`);

  /** @type {Array<object>} */
  const reviewRows = [];

  for (const candidate of B2_PART4_CANDIDATE_ANSWER_KEYS) {
    const live = liveItems.find(
      (i) => i.examSlot === candidate.examSlot && i.questionNumber === candidate.questionNumber,
    );
    const { validation, caseResults, allCasesPass } = runTestCases(candidate);

    reviewRows.push({
      id: candidate.id,
      examSlot: candidate.examSlot,
      questionNumber: candidate.questionNumber,
      reviewStatus: candidate.reviewStatus,
      reviewFlags: candidate.reviewFlags,
      pedagogyNotes: candidate.pedagogyNotes,
      live: live || null,
      keyword: candidate.answerKey.keyword,
      fullAnswers: candidate.answerKey.fullAnswers,
      markingPoints: candidate.answerKey.markingPoints,
      validation,
      testResults: caseResults,
      allTestsPass: allCasesPass,
      mpOnlyNotes: candidate.mpOnlyNotes || null,
    });
  }

  const summary = {
    fetchedAt: new Date().toISOString(),
    liveItemCount: liveItems.length,
    candidateKeyCount: B2_PART4_CANDIDATE_ANSWER_KEYS.length,
    reviewCounts: summarizeReviewCounts(),
    validationPassCount: reviewRows.filter((r) => r.validation.valid).length,
    allTestsPassCount: reviewRows.filter((r) => r.allTestsPass).length,
    e2q26ProposedRewrite: E2Q26_PROPOSED_REWRITE,
    rows: reviewRows,
  };

  const reviewPath = path.join(GENERATED_DIR, 'b2-part4-answer-key-review.json');
  writeFileSync(reviewPath, JSON.stringify(summary, null, 2), 'utf8');
  console.error(`Wrote ${reviewPath}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        liveItems: liveItems.length,
        reviewCounts: summary.reviewCounts,
        validationPass: summary.validationPassCount,
        allTestsPass: summary.allTestsPassCount,
        outputs: {
          liveItems: livePath,
          review: reviewPath,
        },
      },
      null,
      2,
    ),
  );

  if (liveItems.length !== 18) {
    console.error(`Warning: expected 18 live items, got ${liveItems.length}`);
    process.exitCode = 1;
  }
  if (summary.validationPassCount !== 18) {
    console.error(`Warning: ${18 - summary.validationPassCount} keys failed validation`);
    process.exitCode = 1;
  }
  if (summary.allTestsPassCount !== 18) {
    console.error(`Warning: ${18 - summary.allTestsPassCount} keys have failing test cases`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
