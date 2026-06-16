/**
 * Phase 2D.1 — B2 Part 4 grading_metadata dry-run / apply.
 *
 * Dry-run (read-only Supabase + local artifacts):
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-part4-grading-metadata.mjs --dry-run
 *
 * Apply (requires explicit confirmation — NOT run in Phase 2D.1):
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-part4-grading-metadata.mjs --apply --confirm-apply-b2-part4-metadata
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';
import { validateB2KeyWordAnswerKey } from '../src/lib/validateB2KeyWordAnswerKey.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';
import { normalizeB2KeyWordAnswer } from '../src/lib/normalizeB2KeyWordAnswer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const METADATA_PATH = path.join(__dirname, 'data', 'b2-part4-approved-metadata.json');
const DDL_PATH = path.join(__dirname, 'sql', 'proposed-b2-part4-grading-metadata.sql');
const BACKUP_DIR = path.join(__dirname, 'generated', 'backups');
const REVIEW_DIR = path.join(__dirname, 'generated', 'reviews');

const B2_PART4_PARTE_ID = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d';
const EXAM_SLOTS = [1, 2, 3];
const E2Q26_LIVE_ROW_ID = 'edb32978-cfb9-4d9c-94c0-3fa2e89ae281';
const CONFIRM_FLAG = '--confirm-apply-b2-part4-metadata';

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const apply = argv.includes('--apply');
  const confirmed = argv.includes(CONFIRM_FLAG);
  if (dryRun && apply) {
    throw new Error('Use either --dry-run or --apply, not both.');
  }
  if (!dryRun && !apply) {
    throw new Error('Specify --dry-run or --apply.');
  }
  return { dryRun, apply, confirmed };
}

function loadApprovedMetadata() {
  const raw = readFileSync(METADATA_PATH, 'utf8');
  return JSON.parse(raw);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function extractCanonicalFromRow(respuestaTexto) {
  const text = String(respuestaTexto || '').trim();
  const m = text.match(/^(\d{1,2})\s+(.+)$/);
  return m ? m[2].trim() : text;
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
async function fetchLivePart4OpenRows(client) {
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
      .select('id, respuesta_texto, pregunta_id_abierta, created_at')
      .eq('pregunta_id_abierta', pregunta.id);

    if (ansErr) throw ansErr;

    for (const row of openAnswers || []) {
      const qMatch = String(row.respuesta_texto || '').trim().match(/^(\d{1,2})\s+/);
      const questionNumber = qMatch ? Number(qMatch[1]) : null;
      if (!questionNumber || questionNumber < 25) continue;
      rows.push({
        rowId: row.id,
        examSlot: slot,
        questionNumber,
        preguntaId: pregunta.id,
        examenId: examRow.id,
        respuestaTexto: row.respuesta_texto,
        canonicalAnswer: extractCanonicalFromRow(row.respuesta_texto),
      });
    }
  }

  rows.sort((a, b) => a.examSlot - b.examSlot || a.questionNumber - b.questionNumber);
  return rows;
}

function validateApprovedItem(item, liveByRowId) {
  const live = liveByRowId.get(item.supabase.openAnswerRowId);
  const issues = [];

  if (!live) {
    issues.push('live_row_not_found');
  } else {
    if (live.examSlot !== item.examSlot || live.questionNumber !== item.questionNumber) {
      issues.push('slot_or_question_mismatch');
    }
    const norms = new Set(item.fullAnswers.map((a) => normalizeB2KeyWordAnswer(a)));
    if (!norms.has(normalizeB2KeyWordAnswer(live.canonicalAnswer))) {
      issues.push('canonical_not_in_fullAnswers');
    }
    if (live.canonicalAnswer !== item.canonicalAnswer) {
      issues.push('canonical_answer_text_mismatch');
    }
  }

  const validation = validateB2KeyWordAnswerKey(item.gradingMetadata);
  if (!validation.valid) {
    issues.push('answer_key_validation_failed');
  }

  return {
    id: item.id,
    rowId: item.supabase.openAnswerRowId,
    classification: item.classification,
    includeInBackfill: item.includeInBackfill,
    validation,
    issues,
    ready: item.includeInBackfill && issues.length === 0 && validation.valid,
  };
}

function buildBackfillPlan(metadataDoc, liveRows) {
  const liveByRowId = new Map(liveRows.map((r) => [r.rowId, r]));
  const itemByRowId = new Map(metadataDoc.items.map((i) => [i.supabase.openAnswerRowId, i]));

  /** @type {Array<object>} */
  const approved = [];
  /** @type {Array<object>} */
  const excluded = [];
  /** @type {Array<object>} */
  const mismatches = [];

  for (const item of metadataDoc.items) {
    const result = validateApprovedItem(item, liveByRowId);
    if (item.classification === 'REWRITE_REQUIRED') {
      excluded.push({
        id: item.id,
        rowId: item.supabase.openAnswerRowId,
        reason: 'REWRITE_REQUIRED — live stays legacy until item rewrite',
      });
      continue;
    }
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
    }
  }

  for (const live of liveRows) {
    if (!itemByRowId.has(live.rowId)) {
      mismatches.push({ rowId: live.rowId, issue: 'live_row_missing_from_metadata' });
    }
  }

  const proposed = metadataDoc.proposedRewrites || [];
  const strictlyProposal = proposed.find((p) => p.keyword === 'STRICTLY' || p.id === 'E2Q26-PROPOSED');
  const strictlyInBackfill = approved.some(
    (r) => r.gradingMetadata?.keyword === 'STRICTLY' || r.id === 'E2Q26-PROPOSED',
  );

  return {
    approved,
    excluded,
    mismatches,
    strictlyProposal: strictlyProposal || null,
    strictlyInBackfill,
    e2q26Excluded: excluded.some((e) => e.id === 'E2Q26' && e.rowId === E2Q26_LIVE_ROW_ID),
  };
}

