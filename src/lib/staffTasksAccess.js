import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { ADMIN_EMAIL, canAccessStaffTasks, normalizeEmail } from '@/utils/authRoles';
import { getServiceDb } from '@/lib/coordinatorAccess';
import { getUserRoleNameServer, isStudentRole } from '@/lib/userRoleServer';

export async function assertStaffTasksApiAccess(userId, email = '', db) {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return { ok: true };
  }

  const roleName = await getUserRoleNameServer(userId, db);
  if (isStudentRole(roleName) || !canAccessStaffTasks(roleName)) {
    return { ok: false, status: 403, error: 'Los estudiantes no pueden gestionar tareas.' };
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
