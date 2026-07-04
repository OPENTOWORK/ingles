/**
 * Re-synthesize B2 Exam 1 Listening Part 3 (part 12): five speakers + combined MP3.
 * Exam slot 1 only — does not touch parts 10, 11, 13 or other exams.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/resynth-b2-listening-part12-audio.mjs [examSlot]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import {
  B2_EXAM1_PART12,
  B2_EXAM1_PART12_DIRECTIONS,
  buildPart12GeneratedPayload,
} from './b2Exam1ListeningPart12Content.mjs';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';
import { synthesizeListeningClipMp3 } from '../src/lib/levelsExamTts.js';
import { getExtractVoiceProfile } from '../src/lib/listeningTtsVoices.js';
import {
  concatMp3Buffers,
  listeningCombinedDefaultTitle,
  uploadListeningClip,
} from '../src/lib/levelsExamAudioStorage.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 12;
const COMBINED_REVISION = 'v3';

if (examSlot !== 1) {
  console.error('Este script curated solo aplica a Examen 1.');
  process.exit(1);
}

const env = loadEnvLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan credenciales Supabase');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targets = getB2ListeningAudioTargets(partNumber);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

console.error(`\n=== Re-synth Part 12 (Listening Part 3) — Examen ${examSlot} ===\n`);

const generated = buildPart12GeneratedPayload({ revision: COMBINED_REVISION });
const clipDetails = [];
const buffers = [];

for (const clip of generated.audioClips) {
  const idx = (Number(clip.orden) || 1) - 1;
  const profile = getExtractVoiceProfile(idx);
  console.error(`Speaker ${clip.orden}: ${profile.label} (${wordCount(clip.text)} words)…`);
  const tts = await synthesizeListeningClipMp3(clip.text, { extractIndex: idx });
  if (!tts?.base64) throw new Error(`TTS failed for speaker ${clip.orden}`);
  const buf = Buffer.from(tts.base64, 'base64');
  const durationSec = await getMp3DurationSec(buf);
  const clipOk = durationSec >= targets.minSec && durationSec <= targets.maxSec + 5;
  console.error(
    `  → ${formatDurationSec(durationSec)} [${clipOk ? 'OK' : `target ${formatDurationSec(targets.minSec)}–${formatDurationSec(targets.maxSec)}`}]`,
  );
  buffers.push(buf);
  clipDetails.push({
    orden: clip.orden,
    storagePath: clip.storagePath,
    durationSec,
    durationOk: clipOk,
    wordCount: wordCount(clip.text),
    voice: profile.label,
  });
  await uploadListeningClip(admin, {
    path: clip.storagePath,
    audioBuffer: buf,
    contentType: 'audio/mpeg',
  });
}

const combined = concatMp3Buffers(buffers);
const totalSec = await getMp3DurationSec(combined);
const totalOk = totalSec >= targets.totalMinSec && totalSec <= targets.totalMaxSec;
console.error(
  `\nCombined: ${formatDurationSec(totalSec)} [${totalOk ? 'OK' : `target ${formatDurationSec(targets.totalMinSec)}–${formatDurationSec(targets.totalMaxSec)}`}]`,
);

const combinedPath = generated.combinedStoragePath;
const combinedUrl = await uploadListeningClip(admin, {
  path: combinedPath,
  audioBuffer: combined,
  contentType: 'audio/mpeg',
});

writeFileSync(
  path.join(outDir, `resynth-part12-exam${examSlot}-preview.json`),
  JSON.stringify({ generated, clipDetails, totalSec }, null, 2),
);

const { buildB2EnunciadoFromGenerated, buildAnswerRowsFromGenerated } = await import(
  '../src/lib/formatB2Enunciado.js'
);

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id')
  .eq('level_id', level.id)
  .order('nombre');
const examenId = examenes?.[examSlot - 1]?.id;
const { data: parte } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 12 B2')
  .single();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id')
  .eq('examen_id', examenId)
  .eq('parte_id', parte.id)
  .maybeSingle();

if (!pregunta?.id) {
  console.error('No hay pregunta Part 12');
  process.exit(1);
}

console.error('Updating enunciado + matching key (in-place)…');
const enunciado = buildB2EnunciadoFromGenerated(generated, partNumber);
await admin.from('levels_preguntas').update({ enunciado }).eq('id', pregunta.id);

await admin.from('levels_respuestas').delete().eq('pregunta_id', pregunta.id);
const { mcq } = buildAnswerRowsFromGenerated(generated);
const mcqRows = mcq.map((row) => ({
  pregunta_id: pregunta.id,
  respuesta: `${row.questionNumber} ${row.letter}`,
  correcta: row.correcta,
}));
const { error: mcqErr } = await admin.from('levels_respuestas').insert(mcqRows);
if (mcqErr) throw new Error(mcqErr.message);

await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', pregunta.id);
const { error: audioErr } = await admin.from('levels_preguntas_audios').insert({
  pregunta_id: pregunta.id,
  audio_url: combinedUrl,
  orden: 1,
  titulo: listeningCombinedDefaultTitle(partNumber),
});
if (audioErr) throw new Error(audioErr.message);

await admin
  .from('levels_partes')
  .update({ Descripción: B2_EXAM1_PART12_DIRECTIONS })
  .eq('id', parte.id);

const report = {
  ok: true,
  examSlot,
  preguntaId: pregunta.id,
  combinedUrl,
  combinedPath,
  durationSec: totalSec,
  durationFormatted: formatDurationSec(totalSec),
  totalOk,
  targetTotal: `${formatDurationSec(targets.totalMinSec)}–${formatDurationSec(targets.totalMaxSec)}`,
  clipDetails,
  answerKey: Object.fromEntries(B2_EXAM1_PART12.matchingAnswers.map((r) => [r.number, r.answer])),
  unusedOptions: ['A', 'D', 'F'],
};

writeFileSync(path.join(outDir, `resynth-part12-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!totalOk || clipDetails.some((c) => !c.durationOk)) process.exit(1);
