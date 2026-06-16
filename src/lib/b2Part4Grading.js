import {
  gradeB2KeyWordTransformation,
  gradeLegacyB2KeyWordTransformation,
} from '@/lib/gradeB2KeyWordTransformation';
import { getB2KeyWordParsedKeyForQuestion } from '@/lib/parseB2KeyWordAnswerKey';

/**
 * @typedef {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordGradeResult} B2KeyWordGradeResult
 */

/**
 * @typedef {object} B2Part4OpenGrade
 * @property {0 | 1 | 2} score
 * @property {2} maxScore
 * @property {string} reason
 * @property {B2KeyWordGradeResult['markingPoints']=} markingPoints
 * @property {B2KeyWordGradeResult['keywordStatus']=} keywordStatus
 * @property {number=} wordCount
 */

/**
 * @param {string} studentAnswer
 * @param {import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordLegacyParsedKey | import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordMetadataParsedKey | null} parsedKey
 * @returns {B2KeyWordGradeResult}
 */
export function gradeB2Part4StudentAnswer(studentAnswer, parsedKey) {
  if (!parsedKey) {
    return gradeLegacyB2KeyWordTransformation({ studentAnswer, acceptedFullAnswers: [] });
  }

  if (parsedKey.mode === 'metadata' && parsedKey.answerKey) {
    return gradeB2KeyWordTransformation(studentAnswer, parsedKey.answerKey);
  }

  return gradeLegacyB2KeyWordTransformation({
    studentAnswer,
    acceptedFullAnswers: parsedKey.acceptedFullAnswers || [],
  });
}

/**
 * @param {B2KeyWordGradeResult} gradeResult
 * @returns {B2Part4OpenGrade}
 */
export function toB2Part4OpenGrade(gradeResult) {
  return {
    score: gradeResult.score,
    maxScore: 2,
    reason: gradeResult.reason,
    markingPoints: gradeResult.markingPoints,
    keywordStatus: gradeResult.keywordStatus,
    wordCount: gradeResult.wordCount,
  };
}

/**
 * @param {string} studentAnswer
 * @param {Map<number, import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordLegacyParsedKey | import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordMetadataParsedKey>} parsedKeyMap
 * @param {number} questionNumber
 */
export function gradeB2Part4Gap(studentAnswer, parsedKeyMap, questionNumber) {
  const parsedKey = getB2KeyWordParsedKeyForQuestion(parsedKeyMap, questionNumber);
  const result = gradeB2Part4StudentAnswer(studentAnswer, parsedKey);
  return toB2Part4OpenGrade(result);
}

/**
 * @param {B2Part4OpenGrade} grade
 * @param {'en' | 'es'} [lang]
 */
export function getB2Part4V2FeedbackCopy(grade, lang = 'en') {
  const isEn = lang === 'en';
  const scoreLabel = isEn ? `Score: ${grade.score}/${grade.maxScore}` : `Puntuación: ${grade.score}/${grade.maxScore}`;

  if (grade.score === 2) {
    return {
      scoreLabel,
      headline: isEn ? 'Correct.' : 'Correcto.',
      detail: '',
    };
  }

  if (grade.score === 1) {
    return {
      scoreLabel,
      headline: isEn ? 'Partly correct.' : 'Parcialmente correcto.',
      detail: isEn
        ? 'You used the structure with the keyword correctly, but the infinitive part is missing or incorrect.'
        : 'Usaste bien la estructura con la key word, pero falta o está mal la parte del infinitivo.',
    };
  }

  if (grade.reason === 'invalid_word_count' || grade.reason === 'keyword_missing' || grade.reason === 'keyword_modified') {
    return {
      scoreLabel,
      headline: isEn ? 'Incorrect.' : 'Incorrecto.',
      detail: isEn
        ? 'The answer must include the keyword and contain 2–5 words.'
        : 'La respuesta debe incluir la key word y tener 2–5 palabras.',
    };
  }

  return {
    scoreLabel,
    headline: isEn ? 'Incorrect.' : 'Incorrecto.',
    detail: '',
  };
}

/**
 * @param {number[]} openQuestionNumbers
 * @param {Record<string, B2Part4OpenGrade>} openGrades
 * @param {(partId: string, qn: number, suffix?: string) => string} getQuestionKey
 * @param {string} partId
 */
/**
 * Grade Part 4 open inputs silently (exam mode — no UI feedback until results).
 * @param {Record<string, string>} openInputs
 * @param {Map<number, import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordLegacyParsedKey | import('@/lib/parseB2KeyWordAnswerKey').B2KeyWordMetadataParsedKey>} parsedKeyMap
 * @param {(partId: string, qn: number, suffix?: string) => string} getQuestionKey
 * @param {string} partId
 * @param {number[]} openQuestionNumbers
 */
export function computeSilentPart4OpenGrades(
  openInputs,
  parsedKeyMap,
  getQuestionKey,
  partId,
  openQuestionNumbers,
) {
  /** @type {Record<string, B2Part4OpenGrade>} */
  const grades = {};
  for (const qn of openQuestionNumbers) {
    const key = getQuestionKey(partId, qn, 'open');
    const value = openInputs[key] || '';
    if (!value.trim()) continue;
    grades[key] = gradeB2Part4Gap(value, parsedKeyMap, qn);
  }
  return grades;
}

export function summarizePart4OpenGrades(openQuestionNumbers, openGrades, getQuestionKey, partId) {
  let questionsAnswered = 0;
  let pointsEarned = 0;
  let fullyCorrectItems = 0;

  for (const qn of openQuestionNumbers) {
    const key = getQuestionKey(partId, qn, 'open');
    const grade = openGrades?.[key];
    if (!grade || typeof grade.score !== 'number') continue;
    questionsAnswered += 1;
    pointsEarned += grade.score;
    if (grade.score === 2) fullyCorrectItems += 1;
  }

  return { questionsAnswered, pointsEarned, fullyCorrectItems };
}
