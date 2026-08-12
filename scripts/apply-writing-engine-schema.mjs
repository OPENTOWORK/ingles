/**
 * Apply Writing Engine v3 schema to an approved non-production database.
 *
 * Safety:
 * - Refuses ENGLISH_PROD / NEXT_PUBLIC_SUPABASE_URL host by default.
 * - Defaults to SUPABASE_B_DATABASE_URL (draloenglish-glitch).
 *
 * Usage:
 *   node scripts/apply-writing-engine-schema.mjs
 */
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
import { loadEnvLocal } from './load-env-local.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQL_PATH = path.join(ROOT, 'scripts', 'sql', 'writing_engine_schema.sql');
const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';

const env = loadEnvLocal();
const databaseUrl =
  process.env.WRITING_ENGINE_APPLY_DATABASE_URL?.trim() ||
  env.WRITING_ENGINE_APPLY_DATABASE_URL?.trim() ||
  env.SUPABASE_B_DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error('No apply URL. Set SUPABASE_B_DATABASE_URL or WRITING_ENGINE_APPLY_DATABASE_URL.');
  process.exit(2);
}

if (databaseUrl.includes(PROD_REF) && process.env.ALLOW_PROD_WRITING_SCHEMA !== 'YES_I_MEAN_IT') {
  console.error(
    'Refusing to apply Writing v3 schema to ENGLISH_PROD without ALLOW_PROD_WRITING_SCHEMA=YES_I_MEAN_IT',
  );
  process.exit(2);
}

const sql = fs.readFileSync(SQL_PATH, 'utf8');
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  const before = await client.query(`
    select table_name from information_schema.tables
    where table_schema='public' and table_name like 'writing_%'
    order by 1
  `);
  console.log('Before:', before.rows.map((r) => r.table_name));
  await client.query(sql);
  const after = await client.query(`
    select table_name from information_schema.tables
    where table_schema='public' and table_name like 'writing_%'
    order by 1
  `);
  console.log('After:', after.rows.map((r) => r.table_name));
  console.log('Applied', SQL_PATH, 'successfully.');
} finally {
  await client.end();
}
