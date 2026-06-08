/**
 * Save Part 3 using local generator code + Supabase service role.
 * Usage: npx vercel env run --environment=production -- node scripts/run-save-b2-part3.mjs
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
await register(pathToFileURL(path.join(scriptsDir, 'alias-loader.mjs')).href, {
  parentURL: pathToFileURL(path.join(scriptsDir, '..')).href,
});

const { loadEnvLocal } = await import('./load-env-local.mjs');
const { readFileSync, existsSync } = await import('fs');
const { createClient } = await import('@supabase/supabase-js');
const { saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js');

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
    out[key] = val;
  }
}

const env = loadEnvLocal();
const pulledPath = path.join(scriptsDir, '..', '.env.production.pulled');
if (existsSync(pulledPath)) mergeEnvFile(env, readFileSync(pulledPath, 'utf8'));

const serviceRoleFile = path.join(scriptsDir, '..', 'secrets', 'supabase-service-role.txt');
if (existsSync(serviceRoleFile) && !env.SUPABASE_SERVICE_ROLE_KEY) {
  env.SUPABASE_SERVICE_ROLE_KEY = readFileSync(serviceRoleFile, 'utf8').trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part3-b2.json'), 'utf8'),
);

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelErr } = await admin
  .from('levels')
  .select('id')
  .ilike('nombre', 'b2')
  .single();

if (levelErr || !level?.id) {
  console.error('B2 level not found', levelErr);
  process.exit(1);
}

console.error('Saving B2 Examen 1 Part 3 (local generator)…');

const result = await saveLevelExamPartFromPreview(admin, {
  levelSlug: 'b2',
  levelId: level.id,
  examSlot: 1,
  partNumber: 3,
  generated: preview.generated,
  skipAudio: true,
  replacePartContent: true,
});

console.log(JSON.stringify({ ok: true, ...result }, null, 2));
