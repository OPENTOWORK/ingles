import {
  buildAnswerRowsFromGenerated,
  buildEnunciadoFromGenerated,
  formatMcqRespuestaRow,
  formatOpenRespuestaRow,
} from '@/lib/formatLevelsEnunciado';
import { parteNameA2, examenNameA2 } from '@/lib/a2ExamCatalog';
import { examenNameForLevel } from '@/lib/levelsExamCatalog';
import { getA2ParteAdminDescription } from '@/data/a2-parte-admin-spec';
import { partInfo as a2ListeningInfo } from '@/data/part-info/a2-listening';
import { partInfo as a2RwInfo } from '@/data/part-info/a2-reading-and-use-of-english';
import { partInfo as a2SpeakingInfo } from '@/data/part-info/a2-speaking';

function partDescriptionFor(partNumber) {
  const n = Number(partNumber);
  const admin = getA2ParteAdminDescription(n);
  const info =
    a2RwInfo[String(n)] ||
    a2RwInfo[String(n <= 7 ? n : n - 7)] ||
    a2ListeningInfo[String(n)] ||
    a2SpeakingInfo[String(n)] ||
    {};
  const tips = info.tips ? `Tips: ${info.tips}` : '';
  return [admin, tips].filter(Boolean).join('\n\n');
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function ensureA2ParteRow(db, partNumber, { refreshDescription = false } = {}) {
  const nombre = parteNameA2(partNumber);
  const { data: existing } = await db
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', nombre)
    .maybeSingle();

  const descripcion = partDescriptionFor(partNumber);

  if (existing?.id) {
    const hasDesc = Boolean(existing.Descripción || existing['Descripción']);
    if (refreshDescription || !hasDesc) {
      await db.from('levels_partes').update({ Descripción: descripcion }).eq('id', existing.id);
    }
    return existing.id;
  }

  const { data: inserted, error } = await db
    .from('levels_partes')
    .insert({ nombre_parte: nombre, Descripción: descripcion })
    .select('id')
    .single();

  if (error) throw new Error(`levels_partes: ${error.message}`);
  return inserted.id;
}

export async function ensureA2ExamenRow(db, levelId, slot) {
  const nombre = examenNameA2(slot);
  const { data: existing } = await db
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', levelId)
    .ilike('nombre', nombre)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await db
    .from('levels_examenes')
    .insert({ level_id: levelId, nombre })
    .select('id')
    .single();

  if (error) throw new Error(`levels_examenes: ${error.message}`);
  return inserted.id;
}

export async function examHasPreguntas(db, examenId, levelId) {
  const { count, error } = await db
    .from('levels_preguntas')
    .select('id', { count: 'exact', head: true })
    .eq('examen_id', examenId)
    .eq('level_id', levelId);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function resolveA2ExamenId(db, levelId, slot) {
  const nombre = examenNameA2(slot);
  const { data: existing } = await db
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .ilike('nombre', nombre)
    .maybeSingle();
  return existing?.id || null;
}

export async function resolveLevelExamenId(db, levelSlug, levelId, slot) {
  const nombre = examenNameForLevel(levelSlug, slot);
  const { data: existing } = await db
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .ilike('nombre', `%Examen ${slot}%`)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: byName } = await db
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .ilike('nombre', nombre)
    .maybeSingle();
  return byName?.id || null;
}

export async function deleteExamenContent(db, examenId) {
  const { data: preguntas } = await db.from('levels_preguntas').select('id').eq('examen_id', examenId);
  const ids = (preguntas || []).map((p) => p.id);
  if (!ids.length) return;

  await db.from('levels_preguntas_audios').delete().in('pregunta_id', ids);
  await db.from('levels_respuestas_abiertas').delete().in('pregunta_id_abierta', ids);
  await db.from('levels_respuestas').delete().in('pregunta_id', ids);
  await db.from('levels_preguntas').delete().eq('examen_id', examenId);
}

/** Borra contenido del examen y la fila en levels_examenes. */
export async function deleteExamenFully(db, examenId) {
  if (!examenId) return { deleted: false, examenId: null };

  await deleteExamenContent(db, examenId);
  const { error } = await db.from('levels_examenes').delete().eq('id', examenId);
  if (error) throw new Error(`levels_examenes: ${error.message}`);
  return { deleted: true, examenId };
}

/** Borra preguntas previas de una parte en un examen (evita duplicados al regenerar parte a parte). */
export async function deletePartContentForExam(db, examenId, parteId) {
  const { data: preguntas } = await db
    .from('levels_preguntas')
    .select('id')
    .eq('examen_id', examenId)
    .eq('parte_id', parteId);
  const ids = (preguntas || []).map((p) => p.id);
  if (!ids.length) return;

  await db.from('levels_preguntas_audios').delete().in('pregunta_id', ids);
  await db.from('levels_respuestas_abiertas').delete().in('pregunta_id_abierta', ids);
  await db.from('levels_respuestas').delete().in('pregunta_id', ids);
  await db.from('levels_preguntas').delete().in('id', ids);
}

/**
 * Persiste una parte generada (una levels_preguntas + respuestas + audios).
 */
export async function persistGeneratedPart(db, {
  levelId,
  examenId,
  parteId,
  partNumber,
  examSlot,
  generated,
  partDef,
  skipAudio = false,
  skipImages = false,
}) {
  let payload = generated;
  const pn = partDef?.partNumber ?? partNumber;

  if (!skipImages) {
    const { partNeedsGeneratedImages, attachGeneratedImages } = await import(
      '@/lib/levelsExamImageStorage'
    );
    if (partNeedsGeneratedImages(pn)) {
      payload = await attachGeneratedImages(db, {
        generated: payload,
        partNumber: pn,
        examSlot,
        levelLabel: 'A2',
      });
    }
  }

  const enunciado = buildEnunciadoFromGenerated({
    ...payload,
    partNumber: pn,
  });

  const { data: pregunta, error: pqErr } = await db
    .from('levels_preguntas')
    .insert({
      level_id: levelId,
      examen_id: examenId,
      parte_id: parteId,
      enunciado,
    })
    .select('id')
    .single();

  if (pqErr) throw new Error(`levels_preguntas: ${pqErr.message}`);

  const { mcq, open } = buildAnswerRowsFromGenerated(payload);

  if (mcq.length) {
    const rows = mcq.map((row) => ({
      pregunta_id: pregunta.id,
      respuesta: formatMcqRespuestaRow({
        questionNumber: row.questionNumber,
        letter: row.letter,
        text: row.text,
      }),
      correcta: Boolean(row.correcta),
    }));
    const { error } = await db.from('levels_respuestas').insert(rows);
    if (error) throw new Error(`levels_respuestas: ${error.message}`);
  }

  if (open.length) {
    const rows = open.map((row) => ({
      pregunta_id_abierta: pregunta.id,
      respuesta_texto: formatOpenRespuestaRow(row),
    }));
    const { error } = await db.from('levels_respuestas_abiertas').insert(rows);
    if (error) throw new Error(`levels_respuestas_abiertas: ${error.message}`);
  }

  if (partDef.needsAudio && !skipAudio) {
    const { extractListeningClipsFromGenerated, synthesizeAndUploadListeningClips } = await import(
      '@/lib/levelsExamAudioStorage'
    );
    const clipSpecs = extractListeningClipsFromGenerated(payload, partDef);
    const audioRows = await synthesizeAndUploadListeningClips(db, {
      partNumber,
      examSlot,
      levelLabel: 'A2',
      script: payload.script,
      clips: clipSpecs,
    });
    if (audioRows.length) {
      const { error } = await db.from('levels_preguntas_audios').insert(
        audioRows.map((a) => ({
          pregunta_id: pregunta.id,
          audio_url: a.audio_url,
          orden: a.orden,
          titulo: a.titulo,
        })),
      );
      if (error) throw new Error(`levels_preguntas_audios: ${error.message}`);
    }
  }

  return pregunta.id;
}
