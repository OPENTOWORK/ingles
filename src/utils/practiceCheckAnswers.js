/**
 * When instant feedback is off, hide corrections until the user checks manually.
 */
export function resolvePracticeHideFeedback({
  hideFeedback = false,
  showFeedback = true,
  answersRevealed = false,
  respectInstantFeedbackToggle = true,
}) {
  if (hideFeedback) return true;
  if (!respectInstantFeedbackToggle) return false;
  if (showFeedback !== false) return false;
  return !answersRevealed;
}

export function shouldShowCheckAnswersButton({
  skillPracticeMode = false,
  hideFeedback = false,
  showFeedback = true,
  answersRevealed = false,
}) {
  return (
    skillPracticeMode &&
    !hideFeedback &&
    showFeedback === false &&
    !answersRevealed
  );
}

export function buildBulkAnswerCheckUpdate({
  openQuestionNumbers = [],
  openInputs = {},
  openChecks = {},
  openAnswerMap,
  normalizeText,
  getOpenQuestionKey,
  mcqGroups = [],
  getMcqQuestionKey,
  selectedOptions = {},
  checkedQuestions = {},
}) {
  const nextOpenChecks = { ...openChecks };
  const nextChecked = { ...checkedQuestions };
  let hasAnyAnswer = false;

  openQuestionNumbers.forEach((questionNumber) => {
    const questionKey = getOpenQuestionKey(questionNumber);
    const value = openInputs[questionKey] ?? '';
    if (!String(value).trim()) return;
    hasAnyAnswer = true;
    if (typeof nextOpenChecks[questionKey] === 'boolean') return;
    const expected = openAnswerMap?.get?.(questionNumber) || new Set();
    nextOpenChecks[questionKey] = expected.has(normalizeText(value));
  });

  mcqGroups.forEach((group, groupIndex) => {
    if (group?.questionNumber == null || group.questionNumber === 0) return;
    const questionKey = getMcqQuestionKey(group, groupIndex);
    if (!selectedOptions[questionKey]) return;
    hasAnyAnswer = true;
    nextChecked[questionKey] = true;
  });

  return { nextOpenChecks, nextChecked, hasAnyAnswer };
}

export function practiceHasCheckableAnswers({
  openQuestionNumbers = [],
  openInputs = {},
  getOpenQuestionKey,
  mcqGroups = [],
  getMcqQuestionKey,
  selectedOptions = {},
}) {
  const hasOpen = openQuestionNumbers.some((questionNumber) => {
    const key = getOpenQuestionKey(questionNumber);
    return Boolean(String(openInputs[key] ?? '').trim());
  });

  if (hasOpen) return true;

  return mcqGroups.some((group, groupIndex) => {
    if (group?.questionNumber == null || group.questionNumber === 0) return false;
    const questionKey = getMcqQuestionKey(group, groupIndex);
    return Boolean(selectedOptions[questionKey]);
  });
}
