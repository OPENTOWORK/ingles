/**
 * Copia variables de correo de .env.local (+ secrets) a Vercel (proyecto english-practice).
 * Uso: node scripts/sync-email-env-vercel.mjs
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

const PASS_FILE_SMTP = path.join(ROOT, 'secrets', 'support-smtp-pass.txt');
const SERVICE_ROLE_FILE = path.join(ROOT, 'secrets', 'supabase-service-role.txt');

const KEYS = [
  'RESEND_API_KEY',
  'RESEND_FORCE_SANDBOX_FROM',
  'RESEND_DEV_FALLBACK_TO',
  'RESEND_FROM_EMAIL',
  'SUPPORT_SMTP_USER',
  'SUPPORT_SMTP_PASS',
  'SUPPORT_SMTP_HOST',
  'SUPPORT_SMTP_PORT',
  'WEB3FORMS_ACCESS_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function addEnv(name, value, env = 'production') {
  const child = spawnSync(
    'npx',
    ['vercel@latest', 'env', 'add', name, env, '--force', '--yes'],
    {
      cwd: ROOT,
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    },
  );
  if (child.status === 0) {
    console.log(`OK  ${name} → ${env}`);
    return true;
  }
  const err = (child.stderr || child.stdout || '').trim();
  if (/already exists/i.test(err)) {
    console.log(`—   ${name} ya existe (usa vercel env rm si quieres cambiarla)`);
    return true;
  }
  console.error(`FAIL ${name}:`, err.slice(0, 200));
  return false;
}

const local = loadEnvLocal();
if (fs.existsSync(PASS_FILE_SMTP) && !local.SUPPORT_SMTP_PASS) {
  local.SUPPORT_SMTP_PASS = fs.readFileSync(PASS_FILE_SMTP, 'utf8').trim().replace(/\s+/g, '');
}
if (fs.existsSync(SERVICE_ROLE_FILE) && !local.SUPABASE_SERVICE_ROLE_KEY) {
  local.SUPABASE_SERVICE_ROLE_KEY = fs.readFileSync(SERVICE_ROLE_FILE, 'utf8').trim();
}

let n = 0;
for (const key of KEYS) {
  const val = local[key]?.trim();
  if (!val) continue;
  if (addEnv(key, val, 'production')) n += 1;
  addEnv(key, val, 'preview');
}

console.log(`\n${n} variable(s) sincronizadas. Redespliega en Vercel para aplicar.`);
