import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_EMAIL,
  canAccessExamPartPrompts,
  isCoordinatorRole,
  isMarketingRole,
  isTeacherRole,
  normalizeEmail,
  normalizeRoleName,
} from '@/utils/authRoles';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import { actorMayEnterModules } from '@/lib/staffRolePermissionsServer';

async function userIsAdmin(user, db) {
  if (normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL)) {
    return true;
  }
  const roleName = await getUserRoleNameServer(user.id, db);
  const normalized = normalizeRoleName(roleName);
  return normalized === 'admin' || normalized === 'administrador';
}

export async function authenticateAdminRequest(req, permissionKeys = null) {
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
    const keys = Array.isArray(permissionKeys) ? permissionKeys : [];
    const roleName = keys.length ? await getUserRoleNameServer(auth.user.id, db) : '';
    const allowed = keys.length && (await actorMayEnterModules(db, roleName, keys));
    if (!allowed) {
      return { error: 'Sin permiso.', status: 403 };
    }
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

  const permitted =
    isAdmin || isCoordinator || (await actorMayEnterModules(db, roleName, ['planObjetivos']));
  if (!permitted) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, token, db, isAdmin, isCoordinator };
}

/** Admin, coordinador o responsable de marketing (gestión del blog). */
export async function authenticateBlogAdminRequest(req) {
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
  const isMarketing = isMarketingRole(roleName);

  const permitted =
    isAdmin ||
    isCoordinator ||
    isMarketing ||
    (await actorMayEnterModules(db, roleName, ['blog']));
  if (!permitted) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, token, db, isAdmin, isCoordinator, isMarketing };
}

/** Admin o responsable de marketing (plan de marketing). */
export async function authenticateMarketingPlanAdminRequest(req) {
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
  const isMarketing = isMarketingRole(roleName);

  const permitted =
    isAdmin || isMarketing || (await actorMayEnterModules(db, roleName, ['planMarketing']));
  if (!permitted) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return { user: auth.user, token, db, isAdmin, isMarketing };
}

/** Admin, coordinador o profesor (ver/editar prompts de generación de partes). */
export async function authenticateExamPartPromptRequest(req) {
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

  if (!isAdmin && !canAccessExamPartPrompts(roleName)) {
    return { error: 'Sin permiso.', status: 403 };
  }

  return {
    user: auth.user,
    token,
    db,
    isAdmin,
    isCoordinator: isCoordinatorRole(roleName),
    isTeacher: isTeacherRole(roleName),
  };
}
