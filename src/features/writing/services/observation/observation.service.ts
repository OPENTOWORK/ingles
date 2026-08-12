/**
 * Observation extraction service (Layer 2 — Teacher DNA, Phase 3).
 *
 * Produces evidence-bound, score-free observations about the CURRENT candidate
 * response. It is deliberately history-free: the request type has no learner
 * context, and the service asserts that none arrived, so it is structurally
 * impossible for learner history to reach the Cambridge marks computed in
 * Layer 3. History enrichment happens later, after marks are frozen.
 *
 * Split of responsibilities:
 *  - LLM: intended meaning, diagnosis, domain, impact, polarity, ambition,
 *    transferability, qualitative priority, suggestions, current-script patterns.
 *  - Code: schema validation, quote binding and offsets, observation IDs,
 *    deduplication, pattern grouping, ordering, forbidden-field detection,
 *    history assertions, score assertions and provenance.
 *
 * Nothing here is wired to an API route, the database or the UI.
 */
import { createHash } from 'node:crypto';
import {
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  WRITING_ENGINE_VERSION,
} from '../../domain/engine-version';
import {
  findHistoryClaims,
  findScoringLeakage,
  normaliseRequirementText,
  observationExtractionResultSchema,
} from '../../domain/schemas';
import type {
  BindingFailure,
  ModelConfigSnapshot,
  Observation,
  ObservationExtractionResult,
  PatternGroup,
  ResolvedTaskAnalysis,
} from '../../domain/types';
import { isTeacherDnaRuleId } from '../../prompts/knowledge/doc02-teacher-dna-rules';
import {
  OBSERVATION_JSON_SCHEMA,
  OBSERVATION_PROMPT_VERSION,
  type ObservationLlmItem,
  buildObservationExtractionPrompt,
  observationLlmOutputSchema,
} from '../../prompts/observation-extraction.prompt';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  assertPinnedModelConfig,
} from '../analysis/task-analysis.service';
import { bindQuote, verifyBinding } from '../validation/evidence-binding';
import { checkIntentPreservation } from '../validation/intent-preservation';

export { TASK_ANALYSIS_BENCHMARK_MODEL as OBSERVATION_BENCHMARK_MODEL };

export class ObservationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObservationConfigurationError';
  }
}

export class ObservationValidationError extends Error {
  readonly failures: string[];

  constructor(message: string, failures: string[] = []) {
    super(message);
    this.name = 'ObservationValidationError';
    this.failures = failures;
  }
}

// ---------------------------------------------------------------------------
// Request / dependencies
// ---------------------------------------------------------------------------

export interface ObservationLlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: typeof OBSERVATION_JSON_SCHEMA;
}

export interface ObservationLlmClient {
  generate(request: ObservationLlmRequest): Promise<unknown>;
}

/**
 * Deliberately minimal. There is no field for learner history, previous
 * writings, previous scores, course stage or exam proximity, and adding one
 * would be a visible architectural change rather than a quiet regression.
 */
export interface ObservationExtractionRequest {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
  model_config?: ModelConfigSnapshot;
}

const FORBIDDEN_REQUEST_KEYS = [
  'learner_history',
  'learner_context',
  'previous_writings',
  'previous_scores',
  'prior_scores',
  'previously_taught',
  'course_stage',
  'course_progress',
  'exam_date',
  'exam_proximity',
  'correction_focus',
  'previous_correction_focus',
  'student_profile',
] as const;

