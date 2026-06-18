/**
 * B2 Scoring V2 — unified Part 4 metadata + persistence DDL dry-run / apply.
 *
 * Dry-run (read-only Supabase + local artifacts):
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-scoring-v2.mjs --dry-run
 *
 * Apply (requires explicit confirmation):
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-scoring-v2.mjs --apply --confirm-apply-b2-scoring-v2
 *
 * Apply without DDL (after manual SQL), still runs DML:
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-scoring-v2.mjs --apply --confirm-apply-b2-scoring-v2 --apply-skip-ddl
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';
import { validateB2KeyWordAnswerKey } from '../src/lib/validateB2KeyWordAnswerKey.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';
import { normalizeB2KeyWordAnswer } from '../src/lib/normalizeB2KeyWordAnswer.js';
import { parseB2KeyWordTransformItems } from '../src/utils/b2ExamTextBlocks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METADATA_PATH = path.join(__dirname, 'data', 'b2-part4-approved-metadata.json');
const DDL_GRADING_PATH = path.join(__dirname, 'sql', 'b2-part4-grading-metadata.sql');
const DDL_PERSISTENCE_PATH = path.join(__dirname, 'sql', 'b2-scoring-v2-persistence.sql');
const BACKUP_DIR = path.join(__dirname, 'generated', 'backups');
const REVIEW_DIR = path.join(__dirname, 'generated', 'reviews');

const B2_PART4_PARTE_ID = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d';
const EXAM_SLOTS = [1, 2, 3];
const E2Q26_ROW_ID = 'edb32978-cfb9-4d9c-94c0-3fa2e89ae281';
const E2Q26_PREGUNTA_ID = 'd65a2dad-454b-48a6-b9ea-5f8161f43df6';
const EXPECTED_LIVE_ROW_COUNT = 18;
const EXPECTED_APPROVED_FOR_BACKFILL = 18;
const CONFIRM_FLAG = '--confirm-apply-b2-scoring-v2';
const KEY_WORD_GAP = '__________________';

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const apply = argv.includes('--apply');
  const confirmed = argv.includes(CONFIRM_FLAG);
  const skipDdl = argv.includes('--apply-skip-ddl');
  if (dryRun && apply) {
    throw new Error('Use either --dry-run or --apply, not both.');
  }
  if (!dryRun && !apply) {
    throw new Error('Specify --dry-run or --apply.');
  }
  if (skipDdl && !apply) {
    throw new Error('--apply-skip-ddl requires --apply.');
  }
  return { dryRun, apply, confirmed, skipDdl };
}

function loadApprovedMetadata() {
  return JSON.parse(readFileSync(METADATA_PATH, 'utf8'));
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function extractCanonicalFromRow(respuestaTexto) {
  const text = String(respuestaTexto || '').trim();
  const m = text.match(/^(\d{1,2})\s+(.+)$/);
  return m ? m[2].trim() : text;
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.SUPABASE_DB_URL || null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
async function probeGradingMetadataColumn(client) {
  const { error } = await client
    .from('levels_respuestas_abiertas')
    .select('grading_metadata')
    .limit(1);

  if (!error) {
    return { exists: true, probeError: null };
  }
  const msg = String(error.message || '');
  if (/grading_metadata/i.test(msg) && /(does not exist|column)/i.test(msg)) {
    return { exists: false, probeError: msg };
  }
  return { exists: null, probeError: msg };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
async function probePersistenceColumns(client) {
  const { error } = await client
    .from('levels_puntuaciones')
    .select('puntos_obtenidos, puntos_maximos, scoring_version')
    .limit(1);

  if (!error) {
    return {
      exists: true,
      columns: ['puntos_obtenidos', 'puntos_maximos', 'scoring_version'],
      probeError: null,
    };
  }
  const msg = String(error.message || '');
  if (
    /(puntos_obtenidos|puntos_maximos|scoring_version)/i.test(msg) &&
    /(does not exist|column)/i.test(msg)
  ) {
    return { exists: false, columns: [], probeError: msg };
  }
  return { exists: null, columns: [], probeError: msg };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {{ includeGradingMetadata?: boolean }} [options]
 */
