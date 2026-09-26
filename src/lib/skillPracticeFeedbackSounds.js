import { playTrainingAnswerSound } from '@/lib/trainingFeedbackSounds';

/** Same Training beep for a single skill-practice check. */
export function playSkillPracticeAnswerSound(correct) {
  playTrainingAnswerSound(Boolean(correct));
}

/** One Training beep for a batch: success only if every new result is correct. */
export function playSkillPracticeCheckSounds(results) {
  const list = (results || []).filter((value) => typeof value === 'boolean');
  if (!list.length) return;
  playTrainingAnswerSound(list.every(Boolean));
}

export function collectNewBulkCheckResults({
  prevOpenChecks = {},
  nextOpenChecks = {},
  prevOpenGrades = {},
  nextOpenGrades = {},
  prevChecked = {},
  nextChecked = {},
  mcqGroups = [],
  getMcqQuestionKey,
  selectedOptions = {},
}) {
  const results = [];

  Object.entries(nextOpenChecks).forEach(([key, value]) => {
    if (typeof prevOpenChecks[key] !== 'boolean' && typeof value === 'boolean') {
      results.push(value);
    }
  });

  Object.entries(nextOpenGrades).forEach(([key, grade]) => {
    const prev = prevOpenGrades[key];
    if (prev && typeof prev.score === 'number') return;
    if (grade && typeof grade.score === 'number') results.push(grade.score === 2);
  });

  if (typeof getMcqQuestionKey === 'function') {
    mcqGroups.forEach((group, groupIndex) => {
      if (group?.questionNumber == null || group.questionNumber === 0) return;
      const key = getMcqQuestionKey(group, groupIndex);
      if (!nextChecked[key] || prevChecked[key]) return;
      const option = group.options?.find((item) => item.id === selectedOptions[key]);
      if (option) results.push(!!option.correcta);
    });
  }

  return results;
}
