import { tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';

/**
 * Unambiguous Cambridge contractions. `can't` expands to `cannot` (one word),
 * not to `can not`.
 * @type {Record<string, string[]>}
 */
const UNAMBIGUOUS_CONTRACTIONS = Object.freeze({
  "don't": ['do', 'not'],
  "doesn't": ['does', 'not'],
  "didn't": ['did', 'not'],
  "isn't": ['is', 'not'],
  "aren't": ['are', 'not'],
  "wasn't": ['was', 'not'],
  "weren't": ['were', 'not'],
  "haven't": ['have', 'not'],
  "hasn't": ['has', 'not'],
  "hadn't": ['had', 'not'],
  "won't": ['will', 'not'],
  "wouldn't": ['would', 'not'],
  "couldn't": ['could', 'not'],
  "shouldn't": ['should', 'not'],
  "mustn't": ['must', 'not'],
  "needn't": ['need', 'not'],
  "mightn't": ['might', 'not'],
  "can't": ['cannot'],
  "i'll": ['i', 'will'],
  "you'll": ['you', 'will'],
  "he'll": ['he', 'will'],
  "she'll": ['she', 'will'],
  "we'll": ['we', 'will'],
  "they'll": ['they', 'will'],
  "it'll": ['it', 'will'],
  "i've": ['i', 'have'],
  "you've": ['you', 'have'],
  "we've": ['we', 'have'],
  "they've": ['they', 'have'],
  "i'm": ['i', 'am'],
  "you're": ['you', 'are'],
  "we're": ['we', 'are'],
  "they're": ['they', 'are'],
});

/**
 * Contractions with more than one grammatical expansion.
 * These are not chosen until an accepted answer selects one.
 * @type {Record<string, string[][]>}
 */
const AMBIGUOUS_CONTRACTIONS = Object.freeze({
  "i'd": [['i', 'had'], ['i', 'would']],
  "you'd": [['you', 'had'], ['you', 'would']],
  "he'd": [['he', 'had'], ['he', 'would']],
  "she'd": [['she', 'had'], ['she', 'would']],
  "we'd": [['we', 'had'], ['we', 'would']],
  "they'd": [['they', 'had'], ['they', 'would']],
  "he's": [['he', 'is'], ['he', 'has']],
  "she's": [['she', 'is'], ['she', 'has']],
  "it's": [['it', 'is'], ['it', 'has']],
});

/** One-word pairs. Open cloze accepts either written word; `can not` is not one of them. */
const ONE_WORD_EQUIVALENTS = Object.freeze({
  "can't": 'cannot',
  cannot: "can't",
});

const MAX_EXPANSIONS = 16;

/**
 * @param {string} token
 * @returns {string[][]}
 */
function expansionsForToken(token) {
  const key = String(token || '').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(AMBIGUOUS_CONTRACTIONS, key)) {
    return AMBIGUOUS_CONTRACTIONS[key];
  }
  if (Object.prototype.hasOwnProperty.call(UNAMBIGUOUS_CONTRACTIONS, key)) {
    return [UNAMBIGUOUS_CONTRACTIONS[key]];
  }
  return [[key]];
}

/**
 * Every grammatically possible expansion of a raw answer.
 * Unambiguous contractions become one expanded form.
 * Ambiguous contractions (`I'd`, `he's`, `it's`, …) keep each legal reading.
 * The raw string is not replaced; callers compare these forms with the key.
 *
 * @param {string} raw
 * @returns {string[]}
 */
export function expandRuoeAnswerForms(raw) {
  const tokens = tokenizeB2KeyWordAnswer(raw);
  if (!tokens.length) return [''];

  /** @type {string[][]} */
  let forms = [[]];
  for (const token of tokens) {
    const options = expansionsForToken(token);
    /** @type {string[][]} */
    const next = [];
    for (const form of forms) {
      for (const option of options) {
        next.push(form.concat(option));
        if (next.length >= MAX_EXPANSIONS) break;
      }
      if (next.length >= MAX_EXPANSIONS) break;
    }
    forms = next;
  }

  return [...new Set(forms.map((parts) => parts.join(' ')))];
}

/**
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
export function ruoeAnswersShareCanonicalForm(left, right) {
  const rightForms = new Set(expandRuoeAnswerForms(right));
  return expandRuoeAnswerForms(left).some((form) => rightForms.has(form));
}

/**
 * Open-cloze / one-word gaps. Multi-word expansions are not accepted,
 * because Part 2 allows one written word. `can't` and `cannot` are the
 * Cambridge one-word pair.
 *
 * @param {string} studentValue
 * @param {Set<string>} expectedNormalized
 * @param {(value: string) => string} normalize
 * @returns {boolean}
 */
export function openGapAnswerMatches(studentValue, expectedNormalized, normalize) {
  const student = normalize(String(studentValue ?? ''));
  if (!student || !expectedNormalized) return false;
  if (expectedNormalized.has(student)) return true;
  const alt = ONE_WORD_EQUIVALENTS[student];
  return Boolean(alt && expectedNormalized.has(alt));
}
