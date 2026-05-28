import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';

/**
 * Valida la sesión del request: Bearer JWT y, si falla, cookies de Supabase SSR.
 * @param {Request} req
 * @returns {Promise<{ user: import('@supabase/supabase-js').User, accessToken: string | null } | null>}
 */
export async function getSupabaseUserFromRequest(req) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (bearer) {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await authClient.auth.getUser(bearer);
    if (!error && data?.user) {
      return { user: data.user, accessToken: bearer };
    }
    if (error) {
      console.warn('[auth] Bearer getUser failed:', error.message);
    }
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          /* Route Handler: no-op si no puede escribir cookies */
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userError && userData?.user) {
      const { data: sessionData } = await supabase.auth.getSession();
      return {
        user: userData.user,
        accessToken: sessionData?.session?.access_token || bearer || null,
      };
    }
    if (userError) {
      console.warn('[auth] Cookie getUser failed:', userError.message);
    }
  } catch (err) {
    console.warn('[auth] Cookie auth unavailable:', err?.message || err);
  }

  return null;
}
