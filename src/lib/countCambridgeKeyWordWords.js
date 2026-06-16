import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';

/**
 * Explicit Cambridge-style contraction → spoken word count.
 * Contractions not listed expand to 1 word (the token itself).
 */
export const CAMBRIDGE_CONTRACTION_WORD_COUNTS = Object.freeze({
  "don't": 2,
  "doesn't": 2,
  "didn't": 2,
  "isn't": 2,
  "aren't": 2,
  "wasn't": 2,
  "weren't": 2,
  "haven't": 2,
  "hasn't": 2,
  "hadn't": 2,
  "won't": 2,
  "wouldn't": 2,
  "couldn't": 2,
  "shouldn't": 2,
  "mustn't": 2,
  "needn't": 2,
  "mightn't": 2,
  "can't": 1,
  "cannot": 1,
  "he'll": 2,
  "she'll": 2,
  "they'll": 2,
  "we'll": 2,
  "you'll": 2,
  "it'll": 2,
  "i'll": 2,
  "he's": 2,
  "she's": 2,
  "they're": 2,
  "we're": 2,
  "you're": 2,
  "it's": 2,
  "i'm": 2,
  "you've": 2,
  "we've": 2,
  "they've": 2,
  "i've": 2,
});

/**
 * @param {string} token
 * @returns {number}
 */
export function countCambridgeWordsInToken(token) {
  const key = String(token || '').toLowerCase();
  if (!key) return 0;
  if (Object.prototype.hasOwnProperty.call(CAMBRIDGE_CONTRACTION_WORD_COUNTS, key)) {
    return CAMBRIDGE_CONTRACTION_WORD_COUNTS[key];
  }
  return 1;
}

/**
 * Count Cambridge words for a full answer string.
 * @param {string} answer
 * @returns {number}
 */
export function countCambridgeKeyWordWords(answer) {
  const tokens = tokenizeB2KeyWordAnswer(answer);
  return tokens.reduce((sum, t) => sum + countCambridgeWordsInToken(t), 0);
}

/**
 * @param {string} answer
 * @param {{ min?: number, max?: number }} [limits]
 */
export function isCambridgeKeyWordWordCountValid(answer, limits = { min: 2, max: 5 }) {
  const count = countCambridgeKeyWordWords(answer);
  const min = limits.min ?? 2;
  const max = limits.max ?? 5;
  return count >= min && count <= max;
}

export { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer };
