/** @typedef {'ascii' | 'typographic'} QuoteStyle */

const TYPOGRAPHIC_DOUBLE = /[\u201C\u201D\u201E\u2033\u2036]/g;
const TYPOGRAPHIC_SINGLE = /[\u2018\u2019\u201A\u2032\u2035]/g;

/**
 * Normalize student/key answers for deterministic comparison.
 * Does not fix spelling, lemmatize, or merge distinct word forms.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeB2KeyWordAnswer(raw) {
  if (raw == null) return '';

  let s = String(raw)
    .normalize('NFKC')
    .replace(TYPOGRAPHIC_DOUBLE, '"')
    .replace(TYPOGRAPHIC_SINGLE, "'")
    .toLowerCase()
    .trim();

  // Strip peripheral punctuation (not internal apostrophes in contractions).
  s = s.replace(/^[\s"'`.,!?;:()[\]{}]+/, '').replace(/[\s"'`.,!?;:()[\]{}]+$/, '');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Tokenize on whitespace after normalization.
 * @param {string} normalized
 * @returns {string[]}
 */
export function tokenizeB2KeyWordAnswer(normalized) {
  const s = normalizeB2KeyWordAnswer(normalized);
  if (!s) return [];
  return s.split(' ').filter(Boolean);
}
