/**
 * Feedback composition (Layer 4 — Doc 04).
 *
 * The assessment is finished before this file runs. Its single responsibility is
 * to turn a frozen `assessment_record`, the scoring-safe observations and an
 * optional verified history overlay into something a learner can act on.
 *
 * Two invariants shape everything here:
 *
 * 1. The model writes prose, the code owns the marks. The composition schema has
 *    no field for a band or a total, and `global_result` is built by copying the
 *    validated record, so a model that tries to re-mark has nowhere to put it.
 * 2. Offsets and categories are copied from validated observations, never
 *    retyped or invented by the model.
 */
import { WRITING_CATEGORY_KEYS } from '../../domain/categories';
import { PROMPT_VERSIONS, SCHEMA_VERSION, SOURCE_DOC_VERSIONS, WRITING_ENGINE_VERSION } from '../../domain/engine-version';
import {
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  feedbackPayloadSchema,
  validateOpeningStrengthsCardinality,
} from '../../domain/schemas';
import type {
  AssessmentRecord,
  AssessmentResult,
  FeedbackPayload,
  LearnerHistoryContext,
  ModelConfigSnapshot,
  Observation,
  ObservationExtractionResult,
  OpeningStrength,
  ResolvedTaskAnalysis,
  ReviewNextItem,
  WritingAnnotation,
  WritingCategoryKey,
} from '../../domain/types';
import {
  FEEDBACK_JSON_SCHEMA,
  buildFeedbackPrompt,
  feedbackLlmOutputSchema,
} from '../../prompts/feedback-composition.prompt';
import type {
  AnnotatableObservation,
  CriterionEvidenceContext,
  FeedbackLlmOutput,
  GlobalObservationContext,
} from '../../prompts/feedback-composition.prompt';
import {
  FORBIDDEN_AUTHORITY_PHRASES,
  FORBIDDEN_HISTORY_PHRASES,
  FORBIDDEN_REWRITE_PHRASES,
  FORBIDDEN_VOICE_PHRASES,
  projectDomainToCategory,
} from '../../prompts/knowledge/doc04-feedback-rules';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  assertPinnedModelConfig,
} from '../analysis/task-analysis.service';
import { detectForbiddenHeuristics } from '../validation/forbidden-heuristics';
import { validateFeedbackPayload } from '../validation/deterministic-validators';
import { checkIntentPreservation } from '../validation/intent-preservation';
import { buildHistoryOverlay } from './learner-history-enrichment.service';
import type { HistoryOverlay } from './learner-history-enrichment.service';

export { TASK_ANALYSIS_BENCHMARK_MODEL as FEEDBACK_BENCHMARK_MODEL };

export class FeedbackConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedbackConfigurationError';
  }
}

export class FeedbackValidationError extends Error {
  readonly failures: string[];

  constructor(message: string, failures: string[] = []) {
    super(message);
    this.name = 'FeedbackValidationError';
    this.failures = failures;
  }
}

// ---------------------------------------------------------------------------
// Request / dependencies
// ---------------------------------------------------------------------------

export interface FeedbackLlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: typeof FEEDBACK_JSON_SCHEMA;
}

export interface FeedbackLlmClient {
  generate(request: FeedbackLlmRequest): Promise<unknown>;
}

export interface FeedbackRequest {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
  observations: ObservationExtractionResult;
  /** Already validated. Treated as immutable throughout. */
  assessment: AssessmentResult;
  /** Verified, explicitly injected history. Absent in normal development. */
  learner_history?: LearnerHistoryContext;
  model_config?: ModelConfigSnapshot;
}

export interface FeedbackCompositionResult {
  feedback_payload: FeedbackPayload;
  history_applied: boolean;
  llm_calls: number;
}

// ---------------------------------------------------------------------------
// Frozen marks
// ---------------------------------------------------------------------------

/**
 * The learner-facing result is a copy of the assessment, not a restatement of
 * it. Nothing between here and the payload can introduce a different number.
 */
