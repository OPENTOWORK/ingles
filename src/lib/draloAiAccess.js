import { createClient } from '@supabase/supabase-js';
import { isDraloAiLockedForRole } from '@/config/appNavMenu';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { getUserRoleNameServer } from '@/lib/userRoleServer';

function getRoleLookupDb(accessToken) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Whether the role may use Dralo AI pages and coach APIs (staff only). */
export function canAccessDraloAiForRole(userRole) {
  return !isDraloAiLockedForRole(userRole);
}

/** Resolve session + role access for Dralo AI routes and APIs. */
export async function getDraloAiAccessFromRequest(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return { allowed: false, reason: 'guest', user: null, roleName: null, accessToken: null };
  }

  const db = getRoleLookupDb(auth.accessToken);
  const roleName = await getUserRoleNameServer(auth.user.id, db);
  const allowed = canAccessDraloAiForRole(roleName);

  return {
    allowed,
    reason: allowed ? 'staff' : 'locked_role',
    user: auth.user,
    roleName,
    accessToken: auth.accessToken ?? null,
  };
}
