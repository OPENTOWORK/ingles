/**
 * Utilidades compartidas para sincronizar variables Stripe → Vercel.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const ENV_FILE = path.join(ROOT, '.env.local');

export const STRIPE_VERCEL_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_PREMIUM_MONTHLY',
  'STRIPE_PRICE_PREMIUM_YEARLY',
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_YEARLY',
  'STRIPE_PORTAL_CONFIGURATION_ID',
  'NEXT_PUBLIC_SITE_URL',
];

export function loadEnvLocal() {
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

export function upsertEnvLocalLine(key, value) {
  if (!fs.existsSync(ENV_FILE)) return;
  const current = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);
  let found = false;
  const next = current.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) {
    next.push(`${key}=${value}`);
  }
  fs.writeFileSync(ENV_FILE, `${next.join('\n').replace(/\n*$/, '')}\n`, 'utf8');
}

export function addVercelEnv(name, value, env = 'production') {
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
  console.error(`FAIL ${name}:`, err.slice(0, 400));
  return false;
}

export function assertLiveStripeKey(secretKey) {
  const key = (secretKey || '').trim();
  if (!key.startsWith('sk_live_')) {
    console.error(
      'ABORTADO: para producción necesitas STRIPE_SECRET_KEY live (sk_live_...) en .env.local.\n' +
        'Cópiala desde Stripe Dashboard → Developers → API keys (modo Live).',
    );
    process.exit(1);
  }
  return key;
}
