import {
  buildAnswerRowsFromGenerated,
  buildEnunciadoFromGenerated,
  formatMcqRespuestaRow,
  formatOpenRespuestaRow,
} from '@/lib/formatLevelsEnunciado';
import { parteNameA2, examenNameA2 } from '@/lib/a2ExamCatalog';
import { examenNameForLevel, getLevelExamLabel, parteNameForLevel } from '@/lib/levelsExamCatalog';
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

async function deletePreguntaRowsByIds(db, ids) {
  if (!ids.length) return;

  const { data: puntuaciones, error: puntErr } = await db
    .from('levels_puntuaciones')
    .select('id')
    .in('id_pregunta', ids);
  if (puntErr) throw new Error(`levels_puntuaciones: ${puntErr.message}`);

  const puntuacionIds = (puntuaciones || []).map((row) => row.id);
  if (puntuacionIds.length) {
    const { error: starsErr } = await db.from('Levels_stars').delete().in('puntuaciones_id', puntuacionIds);
    if (starsErr) throw new Error(`Levels_stars: ${starsErr.message}`);

    const { error: delPuntErr } = await db.from('levels_puntuaciones').delete().in('id', puntuacionIds);
    if (delPuntErr) throw new Error(`levels_puntuaciones: ${delPuntErr.message}`);
  }

  const { data: mcqRows } = await db.from('levels_respuestas').select('id').in('pregunta_id', ids);
  const respuestaIds = (mcqRows || []).map((row) => row.id);
  if (respuestaIds.length) {
    const { error: justErr } = await db
      .from('levels_justificaciones')
      .delete()
      .in('id_respuesta', respuestaIds);
    if (justErr) throw new Error(`levels_justificaciones: ${justErr.message}`);
  }

  const { error: justPregErr } = await db.from('levels_justificaciones').delete().in('pregunta_id', ids);
  if (justPregErr) throw new Error(`levels_justificaciones: ${justPregErr.message}`);

  const tables = [
    { table: 'levels_preguntas_audios', column: 'pregunta_id' },
    { table: 'levels_respuestas_abiertas', column: 'pregunta_id_abierta' },
    { table: 'levels_respuestas', column: 'pregunta_id' },
  ];

  for (const { table, column } of tables) {
    const { error } = await db.from(table).delete().in(column, ids);
    if (error) throw new Error(`${table}: ${error.message}`);
  }

  const { error } = await db.from('levels_preguntas').delete().in('id', ids);
  if (error) throw new Error(`levels_preguntas: ${error.message}`);
}

export function partNumberFromParteName(nombreParte) {
  const m = String(nombreParte || '').match(/Parte\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

/**
 * All levels_partes ids for a level part number (canonical name + legacy aliases).
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function resolveParteIdsForLevelPart(db, levelSlug, partNumber) {
  const slug = String(levelSlug || '').toLowerCase();
  const label = getLevelExamLabel(slug);
  const canonicalName = parteNameForLevel(slug, partNumber);
  const ids = new Set();

  const { data: exact, error: exactErr } = await db
    .from('levels_partes')
    .select('id, nombre_parte')
    .eq('nombre_parte', canonicalName);
  if (exactErr) throw new Error(`levels_partes: ${exactErr.message}`);
  for (const row of exact || []) ids.add(row.id);

  const { data: aliases, error: aliasErr } = await db
    .from('levels_partes')
    .select('id, nombre_parte')
    .ilike('nombre_parte', `Parte ${partNumber} %`);
  if (aliasErr) throw new Error(`levels_partes: ${aliasErr.message}`);
  for (const row of aliases || []) {
    if (partNumberFromParteName(row.nombre_parte) === Number(partNumber)) {
      ids.add(row.id);
    }
  }

  if (label && label !== slug.toUpperCase()) {
    const legacyName = `Parte ${partNumber} ${label}`;
    if (legacyName !== canonicalName) {
      const { data: legacy, error: legacyErr } = await db
        .from('levels_partes')
        .select('id, nombre_parte')
        .eq('nombre_parte', legacyName);
      if (legacyErr) throw new Error(`levels_partes: ${legacyErr.message}`);
      for (const row of legacy || []) ids.add(row.id);
    }
  }

  return [...ids];
}

export async function deleteExamenContent(db, examenId) {
  const { data: preguntas, error } = await db.from('levels_preguntas').select('id').eq('examen_id', examenId);
  if (error) throw new Error(`levels_preguntas: ${error.message}`);
  const ids = (preguntas || []).map((p) => p.id);
  await deletePreguntaRowsByIds(db, ids);
}

/** Borra contenido del examen y la fila en levels_examenes. */
export async function deleteExamenFully(db, examenId) {
  if (!examenId) return { deleted: false, examenId: null };

  await deleteExamenContent(db, examenId);
  const { error } = await db.from('levels_examenes').delete().eq('id', examenId);
  if (error) throw new Error(`levels_examenes: ${error.message}`);
  return { deleted: true, examenId };
}

export async function deletePreguntasByIds(db, preguntaIds) {
  const ids = [...new Set((preguntaIds || []).filter(Boolean))];
  await deletePreguntaRowsByIds(db, ids);
}

/**
 * Borra preguntas previas de una parte en un examen (evita duplicados al regenerar parte a parte).
 * When levelSlug + partNumber are provided, deletes rows for every matching levels_partes id
 * (canonical + legacy aliases), not only the single parteId passed in.
 */
export async function deletePartContentForExam(db, examenId, parteId, options = {}) {
  const { levelSlug, partNumber } = options;
  const parteIds = new Set();
  if (parteId) parteIds.add(parteId);

  if (levelSlug != null && partNumber != null) {
    const resolved = await resolveParteIdsForLevelPart(db, levelSlug, partNumber);
    for (const id of resolved) parteIds.add(id);
  }

  if (!parteIds.size) return;

  const { data: preguntas, error } = await db
    .from('levels_preguntas')
    .select('id')
    .eq('examen_id', examenId)
    .in('parte_id', [...parteIds]);
  if (error) throw new Error(`levels_preguntas: ${error.message}`);

  const ids = (preguntas || []).map((p) => p.id);
  await deletePreguntaRowsByIds(db, ids);
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
    const { extractListeningClipsFromGenerated, synthesizeAndUploadListeningClips, listeningCombinedDefaultTitle } = await import(
      '@/lib/levelsExamAudioStorage'
    );
    const clipSpecs = extractListeningClipsFromGenerated(payload, partDef);
    const audioRows = await synthesizeAndUploadListeningClips(db, {
      partNumber,
      examSlot,
      levelLabel: 'A2',
      script: payload.script,
      clips: clipSpecs,
      partDef,
      combinedTitle: listeningCombinedDefaultTitle(partNumber, payload.setting || payload.title),
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
