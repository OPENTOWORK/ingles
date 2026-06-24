/**
 * Fetch ENGLISH_PROD schema via Supabase Management API and write escaped export files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'scripts', 'data');
const envFile = path.join(root, '.env.local');
const PROJECT_REF = 'qnazrzvwvkwhkfbqsbmr';

function loadAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  if (!fs.existsSync(envFile)) return '';
  const raw = fs.readFileSync(envFile, 'utf8');
  const m = raw.match(/^\s*SUPABASE_ACCESS_TOKEN\s*=\s*(.+)\s*$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

const EXPORT_DDL = `WITH cols AS (
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
) AS ddl FROM per_table;`;

const EXPORT_CONSTRAINTS = `SELECT string_agg(
  format('ALTER TABLE %s ADD CONSTRAINT %I %s;', conrelid::regclass, conname, pg_get_constraintdef(oid, true)),
  E'\\n' ORDER BY CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 ELSE 3 END, conrelid::regclass::text
) AS sql
FROM pg_constraint
WHERE contype IN ('p','f','u') AND connamespace = 'public'::regnamespace;`;

function toEscaped(s) {
  return JSON.stringify(s).slice(1, -1);
}

async function runQuery(token, query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  const row = Array.isArray(data) ? data[0] : data;
  return row?.ddl || row?.sql || null;
}

const token = loadAccessToken();
if (!token) {
  console.error('Falta SUPABASE_ACCESS_TOKEN en .env.local o entorno');
  process.exit(1);
}

const ddl = await runQuery(token, EXPORT_DDL);
const sql = await runQuery(token, EXPORT_CONSTRAINTS);
if (!ddl || !sql) throw new Error('Export vacío');

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'ddl-escaped.txt'), toEscaped(ddl));
fs.writeFileSync(path.join(dataDir, 'constraints-escaped.txt'), toEscaped(sql));

console.log(
  `ddl-escaped.txt: ${ddl.length} chars, ${(ddl.match(/CREATE TABLE/g) || []).length} tables`,
);
console.log(`constraints-escaped.txt: ${sql.length} chars`);
