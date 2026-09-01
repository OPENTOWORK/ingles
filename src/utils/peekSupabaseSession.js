/**
 * Fast synchronous check for a cached Supabase session in localStorage.
 * Used to skip the full-screen auth loading gate when the user is likely signed in.
 */
export function hasStoredSupabaseSession() {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return true;
    }
  } catch {
    /* ignore parse errors */
  }
  return false;
}
