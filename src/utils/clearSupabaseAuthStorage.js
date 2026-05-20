/** Claves de Supabase Auth en el navegador (sb-<project>-auth-token, etc.). */
export function clearSupabaseAuthStorage() {
  if (typeof window === 'undefined') return;

  for (const storage of [localStorage, sessionStorage]) {
    try {
      const keys = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && key.startsWith('sb-')) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      /* private mode / quota */
    }
  }
}
