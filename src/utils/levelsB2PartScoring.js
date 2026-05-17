import { passingCorrectCountForTotal } from '@/utils/levelsPracticePassing';

/**
 * Umbrales B2 First por parte (1–17), alineados con la estructura del examen.
 * total = ítems o puntos máximos de la parte; passing = mínimo para aprobar en práctica.
 */
export const B2_PART_SCORING = {
  1: { total: 7, passing: 5 },
  2: { total: 7, passing: 5 },
  3: { total: 8, passing: 5 },
  4: { total: 6, passing: 4 },
  5: { total: 6, passing: 4 },
  6: { total: 6, passing: 4 },
  7: { total: 10, passing: 6 },
  /** Writing: cada tarea se valora sobre 20 (4×5) en B2 First */
  8: { total: 20, passing: 12, kind: 'writing' },
  9: { total: 20, passing: 12, kind: 'writing' },
  10: { total: 8, passing: 5 },
  11: { total: 10, passing: 6 },
  12: { total: 5, passing: 3 },
  13: { total: 7, passing: 4 },
  /** Speaking: práctica por parte (5 = simulación completada con interacción mínima) */
  14: { total: 5, passing: 3, kind: 'speaking' },
  15: { total: 5, passing: 3, kind: 'speaking' },
  16: { total: 5, passing: 3, kind: 'speaking' },
  17: { total: 5, passing: 3, kind: 'speaking' },
};

export function getB2PartScoring(partNumber) {
  const n = Number(partNumber);
  return B2_PART_SCORING[n] || null;
}

export function isB2PartPassed(correctCount, partNumber) {
  const cfg = getB2PartScoring(partNumber);
  if (!cfg) return false;
  return Number(correctCount) >= cfg.passing;
}

/** Estrellas: cada parte aprobada del bloque = 0.5★ (máx. 3★ con 6 partes; usamos partes del paper). */
export function starsFromApprovedPartsCount(approvedPartsCount, partsInPaper = 4) {
  const maxStars = 3;
  const perPart = maxStars / Math.max(1, partsInPaper);
  const n = Math.max(0, Math.min(partsInPaper, Number(approvedPartsCount) || 0));
  return Math.min(maxStars, n * perPart);
}

export function getPassingForDynamicTotal(evaluatedTotal) {
  return passingCorrectCountForTotal(evaluatedTotal);
}
