import { passingCorrectCountForTotal } from '@/utils/levelsPracticePassing';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';

/**
 * Umbrales B2 First por parte (1–17), alineados con la estructura del examen.
 * total = ítems o puntos máximos de la parte; passing = mínimo para aprobar en práctica.
 */
export const B2_PART_SCORING = {
  1: { total: 8, passing: 5 },
  2: { total: 8, passing: 5 },
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

/** Scoring V2 — Cambridge-scale points (R&UoE parts 1–7 only). */
export const B2_PART_SCORING_V2 = {
  1: { questionCount: 8, maxPoints: 8, pointsPerCorrect: 1 },
  2: { questionCount: 8, maxPoints: 8, pointsPerCorrect: 1 },
  3: { questionCount: 8, maxPoints: 8, pointsPerCorrect: 1 },
  4: { questionCount: 6, maxPoints: 12, pointsPerCorrect: 2 },
  5: { questionCount: 6, maxPoints: 12, pointsPerCorrect: 2 },
  6: { questionCount: 6, maxPoints: 12, pointsPerCorrect: 2 },
  7: { questionCount: 10, maxPoints: 10, pointsPerCorrect: 1 },
};

export const B2_PAPER_SCORING_V2 = {
  reading: { parts: [1, 5, 6, 7], maxPoints: 42 },
  useOfEnglish: { parts: [2, 3, 4], maxPoints: 28 },
  readingAndUseOfEnglish: { parts: [1, 2, 3, 4, 5, 6, 7], maxPoints: 70 },
};

/** @typedef {{ questionCount: number, maxPoints: number, pointsPerCorrect: number }} B2PartScoringV2Entry */

export function getB2PartScoringV2(partNumber) {
  const n = Number(partNumber);
  return B2_PART_SCORING_V2[n] || null;
}

/** Active config for R&UoE UI — V1 unless flag ON (parts 1–7 only). */
export function getActiveB2RuoePartScoring(partNumber) {
  const n = Number(partNumber);
  if (n >= 1 && n <= 7 && isB2ScoringV2Enabled()) {
    const v2 = getB2PartScoringV2(n);
    if (v2) {
      return {
        scoringVersion: 2,
        total: v2.maxPoints,
        questionCount: v2.questionCount,
        maxPoints: v2.maxPoints,
        pointsPerCorrect: v2.pointsPerCorrect,
        passing: B2_PART_SCORING[n]?.passing ?? 0,
      };
    }
  }
  const v1 = getB2PartScoring(n);
  return v1 ? { scoringVersion: 1, ...v1 } : null;
}

export function getB2PartScoring(partNumber) {
  const n = Number(partNumber);
  return B2_PART_SCORING[n] || null;
}

export function isB2PartPassed(correctCount, partNumber) {
  const cfg = getB2PartScoring(partNumber);
  if (!cfg) return false;
  return Number(correctCount) >= cfg.passing;
}

/** Minimum points to pass a part under Scoring V2 (maps cfg.passing items → points). */
export function getB2PartPassingPoints(partNumber) {
  const cfg = getB2PartScoring(partNumber);
  const v2 = getB2PartScoringV2(partNumber);
  if (!cfg || !v2) return 0;
  return cfg.passing * v2.pointsPerCorrect;
}

/** Pass check for Scoring V2 rows stored as puntos_obtenidos / puntos_maximos. */
export function isB2PartPassedByPoints(puntosObtenidos, partNumber) {
  const passingPoints = getB2PartPassingPoints(partNumber);
  if (!passingPoints) return false;
  return Number(puntosObtenidos) >= passingPoints;
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
