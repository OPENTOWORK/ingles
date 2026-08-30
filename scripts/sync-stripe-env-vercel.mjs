/**
 * Sincroniza STRIPE_PRICE_* y STRIPE_PORTAL_CONFIGURATION_ID de .env.local a Vercel.
 * Uso: npm run stripe:sync-vercel
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

const KEYS = [
  'STRIPE_PRICE_PREMIUM_MONTHLY',
  'STRIPE_PRICE_PREMIUM_YEARLY',
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_YEARLY',
  'STRIPE_PORTAL_CONFIGURATION_ID',
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
  console.error(`FAIL ${name}:`, err.slice(0, 300));
  return false;
}

const local = loadEnvLocal();
const stripeKey = local.STRIPE_SECRET_KEY?.trim() || '';
if (stripeKey.startsWith('sk_test_')) {
  console.error(
    'ABORTADO: .env.local usa STRIPE_SECRET_KEY de TEST (sk_test_).\n' +
      'Para producción, pon temporalmente la clave LIVE (sk_live_) en .env.local,\n' +
      'ejecuta npm run stripe:setup y luego npm run stripe:sync-vercel.',
  );
  process.exit(1);
}

let ok = 0;
for (const key of KEYS) {
  const val = local[key]?.trim();
  if (!val) {
    console.log(`—   ${key} no está en .env.local`);
    continue;
  }
  if (addEnv(key, val, 'production')) ok += 1;
}

console.log(`\n${ok} variable(s) sincronizadas con Vercel production.`);
