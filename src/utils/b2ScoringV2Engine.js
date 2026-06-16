/** @typedef {import('@/utils/levelsB2PartScoring').B2PartScoringV2Entry} B2PartScoringV2Entry */

export const B2_READING_PARTS_V2 = [1, 5, 6, 7];
export const B2_UOE_PARTS_V2 = [2, 3, 4];
export const B2_RUOE_PARTS_V2 = [1, 2, 3, 4, 5, 6, 7];

/**
 * @param {number} partNumber
 * @param {Record<number, B2PartScoringV2Entry>} cfgByPart
 */
export function getB2PartScoringV2Entry(partNumber, cfgByPart) {
  const n = Number(partNumber);
  return cfgByPart[n] || null;
}

/**
 * Points earned for one fully correct item (no partial credit in phase 1).
 * @param {number} partNumber
 * @param {boolean} isCorrect
 * @param {Record<number, B2PartScoringV2Entry>} cfgByPart
 */
export function pointsForCorrectItem(partNumber, isCorrect, cfgByPart) {
  if (!isCorrect) return 0;
  const cfg = getB2PartScoringV2Entry(partNumber, cfgByPart);
  return cfg?.pointsPerCorrect ?? 1;
}

/**
 * @param {number} partNumber
 * @param {{ correctItems: number, questionsAnswered: number, totalQuestions?: number }} input
 * @param {Record<number, B2PartScoringV2Entry>} cfgByPart
 */
export function buildPartScoreMetricsV2(partNumber, input, cfgByPart) {
  const cfg = getB2PartScoringV2Entry(partNumber, cfgByPart);
  const totalQuestions = cfg?.questionCount ?? input.totalQuestions ?? 0;
  const maxPoints = cfg?.maxPoints ?? totalQuestions;
  const questionsAnswered = Math.max(0, Number(input.questionsAnswered) || 0);
  const correctItems = Math.max(0, Number(input.correctItems) || 0);
  const pointsEarned = correctItems * (cfg?.pointsPerCorrect ?? 1);

  return {
    scoringVersion: 2,
    questionsAnswered,
    totalQuestions,
    correctItems,
    pointsEarned,
    maxPoints,
    accuracyByPoints: maxPoints > 0 ? (pointsEarned / maxPoints) * 100 : 0,
    completionPercentage: totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0,
  };
}

/**
 * @param {Record<number, { pointsEarned?: number, maxPoints?: number, correctItems?: number, totalQuestions?: number, questionsAnswered?: number }>} byPart
 * @param {number[]} partNumbers
 */
export function sumB2MetricsForParts(byPart, partNumbers) {
  let pointsEarned = 0;
  let maxPoints = 0;
  let correctItems = 0;
  let totalQuestions = 0;
  let questionsAnswered = 0;

  for (const p of partNumbers) {
    const m = byPart[p];
    if (!m) continue;
    pointsEarned += Number(m.pointsEarned) || 0;
    maxPoints += Number(m.maxPoints) || 0;
    correctItems += Number(m.correctItems) || 0;
    totalQuestions += Number(m.totalQuestions) || 0;
    questionsAnswered += Number(m.questionsAnswered) || 0;
  }

  return {
    pointsEarned,
    maxPoints,
    correctItems,
    totalQuestions,
    questionsAnswered,
    accuracyByPoints: maxPoints > 0 ? (pointsEarned / maxPoints) * 100 : 0,
    completionPercentage: totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0,
  };
}

/**
 * Max points for a contiguous part range on the R&UoE paper.
 * @param {number} partMin
 * @param {number} partMax
 * @param {Record<number, B2PartScoringV2Entry>} cfgByPart
 */
export function maxPointsForPartRange(partMin, partMax, cfgByPart) {
  let max = 0;
  for (let p = partMin; p <= partMax; p += 1) {
    max += getB2PartScoringV2Entry(p, cfgByPart)?.maxPoints ?? 0;
  }
  return max;
}
