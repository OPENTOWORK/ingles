import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { userHasRole } from '@/utils/authRoles';

export async function requireAdminFromRequest(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { ok: false, status: 401, error: 'No autenticado.' };
  }

  const authClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return { ok: false, status: 401, error: 'Sesión no válida.' };
  }

  const isAdmin = await userHasRole(
    authData.user.id,
    ['admin', 'administrador'],
    authData.user.email,
  );
  if (!isAdmin) {
    return { ok: false, status: 403, error: 'Solo administradores pueden generar exámenes.' };
  }

  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) {
    return {
      ok: false,
      status: 503,
      error:
        'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor. Añádela en .env.local (Supabase → Settings → API → service_role) y reinicia npm run dev.',
    };
  }

  const adminDb = createClient(getSupabaseUrl(), serviceKey);
  return { ok: true, user: authData.user, adminDb };
}
