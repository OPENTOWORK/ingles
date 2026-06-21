import { getB2Part4V2FeedbackCopy } from '@/lib/b2Part4Grading';

export function buildOpenClozeExplanationEntries({
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs = {},
  openChecks = {},
  openAnswerMap,
}) {
  return activeQuestionNumbers
    .map((questionNumber) => {
      const questionKey = getQuestionKey(questionNumber);
      const checkResult = openChecks[questionKey];
      if (typeof checkResult !== 'boolean') return null;
      const expected = openAnswerMap?.get?.(questionNumber);
      const expectedList = expected && expected.size > 0 ? [...expected] : [];
      return {
        questionNumber,
        questionKey,
        isCorrect: checkResult,
        userAnswer: String(openInputs[questionKey] || '').trim(),
        correctAnswer: expectedList.length > 0 ? expectedList.join(' · ') : undefined,
      };
    })
    .filter(Boolean);
}

export function buildKeyWordExplanationEntries({
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs = {},
  openChecks = {},
  openGrades = {},
  scoringV2Part4 = false,
  openAnswerMap,
}) {
  return activeQuestionNumbers
    .map((questionNumber) => {
      const questionKey = getQuestionKey(questionNumber);
      const userAnswer = String(openInputs[questionKey] || '').trim();
      const expected = openAnswerMap?.get?.(questionNumber);
      const expectedList = expected && expected.size > 0 ? [...expected] : [];
      const correctAnswer = expectedList.length > 0 ? expectedList.join(' · ') : undefined;

      if (scoringV2Part4) {
        const grade = openGrades[questionKey];
        if (!grade || typeof grade.score !== 'number') return null;
        const v2Copy = getB2Part4V2FeedbackCopy(grade);
        return {
          questionNumber,
          questionKey,
          isCorrect: grade.score === 2,
          isPartial: grade.score === 1,
          verdictLabel: v2Copy.headline,
          scoreLabel: v2Copy.scoreLabel,
          detail: v2Copy.detail || undefined,
          userAnswer,
          correctAnswer: grade.score === 2 ? undefined : correctAnswer,
        };
      }

      const checkResult = openChecks[questionKey];
      if (typeof checkResult !== 'boolean') return null;
      return {
        questionNumber,
        questionKey,
        isCorrect: checkResult,
        userAnswer,
        correctAnswer: checkResult ? undefined : correctAnswer,
      };
    })
    .filter(Boolean);
}

export function buildMcqGroupExplanationEntries({
  mcqGroups = [],
  getQuestionKey,
  selectedOptions = {},
  checkedQuestions = {},
  getOptionLabel,
}) {
  return mcqGroups
    .filter((group) => group?.questionNumber != null && group.questionNumber !== 0)
    .map((group, groupIndex) => {
      const questionKey =
        typeof getQuestionKey === 'function'
          ? getQuestionKey(group.questionNumber, group, groupIndex)
          : getQuestionKey(group.questionNumber);
      if (!checkedQuestions[questionKey]) return null;
      const selectedOption = group.options?.find((o) => o.id === selectedOptions[questionKey]);
      if (!selectedOption) return null;
      const correctOption = group.options?.find((o) => o.correcta);
      const labelFn =
        getOptionLabel ||
        ((option) => option?.formattedText || option?.respuesta || option?.optionText || '');
      return {
        questionNumber: group.questionNumber,
        questionKey,
        isCorrect: !!selectedOption.correcta,
        userAnswer: labelFn(selectedOption),
        correctAnswer: correctOption ? labelFn(correctOption) : undefined,
        group,
      };
    })
    .filter(Boolean);
}
