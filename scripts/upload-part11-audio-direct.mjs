/**
 * Upload Part 11 monologue directly to Supabase (bypasses Vercel 4.5MB body limit).
 * Usage: npx vercel env run --environment=production -- node scripts/upload-part11-audio-direct.mjs [preguntaId]
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
await register(pathToFileURL(path.join(scriptsDir, 'alias-loader.mjs')).href, {
  parentURL: pathToFileURL(path.join(scriptsDir, '..')).href,
});

const { synthesizeExamTtsMp3 } = await import('../src/lib/levelsExamTts.js');
const { uploadListeningClip } = await import('../src/lib/levelsExamAudioStorage.js');

loadEnvLocal();

const STORAGE_PATH = 'b2/exam-1/part-11/clip-01.mp3';
const TITULO = 'Elena — mountain rescue training';
const preguntaId =
  process.argv[2] ||
  JSON.parse(
    readFileSync(path.join(scriptsDir, 'generated', 'save-part11-result.json'), 'utf8'),
  ).preguntaId;

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part11-b2.json'), 'utf8'),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.error('Synthesizing monologue…');
const tts = await synthesizeExamTtsMp3(preview.generated.script);
if (!tts?.base64) {
  console.error('TTS failed');
  process.exit(1);
}

const buf = Buffer.from(tts.base64, 'base64');
const durationSec = await getMp3DurationSec(buf);
const localPath = path.join(scriptsDir, 'generated', 'part11-clip-01.mp3');
writeFileSync(localPath, buf);
console.error(`Local cache: ${localPath} (${durationSec}s, ${buf.length} bytes)`);

console.error('Uploading to Supabase Storage…');
const audio_url = await uploadListeningClip(admin, {
  path: STORAGE_PATH,
  audioBuffer: buf,
  contentType: 'audio/mpeg',
});

console.error('Replacing audio DB rows…');
await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', preguntaId);

const { data: row, error } = await admin
  .from('levels_preguntas_audios')
  .insert({
    pregunta_id: preguntaId,
    audio_url,
    orden: 1,
    titulo: TITULO,
  })
  .select('id, orden, titulo, audio_url')
  .single();

if (error) {
  console.error('DB insert failed:', error.message);
  process.exit(1);
}

const out = {
  ok: true,
  preguntaId,
  storagePath: STORAGE_PATH,
  audio_url,
  durationSec,
  bytes: buf.length,
  localPath,
  clip: row,
};

writeFileSync(path.join(scriptsDir, 'generated', 'upload-part11-audio-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
