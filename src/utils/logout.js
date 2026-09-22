import { supabase } from '@/utils/supabaseClient';
import { clearAllRoleCaches } from '@/utils/authRoles';
import { clearSupabaseAuthStorage } from '@/utils/clearSupabaseAuthStorage';

export const LOGOUT_PENDING_KEY = 'dralo_logout_pending';

export function isLogoutPending() {
  if (typeof window === 'undefined') return false;
  const raw = sessionStorage.getItem(LOGOUT_PENDING_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts) || Date.now() - ts > 60_000) {
    sessionStorage.removeItem(LOGOUT_PENDING_KEY);
    return false;
  }
  return true;
}

export function clearLogoutPending() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LOGOUT_PENDING_KEY);
}

function isEmbeddedPreviewFrame() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Cierra sesión solo dentro del iframe de visualización.
 * No llama al logout de cookies: eso invalidaría también la sesión de la ventana principal.
 */
async function performPreviewFrameLogout() {
  sessionStorage.setItem(LOGOUT_PENDING_KEY, String(Date.now()));
  clearAllRoleCaches();

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.error('Error during preview logout:', error?.message || error);
  }

  try {
    localStorage.removeItem('dralo-it-preview-auth-jar');
  } catch {
    /* private mode */
  }

  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams();
  const role = current.get('itPreviewRole');
  const reload = current.get('_itPreview');
  if (role) next.set('itPreviewRole', role);
  if (reload) next.set('_itPreview', reload);
  const qs = next.toString();
  window.location.assign(qs ? `/login?${qs}` : '/login');
}

/** Cierra sesión en Supabase, limpia almacenamiento local y recarga en /login. */
export async function performLogout() {
  if (typeof window === 'undefined') return;

  if (isEmbeddedPreviewFrame()) {
    await performPreviewFrameLogout();
    return;
  }

  sessionStorage.setItem(LOGOUT_PENDING_KEY, String(Date.now()));
  clearAllRoleCaches();
  clearSupabaseAuthStorage();

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    /* sin red */
  }

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.error('Error during logout:', error?.message || error);
  }

  clearSupabaseAuthStorage();

  window.location.assign('/login');
}

/** @deprecated Usa performLogout() */
export const handleLogout = async () => {
  await performLogout();
};
