import { getSessionUserId } from '@/utils/levelsEstadisticas';

/**
 * Persists finished exam-mode section scores to Supabase for logged-in users.
 */
export async function finishExamModeSupabasePersistence({ partSnapshots, examenId }) {
  if (!partSnapshots || !Object.keys(partSnapshots).length || !examenId) return;

  const uid = await getSessionUserId();
  if (!uid) return;

  const { persistExamModeSectionScores } = await import('@/utils/persistExamModeSectionScores');
  await persistExamModeSectionScores({ userId: uid, examenId, partSnapshots });
}
