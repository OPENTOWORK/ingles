/**
 * Save B2 Exam 1 Listening Part 11 + TTS (single monologue, script only).
 * Usage: npx vercel env run --environment=production -- node scripts/push-part11-to-production.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';
import { getMp3DurationSec } from './mp3-duration.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
await register(pathToFileURL(path.join(scriptsDir, 'alias-loader.mjs')).href, {
  parentURL: pathToFileURL(path.join(scriptsDir, '..')).href,
});

const { synthesizeExamTtsMp3 } = await import('../src/lib/levelsExamTts.js');

const MIN_DURATION_SEC = 205; // 3:25 — abort below
const MAX_DURATION_SEC = 255; // 4:15 — abort above
const TARGET_MIN_SEC = 220; // 3:40
const TARGET_MAX_SEC = 250; // 4:10
const STORAGE_PATH = 'b2/exam-1/part-11/clip-01.mp3';
const PART_DIRECTIONS =
  'Part:11\r\n\r\nYou will hear a woman called Elena who volunteers with a mountain rescue team talking about the training new members receive. For questions 9–18, complete the sentences with a word or short phrase.';

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part11-b2.json'), 'utf8'),
);

const key =
  process.env.DRALO_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_SECRET ||
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!key) {
  console.error('Missing auth key (use: npx vercel env run --environment=production -- node ...)');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const headers = { 'Content-Type': 'application/json', 'x-internal-key': key };

function buildGeneratedPayload() {
  const g = preview.generated;
  const questions = g.questions.map((q) => ({
    number: q.number,
    lead: q.lead,
    answer: q.answer,
    type: 'open',
  }));

  const audioClips = [
    {
      orden: 1,
      titulo: g.audioClips?.[0]?.titulo || 'Elena — mountain rescue training',
      text: g.script,
      storagePath: STORAGE_PATH,
    },
  ];

  return {
    partTitle: g.partTitle,
    title: g.title,
    directions: g.directions,
    setting: g.setting || 'Radio interview / talk about mountain rescue volunteer training.',
    questions,
    modelAnswers: g.modelAnswers,
    script: g.script,
    audioClips,
  };
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

console.error('Step 1/5: Backup Part 11…');
const { execSync } = await import('node:child_process');
const backupOut = execSync('node scripts/backup-part11.mjs', {
  cwd: path.join(scriptsDir, '..'),
  encoding: 'utf8',
  env: process.env,
});
const backupJson = JSON.parse(backupOut.trim());
console.error(`Backup: ${backupJson.backupPath}`);

console.error('Step 2/5: Synthesize monologue (script only)…');
const script = preview.generated.script;
const tts = await synthesizeExamTtsMp3(script);
if (!tts?.base64) {
  console.error('TTS failed');
  process.exit(1);
}

const buf = Buffer.from(tts.base64, 'base64');
const durationSec = await getMp3DurationSec(buf);
console.error(`  Duration: ${durationSec}s (${formatDuration(durationSec)}) — ${buf.length} bytes`);

if (durationSec < MIN_DURATION_SEC || durationSec > MAX_DURATION_SEC) {
  const report = {
    ok: false,
    aborted: true,
    reason:
      durationSec < MIN_DURATION_SEC
        ? `Too short (${formatDuration(durationSec)} < 3:25) — NOT saved`
        : `Too long (${formatDuration(durationSec)} > 4:15) — NOT saved`,
    durationSec,
    durationFormatted: formatDuration(durationSec),
    acceptableRange: '3:25–4:15 (target 3:40–4:10)',
    targetRange: `${TARGET_MIN_SEC}–${TARGET_MAX_SEC}s`,
    storagePath: STORAGE_PATH,
    bytes: buf.length,
    withinTargetBand: durationSec >= TARGET_MIN_SEC && durationSec <= TARGET_MAX_SEC,
    backupPath: backupJson.backupPath,
  };
  const outPath = path.join(scriptsDir, 'generated', 'push-part11-duration-check-failed.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.error('Step 3/5: Save Part 11 content (replacePartContent, skipAudio)…');
const generated = buildGeneratedPayload();
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 11,
    skipAudio: true,
    generated,
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

let preguntaId = saveJson.preguntaId;
console.error(`Content saved. preguntaId=${preguntaId}`);

console.error('Step 4/5: Patch Part 11 directions…');
const dirRes = await fetch(`${baseUrl}/api/internal/patch-part-directions/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    partNumber: 11,
    descripcion: PART_DIRECTIONS,
  }),
});
const dirJson = await dirRes.json();
if (!dirRes.ok) {
  console.error('Directions patch failed', dirRes.status, dirJson);
  process.exit(1);
}

console.error('Step 5/5: Attach clip-01.mp3 (server-side TTS — avoids Vercel 4.5MB body limit)…');
const audioSaveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 11,
    skipAudio: false,
    generated,
  }),
});

const audioSaveText = await audioSaveRes.text();
let audioSaveJson;
try {
  audioSaveJson = JSON.parse(audioSaveText);
} catch {
  audioSaveJson = { raw: audioSaveText };
}

if (!audioSaveRes.ok) {
  console.error('Audio attach failed', audioSaveRes.status, JSON.stringify(audioSaveJson));
  process.exit(1);
}

const uploadJson = { ok: true, via: 'save-exam-part-preview skipAudio:false', preguntaId: audioSaveJson.preguntaId };
preguntaId = audioSaveJson.preguntaId || preguntaId;

const out = {
  ok: true,
  backupPath: backupJson.backupPath,
  legacyPreguntaId: backupJson.items?.[0]?.preguntaId,
  legacyAudios: backupJson.items?.[0]?.audios?.map((a) => a.storagePath) || [],
  content: saveJson,
  directions: dirJson,
  preguntaId,
  openAnswerExpected: 10,
  mcqExpected: 0,
  answerKey: {
    9: 'fitness',
    10: 'navigation',
    11: 'whistle',
    12: 'first aid',
    13: 'waterproof',
    14: 'helicopter',
    15: 'voluntary',
    16: 'steep',
    17: 'visibility',
    18: 'confidence',
  },
  audio: {
    storagePath: STORAGE_PATH,
    durationSec,
    durationFormatted: formatDuration(durationSec),
    bytes: buf.length,
    withinTargetBand: durationSec >= TARGET_MIN_SEC && durationSec <= TARGET_MAX_SEC,
  },
  upload: uploadJson,
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part11-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
