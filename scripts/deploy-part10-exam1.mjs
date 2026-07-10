/**
 * Deploy B2 Exam 1 Listening Part 10: save MCQ content + build single full audio (intro, 2 passes, pauses).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/deploy-part10-exam1.mjs [examSlot]
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
  listeningCombinedStoragePath,
  uploadListeningClip,
  listeningCombinedDefaultTitle,
} from '../src/lib/levelsExamAudioStorage.js';
import { synthesizeListeningClipMp3, synthesizeExamTtsMp3 } from '../src/lib/levelsExamTts.js';
import { saveLevelExamPartFromPreview } from '../src/lib/levelsCambridgeExamGenerator.js';
import { getCachedLevelBySlug } from '../src/utils/levelsLevelCache.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 10;
const audioOnly = process.argv.includes('--audio-only');
const env = loadEnvLocal();

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewPath = path.join(root, 'scripts', 'generated', 'preview-exam1-part10-b2.json');
const preview = JSON.parse(readFileSync(previewPath, 'utf8'));
const { generated } = preview;
const assembly = generated.audioAssembly;
const INTRO_STORAGE_PATH = assembly.introFromSupabase || 'b2/shared/listening-part-1-intro.mp3';
const BUCKET = 'Levels_Listening';
const PART_DIRECTIONS =
  'Part:10\r\n\r\nYou will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).';

function buildGeneratedPayload() {
  const questions = generated.questions.map((q) => ({
    number: q.number,
    situation: q.situation,
    prompt: q.prompt,
    options: q.options,
    script: q.script,
  }));

  return {
    partTitle: generated.partTitle,
    title: generated.title,
    directions: generated.directions,
    setting: generated.setting,
    questions,
    modelAnswers: generated.modelAnswers,
    script: questions.map((q) => q.script).join('\n\n'),
    audioClips: questions.map((q) => ({
      orden: q.number,
      titulo: q.situation || `Extract ${q.number}`,
      text: q.script,
    })),
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

async function buildExtractPass(questions) {
  const ttsRate = assembly.ttsRate ?? process.env.LISTENING_TTS_RATE ?? '-12%';
  const minSec = assembly.extractDurationTargetSec?.min ?? 30;
  const maxSec = assembly.extractDurationTargetSec?.max ?? 45;
  const durations = [];
  const parts = [];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    console.error(`  TTS Q${q.number} (${q.situation?.slice(0, 40) || 'extract'})…`);
    const result = await synthesizeListeningClipMp3(q.script, {
      extractIndex: i,
      prosody: { rate: ttsRate },
    });
    if (!result?.base64) throw new Error(`TTS failed Q${q.number}`);
    const buf = Buffer.from(result.base64, 'base64');
    const sec = await getMp3DurationSec(buf);
    durations.push({ number: q.number, sec });
    const ok = sec >= minSec && sec <= maxSec;
    console.error(`    → ${formatDurationSec(sec)}${ok ? '' : ` [target ${minSec}–${maxSec}s]`}`);
    parts.push(buf);
    if (i < questions.length - 1) {
      parts.push(makeSilenceMp3(assembly.betweenExtractPauseSec ?? 3));
    }
  }
  const outOfRange = durations.filter((d) => d.sec < minSec || d.sec > maxSec);
  if (outOfRange.length) {
    console.warn(
      `  Warning: ${outOfRange.length} extract(s) outside ${minSec}–${maxSec}s:`,
      outOfRange.map((d) => `Q${d.number}=${d.sec.toFixed(1)}s`).join(', '),
    );
  }
  return concatMp3Buffers(parts);
}

const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

console.error(`\n=== Deploy Part 10 — B2 Examen ${examSlot}${audioOnly ? ' (audio only)' : ''} ===\n`);

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

  console.error('Step 2/4: Patch part directions…');
  await admin
    .from('levels_partes')
    .update({ Descripción: PART_DIRECTIONS })
    .eq('nombre_parte', `Parte ${partNumber} B2`);
} else {
  console.error('Step 1–2/4: Skipped (audio only) — loading pregunta…');
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
    console.error('No pregunta found — run full deploy first');
    process.exit(1);
  }
  saveResult.preguntaId = pregunta.id;
  console.error(`  preguntaId=${saveResult.preguntaId}`);
}

console.error(`${audioOnly ? 'Step 3' : 'Step 3/4'}: Synthesize full listening audio (intro + 2 passes)…`);
const questions = [...generated.questions].sort((a, b) => a.number - b.number);
const introBuf = await fetchOrCreateIntro();
const pass1 = await buildExtractPass(questions);
const pass2 = await buildExtractPass(questions);

const combined = concatMp3Buffers([
  introBuf,
  makeSilenceMp3(assembly.introPauseSec ?? 5),
  pass1,
  makeSilenceMp3(assembly.betweenPassesPauseSec ?? 10),
  pass2,
]);

const totalSec = await getMp3DurationSec(combined);
const minT = assembly.totalDurationTargetSec?.min ?? 570;
const maxT = assembly.totalDurationTargetSec?.max ?? 660;
const durationOk = totalSec >= minT && totalSec <= maxT;

console.error(
  `  Combined duration: ${formatDurationSec(totalSec)} [${durationOk ? 'OK' : `target ${formatDurationSec(minT)}–${formatDurationSec(maxT)}`}]`,
);

const localPath = path.join(outDir, `exam${examSlot}-part10-full.mp3`);
writeFileSync(localPath, combined);
console.error(`  Local copy: ${localPath}`);

console.error(`${audioOnly ? 'Step 4' : 'Step 4/4'}: Upload combined audio…`);
const storagePath =
  assembly.combinedStoragePath ||
  listeningCombinedStoragePath({ levelLabel: 'B2', examSlot, partNumber, revision: 'v4' });

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
  mcqCount: 24,
};

writeFileSync(path.join(outDir, `deploy-part10-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
