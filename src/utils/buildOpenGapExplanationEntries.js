import { getB2Part4V2FeedbackCopy } from '@/lib/b2Part4Grading';
import { parseKeyWordRespuestaTexto } from '@/lib/parseB2KeyWordAnswerKey';
import { formatEnglishAnswerForDisplay } from '@/utils/b2ExamPaperShared';

/**
 * Resolves the correct-answer string shown in instant feedback, preserving DB casing
 * (e.g. pronoun "I") instead of the lowercased openAnswerMap values used for grading.
 */
export function resolveInstantFeedbackCorrectAnswer(
  questionNumber,
  openAnswerMap,
  { openAnswerRows = [], part4ParsedKeys = null } = {},
) {
  const qn = Number(questionNumber);
  const parsed = part4ParsedKeys?.get?.(qn);

  if (parsed?.mode === 'metadata' && Array.isArray(parsed.answerKey?.fullAnswers)) {
    const answers = parsed.answerKey.fullAnswers
      .map((answer) => String(answer || '').trim())
      .filter(Boolean);
    if (answers.length) return answers.join(' · ');
  }

  if (parsed?.mode === 'legacy' && Array.isArray(parsed.acceptedFullAnswers)) {
    const answers = parsed.acceptedFullAnswers
      .map((answer) => String(answer || '').trim())
      .filter(Boolean);
    if (answers.length) return answers.join(' · ');
  }

  const fromRows = [];
  const seen = new Set();
  for (const row of openAnswerRows) {
    const { questionNumber: num, answerText } = parseKeyWordRespuestaTexto(row?.respuesta_texto || '');
    if (num !== qn || !answerText) continue;
    const dedupeKey = answerText.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    fromRows.push(answerText);
  }
  if (fromRows.length) return fromRows.join(' · ');

  const expected = openAnswerMap?.get?.(qn);
  if (expected?.size) {
    return [...expected].map(formatEnglishAnswerForDisplay).join(' · ');
  }

  return undefined;
}

export function buildOpenClozeExplanationEntries({
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs = {},
  openChecks = {},
  openAnswerMap,
  openAnswerRows = [],
  part4ParsedKeys = null,
}) {
  return activeQuestionNumbers
    .map((questionNumber) => {
      const questionKey = getQuestionKey(questionNumber);
      const checkResult = openChecks[questionKey];
      if (typeof checkResult !== 'boolean') return null;
      const correctAnswer = resolveInstantFeedbackCorrectAnswer(questionNumber, openAnswerMap, {
        openAnswerRows,
        part4ParsedKeys,
      });
      return {
        questionNumber,
        questionKey,
        isCorrect: checkResult,
        userAnswer: String(openInputs[questionKey] || '').trim(),
        correctAnswer: checkResult ? undefined : correctAnswer,
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
  openAnswerRows = [],
  part4ParsedKeys = null,
}) {
  return activeQuestionNumbers
    .map((questionNumber) => {
      const questionKey = getQuestionKey(questionNumber);
      const userAnswer = String(openInputs[questionKey] || '').trim();
      const correctAnswer = resolveInstantFeedbackCorrectAnswer(questionNumber, openAnswerMap, {
        openAnswerRows,
        part4ParsedKeys,
      });

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
