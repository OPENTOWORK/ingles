import { passingCorrectCountForTotal } from '@/utils/levelsPracticePassing';

/**
 * Cuenta huecos evaluables y aciertos en la vista actual (misma pregunta / mismo texto).
 * Debe usar las mismas claves que `getQuestionKey(partId, questionNumber, fallbackKey)`.
 */
export function computeLevelsPartScore({
  useOpenInputUi,
  openQuestionNumbers,
  openChecks,
  groupedAnswers,
  checkedQuestions,
  selectedOptions,
  getQuestionKey,
  partId,
}) {
  let total = 0;
  let correct = 0;

  if (useOpenInputUi && openQuestionNumbers.length > 0) {
    for (const qn of openQuestionNumbers) {
      total += 1;
      const key = getQuestionKey(partId, qn, 'open');
      if (openChecks[key] === true) correct += 1;
    }
    return {
      totalSlots: total,
      correctCount: correct,
      passingCount: passingCorrectCountForTotal(total),
    };
  }

  groupedAnswers.forEach((group, groupIndex) => {
    const qn = group.questionNumber;
    const key = getQuestionKey(partId, qn, `extra-${groupIndex}`);
    if (group.options.length === 0) return;
    total += 1;
    if (!checkedQuestions[key]) return;
    const correctOpt = group.options.find((o) => o.correcta);
    const selId = selectedOptions[key];
    if (correctOpt && selId === correctOpt.id) correct += 1;
  });

  return {
    totalSlots: total,
    correctCount: correct,
    passingCount: passingCorrectCountForTotal(total),
  };
}
