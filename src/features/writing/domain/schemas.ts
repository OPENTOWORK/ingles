/**
 * DRALO Writing Engine v3 — Zod contracts (Doc 05 §3–§6, §9; Doc 07 Phase 1).
 * No colour/styling fields. No learner-facing pass/CEFR fields in v3 contracts.
 */
import { z } from 'zod';
import { writingCategoryKeySchema } from './categories';
import {
  CAMBRIDGE_CRITERION_KEYS,
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  type CambridgeCriterionKey,
} from './public-constants';
import { b2FirstTaskTypeSchema } from './task-types';
import {
  PROMPT_VERSIONS,
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  TASK_ANALYSIS_SCHEMA_VERSION,
  WRITING_ENGINE_VERSION,
} from './engine-version';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export {
  CAMBRIDGE_CRITERION_KEYS,
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  type CambridgeCriterionKey,
};

export const cambridgeCriterionKeySchema = z.enum(CAMBRIDGE_CRITERION_KEYS);

/** Whole-band marks only — integers 0–5 (SC-02). */
export const criterionMarkSchema = z.number().int().min(0).max(5);

/**
 * Doc 03 §1.7 confidence vocabulary, shared by every layer so the engine never
 * carries two spellings of the same value.
 */
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;

export const confidenceSchema = z.enum(CONFIDENCE_LEVELS);

/**
 * Teaching urgency (Doc 02 §6). It shares its three values with confidence by
 * coincidence, not by meaning: one says how sure the engine is, the other says
 * what deserves the learner's attention first. Neither has any relationship to
 * a mark, and keeping the schemas separate stops one drifting into the other.
 */
export const PEDAGOGICAL_PRIORITY_LEVELS = ['high', 'medium', 'low'] as const;

export const pedagogicalPrioritySchema = z.enum(PEDAGOGICAL_PRIORITY_LEVELS);

export const modelConfigSnapshotSchema = z
  .object({
    model: z.string().min(1),
    snapshot_id: z.string().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    seed: z.number().int().optional(),
    response_format: z.string().optional(),
  })
  .strict();

export const sourceDocVersionsSchema = z
  .object({
    task_requirements: z.string(),
    teacher_dna: z.string(),
    cambridge_assessment: z.string(),
    feedback_ux: z.string(),
    technical_handoff: z.string(),
    acceptance_validation: z.string(),
  })
  .strict();

export const promptVersionsSchema = z
  .object({
    task_analysis: z.string(),
    observation_assessment: z.string(),
    cambridge_assessment: z.string(),
    feedback_composition: z.string(),
  })
  .strict();

export const versionProvenanceSchema = z
  .object({
    engine_version: z.string(),
    schema_version: z.string(),
    doc_versions: sourceDocVersionsSchema,
    prompt_versions: promptVersionsSchema,
    model_config: modelConfigSnapshotSchema,
  })
  .strict();

/** Keys forbidden in v3 learner-facing / scoring contracts (D2). */
export const FORBIDDEN_V3_FIELD_KEYS = [
  'passed',
  'required',
  'readiness',
  'cefr',
] as const;

/** Styling keys forbidden in domain contracts (D3 semantic independence). */
export const FORBIDDEN_STYLING_KEYS = [
  'color',
  'colour',
  'hex',
  'hex_color',
  'css_class',
  'className',
  'class_name',
  'visual_colour',
  'visual_color',
  'styling',
  'style',
  'palette',
] as const;

/** Learner-history fields forbidden in assessment_record (Phase 1 test #9). */
export const FORBIDDEN_ASSESSMENT_HISTORY_KEYS = [
  'learner_history',
  'learner_context',
  'prior_scores',
  'prior_work',
  'course_stage',
  'effort',
  'personality',
  'historical_errors',
  'recurring_error_history',
] as const;

// ---------------------------------------------------------------------------
// Task analysis (Doc 05 §4)
// ---------------------------------------------------------------------------

/**
 * Where a requirement comes from. Doc 01 §"Task wording overrides generic genre
 * guidance": a genre recommendation may only become mandatory when the actual
 * task wording makes it mandatory, and that promotion must stay traceable.
 */
export const REQUIREMENT_ORIGINS = ['doc01_genre_rule', 'task_wording'] as const;

export const requirementOriginSchema = z.enum(REQUIREMENT_ORIGINS);

export const mandatoryContentPointSchema = z
  .object({
    id: z.string().min(1),
    point: z.string().min(1),
    origin: requirementOriginSchema.default('task_wording'),
    evidence_quote: z.string().min(1).optional(),
  })
  .strict();

export const requiredFunctionSchema = z
  .object({
    id: z.string().min(1),
    function: z.string().min(1),
    origin: requirementOriginSchema,
    evidence_quote: z.string().min(1).optional(),
  })
  .strict();

/**
 * `status` is a literal on both sides so a recommendation cannot be silently
 * moved into the mandatory array (or vice versa) — the parse fails instead.
 */
export const mandatoryGenreConventionSchema = z
  .object({
    id: z.string().min(1),
    convention: z.string().min(1),
    status: z.literal('mandatory'),
    origin: requirementOriginSchema,
    doc01_reference: z.string().min(1).optional(),
    evidence_quote: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.origin === 'task_wording' && !data.evidence_quote?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'a convention promoted to mandatory by the task wording must quote that wording',
        path: ['evidence_quote'],
      });
    }
  });

/**
 * What the genre is expected to achieve, as opposed to a convention that is
 * either present or absent. A core expectation is never a task-completion
 * checkbox. It is evidence made available to downstream reasoning; which
 * Cambridge criterion it is relevant to is decided in Layer 3 against the
 * actual script, never pre-assigned here.
 */
export const coreGenreExpectationSchema = z
  .object({
    id: z.string().min(1),
    expectation: z.string().min(1),
    status: z.literal('core_expectation'),
    binary_completion_check: z.literal(false),
    doc01_reference: z.string().min(1).optional(),
  })
  .strict();

export const recommendedGenreFeatureSchema = z
  .object({
    id: z.string().min(1),
    feature: z.string().min(1),
    status: z.literal('recommended'),
    doc01_reference: z.string().min(1).optional(),
  })
  .strict();

export const WORD_GUIDANCE_SOURCES = [
  'task_wording',
  'task_metadata',
  'exam_configuration',
  'default_b2_first',
] as const;

