/**
 * Sincroniza functions, triggers, RLS y policies de ENGLISH_PROD → Supabase B (draloenglish-glitch).
 *
 * Uso:
 *   node scripts/sync-prod-db-logic-to-dralo-b.mjs --from-file tmp/prod-db-logic.sql
 *   node scripts/sync-prod-db-logic-to-dralo-b.mjs --pg-dump   (requiere PROD_DB_PASSWORD)
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const B_REF = 'cmeruknhkcxveygeeuji';
const DEFAULT_LOGIC_FILE = path.join(ROOT, 'tmp', 'prod-db-logic.sql');

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) return {};
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

function buildBConnectionCandidates(env) {
  const candidates = [];
  if (env.SUPABASE_B_DATABASE_URL?.trim()) candidates.push(env.SUPABASE_B_DATABASE_URL.trim());
  const password = env.SUPABASE_B_DB_PASSWORD?.trim();
  if (password) {
    const user = `postgres.${B_REF}`;
    const enc = encodeURIComponent(password);
    candidates.push(
      `postgresql://${user}:${enc}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
      `postgresql://${user}:${enc}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres:${enc}@db.${B_REF}.supabase.co:5432/postgres`,
    );
  }
  return candidates;
}

function buildProdConnectionCandidates(env) {
  const candidates = [];
  if (env.PROD_DATABASE_URL?.trim()) candidates.push(env.PROD_DATABASE_URL.trim());
  const password = env.PROD_DB_PASSWORD?.trim();
  if (password) {
    const enc = encodeURIComponent(password);
    candidates.push(
      `postgresql://postgres:${enc}@db.${PROD_REF}.supabase.co:5432/postgres`,
      `postgresql://postgres.${PROD_REF}:${enc}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`,
    );
  }
  return candidates;
}

async function connectPg(candidates, label) {
  const errors = [];
  for (const connectionString of candidates) {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      return client;
    } catch (err) {
      errors.push(`${connectionString.split('@')[1] || label} → ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  throw new Error(`No se pudo conectar a ${label}:\n${errors.join('\n')}`);
}

function findPgDump() {
  const candidates = [
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'pg_dump',
  ];
  for (const bin of candidates) {
    if (bin.includes('\\') && fs.existsSync(bin)) return bin;
    const which = spawnSync('where', [bin], { shell: true, encoding: 'utf8' });
    if (which.status === 0) return bin;
  }
  throw new Error('pg_dump no encontrado');
}

function extractLogicFromSchemaDump(rawSql) {
  const lines = rawSql.split(/\r?\n/);
  const kept = [];
  let inKeepBlock = false;
  let buffer = [];

  const flush = () => {
    if (buffer.length) kept.push(buffer.join('\n'));
    buffer = [];
    inKeepBlock = false;
  };

  const startsWanted = (line) =>
    /^(CREATE OR REPLACE FUNCTION|CREATE FUNCTION|CREATE TRIGGER|CREATE POLICY|ALTER TABLE .* ENABLE ROW LEVEL SECURITY|ALTER TABLE .* FORCE ROW LEVEL SECURITY|DROP POLICY IF EXISTS|DROP TRIGGER IF EXISTS|COMMENT ON POLICY)/i.test(
      line.trim(),
    );

  for (const line of lines) {
    const trimmed = line.trim();
    if (!inKeepBlock && startsWanted(trimmed)) {
      inKeepBlock = true;
      buffer = [line];
      if (trimmed.endsWith(';')) flush();
      continue;
    }
    if (inKeepBlock) {
      buffer.push(line);
      if (trimmed === ';' || trimmed.endsWith(';')) flush();
    }
  }
  flush();
  return kept.join('\n\n');
}

function dumpProdLogicWithPgDump(env, outFile) {
  const prodCandidates = buildProdConnectionCandidates(env);
  if (!prodCandidates.length) {
    throw new Error('Falta PROD_DB_PASSWORD o PROD_DATABASE_URL para pg_dump desde ENGLISH_PROD.');
  }
  const pgDump = findPgDump();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const tmpSchema = `${outFile}.schema.raw.sql`;

  let lastErr = '';
  for (const url of prodCandidates) {
    const result = spawnSync(
      pgDump,
      ['--dbname', url, '--schema-only', '--no-owner', '--no-privileges', '--schema=public', '-f', tmpSchema],
      { encoding: 'utf8' },
    );
    if (result.status === 0 && fs.existsSync(tmpSchema)) {
      const raw = fs.readFileSync(tmpSchema, 'utf8');
      const logic = [
        '-- Extensions required by functions/policies',
        'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;',
        'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;',
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;',
        '',
        extractLogicFromSchemaDump(raw),
      ].join('\n');
      fs.writeFileSync(outFile, logic);
      fs.unlinkSync(tmpSchema);
      return outFile;
    }
    lastErr = result.stderr || result.stdout || 'pg_dump failed';
  }
  throw new Error(`pg_dump desde PROD falló: ${lastErr}`);
}

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let dollarTag = null;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    current += ch;

    if (dollarTag === null && ch === '$') {
      const match = current.match(/\$([A-Za-z0-9_]*)\$$/);
      if (match) dollarTag = match[1];
    } else if (dollarTag !== null && ch === '$') {
      const match = current.match(new RegExp(`\\$${dollarTag}\\$$`));
      if (match) dollarTag = null;
    }

    if (ch === ';' && dollarTag === null) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) statements.push(stmt);
      current = '';
    }
  }

  const tail = current.trim();
  if (tail && !tail.startsWith('--')) statements.push(tail);
  return statements;
}

async function applyLogicSql(client, sql, label) {
  const statements = splitStatements(sql);
  console.log(`${label}: ${statements.length} sentencias`);
  let applied = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i];
    await client.query('SAVEPOINT logic_sp');
    try {
      await client.query(stmt);
      await client.query('RELEASE SAVEPOINT logic_sp');
      applied += 1;
    } catch (err) {
      await client.query('ROLLBACK TO SAVEPOINT logic_sp');
      if (
        /already exists|duplicate key|already enabled|does not exist|undefined table|undefined object/i.test(
          err.message,
        )
      ) {
        skipped += 1;
        continue;
      }
      throw new Error(`[${i + 1}/${statements.length}] ${err.message}\n${stmt.slice(0, 240)}…`);
    }
  }

  console.log(`${label}: OK (${applied} aplicadas, ${skipped} omitidas)`);
}

async function verifyCounts(client) {
  const { rows } = await client.query(`
    SELECT 'functions' AS kind, count(*)::int AS n
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d JOIN pg_extension e ON d.refobjid = e.oid
        WHERE d.objid = p.oid AND d.deptype = 'e'
      )
    UNION ALL
    SELECT 'triggers', count(*)::int
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
    UNION ALL
    SELECT 'policies', count(*)::int FROM pg_policies WHERE schemaname = 'public';
  `);
  return rows;
}

async function main() {
  const env = loadEnvLocal();
  const fromFile = process.argv.includes('--from-file')
    ? process.argv[process.argv.indexOf('--from-file') + 1]
    : DEFAULT_LOGIC_FILE;
  const usePgDump = process.argv.includes('--pg-dump');

  if (usePgDump) {
    console.log('Exportando logic DDL desde ENGLISH_PROD con pg_dump…');
    dumpProdLogicWithPgDump(env, fromFile);
    console.log('Export escrito en', fromFile);
  }

  if (!fs.existsSync(fromFile)) {
    throw new Error(`No existe ${fromFile}. Pasa --pg-dump o --from-file con el SQL exportado.`);
  }

  const logicSql = fs.readFileSync(fromFile, 'utf8');
  const bClient = await connectPg(buildBConnectionCandidates(env), 'Supabase B');

  try {
    console.log('Aplicando en draloenglish-glitch…');
    await bClient.query('BEGIN');
    await applyLogicSql(bClient, logicSql, 'Logic DDL');
    await bClient.query("NOTIFY pgrst, 'reload schema'");
    await bClient.query('COMMIT');

    const counts = await verifyCounts(bClient);
    console.log('Conteos en Supabase B:');
    counts.forEach((row) => console.log(`  ${row.kind}: ${row.n}`));
  } catch (err) {
    await bClient.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await bClient.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Fallo:', err.message || err);
  process.exit(1);
});
