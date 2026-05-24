const LEVEL_TTL_MS = 30 * 60 * 1000;
const EXAM_IDS_TTL_MS = 30 * 60 * 1000;

function sortExamRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

/** @type {{ id: string, nombre?: string } | null} */
let cachedLevel = null;
let levelCachedAt = 0;

/** @type {Map<string, { ids: Record<number, string>, names: Record<number, string>, at: number }>} */
const examCatalogByLevelId = new Map();

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
 * Catálogo B2 (ids + nombres por slot) con una sola consulta a levels_examenes.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 */
export async function getCachedB2ExamCatalog(supabase, levelId) {
  if (!levelId) return { idsBySlot: {}, namesBySlot: {} };

  const hit = examCatalogByLevelId.get(levelId);
  if (hit && Date.now() - hit.at < EXAM_IDS_TTL_MS) {
    return { idsBySlot: hit.ids, namesBySlot: hit.names };
  }

  const { data, error } = await supabase
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', levelId);

  const ids = {};
  const names = {};
  if (!error && data?.length) {
    const ordered = sortExamRows(data);
    ordered.forEach((row, index) => {
      const slot = index + 1;
      ids[slot] = row.id;
      names[slot] = row.nombre?.trim() || `Examen ${slot}`;
    });
  }

  examCatalogByLevelId.set(levelId, { ids, names, at: Date.now() });
  return { idsBySlot: ids, namesBySlot: names };
}

/**
 * Mapa slot → examen_id para un level_id (caché en memoria).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 */
export async function getCachedB2ExamenIdsBySlot(supabase, levelId) {
  const { idsBySlot } = await getCachedB2ExamCatalog(supabase, levelId);
  return idsBySlot;
}

/**
 * Mapa slot → nombre de examen para un level_id (misma caché que ids).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} levelId
 */
export async function getCachedB2ExamNamesBySlot(supabase, levelId) {
  const { namesBySlot } = await getCachedB2ExamCatalog(supabase, levelId);
  return namesBySlot;
}

/** Invalida caché tras cambios de contenido en admin (opcional). */
export function invalidateB2LevelCache() {
  cachedLevel = null;
  levelCachedAt = 0;
  examCatalogByLevelId.clear();
}
