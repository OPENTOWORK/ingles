import { supabase } from '@/utils/supabaseClient';
import { waitForAuthSession } from '@/utils/waitForAuthSession';

/**
 * Tras signInWithPassword, confirma que la sesión está disponible antes de navegar.
 * signInWithPassword ya persiste la sesión; setSession solo si hace falta (OAuth/carrera).
 */
export async function completeSignIn(signInData) {
  let session = signInData?.session ?? null;

  if (!session) {
    const { data: { session: cached } } = await supabase.auth.getSession();
    session = cached;
  }

  if (!session) {
    session = await waitForAuthSession(2000);
  }

  if (!session?.access_token || !session?.refresh_token || !session?.user) {
    return { ok: false, reason: 'no_session' };
  }

  if (!signInData?.session) {
    const { error: setError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (setError) {
      return { ok: false, reason: 'set_session_failed', error: setError };
    }
  }

  return { ok: true, session, user: session.user };
}
