import { B2_EXAM_PARTS } from '@/lib/b2ExamCatalog';
import {
  deleteExamenContent,
  deletePartContentForExam,
} from '@/lib/levelsExamPersist';
import { ensureB2ExamenRow, ensureB2ParteRow } from '@/lib/levelsB2ExamGenerator';

function randomSlot(pool = [1, 2, 3, 4, 5]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

async function getExamenIdBySlot(db, levelId, slot) {
  const { data, error } = await db
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .ilike('nombre', `%Examen ${slot}%`)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function copyPartFromSource(db, { levelId, targetExamenId, parteId, sourceExamenId }) {
  const { data: sourcePregunta, error: spErr } = await db
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', sourceExamenId)
    .eq('parte_id', parteId)
    .eq('level_id', levelId)
    .maybeSingle();
  if (spErr) throw new Error(`source pregunta: ${spErr.message}`);
  if (!sourcePregunta?.id) return null;

  const { data: newPregunta, error: npErr } = await db
    .from('levels_preguntas')
    .insert({
      level_id: levelId,
      examen_id: targetExamenId,
      parte_id: parteId,
      enunciado: sourcePregunta.enunciado,
    })
    .select('id')
    .single();
  if (npErr) throw new Error(`levels_preguntas: ${npErr.message}`);

  const { data: mcq } = await db
    .from('levels_respuestas')
    .select('respuesta, correcta')
    .eq('pregunta_id', sourcePregunta.id);
  if (mcq?.length) {
    const { error } = await db.from('levels_respuestas').insert(
      mcq.map((r) => ({
        pregunta_id: newPregunta.id,
        respuesta: r.respuesta,
        correcta: r.correcta,
      })),
    );
    if (error) throw new Error(`levels_respuestas: ${error.message}`);
  }

  const { data: open } = await db
    .from('levels_respuestas_abiertas')
    .select('respuesta_texto')
    .eq('pregunta_id_abierta', sourcePregunta.id);
  if (open?.length) {
    const { error } = await db.from('levels_respuestas_abiertas').insert(
      open.map((r) => ({
        pregunta_id_abierta: newPregunta.id,
        respuesta_texto: r.respuesta_texto,
      })),
    );
    if (error) throw new Error(`levels_respuestas_abiertas: ${error.message}`);
  }

  const { data: audios } = await db
    .from('levels_preguntas_audios')
    .select('audio_url, orden, titulo')
    .eq('pregunta_id', sourcePregunta.id);
  if (audios?.length) {
    const { error } = await db.from('levels_preguntas_audios').insert(
      audios.map((a) => ({
        pregunta_id: newPregunta.id,
        audio_url: a.audio_url,
        orden: a.orden,
        titulo: a.titulo,
      })),
    );
    if (error) throw new Error(`levels_preguntas_audios: ${error.message}`);
  }

  return { preguntaId: newPregunta.id, sourcePreguntaId: sourcePregunta.id };
}

/**
 * Crea el examen destino mezclando cada parte desde un examen fuente aleatorio (1–5).
 * No usa OpenAI; útil cuando la cuota API no está disponible.
 */
export async function cloneB2ExamRandomMashup(db, { levelId, targetSlot, sourcePool = [1, 2, 3, 4, 5] }) {
  const targetExamenId = await ensureB2ExamenRow(db, levelId, targetSlot);
  await deleteExamenContent(db, targetExamenId);

  const sourceIds = {};
  for (const s of sourcePool) {
    sourceIds[s] = await getExamenIdBySlot(db, levelId, s);
  }

  /** En Supabase solo hay preguntas para partes 1–13; speaking (14–17) va por UI + fotos fijas. */
  const cloneParts = B2_EXAM_PARTS.filter((p) => p.partNumber <= 13);

  const results = [];
  for (const partDef of cloneParts) {
    const parteId = await ensureB2ParteRow(db, partDef.partNumber);
    await deletePartContentForExam(db, targetExamenId, parteId);

    let copied = null;
    let sourceSlot = null;
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
    for (const slot of shuffled) {
      const sourceExamenId = sourceIds[slot];
      if (!sourceExamenId) continue;
      copied = await copyPartFromSource(db, {
        levelId,
        targetExamenId,
        parteId,
        sourceExamenId,
      });
      if (copied) {
        sourceSlot = slot;
        break;
      }
    }

    if (!copied) {
      throw new Error(`No hay contenido fuente para Parte ${partDef.partNumber} B2 en exámenes ${sourcePool.join(', ')}`);
    }

    results.push({
      partNumber: partDef.partNumber,
      sourceSlot,
      preguntaId: copied.preguntaId,
    });
  }

  return {
    examenId: targetExamenId,
    targetSlot,
    parts: results,
    message: `Examen ${targetSlot} B2 creado (mashup aleatorio de exámenes ${sourcePool.join(', ')}).`,
  };
}
