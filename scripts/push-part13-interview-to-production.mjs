/**
 * Save Part 13 interview MCQ + synthesize single dialogue MP3 (no A:/B: labels).
 * Usage: npx vercel env run --environment=production -- node scripts/push-part13-interview-to-production.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
await register(pathToFileURL(path.join(scriptsDir, 'alias-loader.mjs')).href, {
  parentURL: pathToFileURL(path.join(scriptsDir, '..')).href,
});

const { synthesizeExamTtsMp3 } = await import('../src/lib/levelsExamTts.js');

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part13-b2.json'), 'utf8'),
);

/** Dialogue only — strip interviewer/guest labels; double newline = pause between turns. */
function scriptToInterviewTts(script = '') {
  return String(script)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[AB]:\s*/i, '').trim())
    .filter(Boolean)
    .join('\n\n');
}

const ttsText = scriptToInterviewTts(preview.generated.script);
console.error(`TTS input: ${ttsText.length} chars, ~${ttsText.split(/\s+/).length} words`);

const key =
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('Missing auth key');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const headers = { 'Content-Type': 'application/json', 'x-internal-key': key };
const storagePath = 'b2/exam-1/part-13/clip-01.mp3';

console.error('Step 1/3: Save Part 13 content (replacePartContent, skipAudio)…');
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview`, {
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

console.error('Step 2/3: Synthesizing interview dialogue (single clip)…');
const tts = await synthesizeExamTtsMp3(ttsText);
if (!tts?.base64) {
  console.error('TTS failed');
  process.exit(1);
}

const audioBytes = Buffer.from(tts.base64, 'base64').length;
const estDurationSec = Math.round((ttsText.split(/\s+/).length / 145) * 60);
console.error(`TTS OK: ${audioBytes} bytes, est. ~${Math.floor(estDurationSec / 60)}:${String(estDurationSec % 60).padStart(2, '0')}`);

console.error('Step 3/3: Upload clip-01.mp3…');
const uploadRes = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 13,
    preguntaId,
    orden: 1,
    titulo: 'Interview — Bringing the Hall Back to Life',
    storagePath,
    audioBase64: tts.base64,
    replaceExisting: true,
  }),
});

const uploadJson = JSON.parse(await uploadRes.text());
if (!uploadRes.ok) {
  console.error('Upload failed', uploadRes.status, uploadJson);
  process.exit(1);
}

const out = {
  ok: true,
  content: saveJson,
  upload: uploadJson,
  storagePath,
  ttsChars: ttsText.length,
  ttsWords: ttsText.split(/\s+/).length,
  audioBytes,
  estDurationSec,
  mcqExpected: 21,
  answerKey: '24B 25C 26A 27B 28C 29A 30B',
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part13-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
