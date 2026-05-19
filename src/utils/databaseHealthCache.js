import { checkDatabaseHealth } from '@/utils/databaseInitializer';

const CACHE_KEY = 'dralo_db_health_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Comprueba salud de BD como máximo una vez cada 6 h por pestaña (evita bloquear la UI).
 */
export async function checkDatabaseHealthCached() {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ts && Date.now() - parsed.ts < CACHE_TTL_MS) {
          return { healthy: Boolean(parsed.healthy), cached: true };
        }
      }
    } catch {
      /* ignore */
    }
  }

  const result = await checkDatabaseHealth();

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ healthy: Boolean(result?.healthy), ts: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }

  return result;
}