export const wordGuidanceSchema = z
  .object({
    word_min: z.number().int().min(0).optional(),
    word_max: z.number().int().min(0).optional(),
    /** Where the range came from — length guidance is never inferred by the model. */
    source: z.enum(WORD_GUIDANCE_SOURCES).optional(),
    automatic_penalty: z.literal(false),
  })
  .strict();

export const TARGET_READER_SOURCES = [
  'task_wording',
  'task_metadata',
  'inference',
  'unresolved',
] as const;

export const targetReaderResolutionSchema = z
  .object({
    source: z.enum(TARGET_READER_SOURCES),
    evidence_quote: z.string().min(1).optional(),
    notes: z.array(z.string()).default([]),
  })
  .strict();

export const TASK_TYPE_RESOLUTION_SOURCES = [
  'explicit_caller',
  'dralo_task_metadata',
  'deterministic_inference',
  'llm_inference',
  'unresolved',
] as const;

export const taskTypeResolutionSchema = z
  .object({
    task_type: z.string().min(1).nullable(),
    source: z.enum(TASK_TYPE_RESOLUTION_SOURCES),
    confidence: z.enum(['certain', 'high', 'low', 'unresolved']),
    notes: z.array(z.string()).default([]),
  })
  .strict();

export const taskAnalysisProvenanceSchema = z
  .object({
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    task_analysis_schema_version: z.string().min(1),
    task_requirements_version: z.string().min(1),
    task_analysis_prompt_version: z.string().min(1),
    doc_versions: sourceDocVersionsSchema,
    model_config: modelConfigSnapshotSchema,
    task_content_hash: z.string().min(1),
    task_fingerprint: z.string().min(1),
    cache_key: z.string().min(1),
    task_type_resolution: taskTypeResolutionSchema,
    llm_calls: z.number().int().min(0),
  })
  .strict();

/**
 * Base task-analysis contract. Phase 2 fields are optional here so the Phase 1
 * contract keeps parsing; `resolvedTaskAnalysisSchema` is the shape the Task
 * Analysis service actually emits.
 */
export const taskAnalysisSchema = z
  .object({
    task_type: z.string().min(1),
    genre: z.string().optional(),
    source_task_text: z.string().min(1).optional(),
    /** Null when the task does not support a reader — never invented to fill the schema. */
    target_reader: z.string().min(1).nullable(),
    target_reader_resolution: targetReaderResolutionSchema.optional(),
    communicative_purpose: z.string().min(1),
    register: z.string().min(1),
    tone: z.string().min(1).optional(),
    mandatory_content_points: z.array(mandatoryContentPointSchema).min(1),
    required_functions: z.array(requiredFunctionSchema).default([]),
    mandatory_genre_conventions: z.array(mandatoryGenreConventionSchema).default([]),
    core_genre_expectations: z.array(coreGenreExpectationSchema).default([]),
    recommended_genre_features: z.array(recommendedGenreFeatureSchema).default([]),
    recommendations_not_requirements: z.array(z.string()),
    ambiguities: z.array(z.string()),
    word_guidance: wordGuidanceSchema,
    task_analysis_schema_version: z.string().min(1),
    provenance: taskAnalysisProvenanceSchema.optional(),
  })
  .strict();

/** Task Analysis service output: source text, canonical task type and provenance are required. */
export const resolvedTaskAnalysisSchema = taskAnalysisSchema
  .extend({
    task_type: b2FirstTaskTypeSchema,
    source_task_text: z.string().min(1),
    target_reader_resolution: targetReaderResolutionSchema,
    provenance: taskAnalysisProvenanceSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.target_reader === null && data.target_reader_resolution.source !== 'unresolved') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a missing target reader must be reported as unresolved, not filled in',
        path: ['target_reader_resolution', 'source'],
      });
    }
    if (data.target_reader !== null && data.target_reader_resolution.source === 'unresolved') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'an unresolved target reader cannot carry a value',
        path: ['target_reader'],
      });
    }

    const coreExpectations = new Set(
      data.core_genre_expectations.map((e) => normaliseRequirementText(e.expectation)),
    );
    data.mandatory_genre_conventions.forEach((convention, index) => {
      if (coreExpectations.has(normaliseRequirementText(convention.convention))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'a core genre expectation cannot be restated as a binary mandatory convention',
          path: ['mandatory_genre_conventions', index],
        });
      }
    });

    const seenPoints = new Set<string>();
    data.mandatory_content_points.forEach((point, index) => {
      const key = normaliseRequirementText(point.point);
      if (seenPoints.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'duplicate mandatory content point',
          path: ['mandatory_content_points', index],
        });
      }
      seenPoints.add(key);
    });

    const recommended = new Set(
      data.recommended_genre_features.map((f) => normaliseRequirementText(f.feature)),
    );
    data.mandatory_genre_conventions.forEach((convention, index) => {
      if (
        recommended.has(normaliseRequirementText(convention.convention)) &&
        convention.origin !== 'task_wording'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'a Doc 01 recommendation cannot appear as a mandatory convention unless the task wording requires it',
          path: ['mandatory_genre_conventions', index],
        });
      }
    });
  });

/**
 * Keys that must never appear anywhere in a task analysis. Layer 1 describes
 * what the task requires; it never scores and never routes a requirement to a
 * Cambridge criterion — that is Layer 3's decision.
 */
export const FORBIDDEN_TASK_ANALYSIS_KEYS = [
  'mark',
  'marks',
  'band',
  'bands',
  'score',
  'scores',
  'raw_total',
  'criterion',
  'criteria',
  'primary_criterion',
  'score_effect',
  'band_effect',
  'deduction',
  'penalty',
  'feedback',
  'strengths',
  'improvements',
  'student_answer',
  'candidate_answer',
  'learner_history',
  'learner_context',
  'prior_scores',
] as const;

