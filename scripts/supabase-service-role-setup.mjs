/**
 * Guarda SUPABASE_SERVICE_ROLE_KEY para crear usuarios admin y scripts de importación.
 * Uso: npm run supabase:service-role-setup
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SECRETS_DIR = path.join(ROOT, 'secrets');
const KEY_FILE = path.join(SECRETS_DIR, 'supabase-service-role.txt');
const ENV_FILE = path.join(ROOT, '.env.local');
const PROJECT_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DASHBOARD =
  'https://supabase.com/dashboard/project/qnazrzvwvkwhkfbqsbmr/settings/api';

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function decodeJwtPayload(token) {
  const part = token.split('.')[1];
  if (!part) return null;
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

function looksLikeServiceRoleKey(key) {
  if (!key.startsWith('eyJ') || key.split('.').length !== 3) return false;
  try {
    return decodeJwtPayload(key)?.role === 'service_role';
  } catch {
    return false;
  }
}

function upsertEnvLocal(key) {
  const line = `SUPABASE_SERVICE_ROLE_KEY=${key}`;
  let content = '';
  if (fs.existsSync(ENV_FILE)) {
    content = fs.readFileSync(ENV_FILE, 'utf8');
    const re = /^\s*SUPABASE_SERVICE_ROLE_KEY\s*=.*$/m;
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  } else {
    content = `${line}\n`;
  }
  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

const env = { ...loadEnvLocal(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || PROJECT_URL;

console.log('\nConfiguración de Supabase service_role');
console.log('Proyecto:', supabaseUrl);
console.log('\n1) Abre:', DASHBOARD);
console.log('2) Copia la clave «service_role» (secret), NO la «anon».');
console.log('3) Pégala aquí.\n');

let key = await ask('service_role key: ');
key = key.trim();
if (!key) {
  console.error('No se introdujo clave.');
  process.exit(1);
}

if (!looksLikeServiceRoleKey(key)) {
  console.error('La clave no parece service_role (revisa que no sea la anon).');
  process.exit(1);
}

const admin = createClient(supabaseUrl, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
if (error) {
  console.error('Supabase rechazó la clave:', error.message);
  process.exit(1);
}

fs.mkdirSync(SECRETS_DIR, { recursive: true });
fs.writeFileSync(KEY_FILE, key, 'utf8');
upsertEnvLocal(key);

console.log('\nOK — Guardada en secrets/supabase-service-role.txt y .env.local');
console.log('Reinicia npm run dev si el panel admin sigue mostrando el aviso.\n');
