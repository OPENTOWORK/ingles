/**
 * Communicative-intention safeguards (Doc 02 R02, R53, §1.2, §5.4).
 *
 * A suggestion improves how something is said; it never changes what the
 * learner said. These checks are deliberately conservative: they target the
 * failure modes Doc 02 names explicitly — a reversed stance, a flipped
 * negation, a rewrite that swallows the learner's text — and are built so that
 * a legitimate rephrasing such as "I do not agree" → "I disagree" passes.
 */

export type IntentViolation =
  | 'negation_flipped'
  | 'stance_reversed'
  | 'missing_voice_preservation'
  | 'suggestion_replaces_whole_text';

export interface IntentCheckInput {
  text_quote: string | null | undefined;
  suggested_change: string | null | undefined;
  candidate_response?: string;
  voice_preservation?:
    | { preserves_stance: boolean; preserves_central_meaning: boolean }
    | undefined;
}

const NEGATION_TOKENS = new Set([
  'not',
  'never',
  'no',
  'nothing',
  'neither',
  'nor',
  'cannot',
]);

/** Removed before comparing content, because negation is often folded into a verb. */
const AUXILIARY_TOKENS = new Set(['do', 'does', 'did', 'can', 'could', 'will', 'would']);

const POSITIVE_STANCE = [
  'agree',
  'support',
  'good',
  'better',
  'best',
  'like',
  'love',
  'beneficial',
  'advantage',
  'advantages',
  'healthy',
  'positive',
];

const NEGATIVE_STANCE = [
  'disagree',
  'oppose',
  'bad',
  'worse',
  'worst',
  'dislike',
  'hate',
  'harmful',
  'disadvantage',
  'disadvantages',
  'unhealthy',
  'negative',
];

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/n['’]t\b/g, ' not')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function countNegations(tokens: string[]): number {
  return tokens.filter((token) => NEGATION_TOKENS.has(token)).length;
}

/** Net stance with negation folded in, so "not agree" and "disagree" match. */
function stancePolarity(tokens: string[]): number {
  const positive = tokens.filter((token) => POSITIVE_STANCE.includes(token)).length;
  const negative = tokens.filter((token) => NEGATIVE_STANCE.includes(token)).length;
  const net = Math.sign(positive - negative);
  const negated = countNegations(tokens) % 2 === 1;
  return negated ? -net : net;
}

function contentTokens(tokens: string[]): string[] {
  return tokens
    .filter((token) => !NEGATION_TOKENS.has(token) && !AUXILIARY_TOKENS.has(token))
    .sort();
}

export function checkIntentPreservation(input: IntentCheckInput): IntentViolation[] {
  const suggestion = input.suggested_change?.trim();
  if (!suggestion) return [];

  const violations: IntentViolation[] = [];

  if (
    !input.voice_preservation ||
    !input.voice_preservation.preserves_stance ||
    !input.voice_preservation.preserves_central_meaning
  ) {
    violations.push('missing_voice_preservation');
  }

  const original = input.text_quote?.trim() ?? '';
  if (original) {
    const originalTokens = tokenise(original);
    const suggestionTokens = tokenise(suggestion);

    const originalPolarity = stancePolarity(originalTokens);
    const suggestionPolarity = stancePolarity(suggestionTokens);
    if (originalPolarity !== 0 && suggestionPolarity !== 0 && originalPolarity !== suggestionPolarity) {
      violations.push('stance_reversed');
    }

    // A negation only counts as flipped when nothing else changed; otherwise the
    // rewrite may legitimately fold the negation into a different word.
    const negationParityChanged =
      countNegations(originalTokens) % 2 !== countNegations(suggestionTokens) % 2;
    const sameContent =
      contentTokens(originalTokens).join(' ') === contentTokens(suggestionTokens).join(' ');
    if (negationParityChanged && sameContent) {
      violations.push('negation_flipped');
    }
  }

  // Doc 02 R53: a correction must never replace the learner's whole text.
  const response = input.candidate_response?.trim() ?? '';
  if (response.length >= 200 && suggestion.length >= response.length * 0.5) {
    violations.push('suggestion_replaces_whole_text');
  }

  return [...new Set(violations)];
}
