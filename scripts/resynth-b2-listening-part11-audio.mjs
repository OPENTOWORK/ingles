/**
 * Re-synthesize B2 Exam 1 Listening Part 2 (part 11): Cambridge-style monologue + sentence completion.
 * Uses the same Edge TTS voice stack as Part 1 (host A + guest B), without modifying Part 1.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/resynth-b2-listening-part11-audio.mjs [examSlot]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import {
  B2_EXAM1_PART11,
  B2_EXAM1_PART11_DIRECTIONS,
  buildPart11GeneratedPayload,
} from './b2Exam1ListeningPart11Content.mjs';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';
import { synthesizePart2ListeningMp3 } from '../src/lib/levelsExamTts.js';
import { PART2_INTERVIEW_VOICE } from '../src/lib/listeningTtsVoices.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 11;
const STORAGE_PATH = `b2/exam-${examSlot}/part-11/clip-01-v7.mp3`;
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

function validateScriptOrder(script, answerKey) {
  const lower = String(script || '').toLowerCase();
  let lastIndex = -1;
  const missing = [];
  for (const [num, ans] of Object.entries(answerKey)) {
    const phrase = String(ans).toLowerCase();
    const idx = lower.indexOf(phrase, lastIndex + 1);
    if (idx === -1) missing.push({ number: Number(num), answer: ans });
    else lastIndex = idx;
  }
  return { ok: missing.length === 0, missing };
}

console.error(`\n=== Re-synth Part 11 (Listening Part 2) — Examen ${examSlot} ===\n`);

const generated = buildPart11GeneratedPayload({ storagePath: STORAGE_PATH });
const scriptCheck = validateScriptOrder(generated.script, B2_EXAM1_PART11.answerKey);
if (!scriptCheck.ok) {
  console.error('Script missing answers in linear order:', scriptCheck.missing);
  process.exit(1);
}

const wc = wordCount(generated.script);
console.error(`Script: ${wc} words (target ${targets.wordMin}–${targets.wordMax})`);
console.error('Synthesizing continuous monologue (Elena)…');
const tts = await synthesizePart2ListeningMp3(generated.script);
if (!tts?.base64) {
  console.error('TTS failed');
  process.exit(1);
}

const audioBuffer = Buffer.from(tts.base64, 'base64');
const durationSec = await getMp3DurationSec(audioBuffer);
const durationOk = durationSec >= targets.minSec && durationSec <= targets.maxSec;
console.error(
  `  → ${formatDurationSec(durationSec)} (${audioBuffer.length} bytes) [${durationOk ? 'OK' : `target ${formatDurationSec(targets.minSec)}–${formatDurationSec(targets.maxSec)}`}]`,
);

writeFileSync(
  path.join(outDir, `resynth-part11-exam${examSlot}-preview.json`),
  JSON.stringify({ generated, durationSec, wordCount: wc, voiceProfile: PART2_INTERVIEW_VOICE.label }, null, 2),
);

const { buildB2EnunciadoFromGenerated, buildAnswerRowsFromGenerated } = await import(
  '../src/lib/formatB2Enunciado.js'
);
const { formatOpenRespuestaRow } = await import('../src/lib/formatLevelsEnunciado.js');
const { uploadListeningClip } = await import('../src/lib/levelsExamAudioStorage.js');

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel B2 no encontrado');
  process.exit(1);
}

const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id')
  .eq('level_id', level.id)
  .order('nombre');
const examenId = examenes?.[examSlot - 1]?.id;
const { data: parte } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 11 B2')
  .single();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id')
  .eq('examen_id', examenId)
  .eq('parte_id', parte.id)
  .maybeSingle();

if (!pregunta?.id) {
  console.error('No hay pregunta Part 11 — ejecuta save completo primero');
  process.exit(1);
}

const enunciado = buildB2EnunciadoFromGenerated(generated, partNumber);
console.error('Updating enunciado + answer key (in-place, keeps pregunta id)…');

await admin.from('levels_preguntas').update({ enunciado }).eq('id', pregunta.id);

const { data: openRows } = await admin
  .from('levels_respuestas_abiertas')
  .select('id')
  .eq('pregunta_id_abierta', pregunta.id);
const openIds = (openRows || []).map((r) => r.id);
if (openIds.length) {
  await admin.from('levels_justificaciones').delete().in('id_respuesta_abierta', openIds);
  await admin.from('levels_respuestas_abiertas').delete().in('id', openIds);
}

const { open } = buildAnswerRowsFromGenerated(generated);
const insertRows = open.map((row) => ({
  pregunta_id_abierta: pregunta.id,
  respuesta_texto: formatOpenRespuestaRow(row),
}));
const { error: openErr } = await admin.from('levels_respuestas_abiertas').insert(insertRows);
if (openErr) throw new Error(openErr.message);

const saveResult = { preguntaId: pregunta.id };
console.error(`preguntaId=${saveResult.preguntaId}`);

console.error('Uploading multi-voice MP3…');
const audio_url = await uploadListeningClip(admin, {
  path: STORAGE_PATH,
  audioBuffer,
  contentType: 'audio/mpeg',
});

await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', saveResult.preguntaId);
const { error: audioErr } = await admin.from('levels_preguntas_audios').insert({
  pregunta_id: saveResult.preguntaId,
  audio_url,
  orden: 1,
  titulo: 'Elena — mountain rescue training (talk)',
});
if (audioErr) throw new Error(audioErr.message);

const { data: parteRow } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 11 B2')
  .single();
if (parteRow?.id) {
  await admin
    .from('levels_partes')
    .update({ Descripción: B2_EXAM1_PART11_DIRECTIONS })
    .eq('id', parteRow.id);
}

const report = {
  ok: true,
  examSlot,
  preguntaId: saveResult.preguntaId,
  audio_url,
  storagePath: STORAGE_PATH,
  durationSec,
  durationFormatted: formatDurationSec(durationSec),
  durationOk,
  targetRange: `${formatDurationSec(targets.minSec)}–${formatDurationSec(targets.maxSec)}`,
  wordCount: wc,
  voiceProfile: PART2_INTERVIEW_VOICE.label,
  answerKey: B2_EXAM1_PART11.answerKey,
  scriptCheck,
};

writeFileSync(path.join(outDir, `resynth-part11-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!durationOk) process.exit(1);
