/**
 * Re-synthesize B2 Exam 1 Listening Part 10 with multi-voice Edge TTS (one accent/voice per extract).
 * Preserves existing MCQ questions; generates new scripts aligned to the answer key.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/resynth-b2-listening-part10-audio.mjs [examSlot]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';
import {
  concatMp3Buffers,
  listeningCombinedDefaultTitle,
  listeningCombinedStoragePath,
  uploadListeningClip,
} from '../src/lib/levelsExamAudioStorage.js';
import { synthesizeListeningClipMp3 } from '../src/lib/levelsExamTts.js';
import { EXTRACT_VOICE_PROFILES } from '../src/lib/listeningTtsVoices.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 10;
const env = loadEnvLocal();

if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY (para generar scripts)');
  process.exit(1);
}
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan credenciales Supabase');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const targets = getB2ListeningAudioTargets(partNumber);

function parseEnunciadoQuestions(enunciado) {
  const lines = String(enunciado || '').split('\n').map((l) => l.trim());
  const setting = lines[0] && !/^\d+$/.test(lines[0]) ? lines[0] : '';
  /** @type {Array<{ number: number, prompt: string, options: string[], correct?: string }>} */
  const questions = [];
  let current = null;

  for (const line of lines) {
    if (/^\d+$/.test(line)) {
      if (current) questions.push(current);
      current = { number: Number(line), prompt: '', options: [] };
      continue;
    }
    if (!current) continue;
    const opt = line.match(/^([A-C])\)\s*(.+)$/i);
    if (opt) {
      current.options.push(`${opt[1].toUpperCase()}) ${opt[2].trim()}`);
    } else if (line && !line.startsWith('Part')) {
      current.prompt = current.prompt ? `${current.prompt} ${line}` : line;
    }
  }
  if (current) questions.push(current);
  return { setting, questions };
}

async function loadPart10Pregunta() {
  const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
  const { data: examenes } = await admin
    .from('levels_examenes')
    .select('id')
    .eq('level_id', level.id)
    .order('nombre');
  const examenId = examenes[examSlot - 1]?.id;
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  const { data: pregunta } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', examenId)
    .eq('parte_id', parte.id)
    .single();

  const { data: respuestas } = await admin
    .from('levels_respuestas')
    .select('respuesta, correcta')
    .eq('pregunta_id', pregunta.id);

  const correctByNum = {};
  for (const r of respuestas || []) {
    const m = String(r.respuesta).match(/^(\d+)\s+([A-C])\)/i);
    if (m && r.correcta) correctByNum[Number(m[1])] = m[2].toUpperCase();
  }

  return { pregunta, correctByNum };
}

async function generateScripts({ setting, questions, correctByNum }) {
  const payload = questions.map((q) => ({
    number: q.number,
    prompt: q.prompt,
    options: q.options,
    correctLetter: correctByNum[q.number] || 'B',
  }));

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You write Cambridge B2 Listening Part 1 extract scripts for TTS. Return JSON only.',
      },
      {
        role: 'user',
        content: `Setting: ${setting || 'Various everyday situations in an urban environment.'}

For each question below, write ONE listening extract script:
- MINIMUM 85 words, target 88–95 words (~33–38 seconds spoken at natural pace)
- Each extract = a DIFFERENT scenario (friends chatting, announcement, interview, phone call, etc.)
- Use monologue OR dialogue with "A:" / "B:" labels (use dialogue for at least 4 extracts)
- Authentic spoken B2 English; contractions; no written/formal tone
- The script must support the correct MCQ answer through inference (do NOT state option letters)
- Do NOT copy option text verbatim — paraphrase in natural speech
- Include a one-line "situation" per extract
- Count words carefully — scripts under 85 words will be rejected

Questions:
${JSON.stringify(payload, null, 2)}

Return JSON: { "extracts": [ { "number": 1, "situation": "...", "script": "..." }, ... ] }`,
      },
    ],
  });

  const parsed = JSON.parse(res.choices[0]?.message?.content || '{}');
  const extracts = Array.isArray(parsed.extracts) ? parsed.extracts : [];
  if (extracts.length < 8) {
    throw new Error(`Expected 8 scripts, got ${extracts.length}`);
  }
  return extracts.sort((a, b) => a.number - b.number).slice(0, 8);
}

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function expandScript(text, targetMin = 85, targetMax = 95) {
  const trimmed = String(text || '').trim();
  if (wordCount(trimmed) >= targetMin) return trimmed;

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.35,
    messages: [
      {
        role: 'user',
        content:
          `Expand the following English listening extract to between ${targetMin} and ${targetMax} words. ` +
          'Keep the same speakers (A:/B: labels if present), meaning, and natural B2 spoken style. ' +
          'Return ONLY the expanded script.\n\n' +
          trimmed,
      },
    ],
  });
  return String(res.choices[0]?.message?.content || trimmed).trim();
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

