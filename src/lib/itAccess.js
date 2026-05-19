import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { canAccessItPanel as canAccessItPanelFromRoles, userHasRole } from '@/utils/authRoles';

export { canAccessItPanelFromRoles as canAccessItPanel };

export async function assertItApiAccess(userId, email = '') {
  const isAdmin = await userHasRole(userId, ['admin', 'administrador'], email);
  const isIt = await userHasRole(userId, ['informatico', 'it'], email);
  if (!isAdmin && !isIt) {
    return { ok: false, status: 403, error: 'Sin permiso de informático o administrador.' };
  }
  return { ok: true, isAdmin, isIt };
}

export function getServiceDb(token) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient(supabaseUrl, getSupabaseAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function authenticateItRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { error: 'No autenticado.', status: 401 };
  }

  const authClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return { error: 'Sesión no válida.', status: 401 };
  }

  const access = await assertItApiAccess(authData.user.id, authData.user.email);
  if (!access.ok) {
    return { error: access.error, status: access.status };
  }

  return {
    user: authData.user,
    token,
    db: getServiceDb(token),
    isAdmin: access.isAdmin,
    isIt: access.isIt,
  };
}
