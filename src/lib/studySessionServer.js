import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getDraloOpenAI } from '@/lib/draloAiEngine';
import { buildFactualSummary, buildStudySummaryPrompt } from '@/lib/studySession';

export const SEGUIMIENTO_SESIONES_TABLE = 'seguimiento_sesiones';
export const SEGUIMIENTO_CONSENTIMIENTOS_TABLE = 'seguimiento_consentimientos';

const SUMMARY_MODEL = 'gpt-4o-mini';

/** Sesión del alumno + cliente con service role para escribir sus filas. */
export async function authenticateStudentRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return { error: 'Sesión no válida.', status: 401 };
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, getSupabaseAnonKey(), {
        global: auth.accessToken
          ? { headers: { Authorization: `Bearer ${auth.accessToken}` } }
          : {},
        auth: { autoRefreshToken: false, persistSession: false },
      });

  return { user: auth.user, db };
}

/** Cualquier usuario con sesión puede iniciar el seguimiento. El rol y el plan no lo bloquean. */
export async function assertStudySessionAccess() {
  return {};
}

export async function getActiveStudySession(db, userId) {
  const { data, error } = await db
    .from(SEGUIMIENTO_SESIONES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'activa')
    .order('started_at', { ascending: false })
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return { session: null, tableReady: false };
    throw error;
  }
  return { session: data || null, tableReady: true };
}

/**
 * Resumen de fin de sesión. Solo se le pasan agregados de foco: nunca respuestas
 * del alumno ni nada que identifique contenido. Si la IA no está configurada o
 * falla, se devuelve el resumen determinista.
 */
export async function generateStudySummary(report, { studentName = '' } = {}) {
  const fallback = buildFactualSummary(report);

  const client = getDraloOpenAI();
  if (!client) return { resumen: fallback, source: 'deterministic' };

  try {
    const completion = await client.chat.completions.create({
      model: SUMMARY_MODEL,
      temperature: 0.4,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'Eres el tutor de Dralo. Resumes sesiones de estudio a partir de métricas de concentración, en español de España.',
        },
        { role: 'user', content: buildStudySummaryPrompt(report, { studentName }) },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) return { resumen: fallback, source: 'deterministic' };
    return { resumen: text, source: 'ai' };
  } catch (err) {
    console.error('[estudio/resumen] OpenAI', err?.message || err);
    return { resumen: fallback, source: 'deterministic' };
  }
}
