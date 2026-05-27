/**
 * Genera audios TTS para listening del Examen 6 B2 (partes 10–13).
 * Uso: node scripts/synth-b2-exam6-audio.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  buildAnswerRowsFromGenerated,
  formatMcqRespuestaRow,
} from '../src/lib/formatLevelsEnunciado.js';
import { listeningClipStoragePath } from '../src/lib/levelsExamAudioStorage.js';

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Falta Supabase en .env.local');
  process.exit(1);
}
const { B2_EXAM_PARTS } = await import('../src/lib/b2ExamCatalog.js');
const { getB2Exam6GeneratedPart } = await import('../src/lib/b2Exam6ContentBuilder.js');
const { extractListeningClipsFromGenerated, uploadListeningClip } = await import(
  '../src/lib/levelsExamAudioStorage.js'
);
const { synthesizeExamTtsMp3 } = await import('../src/lib/levelsExamTts.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: exam } = await admin
  .from('levels_examenes')
  .select('id')
  .eq('level_id', level.id)
  .ilike('nombre', '%Examen 6%')
  .maybeSingle();

if (!exam?.id) {
  console.error('Examen 6 B2 no encontrado');
  process.exit(1);
}

const listeningParts = B2_EXAM_PARTS.filter((p) => p.needsAudio);

for (const partDef of listeningParts) {
  const pn = partDef.partNumber;
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${pn} B2`)
    .single();

  const { data: pregunta } = await admin
    .from('levels_preguntas')
    .select('id')
    .eq('examen_id', exam.id)
    .eq('parte_id', parte.id)
    .maybeSingle();

  if (!pregunta?.id) {
    console.warn(`Sin pregunta parte ${pn}`);
    continue;
  }

  await admin.from('levels_preguntas_audios').delete().eq('pregunta_id', pregunta.id);

  const generated = getB2Exam6GeneratedPart(pn);
  const clips = extractListeningClipsFromGenerated(generated, partDef).map((clip) => ({
    ...clip,
    storagePath: listeningClipStoragePath({
      levelLabel: 'B2',
      examSlot: 6,
      partNumber: pn,
      orden: clip.orden,
      revision: 'v3',
    }),
  }));
  const rows = [];

  for (const clip of clips) {
    const script = String(clip.text || '').trim();
    if (!script) {
      console.warn(`  Part ${pn} clip ${clip.orden}: sin guion`);
      continue;
    }
    const result = await synthesizeExamTtsMp3(script);
    if (!result?.base64) {
      console.warn(`  Part ${pn} clip ${clip.orden}: TTS omitido`);
      continue;
    }
    const buf = Buffer.from(result.base64, 'base64');
    const audio_url = await uploadListeningClip(admin, {
      path: clip.storagePath,
      audioBuffer: buf,
      contentType: result.mime,
    });
    rows.push({
      pregunta_id: pregunta.id,
      audio_url,
      orden: clip.orden,
      titulo: `Extract ${clip.orden}`,
    });
    console.log(`  Part ${pn} clip ${clip.orden} OK (${buf.length} bytes) → ${clip.storagePath}`);
  }

  if (rows.length) {
    const { error } = await admin.from('levels_preguntas_audios').insert(rows);
    if (error) throw new Error(error.message);
  }

  // Parte 13: corregir letra correcta pregunta 25 (H transport links)
  if (pn === 13) {
    const { mcq } = buildAnswerRowsFromGenerated(generated);
    const q25 = mcq.filter((r) => r.questionNumber === 25);
    if (q25.length) {
      await admin.from('levels_respuestas').delete().eq('pregunta_id', pregunta.id).like('respuesta', '25 %');
      const rows25 = q25.map((row) => ({
        pregunta_id: pregunta.id,
        respuesta: formatMcqRespuestaRow({
          questionNumber: row.questionNumber,
          letter: row.letter,
          text: row.text,
        }),
        correcta: Boolean(row.correcta),
      }));
      await admin.from('levels_respuestas').insert(rows25);
      console.log('  Part 13: respuestas pregunta 25 actualizadas (H correcta)');
    }
  }
}

console.log('Audios Examen 6 B2 completados.');
