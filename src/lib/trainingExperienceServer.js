import { getSupabaseAdmin } from '@/lib/aiUsage';
import { getLevelInfo } from '@/lib/dralo-levels';
import { trainingXpForStars } from '@/lib/trainingExperience';

const TABLE = 'training_experiencia_usuario';
const LEVEL_KEY_COLUMNS = 'user_id,nivel_cefr,skill,dificultad,nivel';
const PAGE_SIZE = 1000;

function adminDb() {
  const db = getSupabaseAdmin();
  if (!db) {
    const error = new Error('Supabase admin unavailable');
    error.code = 'NO_DB';
    throw error;
  }
  return db;
}

/** Training XP of a user: 10 per star of their best result on each path level. */
export async function readTrainingExperience(userId) {
  const db = adminDb();
  let stars = 0;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from(TABLE)
      .select('estrellas')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    for (const row of data || []) stars += Number(row.estrellas) || 0;
    if (!data || data.length < PAGE_SIZE) break;
  }

  const totalXp = trainingXpForStars(stars);
  return { stars, totalXp, levelInfo: getLevelInfo(totalXp) };
}

/**
 * Saves the levels (already normalized) and returns the updated XP.
 * A database trigger keeps the higher stars when a level is already saved.
 */
export async function saveTrainingExperience(userId, levels) {
  if (levels.length) {
    const rows = levels.map((entry) => ({
      user_id: userId,
      nivel_cefr: entry.cefr,
      skill: entry.skill,
      dificultad: entry.difficulty,
      nivel: entry.level,
      estrellas: entry.stars,
    }));
    const { error } = await adminDb().from(TABLE).upsert(rows, { onConflict: LEVEL_KEY_COLUMNS });
    if (error) throw error;
  }
  return readTrainingExperience(userId);
}
