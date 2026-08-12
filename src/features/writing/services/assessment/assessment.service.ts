/**
 * Cambridge assessment service (Layer 3 — Doc 03, Phase 4).
 *
 * Answers: how should THIS candidate response be scored under the official
 * B2 First Writing Assessment Scale?
 *
 * Split of responsibilities:
 *  - LLM: the four whole bands, band anchors, positive and limiting evidence,
 *    boundary reasoning, adjacent-band evidence, confidence and rule citations.
 *  - Code: schema validation, quote binding and offsets, the raw total, rule-id
 *    validation, criterion-independence checks, forbidden-behaviour detection,
 *    learner-history assertions, task-context sufficiency and provenance.
 *
 * The full candidate response is always authoritative. Phase-3 observations are
 * an optional index of places worth looking, re-verified here and stripped of
 * every pedagogical weighting before the model sees them.
 *
 * Nothing here is wired to an API route, the database or the UI.
 */
import {
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  WRITING_ENGINE_VERSION,
} from '../../domain/engine-version';
import {
  CAMBRIDGE_CRITERION_KEYS,
  assessmentResultSchema,
  finalizeAssessmentRecord,
  findForbiddenAssessmentBehaviour,
  normaliseRequirementText,
} from '../../domain/schemas';
import type {
  AssessmentCriteria,
  AssessmentResult,
  CambridgeCriterionKey,
  CriterionDecisionRecord,
  ModelConfigSnapshot,
  Observation,
  ObservationExtractionResult,
  ResolvedTaskAnalysis,
} from '../../domain/types';
import {
  ASSESSMENT_JSON_SCHEMA,
  ASSESSMENT_PROMPT_VERSION,
  type CriterionLlmDecision,
  type VerifiedEvidenceHint,
  assessmentLlmOutputSchema,
  buildAssessmentPrompt,
} from '../../prompts/assessment.prompt';
import {
  isDoc03RuleId,
  isRuleCitableBy,
} from '../../prompts/knowledge/doc03-assessment-rules';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  assertPinnedModelConfig,
} from '../analysis/task-analysis.service';
import { hashCandidateResponse } from '../observation/observation.service';
import { bindAssessmentEvidenceQuote, bindQuote, verifyBinding } from '../validation/evidence-binding';
import {
  formatEvidenceBindingFailureMessage,
  type EvidenceBindingInspectionRow,
} from '../validation/evidence-binding-diagnostics';
import { collectAdjacentBandContractViolations } from '../validation/adjacent-band-contract';

export { TASK_ANALYSIS_BENCHMARK_MODEL as ASSESSMENT_BENCHMARK_MODEL };

export class AssessmentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssessmentConfigurationError';
  }
}

export class AssessmentValidationError extends Error {
  readonly failures: string[];
  /** Structured binding failures when the throw was caused by evidence binding. */
  readonly bindingFailures: EvidenceBindingInspectionRow[];

  constructor(
    message: string,
    failures: string[] = [],
    bindingFailures: EvidenceBindingInspectionRow[] = [],
  ) {
    super(message);
    this.name = 'AssessmentValidationError';
    this.failures = failures;
    this.bindingFailures = bindingFailures;
  }
}

// ---------------------------------------------------------------------------
// Request / dependencies
// ---------------------------------------------------------------------------

export interface AssessmentLlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: typeof ASSESSMENT_JSON_SCHEMA;
}

export interface AssessmentLlmClient {
  generate(request: AssessmentLlmRequest): Promise<unknown>;
}

/**
 * There is no field for learner history, course stage, exam proximity or
 * feedback preferences, and adding one would be a visible architectural change
 * rather than a quiet regression.
 */
export interface AssessmentRequest {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
  /** Optional Phase-3 evidence index. Advisory only; never a scoring weight. */
  observations?: ObservationExtractionResult;
  model_config?: ModelConfigSnapshot;
  /** Precise structural retry feedback from a prior failed attempt. Never golden marks. */
  generation_feedback?: string | null;
}

