/**
 * The learner-facing view model (Phase 8).
 *
 * Everything the v3 interface renders is built here, so the components stay thin
 * and the rules can be tested without a browser. Two rules dominate:
 *
 *  1. Nothing internal escapes. Provenance, engine and schema versions, rule ids,
 *     confidence, `why_not_lower`, retry state and observation payloads are not
 *     copied into the view model, so no component can render them by accident.
 *  2. Nothing is recomputed. Marks and the total are copied from the frozen
 *     payload exactly as Phase 4 set them and Phase 6 froze them.
 */
import {
  CAMBRIDGE_CRITERION_KEYS,
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  type CambridgeCriterionKey,
} from '../domain/public-constants';
import type { FeedbackPayload, WritingAnnotation } from '../domain/types';
import {
  CRITERION_LABELS,
  FEEDBACK_KIND_LABELS,
  WRITING_MAP_LEGEND,
  resolveCategoryToken,
  type WritingMapCategoryToken,
} from './annotation-palette';
import {
  buildAnnotationSegments,
  segmentsPreserveText,
  type WritingMapSegment,
} from './annotation-segments';

export interface CriterionResultRow {
  key: CambridgeCriterionKey;
  label: string;
  mark: number;
  max: 5;
}

export interface GlobalResultView {
  criteria: CriterionResultRow[];
  raw_total: number;
  max_total: 20;
  disclaimer: string;
}

export interface OpeningStrengthView {
  id: string;
  headline: string;
  explanation: string;
}

export interface AnnotationFeedbackView {
  annotation_id: string;
  observation_id: string;
  category: WritingMapCategoryToken;
  kind_label: string;
  quote: string;
  explanation: string;
  suggested_change: string | null;
  teaching_prompt: string | null;
}

export interface WritingMapView {
  candidate_response: string;
  segments: WritingMapSegment[];
  /** Feedback for one open segment, keyed by that segment's `group_id`. */
  groups: Record<string, AnnotationFeedbackView[]>;
  /** Only the categories this response actually uses. */
  legend: WritingMapCategoryToken[];
  annotation_count: number;
  text_is_intact: boolean;
}

export interface CriterionCardView {
  key: CambridgeCriterionKey;
  label: string;
  mark: number;
  max: 5;
  summary: string;
  /** The top band: there is no band 6 to reach, so the wording consolidates. */
  is_top_band: boolean;
  next_focus_label: string;
  expanded: {
    what_worked: string;
    what_limited_the_band: string;
    evidence: string[];
    next_focus: string;
  };
}

export interface ReviewNextView {
  id: string;
  concept: string;
  reason: string;
}

export interface FeedbackViewModel {
  result: GlobalResultView;
  strengths: OpeningStrengthView[];
  map: WritingMapView;
  criteria: CriterionCardView[];
  review_next: ReviewNextView[];
  cta_label: string;
}

const NEXT_FOCUS_LABEL = 'Next focus';
/** Doc 04 §7: band 5 is the ceiling. Nothing may imply a band 6 exists. */
const TOP_BAND_FOCUS_LABEL = 'Keeping it there';

function annotationView(annotation: WritingAnnotation): AnnotationFeedbackView {
  return {
    annotation_id: annotation.annotation_id,
    observation_id: annotation.observation_id,
    category: resolveCategoryToken(annotation.category_key),
    kind_label: FEEDBACK_KIND_LABELS[annotation.feedback_kind],
    quote: annotation.original_text,
    explanation: annotation.local_explanation,
    suggested_change: annotation.suggested_change ?? null,
    teaching_prompt: annotation.teaching_prompt ?? null,
  };
}

export function buildFeedbackViewModel(input: {
  candidate_response: string;
  feedback_payload: FeedbackPayload;
}): FeedbackViewModel {
  const payload = input.feedback_payload;
  const candidate = String(input.candidate_response ?? '');

  const { segments } = buildAnnotationSegments(candidate, payload.annotations);

  const groups: Record<string, AnnotationFeedbackView[]> = {};
  const usedCategories = new Set<string>();
  for (const segment of segments) {
    if (segment.kind !== 'mark') continue;
    groups[segment.group_id] = segment.annotations.map(annotationView);
    for (const annotation of segment.annotations) usedCategories.add(annotation.category_key);
  }

  const criteria = CAMBRIDGE_CRITERION_KEYS.map((key) => {
    const row = payload.criterion_feedback.find((entry) => entry.criterion === key);
    if (!row) {
      throw new Error(`feedback payload is missing criterion feedback for ${key}`);
    }
    const isTopBand = row.mark === 5;
    return {
      key,
      label: CRITERION_LABELS[key],
      mark: row.mark,
      max: 5 as const,
      summary: row.summary,
      is_top_band: isTopBand,
      next_focus_label: isTopBand ? TOP_BAND_FOCUS_LABEL : NEXT_FOCUS_LABEL,
      expanded: {
        what_worked: row.expanded.what_worked,
        what_limited_the_band: row.expanded.what_limited_the_band,
        // Only the learner's own words, never the binding metadata around them.
        evidence: row.expanded.evidence.map((quote) => quote.quote),
        next_focus: row.expanded.next_focus,
      },
    };
  });

  return {
    result: {
      criteria: criteria.map((row) => ({
        key: row.key,
        label: row.label,
        mark: row.mark,
        max: 5 as const,
      })),
      raw_total: payload.global_result.raw_total,
      max_total: 20,
      disclaimer: DRALO_RESULT_DISCLAIMER,
    },
    strengths: payload.opening_strengths.map((strength) => ({
      id: strength.strength_id,
      headline: strength.headline,
      explanation: strength.explanation,
    })),
    map: {
      candidate_response: candidate,
      segments,
      groups,
      legend: WRITING_MAP_LEGEND.filter((token) => usedCategories.has(token.key)),
      annotation_count: payload.annotations.length,
      text_is_intact: segmentsPreserveText(candidate, segments),
    },
    criteria,
    review_next: payload.review_next.map((item) => ({
      id: item.review_id,
      concept: item.concept,
      reason: item.reason,
    })),
    cta_label: FINAL_CTA,
  };
}

export { DRALO_RESULT_DISCLAIMER, FINAL_CTA };
