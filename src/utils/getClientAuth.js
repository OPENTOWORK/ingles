import { supabase } from '@/utils/supabaseClient';

/** Usuario actual: primero sesión local (rápida), luego validación en servidor si hace falta. */
export async function getClientAuth() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (session?.user) {
    return { user: session.user, session, error: sessionError ?? null };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (user) {
    const { data: { session: s2 } } = await supabase.auth.getSession();
    return { user, session: s2, error: userError ?? null };
  }

  return { user: null, session: null, error: userError ?? sessionError ?? null };
}
