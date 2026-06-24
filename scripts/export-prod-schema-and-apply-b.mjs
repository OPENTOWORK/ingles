/**
 * Exporta schema public de ENGLISH_PROD y lo aplica en Supabase B.
 * Usa pooler aws-1 (eu-central-1 para B, eu-north-1 para prod).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const B_URL = env.SUPABASE_B_DATABASE_URL;
const SCHEMA_FILE = path.join(root, 'tmp', 'dralo-b-schema.sql');

const EXPORT_DDL = `
WITH cols AS (
  SELECT c.table_name, c.ordinal_position,
    format('%I %s%s%s', c.column_name,
      CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name WHEN c.data_type = 'ARRAY' THEN c.udt_name
        WHEN c.data_type = 'character varying' THEN CASE WHEN c.character_maximum_length IS NOT NULL THEN 'varchar('||c.character_maximum_length||')' ELSE 'varchar' END
        WHEN c.data_type = 'timestamp without time zone' THEN 'timestamp'
        WHEN c.data_type = 'timestamp with time zone' THEN 'timestamptz'
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL THEN 'numeric('||c.numeric_precision||','||coalesce(c.numeric_scale,0)||')'
        ELSE c.udt_name END,
      CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
      CASE WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default ELSE '' END
    ) AS coldef
  FROM information_schema.columns c WHERE c.table_schema = 'public'
), per_table AS (
  SELECT table_name, string_agg(coldef, E',\\n  ' ORDER BY ordinal_position) AS coldefs
  FROM cols GROUP BY table_name
)
SELECT string_agg(
  'CREATE TABLE IF NOT EXISTS public.' || quote_ident(table_name) || E' (\\n  ' || coldefs || E'\\n);',
  E'\\n\\n' ORDER BY table_name
) AS ddl FROM per_table;
`;

const EXPORT_CONSTRAINTS = `
SELECT string_agg(
  format('ALTER TABLE %s ADD CONSTRAINT %I %s;', conrelid::regclass, conname, pg_get_constraintdef(oid, true)),
  E'\\n' ORDER BY CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 ELSE 3 END, conrelid::regclass::text
) AS sql
FROM pg_constraint
WHERE contype IN ('p','f','u') AND connamespace = 'public'::regnamespace;
`;

async function connect(url) {
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

async function runStatements(client, sql, label) {
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  console.log(`${label}: ${statements.length} sentencias`);
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.query(`${statements[i]};`);
    } catch (err) {
      if (/already exists|duplicate key/i.test(err.message)) continue;
      throw new Error(`${label} [${i + 1}]: ${err.message}`);
    }
  }
}

async function main() {
  if (!B_URL) throw new Error('Falta SUPABASE_B_DATABASE_URL');
  if (!fs.existsSync(SCHEMA_FILE)) {
    throw new Error(`Falta ${SCHEMA_FILE}. Ejecuta primero: node scripts/materialize-dralo-schema.mjs`);
  }

  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const constraintsFile = path.join(root, 'tmp', 'dralo-b-constraints.sql');
  const constraintsSql = fs.existsSync(constraintsFile) ? fs.readFileSync(constraintsFile, 'utf8') : '';

  console.log('Conectando a Supabase B…');
  const b = await connect(B_URL);
  try {
    await b.query('BEGIN');
    await runStatements(b, schemaSql, 'Tablas');
    if (constraintsSql.trim()) {
      await runStatements(b, constraintsSql, 'Constraints');
    }
    await b.query("NOTIFY pgrst, 'reload schema'");
    await b.query('COMMIT');
    console.log('Schema aplicado en Supabase B.');
  } catch (err) {
    await b.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await b.end();
  }
}

main().catch((e) => {
  console.error('Fallo:', e.message);
  process.exit(1);
});
