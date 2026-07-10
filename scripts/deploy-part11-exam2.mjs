/**
 * Deploy B2 Exam Listening Part 11 (Cambridge Part 2): gap-fill + full audio (intro, 2 passes).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/deploy-part11-exam2.mjs [examSlot] [--audio-only] [--reuse-local-audio]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import { makeSilenceMp3 } from './listeningSilenceMp3.mjs';
import { formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';
import {
  concatMp3Buffers,
  uploadListeningClip,
  listeningCombinedDefaultTitle,
} from '../src/lib/levelsExamAudioStorage.js';
import { synthesizeListeningClipMp3, synthesizeExamTtsMp3 } from '../src/lib/levelsExamTts.js';
import { saveLevelExamPartFromPreview } from '../src/lib/levelsCambridgeExamGenerator.js';
import { getCachedLevelBySlug } from '../src/utils/levelsLevelCache.js';
import { formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

const examSlot = Number(process.argv.find((a) => /^\d+$/.test(a)) || 2);
const partNumber = 11;
const audioOnly = process.argv.includes('--audio-only');
const reuseLocalAudio = process.argv.includes('--reuse-local-audio');
const env = loadEnvLocal();

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewPath = path.join(root, 'scripts', 'generated', `preview-exam${examSlot}-part11-b2.json`);
const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
const { generated } = preview;
const assembly = generated.audioAssembly;
const INTRO_STORAGE_PATH = assembly.introFromSupabase || 'b2/shared/listening-part-2-intro.mp3';
const BUCKET = 'Levels_Listening';
const PART_DIRECTIONS = `Part:11\r\n\r\n${generated.directions || 'You will hear an interview. For questions 9–18, complete the sentences with a word or short phrase.'}`;

function buildGeneratedPayload() {
  const questions = generated.questions.map((q) => ({
    number: q.number,
    lead: q.lead,
    prompt: q.prompt,
    type: 'short',
  }));

  return {
    partTitle: generated.partTitle,
    title: generated.title,
    directions: generated.directions,
    setting: generated.setting,
    questions,
    modelAnswers: generated.modelAnswers,
    script: generated.script,
    audioClips: [
      {
        orden: 1,
        titulo: generated.audioClips?.[0]?.titulo || 'Listening Part 2 interview',
        text: generated.script,
        storagePath: assembly.combinedStoragePath || `b2/exam-${examSlot}/part-11/full-v1.mp3`,
      },
    ],
  };
}

async function fetchOrCreateIntro() {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  const encoded = INTRO_STORAGE_PATH.split('/').map(encodeURIComponent).join('/');
  const url = `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      console.error(`Intro: loaded from Supabase (${INTRO_STORAGE_PATH})`);
      return Buffer.from(await res.arrayBuffer());
    }
  } catch {
    /* synthesize */
  }

  const introText = generated.listeningIntro?.text?.trim();
  if (!introText) throw new Error('Missing listeningIntro.text');

  console.error('Intro: synthesizing with Edge TTS…');
  const tts = await synthesizeExamTtsMp3(introText, {
    edgeVoice: 'en-GB-SoniaNeural',
    preferEdge: true,
  });
  if (!tts?.base64) throw new Error('Intro TTS failed');

  const introBuf = Buffer.from(tts.base64, 'base64');
  const { error } = await admin.storage.from(BUCKET).upload(INTRO_STORAGE_PATH, introBuf, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (error) console.warn('Intro upload:', error.message);
  else console.error(`Intro uploaded → ${INTRO_STORAGE_PATH}`);

  return introBuf;
}

async function synthesizeInterviewPass(script) {
  const rate = assembly.listeningTtsRate || process.env.LISTENING_TTS_RATE || '-16%';
  console.error(`  Synthesizing interview (A/B voices, rate ${rate})…`);
  const result = await synthesizeListeningClipMp3(script, {
    extractIndex: 3,
    prosody: { rate },
  });
  if (!result?.base64) throw new Error('Interview TTS failed');
  const buf = Buffer.from(result.base64, 'base64');
  const sec = await getMp3DurationSec(buf);
  console.error(`    → ${formatDurationSec(sec)}`);
  return buf;
}

async function insertAlternateAnswers(preguntaId) {
  const alternates = Array.isArray(generated.alternateAnswers) ? generated.alternateAnswers : [];
  if (!alternates.length) return;

  const rows = alternates.map((alt) => ({
    pregunta_id_abierta: preguntaId,
    respuesta_texto: formatOpenRespuestaRow({
      questionNumber: alt.number,
      text: alt.answer,
    }),
  }));

  const { error } = await admin.from('levels_respuestas_abiertas').insert(rows);
  if (error) console.warn('Alternate answers insert:', error.message);
  else console.error(`  Added ${rows.length} alternate accepted answers`);
}

