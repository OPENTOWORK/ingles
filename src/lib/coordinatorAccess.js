import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  canAccessCoordinatorPanel,
  isAdminRole,
  normalizeRoleName,
  userHasRole,
} from '@/utils/authRoles';

export { canAccessCoordinatorPanel };
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';

export { isSchemaNotReadyError };

export async function assertCoordinatorApiAccess(userId, email = '') {
  const isAdmin = await userHasRole(userId, ['admin', 'administrador'], email);
  const isCoordinator = await userHasRole(
    userId,
    ['coordinador', 'coordinator'],
    email,
  );
  if (!isAdmin && !isCoordinator) {
    return { ok: false, status: 403, error: 'Sin permiso de coordinador o administrador.' };
  }
  return { ok: true, isAdmin, isCoordinator };
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

export async function getRoleIdsByNames(db, names = []) {
  const normalized = new Set(names.map((n) => normalizeRoleName(n)));
  const { data: roles, error } = await db.from('Usuarios_y_Perfil_roles').select('id, nombre');
  if (error) throw error;
  return (roles || [])
    .filter((r) => normalized.has(normalizeRoleName(r.nombre)))
    .map((r) => r.id);
}

export async function getTeacherRoleIds(db) {
  return getRoleIdsByNames(db, ['teacher', 'profesor']);
}

export async function getStudentRoleId(db) {
  const ids = await getRoleIdsByNames(db, ['student', 'alumno']);
  return ids[0] || null;
}

export const STAFF_TASK_EXCLUDED_ROLES = ['student', 'alumno'];

export async function getStaffRoleIds(db) {
  const { data: roles, error } = await db.from('Usuarios_y_Perfil_roles').select('id, nombre');
  if (error) throw error;
  const excluded = new Set(STAFF_TASK_EXCLUDED_ROLES.map((name) => normalizeRoleName(name)));
  return (roles || [])
    .filter((r) => !excluded.has(normalizeRoleName(r.nombre)))
    .map((r) => r.id);
}

export async function listStaffAssignees(db) {
  const staffRoleIds = await getStaffRoleIds(db);
  if (!staffRoleIds.length) return { assignees: [] };

  const { data: users, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, activo, rol_id, Usuarios_y_Perfil_roles ( nombre )')
    .in('rol_id', staffRoleIds)
    .order('nombre', { ascending: true });

  if (error) throw error;

  return {
    assignees: (users || []).map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      activo: u.activo,
      rol_id: u.rol_id,
      roleName: u.Usuarios_y_Perfil_roles?.nombre || '',
    })),
  };
}

export async function assertStaffAssigneeId(db, assigneeId) {
  const staffRoleIds = await getStaffRoleIds(db);
  const { data: row, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, rol_id, activo, Usuarios_y_Perfil_roles ( nombre )')
    .eq('id', assigneeId)
    .maybeSingle();
  if (error) throw error;
  if (!row?.id || !staffRoleIds.includes(row.rol_id)) {
    return { ok: false, error: 'Destinatario no válido. Solo personal (no estudiantes).' };
  }
  return {
    ok: true,
    assignee: {
      ...row,
      roleName: row.Usuarios_y_Perfil_roles?.nombre || '',
    },
  };
}

export async function authenticateCoordinatorRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return { error: 'No autenticado.', status: 401 };
  }

  const access = await assertCoordinatorApiAccess(auth.user.id, auth.user.email);
  if (!access.ok) {
    return { error: access.error, status: access.status };
  }

  const token = auth.accessToken || '';
  const db = getServiceDb(token);

  return {
    user: auth.user,
    token,
    db,
    isAdmin: access.isAdmin,
    isCoordinator: access.isCoordinator,
  };
}

export async function listTeachersWithStats(db) {
  const teacherRoleIds = await getTeacherRoleIds(db);
  if (!teacherRoleIds.length) return { teachers: [], tablesReady: true };

  const { data: teachers, error: teachersError } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, activo, creado_en')
    .in('rol_id', teacherRoleIds)
    .order('nombre', { ascending: true });

  if (teachersError) throw teachersError;

  const assignProbe = await db.from('profesor_alumnos').select('id').limit(1);
  const tablesReady = !isSchemaNotReadyError(assignProbe.error);

  const teacherIds = (teachers || []).map((t) => t.id);
  const countsByTeacher = {};

  if (tablesReady && teacherIds.length) {
    const { data: links, error: linksError } = await db
      .from('profesor_alumnos')
      .select('profesor_id, alumno_id')
      .in('profesor_id', teacherIds);
    if (linksError && !isSchemaNotReadyError(linksError)) throw linksError;
    for (const row of links || []) {
      countsByTeacher[row.profesor_id] = (countsByTeacher[row.profesor_id] || 0) + 1;
    }
  }

  return {
    teachers: (teachers || []).map((t) => ({
      ...t,
      studentCount: countsByTeacher[t.id] || 0,
    })),
    tablesReady,
  };
}
