/**
 * Evidence binding (Doc 05 §7, Doc 07 Phase 3 §17).
 *
 * The model is never trusted with character offsets. It emits a quote and an
 * occurrence index; this module resolves them against the ORIGINAL candidate
 * response. The original text is never rewritten to make a quote fit, and a
 * quote that cannot be resolved never receives fabricated offsets.
 *
 * Matching is tolerant of the differences a model reliably introduces —
 * curly apostrophes, unicode dashes, collapsed whitespace, letter case — by
 * matching against a normalised projection of the response while keeping an
 * index map back to the original. The offsets always reproduce the exact
 * source substring.
 */

export type BindingFailureReason = 'quote_not_found' | 'occurrence_out_of_range';

export type QuoteBinding =
  | { status: 'bound'; span_start: number; span_end: number; bound_text: string }
  | { status: 'failed'; reason: BindingFailureReason; occurrences_found: number };

interface NormalisedProjection {
  text: string;
  /** Original index where normalised character i starts. */
  originStart: number[];
  /** Original index just past the character(s) that produced normalised character i. */
  originEnd: number[];
}

const APOSTROPHES = /[\u2018\u2019\u201B\u02BC\u00B4`]/;
const DOUBLE_QUOTES = /[\u201C\u201D\u201E\u00AB\u00BB]/;
const DASHES = /[\u2010-\u2015\u2212]/;

function foldCharacter(char: string): string {
  if (APOSTROPHES.test(char)) return "'";
  if (DOUBLE_QUOTES.test(char)) return '"';
  if (DASHES.test(char)) return '-';
  return char.toLowerCase();
}

/**
 * Builds a normalised projection of `source` together with an index map, so a
 * match found in the projection can be translated back to exact original
 * offsets. Whitespace runs collapse to a single space that spans the whole run.
 */
function project(source: string): NormalisedProjection {
  const text: string[] = [];
  const originStart: number[] = [];
  const originEnd: number[] = [];

  let index = 0;
  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      const runStart = index;
      while (index < source.length && /\s/.test(source[index])) index += 1;
      // Leading whitespace produces no normalised character.
      if (text.length > 0) {
        text.push(' ');
        originStart.push(runStart);
        originEnd.push(index);
      }
      continue;
    }

    const folded = foldCharacter(char);
    for (const piece of folded) {
      text.push(piece);
      originStart.push(index);
      originEnd.push(index + 1);
    }
    index += 1;
  }

  // A trailing collapsed space would let a quote bind past its real end.
  while (text.length && text[text.length - 1] === ' ') {
    text.pop();
    originStart.pop();
    originEnd.pop();
  }

  return { text: text.join(''), originStart, originEnd };
}

function projectQuote(quote: string): string {
  return project(quote).text;
}

/**
 * Resolves the `occurrenceIndex`-th appearance of `quote` inside
 * `candidateResponse`. Occurrence indexes are 0-based.
 */
export function bindQuote(
  candidateResponse: string,
  quote: string,
  occurrenceIndex = 0,
): QuoteBinding {
  const needle = projectQuote(quote ?? '');
  if (!needle) return { status: 'failed', reason: 'quote_not_found', occurrences_found: 0 };

  const projection = project(candidateResponse ?? '');
  const positions: number[] = [];
  let cursor = projection.text.indexOf(needle);
  while (cursor !== -1) {
    positions.push(cursor);
    cursor = projection.text.indexOf(needle, cursor + 1);
  }

  if (positions.length === 0) {
    return { status: 'failed', reason: 'quote_not_found', occurrences_found: 0 };
  }
  if (occurrenceIndex < 0 || occurrenceIndex >= positions.length) {
    return {
      status: 'failed',
      reason: 'occurrence_out_of_range',
      occurrences_found: positions.length,
    };
  }

  const start = positions[occurrenceIndex];
  const end = start + needle.length - 1;
  const span_start = projection.originStart[start];
  const span_end = projection.originEnd[end];

  return {
    status: 'bound',
    span_start,
    span_end,
    bound_text: candidateResponse.slice(span_start, span_end),
  };
}

export function countQuoteOccurrences(candidateResponse: string, quote: string): number {
  const needle = projectQuote(quote ?? '');
  if (!needle) return 0;
  const projection = project(candidateResponse ?? '');
  let count = 0;
  let cursor = projection.text.indexOf(needle);
  while (cursor !== -1) {
    count += 1;
    cursor = projection.text.indexOf(needle, cursor + 1);
  }
  return count;
}

/**
 * Assessment evidence binding contract (Phase 9 approved):
 *
 * - Exact quote occurs once → code owns location; canonical occurrence_index = 0;
 *   model-provided index is ignored for location (not fuzzy repair).
 * - Exact quote occurs more than once → require zero-based model occurrence_index;
 *   do not guess which repetition was intended.
 * - Quote absent → quote_not_found. No paraphrase / fuzzy / fabricated offsets.
 */
export type AssessmentEvidenceBinding =
  | {
      status: 'bound';
      span_start: number;
      span_end: number;
      bound_text: string;
      occurrences_found: number;
      canonical_occurrence_index: number;
      model_occurrence_index: number;
      model_index_ignored: boolean;
    }
  | {
      status: 'failed';
      reason: BindingFailureReason;
      occurrences_found: number;
      canonical_occurrence_index: null;
      model_occurrence_index: number;
      model_index_ignored: boolean;
    };

export function bindAssessmentEvidenceQuote(
  candidateResponse: string,
  quote: string,
  modelOccurrenceIndex: number,
): AssessmentEvidenceBinding {
  const modelIndex =
    typeof modelOccurrenceIndex === 'number' && Number.isInteger(modelOccurrenceIndex)
      ? modelOccurrenceIndex
      : 0;
  const occurrences_found = countQuoteOccurrences(candidateResponse, quote);

  if (occurrences_found === 0) {
    return {
      status: 'failed',
      reason: 'quote_not_found',
      occurrences_found: 0,
      canonical_occurrence_index: null,
      model_occurrence_index: modelIndex,
      model_index_ignored: false,
    };
  }

  if (occurrences_found === 1) {
    const binding = bindQuote(candidateResponse, quote, 0);
    if (binding.status !== 'bound') {
      return {
        status: 'failed',
        reason: binding.reason,
        occurrences_found: binding.occurrences_found,
        canonical_occurrence_index: null,
        model_occurrence_index: modelIndex,
        model_index_ignored: true,
      };
    }
    return {
      status: 'bound',
      span_start: binding.span_start,
      span_end: binding.span_end,
      bound_text: binding.bound_text,
      occurrences_found: 1,
      canonical_occurrence_index: 0,
      model_occurrence_index: modelIndex,
      model_index_ignored: modelIndex !== 0,
    };
  }

  const binding = bindQuote(candidateResponse, quote, modelIndex);
  if (binding.status !== 'bound') {
    return {
      status: 'failed',
      reason: binding.reason,
      occurrences_found: binding.occurrences_found,
      canonical_occurrence_index: null,
      model_occurrence_index: modelIndex,
      model_index_ignored: false,
    };
  }
  return {
    status: 'bound',
    span_start: binding.span_start,
    span_end: binding.span_end,
    bound_text: binding.bound_text,
    occurrences_found,
    canonical_occurrence_index: modelIndex,
    model_occurrence_index: modelIndex,
    model_index_ignored: false,
  };
}

/** The offsets must always reproduce the exact source substring. */
export function verifyBinding(
  candidateResponse: string,
  span_start: number,
  span_end: number,
  bound_text: string,
): boolean {
  return candidateResponse.slice(span_start, span_end) === bound_text;
}
