import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';
import { supabase } from '@/utils/supabaseClient';
import {
  computeLevelsStarsFromProgress,
  labelFromLevelsPuntuacionDescripcion,
  saveLevelStars,
} from '@/utils/levelsStars';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import { isB2RuoeV2SessionPersistenceBlocked } from '@/lib/b2ScoringV2FeatureFlag';

/**
 * Normalise part progress for Supabase persistence.
 * @param {object} progress
 */
export function normaliseLevelsPartProgress(progress = {}) {
  const scoringVersion = Number(progress.scoringVersion) || 1;
  const isV2 = scoringVersion === 2;
  const correct = Math.max(
    0,
    Number(
      isV2
        ? progress.puntosObtenidos ?? progress.pointsEarned ?? progress.correct
        : progress.pointsEarned ?? progress.correct,
    ) || 0,
  );
  const total = Math.max(
    1,
    Number(
      isV2
        ? progress.puntosMaximos ?? progress.maxPoints ?? progress.total
        : progress.maxPoints ?? progress.total,
    ) || 1,
  );
  const evaluated = Math.max(0, Number(progress.evaluated) || correct);
  const incorrect = Math.max(0, total - correct);
  return { correct, total, evaluated, incorrect, scoringVersion, isV2 };
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

  const { correct, total, incorrect, scoringVersion, isV2 } = normaliseLevelsPartProgress(progress);
  const itemCorrect = Math.max(0, Number(progress.correct) || 0);
  const itemTotal = Math.max(1, Number(progress.questionTotal ?? progress.total) || 1);
  const hasAnswers =
    progress.complete || correct > 0 || itemCorrect > 0 || (Number(progress.evaluated) || 0) > 0;
  if (!hasAnswers) return { saved: false, error: null };

  const statsPayload =
    statsMode === 'section-finish'
      ? {
          deltaIntentos: 1,
          deltaEvaluadas: isV2 ? itemTotal : total,
          deltaCorrectas: isV2 ? itemCorrect : correct,
          deltaIncorrectas: isV2 ? Math.max(0, itemTotal - itemCorrect) : incorrect,
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
      correctas: isV2 ? itemCorrect : correct,
      totalPreguntas: isV2 ? itemTotal : total,
      scoreSource,
      scoringVersion,
      puntosObtenidos: isV2 ? correct : undefined,
      puntosMaximos: isV2 ? total : undefined,
    }),
    mergeLevelsEstadisticas({
      userId,
      preguntaId,
      parteId,
      ...statsPayload,
    }),
  ]);

  let starsRes = { error: null, saved: false };
  if (puntRes.id) {
    starsRes = await saveLevelStars({
      puntuacionesId: puntRes.id,
      stars: computeLevelsStarsFromProgress(progress),
      scoreSource,
      descripcion: labelFromLevelsPuntuacionDescripcion(puntRes.descripcion),
    });

    if (!starsRes.saved && !starsRes.error) {
      const { syncStarsForPuntuacionRow } = await import('@/utils/syncLevelsStars');
      starsRes = await syncStarsForPuntuacionRow(supabase, {
        id: puntRes.id,
        descripcion: puntRes.descripcion,
        correctas: isV2 ? itemCorrect : correct,
        total_preguntas: isV2 ? itemTotal : total,
        puntos_obtenidos: isV2 ? correct : undefined,
        puntos_maximos: isV2 ? total : undefined,
        score_source: scoreSource,
        scoring_version: scoringVersion,
      });
    }
  }

  if (puntRes.error || estRes.error || starsRes.error) {
    return { saved: false, error: puntRes.error || estRes.error || starsRes.error };
  }

  return { saved: true, error: null, starsSaved: Boolean(starsRes.saved) };
}
