import { ADMIN_EMAIL, canAccessStaffBuzon, normalizeEmail } from '@/utils/authRoles';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import { getAuthUserFromRequest, createDbClients } from '@/lib/supportAuth';
import { isStaffBuzonRole } from '@/utils/staffBuzon';

export async function getStaffBuzonRoleForUser(userId, email, dbClient) {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return 'admin';
  }
  return getUserRoleNameServer(userId, dbClient);
}

export async function userCanAccessStaffBuzon(userId, email, dbClient) {
  const role = await getStaffBuzonRoleForUser(userId, email, dbClient);
  return canAccessStaffBuzon(role);
}

export async function userIsStaffBuzonRecipient(userId, dbClient) {
  if (!userId || !dbClient) return false;

  const { data: userRow } = await dbClient
    .from('Usuarios_y_Perfil_users')
    .select('activo, Usuarios_y_Perfil_roles ( nombre )')
    .eq('id', userId)
    .maybeSingle();

  if (!userRow || userRow.activo === false) return false;

  const embedded = userRow.Usuarios_y_Perfil_roles;
  const roleName = Array.isArray(embedded) ? embedded[0]?.nombre : embedded?.nombre;
  return isStaffBuzonRole(roleName || '');
}

export async function requireStaffBuzonAccess(req) {
  const { user, token, error } = await getAuthUserFromRequest(req);
  if (!user) {
    return { ok: false, status: 401, error: error || 'No autenticado.' };
  }

  const { adminClient, userClient } = createDbClients(token);
  const db = adminClient || userClient;

  const allowed = await userCanAccessStaffBuzon(user.id, user.email, db);
  if (!allowed) {
    return { ok: false, status: 403, error: 'No tienes acceso al Buzón.' };
  }

  return { ok: true, user, token, db, adminClient, userClient };
}