async function fetchLivePart4OpenRows(client, options = {}) {
  const includeGradingMetadata = options.includeGradingMetadata === true;
  const openAnswerSelect = includeGradingMetadata
    ? 'id, respuesta_texto, pregunta_id_abierta, grading_metadata, created_at'
    : 'id, respuesta_texto, pregunta_id_abierta, created_at';
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
  const rows = [];

  for (const slot of EXAM_SLOTS) {
    const examRow = slotExamMap.get(slot);
    if (!examRow) continue;

    const { data: preguntas, error: pregErr } = await client
      .from('levels_preguntas')
      .select('id, enunciado')
      .eq('examen_id', examRow.id)
      .eq('parte_id', B2_PART4_PARTE_ID)
      .limit(1);

    if (pregErr) throw pregErr;
    const pregunta = preguntas?.[0];
    if (!pregunta) continue;

    const { data: openAnswers, error: ansErr } = await client
      .from('levels_respuestas_abiertas')
      .select(openAnswerSelect)
      .eq('pregunta_id_abierta', pregunta.id);

    if (ansErr) throw ansErr;

    const parsedItems = parseB2KeyWordTransformItems(pregunta.enunciado);

    for (const row of openAnswers || []) {
      const qMatch = String(row.respuesta_texto || '').trim().match(/^(\d{1,2})\s+/);
      const questionNumber = qMatch ? Number(qMatch[1]) : null;
      if (!questionNumber || questionNumber < 25) continue;

      const parsedItem = parsedItems.find((p) => p.questionNumber === questionNumber && !p.isExample);

      rows.push({
        rowId: row.id,
        examSlot: slot,
        questionNumber,
        preguntaId: pregunta.id,
        examenId: examRow.id,
        enunciado: pregunta.enunciado,
        respuestaTexto: row.respuesta_texto,
        canonicalAnswer: extractCanonicalFromRow(row.respuesta_texto),
        gradingMetadataLive: includeGradingMetadata ? (row.grading_metadata ?? null) : null,
        parsedKeyword: parsedItem?.keyword ?? null,
        parsedSentence1: parsedItem?.sentence1 ?? null,
        parsedSentence2Before: parsedItem?.sentence2Before ?? null,
        parsedSentence2After: parsedItem?.sentence2After ?? null,
      });
    }
  }

  rows.sort((a, b) => a.examSlot - b.examSlot || a.questionNumber - b.questionNumber);
  return rows;
}

function getE2Q26MetadataItem(metadataDoc) {
  return metadataDoc.items.find((i) => i.id === 'E2Q26') || null;
}

function buildE2Q26QuestionBlock(rewriteTo) {
  const sentence2 = rewriteTo.sentence2.includes(KEY_WORD_GAP)
    ? rewriteTo.sentence2
    : rewriteTo.sentence2.replace(/_{2,}|\.{4,}/, KEY_WORD_GAP);
  return `26${rewriteTo.sentence1}${rewriteTo.keyword}\n${sentence2}`;
}

function findQuestionBlockStart(text, questionNumber) {
  const patterns = [
    new RegExp(`(?:^|\\n)${questionNumber}(?=[A-Za-z"'\\s]|\\.|\\s*$)`, 'm'),
    new RegExp(`(?:^|\\n)${questionNumber}\\.\\s`, 'm'),
    new RegExp(`(?:^|\\n)${questionNumber}\\s*$`, 'm'),
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return m.index + (m[0].startsWith('\n') ? 1 : 0);
  }
  return -1;
}

