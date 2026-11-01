import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { deletePartContentForExam, findLevelExamenRowBySlot } from '../src/lib/levelsExamPersist.js';
import { uploadListeningClip } from '../src/lib/levelsExamAudioStorage.js';
import { formatMcqRespuestaRow, formatOpenRespuestaRow } from '../src/lib/formatLevelsEnunciado.js';

export async function installB2ListeningExam(db, level, parteId, exam) {
  const examen = await findLevelExamenRowBySlot(db, level.id, exam.slot);
  if (!examen) throw new Error(`No B2 exam slot ${exam.slot}`);
  console.log(`Examen ${exam.slot}: ${examen.nombre} (${examen.id})`);

  for (const part of exam.parts) {
    const parte = parteId[part.partNumber];
    if (!parte) throw new Error(`Missing Parte ${part.partNumber} B2`);
    await deletePartContentForExam(db, examen.id, parte, { levelSlug: 'b2', partNumber: part.partNumber });

    const { data: pregunta, error: pqErr } = await db
      .from('levels_preguntas')
      .insert({
        level_id: level.id,
        examen_id: examen.id,
        parte_id: parte,
        enunciado: part.enunciado,
      })
      .select('id')
      .single();
    if (pqErr) throw new Error(`levels_preguntas ${exam.slot}/${part.partNumber}: ${pqErr.message}`);

    if (part.mcq) {
      const rows = [];
      for (const [number, correct, options] of part.mcq) {
        for (const [letter, text] of options) {
          rows.push({
            pregunta_id: pregunta.id,
            respuesta: formatMcqRespuestaRow({ questionNumber: number, letter, text }),
            correcta: letter === correct,
          });
        }
      }
      const { error } = await db.from('levels_respuestas').insert(rows);
      if (error) throw new Error(`levels_respuestas ${exam.slot}/${part.partNumber}: ${error.message}`);
    }

    if (part.open) {
      const rows = [];
      for (const [number, variants] of Object.entries(part.open)) {
        for (const text of variants) {
          rows.push({
            pregunta_id_abierta: pregunta.id,
            respuesta_texto: formatOpenRespuestaRow({ questionNumber: Number(number), text }),
          });
        }
      }
      const { error } = await db.from('levels_respuestas_abiertas').insert(rows);
      if (error) throw new Error(`levels_respuestas_abiertas ${exam.slot}/${part.partNumber}: ${error.message}`);
    }

    if (part.matching) {
      const rows = [];
      for (const [number, correct] of Object.entries(part.matching)) {
        for (const letter of 'ABCDEFGH') {
          rows.push({
            pregunta_id: pregunta.id,
            respuesta: formatMcqRespuestaRow({ questionNumber: Number(number), letter, text: '' }),
            correcta: letter === correct,
          });
        }
      }
      const { error } = await db.from('levels_respuestas').insert(rows);
      if (error) throw new Error(`levels_respuestas matching ${exam.slot}/${part.partNumber}: ${error.message}`);
    }

    const nn = String(exam.slot).padStart(2, '0');
    const audioPath = path.join(process.env.TEMP, `exam${nn}-listening-docx`, `EXAM ${nn}`, part.file);
    const audioBuffer = readFileSync(audioPath);
    const storagePath = `b2/exam-${exam.slot}/part-${part.partNumber}/full-exam${nn}.mp3`;
    const audioUrl = await uploadListeningClip(db, { path: storagePath, audioBuffer });
    const { error: audioErr } = await db.from('levels_preguntas_audios').insert({
      pregunta_id: pregunta.id,
      audio_url: audioUrl,
      orden: 1,
      titulo: part.title,
    });
    if (audioErr) throw new Error(`levels_preguntas_audios ${exam.slot}/${part.partNumber}: ${audioErr.message}`);
    const head = await fetch(audioUrl, { method: 'HEAD' });
    console.log(
      `  Parte ${part.partNumber}: pregunta ${pregunta.id}, audio ${head.status} ${(audioBuffer.length / 1e6).toFixed(1)} MB`,
    );
  }
}

export function createListeningDb() {
  const env = loadEnvLocal();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials in .env.local');
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function loadB2ListeningContext(db) {
  const { data: level, error: levelErr } = await db.from('levels').select('id, nombre').ilike('nombre', 'b2').single();
  if (levelErr || !level) throw new Error(levelErr?.message || 'No B2 level');
  const { data: partes, error: partesErr } = await db
    .from('levels_partes')
    .select('id, nombre_parte')
    .in('nombre_parte', [10, 11, 12, 13].map((n) => `Parte ${n} B2`));
  if (partesErr) throw new Error(partesErr.message);
  const parteId = Object.fromEntries(
    (partes || []).map((p) => [Number(String(p.nombre_parte).match(/\d+/)?.[0]), p.id]),
  );
  return { level, parteId };
}
