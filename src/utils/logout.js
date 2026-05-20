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

/** Cierra sesión en Supabase, limpia almacenamiento local y recarga en /login. */
export async function performLogout() {
  if (typeof window === 'undefined') return;

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
