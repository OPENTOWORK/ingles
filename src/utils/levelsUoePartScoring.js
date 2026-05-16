/** Use of English B2: umbrales fijos por parte (1–4). */
export const UOE_PART_SCORING = {
  1: { total: 7, passing: 5 },
  2: { total: 7, passing: 5 },
  3: { total: 8, passing: 5 },
  4: { total: 6, passing: 4 },
};

export function getUoePartScoring(partNumber) {
  const n = Number(partNumber);
  return UOE_PART_SCORING[n] || null;
}

/** 1 parte aprobada = 0.5 estrellas; 4 partes = 3 estrellas. */
export function starsFromApprovedPartsCount(approvedPartsCount) {
  const n = Math.max(0, Math.min(4, Number(approvedPartsCount) || 0));
  return n * 0.5;
}

export function isUoePartPassed(correctCount, partNumber) {
  const cfg = getUoePartScoring(partNumber);
  if (!cfg) return false;
  return Number(correctCount) >= cfg.passing;
}
