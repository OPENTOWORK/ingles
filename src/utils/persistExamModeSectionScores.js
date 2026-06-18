import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { persistLevelsPartProgress } from '@/utils/persistLevelsPartProgress';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';

/**
 * Exam-mode section finish: persist each answered part to levels_puntuaciones
 * (exam_mode) and levels_estadisticas.
 */
export async function persistExamModeSectionScores({ userId, examenId, partSnapshots = {} }) {
  if (!userId || !examenId) return { saved: 0, error: null };

  const profile = await ensureAppUserProfile();
  if (!profile.ok && profile.reason !== 'no_session') {
    return { saved: 0, error: new Error('Could not sync user profile.') };
  }
  if (!profile.ok) return { saved: 0, error: null };

  let saved = 0;
  let lastError = null;

  const entries = Object.entries(partSnapshots);
  await Promise.all(
    entries.map(async ([partKey, snap]) => {
      const partNumber = Number(partKey);
      const progress = snap?.progress;
      const preguntaId = snap?.draft?.preguntaId;
      const parteId = snap?.draft?.parteId || null;
      if (!preguntaId || !partNumber || !progress) return;

      const result = await persistLevelsPartProgress({
        userId,
        preguntaId,
        parteId,
        examenId,
        partNumber,
        progress,
        scoreSource: LEVELS_SCORE_SOURCE.EXAM_MODE,
        statsMode: 'section-finish',
      });

      if (result.error) {
        lastError = result.error;
        return;
      }
      if (result.saved) saved += 1;
    }),
  );

  return { saved, error: lastError };
}
