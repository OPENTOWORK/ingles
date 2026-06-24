/**
 * Importa auth.users + auth.identities en Supabase B desde tmp/auth-export.json
 * Generar export: node scripts/materialize-auth-export.mjs
 *
 * Uso: node scripts/duplicate-auth-to-dralo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportFile = path.join(root, 'tmp', 'auth-export.json');

const USER_COLS = [
  'instance_id', 'id', 'aud', 'role', 'email', 'encrypted_password',
  'email_confirmed_at', 'invited_at', 'confirmation_token', 'confirmation_sent_at',
  'recovery_token', 'recovery_sent_at', 'email_change_token_new', 'email_change',
  'email_change_sent_at', 'last_sign_in_at', 'raw_app_meta_data', 'raw_user_meta_data',
  'is_super_admin', 'created_at', 'updated_at', 'phone', 'phone_confirmed_at',
  'phone_change', 'phone_change_token', 'phone_change_sent_at',
  'email_change_token_current', 'email_change_confirm_status', 'banned_until',
  'reauthentication_token', 'reauthentication_sent_at', 'is_sso_user', 'deleted_at',
  'is_anonymous',
];

const IDENTITY_COLS = [
  'provider_id', 'user_id', 'identity_data', 'provider', 'last_sign_in_at',
  'created_at', 'updated_at', 'id',
];

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) {
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[t.slice(0, i)] = v;
    }
  }
  return env;
}

async function connect(env) {
  const url = env.SUPABASE_B_DATABASE_URL;
  if (!url) throw new Error('Falta SUPABASE_B_DATABASE_URL');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

function buildUpsert(table, cols, conflictCol) {
  const colList = cols.join(', ');
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const updates = cols
    .filter((c) => c !== conflictCol)
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');
  return `INSERT INTO ${table} (${colList}) VALUES (${placeholders})
    ON CONFLICT (${conflictCol}) DO UPDATE SET ${updates}`;
}

async function importRows(client, table, cols, conflictCol, rows, label) {
  if (!rows.length) {
    console.log(`${label}: 0 filas`);
    return;
  }
  const sql = buildUpsert(table, cols, conflictCol);
  let ok = 0;
  for (const row of rows) {
    const values = cols.map((c) => {
      const v = row[c];
      if (c === 'raw_app_meta_data' || c === 'raw_user_meta_data' || c === 'identity_data') {
        return v ?? null;
      }
      return v ?? null;
    });
    try {
      await client.query(sql, values);
      ok += 1;
    } catch (err) {
      throw new Error(`${label} ${row.id || row.email}: ${err.message}`);
    }
  }
  console.log(`${label}: ${ok}/${rows.length} importadas`);
}

async function main() {
  if (!fs.existsSync(exportFile)) {
    throw new Error(`Falta ${exportFile}. Ejecuta: node scripts/materialize-auth-export.mjs`);
  }
  const { users, identities } = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  const env = loadEnv();
  const client = await connect(env);

  try {
    await client.query("SET session_replication_role = 'replica'");
    await importRows(client, 'auth.users', USER_COLS, 'id', users, 'auth.users');
    await importRows(client, 'auth.identities', IDENTITY_COLS, 'id', identities, 'auth.identities');
    await client.query("SET session_replication_role = 'origin'");
    const { rows } = await client.query('SELECT count(*)::int AS n FROM auth.users');
    console.log(`Verificación B: ${rows[0].n} usuarios en auth.users`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Fallo:', err.message);
  process.exit(1);
});
