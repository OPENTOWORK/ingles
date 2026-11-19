import { supabase } from '@/utils/supabaseClient';

/** Vuelta desde Chrome a la app. Tiene que estar en las URL permitidas de Supabase. */
export const NATIVE_GOOGLE_CALLBACK = 'dralo://auth/callback';

export function isNativeCapacitorApp() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.Capacitor?.isNativePlatform?.() === true) return true;
  } catch {
    /* sin puente nativo */
  }
  return String(window.navigator?.userAgent || '').includes('DraloApp');
}

function capacitorPlugin(name) {
  const cap = typeof window !== 'undefined' ? window.Capacitor : null;
  if (!cap?.registerPlugin || !isNativeCapacitorApp()) return null;
  return cap.registerPlugin(name);
}

/**
 * Parte de `dralo://auth/callback` que hay que llevar a `/auth/callback/`.
 * Devuelve null si la dirección no es la vuelta del acceso.
 */
export function nativeAuthCallbackTarget(url) {
  let parsed;
  try {
    parsed = new URL(String(url || ''));
  } catch {
    return null;
  }
  if (parsed.protocol !== 'dralo:' || parsed.hostname !== 'auth') return null;
  const path = parsed.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/callback') return null;
  return `/auth/callback/${parsed.search}${parsed.hash}`;
}

/** Abre Google en Chrome. El WebView de Android no puede hacer este acceso. */
export async function startNativeGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: NATIVE_GOOGLE_CALLBACK,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  const url = data?.url;
  if (!url) throw new Error('Google no devolvió la dirección de acceso.');

  const browser = capacitorPlugin('Browser');
  if (!browser?.open) {
    throw new Error('Actualiza la app para entrar con Google.');
  }
  await browser.open({ url });
}

async function closeAuthBrowser() {
  const browser = capacitorPlugin('Browser');
  if (!browser?.close) return;
  try {
    await browser.close();
  } catch {
    /* la pestaña ya se cerró al volver a la app */
  }
}

/** Escucha la vuelta `dralo://` y completa el acceso en la misma sesión de la app. */
export function listenForNativeGoogleReturn() {
  const app = capacitorPlugin('App');
  if (!app?.addListener) return () => {};

  let remove = () => {};
  let stopped = false;
  const seen = new Set();

  const handle = (url) => {
    const target = nativeAuthCallbackTarget(url);
    if (!target || seen.has(target)) return;
    seen.add(target);
    void closeAuthBrowser().finally(() => {
      if (!stopped) window.location.replace(target);
    });
  };

  app.addListener('appUrlOpen', (event) => {
    if (event?.url) handle(event.url);
  }).then((listener) => {
    remove = () => listener?.remove?.();
    if (stopped) remove();
  }).catch(() => {});

  if (app.getLaunchUrl) {
    app.getLaunchUrl().then((launch) => {
      if (launch?.url) handle(launch.url);
    }).catch(() => {});
  }

  return () => {
    stopped = true;
    remove();
  };
}