export function normaliseRequirementText(value: string): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Future task-analysis cache identity (Doc 07 Phase 1 test #11).
 * Cache implementation is Phase 2 — contract only here.
 */
export const taskAnalysisCacheIdentitySchema = z
  .object({
    task_content_hash: z.string().min(1),
    task_type: z.string().min(1),
    task_requirements_version: z.string().min(1),
    task_analysis_prompt_version: z.string().min(1),
    task_analysis_schema_version: z.string().min(1),
    model_config: modelConfigSnapshotSchema,
  })
  .strict();

// ---------------------------------------------------------------------------
// Observations (Doc 05 §5)
// ---------------------------------------------------------------------------

/**
 * Internal pedagogical taxonomy (Doc 02). Deliberately NOT equal to the six
 * Interactive Writing Map `category_key` values, which are a Doc 04 UI concern.
 * No colours, no criterion routing.
 */
export const observationDomainSchema = z.enum([
  'grammar',
  'punctuation',
  'vocabulary_collocation',
  'spelling',
  'organisation_cohesion',
  'content_development',
  'communicative_appropriacy',
  'naturalness',
  'strength',
]);

/** Doc 02 §5.2: meaning clear → reader hesitates → meaning unreliable → meaning blocked. */
export const communicativeImpactSchema = z.enum([
  'blocked',
  'unreliable',
  'impaired',
  'minor',
  'none',
]);

/**
 * Current-script frequency only. Phase 3 receives no learner history, so
 * `confirmed_historical_recurrence` is structurally unrepresentable here; it
 * belongs to post-assessment history enrichment.
 */
export const withinScriptFrequencySchema = z.enum([
  'isolated',
  'repeated_in_script',
  'systematic_in_script',
  'not_applicable',
]);

export const observationTypeSchema = z.enum([
  'accuracy_error',
  'clarity_issue',
  'naturalness_issue',
  'appropriacy_issue',
  'organisation_issue',
  'development_opportunity',
  'strength',
]);

export const observationPolaritySchema = z.enum(['positive', 'negative', 'neutral']);

export const observationScopeSchema = z.enum(['local', 'global']);

/** Doc 02 §3.5 — never a longitudinal claim, only current-script evidence. */
export const knowledgeStatusSchema = z.enum([
  'likely_lapse',
  'likely_knowledge_gap',
  'uncertain',
]);

/** Doc 02 §5.2 "Foundational importance" row. */
export const foundationalImportanceSchema = z.enum([
  'minor_refinement',
  'target_level_control',
  'basic_expected_form',
  'not_applicable',
]);

/** Doc 02 §5.2 "Transferability" row. */
export const transferabilitySchema = z.enum([
  'very_local',
  'similar_tasks',
  'across_writing_and_use_of_english',
]);

/**
 * Base strategy derivable from the current script alone (Doc 02 §5.3).
 * `consolidation`, `exam_readiness` and `exploration` need course-stage or
 * learner history, which Phase 3 does not receive, so they are not claimable.
 */
export const baseCorrectionStrategySchema = z.enum(['comprehensive', 'focused']);

/** Full Doc 02 §5.3 mode set — reserved for a later contextual overlay, not Phase 3. */
export const contextualCorrectionModeSchema = z.enum([
  'comprehensive',
  'focused',
  'consolidation',
  'exam_readiness',
  'exploration',
]);

export const boundQuoteSchema = z
  .object({
    quote: z.string().min(1),
    occurrence_index: z.number().int().min(0),
    span_start: z.number().int().min(0),
    span_end: z.number().int().min(0),
    bound_text: z.string().min(1),
  })
  .strict();

/**
 * A suggestion may never change what the learner said (Doc 02 R02, R53, §5.4).
 * The two literals make an admitted meaning change structurally unrepresentable.
 */
export const voicePreservationSchema = z
  .object({
    preserves_stance: z.literal(true),
    preserves_central_meaning: z.literal(true),
    register_is_the_target: z.boolean(),
  })
  .strict();

export const learningOpportunitySchema = z
  .object({
    transferable_point: z.string().min(1),
    teaching_prompt: z.string().min(1).optional(),
  })
  .strict();

export const TEACHER_DNA_RULE_ID_PATTERN = /^R(0[1-9]|[1-5][0-9]|60)$/;

export const observationBindingStatusSchema = z.enum([
  'bound',
  'global_no_local_span',
  'unbindable',
]);

export const observationSchema = z
  .object({
    observation_id: z.string().min(1),
    domain: observationDomainSchema,
    observation_type: observationTypeSchema,
    polarity: observationPolaritySchema,
    scope: observationScopeSchema,
    /** The learner's own words, as emitted by the model (Phase 1 name for `exact_quote`). */
    text_quote: z.string().min(1).nullable(),
    occurrence_index: z.number().int().min(0).optional(),
    span_start: z.number().int().min(0).optional(),
    span_end: z.number().int().min(0).optional(),
    /** The exact substring of the candidate response at [span_start, span_end). */
    bound_text: z.string().min(1).optional(),
    binding_status: observationBindingStatusSchema,
    renderable_locally: z.boolean(),
    supporting_evidence: z.array(boundQuoteSchema).default([]),
    intended_meaning: z.string().min(1).optional(),
    diagnosis: z.string().min(1),
    suggested_change: z.string().min(1).optional(),
    voice_preservation: voicePreservationSchema.optional(),
    communicative_impact: communicativeImpactSchema,
    /** Deterministic: true only when communicative_impact is `blocked`. */
    meaning_blocking: z.boolean(),
    within_script_frequency: withinScriptFrequencySchema,
    knowledge_status: knowledgeStatusSchema,
    foundational_importance: foundationalImportanceSchema,
    transferability: transferabilitySchema,
    pedagogical_priority: pedagogicalPrioritySchema,
    confidence: confidenceSchema,
    ambitious_attempt: z.boolean(),
    learning_opportunity: learningOpportunitySchema.optional(),
    teacher_dna_rule_ids: z.array(z.string().regex(TEACHER_DNA_RULE_ID_PATTERN)),
    pattern_key: z.string().min(1).optional(),
    pattern_group_id: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.meaning_blocking !== (data.communicative_impact === 'blocked')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'meaning_blocking must be derived from communicative_impact',
        path: ['meaning_blocking'],
      });
    }
    if (data.suggested_change && !data.voice_preservation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a suggested change must record that the learner’s stance and meaning are preserved',
        path: ['voice_preservation'],
      });
    }
    if (data.scope === 'local' && data.binding_status === 'bound') {
      if (data.span_start === undefined || data.span_end === undefined || !data.bound_text) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'a bound local observation requires resolved offsets and the bound text',
          path: ['span_start'],
        });
      }
    }
    if (data.binding_status !== 'bound' && data.renderable_locally) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only a bound observation can be rendered locally',
        path: ['renderable_locally'],
      });
    }
    if (data.polarity === 'positive' && data.observation_type !== 'strength') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a positive observation must be typed as a strength',
        path: ['observation_type'],
      });
    }
  });

