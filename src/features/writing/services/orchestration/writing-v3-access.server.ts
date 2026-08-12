/**
 * Server-side role resolution for Writing v3 beta gating.
 *
 * Queries the real tables (not the non-existent `user_profiles` relation name
 * without remapping). Prefer Usuarios_y_Perfil_users.rol_id; fall back to
 * Usuarios_y_Perfil_profiles.rol_id by user_id.
 */
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL, normalizeEmail, normalizeRoleName } from '@/utils/authRoles';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  resolveWritingV3Access,
  type WritingV3AccessDecision,
} from '../../config/writing-v3-flags';

function adminClient() {
  const key = getSupabaseServiceRoleKey()?.trim();
  const url = getSupabaseUrl();
  if (!key || !url) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function anonClient() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error('Supabase URL/anon key missing');
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function resolveRoleNameFromDb(userId: string): Promise<string | null> {
  const client = adminClient() || anonClient();

  const { data: userRow } = await client
    .from('Usuarios_y_Perfil_users')
    .select('rol_id')
    .eq('id', userId)
    .maybeSingle();

  let rolId = userRow?.rol_id ?? null;

  if (!rolId) {
    const { data: profileRow } = await client
      .from('Usuarios_y_Perfil_profiles')
      .select('rol_id')
      .eq('user_id', userId)
      .maybeSingle();
    rolId = profileRow?.rol_id ?? null;
  }

  if (!rolId) return null;

  const { data: roleRow } = await client
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', rolId)
    .maybeSingle();

  return roleRow?.nombre ? String(roleRow.nombre) : null;
}

export async function resolveServerRoleName(userId: string, email = ''): Promise<string> {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) return 'admin';
  if (!userId) return 'student';
  try {
    const name = await resolveRoleNameFromDb(userId);
    return name ? normalizeRoleName(name) : 'student';
  } catch {
    return 'student';
  }
}

export async function resolveWritingV3AccessForUser(input: {
  userId: string;
  email?: string | null;
}): Promise<WritingV3AccessDecision> {
  const roleName = await resolveServerRoleName(input.userId, input.email || '');
  return resolveWritingV3Access({
    userId: input.userId,
    email: input.email,
    roleName,
  });
}
