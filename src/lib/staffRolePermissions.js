import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isMarketingRole,
  isSupportRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';

/** Claves de permiso → entrada de menú staff. */
export const STAFF_PERMISSION_PANELS = {
  buzon: { href: '/buzon', label: 'Buzón y reuniones' },
  tareas: { href: '/tareas', label: 'Tareas' },
  admin: { href: '/admin', label: 'Administración' },
  profesorAdmin: { href: '/admin/profesor', label: 'Profesor' },
  profesor: { href: '/teacher', label: 'Profesor' },
  coordinador: { href: '/coordinador', label: 'Coordinador' },
  coordinadorAdmin: { href: '/admin/coordinador', label: 'Coordinador' },
  soporte: { href: '/soporte', label: 'Soporte' },
  informatico: { href: '/informatico', label: 'Informático' },
  planObjetivos: { href: '/admin/plan-objetivos', label: 'Formularios' },
  planFinanciero: { href: '/admin/plan-financiero', label: 'Financiero' },
  ejercicios: { href: '/admin/ejercicios', label: 'Ejercicios' },
  blog: { href: '/admin/blog', label: 'Blog' },
  planMarketing: { href: '/admin/marketing', label: 'Marketing' },
  configuracion: { href: '/admin/configuracion', label: 'Permisos' },
  facturacion: { href: '/admin/finanzas/facturacion', label: 'Facturación' },
  contabilidad: { href: '/admin/finanzas/contabilidad', label: 'Contabilidad' },
  tesoreria: { href: '/admin/finanzas/tesoreria', label: 'Tesorería' },
  centroEmpresa: { href: '/centro-empresa', label: 'Centro/empresa' },
  clasesGrupos: { href: '/clases-grupos', label: 'Clases/grupos' },
};

export const STAFF_PERMISSION_DEFINITIONS = [
  { key: 'buzon', label: 'Buzón y reuniones', category: 'Comunicación' },
  { key: 'tareas', label: 'Tareas', category: 'Operaciones' },
  { key: 'admin', label: 'Administración', category: 'Administración' },
  { key: 'profesorAdmin', label: 'Profesor (admin)', category: 'Pedagogía' },
  { key: 'profesor', label: 'Profesor', category: 'Pedagogía' },
  { key: 'coordinador', label: 'Coordinador', category: 'Pedagogía' },
  { key: 'coordinadorAdmin', label: 'Coordinador (admin)', category: 'Pedagogía' },
  { key: 'soporte', label: 'Soporte', category: 'Soporte' },
  { key: 'informatico', label: 'Informático', category: 'Técnico' },
  { key: 'planObjetivos', label: 'Formularios', category: 'Estrategia' },
  { key: 'planFinanciero', label: 'Financiero', category: 'Estrategia' },
  { key: 'ejercicios', label: 'Ejercicios', category: 'Contenido' },
  { key: 'blog', label: 'Blog', category: 'Marketing' },
  { key: 'planMarketing', label: 'Marketing', category: 'Marketing' },
  { key: 'configuracion', label: 'Permisos', category: 'Administración' },
  { key: 'facturacion', label: 'Facturación', category: 'Finanzas' },
  { key: 'contabilidad', label: 'Contabilidad', category: 'Finanzas' },
  { key: 'tesoreria', label: 'Tesorería', category: 'Finanzas' },
  { key: 'centroEmpresa', label: 'Centro/empresa', category: 'Clientes' },
  { key: 'clasesGrupos', label: 'Clases/grupos', category: 'Clientes' },
];

export const CONFIGURABLE_STAFF_ROLES = [
  { key: 'coordinador', label: 'Coordinador' },
  { key: 'marketing', label: 'Resp. marketing' },
  { key: 'profesor', label: 'Profesor' },
  { key: 'soporte', label: 'Soporte' },
  { key: 'informatico', label: 'Informático' },
  { key: 'centro_empresa', label: 'Centro / empresa' },
  { key: 'clases_grupos', label: 'Clases / grupos' },
];

/** Permisos por defecto (código) antes de cualquier override en BD. */
export const DEFAULT_STAFF_ROLE_PERMISSIONS = {
  coordinador: ['buzon', 'tareas', 'profesorAdmin', 'coordinador', 'planObjetivos', 'blog'],
  marketing: ['buzon', 'planMarketing', 'blog'],
  profesor: ['buzon', 'tareas', 'profesor'],
  soporte: ['buzon', 'tareas', 'soporte'],
  informatico: ['buzon', 'tareas', 'informatico'],
  centro_empresa: ['buzon', 'tareas', 'centroEmpresa'],
  clases_grupos: ['buzon', 'tareas', 'clasesGrupos'],
};

const ALL_PERMISSION_KEYS = STAFF_PERMISSION_DEFINITIONS.map((item) => item.key);

export function resolveStaffRolePermissionKey(roleName = '') {
  if (isAdminRole(roleName)) return 'admin';
  if (isMarketingRole(roleName)) return 'marketing';
  if (isCoordinatorRole(roleName)) return 'coordinador';
  if (isTeacherRole(roleName)) return 'profesor';
  if (isSupportRole(roleName)) return 'soporte';
  if (isItRole(roleName)) return 'informatico';
  const normalized = normalizeRoleName(roleName);
  if (normalized === 'centro_empresa' || normalized === 'centro/empresa') return 'centro_empresa';
  if (normalized === 'clases_grupos' || normalized === 'clases/grupos') return 'clases_grupos';
  return normalized;
}

export function getDefaultPermissionKeysForRole(roleKey = '') {
  const key = String(roleKey || '').trim();
  if (!key || key === 'admin') return [...ALL_PERMISSION_KEYS];
  return [...(DEFAULT_STAFF_ROLE_PERMISSIONS[key] || [])];
}

export function normalizePermissionKeys(keys = []) {
  const allowed = new Set(ALL_PERMISSION_KEYS);
  const seen = new Set();
  const result = [];
  for (const raw of keys || []) {
    const key = String(raw || '').trim();
    if (!key || !allowed.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

export function resolvePermissionKeysForRole(roleKey = '', overridesByRole = {}) {
  const key = String(roleKey || '').trim();
  if (!key) return [];
  if (key === 'admin') return [...ALL_PERMISSION_KEYS];
  const override = overridesByRole?.[key];
  if (Array.isArray(override)) return normalizePermissionKeys(override);
  return getDefaultPermissionKeysForRole(key);
}

export function permissionKeysToMenuItems(permissionKeys = []) {
  return normalizePermissionKeys(permissionKeys)
    .map((key) => STAFF_PERMISSION_PANELS[key])
    .filter(Boolean);
}

export function buildPermissionMatrix(overridesByRole = {}) {
  const matrix = {};
  for (const role of CONFIGURABLE_STAFF_ROLES) {
    const granted = new Set(resolvePermissionKeysForRole(role.key, overridesByRole));
    matrix[role.key] = Object.fromEntries(
      ALL_PERMISSION_KEYS.map((permissionKey) => [permissionKey, granted.has(permissionKey)]),
    );
  }
  return matrix;
}

export function canAccessRolePermissionsAdmin(roleName = '') {
  return isAdminRole(roleName);
}