export const patternGroupSchema = z
  .object({
    pattern_group_id: z.string().min(1),
    pattern_key: z.string().min(1),
    domain: observationDomainSchema,
    observation_ids: z.array(z.string().min(1)).min(2),
  })
  .strict();

export const bindingFailureSchema = z
  .object({
    observation_id: z.string().min(1),
    quote: z.string().min(1),
    occurrence_index: z.number().int().min(0),
    reason: z.enum(['quote_not_found', 'occurrence_out_of_range']),
  })
  .strict();

export const observationProvenanceSchema = z
  .object({
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    teacher_dna_version: z.string().min(1),
    task_requirements_version: z.string().min(1),
    observation_prompt_version: z.string().min(1),
    doc_versions: sourceDocVersionsSchema,
    model_config: modelConfigSnapshotSchema,
    candidate_response_hash: z.string().min(1),
    task_fingerprint: z.string().min(1),
    llm_calls: z.number().int().min(0),
    /** Structural guarantee that this call ran without learner history. */
    learner_history_available: z.literal(false),
  })
  .strict();

export const observationExtractionResultSchema = z
  .object({
    status: z.enum(['complete', 'incomplete']),
    incomplete_reason: z.string().min(1).optional(),
    base_correction_strategy: baseCorrectionStrategySchema,
    principal_focus: observationDomainSchema.nullable(),
    strategy_rationale: z.string().min(1),
    observations: z.array(observationSchema),
    pattern_groups: z.array(patternGroupSchema).default([]),
    binding_failures: z.array(bindingFailureSchema).default([]),
    provenance: observationProvenanceSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.base_correction_strategy === 'focused' && !data.principal_focus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a focused strategy must name its principal pedagogical focus',
        path: ['principal_focus'],
      });
    }
    if (data.base_correction_strategy === 'comprehensive' && data.principal_focus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a comprehensive strategy has no single principal focus',
        path: ['principal_focus'],
      });
    }
    const ids = data.observations.map((o) => o.observation_id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'observation ids must be unique',
        path: ['observations'],
      });
    }
  });

/**
 * Keys that must never appear in a Phase 3 observation. Layer 2 produces
 * evidence and pedagogical diagnosis; it never scores and never decides which
 * Cambridge criterion an observation belongs to.
 */
export const FORBIDDEN_OBSERVATION_KEYS = [
  'criterion',
  'criteria',
  'primary_criterion',
  'cambridge_criterion',
  'mark',
  'marks',
  'score',
  'scores',
  'band',
  'bands',
  'band_effect',
  'score_effect',
  'raw_total',
  'deduction',
  'penalty',
  'cefr',
  'passed',
  'readiness',
  'word_count_penalty',
  'score_smoothing',
] as const;

/** Longitudinal claims Phase 3 cannot support, because it has no learner history. */
export const FORBIDDEN_HISTORY_CLAIM_PATTERNS: RegExp[] = [
  /previously taught/i,
  /already knows?\b/i,
  /has not learn(ed|t)/i,
  /hasn't learn(ed|t)/i,
  /recurring learner error/i,
  /confirmed recurring/i,
  /since (your|the|his|her|their) (last|previous)/i,
  /improved since/i,
  /in (your|his|her|their) previous (writing|essay|task|work)/i,
  /you have made this mistake before/i,
  /as we saw last time/i,
];

// ---------------------------------------------------------------------------
// Cambridge assessment (Doc 05 §6)
// ---------------------------------------------------------------------------

/**
 * Doc 03 §1.2: bands 2 and 4 are mixed profiles, not midpoints and not
 * "the band above minus one mistake". Both neighbouring bands must therefore
 * be evidenced concretely, which is why neither side is optional.
 */
export const adjacentBandEvidenceSchema = z
  .object({
    lower_band_reference: z.string().min(1),
    lower_band_evidence: z.string().min(1),
    higher_band_reference: z.string().min(1),
    higher_band_evidence: z.string().min(1),
  })
  .strict();

/** Doc 03 rule ids: A, C, CA, O, L, X, S, SP and N families. Never Teacher DNA `Rnn`. */
export const DOC03_RULE_ID_PATTERN = /^(A|C|CA|O|L|X|S|SP|N)\d{2}$/;

export const assessmentConfidenceSchema = confidenceSchema;

export const criterionDecisionRecordSchema = z
  .object({
    criterion: cambridgeCriterionKeySchema,
    mark: criterionMarkSchema,
    /** The official descriptor or neighbouring-band profile used as the comparison. */
    band_anchor: z.string().min(1),
    positive_evidence: z.array(z.string().min(1)),
    limiting_evidence: z.array(z.string().min(1)),
    /** Quotes bound by code to the candidate response — never model offsets. */
    text_evidence: z.array(boundQuoteSchema).min(1),
    why_not_higher: z.string().min(1),
    why_not_lower: z.string().min(1).optional(),
    adjacent_band_evidence: adjacentBandEvidenceSchema.optional(),
    /** Deterministic: band 5 is the top band, so there is no higher band to reach. */
    band_ceiling_reached: z.boolean(),
    /** Deterministic: band 0 is the bottom band, so there is no lower band to exceed. */
    band_floor_reached: z.boolean(),
    confidence: assessmentConfidenceSchema,
    confidence_reason: z.string().min(1).optional(),
    source_rule_ids: z.array(z.string().regex(DOC03_RULE_ID_PATTERN)).min(1),
    /** Phase-3 observation ids that helped locate evidence. Discovery metadata only. */
    evidence_observation_ids: z.array(z.string().min(1)).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.band_ceiling_reached !== (data.mark === 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'band_ceiling_reached must be derived from the mark',
        path: ['band_ceiling_reached'],
      });
    }
    if (data.band_floor_reached !== (data.mark === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'band_floor_reached must be derived from the mark',
        path: ['band_floor_reached'],
      });
    }
    if (data.mark >= 1 && !data.why_not_lower?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'why_not_lower is required for marks 1–5',
        path: ['why_not_lower'],
      });
    }
    // Doc 03 §8: band 0 is the bottom of the scale; there is no lower band to compare with.
    if (data.mark === 0 && data.why_not_lower) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'band 0 has no lower band to compare with',
        path: ['why_not_lower'],
      });
    }
    if (data.mark === 2 || data.mark === 4) {
      if (!data.adjacent_band_evidence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bands 2 and 4 require concrete evidence from both neighbouring bands',
          path: ['adjacent_band_evidence'],
        });
      }
    } else if (data.adjacent_band_evidence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'adjacent_band_evidence belongs to the mixed bands 2 and 4 only',
        path: ['adjacent_band_evidence'],
      });
    }
    // Doc 03 §9.4: every mark carries positive evidence; only a fully supported
    // band 5 may state that no meaningful limiting evidence exists.
    if (data.mark >= 1 && data.positive_evidence.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marks 1–5 require at least one positive evidence statement',
        path: ['positive_evidence'],
      });
    }
    if (data.mark >= 1 && data.mark <= 4 && data.limiting_evidence.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marks 1–4 require at least one limiting evidence statement',
        path: ['limiting_evidence'],
      });
    }
    if (data.confidence !== 'high' && !data.confidence_reason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'confidence below high must record its reason',
        path: ['confidence_reason'],
      });
    }
  });