/** Layer 2 must be provably history-free, not merely documented as such. */
export function assertNoLearnerHistory(request: Record<string, unknown>): void {
  const present = Object.keys(request).filter((key) =>
    (FORBIDDEN_REQUEST_KEYS as readonly string[]).includes(key.toLowerCase()),
  );
  if (present.length) {
    throw new ObservationConfigurationError(
      `learner history must never reach observation extraction: received ${present.join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Deterministic identity
// ---------------------------------------------------------------------------

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function hashCandidateResponse(text: string): string {
  return `sha256:${sha256(String(text ?? ''))}`;
}

/**
 * Observation identity is a digest of the script, the versions and the
 * observation's own semantics — never its position in the model's array. Two
 * runs that produce the same evidence and the same diagnosis produce the same
 * id, whatever order the model emitted them in.
 */
export function computeObservationId(input: {
  candidate_response_hash: string;
  task_fingerprint: string;
  prompt_version: string;
  schema_version: string;
  model_snapshot: string;
  domain: string;
  observation_type: string;
  polarity: string;
  evidence_key: string;
  diagnosis: string;
}): string {
  const digest = sha256(
    [
      input.candidate_response_hash,
      input.task_fingerprint,
      input.prompt_version,
      input.schema_version,
      input.model_snapshot,
      input.domain,
      input.observation_type,
      input.polarity,
      input.evidence_key,
      normaliseRequirementText(input.diagnosis),
    ].join('|'),
  );
  return `obs_${digest.slice(0, 12)}`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function extractObservations(
  request: ObservationExtractionRequest,
  deps: { llm?: ObservationLlmClient } = {},
): Promise<ObservationExtractionResult> {
  assertNoLearnerHistory(request as unknown as Record<string, unknown>);

  const candidateResponse = String(request.candidate_response ?? '');
  const modelConfig = request.model_config ?? TASK_ANALYSIS_BENCHMARK_MODEL;
  assertPinnedModelConfig(modelConfig);

  if (!candidateResponse.trim()) {
    throw new ObservationConfigurationError(
      'observation extraction requires a candidate response',
    );
  }
  if (!deps.llm) {
    throw new ObservationConfigurationError(
      'observation extraction requires an explicit LLM client; there is no implicit default',
    );
  }

  const prompt = buildObservationExtractionPrompt({
    candidate_response: candidateResponse,
    task_analysis: request.task_analysis,
  });

  const raw = await deps.llm.generate({
    system: prompt.system,
    user: prompt.user,
    model_config: modelConfig,
    json_schema: OBSERVATION_JSON_SCHEMA,
  });

  const scoring = findScoringLeakage(raw);
  if (scoring.length) {
    throw new ObservationValidationError(
      'the observation model returned scoring or criterion-routing content',
      scoring,
    );
  }

  const history = findHistoryClaims(raw);
  if (history.length) {
    throw new ObservationValidationError(
      'the observation model made a learner-history claim it cannot support',
      history,
    );
  }

  const parsed = observationLlmOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ObservationValidationError(
      'the observation model output does not match the observation schema',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const candidateHash = hashCandidateResponse(candidateResponse);
  const taskFingerprint = request.task_analysis.provenance.task_fingerprint;
  const modelSnapshot = modelConfig.snapshot_id ?? modelConfig.model;

  const bindingFailures: BindingFailure[] = [];
  const built: Observation[] = [];

  for (const item of parsed.data.observations) {
    assertIntentPreserved(item, candidateResponse);

    const bound = bindObservation(item, candidateResponse);
    const evidenceKey = buildEvidenceKey(item, bound);

    const observationId = computeObservationId({
      candidate_response_hash: candidateHash,
      task_fingerprint: taskFingerprint,
      prompt_version: OBSERVATION_PROMPT_VERSION,
      schema_version: SCHEMA_VERSION,
      model_snapshot: modelSnapshot,
      domain: item.domain,
      observation_type: item.observation_type,
      polarity: item.polarity,
      evidence_key: evidenceKey,
      diagnosis: item.diagnosis,
    });

    if (bound.binding_status === 'unbindable' && item.text_quote) {
      bindingFailures.push({
        observation_id: observationId,
        quote: item.text_quote,
        occurrence_index: item.occurrence_index,
        reason: bound.failure_reason ?? 'quote_not_found',
      });
    }

    built.push({
      observation_id: observationId,
      domain: item.domain,
      observation_type: item.observation_type,
      polarity: item.polarity,
      scope: item.scope,
      text_quote: item.text_quote,
      occurrence_index: item.occurrence_index,
      span_start: bound.span_start,
      span_end: bound.span_end,
      bound_text: bound.bound_text,
      binding_status: bound.binding_status,
      renderable_locally: bound.binding_status === 'bound',
      supporting_evidence: bound.supporting_evidence,
      intended_meaning: item.intended_meaning ?? undefined,
      diagnosis: item.diagnosis,
      suggested_change: item.suggested_change ?? undefined,
      voice_preservation: normaliseVoicePreservation(item),
      communicative_impact: item.communicative_impact,
      meaning_blocking: item.communicative_impact === 'blocked',
      within_script_frequency: item.within_script_frequency,
      knowledge_status: item.knowledge_status,
      foundational_importance: item.foundational_importance,
      transferability: item.transferability,
      pedagogical_priority: item.pedagogical_priority,
      confidence: item.confidence,
      ambitious_attempt: item.ambitious_attempt,
      learning_opportunity: item.learning_opportunity
        ? {
            transferable_point: item.learning_opportunity.transferable_point,
            teaching_prompt: item.learning_opportunity.teaching_prompt ?? undefined,
          }
        : undefined,
      teacher_dna_rule_ids: item.teacher_dna_rule_ids.filter(isTeacherDnaRuleId),
      pattern_key: item.pattern_key ?? undefined,
    });
  }

  const deduplicated = deduplicateObservations(built);
  const { observations, pattern_groups } = groupPatterns(orderObservations(deduplicated));

  assertMeaningBlockingRetained(built, observations);

  const result = {
    status: 'complete' as const,
    base_correction_strategy: parsed.data.base_correction_strategy,
    principal_focus:
      parsed.data.base_correction_strategy === 'focused' ? parsed.data.principal_focus : null,
    strategy_rationale: parsed.data.strategy_rationale,
    observations,
    pattern_groups,
    binding_failures: bindingFailures.filter((failure) =>
      observations.some((observation) => observation.observation_id === failure.observation_id),
    ),
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      teacher_dna_version: SOURCE_DOC_VERSIONS.teacher_dna,
      task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
      observation_prompt_version: OBSERVATION_PROMPT_VERSION,
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      model_config: modelConfig,
      candidate_response_hash: candidateHash,
      task_fingerprint: taskFingerprint,
      llm_calls: 1,
      learner_history_available: false as const,
    },
  };

  const validated = observationExtractionResultSchema.safeParse(result);
  if (!validated.success) {
    throw new ObservationValidationError(
      'the assembled observation set does not satisfy the observation contract',
      validated.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const residualScoring = findScoringLeakage(validated.data);
  if (residualScoring.length) {
    throw new ObservationValidationError(
      'the assembled observation set contains scoring content',
      residualScoring,
    );
  }

  return validated.data;
}

// ---------------------------------------------------------------------------
// Evidence binding
// ---------------------------------------------------------------------------

interface BoundEvidence {
  binding_status: 'bound' | 'global_no_local_span' | 'unbindable';
  span_start?: number;
  span_end?: number;
  bound_text?: string;
  supporting_evidence: Observation['supporting_evidence'];
  failure_reason?: 'quote_not_found' | 'occurrence_out_of_range';
}

function bindObservation(item: ObservationLlmItem, candidateResponse: string): BoundEvidence {
  const supporting_evidence: Observation['supporting_evidence'] = [];
  for (const support of item.supporting_quotes) {
    const binding = bindQuote(candidateResponse, support.quote, support.occurrence_index);
    if (binding.status !== 'bound') continue;
    if (!verifyBinding(candidateResponse, binding.span_start, binding.span_end, binding.bound_text)) {
      continue;
    }
    supporting_evidence.push({
      quote: support.quote,
      occurrence_index: support.occurrence_index,
      span_start: binding.span_start,
      span_end: binding.span_end,
      bound_text: binding.bound_text,
    });
  }

  if (!item.text_quote) {
    return {
      binding_status: item.scope === 'global' ? 'global_no_local_span' : 'unbindable',
      supporting_evidence,
    };
  }

  const binding = bindQuote(candidateResponse, item.text_quote, item.occurrence_index);
  if (binding.status !== 'bound') {
    return { binding_status: 'unbindable', supporting_evidence, failure_reason: binding.reason };
  }
  if (!verifyBinding(candidateResponse, binding.span_start, binding.span_end, binding.bound_text)) {
    return { binding_status: 'unbindable', supporting_evidence, failure_reason: 'quote_not_found' };
  }

  return {
    binding_status: 'bound',
    span_start: binding.span_start,
    span_end: binding.span_end,
    bound_text: binding.bound_text,
    supporting_evidence,
  };
}

function buildEvidenceKey(item: ObservationLlmItem, bound: BoundEvidence): string {
  if (bound.binding_status === 'bound') {
    return `span:${bound.span_start}:${bound.span_end}`;
  }
  if (bound.supporting_evidence.length) {
    return `support:${bound.supporting_evidence.map((e) => `${e.span_start}-${e.span_end}`).join(',')}`;
  }
  return `quote:${normaliseRequirementText(item.text_quote ?? '')}:${item.occurrence_index}`;
}

function normaliseVoicePreservation(item: ObservationLlmItem): Observation['voice_preservation'] {
  if (!item.suggested_change || !item.voice_preservation) return undefined;
  return {
    preserves_stance: true,
    preserves_central_meaning: true,
    register_is_the_target: item.voice_preservation.register_is_the_target,
  };
}

function assertIntentPreserved(item: ObservationLlmItem, candidateResponse: string): void {
  const violations = checkIntentPreservation({
    text_quote: item.text_quote,
    suggested_change: item.suggested_change,
    candidate_response: candidateResponse,
    voice_preservation: item.voice_preservation ?? undefined,
  });
  if (violations.length) {
    throw new ObservationValidationError(
      `a suggested change would alter the learner's meaning: "${item.suggested_change}"`,
      violations,
    );
  }
}

