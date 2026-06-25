/**
 * Sincroniza TODAS las funciones de ENGLISH_PROD → Supabase B.
 * Incluye: pg_trgm (public), funciones custom public + private, trigger auth.users.
 *
 * Uso:
 *   node scripts/assemble-prod-logic-parts.mjs   (si no hay export MCP)
 *   node scripts/build-prod-functions-sql.mjs
 *   node scripts/sync-prod-functions-to-dralo-b.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const B_REF = 'cmeruknhkcxveygeeuji';
const FUNCTIONS_FILE = path.join(ROOT, 'tmp', 'prod-functions.sql');
const AUTH_SYNC_FILE = path.join(ROOT, 'scripts/mcp-snapshots/private-auth-user-sync.sql');

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function buildBConnectionCandidates(env) {
  const candidates = [];
  if (env.SUPABASE_B_DATABASE_URL?.trim()) candidates.push(env.SUPABASE_B_DATABASE_URL.trim());
  const password = env.SUPABASE_B_DB_PASSWORD?.trim();
  if (password) {
    const enc = encodeURIComponent(password);
    candidates.push(
      `postgresql://postgres.${B_REF}:${enc}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres:${enc}@db.${B_REF}.supabase.co:5432/postgres`,
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

async function applyStatements(client, statements, label) {
  console.log(`${label}: ${statements.length} sentencias`);
  let applied = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i];
    await client.query('SAVEPOINT fn_sp');
    try {
      await client.query(stmt);
      await client.query('RELEASE SAVEPOINT fn_sp');
      applied += 1;
    } catch (err) {
      await client.query('ROLLBACK TO SAVEPOINT fn_sp');
      if (/already exists|duplicate key|duplicate_object/i.test(err.message)) {
        skipped += 1;
        continue;
      }
      throw new Error(`[${i + 1}/${statements.length}] ${err.message}\n${stmt.slice(0, 280)}…`);
    }
  }

  console.log(`${label}: OK (${applied} aplicadas, ${skipped} omitidas)`);
}

async function verify(client) {
  const { rows } = await client.query(`
    SELECT 'custom_public' AS kind, count(*)::int AS n
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d JOIN pg_extension e ON d.refobjid = e.oid
        WHERE d.objid = p.oid AND d.deptype = 'e'
      )
    UNION ALL
    SELECT 'pg_trgm_public', count(*)::int
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    JOIN pg_extension e ON e.oid = d.refobjid
    WHERE n.nspname = 'public' AND e.extname = 'pg_trgm'
    UNION ALL
    SELECT 'private_custom', count(*)::int
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private' AND p.prokind = 'f'
    UNION ALL
    SELECT 'auth_user_triggers', count(*)::int
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal
  `);
  return rows;
}

async function main() {
  const fromFile = process.argv.includes('--from-file')
    ? process.argv[process.argv.indexOf('--from-file') + 1]
    : FUNCTIONS_FILE;

  if (!fs.existsSync(fromFile)) {
    throw new Error(`No existe ${fromFile}. Ejecuta: node scripts/build-prod-functions-sql.mjs`);
  }

  const env = loadEnvLocal();
  const client = await connectPg(buildBConnectionCandidates(env), 'Supabase B');

  try {
    const functionsSql = fs.readFileSync(fromFile, 'utf8');
    const authSql = fs.readFileSync(AUTH_SYNC_FILE, 'utf8');

    console.log('Aplicando funciones en draloenglish-glitch…');

    const allStatements = splitStatements(functionsSql);
    const extensionStatements = allStatements.filter((s) =>
      /^CREATE EXTENSION/i.test(s.trim()),
    );
    const schemaStatements = allStatements.filter((s) =>
      /^CREATE SCHEMA/i.test(s.trim()),
    );
    const functionStatements = allStatements.filter(
      (s) => !/^CREATE EXTENSION/i.test(s.trim()) && !/^CREATE SCHEMA/i.test(s.trim()),
    );

    for (const stmt of [...extensionStatements, ...schemaStatements]) {
      await client.query(stmt);
    }
    console.log(`Preparación: ${extensionStatements.length + schemaStatements.length} extensiones/schemas OK`);

    await client.query('BEGIN');
    await applyStatements(client, functionStatements, 'Functions DDL');
    await applyStatements(client, splitStatements(authSql), 'Auth user sync');
    await client.query("NOTIFY pgrst, 'reload schema'");
    await client.query('COMMIT');

    const counts = await verify(client);
    console.log('\nConteos en Supabase B (PROD esperado: custom_public=9, pg_trgm_public=28, private_custom=1, auth_user_triggers=1):');
    counts.forEach((row) => console.log(`  ${row.kind}: ${row.n}`));

    const { rows: names } = await client.query(`
      SELECT n.nspname || '.' || p.proname AS fn
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.prokind = 'f'
        AND (
          (n.nspname = 'public' AND NOT EXISTS (
            SELECT 1 FROM pg_depend d JOIN pg_extension e ON d.refobjid = e.oid
            WHERE d.objid = p.oid AND d.deptype = 'e'
          ))
          OR n.nspname = 'private'
        )
      ORDER BY 1
    `);
    console.log('\nFunciones custom en B:');
    names.forEach((r) => console.log(`  ${r.fn}`));
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Fallo:', err.message || err);
  process.exit(1);
});
