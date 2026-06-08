/**
 * Attach Part 11 audio via server-side TTS (avoids Vercel 4.5MB upload body limit).
 * Content must already be saved. Re-runs save with skipAudio:false so TTS runs on dralo.es.
 * Usage: npx vercel env run --environment=production -- node scripts/sync-part11-audio-via-api.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part11-b2.json'), 'utf8'),
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

function buildGeneratedPayload() {
  const g = preview.generated;
  const questions = g.questions.map((q) => ({
    number: q.number,
    lead: q.lead,
    answer: q.answer,
    type: 'open',
  }));

  return {
    partTitle: g.partTitle,
    title: g.title,
    directions: g.directions,
    setting: g.setting || 'Radio interview / talk about mountain rescue volunteer training.',
    questions,
    modelAnswers: g.modelAnswers,
    script: g.script,
    audioClips: [
      {
        orden: 1,
        titulo: g.audioClips?.[0]?.titulo || 'Elena — mountain rescue training',
        text: g.script,
        storagePath: 'b2/exam-1/part-11/clip-01.mp3',
      },
    ],
  };
}

console.error('Saving Part 11 with server-side TTS (skipAudio:false)…');
const saveRes = await fetch(`${baseUrl}/api/internal/save-exam-part-preview/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    slug: 'b2',
    slot: 1,
    partNumber: 11,
    skipAudio: false,
    generated: buildGeneratedPayload(),
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
  console.error('Save failed', saveRes.status, JSON.stringify(saveJson));
  process.exit(1);
}

const out = {
  ok: true,
  preguntaId: saveJson.preguntaId,
  saveJson,
};

writeFileSync(path.join(scriptsDir, 'generated', 'save-part11-result.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
