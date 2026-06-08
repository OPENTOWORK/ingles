/**
 * Save an approved preview JSON for one B2 exam part (admin / service role).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/save-b2-exam-part-preview.mjs [slot] [partNumber] [previewJsonPath]
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const slot = Number(process.argv[2] || 1);
const partNumber = Number(process.argv[3] || 4);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewPath =
  process.argv[4] ||
  path.join(root, 'scripts', 'generated', `preview-exam${slot}-part${partNumber}-b2.json`);

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or service role key (secrets/supabase-service-role.txt or .env.local)');
  process.exit(1);
}

const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
const generated = preview.generated;
if (!generated) {
  console.error('Preview JSON missing .generated');
  process.exit(1);
}

const { saveLevelExamPartFromPreview } = await import('../src/lib/levelsCambridgeExamGenerator.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level, error: levelErr } = await admin
  .from('levels')
  .select('id, nombre')
  .ilike('nombre', 'b2')
  .single();

if (levelErr || !level?.id) {
  console.error('B2 level not found', levelErr);
  process.exit(1);
}

console.error(`Saving B2 Examen ${slot} Part ${partNumber} from ${previewPath}…`);

const result = await saveLevelExamPartFromPreview(admin, {
  levelSlug: 'b2',
  levelId: level.id,
  examSlot: slot,
  partNumber,
  generated,
  skipAudio: true,
  replacePartContent: true,
});

console.log(JSON.stringify({ ok: true, ...result }, null, 2));
