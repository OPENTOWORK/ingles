import { supabase } from '@/utils/supabaseClient';

/**
 * Sincroniza el perfil de aplicación y correos de bienvenida (también OAuth/Google).
 * Siempre llama al servidor: el trigger de auth.users puede crear la fila antes
 * de que el cliente la vea y, sin esto, Google no recibiría el correo de bienvenida.
 */
export async function ensureAppUserProfile() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  const token = sessionData?.session?.access_token;

  if (sessionError || !userId || !token) {
    return { ok: false, reason: 'no_session' };
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