// ---------------------------------------------------------------------------
// Deduplication, ordering and pattern grouping
// ---------------------------------------------------------------------------

/**
 * The same problem described twice collapses; separate occurrences of a
 * repeated pattern do not, because their location is pedagogically meaningful.
 */
function deduplicateObservations(observations: Observation[]): Observation[] {
  const seen = new Map<string, Observation>();
  for (const observation of observations) {
    const key = [
      observation.span_start ?? 'none',
      observation.span_end ?? 'none',
      observation.domain,
      normaliseRequirementText(observation.diagnosis),
    ].join('|');
    if (!seen.has(key)) seen.set(key, observation);
  }
  return [...seen.values()];
}

const DOMAIN_ORDER_TIEBREAK = (a: Observation, b: Observation) =>
  a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0;

/** Deterministic reading order: by position in the script, then domain, then diagnosis. */
function orderObservations(observations: Observation[]): Observation[] {
  return [...observations].sort((a, b) => {
    const aPos = a.span_start ?? Number.MAX_SAFE_INTEGER;
    const bPos = b.span_start ?? Number.MAX_SAFE_INTEGER;
    if (aPos !== bPos) return aPos - bPos;
    const byDomain = DOMAIN_ORDER_TIEBREAK(a, b);
    if (byDomain !== 0) return byDomain;
    const aDiagnosis = normaliseRequirementText(a.diagnosis);
    const bDiagnosis = normaliseRequirementText(b.diagnosis);
    if (aDiagnosis !== bDiagnosis) return aDiagnosis < bDiagnosis ? -1 : 1;
    return a.observation_id < b.observation_id ? -1 : a.observation_id > b.observation_id ? 1 : 0;
  });
}

