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

/** Cambridge contractions whose expanded form begins with the keyword token (e.g. needn't → need not). */
const KEYWORD_EMBEDDING_CONTRACTION_STEMS = Object.freeze({
  "don't": 'do',
  "doesn't": 'does',
  "didn't": 'did',
  "won't": 'will',
  "wouldn't": 'would',
  "couldn't": 'could',
  "shouldn't": 'should',
  "mustn't": 'must',
  "needn't": 'need',
  "mightn't": 'might',
  "isn't": 'is',
  "aren't": 'are',
  "wasn't": 'was',
  "weren't": 'were',
  "haven't": 'have',
  "hasn't": 'has',
  "hadn't": 'had',
});

/**
 * @param {string} keywordText normalized single-token keyword
 * @param {string} token lowercased answer token
 */
function isKeywordEmbeddingContraction(keywordText, token) {
  const kw = keywordText.toLowerCase();
  const stem = KEYWORD_EMBEDDING_CONTRACTION_STEMS[token];
  if (stem && stem === kw) return true;
  if (token === "can't" && kw === 'can') return true;
  if (token === 'cannot' && kw === 'can') return true;
  return false;
}

/**
 * @param {string} keywordText
 * @param {string[]} tokens
 */
export function countKeywordTokenMatches(keywordText, tokens) {
  const kw = normalizeB2KeyWordAnswer(keywordText);
  const kwTokens = kw.split(' ').filter(Boolean);
  if (!kwTokens.length) return 0;

  if (kwTokens.length === 1) {
    const target = kwTokens[0];
    let count = 0;
    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (lower === target) {
        count += 1;
      } else if (isKeywordEmbeddingContraction(target, lower)) {
        count += 1;
      }
    }
    return count;
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
      if (isKeywordEmbeddingContraction(target, lower)) continue;
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