const FORBIDDEN_REQUEST_KEYS = [
  'learner_history',
  'learner_context',
  'previous_writings',
  'previous_marks',
  'previous_scores',
  'prior_scores',
  'previously_taught',
  'course_stage',
  'course_progress',
  'exam_date',
  'exam_proximity',
  'pedagogical_progression',
  'learner_personality',
  'feedback_preferences',
  'student_profile',
] as const;

export function assertNoLearnerHistory(request: Record<string, unknown>): void {
  const present = Object.keys(request).filter((key) =>
    (FORBIDDEN_REQUEST_KEYS as readonly string[]).includes(key.toLowerCase()),
  );
  if (present.length) {
    throw new AssessmentConfigurationError(
      `learner history must never reach Cambridge assessment: received ${present.join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Task-context sufficiency
// ---------------------------------------------------------------------------

export interface TaskContextCheck {
  sufficient: boolean;
  reason?: string;
}

/**
 * Doc 03 §1.5 and SP03: Content and Communicative Achievement require the real
 * task. Without it the correct result is an incomplete assessment, never a
 * guessed profile and never 0/20.
 */
export function checkTaskContext(analysis: ResolvedTaskAnalysis): TaskContextCheck {
  if (!analysis.source_task_text?.trim()) {
    return {
      sufficient: false,
      reason:
        'The task prompt is unavailable, so Content and Communicative Achievement cannot be scored.',
    };
  }
  if (
    analysis.mandatory_content_points.length === 0 &&
    analysis.required_functions.length === 0
  ) {
    return {
      sufficient: false,
      reason:
        'No mandatory content point or required function could be established, so no requirement map exists for Content.',
    };
  }
  // Phase 2 has already tried task wording, trusted metadata and unambiguous
  // inference. Without a reader there is no defensible Communicative Achievement
  // decision, and inventing one to avoid this state is exactly what SP03 forbids.
  if (analysis.target_reader === null || analysis.target_reader_resolution.source === 'unresolved') {
    return {
      sufficient: false,
      reason:
        'The target reader could not be resolved, so the reader relationship and task conventions cannot be judged for Communicative Achievement.',
    };
  }
  return { sufficient: true };
}

export function countWords(text: string): number {
  const matches = String(text ?? '').trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

// ---------------------------------------------------------------------------
// Phase-3 evidence index
// ---------------------------------------------------------------------------

/**
 * Projects Phase-3 observations into locations worth checking. Every pedagogical
 * field is dropped, so no Teacher DNA weighting can reach a mark, and every
 * quote is re-bound here rather than trusted: an observation that could not be
 * located in the response can never become Cambridge evidence.
 */
export function buildEvidenceIndex(
  observations: ObservationExtractionResult | undefined,
  candidateResponse: string,
): VerifiedEvidenceHint[] {
  if (!observations) return [];

  const hints: VerifiedEvidenceHint[] = [];
  for (const observation of observations.observations) {
    if (observation.scope === 'local') {
      const hint = verifyLocalObservation(observation, candidateResponse);
      if (hint) hints.push(hint);
      continue;
    }
    for (const support of observation.supporting_evidence) {
      const binding = bindQuote(candidateResponse, support.quote, support.occurrence_index);
      if (binding.status !== 'bound') continue;
      hints.push({
        observation_id: observation.observation_id,
        domain: observation.domain,
        quote: binding.bound_text,
        span_start: binding.span_start,
        span_end: binding.span_end,
        diagnosis: observation.diagnosis,
        communicative_impact: observation.communicative_impact,
      });
    }
  }
  return hints;
}

function verifyLocalObservation(
  observation: Observation,
  candidateResponse: string,
): VerifiedEvidenceHint | null {
  if (observation.binding_status !== 'bound' || !observation.renderable_locally) return null;
  if (!observation.text_quote) return null;

  const binding = bindQuote(
    candidateResponse,
    observation.text_quote,
    observation.occurrence_index ?? 0,
  );
  if (binding.status !== 'bound') return null;
  if (!verifyBinding(candidateResponse, binding.span_start, binding.span_end, binding.bound_text)) {
    return null;
  }

  return {
    observation_id: observation.observation_id,
    domain: observation.domain,
    quote: binding.bound_text,
    span_start: binding.span_start,
    span_end: binding.span_end,
    diagnosis: observation.diagnosis,
    communicative_impact: observation.communicative_impact,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function assessWriting(
  request: AssessmentRequest,
  deps: { llm?: AssessmentLlmClient } = {},
): Promise<AssessmentResult> {
  assertNoLearnerHistory(request as unknown as Record<string, unknown>);

  const candidateResponse = String(request.candidate_response ?? '');
  const modelConfig = request.model_config ?? TASK_ANALYSIS_BENCHMARK_MODEL;
  assertPinnedModelConfig(modelConfig);

  if (!candidateResponse.trim()) {
    throw new AssessmentConfigurationError('assessment requires a candidate response');
  }
  if (!deps.llm) {
    throw new AssessmentConfigurationError(
      'assessment requires an explicit LLM client; there is no implicit default',
    );
  }

  const word_count = countWords(candidateResponse);
  const candidateHash = hashCandidateResponse(candidateResponse);
  const taskFingerprint = request.task_analysis.provenance.task_fingerprint;

  const context = checkTaskContext(request.task_analysis);
  if (!context.sufficient) {
    return buildResult({
      record: finalizeRecord({
        status: 'incomplete',
        incomplete_reason: context.reason,
        max_total: 20,
        single_task_scale_claim_allowed: false,
        word_count,
        word_count_penalty_applied: false,
      }),
      modelConfig,
      candidateHash,
      taskFingerprint,
      llmCalls: 0,
      evidenceIndexSize: 0,
    });
  }

  const evidence_hints = buildEvidenceIndex(request.observations, candidateResponse);

  const prompt = buildAssessmentPrompt({
    candidate_response: candidateResponse,
    task_analysis: request.task_analysis,
    word_count,
    evidence_hints,
    generation_feedback: request.generation_feedback,
  });

  const raw = await deps.llm.generate({
    system: prompt.system,
    user: prompt.user,
    model_config: modelConfig,
    json_schema: ASSESSMENT_JSON_SCHEMA,
  });

  const forbidden = findForbiddenAssessmentBehaviour(raw);
  if (forbidden.length) {
    throw new AssessmentValidationError(
      'the assessment model returned a forbidden scoring behaviour',
      forbidden,
    );
  }

  const parsed = assessmentLlmOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AssessmentValidationError(
      'the assessment model output does not match the assessment schema',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  if (!parsed.data.assessable) {
    return buildResult({
      record: finalizeRecord({
        status: 'incomplete',
        incomplete_reason:
          parsed.data.unassessable_reason ?? 'The response could not be assessed against the task.',
        max_total: 20,
        single_task_scale_claim_allowed: false,
        word_count,
        word_count_penalty_applied: false,
      }),
      modelConfig,
      candidateHash,
      taskFingerprint,
      llmCalls: 1,
      evidenceIndexSize: evidence_hints.length,
    });
  }

  const adjacentViolations = collectAdjacentBandContractViolations(parsed.data.criteria);
  if (adjacentViolations.length) {
    throw new AssessmentValidationError(
      adjacentViolations.join(' '),
      adjacentViolations,
    );
  }

  const criteria = assembleCriteria(
    parsed.data.criteria,
    candidateResponse,
    evidence_hints,
  );

  assertCriterionIndependence(criteria);

  // Doc 03 S02 / §6.1: code owns the total. Any total the model emitted is
  // stripped at parse time and never read — there is nothing to reconcile.
  const record = finalizeRecord({
    status: 'complete',
    criteria,
    max_total: 20,
    single_task_scale_claim_allowed: false,
    overall_confidence: parsed.data.overall_confidence,
    word_count,
    word_count_penalty_applied: false,
  });

  const residual = findForbiddenAssessmentBehaviour(record);
  if (residual.length) {
    throw new AssessmentValidationError(
      'the assembled assessment record contains a forbidden scoring behaviour',
      residual,
    );
  }

  return buildResult({
    record,
    modelConfig,
    candidateHash,
    taskFingerprint,
    llmCalls: 1,
    evidenceIndexSize: evidence_hints.length,
  });
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function assembleCriteria(
  decisions: CriterionLlmDecision[],
  candidateResponse: string,
  hints: VerifiedEvidenceHint[],
): AssessmentCriteria {
  const byCriterion = new Map<CambridgeCriterionKey, CriterionLlmDecision>();
  for (const decision of decisions) {
    if (byCriterion.has(decision.criterion)) {
      throw new AssessmentValidationError(
        `the model returned more than one decision for ${decision.criterion}`,
      );
    }
    byCriterion.set(decision.criterion, decision);
  }

  const missing = CAMBRIDGE_CRITERION_KEYS.filter((key) => !byCriterion.has(key));
  if (missing.length) {
    throw new AssessmentValidationError(
      `the assessment is missing a decision for ${missing.join(', ')}`,
      missing,
    );
  }

  const hintIds = new Set(hints.map((hint) => hint.observation_id));

  const assembled = {} as Record<CambridgeCriterionKey, CriterionDecisionRecord>;
  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    assembled[key] = buildCriterionRecord(
      byCriterion.get(key) as CriterionLlmDecision,
      candidateResponse,
      hintIds,
    );
  }
  return assembled as AssessmentCriteria;
}

function buildCriterionRecord(
  decision: CriterionLlmDecision,
  candidateResponse: string,
  hintIds: Set<string>,
): CriterionDecisionRecord {
  const text_evidence = decision.text_evidence.map((item) => {
    const requested = item.occurrence_index;
    const binding = bindAssessmentEvidenceQuote(candidateResponse, item.quote, requested);
    if (binding.status !== 'bound') {
      const row: EvidenceBindingInspectionRow = {
        criterion: decision.criterion,
        quote: item.quote,
        requested_occurrence_index: binding.model_occurrence_index,
        canonical_occurrence_index: null,
        model_index_ignored: binding.model_index_ignored,
        occurrences_found: binding.occurrences_found,
        binding_status: 'failed',
        binding_reason: binding.reason,
        span_start: null,
        span_end: null,
        bound_text: null,
      };
      throw new AssessmentValidationError(
        formatEvidenceBindingFailureMessage({
          criterion: decision.criterion,
          quote: item.quote,
          reason: binding.reason,
          requested_occurrence_index: binding.model_occurrence_index,
          occurrences_found: binding.occurrences_found,
        }),
        [binding.reason],
        [row],
      );
    }
    if (!verifyBinding(candidateResponse, binding.span_start, binding.span_end, binding.bound_text)) {
      throw new AssessmentValidationError(
        `${decision.criterion}: the evidence quote "${item.quote}" could not be bound to an exact span`,
      );
    }
    return {
      quote: item.quote,
      // Canonical location only — unique quotes always store 0.
      occurrence_index: binding.canonical_occurrence_index,
      span_start: binding.span_start,
      span_end: binding.span_end,
      bound_text: binding.bound_text,
    };
  });

  const unknownRules = decision.source_rule_ids.filter((id) => !isDoc03RuleId(id));
  if (unknownRules.length) {
    throw new AssessmentValidationError(
      `${decision.criterion}: source_rule_ids must cite Document 03 rules, not ${unknownRules.join(', ')}`,
      unknownRules,
    );
  }
  if (!decision.source_rule_ids.some((id) => isRuleCitableBy(decision.criterion, id))) {
    throw new AssessmentValidationError(
      `${decision.criterion}: every decision must cite at least one rule from its own construct or the shared rulebook`,
      decision.source_rule_ids,
    );
  }

  // Discovery metadata only: an observation that never survived re-binding
  // cannot be presented as the origin of Cambridge evidence.
  const evidence_observation_ids = decision.evidence_observation_ids.filter((id) =>
    hintIds.has(id),
  );

  return {
    criterion: decision.criterion,
    mark: decision.mark,
    band_anchor: decision.band_anchor,
    positive_evidence: decision.positive_evidence,
    limiting_evidence: decision.limiting_evidence,
    text_evidence,
    why_not_higher: decision.why_not_higher,
    why_not_lower: decision.why_not_lower ?? undefined,
    adjacent_band_evidence: decision.adjacent_band_evidence ?? undefined,
    band_ceiling_reached: decision.mark === 5,
    band_floor_reached: decision.mark === 0,
    confidence: decision.confidence,
    confidence_reason: decision.confidence_reason ?? undefined,
    source_rule_ids: decision.source_rule_ids,
    evidence_observation_ids,
  };
}

/**
 * Doc 03 X01 and X09: a shared textual feature is legitimate, but each criterion
 * must explain a different construct consequence. A rationale reused verbatim
 * across two criteria is the signature of a generic comment, not of independent
 * judgement.
 */
function assertCriterionIndependence(criteria: AssessmentCriteria): void {
  const seen = new Map<string, CambridgeCriterionKey>();
  const duplicates: string[] = [];

  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    const record = criteria[key];
    const rationales = [
      // At the ceiling there is no construct-specific comparison to make, so the
      // band-5 statement is structural and may legitimately read the same way.
      record.band_ceiling_reached ? '' : record.why_not_higher,
      record.why_not_lower ?? '',
      ...record.positive_evidence,
      ...record.limiting_evidence,
    ].filter(Boolean);

    for (const rationale of rationales) {
      const normalised = normaliseRequirementText(rationale);
      if (normalised.length < 25) continue;
      const owner = seen.get(normalised);
      if (owner && owner !== key) {
        duplicates.push(`${owner} and ${key} share the rationale "${rationale}"`);
      } else {
        seen.set(normalised, key);
      }
    }
  }

  if (duplicates.length) {
    throw new AssessmentValidationError(
      'each criterion must explain a different construct consequence',
      duplicates,
    );
  }
}

type AssessmentRecordInput = Parameters<typeof finalizeAssessmentRecord>[0];

/** Contract violations surface as assessment failures, not as raw Zod errors. */
function finalizeRecord(input: AssessmentRecordInput): AssessmentResult['assessment_record'] {
  try {
    return finalizeAssessmentRecord(input);
  } catch (error) {
    throw new AssessmentValidationError(
      'the assembled assessment record does not satisfy the assessment contract',
      [error instanceof Error ? error.message : String(error)],
    );
  }
}

function buildResult(params: {
  record: AssessmentResult['assessment_record'];
  modelConfig: ModelConfigSnapshot;
  candidateHash: string;
  taskFingerprint: string;
  llmCalls: number;
  evidenceIndexSize: number;
}): AssessmentResult {
  return assessmentResultSchema.parse({
    assessment_record: params.record,
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      cambridge_assessment_version: SOURCE_DOC_VERSIONS.cambridge_assessment,
      task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
      assessment_prompt_version: ASSESSMENT_PROMPT_VERSION,
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      model_config: params.modelConfig,
      candidate_response_hash: params.candidateHash,
      task_fingerprint: params.taskFingerprint,
      llm_calls: params.llmCalls,
      learner_history_available: false,
      observation_evidence_index_size: params.evidenceIndexSize,
      calibration_status: 'not_calibrated',
    },
  });
}