export const assessmentCriteriaSchema = z
  .object({
    content: criterionDecisionRecordSchema,
    communicative_achievement: criterionDecisionRecordSchema,
    organisation: criterionDecisionRecordSchema,
    language: criterionDecisionRecordSchema,
  })
  .strict();

export type AssessmentCriteria = z.infer<typeof assessmentCriteriaSchema>;

export function sumCriterionMarks(criteria: AssessmentCriteria): number {
  return (
    criteria.content.mark +
    criteria.communicative_achievement.mark +
    criteria.organisation.mark +
    criteria.language.mark
  );
}

function refineAssessmentCore(
  data: {
    status: 'complete' | 'incomplete';
    incomplete_reason?: string;
    criteria?: AssessmentCriteria;
  },
  ctx: z.RefinementCtx,
) {
  if (data.criteria) {
    for (const key of CAMBRIDGE_CRITERION_KEYS) {
      if (data.criteria[key].criterion !== key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `criteria.${key}.criterion must equal "${key}"`,
          path: ['criteria', key, 'criterion'],
        });
      }
    }
  }
  if (data.status === 'complete' && !data.criteria) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'a complete assessment requires all four criterion decisions',
      path: ['criteria'],
    });
  }
  // Doc 03 §8.2: an unassessable task yields an incomplete state, never a guessed
  // profile — and never 0/20, which would be a real Cambridge judgement.
  if (data.status === 'incomplete' && data.criteria) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'an incomplete assessment must not carry criterion marks',
      path: ['criteria'],
    });
  }
  if (data.status === 'incomplete' && !data.incomplete_reason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'incomplete_reason is required when status is incomplete',
      path: ['incomplete_reason'],
    });
  }
}

const assessmentRecordCoreSchema = z
  .object({
    status: z.enum(['complete', 'incomplete']),
    incomplete_reason: z.string().optional(),
    criteria: assessmentCriteriaSchema.optional(),
    max_total: z.literal(20),
    single_task_scale_claim_allowed: z.literal(false),
    overall_confidence: assessmentConfidenceSchema.optional(),
    /** Doc 03 §8.1 — contextual evidence only. It carries no penalty of any kind. */
    word_count: z.number().int().min(0).optional(),
    word_count_penalty_applied: z.literal(false).optional(),
  })
  .strict();

/**
 * Model / upstream input — raw_total is intentionally absent.
 * Code computes raw_total as the deterministic sum (Doc 05 §6.1).
 */
export const assessmentRecordInputSchema = assessmentRecordCoreSchema.superRefine(
  refineAssessmentCore,
);

export const assessmentRecordSchema = assessmentRecordCoreSchema
  .extend({
    raw_total: z.number().int().min(0).max(20).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    refineAssessmentCore(data, ctx);
    if (!data.criteria) {
      if (data.raw_total !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'an incomplete assessment has no raw total',
          path: ['raw_total'],
        });
      }
      return;
    }
    const sum = sumCriterionMarks(data.criteria);
    if (data.raw_total !== sum) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `raw_total must equal the sum of the four criterion marks (${sum})`,
        path: ['raw_total'],
      });
    }
  });

/** The model never owns the total: code sums the four marks and any model total is discarded. */
export function finalizeAssessmentRecord(
  input: z.infer<typeof assessmentRecordInputSchema>,
): z.infer<typeof assessmentRecordSchema> {
  if (!input.criteria) return assessmentRecordSchema.parse({ ...input });
  const raw_total = sumCriterionMarks(input.criteria);
  return assessmentRecordSchema.parse({ ...input, raw_total });
}

export const assessmentProvenanceSchema = z
  .object({
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    cambridge_assessment_version: z.string().min(1),
    task_requirements_version: z.string().min(1),
    assessment_prompt_version: z.string().min(1),
    doc_versions: sourceDocVersionsSchema,
    model_config: modelConfigSnapshotSchema,
    candidate_response_hash: z.string().min(1),
    task_fingerprint: z.string().min(1),
    llm_calls: z.number().int().min(0),
    /** Structural guarantee that no learner history reached the marks. */
    learner_history_available: z.literal(false),
    /** How many Phase-3 observations survived independent re-binding. */
    observation_evidence_index_size: z.number().int().min(0),
    /** Golden calibration (R3) is not closed by unit tests. */
    calibration_status: z.literal('not_calibrated'),
  })
  .strict();

export const assessmentResultSchema = z
  .object({
    assessment_record: assessmentRecordSchema,
    provenance: assessmentProvenanceSchema,
  })
  .strict();

/**
 * Phase-3 pedagogical weighting must never become a scoring weight, and no
 * learner-history or presentation field may reach Layer 3.
 */
export const FORBIDDEN_ASSESSMENT_INPUT_KEYS = [
  'pedagogical_priority',
  'foundational_importance',
  'transferability',
  'learning_opportunity',
  'ambitious_attempt',
  'knowledge_status',
  'base_correction_strategy',
  'correction_strategy',
  'principal_focus',
  'teacher_dna_rule_ids',
  'within_script_frequency',
  'pattern_group_id',
  'cefr',
  'passed',
  'readiness',
  'level_indicator',
] as const;

