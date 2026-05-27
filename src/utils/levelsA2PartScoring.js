import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import { passingCorrectCountForTotal } from '@/utils/levelsPracticePassing';

/** Cambridge A2 Key — ítems por parte (numeración global 1–14). */
export const A2_PART_SCORING = {
  1: { total: 6, passing: 4 },
  2: { total: 7, passing: 5 },
  3: { total: 5, passing: 3 },
  4: { total: 6, passing: 4 },
  5: { total: 6, passing: 4 },
  6: { total: 20, passing: 12, kind: 'writing' },
  7: { total: 20, passing: 12, kind: 'writing' },
  8: { total: 5, passing: 3 },
  9: { total: 5, passing: 3 },
  10: { total: 5, passing: 3 },
  11: { total: 5, passing: 3 },
  12: { total: 5, passing: 3 },
  13: { total: 6, passing: 4, kind: 'speaking' },
  14: { total: 5, passing: 3, kind: 'speaking' },
};

/**
 * @param {string} [slug]
 * @param {number} partNumber
 */
export function getLevelsPartScoring(slug, partNumber) {
  const n = Number(partNumber);
  if (String(slug || '').toLowerCase() === 'a2') {
    return A2_PART_SCORING[n] || null;
  }
  return getB2PartScoring(n);
}

export function isLevelsPartPassed(slug, correctCount, partNumber) {
  const cfg = getLevelsPartScoring(slug, partNumber);
  if (!cfg) return false;
  return Number(correctCount) >= cfg.passing;
}

export function getPassingForDynamicTotal(evaluatedTotal) {
  return passingCorrectCountForTotal(evaluatedTotal);
}
