/**
 * Feedback composition prompt (Layer 4 — Doc 04).
 *
 * The model writes explanations. It never writes marks: the schema below has no
 * field for a band, a total or a criterion score, so a model that tries to
 * change the result has nowhere to put it. The frozen assessment is supplied as
 * read-only context purely so the prose it produces is faithful to the marks.
 */
import { z } from 'zod';
import { PROMPT_VERSIONS } from '../domain/engine-version';
import { WRITING_CATEGORY_KEYS } from '../domain/categories';
import type {
  AssessmentRecord,
  HistoryOverlayEntry,
  ResolvedTaskAnalysis,
} from '../domain/types';
import { CAMBRIDGE_CRITERIA } from './knowledge/doc03-cambridge-descriptors';
import {
  ANNOTATION_DEPTH_RULES,
  CRITERION_CLARITY_RULES,
  CRITERION_DISCLOSURE_RULES,
  NEXT_FOCUS_RULES,
  OPENING_STRENGTH_RULES,
  REVIEW_NEXT_RULES,
  SELECTIVITY_RULES,
  VOICE_PRESERVATION_RULES,
  VOICE_RULES,
} from './knowledge/doc04-feedback-rules';

export const FEEDBACK_PROMPT_ID = 'writing.feedback-composition';
export const FEEDBACK_PROMPT_VERSION = PROMPT_VERSIONS.feedback_composition;

const ANNOTATION_KINDS = [
  'correction',
  'suggestion',
  'explanation',
  'teaching_prompt',
  'strength',
] as const;

const llmAnnotationSchema = z
  .object({
    observation_id: z.string().min(1),
    feedback_kind: z.enum(ANNOTATION_KINDS),
    local_explanation: z.string().min(1),
    suggested_change: z.string().min(1).nullable(),
    teaching_prompt: z.string().min(1).nullable(),
  })
  .strict();

const llmOpeningStrengthSchema = z
  .object({
    observation_id: z.string().min(1),
    headline: z.string().min(1),
    explanation: z.string().min(1),
  })
  .strict();

const llmCriterionFeedbackSchema = z
  .object({
    criterion: z.enum(CAMBRIDGE_CRITERIA),
    summary: z.string().min(1),
    what_worked: z.string().min(1),
    what_limited_the_band: z.string().min(1),
    /** Indices into the read-only evidence list supplied for that criterion. */
    evidence_indices: z.array(z.number().int().min(0)),
    next_focus: z.string().min(1),
  })
  .strict();

const llmReviewNextSchema = z
  .object({
    concept: z.string().min(1),
    reason: z.string().min(1),
    source: z.enum(['observation', 'assessment_limitation', 'history_overlay']),
    source_ids: z.array(z.string().min(1)).min(1),
  })
  .strict();

/**
 * Not `.strict()` at the top level. If a model volunteers marks or a total they
 * are dropped here and never read, exactly as Phase 4 does with a volunteered
 * total.
 */
export const feedbackLlmOutputSchema = z.object({
  opening_strengths: z.array(llmOpeningStrengthSchema),
  annotations: z.array(llmAnnotationSchema),
  criterion_feedback: z.array(llmCriterionFeedbackSchema),
  review_next: z.array(llmReviewNextSchema),
});

export type FeedbackLlmOutput = z.infer<typeof feedbackLlmOutputSchema>;

const nullableString = { type: ['string', 'null'] } as const;

export const FEEDBACK_JSON_SCHEMA = {
  name: 'writing_feedback_composition',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['opening_strengths', 'annotations', 'criterion_feedback', 'review_next'],
    properties: {
      opening_strengths: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['observation_id', 'headline', 'explanation'],
          properties: {
            observation_id: { type: 'string' },
            headline: { type: 'string' },
            explanation: { type: 'string' },
          },
        },
      },
      annotations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'observation_id',
            'feedback_kind',
            'local_explanation',
            'suggested_change',
            'teaching_prompt',
          ],
          properties: {
            observation_id: { type: 'string' },
            feedback_kind: { type: 'string', enum: [...ANNOTATION_KINDS] },
            local_explanation: { type: 'string' },
            suggested_change: nullableString,
            teaching_prompt: nullableString,
          },
        },
      },
      criterion_feedback: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'criterion',
            'summary',
            'what_worked',
            'what_limited_the_band',
            'evidence_indices',
            'next_focus',
          ],
          properties: {
            criterion: { type: 'string', enum: [...CAMBRIDGE_CRITERIA] },
            summary: { type: 'string' },
            what_worked: { type: 'string' },
            what_limited_the_band: { type: 'string' },
            evidence_indices: { type: 'array', items: { type: 'integer' } },
            next_focus: { type: 'string' },
          },
        },
      },
      review_next: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['concept', 'reason', 'source', 'source_ids'],
          properties: {
            concept: { type: 'string' },
            reason: { type: 'string' },
            source: {
              type: 'string',
              enum: ['observation', 'assessment_limitation', 'history_overlay'],
            },
            source_ids: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
} as const;

