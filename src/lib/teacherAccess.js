import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  canAccessTeacherPanel as canAccessTeacherPanelFromRoles,
  isAdminRole,
  normalizeRoleName,
  userHasRole,
} from '@/utils/authRoles';

export function canAccessTeacherPanel(roleName) {
  return canAccessTeacherPanelFromRoles(roleName);
}

/** Tabla inexistente o no expuesta en PostgREST (local sin migración SQL). */
export function isSchemaNotReadyError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST200' ||
    code === 'PGRST204' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('could not find the') ||
    msg.includes('schema cache')
  );
}

export async function assertTeacherApiAccess(userId, email = '') {
  const isAdmin = await userHasRole(userId, ['admin', 'administrador'], email);
  const isTeacher = await userHasRole(userId, ['teacher', 'profesor'], email);
  const isCoordinator = await userHasRole(userId, ['coordinador', 'coordinator'], email);
  if (!isAdmin && !isTeacher && !isCoordinator) {
    return { ok: false, status: 403, error: 'Sin permiso de profesor o administrador.' };
  }
  return {
    ok: true,
    isAdmin: isAdmin || isCoordinator,
    isTeacher,
    isCoordinator,
    professorId: userId,
  };
}

export function getServiceDb(token) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient(supabaseUrl, getSupabaseAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function getStudentRoleId(db) {
  const { data: roles } = await db.from('Usuarios_y_Perfil_roles').select('id, nombre');
  const row = (roles || []).find((r) => {
    const n = normalizeRoleName(r.nombre);
    return n === 'student' || n === 'alumno';
  });
  return row?.id || null;
}

/** IDs de alumnos visibles para el profesor (admin: todos los alumnos). */
export async function getTeacherStudentIds(db, { professorId, isAdmin }) {
  if (isAdmin) {
    const studentRoleId = await getStudentRoleId(db);
    if (!studentRoleId) return [];
    const { data } = await db
      .from('Usuarios_y_Perfil_users')
      .select('id')
      .eq('rol_id', studentRoleId)
      .eq('activo', true);
    return (data || []).map((r) => r.id);
  }

  const { data, error } = await db
    .from('profesor_alumnos')
    .select('alumno_id')
    .eq('profesor_id', professorId);

  if (error) {
    if (isSchemaNotReadyError(error)) {
      return [];
    }
    throw error;
  }
  return (data || []).map((r) => r.alumno_id);
}

export async function authenticateTeacherRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { error: 'No autenticado.', status: 401 };
  }

  const authClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return { error: 'Sesión no válida.', status: 401 };
  }

  const access = await assertTeacherApiAccess(authData.user.id, authData.user.email);
  if (!access.ok) {
    return { error: access.error, status: access.status };
  }

  const db = getServiceDb(token);
  const studentIds = await getTeacherStudentIds(db, {
    professorId: authData.user.id,
    isAdmin: access.isAdmin,
  });

  return {
    user: authData.user,
    token,
    db,
    isAdmin: access.isAdmin,
    isTeacher: access.isTeacher,
    professorId: authData.user.id,
    studentIds,
  };
}
