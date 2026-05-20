import { supabase } from '@/utils/supabaseClient';

/** Espera a que exista sesión tras signIn (evita carrera con el layout). */
export async function waitForAuthSession(timeoutMs = 5000) {
  const { data: { session: initial } } = await supabase.auth.getSession();
  if (initial) return initial;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (session) => {
      if (settled) return;
      settled = true;
      sub?.subscription?.unsubscribe?.();
      clearTimeout(timer);
      resolve(session ?? null);
    };

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          session &&
          (event === 'SIGNED_IN' ||
            event === 'INITIAL_SESSION' ||
            event === 'USER_UPDATED')
        ) {
          finish(session);
        }
      },
    );

    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}
