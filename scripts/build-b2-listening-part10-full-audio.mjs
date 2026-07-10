/**
 * Build B2 Exam 1 Listening Part 10 — single MP3 with:
 *   intro (Supabase or TTS once) → 5 s pause → pass 1 (8 extracts, 3 s between)
 *   → 10 s pause → pass 2 (same extracts)
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/build-b2-listening-part10-full-audio.mjs [examSlot] [--generate-intro]
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

const examSlot = Number(process.argv.find((a) => /^\d+$/.test(a)) || 1);
const generateIntro = process.argv.includes('--generate-intro');
const partNumber = 10;

const env = loadEnvLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
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

async function fetchIntroBuffer() {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  const encoded = INTRO_STORAGE_PATH.split('/').map(encodeURIComponent).join('/');
  const url = `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;

  if (!generateIntro) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.error(`Intro: loaded from Supabase (${INTRO_STORAGE_PATH})`);
        return Buffer.from(await res.arrayBuffer());
      }
      console.error(`Intro not in Supabase (${res.status}) — synthesizing from text…`);
    } catch {
      console.error('Intro fetch failed — synthesizing from text…');
    }
  }

  const introText = generated.listeningIntro?.text?.trim();
  if (!introText) throw new Error('Missing listeningIntro.text in preview JSON');

  const tts = await synthesizeExamTtsMp3(introText, {
    edgeVoice: 'en-GB-SoniaNeural',
    preferEdge: true,
  });
  if (!tts?.base64) throw new Error('Intro TTS failed');

  const introBuf = Buffer.from(tts.base64, 'base64');

  if (generateIntro || process.argv.includes('--upload-intro')) {
    const { error } = await admin.storage.from(BUCKET).upload(INTRO_STORAGE_PATH, introBuf, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
    if (error) console.warn('Intro upload warning:', error.message);
    else console.error(`Intro uploaded → ${INTRO_STORAGE_PATH}`);
  }

  return introBuf;
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
    .select('id')
    .eq('examen_id', examenId)
    .eq('parte_id', parte.id)
    .single();
  return pregunta;
}

async function buildExtractPass(questions) {
  const parts = [];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    console.error(`  TTS Q${q.number}…`);
    const result = await synthesizeListeningClipMp3(q.script, { extractIndex: i });
    if (!result?.base64) throw new Error(`TTS failed Q${q.number}`);
    const buf = Buffer.from(result.base64, 'base64');
    const sec = await getMp3DurationSec(buf);
    console.error(`    → ${formatDurationSec(sec)}`);
    parts.push(buf);
    if (i < questions.length - 1) {
      parts.push(makeSilenceMp3(assembly.betweenExtractPauseSec ?? 3));
    }
  }
  return concatMp3Buffers(parts);
}

const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

console.error(`\n=== Build Part 10 full audio — Examen ${examSlot} ===\n`);

const questions = generated.questions.sort((a, b) => a.number - b.number);
const introBuf = await fetchIntroBuffer();
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
  `\nCombined: ${formatDurationSec(totalSec)} [${durationOk ? 'OK' : `target ${formatDurationSec(minT)}–${formatDurationSec(maxT)}`}]`,
);

const localPath = path.join(outDir, `exam${examSlot}-part10-full.mp3`);
writeFileSync(localPath, combined);
console.error(`Saved locally: ${localPath}`);

const pregunta = await loadPart10Pregunta();
const storagePath =
  assembly.combinedStoragePath ||
  listeningCombinedStoragePath({ levelLabel: 'B2', examSlot, partNumber, revision: 'v4' });

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
  titulo: listeningCombinedDefaultTitle(partNumber, generated.setting),
});
if (error) throw new Error(error.message);

const report = {
  ok: true,
  examSlot,
  preguntaId: pregunta.id,
  audio_url,
  storagePath,
  durationSec: totalSec,
  durationFormatted: formatDurationSec(totalSec),
  durationOk,
  targetRange: `${formatDurationSec(minT)}–${formatDurationSec(maxT)}`,
  answerKey: Object.fromEntries(generated.modelAnswers.map((m) => [m.number, m.answer])),
};

writeFileSync(path.join(outDir, `build-part10-exam${examSlot}-result.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