/** Doc 03 §12.1 — behaviours that must never appear in a scoring rationale. */
const FORBIDDEN_ASSESSMENT_TEXT_PATTERNS: RegExp[] = [
  /\b\d+\s+(errors?|mistakes?|connectors?|linkers?|paragraphs?)\b/i,
  /\b(error|mistake|connector|linker|paragraph)\s+count\b/i,
  /\bnumber of (errors?|mistakes?|connectors?|linkers?|paragraphs?)\b/i,
  /\bcounts? (the )?(errors?|connectors?|paragraphs?)\b/i,
  /\bcefr\b/i,
  /\bpass(ed|es)?\s*\/\s*fail(ed|s)?\b/i,
  /\bpass(ed|es)? or fail(ed|s)?\b/i,
  /\bpass mark\b/i,
  /\b12\s*\/\s*20\b/,
  /\breadiness\b/i,
  /\bhalf[- ]band\b/i,
  /\bband\s*6\b/i,
  /\bword[- ]count (penalty|deduction)\b/i,
  /\btitle penalty\b/i,
  /\bsmooth(ed|ing)? the (marks?|scores?|profile)\b/i,
  /\bcambridge english scale\b/i,
];

export function findForbiddenAssessmentBehaviour(value: unknown): string[] {
  const forbidden = new Set<string>([
    ...FORBIDDEN_ASSESSMENT_INPUT_KEYS,
    ...FORBIDDEN_ASSESSMENT_HISTORY_KEYS,
    ...FORBIDDEN_STYLING_KEYS,
  ]);
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    if (forbidden.has(leaf.toLowerCase())) hits.push(path);
  }
  for (const text of collectStringValues(value)) {
    for (const pattern of FORBIDDEN_ASSESSMENT_TEXT_PATTERNS) {
      if (pattern.test(text)) hits.push(`text:${pattern.source}`);
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Feedback payload (Doc 05 §9, Doc 04)
// ---------------------------------------------------------------------------

/**
 * What the annotation is doing for the learner. It drives explanation depth,
 * not colour: a spelling `correction` is one line, a `teaching_prompt` opens a
 * question because the meaning cannot be safely guessed.
 */
export const annotationFeedbackKindSchema = z.enum([
  'correction',
  'suggestion',
  'explanation',
  'teaching_prompt',
  'strength',
]);

export const writingAnnotationSchema = z
  .object({
    annotation_id: z.string().min(1),
    observation_id: z.string().min(1),
    category_key: writingCategoryKeySchema,
    span_start: z.number().int().min(0),
    span_end: z.number().int().min(0),
    /** Copied from the validated observation — the composer never retypes it. */
    original_text: z.string().min(1),
    feedback_kind: annotationFeedbackKindSchema,
    local_explanation: z.string().min(1),
    suggested_change: z.string().min(1).optional(),
    teaching_prompt: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.span_end <= data.span_start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'an annotation span must cover at least one character',
        path: ['span_end'],
      });
    }
    // Praise never carries a correction: "here is what worked, now change it"
    // is the one message a strength must not send.
    if (data.feedback_kind === 'strength' && data.suggested_change) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a strength annotation cannot carry a correction',
        path: ['suggested_change'],
      });
    }
    if (data.feedback_kind === 'correction' && !data.suggested_change) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a correction must state the corrected form',
        path: ['suggested_change'],
      });
    }
    if (data.feedback_kind === 'teaching_prompt' && !data.teaching_prompt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a teaching prompt must ask something the learner can act on',
        path: ['teaching_prompt'],
      });
    }
  });

export const openingStrengthSchema = z
  .object({
    strength_id: z.string().min(1),
    observation_id: z.string().min(1),
    headline: z.string().min(1),
    /** Says what is effective and why — vague praise fails validation. */
    explanation: z.string().min(1),
  })
  .strict();

/** Doc 04 progressive disclosure: the summary is the card, this is the panel. */
export const criterionExpandedFeedbackSchema = z
  .object({
    what_worked: z.string().min(1),
    what_limited_the_band: z.string().min(1),
    evidence: z.array(boundQuoteSchema),
    next_focus: z.string().min(1),
  })
  .strict();

export const criterionFeedbackSchema = z
  .object({
    criterion: cambridgeCriterionKeySchema,
    mark: criterionMarkSchema,
    summary: z.string().min(1),
    expanded: criterionExpandedFeedbackSchema,
  })
  .strict();

export const REVIEW_NEXT_SOURCES = [
  'observation',
  'assessment_limitation',
  'history_overlay',
] as const;

export const reviewNextItemSchema = z
  .object({
    review_id: z.string().min(1),
    concept: z.string().min(1),
    reason: z.string().min(1),
    source: z.enum(REVIEW_NEXT_SOURCES),
    /** Observation ids, criterion keys or history evidence ids, per `source`. */
    source_ids: z.array(z.string().min(1)).min(1),
    /** v1 ships no links and invents no DRALO materials. */
    resource_key: z.null(),
  })
  .strict();

export const globalResultSchema = z
  .object({
    /** Frozen copy of the four final marks — the composer may not edit them. */
    criteria: z
      .object({
        content: criterionMarkSchema,
        communicative_achievement: criterionMarkSchema,
        organisation: criterionMarkSchema,
        language: criterionMarkSchema,
      })
      .strict(),
    raw_total: z.number().int().min(0).max(20),
    max_total: z.literal(20),
    level_indicator: z.null(),
    single_task_scale_claim_allowed: z.literal(false),
    disclaimer: z.literal(DRALO_RESULT_DISCLAIMER),
  })
  .strict()
  .superRefine((data, ctx) => {
    const sum =
      data.criteria.content +
      data.criteria.communicative_achievement +
      data.criteria.organisation +
      data.criteria.language;
    if (sum !== data.raw_total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw_total must be the exact sum of the four frozen marks',
        path: ['raw_total'],
      });
    }
  });

// ---------------------------------------------------------------------------
// Post-assessment learner-history overlay (Phase 6)
// ---------------------------------------------------------------------------

export const improvementSignalSchema = z.enum(['improved', 'unchanged', 'regressed', 'unknown']);

/**
 * History arrives strictly AFTER the marks are frozen and never touches them.
 * It is an overlay keyed by observation id rather than a mutation, so the base
 * observations stay byte-identical and the boundary is visible in the types.
 */