export function copyFrozenAssessmentResult(record: AssessmentRecord) {
  if (record.status !== 'complete' || !record.criteria || record.raw_total === undefined) {
    throw new FeedbackValidationError(
      'feedback can only be composed for a complete assessment; an incomplete result has no marks to explain',
    );
  }
  return {
    criteria: {
      content: record.criteria.content.mark,
      communicative_achievement: record.criteria.communicative_achievement.mark,
      organisation: record.criteria.organisation.mark,
      language: record.criteria.language.mark,
    },
    raw_total: record.raw_total,
    max_total: 20 as const,
    level_indicator: null,
    single_task_scale_claim_allowed: false as const,
    disclaimer: DRALO_RESULT_DISCLAIMER,
  };
}

// ---------------------------------------------------------------------------
// Observation eligibility
// ---------------------------------------------------------------------------

/**
 * An observation may become a local annotation only when Phase 3 bound it to a
 * real span, marked it renderable, and its domain has an honest UI category.
 * A register problem with no category is not an error — it belongs in criterion
 * feedback, and forcing a colour onto it would invent precision.
 */
export function selectAnnotatable(
  observations: readonly Observation[],
  candidateResponse: string,
): { annotatable: AnnotatableObservation[]; global: GlobalObservationContext[] } {
  const annotatable: AnnotatableObservation[] = [];
  const global: GlobalObservationContext[] = [];

  for (const observation of observations) {
    const category = projectDomainToCategory(observation.domain);
    const bound =
      observation.scope === 'local' &&
      observation.binding_status === 'bound' &&
      observation.renderable_locally === true &&
      typeof observation.span_start === 'number' &&
      typeof observation.span_end === 'number';

    if (!bound || !category) {
      global.push({
        observation_id: observation.observation_id,
        domain: observation.domain,
        polarity: observation.polarity,
        diagnosis: observation.diagnosis,
        communicative_impact: observation.communicative_impact,
      });
      continue;
    }

    annotatable.push({
      observation_id: observation.observation_id,
      domain: observation.domain,
      category_key: category,
      polarity: observation.polarity,
      quote: candidateResponse.slice(observation.span_start!, observation.span_end!),
      span_start: observation.span_start!,
      span_end: observation.span_end!,
      intended_meaning: observation.intended_meaning ?? null,
      diagnosis: observation.diagnosis,
      suggested_change: observation.suggested_change ?? null,
      communicative_impact: observation.communicative_impact,
      meaning_blocking: observation.meaning_blocking,
      pedagogical_priority: observation.pedagogical_priority,
      history: null,
    });
  }

  return { annotatable, global };
}

