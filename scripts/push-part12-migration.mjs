/**
 * Migrate Part 12: First Jobs Q19–23 + reuse speaker audios from public part-13 paths.
 * Usage: npx vercel env run --environment=production -- node scripts/push-part12-migration.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part12-migrated-b2.json'), 'utf8'),
);

const PUBLIC_BASE =
  'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening';

const COPY_PAIRS = [1, 2, 3, 4, 5].map((n) => {
  const pad = String(n).padStart(2, '0');
  const storagePath = `b2/exam-1/part-12/speaker-${pad}.mp3`;
  return {
    from: `b2/exam-1/part-13/speaker-${pad}.mp3`,
    to: storagePath,
    orden: n,
    titulo: `Speaker ${n}`,
    publicUrl: `${PUBLIC_BASE}/b2/exam-1/part-13/speaker-${pad}.mp3`,
  };
});

const key =
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('Missing auth key (use: npx vercel env run --environment=production -- node ...)');
  process.exit(1);
}

const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const headers = { 'Content-Type': 'application/json', 'x-internal-key': key };

console.error('Step 1/3: Save Part 12 content (replacePartContent, skipAudio)…');
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 12,
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

console.error('Step 2/3: Fetch part-13 speakers + upload as part-12 clips…');
const copied = [];
const uploadResults = [];

for (const pair of COPY_PAIRS) {
  console.error(`  Fetch ${pair.from}…`);
  const fetchRes = await fetch(pair.publicUrl);
  if (!fetchRes.ok) {
    console.error(`Fetch failed ${pair.publicUrl}`, fetchRes.status);
    process.exit(1);
  }
  const buf = Buffer.from(await fetchRes.arrayBuffer());
  copied.push({ from: pair.from, to: pair.to, bytes: buf.length });

  const uploadRes = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: 'b2',
      slot: 1,
      partNumber: 12,
      preguntaId,
      orden: pair.orden,
      titulo: pair.titulo,
      storagePath: pair.to,
      audioBase64: buf.toString('base64'),
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
    console.error(`Upload API failed orden ${pair.orden}`, uploadRes.status, uploadJson);
    process.exit(1);
  }

  uploadResults.push(uploadJson);
  console.error(`  OK ${pair.to} (${buf.length} bytes)`);
}

const out = {
  ok: true,
  copied,
  content: saveJson,
  uploads: uploadResults,
  mcqExpected: 40,
  answerKey: { 19: 'C', 20: 'H', 21: 'B', 22: 'E', 23: 'G' },
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part12-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
