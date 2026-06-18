import {
  countCambridgeKeyWordWords,
  isCambridgeKeyWordWordCountValid,
} from '@/lib/countCambridgeKeyWordWords';
import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { evaluateB2KeyWordKeywordStatus } from '@/lib/gradeB2KeyWordKeyword';
import {
  B2KeyWordAnswerKeyValidationError,
  validateB2KeyWordAnswerKey,
} from '@/lib/validateB2KeyWordAnswerKey';

/** @typedef {'full_match' | 'partial_match' | 'no_match' | 'invalid_word_count' | 'keyword_missing' | 'keyword_modified' | 'invalid_answer_key'} GradeReason */

/**
 * @typedef {import('@/lib/gradeB2KeyWordKeyword').B2KeyWordKeywordSpec} B2KeyWordKeywordSpec
 */

/**
 * @typedef {object} B2KeyWordAnswerKey
 * @property {'b2_key_word_transformation'} type
 * @property {number} version
 * @property {B2KeyWordKeywordSpec} keyword
 * @property {string[]} fullAnswers
 * @property {Array<{ id: number, label?: string, accepted: string[] }>} markingPoints
 */

/**
 * @typedef {object} B2KeyWordGradeResult
 * @property {0 | 1 | 2} score
 * @property {2} maxScore
 * @property {number} wordCount
 * @property {'correct' | 'missing' | 'modified'} keywordStatus
 * @property {{ required: number, found: number }} keywordOccurrences
 * @property {Array<{ id: number, correct: boolean, matchedVariant: string | null }>} markingPoints
 * @property {string | null} matchedFullAnswer
 * @property {GradeReason} reason
 * @property {string[]=} validationErrors
 */

export { evaluateB2KeyWordKeywordStatus } from '@/lib/gradeB2KeyWordKeyword';
export {
  B2KeyWordAnswerKeyValidationError,
  validateB2KeyWordAnswerKey,
} from '@/lib/validateB2KeyWordAnswerKey';

/**
 * @param {string[]} tokens
 * @param {string[]} needle
 * @returns {{ start: number, end: number } | null}
 */
function findTokenSubsequence(haystack, needle) {
  if (!needle.length || haystack.length < needle.length) return null;

  for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    let matched = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j].toLowerCase() !== needle[j].toLowerCase()) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return { start: i, end: i + needle.length - 1 };
    }
  }
  return null;
}

/**
 * @param {string[]} tokens
 * @param {string} variant
 * @returns {{ start: number, end: number } | null}
 */
function findVariantMatch(tokens, variant) {
  const needle = tokenizeB2KeyWordAnswer(variant);
  if (!needle.length) return null;
  return findTokenSubsequence(tokens, needle);
}

/**
 * @param {string[]} tokens
 * @param {Array<{ id: number, accepted: string[] }>} markingPoints
 */
function gradeMarkingPoints(tokens, markingPoints) {
  /** @type {Array<{ id: number, correct: boolean, matchedVariant: string | null, span?: { start: number, end: number } | null }>} */
  const results = [];
  let searchFrom = 0;

  const sorted = [...markingPoints].sort((a, b) => a.id - b.id);

  for (const mp of sorted) {
    let matchedVariant = null;
    let bestStart = Infinity;
    let matchedEnd = -1;

    for (const variant of mp.accepted || []) {
      const needle = tokenizeB2KeyWordAnswer(variant);
      if (!needle.length) continue;

      const haystack = tokens.slice(searchFrom);
      const span = findTokenSubsequence(haystack, needle);
      if (!span) continue;

      const absoluteStart = searchFrom + span.start;
      const absoluteEnd = searchFrom + span.end;

      if (absoluteStart < bestStart) {
        matchedVariant = variant;
        matchedEnd = absoluteEnd;
        bestStart = absoluteStart;
      }
    }

    if (matchedVariant != null) {
      results.push({
        id: mp.id,
        correct: true,
        matchedVariant,
        span: { start: bestStart, end: matchedEnd },
      });
      searchFrom = matchedEnd + 1;
    } else {
      results.push({ id: mp.id, correct: false, matchedVariant: null, span: null });
    }
  }

  return results.map(({ id, correct, matchedVariant }) => ({ id, correct, matchedVariant }));
}

/**
 * @param {string[]} tokens
 * @param {Array<{ id: number, correct: boolean, matchedVariant: string | null }>} mpResults
 * @param {Array<{ id: number, accepted: string[] }>} markingPoints
 */
export function markingPointsCoverAnswerExactly(tokens, mpResults, markingPoints) {
  const sortedMps = [...markingPoints].sort((a, b) => a.id - b.id);
  if (sortedMps.length !== mpResults.length) return false;

  const spans = [];
  for (const mp of sortedMps) {
    const result = mpResults.find((r) => r.id === mp.id);
    if (!result?.correct || !result.matchedVariant) return false;
    const span = findVariantMatch(tokens, result.matchedVariant);
    if (!span) return false;
    spans.push(span);
  }

  spans.sort((a, b) => a.start - b.start);
  for (let i = 1; i < spans.length; i += 1) {
    if (spans[i].start <= spans[i - 1].end) return false;
    if (spans[i].start !== spans[i - 1].end + 1) return false;
  }

  const first = spans[0];
  const last = spans[spans.length - 1];
  return first.start === 0 && last.end === tokens.length - 1;
}

/**
 * @param {string} studentAnswer
 * @param {string[]} fullAnswers
 * @returns {string | null}
 */
