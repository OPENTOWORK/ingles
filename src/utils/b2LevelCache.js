import { resolveB2ExamenIdsBySlot } from '@/utils/levelsPuntuacionesProgress';

const LEVEL_TTL_MS = 30 * 60 * 1000;
const EXAM_IDS_TTL_MS = 30 * 60 * 1000;

/** @type {{ id: string, nombre?: string } | null} */
let cachedLevel = null;
let levelCachedAt = 0;

/** @type {Map<string, { ids: Record<number, string>, at: number }>} */
const examIdsByLevelId = new Map();

/**
 * Nivel B2 en memoria (evita repetir `levels` en cada página/parte).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function getCachedB2Level(supabase) {
  if (cachedLevel && Date.now() - levelCachedAt < LEVEL_TTL_MS) {
    return { data: cachedLevel, error: null };
  }

  const { data, error } = await supabase
    .from('levels')
    .select('id, nombre')
    .ilike('nombre', 'b2')
    .limit(1)
    .single();

  if (!error && data?.id) {
    cachedLevel = data;
    levelCachedAt = Date.now();
  }

  return { data, error };
}

/**
 * Mapa slot → examen_id para un level_id (caché en memoria).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 */
export async function getCachedB2ExamenIdsBySlot(supabase, levelId) {
  if (!levelId) return {};

  const hit = examIdsByLevelId.get(levelId);
  if (hit && Date.now() - hit.at < EXAM_IDS_TTL_MS) {
    return hit.ids;
  }

  const ids = await resolveB2ExamenIdsBySlot(supabase, levelId);
  examIdsByLevelId.set(levelId, { ids, at: Date.now() });
  return ids;
}

/** Invalida caché tras cambios de contenido en admin (opcional). */
export function invalidateB2LevelCache() {
  cachedLevel = null;
  levelCachedAt = 0;
  examIdsByLevelId.clear();
}
