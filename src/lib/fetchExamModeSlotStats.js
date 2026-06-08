import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return msg.includes('schema cache') || msg.includes('could not find');
}

/**
 * Carga levels_puntuaciones y levels_estadisticas para un examen concreto (slot).
 */
export async function fetchExamModeSlotStats(supabase, { userId, slug, examSlot }) {
  const empty = { examenId: null, puntuaciones: [], estadisticas: [] };

  if (!userId || !slug || !examSlot) return empty;

  const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
  if (!levelData?.id) return empty;

  const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
  const examenId = idsBySlot?.[examSlot];
  if (!examenId) return empty;

  let puntuaciones = [];
  const fullPunt = await supabase
    .from('levels_puntuaciones')
    .select(
      'id, id_pregunta, examen_id, parte_numero, correctas, total_preguntas, aprobado, puntuacion, descripcion, created_at',
    )
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId)
    .order('created_at', { ascending: false });

  if (!fullPunt.error && fullPunt.data) {
    puntuaciones = fullPunt.data;
  } else if (fullPunt.error && isSchemaCacheColumnError(fullPunt.error)) {
    const fallback = await supabase
      .from('levels_puntuaciones')
      .select('id, id_pregunta, descripcion, created_at')
      .eq('uuid_usuario', userId)
      .order('created_at', { ascending: false });

    if (!fallback.error) {
      puntuaciones = (fallback.data || [])
        .map((row) => {
          const meta = parseUoePartDescripcion(row.descripcion);
          if (!meta || meta.examenId !== examenId) return null;
          return {
            ...row,
            examen_id: meta.examenId,
            parte_numero: meta.parteNumero,
            correctas: meta.correctas,
            total_preguntas: meta.total,
            aprobado: meta.aprobado,
          };
        })
        .filter(Boolean);
    }
  }

  const preguntaIds = [...new Set(puntuaciones.map((r) => r.id_pregunta).filter(Boolean))];
  let estadisticas = [];

  if (preguntaIds.length) {
    const estRes = await supabase
      .from('levels_estadisticas')
      .select(
        'pregunta_id, intentos_completados, respuestas_evaluadas, respuestas_correctas, tiempo_segundos_total, ultimo_porcentaje, mejor_porcentaje',
      )
      .eq('usuario_id', userId)
      .in('pregunta_id', preguntaIds);

    if (!estRes.error) {
      estadisticas = estRes.data || [];
    }
  }

  return { examenId, puntuaciones, estadisticas };
}

/**
 * Borra puntuaciones del usuario para un examen (al repetir).
 */
export async function clearExamSlotPuntuaciones(supabase, { userId, examenId }) {
  if (!userId || !examenId) return { error: null };

  const { error } = await supabase
    .from('levels_puntuaciones')
    .delete()
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId);

  if (error && isSchemaCacheColumnError(error)) {
    const { data: rows } = await supabase
      .from('levels_puntuaciones')
      .select('id, descripcion')
      .eq('uuid_usuario', userId);

    const ids = (rows || [])
      .filter((r) => parseUoePartDescripcion(r.descripcion)?.examenId === examenId)
      .map((r) => r.id);

    if (!ids.length) return { error: null };

    const { error: delErr } = await supabase.from('levels_puntuaciones').delete().in('id', ids);
    return { error: delErr ?? null };
  }

  return { error: error ?? null };
}
