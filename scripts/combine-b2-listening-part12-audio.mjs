/**
 * Combina los 5 clips de Listening Part 3 (parte 12) en un solo MP3 y actualiza la BD.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/combine-b2-listening-part12-audio.mjs [examSlot]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import {
  concatMp3Buffers,
  listeningCombinedDefaultTitle,
  listeningCombinedStoragePath,
  uploadListeningClip,
} from '../src/lib/levelsExamAudioStorage.js';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';

const examSlot = Number(process.argv[2] || 1);
const partNumber = 12;
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel b2 no encontrado');
  process.exit(1);
}

const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id)
  .order('nombre');

const examen = (examenes || [])[examSlot - 1];
if (!examen?.id) {
  console.error(`Examen slot ${examSlot} no encontrado`);
  process.exit(1);
}

const { data: parte } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', `Parte ${partNumber} B2`)
  .maybeSingle();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id')
  .eq('examen_id', examen.id)
  .eq('parte_id', parte.id)
  .maybeSingle();

if (!pregunta?.id) {
  console.error(`No hay pregunta para parte ${partNumber}`);
  process.exit(1);
}

const { data: audioRows } = await admin
  .from('levels_preguntas_audios')
  .select('id, orden, titulo, audio_url')
  .eq('pregunta_id', pregunta.id)
  .order('orden');

if (!audioRows?.length) {
  console.error('Sin audios en levels_preguntas_audios');
  process.exit(1);
}

if (audioRows.length === 1) {
  console.log('Ya hay un solo audio — nada que combinar.');
  process.exit(0);
}

console.error(`Combinando ${audioRows.length} clips del examen ${examSlot} (parte ${partNumber})…`);

const buffers = [];
for (const row of audioRows) {
  const res = await fetch(row.audio_url);
  if (!res.ok) throw new Error(`No se pudo descargar clip ${row.orden}: ${res.status}`);
  buffers.push(Buffer.from(await res.arrayBuffer()));
  console.error(`  ✓ clip ${row.orden} (${buffers[buffers.length - 1].length} bytes)`);
}

const combined = concatMp3Buffers(buffers);
const storagePath = listeningCombinedStoragePath({
  levelLabel: 'B2',
  examSlot,
  partNumber,
  revision: 'v2',
});

const audio_url = await uploadListeningClip(admin, {
  path: storagePath,
  audioBuffer: combined,
  contentType: 'audio/mpeg',
});

const durationSec = await getMp3DurationSec(combined);
const targets = getB2ListeningAudioTargets(partNumber);
const durationOk =
  durationSec >= (targets?.totalMinSec ?? 180) &&
  durationSec <= (targets?.totalMaxSec ?? 240);

console.error(`  → full audio: ${formatDurationSec(durationSec)} [${durationOk ? 'OK' : 'revisar rango'}]`);

await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', pregunta.id);

const { error } = await admin.from('levels_preguntas_audios').insert({
  pregunta_id: pregunta.id,
  audio_url,
  orden: 1,
  titulo: listeningCombinedDefaultTitle(partNumber),
});

if (error) throw new Error(error.message);

console.log(
  JSON.stringify(
    {
      ok: true,
      examSlot,
      partNumber,
      preguntaId: pregunta.id,
      audio_url,
      durationSec,
      durationFormatted: formatDurationSec(durationSec),
      durationOk,
    },
    null,
    2,
  ),
);
