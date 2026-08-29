import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { AUTH_CONFIRM_TYPES, sanitizeNextPath } from '@/lib/authActionLinks';

export const dynamic = 'force-dynamic';

/** Destino cuando el enlace falla, según lo que el usuario intentaba hacer. */
function failurePath(type, reason) {
  const base = type === 'recovery' ? '/reset-password' : '/login';
  return `${base}?error=${encodeURIComponent(reason)}`;
}

function translateVerifyError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('expired')) return 'link_expired';
  if (message.includes('already') || message.includes('used')) return 'link_used';
  return 'link_invalid';
}

/**
 * Verifica los enlaces de correo (recuperación de contraseña, confirmación de
 * email) y deja la sesión en cookies antes de redirigir.
 *
 * Verificamos con `token_hash` en el servidor, así el enlace funciona aunque se
 * abra en otro navegador o en el visor del cliente de correo.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') || 'email';
  const next = sanitizeNextPath(searchParams.get('next'));
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  const origin = new URL(request.url).origin;
  const redirect = (path) => NextResponse.redirect(new URL(path, origin));

  if (errorParam) {
    return redirect(failurePath(type, /expired/i.test(errorParam) ? 'link_expired' : 'link_invalid'));
  }

  if (!tokenHash && !code) {
    return redirect(failurePath(type, 'link_invalid'));
  }

  if (tokenHash && !AUTH_CONFIRM_TYPES.includes(type)) {
    return redirect(failurePath(type, 'link_invalid'));
  }

  /** @type {Array<{ name: string, value: string, options?: object }>} */
  const pendingCookies = [];

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const { error } = tokenHash
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/confirm]', type, error.message);
    return redirect(failurePath(type, translateVerifyError(error)));
  }

  const response = redirect(next);
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
