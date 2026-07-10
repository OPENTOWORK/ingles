/**
 * Deploy B2 Exam Listening Part 12 (Cambridge Part 3): multiple matching + full audio.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/deploy-part12-exam.mjs [examSlot] [--audio-only]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
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

const examSlot = Number(process.argv.find((a) => /^\d+$/.test(a)) || 1);
const partNumber = 12;
const audioOnly = process.argv.includes('--audio-only');
const env = loadEnvLocal();

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewPath = path.join(root, 'scripts', 'generated', `preview-exam${examSlot}-part12-b2.json`);
const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
const { generated } = preview;
const assembly = generated.audioAssembly || {};
const INTRO_STORAGE_PATH = assembly.introFromSupabase || 'b2/shared/listening-part-3-intro.mp3';
const BUCKET = 'Levels_Listening';
const PART_DIRECTIONS = `Part:12\r\n\r\n${generated.directions || 'Five speakers — multiple matching A–H.'}`;

function stripSpeakerLabel(text) {
  return String(text || '')
    .replace(/^Speaker\s+\d+\s*:\s*/i, '')
    .trim();
}

function buildGeneratedPayload() {
  const audioClips = generated.audioClips.map((c) => ({
    orden: c.orden,
    titulo: c.titulo,
    text: c.text,
  }));

  return {
    partTitle: generated.partTitle,
    title: generated.title,
    directions: generated.directions,
    setting: generated.setting,
    matchingIntro: generated.matchingIntro,
    optionPool: generated.optionPool,
    matchingAnswers: generated.matchingAnswers,
    questions: generated.questions,
    modelAnswers: generated.modelAnswers,
    script: generated.script,
    audioClips,
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

  console.error('Intro: synthesizing…');
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

async function buildSpeakerPass(clips) {
  const rate = assembly.listeningTtsRate || process.env.LISTENING_TTS_RATE || '-13%';
  const minSec = assembly.extractDurationTargetSec?.min ?? 30;
  const maxSec = assembly.extractDurationTargetSec?.max ?? 45;
  const parts = [];
  for (let i = 0; i < clips.length; i += 1) {
    const clip = clips[i];
    const body = stripSpeakerLabel(clip.text);
    console.error(`  TTS Speaker ${clip.orden}…`);
    const result = await synthesizeListeningClipMp3(body, {
      extractIndex: i,
      prosody: { rate },
    });
    if (!result?.base64) throw new Error(`TTS failed Speaker ${clip.orden}`);
    const buf = Buffer.from(result.base64, 'base64');
    const sec = await getMp3DurationSec(buf);
    const ok = sec >= minSec && sec <= maxSec;
    console.error(`    → ${formatDurationSec(sec)}${ok ? '' : ` [target ${minSec}–${maxSec}s]`}`);
    parts.push(buf);
    if (i < clips.length - 1) {
      parts.push(makeSilenceMp3(assembly.betweenExtractPauseSec ?? 3));
    }
  }
  return concatMp3Buffers(parts);
}

const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

console.error(`\n=== Deploy Part 12 (Listening Part 3) — B2 Examen ${examSlot}${audioOnly ? ' (audio only)' : ''} ===\n`);

let saveResult = { preguntaId: null };
const clips = [...generated.audioClips].sort((a, b) => a.orden - b.orden);

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

  console.error(`  Saved preguntaId=${saveResult.preguntaId} (40 MCQ rows expected)`);

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

console.error(`${audioOnly ? 'Step 3' : 'Step 3/4'}: Build full audio (intro + 2 passes × 5 speakers)…`);
const introBuf = await fetchOrCreateIntro();
const pass1 = await buildSpeakerPass(clips);
const pass2 = await buildSpeakerPass(clips);

const combined = concatMp3Buffers([
  introBuf,
  makeSilenceMp3(assembly.introPauseSec ?? 5),
  pass1,
  makeSilenceMp3(assembly.betweenPassesPauseSec ?? 10),
  pass2,
]);

const totalSec = await getMp3DurationSec(combined);
const minT = assembly.totalDurationTargetSec?.min ?? 480;
const maxT = assembly.totalDurationTargetSec?.max ?? 600;
const durationOk = totalSec >= minT && totalSec <= maxT;

console.error(
  `  Combined: ${formatDurationSec(totalSec)} [${durationOk ? 'OK' : `target ${formatDurationSec(minT)}–${formatDurationSec(maxT)}`}]`,
);

const localPath = path.join(outDir, `exam${examSlot}-part12-full.mp3`);
writeFileSync(localPath, combined);

const storagePath =
  generated.combinedStoragePath || assembly.combinedStoragePath || `b2/exam-${examSlot}/part-12/full-v1.mp3`;

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
  answerKey: Object.fromEntries(generated.matchingAnswers.map((m) => [m.number, m.answer])),
  unusedOptions: generated.unusedOptions || ['A', 'D', 'F'],
};

writeFileSync(path.join(outDir, `deploy-part12-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
