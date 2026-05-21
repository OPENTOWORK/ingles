import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export async function verifyPlacementToken(token) {
  if (!token) return null;
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export function createPlacementDb(token) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();

  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function getPlacementAuthToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

const PREGUNTAS_SELECT = `
  id,
  pregunta,
  explicacion,
  test_id,
  partes_id,
  placement_tests ( dificultad ),
  placement_partes ( nombre_parte )
`;

/** Une respuestas a preguntas (evita pérdidas del join anidado en Supabase). */
export function attachRespuestasToPreguntas(preguntas, respuestas) {
  const byPregunta = new Map();
  for (const r of respuestas || []) {
    if (!byPregunta.has(r.pregunta_id)) byPregunta.set(r.pregunta_id, []);
    byPregunta.get(r.pregunta_id).push(r);
  }
  return (preguntas || []).map((p) => ({
    ...p,
    placement_respuestas: byPregunta.get(p.id) || [],
  }));
}

/**
 * Carga preguntas + todas sus respuestas para un examen (test_id opcional).
 */
const PREGUNTAS_WITH_RESPUESTAS_SELECT = `
  id,
  pregunta,
  explicacion,
  test_id,
  partes_id,
  placement_tests ( dificultad ),
  placement_partes ( nombre_parte ),
  placement_respuestas ( id, pregunta_id, respuesta, correcta )
`;

export async function fetchPlacementRowsWithRespuestas(db, { testId } = {}) {
  let query = db
    .from('placement_preguntas')
    .select(PREGUNTAS_WITH_RESPUESTAS_SELECT)
    .order('id', { ascending: true })
    .limit(testId ? 500 : 1200);
  if (testId) {
    query = query.eq('test_id', testId);
  }

  const { data: nested, error: nestedError } = await query;

  if (!nestedError && Array.isArray(nested) && nested.length > 0) {
    return nested.map((p) => ({
      ...p,
      placement_respuestas: Array.isArray(p.placement_respuestas)
        ? p.placement_respuestas
        : [],
    }));
  }

  let flatQuery = db
    .from('placement_preguntas')
    .select(PREGUNTAS_SELECT)
    .order('id', { ascending: true })
    .limit(testId ? 500 : 1200);
  if (testId) {
    flatQuery = flatQuery.eq('test_id', testId);
  }

  const { data: preguntas, error } = await flatQuery;
  if (error) throw error;

  const list = preguntas || [];
  const ids = list.map((p) => p.id);
  if (!ids.length) return [];

  let respuestas = [];
  const chunkSize = 80;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { data: chunkRows, error: respError } = await db
      .from('placement_respuestas')
      .select('*')
      .in('pregunta_id', chunk);

    if (respError) throw respError;
    respuestas = respuestas.concat(chunkRows || []);
  }

  return attachRespuestasToPreguntas(list, respuestas);
}
