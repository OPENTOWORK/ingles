/**
 * Save B2 Exam 1 Listening Part 10 + TTS (8 clips, script-only per item).
 * Usage: npx vercel env run --environment=production -- node scripts/push-part10-to-production.mjs
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

const MIN_DURATION_SEC = 23;
const MAX_DURATION_SEC = 40;
const PART_DIRECTIONS =
  'Part:10\r\n\r\nYou will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).';

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part10-b2.json'), 'utf8'),
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
    prompt: q.prompt,
    options: q.options,
  }));

  const audioClips = g.questions.map((q, i) => {
    const pad = String(i + 1).padStart(2, '0');
    return {
      orden: q.number,
      titulo: q.situation || g.audioClips?.[i]?.titulo || `Situation ${q.number}`,
      text: q.script,
      storagePath: `b2/exam-1/part-10/clip-${pad}.mp3`,
    };
  });

  return {
    partTitle: g.partTitle,
    title: g.title,
    directions: g.directions,
    setting: g.setting || 'Eight short extracts in different everyday situations.',
    questions,
    modelAnswers: g.modelAnswers,
    script: g.questions.map((q) => q.script).join('\n\n'),
    audioClips,
  };
}

console.error('Step 1/5: Backup Part 10…');
const { execSync } = await import('node:child_process');
const backupOut = execSync('node scripts/backup-part10.mjs', {
  cwd: path.join(scriptsDir, '..'),
  encoding: 'utf8',
  env: process.env,
});
const backupJson = JSON.parse(backupOut.trim());
console.error(`Backup: ${backupJson.backupPath}`);

console.error('Step 2/5: Synthesize 8 clips (script only)…');
const clips = preview.generated.questions.map((q, i) => ({
  number: q.number,
  situation: q.situation,
  script: q.script,
  titulo: preview.generated.audioClips?.[i]?.titulo || q.situation,
  storagePath: `b2/exam-1/part-10/clip-${String(i + 1).padStart(2, '0')}.mp3`,
}));

const synthesized = [];
for (const clip of clips) {
  console.error(`  TTS Q${clip.number}…`);
  const tts = await synthesizeExamTtsMp3(clip.script);
  if (!tts?.base64) {
    console.error(`TTS failed for Q${clip.number}`);
    process.exit(1);
  }
  const buf = Buffer.from(tts.base64, 'base64');
  const durationSec = await getMp3DurationSec(buf);
  synthesized.push({
    ...clip,
    bytes: buf.length,
    durationSec,
    base64: tts.base64,
  });
  console.error(`  Q${clip.number}: ${durationSec}s (${buf.length} bytes)`);
}

const durationIssues = synthesized.filter(
  (c) => c.durationSec < MIN_DURATION_SEC || c.durationSec > MAX_DURATION_SEC,
);
if (durationIssues.length) {
  const report = {
    ok: false,
    aborted: true,
    reason: 'Duration out of acceptable range (23–40s)',
    clips: synthesized.map(({ number, durationSec, bytes, storagePath }) => ({
      number,
      durationSec,
      bytes,
      storagePath,
    })),
    failed: durationIssues.map(({ number, durationSec }) => ({ number, durationSec })),
  };
  const outPath = path.join(scriptsDir, 'generated', 'push-part10-duration-check-failed.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.error('Step 3/5: Save Part 10 content (replacePartContent, skipAudio)…');
const generated = buildGeneratedPayload();
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 10,
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

const preguntaId = saveJson.preguntaId;
console.error(`Content saved. preguntaId=${preguntaId}`);

console.error('Step 4/5: Patch Part 10 directions…');
const dirRes = await fetch(`${baseUrl}/api/internal/patch-part-directions/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    partNumber: 10,
    descripcion: PART_DIRECTIONS,
  }),
});
const dirJson = await dirRes.json();
if (!dirRes.ok) {
  console.error('Directions patch failed', dirRes.status, dirJson);
  process.exit(1);
}

console.error('Step 5/5: Upload 8 audio clips…');
const uploads = [];
for (const clip of synthesized) {
  const uploadRes = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: 'b2',
      slot: 1,
      partNumber: 10,
      preguntaId,
      orden: clip.number,
      titulo: clip.titulo,
      storagePath: clip.storagePath,
      audioBase64: clip.base64,
      replaceExisting: true,
    }),
  });

  const uploadJson = JSON.parse(await uploadRes.text());
  if (!uploadRes.ok) {
    console.error(`Upload failed Q${clip.number}`, uploadRes.status, uploadJson);
    process.exit(1);
  }
  uploads.push({ ...uploadJson, durationSec: clip.durationSec });
  console.error(`  OK ${clip.storagePath} (${clip.durationSec}s)`);
}

const out = {
  ok: true,
  backupPath: backupJson.backupPath,
  legacyPreguntaId: backupJson.items?.[0]?.preguntaId,
  content: saveJson,
  directions: dirJson,
  preguntaId,
  mcqExpected: 24,
  answerKey: { 1: 'C', 2: 'B', 3: 'A', 4: 'C', 5: 'B', 6: 'A', 7: 'B', 8: 'C' },
  clips: synthesized.map(({ number, storagePath, durationSec, bytes, titulo }) => ({
    number,
    storagePath,
    durationSec,
    bytes,
    titulo,
  })),
  uploads,
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part10-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
