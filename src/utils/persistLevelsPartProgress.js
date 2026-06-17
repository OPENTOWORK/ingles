import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import { isB2RuoeV2SessionPersistenceBlocked } from '@/lib/b2ScoringV2FeatureFlag';

/**
 * Normalise part progress for Supabase persistence.
 * @param {object} progress
 */
export function normaliseLevelsPartProgress(progress = {}) {
  const correct = Math.max(0, Number(progress.pointsEarned ?? progress.correct) || 0);
  const total = Math.max(1, Number(progress.maxPoints ?? progress.total) || 1);
  const evaluated = Math.max(0, Number(progress.evaluated) || correct);
  const incorrect = Math.max(0, total - correct);
  return { correct, total, evaluated, incorrect };
}

/**
 * Persist one part attempt to levels_puntuaciones + levels_estadisticas.
 *
 * @param {{
 *   userId: string,
 *   preguntaId: string,
 *   parteId?: string | null,
 *   examenId: string,
 *   partNumber: number,
 *   progress: object,
 *   scoreSource?: string,
 *   statsMode?: 'part-complete' | 'section-finish',
 * }} params
 */
export async function persistLevelsPartProgress({
  userId,
  preguntaId,
  parteId = null,
  examenId,
  partNumber,
  progress,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  statsMode = 'part-complete',
}) {
  if (!userId || !preguntaId || !examenId || !partNumber || !progress) {
    return { saved: false, error: null };
  }

  if (isB2RuoeV2SessionPersistenceBlocked(partNumber)) {
    return { saved: false, error: null, v2PersistenceSkipped: true };
  }

  const { correct, total, incorrect } = normaliseLevelsPartProgress(progress);
  const hasAnswers = progress.complete || correct > 0 || (Number(progress.evaluated) || 0) > 0;
  if (!hasAnswers) return { saved: false, error: null };

  const statsPayload =
    statsMode === 'section-finish'
      ? {
          deltaIntentos: 1,
          deltaEvaluadas: total,
          deltaCorrectas: correct,
          deltaIncorrectas: incorrect,
        }
      : {
          deltaIntentos: 1,
        };

  const [puntRes, estRes] = await Promise.all([
    upsertLevelsPartPuntuacion({
      userId,
      preguntaId,
      examenId,
      parteNumero: partNumber,
      correctas: correct,
      totalPreguntas: total,
      scoreSource,
    }),
    mergeLevelsEstadisticas({
      userId,
      preguntaId,
      parteId,
      ...statsPayload,
    }),
  ]);

  if (puntRes.error || estRes.error) {
    return { saved: false, error: puntRes.error || estRes.error };
  }

  return { saved: true, error: null };
}