function replaceQuestionBlockInEnunciado(enunciado, questionNumber, nextQuestionNumber, newBlock) {
  const normalized = String(enunciado || '').replace(/\r\n/g, '\n');
  const questionsMatch = normalized.match(/(?:^|\n)\s*Questions\s*\n([\s\S]*)$/im);
  if (!questionsMatch) {
    throw new Error('Questions block not found in enunciado');
  }

  const questionsBody = questionsMatch[1];
  const questionsPrefix = normalized.slice(
    0,
    questionsMatch.index + questionsMatch[0].length - questionsBody.length,
  );

  const start = findQuestionBlockStart(questionsBody, questionNumber);
  const nextStart = findQuestionBlockStart(questionsBody, nextQuestionNumber);
  if (start < 0 || nextStart < 0 || nextStart <= start) {
    throw new Error(`Could not locate Q${questionNumber} block in enunciado`);
  }

  const updatedQuestionsBody =
    questionsBody.slice(0, start) + `${newBlock.trim()}\n` + questionsBody.slice(nextStart);
  return `${questionsPrefix}${updatedQuestionsBody}`.replace(/\r\n/g, '\n');
}

function assessE2Q26LegacyState(liveRow, metadataItem) {
  const legacy = metadataItem.rewriteFromLegacy;
  if (!legacy) {
    return { ok: false, issues: ['missing_rewriteFromLegacy_metadata'] };
  }

  const issues = [];
  const liveCanonicalNorm = normalizeB2KeyWordAnswer(liveRow.canonicalAnswer);
  const legacyCanonicalNorm = normalizeB2KeyWordAnswer(legacy.canonicalAnswer);

  if (liveCanonicalNorm !== legacyCanonicalNorm) {
    issues.push('e2q26_open_answer_not_legacy');
  }
  if (String(liveRow.parsedKeyword || '').toUpperCase() !== String(legacy.keyword).toUpperCase()) {
    issues.push('e2q26_enunciado_keyword_not_legacy');
  }
  if (
    legacy.respuestaTexto &&
    normalizeB2KeyWordAnswer(extractCanonicalFromRow(liveRow.respuestaTexto)) !== legacyCanonicalNorm
  ) {
    issues.push('e2q26_respuesta_texto_not_legacy');
  }

  return { ok: issues.length === 0, issues, legacy, rewriteTo: metadataItem.rewriteTo };
}

function assessE2Q26AppliedState(liveRow, metadataItem) {
  const rewriteTo = metadataItem.rewriteTo;
  if (!rewriteTo) {
    return { ok: false, issues: ['missing_rewriteTo_metadata'] };
  }

  const issues = [];
  const liveCanonicalNorm = normalizeB2KeyWordAnswer(liveRow.canonicalAnswer);
  const expectedNorm = normalizeB2KeyWordAnswer(metadataItem.canonicalAnswer);

  if (liveCanonicalNorm !== expectedNorm) {
    issues.push('e2q26_open_answer_not_applied');
  }
  if (String(liveRow.parsedKeyword || '').toUpperCase() !== String(rewriteTo.keyword).toUpperCase()) {
    issues.push('e2q26_enunciado_keyword_not_applied');
  }
  if (liveRow.gradingMetadataLive == null) {
    issues.push('e2q26_grading_metadata_missing');
  }

  return { ok: issues.length === 0, issues, rewriteTo };
}

function validateApprovedItem(item, liveByRowId, { allowE2Q26LegacyDrift = true } = {}) {
  const live = liveByRowId.get(item.supabase.openAnswerRowId);
  const issues = [];

  if (!live) {
    issues.push('live_row_not_found');
  } else {
    if (live.examSlot !== item.examSlot || live.questionNumber !== item.questionNumber) {
      issues.push('slot_or_question_mismatch');
    }

    if (item.id === 'E2Q26' && allowE2Q26LegacyDrift) {
      const legacyCheck = assessE2Q26LegacyState(live, item);
      if (!legacyCheck.ok) {
        const appliedCheck = assessE2Q26AppliedState(live, item);
        if (!appliedCheck.ok) {
          issues.push(...legacyCheck.issues);
        }
      }
    } else {
      const norms = new Set(item.fullAnswers.map((a) => normalizeB2KeyWordAnswer(a)));
      if (!norms.has(normalizeB2KeyWordAnswer(live.canonicalAnswer))) {
        issues.push('canonical_not_in_fullAnswers');
      }
      if (live.canonicalAnswer !== item.canonicalAnswer) {
        issues.push('canonical_answer_text_mismatch');
      }
    }
  }

  const validation = validateB2KeyWordAnswerKey(item.gradingMetadata);
  if (!validation.valid) {
    issues.push('answer_key_validation_failed');
  }

  const gradeResult = gradeB2KeyWordTransformation(item.canonicalAnswer, item.gradingMetadata);
  const canonicalScores2of2 = gradeResult.score === 2;

  return {
    id: item.id,
    rowId: item.supabase.openAnswerRowId,
    classification: item.classification,
    includeInBackfill: item.includeInBackfill,
    validation,
    gradeResult: {
      score: gradeResult.score,
      keywordStatus: gradeResult.keywordStatus,
      reason: gradeResult.reason ?? null,
    },
    canonicalScores2of2,
    issues,
    ready:
      item.includeInBackfill &&
      issues.length === 0 &&
      validation.valid &&
      canonicalScores2of2,
  };
}

