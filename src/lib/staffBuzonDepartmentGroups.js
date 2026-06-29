import { isAdminRole, normalizeRoleName } from '@/utils/authRoles';
import { getUserRoleNameServer } from '@/lib/userRoleServer';

export const STAFF_BUZON_ALL_GROUP = 'DPT. ALL';

export const STAFF_BUZON_DEPARTMENT_GROUPS = [
  'DPT. COMERCIAL',
  'DPT. DIRECCIÓN Y ESTRATEGIA',
  'DPT. FACTURACIÓN Y CONTABILIDAD',
  'DPT. INFORMÁTICA',
  'DPT. MARKETING',
  'DPT. SOPORTE',
  'DPTO. INGLÉS',
];

const ROLE_TO_BUZON_GROUPS = {
  admin: ['DPT. DIRECCIÓN Y ESTRATEGIA'],
  administrador: ['DPT. DIRECCIÓN Y ESTRATEGIA'],
  coordinador: ['DPT. DIRECCIÓN Y ESTRATEGIA'],
  coordinator: ['DPT. DIRECCIÓN Y ESTRATEGIA'],
  informatico: ['DPT. INFORMÁTICA'],
  it: ['DPT. INFORMÁTICA'],
  teacher: ['DPTO. INGLÉS'],
  profesor: ['DPTO. INGLÉS'],
  soporte: ['DPT. SOPORTE'],
  support: ['DPT. SOPORTE'],
  centro_empresa: ['DPT. COMERCIAL'],
  clases_grupos: ['DPTO. INGLÉS'],
};

const GROUPS_TABLE = 'staff_buzon_grupos';
const MEMBERS_TABLE = 'staff_buzon_grupo_miembros';

export function getBuzonGroupsForRole(roleName = '') {
  const groups = new Set([STAFF_BUZON_ALL_GROUP]);

  if (isAdminRole(roleName)) {
    for (const groupName of STAFF_BUZON_DEPARTMENT_GROUPS) {
      groups.add(groupName);
    }
    return [...groups];
  }

  const role = normalizeRoleName(roleName);
  for (const groupName of ROLE_TO_BUZON_GROUPS[role] || []) {
    groups.add(groupName);
  }

  return [...groups];
}

async function findGroupsByNames(db, names) {
  if (!names.length) return new Map();

  const { data, error } = await db.from(GROUPS_TABLE).select('id, name').in('name', names);
  if (error) throw error;

  const map = new Map();
  for (const row of data || []) {
    map.set(row.name, row.id);
  }
  return map;
}

async function ensureMemberships(db, userId, groupIds) {
  if (!userId || !groupIds.length) return;

  const { data: current, error: currentError } = await db
    .from(MEMBERS_TABLE)
    .select('group_id')
    .eq('user_id', userId)
    .in('group_id', groupIds);

  if (currentError) throw currentError;

  const existing = new Set((current || []).map((row) => row.group_id));
  const missing = groupIds.filter((groupId) => !existing.has(groupId));
  if (!missing.length) return;

  const { error: insertError } = await db.from(MEMBERS_TABLE).insert(
    missing.map((group_id) => ({ group_id, user_id: userId })),
  );
  if (insertError) throw insertError;
}

/**
 * Asegura que el usuario pertenezca a DPT. ALL y a los grupos de su departamento.
 * Los grupos deben existir previamente en staff_buzon_grupos.
 */
export async function ensureStaffBuzonDepartmentMemberships(db, userId, roleName) {
  if (!db || !userId) return;

  const targetNames = getBuzonGroupsForRole(roleName);
  const groupsByName = await findGroupsByNames(db, targetNames);
  const groupIds = targetNames.map((name) => groupsByName.get(name)).filter(Boolean);

  await ensureMemberships(db, userId, groupIds);
}

export async function ensureStaffBuzonDepartmentMembershipsForUser(db, userId) {
  const roleName = await getUserRoleNameServer(userId, db);
  await ensureStaffBuzonDepartmentMemberships(db, userId, roleName);
}
