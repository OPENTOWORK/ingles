import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { userHasRole } from '@/utils/authRoles';

export async function authenticateAdminRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { error: 'No autenticado.', status: 401 };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return { error: 'Sesión no válida.', status: 401 };
  }

  const isAdmin = await userHasRole(
    authData.user.id,
    ['admin', 'administrador'],
    authData.user.email,
  );
  if (!isAdmin) {
    return { error: 'Sin permiso.', status: 403 };
  }

  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const db = serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

  return { user: authData.user, token, db };
}
