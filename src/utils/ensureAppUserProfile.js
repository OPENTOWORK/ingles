import { supabase } from '@/utils/supabaseClient';

/**
 * Comprueba que el usuario tenga fila en Usuarios_y_Perfil_users (FK de levels_*).
 * Primero SELECT (RLS propio); si falta, llama a /api/auth/ensure-profile.
 */
export async function ensureAppUserProfile() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  const token = sessionData?.session?.access_token;

  if (sessionError || !userId || !token) {
    return { ok: false, reason: 'no_session' };
  }

  const { data: existing, error: selErr } = await supabase
    .from('Usuarios_y_Perfil_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!selErr && existing?.id) {
    return { ok: true };
  }

  try {
    const res = await fetch('/api/auth/ensure-profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return { ok: true };
    }

    const { data: afterApi } = await supabase
      .from('Usuarios_y_Perfil_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (afterApi?.id) {
      return { ok: true };
    }

    return { ok: false, reason: 'sync_failed', status: res.status };
  } catch {
    const { data: retry } = await supabase
      .from('Usuarios_y_Perfil_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (retry?.id) return { ok: true };
    return { ok: false, reason: 'sync_failed' };
  }
}
