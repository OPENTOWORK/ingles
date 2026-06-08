import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Carga .env.local y lo aplica a process.env (necesario en scripts Node fuera de Next.js).
 */
export function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  const vercelP = path.join(ROOT, '.env.vercel.local');
  const out = {};
  for (const file of [p, vercelP]) {
    if (!existsSync(file)) continue;
    mergeEnvFile(out, readFileSync(file, 'utf8'));
  }
  return out;
}

function mergeEnvFile(out, raw) {
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!out[key]) out[key] = val;
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = val;
    }
  }
}
