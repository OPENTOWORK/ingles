import { supabase } from '@/utils/supabaseClient';

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
};

export const getRedirectPathByRoleName = (roleName = '') => {
  const normalized = normalizeRoleName(roleName);
  return ROLE_ROUTE_MAP[normalized] || '/perfil';
};

/** Evita múltiples lecturas en paralelo para el mismo usuario (mismo resultado). */
const roleFetchInflight = new Map();

export const getRoleNameByUserId = async (userId, email = '') => {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) {
    return 'admin';
  }

  if (!userId) return 'student';

  if (roleFetchInflight.has(userId)) {
    return roleFetchInflight.get(userId);
  }

  const fetchPromise = (async () => {
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
