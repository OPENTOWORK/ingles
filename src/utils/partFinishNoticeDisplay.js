import {
  getB2PartScoring,
  getB2PartScoringV2,
} from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';

/** Expected question count for a B2 part (Cambridge structure). */
export function getExpectedPartQuestionTotal(partNumber) {
  const n = Number(partNumber);
  const v2 = getB2PartScoringV2(n);
  const cfg = getB2PartScoring(n);
  return v2?.questionCount ?? cfg?.total ?? 0;
}

/**
 * Resolve how many questions this part has for user-facing totals.
 * Fixes legacy rows saved as 7/7 when the part actually has 8 items.
 */
export function resolvePartQuestionTotal(partNumber, progress = {}) {
  const expected = getExpectedPartQuestionTotal(partNumber);
  const stored =
    progress.itemTotal ??
    progress.questionTotal ??
    progress.totalQuestions ??
    progress.totalSlots ??
    0;

  if (stored > 0) {
    if (expected > stored) return expected;
    return stored;
  }

  return expected || progress.total || 0;
}

/**
 * User-facing part result — always correct items / total questions (not V2 points).
 */
export function buildPartFinishNoticeDisplay(progress, partNumber, { saved = true } = {}) {
  const v2 = isB2ScoringV2Enabled() && Number(partNumber) >= 1 && Number(partNumber) <= 7;
  const cfg = getB2PartScoring(partNumber);

  const correct =
    progress?.itemCorrect ??
    progress?.correctItems ??
    progress?.correct ??
    progress?.correctCount ??
    0;
  const total = resolvePartQuestionTotal(partNumber, progress);
  const passing = cfg?.passing ?? progress?.passing ?? 0;

  return {
    passed: progress?.passed,
    correct,
    total,
    passing,
    scoringVersion: progress?.scoringVersion ?? (v2 ? 2 : 1),
    v2LocalOnly: v2 && !saved,
  };
}

/** Label for saved score tabs — items when available, else stored counts. */
export function formatPartSavedScoreLabel(saved, partNumber = 0) {
  const total = resolvePartQuestionTotal(partNumber, saved);
  if (!total) return null;
  const earned = saved.itemCorrect ?? saved.correct ?? saved.correctCount ?? 0;
  return `${earned}/${total}${saved.passed ? ' ✓' : ''}`;
}
