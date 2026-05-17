import { getB2PartScoring, isB2PartPassed } from '@/utils/levelsB2PartScoring';
import { computeB2PartProgressFromState, saveB2PartPuntuacionIfComplete } from '@/utils/recordLevelsB2PartScore';

/** @deprecated Usar computeB2PartProgressFromState */
export const computeUoePartProgressFromState = computeB2PartProgressFromState;

/**
 * Guarda la fila de levels_puntuaciones cuando la parte está completa.
 */
export async function saveUoePartPuntuacionIfComplete({
  userId,
  preguntaId,
  parteId,
  examenId,
  partNumber,
  progress,
}) {
  return saveB2PartPuntuacionIfComplete({
    userId,
    preguntaId,
    parteId,
    examenId,
    partNumber,
    progress,
  });
}

/** @deprecated Usar computeUoePartProgressFromState + saveUoePartPuntuacionIfComplete */
export async function recordLevelsUoePartScore({
  userId,
  preguntaId,
  parteId,
  examenId,
  partNumber,
  correctCount,
}) {
  const cfg = getB2PartScoring(partNumber);
  const progress = {
    complete: true,
    correct: Math.min(cfg?.total || 0, Math.max(0, Number(correctCount) || 0)),
    total: cfg?.total || 0,
    passing: cfg?.passing || 0,
    passed: cfg ? isB2PartPassed(correctCount, partNumber) : false,
  };
  return saveUoePartPuntuacionIfComplete({
    userId,
    preguntaId,
    parteId,
    examenId,
    partNumber,
    progress,
  });
}

/** @deprecated Usar computeUoePartProgressFromState */
export function isUoePartFullyEvaluated(args) {
  return computeUoePartProgressFromState(args).complete;
}
