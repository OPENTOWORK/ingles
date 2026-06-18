import { normalizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';

/**
 * @typedef {string | { text: string, requiredOccurrences?: number }} B2KeyWordKeywordSpec
 */

/**
 * @param {B2KeyWordKeywordSpec | null | undefined} keyword
 * @returns {{ text: string, requiredOccurrences: number } | null}
 */
export function resolveKeywordSpec(keyword) {
  if (keyword == null) return null;

  if (typeof keyword === 'string') {
    const text = keyword.trim();
    if (!text) return null;
    return { text, requiredOccurrences: 1 };
  }

  if (typeof keyword === 'object' && keyword.text != null) {
    const text = String(keyword.text).trim();
    if (!text) return null;
    const requiredOccurrences = Number(keyword.requiredOccurrences);
    return {
      text,
      requiredOccurrences: Number.isFinite(requiredOccurrences) && requiredOccurrences >= 1
        ? requiredOccurrences
        : 1,
    };
  }

  return null;
}

/**
 * Exact token matches for keyword text (case-insensitive).
 * Multi-token keywords count non-overlapping contiguous sequences.
 * @param {string} keywordText
 * @param {string[]} tokens
 */
export function countKeywordTokenMatches(keywordText, tokens) {
  const kw = normalizeB2KeyWordAnswer(keywordText);
  const kwTokens = kw.split(' ').filter(Boolean);
  if (!kwTokens.length) return 0;

  if (kwTokens.length === 1) {
    const target = kwTokens[0];
    return tokens.filter((token) => token.toLowerCase() === target).length;
  }

  let count = 0;
  for (let i = 0; i <= tokens.length - kwTokens.length; ) {
    let matched = true;
    for (let j = 0; j < kwTokens.length; j += 1) {
      if (tokens[i + j].toLowerCase() !== kwTokens[j]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      count += 1;
      i += kwTokens.length;
    } else {
      i += 1;
    }
  }
  return count;
}

/**
 * @param {B2KeyWordKeywordSpec | null | undefined} keywordSpec
 * @param {string[]} tokens
 * @returns {{
 *   status: 'correct' | 'missing' | 'modified',
 *   occurrences: { required: number, found: number },
 * }}
 */
export function evaluateB2KeyWordKeywordStatus(keywordSpec, tokens) {
  const spec = resolveKeywordSpec(keywordSpec);
  if (!spec?.text) {
    return { status: 'missing', occurrences: { required: 1, found: 0 } };
  }

  const { text, requiredOccurrences: required } = spec;
  const kwTokens = normalizeB2KeyWordAnswer(text).split(' ').filter(Boolean);

  if (kwTokens.length === 1) {
    const target = kwTokens[0];
    let modified = false;

    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (lower === target) continue;
      if (lower.startsWith(target) && lower.length > target.length) {
        modified = true;
      }
    }

    const found = countKeywordTokenMatches(text, tokens);
    if (modified) {
      return { status: 'modified', occurrences: { required, found } };
    }
    if (found >= required) {
      return { status: 'correct', occurrences: { required, found } };
    }
    return { status: 'missing', occurrences: { required, found } };
  }

  const found = countKeywordTokenMatches(text, tokens);
  if (found >= required) {
    return { status: 'correct', occurrences: { required, found } };
  }
  return { status: 'missing', occurrences: { required, found } };
}
