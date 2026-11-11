import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { ADMIN_EMAIL, isAdminRole, isMarketingRole, normalizeEmail } from '@/utils/authRoles';

const USERS_TABLE = 'Usuarios_y_Perfil_users';
const ROLES_TABLE = 'Usuarios_y_Perfil_roles';

export function staffNoticeDb(adminClient) {
  if (adminClient) return adminClient;
  const key = getSupabaseServiceRoleKey()?.trim();
  const url = getSupabaseUrl();
  if (!key || !url) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Correos activos de admin y de marketing, más el buzón de dirección. */
export async function listAdminAndMarketingEmails(adminClient) {
  const emails = new Set([normalizeEmail(ADMIN_EMAIL)].filter(Boolean));
  if (!adminClient) return [...emails];

  try {
    const { data: roles, error: rolesError } = await adminClient
      .from(ROLES_TABLE)
      .select('id, nombre');
    if (rolesError) throw rolesError;

    const roleIds = (roles || [])
      .filter((role) => isAdminRole(role?.nombre) || isMarketingRole(role?.nombre))
      .map((role) => role.id)
      .filter(Boolean);

    if (!roleIds.length) return [...emails];

    const { data: users, error: usersError } = await adminClient
      .from(USERS_TABLE)
      .select('email, activo')
      .in('rol_id', roleIds);
    if (usersError) throw usersError;

    for (const user of users || []) {
      if (user?.activo === false) continue;
      const email = normalizeEmail(user?.email || '');
      if (email) emails.add(email);
    }
  } catch (err) {
    console.error('[staff-notice] recipients:', err);
  }

  return [...emails];
}
