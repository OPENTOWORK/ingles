import {
  countCambridgeKeyWordWords,
  isCambridgeKeyWordWordCountValid,
} from '@/lib/countCambridgeKeyWordWords';
import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';

/** @typedef {'full_match' | 'partial_match' | 'no_match' | 'invalid_word_count' | 'keyword_missing' | 'keyword_modified'} GradeReason */

/**
 * @typedef {object} B2KeyWordAnswerKey
 * @property {'b2_key_word_transformation'} type
 * @property {number} version
 * @property {string} keyword
 * @property {string[]} fullAnswers
 * @property {Array<{ id: number, label?: string, accepted: string[] }>} markingPoints
 */

/**
 * @typedef {object} B2KeyWordGradeResult
 * @property {0 | 1 | 2} score
 * @property {2} maxScore
 * @property {number} wordCount
 * @property {'correct' | 'missing' | 'modified'} keywordStatus
 * @property {Array<{ id: number, correct: boolean, matchedVariant: string | null }>} markingPoints
 * @property {string | null} matchedFullAnswer
 * @property {GradeReason} reason
 */

/**
 * @param {string} keyword
 * @param {string[]} tokens
 * @returns {'correct' | 'missing' | 'modified'}
 */
export function evaluateB2KeyWordKeywordStatus(keyword, tokens) {
  const kw = normalizeB2KeyWordAnswer(keyword);
  if (!kw) return 'missing';

  const kwTokens = kw.split(' ').filter(Boolean);
  if (kwTokens.length === 1) {
    const target = kwTokens[0];
    let exact = false;
    let modified = false;

    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (lower === target) {
        exact = true;
        break;
      }
      if (lower.startsWith(target) && lower.length > target.length) {
        modified = true;
      }
    }

    if (exact) return 'correct';
    if (modified) return 'modified';
    return 'missing';
  }

  // Multi-token keyword: exact contiguous subsequence required.
  outer: for (let i = 0; i <= tokens.length - kwTokens.length; i += 1) {
    let ok = true;
    for (let j = 0; j < kwTokens.length; j += 1) {
      if (tokens[i + j].toLowerCase() !== kwTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return 'correct';
  }

  for (const token of tokens) {
    if (token.toLowerCase().includes(kwTokens[0]) && token.toLowerCase() !== kwTokens.join(' ')) {
      return 'modified';
    }
  }

  return 'missing';
}

/**
 * Find leftmost contiguous token subsequence match.
 * @param {string[]} haystack
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
  /** @type {Array<{ id: number, correct: boolean, matchedVariant: string | null }>} */
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
      results.push({ id: mp.id, correct: true, matchedVariant });
      searchFrom = matchedEnd + 1;
    } else {
      results.push({ id: mp.id, correct: false, matchedVariant: null });
    }
  }

  return results;
}

/**
 * Both MPs matched in order with no extra tokens outside matched spans.
 * @param {string[]} tokens
 * @param {Array<{ id: number, correct: boolean, matchedVariant: string | null }>} mpResults
 * @param {Array<{ id: number, accepted: string[] }>} markingPoints
 */
function markingPointsCoverAnswerExactly(tokens, mpResults, markingPoints) {
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
 * @param {string} studentAnswer
 * @param {B2KeyWordAnswerKey} answerKey
 * @returns {B2KeyWordGradeResult}
 */
export function gradeB2KeyWordTransformation(studentAnswer, answerKey) {
  const maxScore = 2;
  const tokens = tokenizeB2KeyWordAnswer(studentAnswer);
  const wordCount = countCambridgeKeyWordWords(studentAnswer);
  const emptyMpResults = (answerKey.markingPoints || []).map((mp) => ({
    id: mp.id,
    correct: false,
    matchedVariant: null,
  }));

  if (!isCambridgeKeyWordWordCountValid(studentAnswer)) {
    return {
      score: 0,
      maxScore,
      wordCount,
      keywordStatus: 'missing',
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'invalid_word_count',
    };
  }

  const keywordStatus = evaluateB2KeyWordKeywordStatus(answerKey.keyword, tokens);
  if (keywordStatus === 'missing') {
    return {
      score: 0,
      maxScore,
      wordCount,
      keywordStatus,
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'keyword_missing',
    };
  }
  if (keywordStatus === 'modified') {
    return {
      score: 0,
      maxScore,
      wordCount,
      keywordStatus,
      markingPoints: emptyMpResults,
      matchedFullAnswer: null,
      reason: 'keyword_modified',
    };
  }

  const matchedFullAnswer = matchFullAnswer(studentAnswer, answerKey.fullAnswers);
  if (matchedFullAnswer) {
    return {
      score: 2,
      maxScore,
      wordCount,
      keywordStatus,
      markingPoints: (answerKey.markingPoints || []).map((mp) => ({
        id: mp.id,
        correct: true,
        matchedVariant: mp.accepted?.[0] ?? null,
      })),
      matchedFullAnswer,
      reason: 'full_match',
    };
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
    if (exactCover) {
      return {
        score: 2,
        maxScore,
        wordCount,
        keywordStatus,
        markingPoints: mpResults,
        matchedFullAnswer: null,
        reason: 'partial_match',
      };
    }
    return {
      score: 1,
      maxScore,
      wordCount,
      keywordStatus,
      markingPoints: mpResults,
      matchedFullAnswer: null,
      reason: 'partial_match',
    };
  }

  if (correctCount === 1) {
    return {
      score: 1,
      maxScore,
      wordCount,
      keywordStatus,
      markingPoints: mpResults,
      matchedFullAnswer: null,
      reason: 'partial_match',
    };
  }

  return {
    score: 0,
    maxScore,
    wordCount,
    keywordStatus,
    markingPoints: mpResults,
    matchedFullAnswer: null,
    reason: 'no_match',
  };
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
    return {
      score: 2,
      maxScore: 2,
      wordCount,
      keywordStatus: 'correct',
      markingPoints: [],
      matchedFullAnswer,
      reason: 'full_match',
    };
  }

  return {
    score: 0,
    maxScore: 2,
    wordCount,
    keywordStatus: tokens.length ? 'correct' : 'missing',
    markingPoints: [],
    matchedFullAnswer: null,
    reason: 'no_match',
  };
}