/** Genuine positive evidence only. Cardinality follows the evidence, never the UI. */
export function selectEligibleStrengths(
  annotatable: AnnotatableObservation[],
  observations: readonly Observation[],
): AnnotatableObservation[] {
  const byId = new Map(observations.map((o) => [o.observation_id, o]));
  return annotatable.filter((item) => {
    const observation = byId.get(item.observation_id);
    return observation?.polarity === 'positive' && observation.observation_type === 'strength';
  });
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export async function composeFeedback(
  request: FeedbackRequest,
  deps: { llm?: FeedbackLlmClient } = {},
): Promise<FeedbackCompositionResult> {
  const modelConfig = request.model_config ?? TASK_ANALYSIS_BENCHMARK_MODEL;
  assertPinnedModelConfig(modelConfig);

  const record = request.assessment.assessment_record;
  const globalResult = copyFrozenAssessmentResult(record);

  const observations = request.observations.observations;
  const overlay = buildHistoryOverlay(observations, request.learner_history, record);

  const { annotatable, global } = selectAnnotatable(observations, request.candidate_response);
  for (const item of annotatable) {
    item.history = overlay.entries.get(item.observation_id) ?? null;
  }
  const eligibleStrengths = selectEligibleStrengths(annotatable, observations);
  const correctable = annotatable.filter((item) => item.polarity !== 'positive');

  const criterionContext = buildCriterionContext(record);

  const prompt = buildFeedbackPrompt({
    candidate_response: request.candidate_response,
    task_analysis: request.task_analysis,
    assessment_record: record,
    criterion_context: criterionContext,
    annotatable: correctable,
    global_observations: global,
    eligible_strengths: eligibleStrengths,
    history_available: overlay.applied,
    base_correction_strategy: request.observations.base_correction_strategy,
    principal_focus: request.observations.principal_focus ?? null,
  });

  if (!deps.llm) {
    throw new FeedbackConfigurationError(
      'feedback composition requires an explicitly injected model client; there is no implicit fallback',
    );
  }

  const raw = await deps.llm.generate({
    system: prompt.system,
    user: prompt.user,
    model_config: modelConfig,
    json_schema: FEEDBACK_JSON_SCHEMA,
  });

  const parsed = feedbackLlmOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new FeedbackValidationError(
      'the feedback model output does not match the composition schema',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const payload = assemblePayload({
    llm: parsed.data,
    request,
    globalResult,
    annotatable,
    eligibleStrengths,
    criterionContext,
    overlay,
    modelConfig,
  });

  return { feedback_payload: payload, history_applied: overlay.applied, llm_calls: 1 };
}

function buildCriterionContext(record: AssessmentRecord): CriterionEvidenceContext[] {
  if (record.status !== 'complete' || !record.criteria) return [];
  return (Object.keys(record.criteria) as Array<keyof typeof record.criteria>).map((key) => {
    const decision = record.criteria![key];
    return {
      criterion: decision.criterion,
      mark: decision.mark,
      band_anchor: decision.band_anchor,
      positive_evidence: decision.positive_evidence,
      limiting_evidence: decision.limiting_evidence,
      why_not_higher: decision.why_not_higher,
      why_not_lower: decision.why_not_lower ?? null,
      evidence: decision.text_evidence.map((item, index) => ({ index, quote: item.bound_text })),
    };
  });
}

interface AssembleInput {
  llm: FeedbackLlmOutput;
  request: FeedbackRequest;
  globalResult: ReturnType<typeof copyFrozenAssessmentResult>;
  annotatable: AnnotatableObservation[];
  eligibleStrengths: AnnotatableObservation[];
  criterionContext: CriterionEvidenceContext[];
  overlay: HistoryOverlay;
  modelConfig: ModelConfigSnapshot;
}

function assemblePayload(input: AssembleInput): FeedbackPayload {
  const record = input.request.assessment.assessment_record;
  const failures: string[] = [];

  const openingStrengths = assembleStrengths(input, failures);
  const annotations = assembleAnnotations(input, failures);
  const criterionFeedback = assembleCriterionFeedback(input, failures);
  const reviewNext = assembleReviewNext(input, failures);

  const composed = { openingStrengths, annotations, criterionFeedback, reviewNext };
  for (const issue of findFeedbackTextIssues(composed, input.overlay.applied)) {
    failures.push(`${issue.kind} in ${issue.path}: "${issue.match}"`);
  }
  // The same prohibited scoring logic the validator would reject: better to
  // refuse here than to emit a payload that cannot survive validation.
  for (const failure of detectForbiddenHeuristics(composed, 'feedback')) {
    failures.push(`${failure.message} (${failure.rule_id})`);
  }

  if (failures.length) {
    throw new FeedbackValidationError('the composed feedback is not acceptable', failures);
  }

  const payload = {
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      prompt_versions: { ...PROMPT_VERSIONS },
      model_config: input.modelConfig,
    },
    global_result: input.globalResult,
    criterion_feedback: criterionFeedback,
    opening_strengths: openingStrengths,
    annotations,
    review_next: reviewNext,
    final_cta: FINAL_CTA,
    resource_key: null,
    learner_history_applied: input.overlay.applied,
  };

  const parsed = feedbackPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new FeedbackValidationError(
      'the composed feedback does not match the payload contract',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  // The last line of defence: whatever the model wrote, the numbers on the page
  // are the numbers the examiner layer decided.
  if (
    record.status === 'complete' &&
    record.criteria &&
    (parsed.data.global_result.raw_total !== record.raw_total ||
      parsed.data.global_result.criteria.content !== record.criteria.content.mark ||
      parsed.data.global_result.criteria.communicative_achievement !==
        record.criteria.communicative_achievement.mark ||
      parsed.data.global_result.criteria.organisation !== record.criteria.organisation.mark ||
      parsed.data.global_result.criteria.language !== record.criteria.language.mark)
  ) {
    throw new FeedbackValidationError('feedback may not alter the assessment marks');
  }

  const validationFailures = validateFeedbackPayload({
    feedback_payload: parsed.data,
    assessment_record: record,
    candidate_response: input.request.candidate_response,
    observations: input.request.observations,
  });
  const blocking = validationFailures.filter(
    (failure) =>
      failure.severity === 'hard_failure' || failure.severity === 'retryable_generation_failure',
  );
  if (blocking.length) {
    throw new FeedbackValidationError(
      'the composed feedback failed validation',
      blocking.map((failure) => `${failure.rule_id}: ${failure.message}`),
    );
  }

  return parsed.data;
}

function assembleStrengths(input: AssembleInput, failures: string[]): OpeningStrength[] {
  const eligible = new Map(input.eligibleStrengths.map((item) => [item.observation_id, item]));
  const selected: OpeningStrength[] = [];
  const seen = new Set<string>();

  for (const strength of input.llm.opening_strengths) {
    if (!eligible.has(strength.observation_id)) {
      failures.push(
        `opening strength cites "${strength.observation_id}", which is not genuine positive evidence from this response`,
      );
      continue;
    }
    if (seen.has(strength.observation_id)) continue;
    seen.add(strength.observation_id);
    selected.push({
      strength_id: `str_${selected.length + 1}`,
      observation_id: strength.observation_id,
      headline: strength.headline,
      explanation: strength.explanation,
    });
  }

  // Doc 04 §3: cardinality follows the evidence. Zero is a valid answer, and
  // three is the ceiling. An over-selection is rejected rather than sliced:
  // deciding which of the learner's genuine strengths survives is a pedagogical
  // judgement, and code silently taking the first three is not that judgement.
  if (!validateOpeningStrengthsCardinality(selected, eligible.size)) {
    failures.push(
      `${selected.length} opening strengths were selected from ${eligible.size} eligible: ${describeExpectedStrengthCount(eligible.size)}`,
    );
  }
  return selected;
}

export function describeExpectedStrengthCount(eligible: number): string {
  if (eligible <= 0) return 'none are available, so none may be shown';
  if (eligible === 1) return 'exactly one is available and exactly one must be shown';
  return 'two or three must be shown';
}

function assembleAnnotations(input: AssembleInput, failures: string[]): WritingAnnotation[] {
  const byId = new Map(input.annotatable.map((item) => [item.observation_id, item]));
  const annotations: WritingAnnotation[] = [];
  const used = new Set<string>();

  for (const annotation of input.llm.annotations) {
    const source = byId.get(annotation.observation_id);
    if (!source) {
      failures.push(
        `annotation cites "${annotation.observation_id}", which has no validated local span`,
      );
      continue;
    }
    if (used.has(annotation.observation_id)) continue;
    used.add(annotation.observation_id);

    const suggested = annotation.suggested_change ?? undefined;
    if (suggested) {
      const violations = checkIntentPreservation({
        text_quote: source.quote,
        suggested_change: suggested,
        candidate_response: input.request.candidate_response,
        voice_preservation: { preserves_stance: true, preserves_central_meaning: true },
      });
      if (violations.length) {
        failures.push(
          `the suggested change for "${source.quote}" does not preserve the student's meaning (${violations.join(', ')})`,
        );
        continue;
      }
    }

    annotations.push({
      annotation_id: `ann_${annotations.length + 1}`,
      observation_id: source.observation_id,
      category_key: source.category_key as WritingCategoryKey,
      span_start: source.span_start,
      span_end: source.span_end,
      original_text: source.quote,
      feedback_kind: annotation.feedback_kind,
      local_explanation: annotation.local_explanation,
      ...(suggested ? { suggested_change: suggested } : {}),
      ...(annotation.teaching_prompt ? { teaching_prompt: annotation.teaching_prompt } : {}),
    });
  }

  // Selectivity is pedagogical, but a locally fixable blocked meaning is not
  // something the interface gets to tidy away.
  for (const source of input.annotatable) {
    if (!source.meaning_blocking) continue;
    if (used.has(source.observation_id)) continue;
    failures.push(
      `the meaning-blocking issue at "${source.quote}" was left without learner-facing treatment`,
    );
  }

  return annotations;
}

function assembleCriterionFeedback(input: AssembleInput, failures: string[]) {
  const contextByCriterion = new Map(input.criterionContext.map((c) => [c.criterion, c]));
  const rows = [];

  for (const row of input.llm.criterion_feedback) {
    const context = contextByCriterion.get(row.criterion);
    if (!context) {
      failures.push(`criterion feedback for unknown criterion "${row.criterion}"`);
      continue;
    }
    const evidence = [];
    for (const index of row.evidence_indices) {
      const item = context.evidence[index];
      if (!item) {
        failures.push(`${row.criterion} cites evidence index ${index}, which does not exist`);
        continue;
      }
      const decision = decisionFor(input.request.assessment.assessment_record, row.criterion);
      const bound = decision?.text_evidence[index];
      if (bound) evidence.push(bound);
    }
    rows.push({
      criterion: row.criterion,
      mark: context.mark,
      summary: row.summary,
      expanded: {
        what_worked: row.what_worked,
        what_limited_the_band: row.what_limited_the_band,
        evidence,
        next_focus: row.next_focus,
      },
    });
  }
  return rows;
}

function decisionFor(record: AssessmentRecord, criterion: string) {
  if (record.status !== 'complete' || !record.criteria) return null;
  return (record.criteria as Record<string, { text_evidence: unknown[] }>)[criterion] as
    | { text_evidence: import('../../domain/types').BoundQuote[] }
    | undefined;
}

function assembleReviewNext(input: AssembleInput, failures: string[]): ReviewNextItem[] {
  const observationIds = new Set(
    input.request.observations.observations.map((o) => o.observation_id),
  );
  const criterionKeys = new Set(input.criterionContext.map((c) => c.criterion));
  const historyEvidence = new Set(input.overlay.evidence_ids);

  const items: ReviewNextItem[] = [];
  for (const item of input.llm.review_next) {
    const valid = item.source_ids.every((id) => {
      if (item.source === 'observation') return observationIds.has(id);
      if (item.source === 'assessment_limitation') return criterionKeys.has(id);
      return historyEvidence.has(id);
    });
    if (!valid) {
      failures.push(
        `the review item "${item.concept}" cites ${item.source} evidence that does not exist`,
      );
      continue;
    }
    items.push({
      review_id: `rev_${items.length + 1}`,
      concept: item.concept,
      reason: item.reason,
      source: item.source,
      source_ids: item.source_ids,
      resource_key: null,
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Learner-facing text guards
// ---------------------------------------------------------------------------

export interface FeedbackTextIssue {
  kind: 'history_claim' | 'ai_voice' | 'false_authority' | 'full_rewrite';
  match: string;
  path: string;
}

/**
 * Text-level guards shared by the composer and the Phase-5 validator, so the
 * same rule cannot be enforced in one place and forgotten in the other.
 */
export function findFeedbackTextIssues(
  value: unknown,
  historyApplied: boolean,
): FeedbackTextIssue[] {
  const issues: FeedbackTextIssue[] = [];
  for (const { path, text } of walkStrings(value, '')) {
    if (!historyApplied) {
      for (const pattern of FORBIDDEN_HISTORY_PHRASES) {
        const match = text.match(pattern);
        if (match) issues.push({ kind: 'history_claim', match: match[0], path });
      }
    }
    for (const pattern of FORBIDDEN_VOICE_PHRASES) {
      const match = text.match(pattern);
      if (match) issues.push({ kind: 'ai_voice', match: match[0], path });
    }
    for (const pattern of FORBIDDEN_AUTHORITY_PHRASES) {
      const match = text.match(pattern);
      if (match) issues.push({ kind: 'false_authority', match: match[0], path });
    }
    for (const pattern of FORBIDDEN_REWRITE_PHRASES) {
      const match = text.match(pattern);
      if (match) issues.push({ kind: 'full_rewrite', match: match[0], path });
    }
  }
  return issues;
}

/** Categories are a closed set; nothing may quietly add a seventh. */
export function isClosedCategory(value: string): boolean {
  return (WRITING_CATEGORY_KEYS as readonly string[]).includes(value);
}

function* walkStrings(value: unknown, path: string): Generator<{ path: string; text: string }> {
  if (typeof value === 'string') {
    yield { path, text: value };
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) yield* walkStrings(value[i], `${path}[${i}]`);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      yield* walkStrings(child, path ? `${path}.${key}` : key);
    }
  }
}