function matchFullAnswer(studentAnswer, fullAnswers) {
  const normalizedStudent = normalizeB2KeyWordAnswer(studentAnswer);
  for (const candidate of fullAnswers || []) {
    if (normalizeB2KeyWordAnswer(candidate) === normalizedStudent) {
      return candidate;
    }
  }
  return null;
}

/**
 * @param {object} params
 * @returns {B2KeyWordGradeResult}
 */
function buildBaseResult({
  score,
  wordCount,
  keywordStatus,
  keywordOccurrences,
  markingPoints,
  matchedFullAnswer,
  reason,
  validationErrors,
}) {
  return {
    score,
    maxScore: 2,
    wordCount,
    keywordStatus,
    keywordOccurrences,
    markingPoints,
    matchedFullAnswer,
    reason,
    ...(validationErrors ? { validationErrors } : {}),
  };
}

/**
 * @param {string} studentAnswer
 * @param {B2KeyWordAnswerKey} answerKey
 * @returns {B2KeyWordGradeResult}
 */
export function gradeB2KeyWordTransformation(studentAnswer, answerKey) {
  const validation = validateB2KeyWordAnswerKey(answerKey);
  if (!validation.valid) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      throw new B2KeyWordAnswerKeyValidationError(validation.errors);
    }
    return buildBaseResult({
      score: 0,
      wordCount: countCambridgeKeyWordWords(studentAnswer),
      keywordStatus: 'missing',
      keywordOccurrences: { required: 1, found: 0 },
      markingPoints: [],
      matchedFullAnswer: null,
      reason: 'invalid_answer_key',
      validationErrors: validation.errors,
    });
  }

  const tokens = tokenizeB2KeyWordAnswer(studentAnswer);
  const wordCount = countCambridgeKeyWordWords(studentAnswer);
  const emptyMpResults = (answerKey.markingPoints || []).map((mp) => ({
    id: mp.id,
    correct: false,
    matchedVariant: null,
  }));

  if (!isCambridgeKeyWordWordCountValid(studentAnswer)) {
    return buildBaseResult({
      score: 0,
      wordCount,
      keywordStatus: 'missing',
      keywordOccurrences: { required: 1, found: 0 },
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'invalid_word_count',
    });
  }

  const keywordEval = evaluateB2KeyWordKeywordStatus(answerKey.keyword, tokens);
  const { status: keywordStatus, occurrences: keywordOccurrences } = keywordEval;

  if (keywordStatus === 'missing') {
    return buildBaseResult({
      score: 0,
      wordCount,
      keywordStatus,
      keywordOccurrences,
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'keyword_missing',
    });
  }
  if (keywordStatus === 'modified') {
    return buildBaseResult({
      score: 0,
      wordCount,
      keywordStatus,
      keywordOccurrences,
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'keyword_modified',
    });
  }

  const matchedFullAnswer = matchFullAnswer(studentAnswer, answerKey.fullAnswers);
  if (matchedFullAnswer) {
    return buildBaseResult({
      score: 2,
      wordCount,
      keywordStatus,
      keywordOccurrences,
      markingPoints: (answerKey.markingPoints || []).map((mp) => ({
        id: mp.id,
        correct: true,
        matchedVariant: mp.accepted?.[0] ?? null,
      })),
      matchedFullAnswer,
      reason: 'full_match',
    });
  }

  const mpResults = gradeMarkingPoints(tokens, answerKey.markingPoints || []);
  const correctCount = mpResults.filter((r) => r.correct).length;
  const totalMps = mpResults.length;

  if (correctCount === totalMps && totalMps > 0) {
    const exactCover = markingPointsCoverAnswerExactly(
      tokens,
      mpResults,
      answerKey.markingPoints || [],
    );
    return buildBaseResult({
      score: exactCover ? 2 : 1,
      wordCount,
      keywordStatus,
      keywordOccurrences,
      markingPoints: mpResults,
      matchedFullAnswer: null,
      reason: 'partial_match',
    });
  }

  if (correctCount === 1) {
    return buildBaseResult({
      score: 1,
      wordCount,
      keywordStatus,
      keywordOccurrences,
      markingPoints: mpResults,
      matchedFullAnswer: null,
      reason: 'partial_match',
    });
  }

  return buildBaseResult({
    score: 0,
    wordCount,
    keywordStatus,
    keywordOccurrences,
    markingPoints: mpResults,
    matchedFullAnswer: null,
    reason: 'no_match',
  });
}

/**
 * Provisional Phase 1 behaviour — full match only, never 1/2.
 * @param {{ studentAnswer: string, acceptedFullAnswers: string[] }} params
 * @returns {B2KeyWordGradeResult}
 */
export function gradeLegacyB2KeyWordTransformation({ studentAnswer, acceptedFullAnswers }) {
  const tokens = tokenizeB2KeyWordAnswer(studentAnswer);
  const wordCount = countCambridgeKeyWordWords(studentAnswer);
  const matchedFullAnswer = matchFullAnswer(studentAnswer, acceptedFullAnswers);

  if (matchedFullAnswer) {
    return buildBaseResult({
      score: 2,
      wordCount,
      keywordStatus: 'correct',
      keywordOccurrences: { required: 1, found: 1 },
      markingPoints: [],
      matchedFullAnswer,
      reason: 'full_match',
    });
  }

  return buildBaseResult({
    score: 0,
    wordCount,
    keywordStatus: tokens.length ? 'correct' : 'missing',
    keywordOccurrences: { required: 1, found: 0 },
    markingPoints: [],
    matchedFullAnswer: null,
    reason: 'no_match',
  });
}
