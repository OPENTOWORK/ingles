/**
 * Resuelve el id del examen B2 para el id de fila en public.levels (nivel B2).
 *
 * - No usa .maybeSingle() en catálogos: con varias filas en levels_examenes para el
 *   mismo level_id, PostgREST devolvía error y la página fallaba.
 * - Varios fallbacks para datos legacy (examen_id = id del nivel) sin tocar la BD.
 */
export async function resolveB2ExamenId(supabase, levelId) {
  if (!levelId) {
    return { examenId: null, error: { message: 'Falta level_id.' } };
  }

  const firstRow = (res) => (Array.isArray(res.data) && res.data[0] ? res.data[0] : null);

  const examList = await supabase
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .order('id', { ascending: true })
    .limit(1);

  if (examList.error) {
    return { examenId: null, error: examList.error };
  }
  const fromCatalog = firstRow(examList)?.id;
  if (fromCatalog) {
    return { examenId: fromCatalog, error: null };
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