function buildPlan(metadataDoc, liveRows, options = {}) {
  const liveByRowId = new Map(liveRows.map((r) => [r.rowId, r]));
  const itemByRowId = new Map(metadataDoc.items.map((i) => [i.supabase.openAnswerRowId, i]));

  /** @type {Array<object>} */
  const approved = [];
  /** @type {Array<object>} */
  const mismatches = [];
  /** @type {Array<object>} */
  const gradingResults = [];

  for (const item of metadataDoc.items) {
    const result = validateApprovedItem(item, liveByRowId, options);
    gradingResults.push({
      id: item.id,
      canonicalAnswer: item.canonicalAnswer,
      score: result.gradeResult.score,
      keywordStatus: result.gradeResult.keywordStatus,
    });

    if (item.includeInBackfill) {
      if (result.ready) {
        approved.push({
          id: item.id,
          rowId: item.supabase.openAnswerRowId,
          examSlot: item.examSlot,
          questionNumber: item.questionNumber,
          gradingMetadata: item.gradingMetadata,
        });
      } else {
        mismatches.push({ id: item.id, ...result });
      }
    } else {
      mismatches.push({ id: item.id, issue: 'includeInBackfill_false' });
    }
  }

  for (const live of liveRows) {
    if (!itemByRowId.has(live.rowId)) {
      mismatches.push({ rowId: live.rowId, issue: 'live_row_missing_from_metadata' });
    }
  }

  const e2q26Item = getE2Q26MetadataItem(metadataDoc);
  const e2q26Live = liveByRowId.get(E2Q26_ROW_ID);
  const e2q26Legacy = e2q26Item && e2q26Live ? assessE2Q26LegacyState(e2q26Live, e2q26Item) : null;
  const e2q26Applied =
    e2q26Item && e2q26Live ? assessE2Q26AppliedState(e2q26Live, e2q26Item) : null;
  const e2q26PreApplyOk = e2q26Legacy?.ok === true || e2q26Applied?.ok === true;
  const e2q26Rewrite =
    e2q26Item?.rewriteTo && e2q26Live
      ? {
          preguntaId: E2Q26_PREGUNTA_ID,
          openAnswerRowId: E2Q26_ROW_ID,
          respuestaTexto: {
            from: e2q26Live.respuestaTexto,
            to: e2q26Item.rewriteTo.respuestaTexto,
          },
          enunciadoQ26Block: {
            from: {
              keyword: e2q26Live.parsedKeyword,
              sentence1: e2q26Live.parsedSentence1,
              sentence2: `${e2q26Live.parsedSentence2Before || ''}${KEY_WORD_GAP}${e2q26Live.parsedSentence2After || ''}`,
            },
            to: {
              keyword: e2q26Item.rewriteTo.keyword,
              sentence1: e2q26Item.rewriteTo.sentence1,
              sentence2: e2q26Item.rewriteTo.sentence2,
            },
          },
          newQuestionBlock: buildE2Q26QuestionBlock(e2q26Item.rewriteTo),
        }
      : null;

  return {
    approved,
    mismatches,
    gradingResults,
    e2q26Legacy,
    e2q26Applied,
    e2q26PreApplyOk,
    e2q26Rewrite,
    canonical2of2Count: gradingResults.filter((g) => g.score === 2).length,
  };
}

