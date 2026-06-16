import { normalizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { resolveKeywordSpec } from '@/lib/gradeB2KeyWordKeyword';

export const SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE = 'b2_key_word_transformation';
export const SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION = 1;

/**
 * Thrown in development when grading with invalid metadata.
 */
export class B2KeyWordAnswerKeyValidationError extends Error {
  /** @param {string[]} errors */
  constructor(errors) {
    super(`Invalid B2 key word answer key: ${errors.join('; ')}`);
    this.name = 'B2KeyWordAnswerKeyValidationError';
    this.errors = errors;
  }
}

/**
 * @param {unknown} answerKey
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateB2KeyWordAnswerKey(answerKey) {
  /** @type {string[]} */
  const errors = [];

  if (!answerKey || typeof answerKey !== 'object') {
    return { valid: false, errors: ['answerKey must be an object'] };
  }

  if (answerKey.type !== SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE) {
    errors.push(`unsupported type: ${String(answerKey.type)}`);
  }

  if (Number(answerKey.version) !== SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION) {
    errors.push(`unsupported version: ${String(answerKey.version)}`);
  }

  if (answerKey.keyword == null || answerKey.keyword === '') {
    errors.push('keyword is missing or empty');
  } else if (typeof answerKey.keyword === 'object') {
    if (!String(answerKey.keyword.text || '').trim()) {
      errors.push('keyword is missing or empty');
    }
    const rawOccurrences = answerKey.keyword.requiredOccurrences;
    if (rawOccurrences !== undefined) {
      const n = Number(rawOccurrences);
      if (!Number.isFinite(n) || n < 1) {
        errors.push('keyword.requiredOccurrences must be >= 1');
      }
    }
  } else if (typeof answerKey.keyword === 'string' && !answerKey.keyword.trim()) {
    errors.push('keyword is missing or empty');
  }

  const keywordSpec = resolveKeywordSpec(answerKey.keyword);
  if (keywordSpec?.text && keywordSpec.requiredOccurrences < 1) {
    errors.push('keyword.requiredOccurrences must be >= 1');
  }

  if (!Array.isArray(answerKey.fullAnswers) || answerKey.fullAnswers.length === 0) {
    errors.push('fullAnswers must be a non-empty array');
  } else {
    answerKey.fullAnswers.forEach((entry, idx) => {
      if (!String(entry || '').trim()) {
        errors.push(`fullAnswers[${idx}] is empty`);
      }
    });
  }

  const markingPoints = answerKey.markingPoints;
  if (!Array.isArray(markingPoints) || markingPoints.length !== 2) {
    errors.push('markingPoints must contain exactly 2 entries');
  } else {
    const ids = new Set();
    /** @type {string[]} */
    const normalizedVariants = [];

    markingPoints.forEach((mp, idx) => {
      if (mp == null || typeof mp !== 'object') {
        errors.push(`markingPoints[${idx}] must be an object`);
        return;
      }

      if (ids.has(mp.id)) {
        errors.push(`duplicate marking point id: ${mp.id}`);
      }
      ids.add(mp.id);

      if (!Array.isArray(mp.accepted) || mp.accepted.length === 0) {
        errors.push(`markingPoints[${idx}] has no accepted variants`);
        return;
      }

      mp.accepted.forEach((variant, vIdx) => {
        if (!String(variant || '').trim()) {
          errors.push(`markingPoints[${idx}].accepted[${vIdx}] is empty`);
          return;
        }
        normalizedVariants.push(
          `${mp.id}::${normalizeB2KeyWordAnswer(variant)}`,
        );
      });
    });

    const variantTexts = markingPoints.flatMap((mp) =>
      (mp.accepted || []).map((variant) => normalizeB2KeyWordAnswer(variant)),
    );
    const uniqueVariants = new Set(variantTexts.filter(Boolean));
    if (uniqueVariants.size < variantTexts.filter(Boolean).length) {
      errors.push('duplicate accepted variants within a marking point');
    }

    if (markingPoints.length === 2) {
      const mp1 = markingPoints.find((mp) => mp.id === 1) || markingPoints[0];
      const mp2 = markingPoints.find((mp) => mp.id === 2) || markingPoints[1];
      const set1 = new Set((mp1.accepted || []).map((v) => normalizeB2KeyWordAnswer(v)));
      for (const variant of mp2.accepted || []) {
        const norm = normalizeB2KeyWordAnswer(variant);
        if (set1.has(norm)) {
          errors.push('marking points share an identical accepted variant');
          break;
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
