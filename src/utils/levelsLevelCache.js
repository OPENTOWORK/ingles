import { resolveB2ExamenIdsBySlot } from '@/utils/levelsPuntuacionesProgress';

const LEVEL_TTL_MS = 30 * 60 * 1000;
const EXAM_IDS_TTL_MS = 30 * 60 * 1000;

/** @type {Map<string, { data: { id: string, nombre?: string }, at: number }>} */
const levelBySlug = new Map();

/** @type {Map<string, { ids: Record<number, string>, at: number }>} */
const examIdsByLevelId = new Map();

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} slug — a2, b1, b2, c1, c2
 */
export async function getCachedLevelBySlug(supabase, slug) {
  const key = String(slug || '').toLowerCase();
  const hit = levelBySlug.get(key);
  if (hit && Date.now() - hit.at < LEVEL_TTL_MS) {
    return { data: hit.data, error: null };
  }

  const { data, error } = await supabase
    .from('levels')
    .select('id, nombre')
    .ilike('nombre', key)
    .limit(1)
    .maybeSingle();

  if (!error && data?.id) {
    levelBySlug.set(key, { data, at: Date.now() });
  }

  return { data, error };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 */
export async function getCachedExamenIdsBySlot(supabase, levelId) {
  if (!levelId) return {};

  const hit = examIdsByLevelId.get(levelId);
  if (hit && Date.now() - hit.at < EXAM_IDS_TTL_MS) {
    return hit.ids;
  }

  const ids = await resolveB2ExamenIdsBySlot(supabase, levelId);
  examIdsByLevelId.set(levelId, { ids, at: Date.now() });
  return ids;
}

/** Tras generar un examen nuevo, vacía caché de slots. */
export function invalidateLevelExamCache(levelId) {
  if (levelId) examIdsByLevelId.delete(levelId);
}