async function executeSqlFile(sqlPath) {
  const url = getDatabaseUrl();
  if (!url) {
    return {
      ok: false,
      reason: 'missing_database_url',
      message:
        'Set DATABASE_URL, DIRECT_URL, or SUPABASE_DB_URL for DDL execution, or pass --apply-skip-ddl after running SQL manually.',
    };
  }

  const pg = await import('pg');
  const client = new pg.default.Client({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const sql = readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    return { ok: true, path: sqlPath };
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
async function applyE2Q26Rewrite(admin, metadataItem, liveRow) {
  const rewriteTo = metadataItem.rewriteTo;
  if (!rewriteTo) {
    throw new Error('E2Q26 rewriteTo metadata missing');
  }

  const newEnunciado = replaceQuestionBlockInEnunciado(
    liveRow.enunciado,
    26,
    27,
    buildE2Q26QuestionBlock(rewriteTo),
  );

  const { error: pregErr } = await admin
    .from('levels_preguntas')
    .update({ enunciado: newEnunciado })
    .eq('id', E2Q26_PREGUNTA_ID);

  if (pregErr) {
    throw new Error(`E2Q26 enunciado update failed: ${pregErr.message}`);
  }

  const { error: ansErr } = await admin
    .from('levels_respuestas_abiertas')
    .update({ respuesta_texto: rewriteTo.respuestaTexto })
    .eq('id', E2Q26_ROW_ID);

  if (ansErr) {
    throw new Error(`E2Q26 open answer update failed: ${ansErr.message}`);
  }

  return { newEnunciado, respuestaTexto: rewriteTo.respuestaTexto };
}

async function main() {
  const { dryRun, apply, confirmed, skipDdl } = parseArgs(process.argv.slice(2));

  if (apply && !confirmed) {
    console.error(`Apply aborted: missing required flag ${CONFIRM_FLAG}`);
    process.exit(1);
  }

  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const metadataDoc = loadApprovedMetadata();
  if (metadataDoc.items.length !== EXPECTED_LIVE_ROW_COUNT) {
    console.error(`Metadata item count ${metadataDoc.items.length} !== ${EXPECTED_LIVE_ROW_COUNT}`);
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.error(`${dryRun ? 'Dry-run' : 'Apply'}: reading Supabase (Part 4 open answers)…`);
  const gradingColumnProbe = await probeGradingMetadataColumn(admin);
  const persistenceColumnProbe = await probePersistenceColumns(admin);
  const liveRows = await fetchLivePart4OpenRows(admin, {
    includeGradingMetadata: gradingColumnProbe.exists === true,
  });
  const plan = buildPlan(metadataDoc, liveRows);

  const ts = timestampSlug();
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  const backupPath = path.join(BACKUP_DIR, `b2-scoring-v2-backup-${ts}.json`);
  const reportPath = path.join(
    REVIEW_DIR,
    dryRun ? `b2-scoring-v2-dry-run-${ts}.json` : `b2-scoring-v2-apply-${ts}.json`,
  );

  const e2q26LiveRow = liveRows.find((r) => r.rowId === E2Q26_ROW_ID);

  const backup = {
    backedUpAt: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply-pre-write',
    liveRowCount: liveRows.length,
    gradingMetadataColumnExists: gradingColumnProbe.exists,
    persistenceColumnsExist: persistenceColumnProbe.exists,
    rows: liveRows.map((r) => ({
      rowId: r.rowId,
      examSlot: r.examSlot,
      questionNumber: r.questionNumber,
      preguntaId: r.preguntaId,
      examenId: r.examenId,
      respuestaTexto: r.respuestaTexto,
      canonicalAnswer: r.canonicalAnswer,
      grading_metadata: r.gradingMetadataLive,
      parsedKeyword: r.parsedKeyword,
    })),
    e2q26Enunciado: e2q26LiveRow?.enunciado ?? null,
  };

  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

  /** @type {Record<string, unknown>} */
  const report = {
    phase: 'b2-scoring-v2',
    mode: dryRun ? 'dry-run' : 'apply',
    generatedAt: new Date().toISOString(),
    supabaseWrites: false,
    ddlGradingExecuted: false,
    ddlPersistenceExecuted: false,
    dmlExecuted: false,
    metadataPath: METADATA_PATH,
    ddlGradingPath: DDL_GRADING_PATH,
    ddlPersistencePath: DDL_PERSISTENCE_PATH,
    gradingMetadataColumn: gradingColumnProbe,
    persistenceColumns: persistenceColumnProbe,
    liveRowCount: liveRows.length,
    expectedLiveRowCount: EXPECTED_LIVE_ROW_COUNT,
    approvedForBackfill: plan.approved.length,
    expectedApprovedForBackfill: EXPECTED_APPROVED_FOR_BACKFILL,
    canonicalGrading2of2: `${plan.canonical2of2Count}/${EXPECTED_LIVE_ROW_COUNT}`,
    gradingResults: plan.gradingResults,
    e2q26LegacyState: plan.e2q26Legacy,
    e2q26Rewrite: plan.e2q26Rewrite,
    mismatches: plan.mismatches,
    backfillRows: plan.approved.map(({ rowId, id, examSlot, questionNumber }) => ({
      id,
      rowId,
      examSlot,
      questionNumber,
    })),
    backupPath,
    reportPath,
    skipDdl: apply ? skipDdl : false,
    databaseUrlAvailable: Boolean(getDatabaseUrl()),
    validations: {
      liveRowCountOk: liveRows.length === EXPECTED_LIVE_ROW_COUNT,
      approvedCountOk: plan.approved.length === EXPECTED_APPROVED_FOR_BACKFILL,
      metadataItemCountOk: metadataDoc.items.length === EXPECTED_LIVE_ROW_COUNT,
      allCanonical2of2: plan.canonical2of2Count === EXPECTED_LIVE_ROW_COUNT,
      e2q26LegacyOk: plan.e2q26PreApplyOk === true,
      mismatchCount: plan.mismatches.length,
      allApprovedValidationOk: plan.approved.every((r) =>
        validateB2KeyWordAnswerKey(r.gradingMetadata).valid,
      ),
    },
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const preApplyOk =
    report.validations.liveRowCountOk &&
    report.validations.approvedCountOk &&
    report.validations.metadataItemCountOk &&
    report.validations.allCanonical2of2 &&
    report.validations.e2q26LegacyOk &&
    report.validations.mismatchCount === 0 &&
    report.validations.allApprovedValidationOk;

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: preApplyOk,
          mode: 'dry-run',
          gradingMetadataColumnExists: gradingColumnProbe.exists,
          persistenceColumnsExist: persistenceColumnProbe.exists,
          liveRowCount: liveRows.length,
          approvedForBackfill: plan.approved.length,
          canonicalGrading2of2: report.canonicalGrading2of2,
          e2q26LegacyOk: plan.e2q26PreApplyOk,
          e2q26Rewrite: plan.e2q26Rewrite,
          mismatches: plan.mismatches.length,
          backupPath,
          reportPath,
          validations: report.validations,
        },
        null,
        2,
      ),
    );
    if (!preApplyOk) process.exit(1);
    return;
  }

  if (!preApplyOk) {
    console.error('Apply aborted: pre-apply validations failed. See report:', reportPath);
    process.exit(1);
  }

  console.error('Creating backup before writes…');
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

  if (!skipDdl) {
    if (!getDatabaseUrl()) {
      console.error(
        'Apply aborted: DATABASE_URL/DIRECT_URL/SUPABASE_DB_URL required for DDL. Run SQL files manually, then retry with --apply-skip-ddl.',
      );
      process.exit(1);
    }

    console.error('Executing grading_metadata DDL…');
    const gradingDdl = await executeSqlFile(DDL_GRADING_PATH);
    if (!gradingDdl.ok) {
      console.error('grading_metadata DDL failed:', gradingDdl.message || gradingDdl.reason);
      process.exit(1);
    }
    report.ddlGradingExecuted = true;

    console.error('Executing persistence V2 DDL…');
    const persistenceDdl = await executeSqlFile(DDL_PERSISTENCE_PATH);
    if (!persistenceDdl.ok) {
      console.error('persistence DDL failed:', persistenceDdl.message || persistenceDdl.reason);
      process.exit(1);
    }
    report.ddlPersistenceExecuted = true;
  } else {
    if (!gradingColumnProbe.exists) {
      console.error('Apply aborted (--apply-skip-ddl): grading_metadata column still missing.');
      process.exit(1);
    }
    if (!persistenceColumnProbe.exists) {
      console.error(
        'Apply aborted (--apply-skip-ddl): persistence columns (puntos_obtenidos, puntos_maximos, scoring_version) still missing.',
      );
      process.exit(1);
    }
  }

  const e2q26Item = getE2Q26MetadataItem(metadataDoc);
  if (!e2q26LiveRow || !e2q26Item) {
    console.error('Apply aborted: E2Q26 live row or metadata missing.');
    process.exit(1);
  }

  console.error('Rewriting Exam 2 Q26 (enunciado + open answer)…');
  const rewriteResult = await applyE2Q26Rewrite(admin, e2q26Item, e2q26LiveRow);
  report.e2q26RewriteApplied = rewriteResult;

  console.error('Backfilling grading_metadata on 18 rows…');
  let updated = 0;
  for (const row of plan.approved) {
    const { error } = await admin
      .from('levels_respuestas_abiertas')
      .update({ grading_metadata: row.gradingMetadata })
      .eq('id', row.rowId);

    if (error) {
      console.error(`Update failed for ${row.id} (${row.rowId}):`, error.message);
      process.exit(1);
    }
    updated += 1;
  }

  report.supabaseWrites = true;
  report.dmlExecuted = true;
  report.updatedRowCount = updated;

  console.error('Post-apply verification…');
  const postGradingProbe = await probeGradingMetadataColumn(admin);
  const postPersistenceProbe = await probePersistenceColumns(admin);
  const postLiveRows = await fetchLivePart4OpenRows(admin, {
    includeGradingMetadata: postGradingProbe.exists === true,
  });
  const postPlan = buildPlan(metadataDoc, postLiveRows, { allowE2Q26LegacyDrift: false });

  report.postApply = {
    gradingMetadataColumn: postGradingProbe,
    persistenceColumns: postPersistenceProbe,
    liveRowCount: postLiveRows.length,
    approvedForBackfill: postPlan.approved.length,
    canonicalGrading2of2: `${postPlan.canonical2of2Count}/${EXPECTED_LIVE_ROW_COUNT}`,
    mismatches: postPlan.mismatches,
    validations: {
      liveRowCountOk: postLiveRows.length === EXPECTED_LIVE_ROW_COUNT,
      allCanonical2of2: postPlan.canonical2of2Count === EXPECTED_LIVE_ROW_COUNT,
      mismatchCount: postPlan.mismatches.length,
      gradingMetadataPresent: postLiveRows.every((r) => r.gradingMetadataLive != null),
      persistenceColumnsOk: postPersistenceProbe.exists === true,
    },
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const postOk =
    report.postApply.validations.liveRowCountOk &&
    report.postApply.validations.allCanonical2of2 &&
    report.postApply.validations.mismatchCount === 0 &&
    report.postApply.validations.gradingMetadataPresent &&
    report.postApply.validations.persistenceColumnsOk;

  console.log(
    JSON.stringify(
      {
        ok: postOk,
        mode: 'apply',
        ddlGradingExecuted: report.ddlGradingExecuted,
        ddlPersistenceExecuted: report.ddlPersistenceExecuted,
        updated,
        e2q26RewriteApplied: true,
        postApply: report.postApply,
        backupPath,
        reportPath,
      },
      null,
      2,
    ),
  );

  if (!postOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
