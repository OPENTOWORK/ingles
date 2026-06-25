import { supabase } from '@/utils/supabaseClient';
import { APP_ROUTES } from '@/config/appRoutes';
export const ADMIN_EMAIL = 'direccion@opentowork.com';
export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const normalizeRoleName = (role = '') =>
  role
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

export const ROLE_ROUTE_MAP = {
  admin: '/admin',
  administrador: '/admin',
  teacher: '/teacher',
  profesor: '/teacher',
  student: APP_ROUTES.profile,
  alumno: APP_ROUTES.profile,
  soporte: '/soporte',
  support: '/soporte',
  informatico: '/informatico',
  it: '/informatico',
  'centro/empresa': '/centro-empresa',
  centro_empresa: '/centro-empresa',
  organization: '/centro-empresa',
  'clases/grupos': '/clases-grupos',
  clases_grupos: '/clases-grupos',
  group: '/clases-grupos',
  coordinador: '/coordinador',
  coordinator: '/coordinador',
};

export const getRedirectPathByRoleName = (roleName = '') => {
  const normalized = normalizeRoleName(roleName);
  return ROLE_ROUTE_MAP[normalized] || APP_ROUTES.profile;
};

export function isAdminRole(roleName = '') {
  const normalized = normalizeRoleName(roleName);
  return normalized === 'admin' || normalized === 'administrador';
}

export function isTeacherRole(roleName = '') {
  const normalized = normalizeRoleName(roleName);
  return normalized === 'teacher' || normalized === 'profesor';
}

export function isCoordinatorRole(roleName = '') {
  const normalized = normalizeRoleName(roleName);
  return normalized === 'coordinador' || normalized === 'coordinator';
}

export function isSupportRole(roleName = '') {
  const normalized = normalizeRoleName(roleName);
  return normalized === 'soporte' || normalized === 'support';
}

export function canAccessSupportPanel(roleName = '') {
  return isAdminRole(roleName) || isSupportRole(roleName);
}

export function canAccessTeacherPanel(roleName = '') {
  return isAdminRole(roleName) || isTeacherRole(roleName) || isCoordinatorRole(roleName);
}

export function canAccessPlanObjetivosAdminPanel(roleName = '') {
  return isAdminRole(roleName) || isCoordinatorRole(roleName);
}

/** Vista «admin» del panel de profesor (todos los alumnos). */
export function canAccessAdminTeacherPanelView(roleName = '') {
  return isAdminRole(roleName) || isCoordinatorRole(roleName);
}

export function canAccessCoordinatorPanel(roleName = '') {
  return isAdminRole(roleName) || isCoordinatorRole(roleName);
}

export function isItRole(roleName = '') {
  const n = normalizeRoleName(roleName);
  return n === 'informatico' || n === 'it';
}

export function canAccessItPanel(roleName = '') {
  return isAdminRole(roleName) || isItRole(roleName);
}

/** Buzón interno: mensajería instantánea entre staff. */
export function canAccessStaffBuzon(roleName = '') {
  return (
    isAdminRole(roleName) ||
    isCoordinatorRole(roleName) ||
    isTeacherRole(roleName) ||
    isSupportRole(roleName) ||
    isItRole(roleName)
  );
}

/** Tareas de profesor/alumnos: todo el staff excepto estudiantes. */
export function canAccessStaffTasks(roleName = '') {
  const role = normalizeRoleName(roleName);
  return role !== 'student' && role !== 'alumno' && Boolean(role);
}

/** Evita múltiples lecturas en paralelo para el mismo usuario (mismo resultado). */
const roleFetchInflight = new Map();

const ROLE_CACHE_PREFIX = 'dralo_user_role_v1_';
const ROLE_CACHE_TTL_MS = 10 * 60 * 1000;

/** Rol en sessionStorage (sin red) para pintar la UI antes del fetch. */
export function peekCachedRoleName(userId) {
  return readCachedRole(userId);
}

function readCachedRole(userId) {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = sessionStorage.getItem(`${ROLE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role || Date.now() - Number(parsed.t || 0) > ROLE_CACHE_TTL_MS) {
      sessionStorage.removeItem(`${ROLE_CACHE_PREFIX}${userId}`);
      return null;
    }
    return parsed.role;
  } catch {
    return null;
  }
}

function writeCachedRole(userId, role) {
  if (typeof window === 'undefined' || !userId || !role) return;
  try {
    sessionStorage.setItem(
      `${ROLE_CACHE_PREFIX}${userId}`,
      JSON.stringify({ role, t: Date.now() }),
    );
  } catch {
    /* quota / private mode */
  }
}

/** Limpia la caché de rol (p. ej. al cerrar sesión). */
export function clearAllRoleCaches() {
  if (typeof window === 'undefined') return;
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(ROLE_CACHE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* private mode */
  }
}

async function fetchRoleNameFromDb(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('rol_id, Usuarios_y_Perfil_roles ( nombre )')
    .eq('id', userId)
    .maybeSingle();

  const embedded = data?.Usuarios_y_Perfil_roles;
  const embeddedName = Array.isArray(embedded) ? embedded[0]?.nombre : embedded?.nombre;
  if (!error && embeddedName) return embeddedName;

  const { data: userRow, error: userError } = await supabase
    .from('user_profiles')
    .select('rol_id')
    .eq('id', userId)
    .single();

  if (userError || !userRow?.rol_id) return 'student';

  const { data: roleRow, error: roleError } = await supabase
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', userRow.rol_id)
    .single();

  if (roleError || !roleRow?.nombre) return 'student';
  return roleRow.nombre;
}

export const getRoleNameByUserId = async (userId, email = '') => {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return 'admin';
  }

  if (!userId) return 'student';

  const cached = readCachedRole(userId);
  if (cached) return cached;

  if (roleFetchInflight.has(userId)) {
    return roleFetchInflight.get(userId);
  }

  const fetchPromise = (async () => {
    const role = await fetchRoleNameFromDb(userId);
    writeCachedRole(userId, role);
    return role;
  })();

  roleFetchInflight.set(userId, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    roleFetchInflight.delete(userId);
  }
};

export const getRedirectPathByUserId = async (userId, email = '') => {
  const roleName = await getRoleNameByUserId(userId, email);
  return getRedirectPathByRoleName(roleName);
};

export const userHasRole = async (userId, allowedRoles = [], email = '') => {
  const roleName = normalizeRoleName(await getRoleNameByUserId(userId, email));
  return allowedRoles.map(normalizeRoleName).includes(roleName);
};
