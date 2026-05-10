import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL, normalizeEmail } from '@/config/auth';

export type ServerUser = {
  id: string;
  email: string | undefined;
};

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email ?? undefined };
  } catch {
    return null;
  }
}

/**
 * Mirrors client-side role resolution (authRoles) using the server Supabase client + RLS.
 */
export async function getServerRoleName(user: ServerUser | null): Promise<string> {
  if (!user) return 'student';
  if (normalizeEmail(user.email ?? '') === normalizeEmail(ADMIN_EMAIL)) {
    return 'admin';
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userRow, error: userError } = await supabase
      .from('user_profiles')
      .select('rol_id')
      .eq('id', user.id)
      .single();

    if (userError || !userRow?.rol_id) return 'student';

    const { data: roleRow, error: roleError } = await supabase
      .from('Usuarios_y_Perfil_roles')
      .select('nombre')
      .eq('id', userRow.rol_id)
      .single();

    if (roleError || !roleRow?.nombre) return 'student';
    return String(roleRow.nombre);
  } catch {
    return 'student';
  }
}

export function normalizeRoleName(role = ''): string {
  return role
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

export async function isServerAdmin(): Promise<boolean> {
  const user = await getServerUser();
  const role = normalizeRoleName(await getServerRoleName(user));
  return role === 'admin' || role === 'administrador';
}
