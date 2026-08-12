/**
 * Interactive Writing Map segmentation (Phase 8).
 *
 * Turns `candidate_response` plus `feedback_payload.annotations[]` into a flat
 * list of text segments. Two properties matter more than anything else here:
 *
 *  1. The learner's words are never touched. Concatenating every segment's text
 *     reproduces the submitted response byte for byte, always.
 *  2. Every character belongs to exactly one segment, so overlapping annotations
 *     can never duplicate the text they share.
 *
 * There is no markup parsing. The legacy `[[gram|3]]…[[/gram]]` format does not
 * exist on this path: offsets come from Phase 3 binding, already validated.
 */
import type { WritingAnnotation } from '../domain/types';

export interface TextSegment {
  kind: 'text';
  text: string;
  start: number;
  end: number;
}

export interface MarkSegment {
  kind: 'mark';
  text: string;
  start: number;
  end: number;
  /** Deterministically ordered. Length > 1 only where spans overlap. */
  annotations: WritingAnnotation[];
  /** The annotation whose category styles this segment. */
  primary: WritingAnnotation;
  /** Stable identity for the active-bubble state, shared by nothing else. */
  group_id: string;
  overlapping: boolean;
}

export type WritingMapSegment = TextSegment | MarkSegment;

export interface DroppedAnnotation {
  annotation_id: string;
  reason: 'span_out_of_range' | 'empty_span' | 'text_mismatch';
}

export interface WritingMapSegmentation {
  segments: WritingMapSegment[];
  dropped: DroppedAnnotation[];
}

/**
 * Deterministic order: earliest span first, then the widest span, then the
 * annotation id. The comparison never depends on array order, so the same
 * payload always produces the same map — and the same screenshots.
 */
function compareAnnotations(a: WritingAnnotation, b: WritingAnnotation): number {
  if (a.span_start !== b.span_start) return a.span_start - b.span_start;
  if (a.span_end !== b.span_end) return b.span_end - a.span_end;
  return a.annotation_id < b.annotation_id ? -1 : a.annotation_id > b.annotation_id ? 1 : 0;
}

/**
 * Overlap policy.
 *
 * The response is cut at every annotation boundary, producing elementary
 * intervals. An interval covered by two annotations becomes ONE segment that
 * carries both, so:
 *
 *   "My friend eat hamburgers three times a week"
 *    └─ grammar ──────────────┘
 *              └─ vocabulary ─────────────────────┘
 *
 * renders as three segments — grammar only, grammar + vocabulary, vocabulary
 * only — with the shared words written once. Both observation identities survive
 * on the shared segment, the first annotation in the deterministic order supplies
 * the styling, and the bubble for that segment lists both pieces of feedback.
 * Nothing is dropped and nothing is duplicated.
 */
export function buildAnnotationSegments(
  candidateResponse: string,
  annotations: readonly WritingAnnotation[],
): WritingMapSegmentation {
  const text = String(candidateResponse ?? '');
  const dropped: DroppedAnnotation[] = [];
  const usable: WritingAnnotation[] = [];

  for (const annotation of annotations) {
    const { span_start: start, span_end: end } = annotation;
    if (end <= start) {
      dropped.push({ annotation_id: annotation.annotation_id, reason: 'empty_span' });
      continue;
    }
    if (start < 0 || end > text.length) {
      dropped.push({ annotation_id: annotation.annotation_id, reason: 'span_out_of_range' });
      continue;
    }
    // The stored `original_text` was copied from the bound observation. If it no
    // longer matches the response, the offsets belong to a different text and
    // rendering them would highlight the wrong words.
    if (text.slice(start, end) !== annotation.original_text) {
      dropped.push({ annotation_id: annotation.annotation_id, reason: 'text_mismatch' });
      continue;
    }
    usable.push(annotation);
  }

  const ordered = [...usable].sort(compareAnnotations);
  if (!ordered.length) {
    return {
      segments: text ? [{ kind: 'text', text, start: 0, end: text.length }] : [],
      dropped,
    };
  }

  const boundaries = new Set<number>([0, text.length]);
  for (const annotation of ordered) {
    boundaries.add(annotation.span_start);
    boundaries.add(annotation.span_end);
  }
  const cuts = [...boundaries].sort((a, b) => a - b);

  const segments: WritingMapSegment[] = [];
  for (let i = 0; i < cuts.length - 1; i += 1) {
    const start = cuts[i]!;
    const end = cuts[i + 1]!;
    if (end <= start) continue;

    const covering = ordered.filter(
      (annotation) => annotation.span_start <= start && annotation.span_end >= end,
    );
    const slice = text.slice(start, end);

    if (!covering.length) {
      segments.push({ kind: 'text', text: slice, start, end });
      continue;
    }

    segments.push({
      kind: 'mark',
      text: slice,
      start,
      end,
      annotations: covering,
      primary: covering[0]!,
      group_id: covering.map((annotation) => annotation.annotation_id).join('+'),
      overlapping: covering.length > 1,
    });
  }

  return { segments, dropped };
}

/** Cheap invariant for tests and for the render path: no text was invented or lost. */
export function segmentsPreserveText(
  candidateResponse: string,
  segments: readonly WritingMapSegment[],
): boolean {
  return segments.map((segment) => segment.text).join('') === String(candidateResponse ?? '');
}

/** Every annotation that survived, in the order the learner meets it. */
export function markSegments(segments: readonly WritingMapSegment[]): MarkSegment[] {
  return segments.filter((segment): segment is MarkSegment => segment.kind === 'mark');
}
