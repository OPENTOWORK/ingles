/** Máximo slot de examen en la UI B2 (catálogo en levels_examenes). */
export const B2_EXAM_SLOT_MAX = 5;

/**
 * @param {unknown} value
 * @returns {number} entero 1..B2_EXAM_SLOT_MAX
 */
export function clampB2ExamSlot(value) {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? '1'), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.floor(n), 1), B2_EXAM_SLOT_MAX);
}

/** Orden estable: número en `nombre` ("Examen 3"), luego por id. */
function sortLevelsExamenesRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

/**
 * Resuelve el id del examen B2 para el id de fila en public.levels (nivel B2).
 *
 * - Con varias filas en `levels_examenes`, elige por `slot` (1-based): Examen 1…5.
 * - No usa .maybeSingle() en catálogos.
 * - Varios fallbacks para datos legacy (examen_id = id del nivel) sin tocar la BD.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 * @param {{ slot?: number }} [options] — `slot` = 1…5 (por defecto 1)
 */
export async function resolveB2ExamenId(supabase, levelId, options = {}) {
  if (!levelId) {
    return { examenId: null, error: { message: 'Falta level_id.' } };
  }

  const slot = clampB2ExamSlot(options.slot ?? options.examSlot ?? 1);
  const firstRow = (res) => (Array.isArray(res.data) && res.data[0] ? res.data[0] : null);

  const examList = await supabase
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', levelId);

  if (examList.error) {
    return { examenId: null, error: examList.error };
  }

  const ordered = sortLevelsExamenesRows(examList.data);
  if (ordered.length > 0) {
    const pick = ordered[slot - 1];
    if (pick) {
      return { examenId: pick.id, error: null };
    }
    return {
      examenId: null,
      error: {
        message: `No existe el examen ${slot} para B2 (hay ${ordered.length} en levels_examenes).`,
      },
    };
  }

  // Legacy: preguntas con examen_id = id del nivel (mismo UUID que el nivel).
  const legacyP = await supabase
    .from('levels_preguntas')
    .select('examen_id')
    .eq('examen_id', levelId)
    .limit(1);

  if (legacyP.error) {
    return { examenId: null, error: legacyP.error };
  }
  const legacyId = firstRow(legacyP)?.examen_id;
  if (legacyId) {
    return { examenId: legacyId, error: null };
  }

  const byLevel = await supabase
    .from('levels_preguntas')
    .select('examen_id')
    .eq('level_id', levelId)
    .not('examen_id', 'is', null)
    .order('examen_id', { ascending: true })
    .limit(1);

  if (byLevel.error) {
    return { examenId: null, error: byLevel.error };
  }
  const fromQuestions = firstRow(byLevel)?.examen_id;
  if (fromQuestions) {
    return { examenId: fromQuestions, error: null };
  }

  return {
    examenId: null,
    error: {
      message:
        'Sin fila en levels_examenes para este level_id y sin levels_preguntas enlazadas (examen_id / level_id). Revisa RLS y datos.',
    },
  };
}

/**
 * Carga preguntas del examen. Primero con level_id + examen_id; si no hay filas,
 * solo por examen_id (p. ej. level_id en filas desincronizado tras migraciones).
 */
export async function fetchB2PreguntasByExamen(
  supabase,
  { examenId, levelId, columns = 'id, examen_id, level_id, parte_id, enunciado' },
) {
  if (!examenId) {
    return { data: [], error: { message: 'Falta examen_id.' } };
  }

  const withLevel = await supabase
    .from('levels_preguntas')
    .select(columns)
    .eq('examen_id', examenId)
    .eq('level_id', levelId);

  if (withLevel.error) {
    return withLevel;
  }
  if (withLevel.data?.length) {
    return withLevel;
  }

  return supabase.from('levels_preguntas').select(columns).eq('examen_id', examenId);
}
