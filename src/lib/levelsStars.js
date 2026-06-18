/**
 * Estrellas 0–3 para práctica levels (skill / Stars way).
 * 0 % → 0 estrellas · 100 % → 3 estrellas · proporcional (regla de 3) entre medias.
 *
 * @param {number} scorePercent 0–100
 * @returns {0 | 1 | 2 | 3}
 */
export function starsFromLevelsScorePercent(scorePercent) {
  const score = Math.max(0, Math.min(100, Number(scorePercent) || 0));
  if (score <= 0) return 0;
  if (score >= 100) return 3;
  return Math.min(3, Math.max(1, Math.round((score * 3) / 100)));
}

/**
 * @param {number} earned
 * @param {number} max
 * @returns {0 | 1 | 2 | 3}
 */
export function starsFromLevelsEarnedMax(earned, max) {
  const maxVal = Math.max(0, Number(max) || 0);
  if (maxVal <= 0) return 0;
  const earnedVal = Math.max(0, Number(earned) || 0);
  if (earnedVal <= 0) return 0;
  if (earnedVal >= maxVal) return 3;
  const percent = (earnedVal * 100) / maxVal;
  return starsFromLevelsScorePercent(percent);
}
