import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Carga .env.local y lo aplica a process.env (necesario en scripts Node fuera de Next.js).
 */
export function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  const raw = readFileSync(p, 'utf8');
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
    out[key] = val;
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = val;
    }
  }
  return out;
}
