import { passingCorrectCountForTotal } from '@/utils/levelsPracticePassing';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';
import { B2_PART_SCORING_V2 } from '@/utils/levelsB2PartScoring';
import { buildPartScoreMetricsV2 } from '@/utils/b2ScoringV2Engine';
import { summarizePart4OpenGrades } from '@/lib/b2Part4Grading';
import { isScorableMcqGroup } from '@/utils/recordLevelsB2PartScore';

/**
 * Raw item counts from the current answer state (same keys as getQuestionKey).
 */
export function computeLevelsPartScore({
  useOpenInputUi,
  openQuestionNumbers,
  openChecks,
  openGrades,
  usePart4V2Grading = false,
  groupedAnswers,
  checkedQuestions,
  selectedOptions,
  getQuestionKey,
  partId,
}) {
  let total = 0;
  let correct = 0;
  let evaluated = 0;

  if (useOpenInputUi && openQuestionNumbers.length > 0) {
    if (usePart4V2Grading) {
      const summary = summarizePart4OpenGrades(openQuestionNumbers, openGrades || {}, getQuestionKey, partId);
      total = openQuestionNumbers.length;
      evaluated = summary.questionsAnswered;
      correct = summary.fullyCorrectItems;
      return {
        totalSlots: total,
        correctCount: correct,
        questionsAnswered: evaluated,
        part4PointsEarned: summary.pointsEarned,
        part4FullyCorrectItems: summary.fullyCorrectItems,
        passingCount: passingCorrectCountForTotal(total),
      };
    }

    for (const qn of openQuestionNumbers) {
      total += 1;
      const key = getQuestionKey(partId, qn, 'open');
      const result = openChecks[key];
      if (typeof result === 'boolean') {
        evaluated += 1;
        if (result) correct += 1;
      }
    }
    return {
      totalSlots: total,
      correctCount: correct,
      questionsAnswered: evaluated,
      passingCount: passingCorrectCountForTotal(total),
    };
  }

  groupedAnswers.forEach((group, groupIndex) => {
    if (!isScorableMcqGroup(group)) return;
    const qn = group.questionNumber;
    const key = getQuestionKey(partId, qn, `extra-${groupIndex}`);
    total += 1;
    if (!checkedQuestions[key]) return;
    evaluated += 1;
    const correctOpt = group.options.find((o) => o.correcta);
    const selId = selectedOptions[key];
    if (correctOpt && selId === correctOpt.id) correct += 1;
  });

  return {
    totalSlots: total,
    correctCount: correct,
    questionsAnswered: evaluated,
    passingCount: passingCorrectCountForTotal(total),
  };
}

/**
 * B2 R&UoE score metrics — V1 item counts or V2 points, depending on feature flag.
 * @param {{ partNumber: number, scoringV2Enabled?: boolean } & Parameters<typeof computeLevelsPartScore>[0]} params
 */
export function computeB2PartScoreMetrics(params) {
  const {
    partNumber,
    scoringV2Enabled = isB2ScoringV2Enabled(),
    usePart4V2Grading = false,
    ...state
  } = params;
  const raw = computeLevelsPartScore({ ...state, usePart4V2Grading });
  const pn = Number(partNumber);

  if (!scoringV2Enabled || pn < 1 || pn > 7) {
    return {
      scoringVersion: 1,
      correctCount: raw.correctCount,
      totalSlots: raw.totalSlots,
      questionsAnswered: raw.questionsAnswered,
      totalQuestions: raw.totalSlots,
      correctItems: raw.correctCount,
      pointsEarned: raw.correctCount,
      maxPoints: raw.totalSlots,
      accuracyByPoints: raw.totalSlots
        ? (raw.correctCount / raw.totalSlots) * 100
        : 0,
      completionPercentage: raw.totalSlots
        ? (raw.questionsAnswered / raw.totalSlots) * 100
        : 0,
      passingCount: raw.passingCount,
    };
  }

  const v2 = buildPartScoreMetricsV2(
    pn,
    {
      correctItems: usePart4V2Grading ? raw.part4FullyCorrectItems ?? raw.correctCount : raw.correctCount,
      questionsAnswered: raw.questionsAnswered,
      totalQuestions: raw.totalSlots,
      pointsEarned: usePart4V2Grading ? raw.part4PointsEarned : undefined,
    },
    B2_PART_SCORING_V2,
  );

  return {
    ...v2,
    correctCount: raw.correctCount,
    totalSlots: raw.totalSlots,
    passingCount: raw.passingCount,
  };
}
