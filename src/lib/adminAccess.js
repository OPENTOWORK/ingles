import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_EMAIL,
  isCoordinatorRole,
  normalizeEmail,
  normalizeRoleName,
} from '@/utils/authRoles';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getUserRoleNameServer } from '@/lib/userRoleServer';

async function userIsAdmin(user, db) {
  if (normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL)) {
    return true;
  }
  const roleName = await getUserRoleNameServer(user.id, db);
  const normalized = normalizeRoleName(roleName);
  return normalized === 'admin' || normalized === 'administrador';
}

export async function authenticateAdminRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return {
      error: 'Sesión no válida. Cierra sesión y vuelve a entrar en www.dralo.es.',
      status: 401,
    };
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseAnonKey = getSupabaseAnonKey();
  const token = auth.accessToken || '';

  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
        auth: { autoRefreshToken: false, persistSession: false },
      });

  const isAdmin = await userIsAdmin(auth.user, db);
  if (!isAdmin) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, token, db };
}

/** Admin o coordinador (p. ej. plan de objetivos). */
export async function authenticatePlanObjetivosAdminRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return {
      error: 'Sesión no válida. Cierra sesión y vuelve a entrar en www.dralo.es.',
      status: 401,
    };
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseAnonKey = getSupabaseAnonKey();
  const token = auth.accessToken || '';

  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
        auth: { autoRefreshToken: false, persistSession: false },
      });

  const isAdmin = await userIsAdmin(auth.user, db);
  const roleName = await getUserRoleNameServer(auth.user.id, db);
  const isCoordinator = isCoordinatorRole(roleName);

  if (!isAdmin && !isCoordinator) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, token, db, isAdmin, isCoordinator };
}
