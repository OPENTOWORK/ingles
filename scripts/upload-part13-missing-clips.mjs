/**
 * Upload missing Part 13 speaker clips only.
 * Usage: npx vercel env run --environment=production -- node scripts/upload-part13-missing-clips.mjs [fromOrden]
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
await register(pathToFileURL(path.join(scriptsDir, 'alias-loader.mjs')).href, {
  parentURL: pathToFileURL(path.join(scriptsDir, '..')).href,
});

const { synthesizeExamTtsMp3 } = await import('../src/lib/levelsExamTts.js');

const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part13-b2.json'), 'utf8'),
);
const fromOrden = Number(process.argv[2] || 4);

function parseSpeakerTexts(script = '') {
  return String(script)
    .split(/\n\n(?=Speaker\s+\d+:)/i)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block, i) => {
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

const clips = parseSpeakerTexts(preview.generated.script).filter((c) => c.orden >= fromOrden);
const key =
  process.env.RESEND_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = process.env.SAVE_TARGET_URL || 'https://www.dralo.es';
const preguntaId = 'bdb3f9bc-1a00-42cb-ac65-c6e6beea8fc6';

for (const clip of clips) {
  console.error(`TTS + upload Speaker ${clip.orden}…`);
  const tts = await synthesizeExamTtsMp3(clip.text);
  if (!tts?.base64) throw new Error(`TTS failed speaker ${clip.orden}`);
  const res = await fetch(`${baseUrl}/api/internal/upload-exam-part-audio-clip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': key },
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
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  console.log(`Speaker ${clip.orden} OK (${json.bytes} bytes)`);
}
