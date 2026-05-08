import { supabase } from '@/utils/supabaseClient';

/**
 * Actualiza métricas agregadas en public.levels_estadisticas (RLS: solo el propio usuario).
 * Hace lectura + upsert por (usuario_id, pregunta_id); tolera fallos sin bloquear la UI.
 */
export async function mergeLevelsEstadisticas({
  userId,
  preguntaId,
  parteId = null,
  deltaAccesos = 0,
  deltaIntentos = 0,
  deltaEvaluadas = 0,
  deltaCorrectas = 0,
  deltaIncorrectas = 0,
  _retry = false,
}) {
  if (!userId || !preguntaId) return { error: null };

  try {
    const { data: row, error: selErr } = await supabase
      .from('levels_estadisticas')
      .select(
        'id,accesos,intentos_completados,respuestas_evaluadas,respuestas_correctas,respuestas_incorrectas,mejor_porcentaje,ultimo_porcentaje,tiempo_segundos_total,primera_interaccion,parte_id,metadata',
      )
      .eq('usuario_id', userId)
      .eq('pregunta_id', preguntaId)
      .maybeSingle();

    if (selErr) return { error: selErr };

    const now = new Date().toISOString();
    const accesos = Math.max(0, (row?.accesos ?? 0) + deltaAccesos);
    const intentos_completados = Math.max(0, (row?.intentos_completados ?? 0) + deltaIntentos);
    const respuestas_evaluadas = Math.max(0, (row?.respuestas_evaluadas ?? 0) + deltaEvaluadas);
    const respuestas_correctas = Math.max(0, (row?.respuestas_correctas ?? 0) + deltaCorrectas);
    const respuestas_incorrectas = Math.max(0, (row?.respuestas_incorrectas ?? 0) + deltaIncorrectas);

    const ultimo_porcentaje =
      respuestas_evaluadas > 0
        ? Math.round((10000 * respuestas_correctas) / respuestas_evaluadas) / 100
        : null;

    const prevMejor = row?.mejor_porcentaje != null ? Number(row.mejor_porcentaje) : null;
    const mejor_porcentaje =
      ultimo_porcentaje == null
        ? prevMejor
        : prevMejor == null
          ? ultimo_porcentaje
          : Math.max(prevMejor, ultimo_porcentaje);

    const payload = {
      usuario_id: userId,
      pregunta_id: preguntaId,
      parte_id: parteId ?? row?.parte_id ?? null,
      accesos,
      intentos_completados,
      respuestas_evaluadas,
      respuestas_correctas,
      respuestas_incorrectas,
      mejor_porcentaje,
      ultimo_porcentaje,
      tiempo_segundos_total: row?.tiempo_segundos_total ?? 0,
      primera_interaccion: row?.primera_interaccion ?? now,
      ultima_interaccion: now,
      metadata: row?.metadata && typeof row.metadata === 'object' ? row.metadata : {},
    };

    // Evitar upsert: la tabla tiene PK (id) y UNIQUE (usuario_id, pregunta_id); PostgREST
    // a veces resuelve el conflicto por PK y falla al reinsertar la misma pareja usuario+pregunta.
    if (row?.id) {
      const { error: upErr } = await supabase
        .from('levels_estadisticas')
        .update({
          parte_id: payload.parte_id,
          accesos: payload.accesos,
          intentos_completados: payload.intentos_completados,
          respuestas_evaluadas: payload.respuestas_evaluadas,
          respuestas_correctas: payload.respuestas_correctas,
          respuestas_incorrectas: payload.respuestas_incorrectas,
          mejor_porcentaje: payload.mejor_porcentaje,
          ultimo_porcentaje: payload.ultimo_porcentaje,
          tiempo_segundos_total: payload.tiempo_segundos_total,
          primera_interaccion: payload.primera_interaccion,
          ultima_interaccion: payload.ultima_interaccion,
          metadata: payload.metadata,
        })
        .eq('id', row.id);
      return { error: upErr ?? null };
    }

    const { error: insErr } = await supabase.from('levels_estadisticas').insert(payload);
    if (!insErr) return { error: null };

    // Carrera: otro cliente insertó la misma fila entre el select y el insert.
    if (insErr.code === '23505' && !_retry) {
      return mergeLevelsEstadisticas({
        userId,
        preguntaId,
        parteId,
        deltaAccesos,
        deltaIntentos,
        deltaEvaluadas,
        deltaCorrectas,
        deltaIncorrectas,
        _retry: true,
      });
    }

    return { error: insErr };
  } catch (e) {
    return { error: e };
  }
}

export async function getSessionUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (!error && data?.session?.user?.id) return data.session.user.id;

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (!userErr && userData?.user?.id) return userData.user.id;

  return null;
}
