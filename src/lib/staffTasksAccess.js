import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { ADMIN_EMAIL, normalizeEmail } from '@/utils/authRoles';
import { getServiceDb } from '@/lib/coordinatorAccess';
import { getUserRoleNameServer, isStudentRole } from '@/lib/userRoleServer';
import { roleHasStaffPermission } from '@/lib/staffRolePermissions';
import { loadStaffRolePermissionOverrides } from '@/lib/staffRolePermissionsServer';

export async function assertStaffTasksApiAccess(userId, email = '', db) {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return { ok: true };
  }

  const roleName = await getUserRoleNameServer(userId, db);
  if (isStudentRole(roleName)) {
    return { ok: false, status: 403, error: 'Los estudiantes no pueden gestionar tareas.' };
  }

  let overrides = {};
  try {
    overrides = await loadStaffRolePermissionOverrides(db);
  } catch {
    overrides = {};
  }

  if (!roleHasStaffPermission(roleName, 'tareas', overrides)) {
    return { ok: false, status: 403, error: 'Sin permiso para tareas.' };
  }

  return { ok: true };
}

export async function authenticateStaffTasksRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return { error: 'No autenticado.', status: 401 };
  }

  const token = auth.accessToken || '';
  const db = getServiceDb(token);

  const access = await assertStaffTasksApiAccess(auth.user.id, auth.user.email, db);
  if (!access.ok) {
    return { error: access.error, status: access.status };
  }

  return {
    user: auth.user,
    token,
    db,
  };
}
