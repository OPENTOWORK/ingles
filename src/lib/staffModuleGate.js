import { roleMayEnterModule } from '@/lib/staffRolePermissions';

export async function fetchStaffPermissionOverrides() {
  try {
    const res = await fetch('/api/staff/role-permissions', { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return data?.overrides || {};
  } catch {
    return {};
  }
}

/** True si el rol tiene alguno de los permisos del módulo. Los estudiantes nunca entran. */
export async function mayEnterStaffModule(roleName = '', permissionKeys = []) {
  const overrides = await fetchStaffPermissionOverrides();
  return roleMayEnterModule(roleName, permissionKeys, overrides);
}