console.error(`\n=== Re-synth Part 10 — Examen ${examSlot} (multi-voice) ===\n`);

const { pregunta, correctByNum } = await loadPart10Pregunta();
const { setting, questions } = parseEnunciadoQuestions(pregunta.enunciado);
console.error(`preguntaId: ${pregunta.id}`);
console.error(`Generando 8 scripts con OpenAI…`);

const extracts = await generateScripts({ setting, questions, correctByNum });

for (const ex of extracts) {
  ex.script = await expandScript(ex.script, targets.expandMin, targets.expandMax);
  ex.wordCount = wordCount(ex.script);
  console.error(`  Script Q${ex.number}: ${ex.wordCount} words`);
}

writeFileSync(
  path.join(outDir, `resynth-part10-exam${examSlot}-scripts.json`),
  JSON.stringify({ extracts, voiceProfiles: EXTRACT_VOICE_PROFILES.map((p) => p.label) }, null, 2),
);

console.error('Sintetizando 8 extractos (voces distintas por escenario)…');
const buffers = [];
for (let i = 0; i < extracts.length; i += 1) {
  const ex = extracts[i];
  const profile = EXTRACT_VOICE_PROFILES[i];
  console.error(`  Extract ${ex.number}: ${profile.label}`);
  const result = await synthesizeListeningClipMp3(ex.script, { extractIndex: i });
  if (!result?.base64) throw new Error(`TTS failed for extract ${ex.number}`);
  const buf = Buffer.from(result.base64, 'base64');
  const sec = await getMp3DurationSec(buf);
  console.error(`    → ${formatDurationSec(sec)} (${buf.length} bytes)`);
  buffers.push(buf);
}

const combined = concatMp3Buffers(buffers);
const totalSec = await getMp3DurationSec(combined);
const durationOk = totalSec >= targets.totalMinSec && totalSec <= targets.totalMaxSec;
console.error(
  `\nAudio combinado: ${formatDurationSec(totalSec)} [${durationOk ? 'OK' : `objetivo ${formatDurationSec(targets.totalMinSec)}–${formatDurationSec(targets.totalMaxSec)}`}]`,
);

const storagePath = listeningCombinedStoragePath({
  levelLabel: 'B2',
  examSlot,
  partNumber,
  revision: 'v3',
});

const audio_url = await uploadListeningClip(admin, {
  path: storagePath,
  audioBuffer: combined,
  contentType: 'audio/mpeg',
});

await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', pregunta.id);
const { error } = await admin.from('levels_preguntas_audios').insert({
  pregunta_id: pregunta.id,
  audio_url,
  orden: 1,
  titulo: listeningCombinedDefaultTitle(partNumber, setting),
});
if (error) throw new Error(error.message);

const report = {
  ok: true,
  examSlot,
  preguntaId: pregunta.id,
  audio_url,
  durationSec: totalSec,
  durationFormatted: formatDurationSec(totalSec),
  durationOk,
  targetRange: `${formatDurationSec(targets.totalMinSec)}–${formatDurationSec(targets.totalMaxSec)}`,
  voiceProfiles: EXTRACT_VOICE_PROFILES.map((p) => p.label),
  extracts: extracts.map((e) => ({ number: e.number, situation: e.situation, wordCount: e.script.split(/\s+/).length })),
};

writeFileSync(path.join(outDir, `resynth-part10-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
