/**
 * Apply score_source migration (requires preflight green).
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-score-source.mjs --dry-run
 *   node --loader ./scripts/alias-loader.mjs scripts/apply-b2-score-source.mjs --apply --confirm-apply-score-source
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.join(__dirname, 'sql', 'b2-scoring-v2-score-source.sql');
const BACKUP_DIR = path.join(__dirname, 'generated', 'backups');
const REVIEW_DIR = path.join(__dirname, 'generated', 'reviews');

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.SUPABASE_DB_URL || null;
}

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const apply = argv.includes('--apply');
  const confirmed = argv.includes('--confirm-apply-score-source');
  if (dryRun && apply) throw new Error('Use --dry-run or --apply, not both.');
  if (!dryRun && !apply) throw new Error('Specify --dry-run or --apply.');
  if (apply && !confirmed) {
    console.error('Apply requires --confirm-apply-score-source');
    process.exit(1);
  }
  return { dryRun, apply };
}

async function probeSchema(admin) {
  const col = await admin.from('levels_puntuaciones').select('score_source').limit(1);
  return {
    scoreSourceColumnExists: !col.error,
  };
}

async function main() {
  const { dryRun, apply } = parseArgs(process.argv.slice(2));
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = getDatabaseUrl();
  if (!url || !key) {
    console.error('Missing Supabase env');
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const before = await probeSchema(admin);

  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  const { data: snapshot } = await admin
    .from('levels_puntuaciones')
    .select('id, uuid_usuario, examen_id, parte_numero, descripcion, scoring_version, created_at')
    .not('examen_id', 'is', null)
    .not('parte_numero', 'is', null);

  const backupPath = path.join(BACKUP_DIR, `levels-puntuaciones-pre-score-source-${ts()}.json`);
  writeFileSync(
    backupPath,
    JSON.stringify({ backedUpAt: new Date().toISOString(), rowCount: snapshot?.length ?? 0, rows: snapshot }, null, 2),
    'utf8',
  );

  const report = {
    mode: dryRun ? 'dry-run' : 'apply',
    generatedAt: new Date().toISOString(),
    before,
    backupPath,
    sqlPath: SQL_PATH,
    databaseUrlAvailable: Boolean(dbUrl),
    applied: false,
  };

  if (dryRun) {
    report.note = before.scoreSourceColumnExists
      ? 'score_source column already exists — migration may be partially applied'
      : 'Ready to apply score_source migration';
    const reportPath = path.join(REVIEW_DIR, `b2-score-source-apply-dry-run-${ts()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify({ ok: true, ...report, reportPath }, null, 2));
    return;
  }

  if (!dbUrl) {
    console.error('Apply aborted: DATABASE_URL/DIRECT_URL/SUPABASE_DB_URL required for DDL.');
    process.exit(1);
  }

  const sql = readFileSync(SQL_PATH, 'utf8');
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    report.applied = true;
  } finally {
    await client.end();
  }

  const afterCol = await admin.from('levels_puntuaciones').select('score_source').limit(1);
  report.after = { scoreSourceColumnExists: !afterCol.error };

  const reportPath = path.join(REVIEW_DIR, `b2-score-source-apply-${ts()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: true, applied: true, backupPath, reportPath, after: report.after }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
