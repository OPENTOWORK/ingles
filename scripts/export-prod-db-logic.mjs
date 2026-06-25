/**
 * Exporta functions, triggers, RLS y policies desde ENGLISH_PROD a tmp/prod-db-logic.sql
 * Requiere PROD_DB_PASSWORD o PROD_DATABASE_URL en .env.local
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const OUT_FILE = path.join(ROOT, 'tmp', 'prod-db-logic.sql');
const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';

function loadEnvLocal() {
  const raw = fs.readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, idx).trim()] = value;
  }
  return env;
}

function buildProdCandidates(env) {
  const candidates = [];
  if (env.PROD_DATABASE_URL?.trim()) candidates.push(env.PROD_DATABASE_URL.trim());
  const password = env.PROD_DB_PASSWORD?.trim();
  if (password) {
    const enc = encodeURIComponent(password);
    candidates.push(`postgresql://postgres:${enc}@db.${PROD_REF}.supabase.co:5432/postgres`);
    candidates.push(
      `postgresql://postgres.${PROD_REF}:${enc}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`,
    );
    candidates.push(
      `postgresql://postgres.${PROD_REF}:${enc}@aws-1-eu-north-1.pooler.supabase.com:6543/postgres`,
    );
  }
  return candidates;
}

async function connectPg(candidates) {
  const errors = [];
  for (const connectionString of candidates) {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      return client;
    } catch (err) {
      errors.push(`${connectionString.split('@')[1] || 'url'} → ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  throw new Error(`No se pudo conectar a ENGLISH_PROD:\n${errors.join('\n')}`);
}

async function fetchOne(client, query) {
  const { rows } = await client.query(query);
  return rows[0]?.sql || '';
}

const POLICY_EXPORT_SQL = `
SELECT string_agg(stmt, E'\\n\\n' ORDER BY tablename, policyname) AS sql
FROM (
  SELECT tablename, policyname,
    format(
      E'DROP POLICY IF EXISTS %I ON %I.%I;\\nCREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s;',
      policyname, schemaname, tablename,
      policyname, schemaname, tablename,
      permissive, cmd,
      CASE
        WHEN roles = '{public}' THEN 'PUBLIC'
        ELSE array_to_string(ARRAY(SELECT quote_ident(r::text) FROM unnest(roles) r), ', ')
      END,
      CASE WHEN qual IS NOT NULL THEN E'\\n  USING (' || qual || ')' ELSE '' END,
      CASE WHEN with_check IS NOT NULL THEN E'\\n  WITH CHECK (' || with_check || ')' ELSE '' END
    ) AS stmt
  FROM pg_policies
  WHERE schemaname = 'public'
) s;
`;

async function main() {
  const env = loadEnvLocal();
  const candidates = buildProdCandidates(env);
  if (!candidates.length) {
    throw new Error('Añade PROD_DB_PASSWORD o PROD_DATABASE_URL en .env.local');
  }

  const client = await connectPg(candidates);
  try {
    console.log('Exportando desde ENGLISH_PROD…');
    const extensions = [
      'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;',
      'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;',
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;',
    ].join('\n');

    const functions = await fetchOne(
      client,
      `SELECT string_agg(pg_get_functiondef(p.oid), E'\\n\\n' ORDER BY p.proname) AS sql
       FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname = 'public' AND p.prokind = 'f'
       AND NOT EXISTS (
         SELECT 1 FROM pg_depend d JOIN pg_extension e ON d.refobjid = e.oid
         WHERE d.objid = p.oid AND d.deptype = 'e'
       );`,
    );

    const triggers = await fetchOne(
      client,
      `SELECT string_agg(pg_get_triggerdef(t.oid, true), E'\\n\\n' ORDER BY c.relname, t.tgname) AS sql
       FROM pg_trigger t
       JOIN pg_class c ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND NOT t.tgisinternal;`,
    );

    const rls = await fetchOne(
      client,
      `SELECT string_agg(format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', schemaname, tablename), E'\\n' ORDER BY tablename) AS sql
       FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;`,
    );

    const policies = await fetchOne(client, POLICY_EXPORT_SQL);

    const sql = [
      '-- Exported from ENGLISH_PROD',
      extensions,
      '',
      '-- Functions',
      functions,
      '',
      '-- RLS',
      rls,
      '',
      '-- Policies',
      policies,
      '',
      '-- Triggers',
      triggers,
      '',
    ].join('\n');

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, sql);
    console.log('Escrito', OUT_FILE, `(${sql.length} chars)`);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
