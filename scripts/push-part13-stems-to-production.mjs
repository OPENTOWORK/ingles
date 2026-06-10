/**
 * Save B2 Exam 1 Part 13 stems only (skipAudio) + relink existing clip-01.mp3.
 * Usage: npx vercel env run --environment=production -- node scripts/push-part13-stems-to-production.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part13-b2-stems-v1.json'), 'utf8'),
);

const key =
  process.env.DRALO_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_SECRET ||
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!key) {
  console.error('Missing auth key');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const headers = { 'Content-Type': 'application/json', 'x-internal-key': key };
const STORAGE_PATH = 'b2/exam-1/part-13/clip-01.mp3';

console.error('Step 1/3: Backup Part 13…');
const { execSync } = await import('node:child_process');
const backupOut = execSync('node scripts/backup-part13.mjs', {
  cwd: path.join(scriptsDir, '..'),
  encoding: 'utf8',
  env: process.env,
});
const backupJson = JSON.parse(backupOut.trim());
console.error(`Backup: ${backupJson.backupPath}`);

const legacyAudio = backupJson.items?.[0]?.audios?.[0];
if (!legacyAudio?.audio_url) {
  console.error('No audio in backup — aborting to avoid orphan content save');
  process.exit(1);
}

console.error('Step 2/3: Save Part 13 stems (skipAudio)…');
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 13,
    skipAudio: true,
    generated: preview.generated,
  }),
});

const saveText = await saveRes.text();
let saveJson;
try {
  saveJson = JSON.parse(saveText);
} catch {
  saveJson = { raw: saveText };
}

if (!saveRes.ok) {
  console.error('Content save failed', saveRes.status, JSON.stringify(saveJson));
  process.exit(1);
}

const preguntaId = saveJson.preguntaId;
console.error(`Content saved. preguntaId=${preguntaId}`);

console.error('Step 3/3: Relink clip-01.mp3 (existing URL, no re-upload)…');
const uploadRes = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 13,
    preguntaId,
    orden: 1,
    titulo: legacyAudio.titulo || 'Interview — Bringing the Hall Back to Life',
    storagePath: legacyAudio.storagePath || STORAGE_PATH,
    existingAudioUrl: legacyAudio.audio_url,
    replaceExisting: true,
  }),
});

const uploadText = await uploadRes.text();
let uploadJson;
try {
  uploadJson = JSON.parse(uploadText);
} catch {
  uploadJson = { raw: uploadText };
}

if (!uploadRes.ok) {
  console.error('Audio relink failed', uploadRes.status, uploadJson);
  process.exit(1);
}

const out = {
  ok: true,
  backupPath: backupJson.backupPath,
  legacyPreguntaId: backupJson.items?.[0]?.preguntaId,
  preguntaId,
  content: saveJson,
  upload: uploadJson,
  answerKey: { 24: 'B', 25: 'C', 26: 'A', 27: 'B', 28: 'C', 29: 'A', 30: 'B' },
  mcqExpected: 21,
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part13-stems-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
