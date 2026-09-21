import { supabase } from '@/utils/supabaseClient';
import { APP_ROUTES } from '@/config/appRoutes';
import { roleFromConfirmedCache, shouldCacheResolvedRole } from '@/lib/userRoleResolution';
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
  student: '/perfil',
  alumno: '/perfil',
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
  'resp.marketing': '/perfil',
  resp_marketing: '/perfil',
  responsable_marketing: '/perfil',
  marketing: '/perfil',
};

export const getRedirectPathByRoleName = (roleName = '') => {
  const normalized = normalizeRoleName(roleName);
  return ROLE_ROUTE_MAP[normalized] || '/perfil';
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

/** Responsable de marketing: blog + buzón/reuniones, sin paneles operativos. */
export function isMarketingRole(roleName = '') {
  const normalized = normalizeRoleName(roleName);
  return (
    normalized === 'resp.marketing' ||
    normalized === 'resp_marketing' ||
    normalized === 'responsable_marketing' ||
    normalized === 'responsable_de_marketing' ||
    normalized === 'marketing'
  );
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

export function canAccessBlogAdminPanel(roleName = '') {
  return isAdminRole(roleName) || isCoordinatorRole(roleName) || isMarketingRole(roleName);
}

export function canAccessMarketingPlanAdminPanel(roleName = '') {
  return isAdminRole(roleName) || isMarketingRole(roleName);
}

/** Prompts de generación de partes de examen (lectura/edición). */
export function canAccessExamPartPrompts(roleName = '') {
  return isAdminRole(roleName) || isCoordinatorRole(roleName) || isTeacherRole(roleName);
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

export function isStudentRole(roleName = '') {
  const role = normalizeRoleName(roleName);
  return role === 'student' || role === 'alumno';
}

export function canAccessItPanel(roleName = '') {
  return isAdminRole(roleName) || isItRole(roleName);
}

/** Buzón interno: mensajería instantánea — staff con acceso al buzón (incl. marketing). */
export function canAccessStaffBuzon(roleName = '') {
  if (isMarketingRole(roleName)) return true;
  return canAccessStaffTasks(roleName);
}

/** Tareas de profesor/alumnos: todo el staff excepto estudiantes y marketing. */
export function canAccessStaffTasks(roleName = '') {
  const role = normalizeRoleName(roleName);
  if (isMarketingRole(roleName)) return false;
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
  return readCachedRoleEntry(userId)?.role ?? null;
}

/** Entradas anteriores a `confirmed` se tratan como no confirmadas. */
function readCachedRoleEntry(userId) {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = sessionStorage.getItem(`${ROLE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role || Date.now() - Number(parsed.t || 0) > ROLE_CACHE_TTL_MS) {
      sessionStorage.removeItem(`${ROLE_CACHE_PREFIX}${userId}`);
      return null;
    }
    return { role: parsed.role, confirmed: parsed.confirmed === true };
  } catch {
    return null;
  }
}

function writeCachedRole(userId, role, confirmed = false) {
  if (typeof window === 'undefined' || !userId || !role) return;
  try {
    sessionStorage.setItem(
      `${ROLE_CACHE_PREFIX}${userId}`,
      JSON.stringify({ role, t: Date.now(), confirmed }),
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

/**
 * Devuelve `{ role, confirmed }`. `confirmed` es false en cada camino de respaldo:
 * el rol sigue siendo 'student' para los consumidores, pero no se ha leído de verdad.
 */
async function fetchRoleFromDb(userId) {
  // Real tables: Usuarios_y_Perfil_users (rol_id) and Usuarios_y_Perfil_profiles.
  // Do not depend on the TABLE_NAME_MAP alias `user_profiles` alone — query the
  // physical relation names so server and remapped-client paths stay consistent.
  const { data: userRow, error: userError } = await supabase
    .from('Usuarios_y_Perfil_users')
    .select('rol_id, Usuarios_y_Perfil_roles ( nombre )')
    .eq('id', userId)
    .maybeSingle();

  const embedded = userRow?.Usuarios_y_Perfil_roles;
  const embeddedName = Array.isArray(embedded) ? embedded[0]?.nombre : embedded?.nombre;
  if (!userError && embeddedName) return { role: embeddedName, confirmed: true };

  let rolId = userRow?.rol_id ?? null;
  if (!rolId) {
    const { data: profileRow } = await supabase
      .from('Usuarios_y_Perfil_profiles')
      .select('rol_id')
      .eq('user_id', userId)
      .maybeSingle();
    rolId = profileRow?.rol_id ?? null;
  }

  if (!rolId) {
    // Legacy alias path (maps to Usuarios_y_Perfil_users in supabaseClient).
    const { data: aliasRow } = await supabase
      .from('user_profiles')
      .select('rol_id')
      .eq('id', userId)
      .maybeSingle();
    rolId = aliasRow?.rol_id ?? null;
  }

  if (!rolId) return { role: 'student', confirmed: false };

  const { data: roleRow, error: roleError } = await supabase
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', rolId)
    .single();

  if (roleError || !roleRow?.nombre) return { role: 'student', confirmed: false };
  return { role: roleRow.nombre, confirmed: true };
}

/**
 * Igual que `getRoleNameByUserId`, indicando además si el rol se leyó realmente.
 * Un rechazo se propaga como antes: quien llame debe tratarlo como no confirmado.
 */
export const resolveRoleByUserId = async (userId, email = '') => {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return { role: 'admin', confirmed: true };
  }

  if (!userId) return { role: 'student', confirmed: false };

  const cached = roleFromConfirmedCache(readCachedRoleEntry(userId));
  if (cached) return cached;

  if (roleFetchInflight.has(userId)) {
    return roleFetchInflight.get(userId);
  }

  const fetchPromise = (async () => {
    const resolved = await fetchRoleFromDb(userId);
    if (shouldCacheResolvedRole(resolved)) {
      writeCachedRole(userId, resolved.role, true);
    }
    return resolved;
  })();

  roleFetchInflight.set(userId, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    roleFetchInflight.delete(userId);
  }
};

export const getRoleNameByUserId = async (userId, email = '') =>
  (await resolveRoleByUserId(userId, email)).role;

export const getRedirectPathByUserId = async (userId, email = '') => {
  const roleName = await getRoleNameByUserId(userId, email);
  return getRedirectPathByRoleName(roleName);
};

export const userHasRole = async (userId, allowedRoles = [], email = '') => {
  const roleName = normalizeRoleName(await getRoleNameByUserId(userId, email));
  return allowedRoles.map(normalizeRoleName).includes(roleName);
};