async function main() {
  const { dryRun, apply, confirmed } = parseArgs(process.argv.slice(2));

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
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.error(`${dryRun ? 'Dry-run' : 'Apply'}: reading Supabase (Part 4 open answers)…`);
  const columnProbe = await probeGradingMetadataColumn(admin);
  const liveRows = await fetchLivePart4OpenRows(admin);
  const plan = buildBackfillPlan(metadataDoc, liveRows);

  const ts = timestampSlug();
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  const backupPath = path.join(BACKUP_DIR, `b2-part4-grading-metadata-backup-${ts}.json`);
  const reportPath = path.join(REVIEW_DIR, `b2-part4-apply-dry-run-${ts}.json`);

  const backup = {
    backedUpAt: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply-pre-write',
    liveRowCount: liveRows.length,
    gradingMetadataColumnExists: columnProbe.exists,
    rows: liveRows.map((r) => ({
      rowId: r.rowId,
      examSlot: r.examSlot,
      questionNumber: r.questionNumber,
      preguntaId: r.preguntaId,
      examenId: r.examenId,
      respuestaTexto: r.respuestaTexto,
      canonicalAnswer: r.canonicalAnswer,
      grading_metadata: null,
    })),
  };

  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

  const report = {
    phase: '2D.1',
    mode: dryRun ? 'dry-run' : 'apply',
    generatedAt: new Date().toISOString(),
    supabaseWrites: false,
    ddlExecuted: false,
    dmlExecuted: false,
    metadataPath: METADATA_PATH,
    ddlPath: DDL_PATH,
    gradingMetadataColumn: columnProbe,
    liveRowCount: liveRows.length,
    expectedLiveRowCount: 18,
    approvedForBackfill: plan.approved.length,
    expectedApprovedForBackfill: 17,
    excludedCount: plan.excluded.length,
    e2q26Excluded: plan.e2q26Excluded,
    e2q26LiveRowId: E2Q26_LIVE_ROW_ID,
    strictlyProposalNotInBackfill: !plan.strictlyInBackfill,
    strictlyProposal: plan.strictlyProposal
      ? { id: plan.strictlyProposal.id, keyword: plan.strictlyProposal.keyword, includeInBackfill: false }
      : null,
    mismatches: plan.mismatches,
    excluded: plan.excluded,
    backfillRows: plan.approved.map(({ rowId, id, examSlot, questionNumber }) => ({
      id,
      rowId,
      examSlot,
      questionNumber,
    })),
    backupPath,
    reportPath,
    validations: {
      liveRowCountOk: liveRows.length === 18,
      approvedCountOk: plan.approved.length === 17,
      e2q26ExcludedOk: plan.e2q26Excluded,
      strictlyNotInBackfillOk: !plan.strictlyInBackfill,
      mismatchCount: plan.mismatches.length,
      allApprovedValidationOk: plan.approved.every((r) => validateB2KeyWordAnswerKey(r.gradingMetadata).valid),
    },
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if (apply) {
    console.error('Creating backup before writes…');
    writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');

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
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify({ ok: true, mode: 'apply', updated, backupPath, reportPath }, null, 2));
    return;
  }

  const ok =
    report.validations.liveRowCountOk &&
    report.validations.approvedCountOk &&
    report.validations.e2q26ExcludedOk &&
    report.validations.strictlyNotInBackfillOk &&
    report.validations.mismatchCount === 0 &&
    report.validations.allApprovedValidationOk;

  console.log(
    JSON.stringify(
      {
        ok,
        mode: 'dry-run',
        gradingMetadataColumnExists: columnProbe.exists,
        liveRowCount: liveRows.length,
        approvedForBackfill: plan.approved.length,
        excluded: plan.excluded.length,
        e2q26Excluded: plan.e2q26Excluded,
        strictlyNotInBackfill: !plan.strictlyInBackfill,
        mismatches: plan.mismatches.length,
        backupPath,
        reportPath,
        validations: report.validations,
      },
      null,
      2,
    ),
  );

  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
