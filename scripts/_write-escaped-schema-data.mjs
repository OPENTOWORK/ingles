/**
 * One-off: fetch ENGLISH_PROD schema via pg and write scripts/data/*-escaped.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'scripts', 'data');
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const pass = encodeURIComponent(env.SUPABASE_B_DB_PASSWORD || '');
const prodRef = 'qnazrzvwvkwhkfbqsbmr';
const url = `postgresql://postgres.${prodRef}:${pass}@aws-1-eu-north-1.pooler.supabase.com:6543/postgres`;

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

function toEscaped(s) {
  return JSON.stringify(s).slice(1, -1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  const ddlRes = await client.query(EXPORT_DDL);
  const conRes = await client.query(EXPORT_CONSTRAINTS);
  const ddl = ddlRes.rows[0]?.ddl;
  const sql = conRes.rows[0]?.sql;
  if (!ddl || !sql) throw new Error('Empty export from prod');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'ddl-escaped.txt'), toEscaped(ddl));
  fs.writeFileSync(path.join(dataDir, 'constraints-escaped.txt'), toEscaped(sql));

  const tableCount = (ddl.match(/CREATE TABLE/g) || []).length;
  console.log(`ddl: ${ddl.length} chars, ${tableCount} tables`);
  console.log(`constraints: ${sql.length} chars, ends with usuario_sesiones_app_user_id_fkey: ${sql.includes('usuario_sesiones_app_user_id_fkey')}`);
} finally {
  await client.end();
}
