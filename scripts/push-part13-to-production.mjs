/**
 * Save Part 13 content + upload 5 pre-synthesized speaker MP3s.
 * Usage: npx vercel env run --environment=production -- node scripts/push-part13-to-production.mjs
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

function parseSpeakerTexts(script = '') {
  const blocks = String(script)
    .split(/\n\n(?=Speaker\s+\d+:)/i)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((block, i) => {
    const text = block.replace(/^Speaker\s+\d+:\s*/i, '').trim();
    const n = i + 1;
    return {
      orden: n,
      titulo: `Speaker ${n}`,
      text,
      storagePath: `b2/exam-1/part-13/speaker-${String(n).padStart(2, '0')}.mp3`,
    };
  });
}

const audioClips = parseSpeakerTexts(preview.generated.script);
if (audioClips.length !== 5 || audioClips.some((c) => !c.text)) {
  console.error('Expected 5 speaker scripts in preview.generated.script');
  process.exit(1);
}

const key =
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('Missing auth key (use: npx vercel env run --environment=production -- node ...)');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const headers = {
  'Content-Type': 'application/json',
  'x-internal-key': key,
};

console.error('Step 1/2: Saving Part 13 content (skipAudio=true)…');
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

console.error('Step 2/2: Synthesizing + uploading 5 speaker clips…');
const uploadResults = [];

for (const clip of audioClips) {
  console.error(`  TTS Speaker ${clip.orden}…`);
  const tts = await synthesizeExamTtsMp3(clip.text);
  if (!tts?.base64) {
    console.error(`TTS failed for speaker ${clip.orden}`);
    process.exit(1);
  }

  const uploadRes = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: 'b2',
      slot: 1,
      partNumber: 13,
      preguntaId,
      orden: clip.orden,
      titulo: clip.titulo,
      storagePath: clip.storagePath,
      audioBase64: tts.base64,
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
    console.error(`Upload failed speaker ${clip.orden}`, uploadRes.status, JSON.stringify(uploadJson));
    process.exit(1);
  }

  uploadResults.push(uploadJson);
  console.error(`  Speaker ${clip.orden} OK → ${clip.storagePath} (${uploadJson.bytes} bytes)`);
}

const out = {
  ok: true,
  content: saveJson,
  uploads: uploadResults,
  audioPaths: audioClips.map((c) => c.storagePath),
};

writeFileSync(
  path.join(scriptsDir, 'generated', 'save-part13-result.json'),
  JSON.stringify(out, null, 2),
);

console.log(JSON.stringify(out, null, 2));
