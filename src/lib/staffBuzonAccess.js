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

export async function userIsGroupCreator(dbClient, userId, groupId) {
  if (!userId || !groupId || !dbClient) return false;

  const { data, error } = await dbClient
    .from('staff_buzon_grupos')
    .select('created_by')
    .eq('id', groupId)
    .maybeSingle();

  if (error) throw error;
  return data?.created_by === userId;
}

export async function userIsGroupMember(dbClient, userId, groupId) {
  if (!userId || !groupId || !dbClient) return false;

  const { data, error } = await dbClient
    .from('staff_buzon_grupo_miembros')
    .select('group_id')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
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