/**
 * Occurrences of one underlying issue are grouped so they are taught once.
 * Frequency informs pedagogical treatment; it is never an error count.
 */
function groupPatterns(observations: Observation[]): {
  observations: Observation[];
  pattern_groups: PatternGroup[];
} {
  const buckets = new Map<string, Observation[]>();
  for (const observation of observations) {
    if (!observation.pattern_key) continue;
    const key = `${observation.domain}|${normaliseRequirementText(observation.pattern_key)}`;
    buckets.set(key, [...(buckets.get(key) ?? []), observation]);
  }

  const pattern_groups: PatternGroup[] = [];
  const groupIdByObservation = new Map<string, string>();
  let index = 0;

  for (const [, members] of [...buckets.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (members.length < 2) continue;
    index += 1;
    const pattern_group_id = `pg${String(index).padStart(2, '0')}`;
    pattern_groups.push({
      pattern_group_id,
      pattern_key: members[0].pattern_key as string,
      domain: members[0].domain,
      observation_ids: members.map((member) => member.observation_id),
    });
    for (const member of members) groupIdByObservation.set(member.observation_id, pattern_group_id);
  }

  return {
    observations: observations.map((observation) => {
      const pattern_group_id = groupIdByObservation.get(observation.observation_id);
      return pattern_group_id ? { ...observation, pattern_group_id } : observation;
    }),
    pattern_groups,
  };
}

/** Doc 02 R36: a meaning failure is never dropped, whatever focus was chosen. */
function assertMeaningBlockingRetained(
  before: Observation[],
  after: Observation[],
): void {
  const kept = new Set(after.map((observation) => observation.observation_id));
  const lost = before
    .filter((observation) => observation.meaning_blocking && !kept.has(observation.observation_id))
    .map((observation) => observation.observation_id);
  if (lost.length) {
    throw new ObservationValidationError(
      'a meaning-blocking observation was dropped during post-processing',
      lost,
    );
  }
}
