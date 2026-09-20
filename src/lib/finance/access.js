import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import { loadStaffRolePermissionOverrides } from '@/lib/staffRolePermissionsServer';
import { resolvePermissionKeysForRole, resolveStaffRolePermissionKey } from '@/lib/staffRolePermissions';
import { ADMIN_EMAIL, isAdminRole, normalizeEmail } from '@/utils/authRoles';

/** Claves de permiso del área financiera (ya definidas en STAFF_PERMISSION_DEFINITIONS). */
export const FINANCE_PERMISSIONS = {
  invoicing: 'facturacion',
  accounting: 'contabilidad',
  treasury: 'tesoreria',
};

const ALL_FINANCE_PERMISSIONS = Object.values(FINANCE_PERMISSIONS);

function buildServerClient(token) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();

  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, getSupabaseAnonKey(), {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Autentica una petición del área financiera y comprueba la capability requerida.
 * @param {Request} req
 * @param {string} requiredPermission clave de FINANCE_PERMISSIONS
 * @returns {Promise<{ user: object, db: object, token: string, permissions: string[] } | { error: string, status: number }>}
 */
export async function authenticateFinanceRequest(req, requiredPermission) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return {
      error: 'Sesión no válida. Cierra sesión y vuelve a entrar en www.dralo.es.',
      status: 401,
    };
  }

  const token = auth.accessToken || '';
  const db = buildServerClient(token);

  const roleName = await getUserRoleNameServer(auth.user.id, db);
  const isAdmin =
    normalizeEmail(auth.user.email) === normalizeEmail(ADMIN_EMAIL) || isAdminRole(roleName);

  if (isAdmin) {
    return { user: auth.user, db, token, permissions: [...ALL_FINANCE_PERMISSIONS], isAdmin: true };
  }

  let overrides = {};
  try {
    overrides = await loadStaffRolePermissionOverrides(db);
  } catch {
    overrides = {};
  }

  const roleKey = resolveStaffRolePermissionKey(roleName);
  const granted = resolvePermissionKeysForRole(roleKey, overrides);
  const financePermissions = granted.filter((key) => ALL_FINANCE_PERMISSIONS.includes(key));

  if (requiredPermission && !granted.includes(requiredPermission)) {
    return { error: 'Sin permiso.', status: 403 };
  }
  if (!requiredPermission && financePermissions.length === 0) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, db, token, permissions: financePermissions, isAdmin: false };
}
