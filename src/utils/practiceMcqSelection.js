/** MCQ is locked after feedback has been committed for this question. */
export function isMcqQuestionLocked(checkedQuestions, questionKey) {
  return Boolean(checkedQuestions?.[questionKey]);
}

export function canPickMcqOption(checkedQuestions, questionKey) {
  return !isMcqQuestionLocked(checkedQuestions, questionKey);
}

/** Mark one question as checked (feedback shown). */
export function buildMcqCheckedState(checkedQuestions, questionKey) {
  if (isMcqQuestionLocked(checkedQuestions, questionKey)) return checkedQuestions;
  return { ...checkedQuestions, [questionKey]: true };
}