const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

console.error(`\n=== Deploy Part 11 (Listening Part 2) — B2 Examen ${examSlot}${audioOnly ? ' (audio only)' : ''} ===\n`);

let saveResult = { preguntaId: null };

if (!audioOnly) {
  console.error('Step 1/4: Save questions to Supabase…');
  const { data: levelData, error: levelErr } = await getCachedLevelBySlug(admin, 'b2');
  if (levelErr || !levelData?.id) {
    console.error('Level b2 not found', levelErr);
    process.exit(1);
  }

  saveResult = await saveLevelExamPartFromPreview(admin, {
    levelSlug: 'b2',
    levelId: levelData.id,
    examSlot,
    partNumber,
    generated: buildGeneratedPayload(),
    skipAudio: true,
    replacePartContent: true,
  });

  console.error(`  Saved preguntaId=${saveResult.preguntaId}`);
  await insertAlternateAnswers(saveResult.preguntaId);

  console.error('Step 2/4: Patch part directions…');
  await admin
    .from('levels_partes')
    .update({ Descripción: PART_DIRECTIONS })
    .eq('nombre_parte', `Parte ${partNumber} B2`);
} else {
  console.error('Step 1–2/4: Skipped — loading pregunta…');
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
    .select('id')
    .eq('examen_id', examenId)
    .eq('parte_id', parte.id)
    .single();
  if (!pregunta?.id) {
    console.error('No pregunta — run full deploy first');
    process.exit(1);
  }
  saveResult.preguntaId = pregunta.id;
  console.error(`  preguntaId=${saveResult.preguntaId}`);
}

console.error(`${audioOnly ? 'Step 3' : 'Step 3/4'}: Build full audio (intro + 2 passes)…`);

let combined;
if (reuseLocalAudio) {
  const sourcePath = path.join(outDir, 'exam2-part11-full.mp3');
  if (!existsSync(sourcePath)) {
    console.error(`Missing ${sourcePath} — run exam 2 deploy first or omit --reuse-local-audio`);
    process.exit(1);
  }
  combined = readFileSync(sourcePath);
  console.error(`  Reused local audio: ${sourcePath}`);
} else {
  const introBuf = await fetchOrCreateIntro();
  const pass1 = await synthesizeInterviewPass(generated.script);
  const pass2 = await synthesizeInterviewPass(generated.script);
  combined = concatMp3Buffers([
    introBuf,
    makeSilenceMp3(assembly.introPauseSec ?? 5),
    pass1,
    makeSilenceMp3(assembly.betweenPassesPauseSec ?? 10),
    pass2,
  ]);
}

const totalSec = await getMp3DurationSec(combined);
const minT = assembly.totalDurationTargetSec?.min ?? 330;
const maxT = assembly.totalDurationTargetSec?.max ?? 420;
const durationOk = totalSec >= minT && totalSec <= maxT;

console.error(
  `  Combined: ${formatDurationSec(totalSec)} [${durationOk ? 'OK' : `target ${formatDurationSec(minT)}–${formatDurationSec(maxT)}`}]`,
);

const localPath = path.join(outDir, `exam${examSlot}-part11-full.mp3`);
writeFileSync(localPath, combined);

const storagePath =
  assembly.combinedStoragePath || `b2/exam-${examSlot}/part-11/full-v1.mp3`;

console.error(`${audioOnly ? 'Step 4' : 'Step 4/4'}: Upload audio…`);
const audio_url = await uploadListeningClip(admin, {
  path: storagePath,
  audioBuffer: combined,
  contentType: 'audio/mpeg',
});

await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', saveResult.preguntaId);
const { error: audioErr } = await admin.from('levels_preguntas_audios').insert({
  pregunta_id: saveResult.preguntaId,
  audio_url,
  orden: 1,
  titulo: listeningCombinedDefaultTitle(partNumber, generated.setting),
});
if (audioErr) throw new Error(audioErr.message);

const report = {
  ok: true,
  examSlot,
  preguntaId: saveResult.preguntaId,
  audio_url,
  storagePath,
  durationSec: totalSec,
  durationFormatted: formatDurationSec(totalSec),
  durationOk,
  answerKey: Object.fromEntries(generated.modelAnswers.map((m) => [m.number, m.answer])),
  alternates: generated.alternateAnswers || [],
};

writeFileSync(path.join(outDir, `deploy-part11-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
