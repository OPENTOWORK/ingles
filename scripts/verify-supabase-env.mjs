/**
 * Prints Supabase project refs from .env.local (no secrets).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');

const PROD_REF = 'qnazrzvwvkwhkfbqsbmr';
const STAGING_B_REF = 'cmeruknhkcxveygeeuji';

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function refFromUrl(url) {
  const m = String(url || '').match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

const env = loadEnv();
const primaryUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
const bUrl = env.SUPABASE_B_URL || '';
const primaryRef = refFromUrl(primaryUrl);
const bRef = refFromUrl(bUrl);

const summary = {
  envFileExists: fs.existsSync(envPath),
  primaryUrl,
  primaryRef,
  primaryIsProd: primaryRef === PROD_REF,
  primaryIsStagingB: primaryRef === STAGING_B_REF,
  supabaseBUrl: bUrl,
  supabaseBRef: bRef,
  hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  hasBSecretKey: Boolean(env.SUPABASE_B_SECRET_KEY || env.SUPABASE_B_SERVICE_ROLE_KEY),
  syncScriptTarget: 'NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY',
};

console.log(JSON.stringify(summary, null, 2));
