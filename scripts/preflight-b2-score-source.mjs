/**
 * Read-only preflight before score_source migration.
 *   node --loader ./scripts/alias-loader.mjs scripts/preflight-b2-score-source.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';
import { parseUoePartDescripcion } from '../src/utils/levelsPuntuaciones.js';
import { LEVELS_SCORE_SOURCE, resolveLevelsScoreSource } from '../src/utils/levelsScoreSource.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, 'generated', 'backups');
const REVIEW_DIR = path.join(__dirname, 'generated', 'reviews');

const VALID_SOURCES = new Set([
  LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  LEVELS_SCORE_SOURCE.EXAM_MODE,
]);

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function extractScoreSource(row) {
  const meta = parseUoePartDescripcion(row.descripcion);
  if (meta?.scoreSource) {
    return { source: meta.scoreSource, origin: 'descripcion_meta', metaValid: true };
  }
  if (row.descripcion && String(row.descripcion).startsWith('uoe_meta:')) {
    return { source: LEVELS_SCORE_SOURCE.SKILL_PRACTICE, origin: 'uoe_meta_no_score_source', metaValid: false };
  }
  if (row.score_source) {
    return { source: row.score_source, origin: 'column', metaValid: null };
  }
  return { source: LEVELS_SCORE_SOURCE.SKILL_PRACTICE, origin: 'legacy_fallback', metaValid: false };
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env');
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  const { data: level, error: levelErr } = await admin
    .from('levels')
    .select('id')
    .ilike('nombre', 'b2')
    .single();
  if (levelErr || !level?.id) throw new Error('B2 level not found');

  const { data: examenes, error: examErr } = await admin
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', level.id);
  if (examErr) throw examErr;

  const b2ExamenIds = new Set((examenes || []).map((e) => e.id));

  const columnProbe = await admin.from('levels_puntuaciones').select('score_source').limit(1);
  const columnExists = !columnProbe.error;

  const selectCols = columnExists
    ? 'id, uuid_usuario, examen_id, parte_numero, descripcion, score_source, scoring_version, puntos_obtenidos, puntos_maximos, correctas, total_preguntas, created_at'
    : 'id, uuid_usuario, examen_id, parte_numero, descripcion, scoring_version, puntos_obtenidos, puntos_maximos, correctas, total_preguntas, created_at';

  const { data: allRows, error: rowsErr } = await admin
    .from('levels_puntuaciones')
    .select(selectCols)
    .not('examen_id', 'is', null)
    .not('parte_numero', 'is', null);
  if (rowsErr) throw rowsErr;

  const b2Rows = (allRows || []).filter((r) => b2ExamenIds.has(r.examen_id));
  const ruoeRows = b2Rows.filter((r) => r.parte_numero >= 1 && r.parte_numero <= 7);

  const counts = { skill_practice: 0, exam_mode: 0, unknown: 0, invalid: 0 };
  const byOrigin = {};
  const analyzed = [];
  const futureKeyMap = new Map();

  for (const row of ruoeRows) {
    const { source, origin, metaValid } = extractScoreSource(row);
    byOrigin[origin] = (byOrigin[origin] || 0) + 1;

    if (source === LEVELS_SCORE_SOURCE.SKILL_PRACTICE) counts.skill_practice += 1;
    else if (source === LEVELS_SCORE_SOURCE.EXAM_MODE) counts.exam_mode += 1;
    else if (!VALID_SOURCES.has(source)) counts.invalid += 1;
    else counts.unknown += 1;

    const resolved = resolveLevelsScoreSource(source);
    if (!VALID_SOURCES.has(resolved)) {
      counts.invalid += 1;
    }

    const futureKey = `${row.uuid_usuario}|${row.examen_id}|${row.parte_numero}|${resolved}`;
    if (!futureKeyMap.has(futureKey)) {
      futureKeyMap.set(futureKey, []);
    }
    futureKeyMap.get(futureKey).push({
      id: row.id,
      source: resolved,
      origin,
      created_at: row.created_at,
    });

    analyzed.push({
      id: row.id,
      uuid_usuario: row.uuid_usuario,
      examen_id: row.examen_id,
      parte_numero: row.parte_numero,
      resolvedScoreSource: resolved,
      origin,
      metaValid,
      scoring_version: row.scoring_version,
      hasColumnScoreSource: row.score_source != null,
    });
  }

  const collisions = [];
  for (const [key, entries] of futureKeyMap) {
    if (entries.length > 1) {
      collisions.push({ key, entries });
    }
  }

  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  const backupPath = path.join(BACKUP_DIR, `levels-puntuaciones-b2-preflight-${ts()}.json`);
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        backedUpAt: new Date().toISOString(),
        b2LevelId: level.id,
        b2ExamenCount: b2ExamenIds.size,
        ruoeRowCount: ruoeRows.length,
        rows: ruoeRows,
      },
      null,
      2,
    ),
    'utf8',
  );

  const report = {
    generatedAt: new Date().toISOString(),
    b2LevelId: level.id,
    b2ExamenIds: [...b2ExamenIds],
    totalB2Rows: b2Rows.length,
    ruoeRowsAnalyzed: ruoeRows.length,
    scoreSourceColumnExists: columnExists,
    counts,
    byOrigin,
    collisions,
    collisionCount: collisions.length,
    abort: collisions.length > 0 || counts.invalid > 0 || counts.unknown > 0,
    backupPath,
    sampleAnalyzed: analyzed.slice(0, 20),
  };

  const reportPath = path.join(REVIEW_DIR, `b2-score-source-preflight-${ts()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(
    JSON.stringify(
      {
        ok: !report.abort,
        counts,
        byOrigin,
        collisionCount: collisions.length,
        scoreSourceColumnExists: columnExists,
        backupPath,
        reportPath,
        collisions: collisions.slice(0, 5),
      },
      null,
      2,
    ),
  );

  if (report.abort) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
