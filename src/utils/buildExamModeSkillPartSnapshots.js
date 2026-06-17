import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import { attachScoringVersionToExamModeScores } from '@/lib/b2ScoringV2FeatureFlag';

/**
 * Builds exam-mode section scores from in-attempt part progress only.
 * Never reads skill-practice progressBySlot — those are separate attempts.
 *
 * @param {Record<number, { correct?: number, total?: number, preguntaId?: string }>} [examModePartScores]
 */
export function buildExamModeSkillPartSnapshots({
  partMin,
  partMax,
  partsData = [],
  examModePartScores = null,
  resolvePartNumber,
}) {
  const getPartNum =
    typeof resolvePartNumber === 'function'
      ? resolvePartNumber
      : (part) => Number(part?.partNumber || 0);

  /** @type {Record<number, { draft: { preguntaId?: string }, progress: object }>} */
  const partSnapshots = {};
  /** @type {Record<number, { correct: number, total: number, passing?: number }>} */
  const byPart = {};
  let sectionCorrect = 0;
  let sectionTotal = 0;

  for (let p = partMin; p <= partMax; p += 1) {
    const saved = examModePartScores?.[p] || null;
    const part = partsData.find((pt) => getPartNum(pt) === p);
    const preguntaId =
      saved?.preguntaId || part?.questions?.[0]?.preguntaId || part?.id || null;
    const cfg = getB2PartScoring(p);
    const partMax = cfg?.total ?? 0;
    const correct = Math.max(0, Number(saved?.correct) || 0);
    const total = partMax;

    if (preguntaId && saved) {
      partSnapshots[p] = {
        draft: { preguntaId, parteId: part?.id || null },
        progress: {
          correct,
          total: partMax || 1,
          complete: true,
          evaluated: partMax || 1,
        },
      };
    }

    byPart[p] = {
      correct,
      total: partMax,
      passing: cfg?.passing,
    };
    sectionCorrect += correct;
    sectionTotal += partMax;
  }

  return {
    partSnapshots,
    scores: attachScoringVersionToExamModeScores({
      correct: sectionCorrect,
      total: sectionTotal,
      byPart,
    }),
  };
}