/** An observation the composer is allowed to turn into a local annotation. */
export interface AnnotatableObservation {
  observation_id: string;
  domain: string;
  category_key: string;
  polarity: string;
  quote: string;
  span_start: number;
  span_end: number;
  intended_meaning: string | null;
  diagnosis: string;
  suggested_change: string | null;
  communicative_impact: string;
  meaning_blocking: boolean;
  pedagogical_priority: string;
  history: HistoryOverlayEntry | null;
}

/** An observation that is real but has no local span to attach to. */
export interface GlobalObservationContext {
  observation_id: string;
  domain: string;
  polarity: string;
  diagnosis: string;
  communicative_impact: string;
}

export interface CriterionEvidenceContext {
  criterion: string;
  mark: number;
  band_anchor: string;
  positive_evidence: string[];
  limiting_evidence: string[];
  why_not_higher: string;
  why_not_lower: string | null;
  /** Bound quotes already verified by Phase 4, addressed by index. */
  evidence: Array<{ index: number; quote: string }>;
}

export interface FeedbackPromptInput {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
  assessment_record: AssessmentRecord;
  criterion_context: CriterionEvidenceContext[];
  annotatable: AnnotatableObservation[];
  global_observations: GlobalObservationContext[];
  eligible_strengths: AnnotatableObservation[];
  history_available: boolean;
  base_correction_strategy: string;
  principal_focus: string | null;
}

