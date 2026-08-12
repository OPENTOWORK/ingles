/**
 * R5 verification harness for Writing Engine v3 schema.
 *
 * Refuses ENGLISH_PROD unless ALLOW_PROD_WRITING_SCHEMA=YES_I_MEAN_IT.
 * Defaults to SUPABASE_B / WRITING_ENGINE_VERIFY_DATABASE_URL.
 *
 * Exit codes:
 *   0 — verified
 *   2 — no approved database URL / connection failed (R5 remains OPEN)
 *   3 — schema/RLS/integrity failure
 */
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
import { loadEnvLocal } from './load-env-local.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const REQUIRED_TABLES = [
  'writing_submissions',
  'writing_engine_executions',
  'writing_task_analyses',
  'writing_observations',
  'writing_assessments',
  'writing_assessment_criteria',
  'writing_feedback_payloads',
  'writing_validation_results',
];

loadEnvLocal();
const databaseUrl =
  process.env.WRITING_ENGINE_VERIFY_DATABASE_URL?.trim() ||
  process.env.WRITING_ENGINE_APPLY_DATABASE_URL?.trim() ||
  process.env.SUPABASE_B_DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(
    JSON.stringify({
      r5: 'OPEN',
      reason: 'no_database_url',
      detail:
        'Set SUPABASE_B_DATABASE_URL or WRITING_ENGINE_VERIFY_DATABASE_URL to a disposable/staging DB.',
    }),
  );
  process.exit(2);
}

if (databaseUrl.includes(PROD_REF) && process.env.ALLOW_PROD_WRITING_SCHEMA !== 'YES_I_MEAN_IT') {
  console.error(
    JSON.stringify({
      r5: 'OPEN',
      reason: 'refusing_production',
      detail: 'Only ENGLISH_PROD is healthy; migration must not auto-apply. Approve explicitly.',
    }),
  );
  process.exit(2);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
} catch (err) {
  console.error(
    JSON.stringify({
      r5: 'OPEN',
      reason: 'connection_failed',
      detail: err.message,
    }),
  );
  process.exit(2);
}

const report = { r5: 'OPEN', checks: {} };

try {
  const tables = await client.query(`
    select table_name from information_schema.tables
    where table_schema='public' and table_name = any($1::text[])
    order by 1
  `, [REQUIRED_TABLES]);
  const found = tables.rows.map((r) => r.table_name);
  report.checks.tables = {
    expected: REQUIRED_TABLES,
    found,
    ok: REQUIRED_TABLES.every((t) => found.includes(t)),
  };
  if (!report.checks.tables.ok) {
    report.reason = 'schema_missing';
    console.error(JSON.stringify(report, null, 2));
    process.exit(3);
  }

  const rls = await client.query(`
    select c.relname as table_name, c.relrowsecurity as rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = any($1::text[])
  `, [REQUIRED_TABLES]);
  report.checks.rls_enabled = {
    ok: rls.rows.every((r) => r.rls === true),
    rows: rls.rows,
  };

  // Integrity: incomplete must not store fake 0/20
  let integrityOk = true;
  const messages = [];
  try {
    await client.query('begin');
    await client.query(`
      insert into writing_assessments (
        execution_id, status, incomplete_reason, raw_total, max_total,
        single_task_scale_claim_allowed, word_count_penalty_applied, calibration_status,
        assessment_record, provenance, engine_version, schema_version,
        cambridge_assessment_version, assessment_prompt_version
      ) values (
        gen_random_uuid(), 'incomplete', 'test', 0, 20,
        false, false, 'not_calibrated',
        '{}'::jsonb, '{}'::jsonb, '3.0.0', '1.0.0', '1.0.0', '1.0.0'
      )
    `);
    integrityOk = false;
    messages.push('incomplete with raw_total=0 was accepted (should fail)');
    await client.query('rollback');
  } catch {
    messages.push('incomplete with raw_total rejected (ok)');
    await client.query('rollback');
  }

  report.checks.integrity_smoke = { ok: integrityOk, messages };
  report.r5 = report.checks.rls_enabled.ok && integrityOk ? 'CLOSED' : 'OPEN';
  if (report.r5 !== 'CLOSED') report.reason = 'checks_failed';

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.r5 === 'CLOSED' ? 0 : 3);
} finally {
  await client.end();
}
