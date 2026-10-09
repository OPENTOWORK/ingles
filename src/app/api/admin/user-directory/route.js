import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';

const PROFILE_SELECTS = [
  'id, email, nombre, rol_id, plan_id, creado_en, activo, destacado_equipo, consentimiento_comercial',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, destacado_equipo, marketing_updates',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, destacado_equipo, metadata',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, destacado_equipo',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, consentimiento_comercial',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, marketing_updates',
  'id, email, nombre, rol_id, plan_id, creado_en, activo, metadata',
  'id, email, nombre, rol_id, plan_id, creado_en, activo',
];

async function loadProfiles(db) {
  let lastError = null;
  for (const selectClause of PROFILE_SELECTS) {
    const { data, error } = await db
      .from('Usuarios_y_Perfil_users')
      .select(selectClause)
      .order('creado_en', { ascending: false });
    if (!error) return data || [];
    lastError = error;
  }
  throw lastError || new Error('No se pudieron leer las fichas.');
}

async function countAbandoned(db, excludeIds = []) {
  let query = db
    .from('sesiones_nivel')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'abandonada');
  if (excludeIds.length) {
    const list = excludeIds.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',');
    query = query.not('user_id', 'in', `(${list})`);
  }
  const { count, error } = await query;
  if (error) {
    console.error('[admin/user-directory] abandoned sessions', error);
    return 0;
  }
  return count || 0;
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = await loadProfiles(auth.db);
    const staffIds = users.filter((row) => Boolean(row.destacado_equipo)).map((row) => row.id);
    const [abandonedSessions, abandonedSessionsExcludingStaff] = await Promise.all([
      countAbandoned(auth.db),
      countAbandoned(auth.db, staffIds),
    ]);

    return NextResponse.json({
      users,
      abandonedSessions,
      abandonedSessionsExcludingStaff,
    });
  } catch (err) {
    console.error('[admin/user-directory GET]', err);
    return NextResponse.json({ error: err?.message || 'Error interno.' }, { status: 500 });
  }
}
