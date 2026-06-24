/**
 * Aplica el schema exportado de ENGLISH_PROD en Supabase B (DRALO).
 * Requiere SUPABASE_B_DB_PASSWORD en .env.local (Dashboard → Database).
 *
 * Uso: node scripts/apply-dralo-b-schema.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const SCHEMA_FILE = path.join(ROOT, 'tmp', 'dralo-b-schema.sql');
const CONSTRAINTS_FILE = path.join(ROOT, 'tmp', 'dralo-b-constraints.sql');
const PROJECT_REF = 'cmeruknhkcxveygeeuji';

function loadEnvLocal() {
  const raw = fs.readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function buildConnectionCandidates(password) {
  const user = `postgres.${PROJECT_REF}`;
  return [
    `postgresql://${user}:${encodeURIComponent(password)}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://${user}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://${user}:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  ];
}

async function connectPg(env) {
  const errors = [];
  const directUrl = env.SUPABASE_B_DATABASE_URL?.trim();
  const candidates = [];
  if (directUrl) candidates.push(directUrl);
  const password = env.SUPABASE_B_DB_PASSWORD?.trim();
  if (password) candidates.push(...buildConnectionCandidates(password));

  for (const connectionString of candidates) {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      return client;
    } catch (err) {
      errors.push(`${connectionString.split('@')[1] || connectionString} → ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  throw new Error(`No se pudo conectar a Supabase B:\n${errors.join('\n')}`);
}

async function runSql(client, sql, label) {
  try {
    await client.query(sql);
    console.log(`  OK ${label}`);
  } catch (err) {
    if (/already exists|duplicate key/i.test(err.message)) {
      console.log(`  SKIP ${label} (${err.message.split('\n')[0]})`);
      return;
    }
    throw new Error(`${label}: ${err.message}`);
  }
}

async function main() {
  const env = loadEnvLocal();
  const password = env.SUPABASE_B_DB_PASSWORD?.trim();
  if (!password && !env.SUPABASE_B_DATABASE_URL?.trim()) {
    throw new Error('Falta SUPABASE_B_DB_PASSWORD o SUPABASE_B_DATABASE_URL en .env.local.');
  }
  if (!fs.existsSync(SCHEMA_FILE)) {
    throw new Error(`No existe ${SCHEMA_FILE}. Ejecuta antes: npm run supabase:export-dralo-schema`);
  }

  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const constraintsSql = fs.existsSync(CONSTRAINTS_FILE)
    ? fs.readFileSync(CONSTRAINTS_FILE, 'utf8')
    : '';
  const allSql = [schemaSql, constraintsSql].filter(Boolean).join('\n');
  const statements = allSql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Conectando a Supabase B (${PROJECT_REF})…`);
  const client = await connectPg(env);
  console.log(`Aplicando ${statements.length} sentencias SQL (tablas + constraints)…`);

  try {
    await client.query('BEGIN');
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.slice(0, 60).replace(/\s+/g, ' ');
      await runSql(client, `${stmt};`, `[${i + 1}/${statements.length}] ${preview}…`);
    }
    await client.query('NOTIFY pgrst, \'reload schema\'');
    await client.query('COMMIT');
    console.log('\nSchema aplicado en Supabase B.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\nFallo:', err.message);
  process.exit(1);
});
