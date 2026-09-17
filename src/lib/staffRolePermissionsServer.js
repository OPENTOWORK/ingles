import {
  CONFIGURABLE_STAFF_ROLES,
  DEFAULT_STAFF_ROLE_PERMISSIONS,
  STAFF_PERMISSION_DEFINITIONS,
  buildPermissionMatrix,
  normalizePermissionKeys,
  resolvePermissionKeysForRole,
} from '@/lib/staffRolePermissions';

const TABLE = 'staff_role_permissions';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @returns {Promise<Record<string, string[]>>}
 */
export async function loadStaffRolePermissionOverrides(db) {
  if (!db) return {};

  const { data, error } = await db.from(TABLE).select('role_key, permission_keys');

  if (error) {
    if (isMissingTableError(error)) return {};
    throw error;
  }

  const overrides = {};
  for (const row of data || []) {
    const roleKey = String(row?.role_key || '').trim();
    if (!roleKey) continue;
    overrides[roleKey] = normalizePermissionKeys(row?.permission_keys);
  }
  return overrides;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function saveStaffRolePermissionOverrides(db, roleKey, permissionKeys = []) {
  const key = String(roleKey || '').trim();
  if (!key || key === 'admin') {
    throw new Error('No se pueden editar los permisos del administrador.');
  }

  const allowedRole = CONFIGURABLE_STAFF_ROLES.some((role) => role.key === key);
  if (!allowedRole) {
    throw new Error('Rol no configurable.');
  }

  const normalized = normalizePermissionKeys(permissionKeys);
  const { error } = await db.from(TABLE).upsert(
    {
      role_key: key,
      permission_keys: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'role_key' },
  );

  if (error) throw error;
  return normalized;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function fetchRolePermissionsAdminPayload(db) {
  const overrides = await loadStaffRolePermissionOverrides(db);
  return {
    permissions: STAFF_PERMISSION_DEFINITIONS,
    roles: CONFIGURABLE_STAFF_ROLES,
    defaults: DEFAULT_STAFF_ROLE_PERMISSIONS,
    overrides,
    matrix: buildPermissionMatrix(overrides),
    resolved: Object.fromEntries(
      CONFIGURABLE_STAFF_ROLES.map((role) => [
        role.key,
        resolvePermissionKeysForRole(role.key, overrides),
      ]),
    ),
  };
}
