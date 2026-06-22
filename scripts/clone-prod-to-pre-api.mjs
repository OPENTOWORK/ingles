/**
 * Copia esquema (pg_dump) + datos de ENGLISH_PROD → ENGLISH_PRE.
 * PROD: solo lectura. Requiere contraseña Postgres de cada proyecto.
 *
 * Variables (.env.local o entorno):
 *   SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL  → PROD
 *   SUPABASE_PRE_URL=https://ieprzxzrtfneuzsnzoes.supabase.co
 *   SUPABASE_PRE_SERVICE_ROLE_KEY=sb_secret_...
 *   PROD_DB_PASSWORD=...
 *   PRE_DB_PASSWORD=...
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const PRE_REF = 'ieprzxzrtfneuzsnzoes';
const prodDbPassword = process.env.PROD_DB_PASSWORD;
const preDbPassword = process.env.PRE_DB_PASSWORD;

if (!prodDbPassword || !preDbPassword) {
  console.error(
    'Faltan PROD_DB_PASSWORD y/o PRE_DB_PASSWORD (Dashboard → Project Settings → Database).',
  );
  console.error('La service role / sb_secret no sustituye a la contraseña de Postgres para pg_dump.');
  process.exit(1);
}

const pgBin = 'C:\\Program Files\\PostgreSQL\\17\\bin';
const pgDump = path.join(pgBin, 'pg_dump.exe');
const psql = path.join(pgBin, 'psql.exe');

if (!fs.existsSync(pgDump)) {
  console.error('No se encontró pg_dump en', pgDump);
  process.exit(1);
}

const enc = (s) => encodeURIComponent(s);
const prodUrl = `postgresql://postgres:${enc(prodDbPassword)}@db.${PROD_REF}.supabase.co:5432/postgres`;
const preUrl = `postgresql://postgres:${enc(preDbPassword)}@db.${PRE_REF}.supabase.co:5432/postgres`;

const backupDir = path.join(
  root,
  'backups',
  `prod-to-pre-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
);
fs.mkdirSync(backupDir, { recursive: true });

const files = {
  roles: path.join(backupDir, 'roles.sql'),
  schema: path.join(backupDir, 'schema.sql'),
  data: path.join(backupDir, 'data.sql'),
  historySchema: path.join(backupDir, 'history_schema.sql'),
  historyData: path.join(backupDir, 'history_data.sql'),
};

function run(cmd, args, label) {
  console.log(`\n==> ${label}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (res.status !== 0) {
    console.error(`Falló: ${label}`);
    process.exit(res.status || 1);
  }
}

run(pgDump, ['--dbname', prodUrl, '-f', files.roles, '--role-only'], 'Dump roles (PROD)');
run(pgDump, ['--dbname', prodUrl, '-f', files.schema], 'Dump schema (PROD)');
run(
  pgDump,
  [
    '--dbname',
    prodUrl,
    '-f',
    files.data,
    '--use-copy',
    '--data-only',
    '-x',
    'storage.buckets_vectors',
    '-x',
    'storage.vector_indexes',
  ],
  'Dump data (PROD)',
);
run(
  pgDump,
  ['--dbname', prodUrl, '-f', files.historySchema, '--schema', 'supabase_migrations'],
  'Dump migration history schema (PROD)',
);
run(
  pgDump,
  [
    '--dbname',
    prodUrl,
    '-f',
    files.historyData,
    '--use-copy',
    '--data-only',
    '--schema',
    'supabase_migrations',
  ],
  'Dump migration history data (PROD)',
);

run(
  psql,
  [
    '--single-transaction',
    '--variable',
    'ON_ERROR_STOP=1',
    '--file',
    files.roles,
    '--file',
    files.schema,
    '--command',
    'SET session_replication_role = replica',
    '--file',
    files.data,
    '--dbname',
    preUrl,
  ],
  'Restore into PRE',
);

run(
  psql,
  [
    '--single-transaction',
    '--variable',
    'ON_ERROR_STOP=1',
    '--file',
    files.historySchema,
    '--file',
    files.historyData,
    '--dbname',
    preUrl,
  ],
  'Restore migration history into PRE',
);

console.log('\nOK: backup guardado en', backupDir);
console.log('OK: ENGLISH_PRE clonado desde ENGLISH_PROD (PROD no modificado).');
