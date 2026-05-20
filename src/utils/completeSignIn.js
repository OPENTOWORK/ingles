import { supabase } from '@/utils/supabaseClient';
import { waitForAuthSession } from '@/utils/waitForAuthSession';

/**
 * Tras signInWithPassword, fuerza que la sesión quede guardada antes de navegar.
 */
export async function completeSignIn(signInData) {
  let session = signInData?.session ?? null;

  if (!session) {
    const { data: { session: cached } } = await supabase.auth.getSession();
    session = cached;
  }

  if (!session) {
    session = await waitForAuthSession(5000);
  }

  if (!session?.access_token || !session?.refresh_token) {
    return { ok: false, reason: 'no_session' };
  }

  const { error: setError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (setError) {
    return { ok: false, reason: 'set_session_failed', error: setError };
  }

  const { data: { session: verified } } = await supabase.auth.getSession();
  if (!verified?.user) {
    return { ok: false, reason: 'verify_failed' };
  }

  return { ok: true, session: verified, user: verified.user };
}
