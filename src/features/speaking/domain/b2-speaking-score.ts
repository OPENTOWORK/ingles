export const B2_SPEAKING_CRITERIA = [
  { key: 'grammar_vocabulary', label: 'Grammar and Vocabulary', multiplier: 2 },
  { key: 'discourse_management', label: 'Discourse Management', multiplier: 2 },
  { key: 'pronunciation', label: 'Pronunciation', multiplier: 2 },
  { key: 'interactive_communication', label: 'Interactive Communication', multiplier: 2 },
  { key: 'global_achievement', label: 'Global Achievement', multiplier: 4 },
] as const;

export type B2SpeakingCriterionKey = (typeof B2_SPEAKING_CRITERIA)[number]['key'];

export type B2SpeakingCriterionScore = {
  key: B2SpeakingCriterionKey;
  label: string;
  score: number;
  max: 5;
  multiplier: number;
};

export type B2SpeakingScoreReport = {
  criteria: B2SpeakingCriterionScore[];
  total: number;
  maxTotal: 60;
  estimatedLevel: string;
  partFeedback?: Array<{ part: string; note: string }>;
};

const LEVEL_BANDS: Array<{ min: number; level: string }> = [
  { min: 54, level: 'C1' },
  { min: 36, level: 'B2' },
  { min: 24, level: 'B1' },
  { min: 14, level: 'Below B1' },
];

export function clampB2SpeakingBand(score: number): number {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  const clamped = Math.min(5, Math.max(0, n));
  return Math.round(clamped * 2) / 2;
}

export function computeB2SpeakingTotal(
  scores: Partial<Record<B2SpeakingCriterionKey, number>>,
): number {
  let total = 0;
  for (const criterion of B2_SPEAKING_CRITERIA) {
    const band = clampB2SpeakingBand(scores[criterion.key] ?? 0);
    total += band * criterion.multiplier;
  }
  return total;
}

export function estimateB2LevelFromSpeakingTotal(total: number): string {
  for (const band of LEVEL_BANDS) {
    if (total >= band.min) return band.level;
  }
  return 'Below B1';
}

export function buildB2SpeakingScoreReport(
  scores: Partial<Record<B2SpeakingCriterionKey, number>>,
  partFeedback?: B2SpeakingScoreReport['partFeedback'],
): B2SpeakingScoreReport {
  const criteria = B2_SPEAKING_CRITERIA.map((criterion) => ({
    key: criterion.key,
    label: criterion.label,
    score: clampB2SpeakingBand(scores[criterion.key] ?? 0),
    max: 5 as const,
    multiplier: criterion.multiplier,
  }));
  const total = computeB2SpeakingTotal(scores);
  return {
    criteria,
    total,
    maxTotal: 60,
    estimatedLevel: estimateB2LevelFromSpeakingTotal(total),
    partFeedback,
  };
}

export function formatB2SpeakingScoreLine(score: number): string {
  const band = clampB2SpeakingBand(score);
  return Number.isInteger(band) ? `${band}/5` : `${band.toFixed(1)}/5`;
}