export const historyOverlayEntrySchema = z
  .object({
    observation_id: z.string().min(1),
    confirmed_historical_recurrence: z.boolean(),
    previously_taught: z.boolean(),
    improvement_signal: improvementSignalSchema,
    history_evidence_ids: z.array(z.string().min(1)),
  })
  .strict()
  .superRefine((data, ctx) => {
    const claims =
      data.confirmed_historical_recurrence ||
      data.previously_taught ||
      data.improvement_signal !== 'unknown';
    // No evidence, no longitudinal claim. Repetition inside one script is not history.
    if (claims && data.history_evidence_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a longitudinal claim must cite the history evidence it rests on',
        path: ['history_evidence_ids'],
      });
    }
  });

export const learnerHistoryContextSchema = z
  .object({
    learner_reference: z.string().min(1).optional(),
    entries: z.array(historyOverlayEntrySchema),
  })
  .strict();

export const feedbackPayloadSchema = z
  .object({
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    provenance: versionProvenanceSchema,
    global_result: globalResultSchema,
    criterion_feedback: z.array(criterionFeedbackSchema).length(4),
    opening_strengths: z.array(openingStrengthSchema),
    annotations: z.array(writingAnnotationSchema),
    review_next: z.array(reviewNextItemSchema),
    final_cta: z.literal(FINAL_CTA),
    resource_key: z.null(),
    /** True only when a verified overlay was supplied; gates longitudinal wording. */
    learner_history_applied: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const criteriaInOrder = CAMBRIDGE_CRITERION_KEYS.map((key) => {
      const row = data.criterion_feedback.find((c) => c.criterion === key);
      return row;
    });
    if (criteriaInOrder.some((row) => !row)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'criterion_feedback must contain exactly one entry per Cambridge criterion',
        path: ['criterion_feedback'],
      });
    }
    if (data.global_result.raw_total !== data.criterion_feedback.reduce((s, c) => s + c.mark, 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'global_result.raw_total must equal the sum of criterion_feedback marks',
        path: ['global_result', 'raw_total'],
      });
    }
    for (const row of data.criterion_feedback) {
      if (row.mark !== data.global_result.criteria[row.criterion]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `criterion_feedback.${row.criterion}.mark must equal the frozen assessment mark`,
          path: ['criterion_feedback'],
        });
      }
    }
    const annotationIds = new Set<string>();
    for (const annotation of data.annotations) {
      if (annotationIds.has(annotation.annotation_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate annotation id ${annotation.annotation_id}`,
          path: ['annotations'],
        });
      }
      annotationIds.add(annotation.annotation_id);
    }
  });

// ---------------------------------------------------------------------------
// Validation + execution envelopes
// ---------------------------------------------------------------------------

/** Which engine layer produced the artefact being validated. */
export const VALIDATION_STAGES = [
  'task_analysis',
  'observations',
  'assessment',
  'feedback',
  'engine_output',
] as const;

export const validationStageSchema = z.enum(VALIDATION_STAGES);

/**
 * `hard_failure` — the output is architecturally invalid and regenerating it
 * would not help. `retryable_generation_failure` — the model produced something
 * a fresh generation could plausibly fix. `non_blocking_warning` — worth
 * recording, never a reason to reject.
 */
export const validationSeveritySchema = z.enum([
  'hard_failure',
  'retryable_generation_failure',
  'non_blocking_warning',
]);

export const validationRuleFailureSchema = z
  .object({
    rule_id: z.string().min(1),
    stage: validationStageSchema,
    severity: validationSeveritySchema,
    message: z.string().min(1),
    path: z.string().min(1).optional(),
  })
  .strict();

/**
 * `validation_status` describes the ENGINE OUTPUT, never the learner. It is not
 * a Cambridge pass, not 12/20 and not a CEFR readiness claim — the deliberate
 * rename away from `passed` exists so the value cannot leak into progression.
 */
export const validationResultSchema = z
  .object({
    validation_status: z.enum(['passed', 'failed', 'retry_required']),
    stage: validationStageSchema,
    attempt: z.number().int().min(1),
    failed_rules: z.array(validationRuleFailureSchema),
    warnings: z.array(validationRuleFailureSchema),
    retry_target: validationStageSchema.optional(),
    retry_reason: z.string().min(1).optional(),
    validated_at: z.string().min(1),
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    validator_version: z.string().min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.failed_rules.some((rule) => rule.severity === 'non_blocking_warning')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a non-blocking warning belongs in warnings, not failed_rules',
        path: ['failed_rules'],
      });
    }
    if (data.warnings.some((rule) => rule.severity !== 'non_blocking_warning')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'warnings may only contain non-blocking warnings',
        path: ['warnings'],
      });
    }
    if (data.validation_status === 'passed' && data.failed_rules.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a passing validation cannot carry failed rules',
        path: ['failed_rules'],
      });
    }
    if (data.validation_status !== 'passed' && data.failed_rules.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a non-passing validation must name the rules that failed',
        path: ['failed_rules'],
      });
    }
    if (data.validation_status === 'retry_required') {
      if (!data.retry_target) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'a retry request must name the stage to regenerate',
          path: ['retry_target'],
        });
      }
      if (!data.retry_reason?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'a retry request must record its reason',
          path: ['retry_reason'],
        });
      }
      if (data.failed_rules.some((rule) => rule.severity === 'hard_failure')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'a hard failure cannot be resolved by regeneration',
          path: ['validation_status'],
        });
      }
    }
    if (data.validation_status !== 'retry_required' && (data.retry_target || data.retry_reason)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'retry metadata belongs to a retry request only',
        path: ['retry_target'],
      });
    }
  });

export const engineExecutionSchema = z
  .object({
    execution_id: z.string().optional(),
    submission_id: z.string().optional(),
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    doc_versions: sourceDocVersionsSchema,
    prompt_versions: promptVersionsSchema,
    model_config: modelConfigSnapshotSchema,
    status: z.enum(['complete', 'incomplete', 'failed']),
    incomplete_reason: z.string().optional(),
    task_analysis: taskAnalysisSchema.optional(),
    observations: z.array(observationSchema).optional(),
    assessment_record: assessmentRecordSchema.optional(),
    feedback_payload: feedbackPayloadSchema.optional(),
    validation_result: validationResultSchema.optional(),
    latency_ms: z.number().int().min(0).optional(),
    tokens: z
      .object({
        input: z.number().int().min(0).optional(),
        output: z.number().int().min(0).optional(),
        total: z.number().int().min(0).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Deterministic helpers (Phase 1 — used by tests and future validators)
// ---------------------------------------------------------------------------

export function buildDefaultVersionProvenance(
  modelConfig: z.infer<typeof modelConfigSnapshotSchema>,
): z.infer<typeof versionProvenanceSchema> {
  return {
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    doc_versions: { ...SOURCE_DOC_VERSIONS },
    prompt_versions: { ...PROMPT_VERSIONS },
    model_config: modelConfig,
  };
}

export function buildTaskAnalysisCacheIdentity(params: {
  task_content_hash: string;
  task_type: string;
  task_requirements_version?: string;
  task_analysis_prompt_version?: string;
  task_analysis_schema_version?: string;
  model_config: z.infer<typeof modelConfigSnapshotSchema>;
}): z.infer<typeof taskAnalysisCacheIdentitySchema> {
  return taskAnalysisCacheIdentitySchema.parse({
    task_content_hash: params.task_content_hash,
    task_type: params.task_type,
    task_requirements_version:
      params.task_requirements_version ?? SOURCE_DOC_VERSIONS.task_requirements,
    task_analysis_prompt_version:
      params.task_analysis_prompt_version ?? PROMPT_VERSIONS.task_analysis,
    task_analysis_schema_version:
      params.task_analysis_schema_version ?? TASK_ANALYSIS_SCHEMA_VERSION,
    model_config: params.model_config,
  });
}

/**
 * Opening strengths cardinality (Doc 02 / Phase 1 test #8).
 * No blind 2–3 quota: cardinality follows eligible genuine strengths only.
 */
export function validateOpeningStrengthsCardinality(
  openingStrengths: z.infer<typeof openingStrengthSchema>[],
  eligibleGenuineStrengthCount: number,
): boolean {
  const count = openingStrengths.length;
  if (eligibleGenuineStrengthCount <= 0) return count === 0;
  if (eligibleGenuineStrengthCount === 1) return count === 1;
  return count >= 2 && count <= 3;
}

/** Each opening strength must reference a strength-category annotation — blocks manufactured praise. */
export function validateOpeningStrengthsEvidence(
  openingStrengths: z.infer<typeof openingStrengthSchema>[],
  annotations: z.infer<typeof writingAnnotationSchema>[],
  strengthObservationIds: Set<string>,
): boolean {
  const strengthAnnotationObservationIds = new Set(
    annotations
      .filter((a) => a.category_key === 'strength')
      .map((a) => a.observation_id),
  );
  return openingStrengths.every(
    (s) =>
      strengthObservationIds.has(s.observation_id) &&
      strengthAnnotationObservationIds.has(s.observation_id),
  );
}

function collectObjectKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectObjectKeys(item, `${prefix}[${index}]`));
  }
  const obj = value as Record<string, unknown>;
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    keys.push(path);
    keys.push(...collectObjectKeys(obj[key], path));
  }
  return keys;
}

export function findForbiddenV3FieldKeys(value: unknown): string[] {
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    const normalised = leaf.toLowerCase();
    if ((FORBIDDEN_V3_FIELD_KEYS as readonly string[]).includes(normalised)) {
      hits.push(path);
    }
  }
  return hits;
}

export function findForbiddenStylingKeys(value: unknown): string[] {
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    const normalised = leaf.toLowerCase();
    if ((FORBIDDEN_STYLING_KEYS as readonly string[]).includes(normalised)) {
      hits.push(path);
    }
  }
  return hits;
}

export function findForbiddenTaskAnalysisKeys(value: unknown): string[] {
  const forbidden = new Set<string>([
    ...FORBIDDEN_TASK_ANALYSIS_KEYS,
    ...FORBIDDEN_STYLING_KEYS,
    ...FORBIDDEN_V3_FIELD_KEYS,
  ]);
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    if (forbidden.has(leaf.toLowerCase())) hits.push(path);
  }
  return hits;
}

export function findForbiddenObservationKeys(value: unknown): string[] {
  const forbidden = new Set<string>([
    ...FORBIDDEN_OBSERVATION_KEYS,
    ...FORBIDDEN_STYLING_KEYS,
  ]);
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    if (forbidden.has(leaf.toLowerCase())) hits.push(path);
  }
  return hits;
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(collectStringValues);
  return Object.values(value as Record<string, unknown>).flatMap(collectStringValues);
}

/** Scoring vocabulary that must never appear in Layer 2 prose. */
const SCORING_LEAKAGE_PATTERNS: RegExp[] = [
  /\braw[_ ]total\b/i,
  /\b\d{1,2}\s*\/\s*20\b/,
  /\bband\s*[0-5]\b/i,
  /\bcefr\b/i,
  /\bB2 standard\b/i,
  /\bpass mark\b/i,
  /\b(deduct|deducted|deduction)\b/i,
  /\bmarks? out of\b/i,
  /\bword[- ]count penalty\b/i,
];

export function findScoringLeakage(value: unknown): string[] {
  const hits = findForbiddenObservationKeys(value);
  for (const text of collectStringValues(value)) {
    for (const pattern of SCORING_LEAKAGE_PATTERNS) {
      if (pattern.test(text)) hits.push(`text:${pattern.source}`);
    }
  }
  return hits;
}

export function findHistoryClaims(value: unknown): string[] {
  const hits: string[] = [];
  for (const text of collectStringValues(value)) {
    for (const pattern of FORBIDDEN_HISTORY_CLAIM_PATTERNS) {
      if (pattern.test(text)) hits.push(`text:${pattern.source}`);
    }
  }
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    if ((FORBIDDEN_ASSESSMENT_HISTORY_KEYS as readonly string[]).includes(leaf.toLowerCase())) {
      hits.push(path);
    }
  }
  return hits;
}

export function findForbiddenAssessmentHistoryKeys(value: unknown): string[] {
  const hits: string[] = [];
  for (const path of collectObjectKeys(value)) {
    const leaf = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? path;
    const normalised = leaf.toLowerCase();
    if ((FORBIDDEN_ASSESSMENT_HISTORY_KEYS as readonly string[]).includes(normalised)) {
      hits.push(path);
    }
  }
  return hits;
}
