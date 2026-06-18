import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';

/**
 * Explicit Cambridge-style pronominal/auxiliary contractions → spoken word count.
 * Tokens with apostrophes that are NOT listed here and NOT possessives count as 1 word.
 *
 * Possessive policy (conservative, no context):
 * - john's, student's, students' → 1 word (name/noun possessive)
 * - she's, he's, etc. → listed here as 2 words
 * - Unlisted apostrophe tokens default to 1 word to avoid inflating counts arbitrarily
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
  "i'll": 2,
  "you'll": 2,
  "he'll": 2,
  "she'll": 2,
  "we'll": 2,
  "they'll": 2,
  "it'll": 2,
  "i've": 2,
  "you've": 2,
  "he's": 2,
  "she's": 2,
  "we've": 2,
  "they've": 2,
  "it's": 2,
  "i'm": 2,
  "you're": 2,
  "we're": 2,
  "they're": 2,
  "i'd": 2,
  "you'd": 2,
  "he'd": 2,
  "she'd": 2,
  "we'd": 2,
  "they'd": 2,
});

/** Pronoun stems whose trailing 's forms are only counted as contractions when listed above. */
const PRONOUN_STEMS = new Set([
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'there',
  'here',
  'who',
  'what',
  'that',
]);

/**
 * Possessive apostrophe tokens count as 1 word.
 * @param {string} token lowercased token
 */
export function isPossessiveApostropheToken(token) {
  const t = String(token || '').toLowerCase();
  if (!t.includes("'")) return false;
  if (Object.prototype.hasOwnProperty.call(CAMBRIDGE_CONTRACTION_WORD_COUNTS, t)) {
    return false;
  }

  // students'
  if (/^[a-z0-9]+'$/.test(t)) return true;

  // john's, student's
  if (/^[a-z0-9]+'s$/.test(t)) {
    const stem = t.slice(0, -2);
    if (PRONOUN_STEMS.has(stem)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * @param {string} token
 * @returns {number}
 */
export function countCambridgeWordsInToken(token) {
  const key = String(token || '').toLowerCase();
  if (!key) return 0;

  if (isPossessiveApostropheToken(key)) {
    return 1;
  }

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
