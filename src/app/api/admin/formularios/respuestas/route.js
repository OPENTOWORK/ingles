import { NextResponse } from 'next/server';
import { authenticatePlanObjetivosAdminRequest } from '@/lib/adminAccess';
import {
  FOUNDING_SURVEY_FORM_ID,
  FOUNDING_SURVEY_FORM_TITLE,
  foundingSurveyResponseItems,
} from '@/lib/foundingSurvey.rules';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

/** La encuesta del Plan Plus vive en otra tabla; se lista aquí con el mismo formato. */
async function loadFoundingAnswerRows(db) {
  const { data, error } = await db
    .from('founding_member_encuestas')
    .select('id, user_id, email, respuestas, respondida_en')
    .not('respondida_en', 'is', null);
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    formulario_id: FOUNDING_SURVEY_FORM_ID,
    formulario_titulo: FOUNDING_SURVEY_FORM_TITLE,
    user_id: row.user_id,
    surveyEmail: row.email || null,
    completado_en: row.respondida_en,
    respuestas: foundingSurveyResponseItems(row.respuestas),
  }));
}

export async function GET(req) {
  try {
    const auth = await authenticatePlanObjetivosAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.db
      .from('formulario_respuestas')
      .select('id, formulario_id, formulario_titulo, user_id, respuestas, completado_en')
      .order('completado_en', { ascending: false });
    if (error) throw error;

    const foundingRows = await loadFoundingAnswerRows(auth.db);
    const rows = [...(data || []), ...foundingRows];
    const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
    let usersById = new Map();
    if (userIds.length) {
      const { data: users, error: usersError } = await auth.db
        .from('Usuarios_y_Perfil_users')
        .select('id, email, nombre')
        .in('id', userIds);
      if (usersError) throw usersError;
      usersById = new Map((users || []).map((user) => [user.id, user]));
    }

    const respuestas = rows
      .map((row) => {
        const user = usersById.get(row.user_id);
        return {
          id: row.id,
          formulario_id: row.formulario_id,
          formulario_titulo: row.formulario_titulo,
          user_id: row.user_id,
          nombre: user?.nombre || null,
          email: user?.email || row.surveyEmail || null,
          completado_en: row.completado_en,
          respuestas: Array.isArray(row.respuestas) ? row.respuestas : [],
        };
      })
      .sort((a, b) => String(b.completado_en || '').localeCompare(String(a.completado_en || '')));

    return NextResponse.json({ respuestas });
  } catch (err) {
    console.error('[admin/formularios/respuestas]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
