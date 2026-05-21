import { outcomesCefrForTraining } from '@/lib/placementOutcomesScoring';
import { NIVELES_CEFR_ORDER, parseAssignedCefrLevel } from '@/lib/placementLevelAccess';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPlacementTestId(testId) {
  return UUID_RE.test(String(testId || '').trim());
}

/** CEFR almacenable en placement_results (A2–C2; A1 → A2). */
export function nivelAsignadoForPlacementDb(placementResults) {
  const raw = outcomesCefrForTraining(placementResults);
  const parsed = parseAssignedCefrLevel(raw) || parseAssignedCefrLevel(String(raw));
  if (!parsed || parsed === 'A1') return 'A2';
  if (NIVELES_CEFR_ORDER.includes(parsed)) return parsed;
  return 'A2';
}

/**
 * Fila para insertar en placement_results tras completar el test.
 * @param {object} params
 * @param {string} params.userId
 * @param {string|null|undefined} params.testId
 * @param {ReturnType<import('@/lib/placementOutcomesScoring').computeOutcomesPlacementResults>} params.placementResults
 */
export function buildPlacementResultInsert({ userId, testId, placementResults }) {
  if (!userId || !placementResults) {
    throw new Error('Datos insuficientes para guardar el placement.');
  }

  const nivelAsignado = nivelAsignadoForPlacementDb(placementResults);
  const rawScore =
    placementResults.mcqCorrect ??
    placementResults.totalCorrect ??
    placementResults.grammar?.correct ??
    0;
  const score = Math.min(32767, Math.max(0, Math.round(Number(rawScore) || 0)));

  return {
    user_id: userId,
    test_id: isValidPlacementTestId(testId) ? String(testId).trim() : null,
    nivel_asignado: nivelAsignado,
    score,
  };
}