export function buildFeedbackPrompt(input: FeedbackPromptInput): {
  system: string;
  user: string;
  prompt_id: string;
  prompt_version: string;
} {
  const system = [
    'You are an experienced Cambridge B2 First writing teacher giving one student feedback',
    'on one piece of writing. The assessment is already finished and final.',
    '',
    'YOUR JOB IS TO EXPLAIN, NEVER TO RE-MARK',
    'The four criterion marks and the total are fixed and are supplied to you only so your',
    'explanations match them. You cannot change them: there is no field for a mark in your',
    'output schema. Never state a different mark, never suggest the result should be higher or',
    'lower, and never promise a band in exchange for an action.',
    '',
    'NEVER OUTPUT',
    '- a CEFR level, a Cambridge English Scale score, a pass or fail, a pass mark or a readiness claim',
    '- a rewritten, improved or "stronger" version of the response',
    '- colour, styling or interface instructions',
    '- character offsets: the application already knows where every quote is',
    '',
    'THE TEACHER’S VOICE',
    ...VOICE_RULES.map((rule) => `- ${rule}`),
    '',
    'OPENING STRENGTHS',
    ...OPENING_STRENGTH_RULES.map((rule) => `- ${rule}`),
    'Choose only from the eligible strengths supplied. If none are supplied, return none.',
    '',
    'LOCAL ANNOTATIONS',
    ...ANNOTATION_DEPTH_RULES.map((rule) => `- ${rule}`),
    ...SELECTIVITY_RULES.map((rule) => `- ${rule}`),
    `- Categories are fixed: ${WRITING_CATEGORY_KEYS.join(', ')}. The application assigns them.`,
    '- Annotate only the observations supplied as annotatable, by their observation_id.',
    '',
    'PRESERVING THE STUDENT’S WRITING',
    ...VOICE_PRESERVATION_RULES.map((rule) => `- ${rule}`),
    '',
    'CRITERION FEEDBACK',
    ...CRITERION_DISCLOSURE_RULES.map((rule) => `- ${rule}`),
    ...NEXT_FOCUS_RULES.map((rule) => `- ${rule}`),
    ...CRITERION_CLARITY_RULES.map((rule) => `- ${rule}`),
    '- Cite evidence by its supplied index. Never invent a quotation.',
    '',
    'WHAT TO REVIEW NEXT',
    ...REVIEW_NEXT_RULES.map((rule) => `- ${rule}`),
    '- Every item must name the observation ids, criterion keys or history evidence it comes from.',
    '',
    input.history_available
      ? [
          'LEARNER HISTORY',
          'A verified history overlay is supplied for some observations. You may refer to a',
          'confirmed recurrence, something previously taught or a genuine improvement ONLY where',
          'the overlay says so. Everything else has no history and must be described as what it',
          'is in this piece of writing.',
        ].join('\n')
      : [
          'LEARNER HISTORY',
          'You have none. Never write "you always", "you keep", "this is a recurring error for',
          'you", "we worked on this before" or "you have improved since". A pattern repeated',
          'inside this one script is a pattern in this script, not a learner history.',
        ].join('\n'),
    '',
    'Respond only with JSON matching the supplied schema.',
  ].join('\n');

  const user = [
    'THE TASK THE STUDENT ANSWERED:',
    JSON.stringify(
      {
        task_type: input.task_analysis.task_type,
        source_task_text: input.task_analysis.source_task_text,
        target_reader: input.task_analysis.target_reader,
        communicative_purpose: input.task_analysis.communicative_purpose,
        register: input.task_analysis.register,
      },
      null,
      2,
    ),
    '',
    'THE STUDENT’S WRITING (quote from this text exactly if you quote at all):',
    '"""',
    input.candidate_response,
    '"""',
    '',
    'FINAL MARKS (read-only, already decided — explain these, do not revisit them):',
    JSON.stringify(renderFrozenMarks(input.assessment_record), null, 2),
    '',
    'CRITERION DECISIONS AND THEIR VERIFIED EVIDENCE:',
    JSON.stringify(input.criterion_context, null, 2),
    '',
    `CORRECTION STRATEGY: ${input.base_correction_strategy}${
      input.principal_focus ? ` (principal focus: ${input.principal_focus})` : ''
    }`,
    '',
    'ELIGIBLE STRENGTHS (genuine positive evidence — select the most useful, or none):',
    JSON.stringify(input.eligible_strengths.map(renderObservation), null, 2),
    '',
    'ANNOTATABLE OBSERVATIONS (locally bound — you choose which deserve a bubble):',
    JSON.stringify(input.annotatable.map(renderObservation), null, 2),
    '',
    'GLOBAL OBSERVATIONS (no local span — use in criterion feedback or review, never as an annotation):',
    JSON.stringify(input.global_observations, null, 2),
    '',
    'Return the JSON feedback.',
  ].join('\n');

  return {
    system,
    user,
    prompt_id: FEEDBACK_PROMPT_ID,
    prompt_version: FEEDBACK_PROMPT_VERSION,
  };
}

function renderObservation(observation: AnnotatableObservation) {
  return {
    observation_id: observation.observation_id,
    domain: observation.domain,
    quote: observation.quote,
    intended_meaning: observation.intended_meaning,
    diagnosis: observation.diagnosis,
    suggested_change: observation.suggested_change,
    communicative_impact: observation.communicative_impact,
    meaning_blocking: observation.meaning_blocking,
    teaching_priority: observation.pedagogical_priority,
    ...(observation.history
      ? {
          verified_history: {
            confirmed_recurrence: observation.history.confirmed_historical_recurrence,
            previously_taught: observation.history.previously_taught,
            improvement: observation.history.improvement_signal,
          },
        }
      : {}),
  };
}

function renderFrozenMarks(record: AssessmentRecord) {
  if (record.status !== 'complete' || !record.criteria) return { status: record.status };
  return {
    content: record.criteria.content.mark,
    communicative_achievement: record.criteria.communicative_achievement.mark,
    organisation: record.criteria.organisation.mark,
    language: record.criteria.language.mark,
    raw_total: record.raw_total,
    max_total: 20,
    note: 'These are final. You have no field in which to change them.',
  };
}