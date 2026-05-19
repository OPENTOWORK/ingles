import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { normalizeRoleName } from '@/utils/authRoles';

const SUPPORT_ROLES = new Set([
  'soporte',
  'admin',
  'administrador',
  'support',
  'informatico',
  'it',
]);

export async function getAuthUserFromRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { user: null, token: null, error: 'No autenticado.' };

  const authClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return { user: null, token, error: 'Sesión no válida.' };
  return { user: data.user, token, error: null };
}

export async function userIsSupportStaff(userId, adminClient) {
  if (!userId) return false;

  const { data: userRow } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('rol_id')
    .eq('id', userId)
    .maybeSingle();

  if (!userRow?.rol_id) return false;

  const { data: roleRow } = await adminClient
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', userRow.rol_id)
    .maybeSingle();

  return SUPPORT_ROLES.has(normalizeRoleName(roleRow?.nombre || ''));
}

export function createDbClients(token) {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey();

  const adminClient = serviceKey
    ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  return { adminClient, userClient, hasServiceRole: Boolean(serviceKey) };
}

export async function requireSupportAgent(req) {
  const { user, token, error } = await getAuthUserFromRequest(req);
  if (!user) {
    return { ok: false, status: 401, error };
  }

  const { adminClient, userClient, hasServiceRole } = createDbClients(token);
  const db = adminClient || userClient;

  const allowed = await userIsSupportStaff(user.id, db);
  if (!allowed) {
    return { ok: false, status: 403, error: 'No tienes permiso de soporte.' };
  }

  return {
    ok: true,
    user,
    token,
    db,
    userClient,
    adminClient,
    hasServiceRole,
  };
}
