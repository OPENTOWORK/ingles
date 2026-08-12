/**
 * Phase 5 — deterministic validation.
 *
 * Answers one question: is this engine output structurally, evidentially and
 * architecturally valid enough to be accepted?
 *
 * It never rescores, never changes or repairs a Cambridge mark, never smooths a
 * profile and never generates feedback. Every function here is pure and
 * read-only; the test suite deep-freezes its inputs to keep it that way. When
 * something is wrong the validator names the rule and, where regeneration could
 * plausibly help, the stage to retry — the orchestrator decides what to do.
 *
 * No model client is imported here and none can be injected: validation is
 * entirely offline, so it cannot cost a request or introduce nondeterminism.
 */
import {
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  WRITING_ENGINE_VERSION,
} from '../../domain/engine-version';
import { isWritingCategoryKey } from '../../domain/categories';
import {
  CAMBRIDGE_CRITERION_KEYS,
  FINAL_CTA,
  assessmentRecordSchema,
  feedbackPayloadSchema,
  validateOpeningStrengthsCardinality,
  findForbiddenAssessmentHistoryKeys,
  findForbiddenObservationKeys,
  findForbiddenStylingKeys,
  findForbiddenTaskAnalysisKeys,
  findForbiddenV3FieldKeys,
  findHistoryClaims,
  findScoringLeakage,
  normaliseRequirementText,
  observationExtractionResultSchema,
  resolvedTaskAnalysisSchema,
  sumCriterionMarks,
  validationResultSchema,
} from '../../domain/schemas';
import { B2_FIRST_TASK_TYPES } from '../../domain/task-types';
import type {
  ValidationResult,
  ValidationRuleFailure,
  ValidationSeverity,
  ValidationStage,
} from '../../domain/types';
import {
  isDoc03RuleId,
  isRuleCitableBy,
} from '../../prompts/knowledge/doc03-assessment-rules';
import {
  describeExpectedStrengthCount,
  findFeedbackTextIssues,
} from '../feedback/feedback-composer.service';
import { bindQuote, verifyBinding } from './evidence-binding';
import { detectForbiddenHeuristics } from './forbidden-heuristics';

export const VALIDATOR_VERSION = '1.1.0';

/**
 * `current_generation` and `calibration` must run on the exact configuration
 * this build declares — a calibrated profile means nothing if the documents or
 * prompts underneath it have moved. `historical_read` exists so a stored result
 * produced under an older valid configuration stays readable; drift is then a
 * warning, but a drifted record may never still call itself calibrated.
 */
export type ValidationMode = 'current_generation' | 'calibration' | 'historical_read';

export const DEFAULT_VALIDATION_MODE: ValidationMode = 'current_generation';

/**
 * Rationales shorter than this are structural boilerplate ("Band 5 is the top
 * band") that legitimately reads the same under two criteria. Above it, an
 * identical sentence means the second criterion explained no distinct construct
 * consequence. This is an engineering threshold for duplicate detection, not a
 * Cambridge rule: it can never move a mark, only reject a record.
 */
export const MIN_DISTINCT_RATIONALE_LENGTH = 25;

/** Generic review_next reasons the composer must not recycle across items. */
const GENERIC_REVIEW_NEXT_REASON_PATTERNS = [
  /^it appeared in this response and it is the kind of detail an examiner notices immediately\.?$/i,
] as const;

const MECHANICAL_NEXT_FOCUS_PREFIX = /^to move closer to the next band/i;

const PINNED_SNAPSHOT_PATTERN = /-\d{4}-\d{2}-\d{2}$/;

type Loose = Record<string, unknown>;

function fail(
  rule_id: string,
  stage: ValidationStage,
  message: string,
  severity: ValidationSeverity = 'hard_failure',
  path?: string,
): ValidationRuleFailure {
  return { rule_id, stage, severity, message, ...(path ? { path } : {}) };
}

function asObject(value: unknown): Loose | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

// ---------------------------------------------------------------------------
// 1. Task analysis
// ---------------------------------------------------------------------------

export function validateTaskAnalysis(input: unknown): ValidationRuleFailure[] {
  const stage: ValidationStage = 'task_analysis';
  const failures: ValidationRuleFailure[] = [];
  const analysis = asObject(input);

  if (!analysis) {
    return [fail('V-TA-01', stage, 'no task analysis was supplied')];
  }

  const parsed = resolvedTaskAnalysisSchema.safeParse(analysis);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      failures.push(
        fail('V-TA-01', stage, `task analysis contract: ${issue.message}`, 'hard_failure',
          issue.path.join('.') || undefined),
      );
    }
  }

  if (!String(analysis.source_task_text ?? '').trim()) {
    failures.push(fail('V-TA-02', stage, 'the source task text is missing'));
  }

  const taskType = String(analysis.task_type ?? '');
  if (!(B2_FIRST_TASK_TYPES as readonly string[]).includes(taskType)) {
    failures.push(
      fail('V-TA-03', stage, `"${taskType}" is not an approved B2 First v1 task type`),
    );
  }

  const provenance = asObject(analysis.provenance);
  if (!provenance) {
    failures.push(fail('V-TA-04', stage, 'task analysis provenance is missing'));
  } else {
    for (const key of ['task_fingerprint', 'task_requirements_version', 'task_analysis_prompt_version']) {
      if (!String(provenance[key] ?? '').trim()) {
        failures.push(fail('V-TA-04', stage, `task analysis provenance is missing ${key}`));
      }
    }
    failures.push(...validateModelIdentity(provenance.model_config, stage, 'V-TA-05'));
  }

  // The three requirement classes must stay apart: a recommendation silently
  // promoted to a mandatory point would become a Content failure downstream.
  const mandatory = asArray(analysis.mandatory_genre_conventions)
    .map((item) => normaliseRequirementText(String(asObject(item)?.convention ?? '')))
    .filter(Boolean);
  const core = asArray(analysis.core_genre_expectations)
    .map((item) => normaliseRequirementText(String(asObject(item)?.expectation ?? '')))
    .filter(Boolean);
  const recommended = asArray(analysis.recommended_genre_features)
    .map((item) => normaliseRequirementText(String(asObject(item)?.feature ?? '')))
    .filter(Boolean);

  for (const [a, b, label] of [
    [mandatory, core, 'mandatory conventions and core expectations'],
    [mandatory, recommended, 'mandatory conventions and recommended features'],
    [core, recommended, 'core expectations and recommended features'],
  ] as Array<[string[], string[], string]>) {
    const overlap = a.filter((text) => b.includes(text));
    if (overlap.length) {
      failures.push(
        fail('V-TA-06', stage, `the same requirement appears in both ${label}: "${overlap[0]}"`),
      );
    }
  }

  const routing = findForbiddenTaskAnalysisKeys(analysis);
  if (routing.length) {
    failures.push(
      fail('V-TA-07', stage, `Layer 1 must not route requirements to a Cambridge criterion: ${routing.join(', ')}`),
    );
  }

  const guidance = asObject(analysis.word_guidance);
  if (guidance && guidance.automatic_penalty !== false) {
    failures.push(fail('V-TA-08', stage, 'word guidance must record automatic_penalty as false'));
  }

  // Honest propagation: a null reader must be reported as unresolved rather
  // than quietly filled in, and it makes the assessment incomplete (§4.8).
  const resolution = asObject(analysis.target_reader_resolution);
  const readerUnresolved =
    analysis.target_reader === null || resolution?.source === 'unresolved';
  if (readerUnresolved && analysis.target_reader !== null) {
    failures.push(fail('V-TA-09', stage, 'an unresolved target reader cannot carry a value'));
  }
  if (analysis.target_reader === null && resolution?.source !== 'unresolved') {
    failures.push(
      fail('V-TA-09', stage, 'a missing target reader must be reported as unresolved, not filled in'),
    );
  }

  failures.push(...detectForbiddenHeuristics(analysis, stage));
  return failures;
}

/** True once Phase 2 has exhausted its resolution chain (Doc 07 §4.8 decision 2). */
export function isTargetReaderUnresolved(taskAnalysis: unknown): boolean {
  const analysis = asObject(taskAnalysis);
  if (!analysis) return true;
  const resolution = asObject(analysis.target_reader_resolution);
  return analysis.target_reader === null || resolution?.source === 'unresolved';
}

// ---------------------------------------------------------------------------
// 2. Observations
// ---------------------------------------------------------------------------

export function validateObservations(
  input: unknown,
  candidateResponse: string,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'observations';
  const failures: ValidationRuleFailure[] = [];
  const result = asObject(input);

  if (!result) return [fail('V-OB-01', stage, 'no observation result was supplied')];

  const parsed = observationExtractionResultSchema.safeParse(result);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      failures.push(
        fail('V-OB-01', stage, `observation contract: ${issue.message}`, 'retryable_generation_failure',
          issue.path.join('.') || undefined),
      );
    }
  }

  const forbidden = findForbiddenObservationKeys(result);
  if (forbidden.length) {
    failures.push(fail('V-OB-02', stage, `Layer 2 must not carry scoring fields: ${forbidden.join(', ')}`));
  }
  const leakage = findScoringLeakage(result);
  if (leakage.length) {
    failures.push(fail('V-OB-03', stage, `scoring vocabulary leaked into observations: ${leakage.join(', ')}`));
  }
  const history = findHistoryClaims(result);
  if (history.length) {
    failures.push(fail('V-OB-04', stage, `observations must make no learner-history claim: ${history.join(', ')}`));
  }
  const styling = findForbiddenStylingKeys(result);
  if (styling.length) {
    failures.push(fail('V-OB-05', stage, `observations must carry no colour or UI information: ${styling.join(', ')}`));
  }

  const observations = asArray(result.observations);
  const patternCounts = new Map<string, number>();

  for (let i = 0; i < observations.length; i += 1) {
    const observation = asObject(observations[i]);
    if (!observation) continue;
    const path = `observations[${i}]`;

    const impact = String(observation.communicative_impact ?? '');
    if (observation.meaning_blocking !== (impact === 'blocked')) {
      failures.push(
        fail('V-OB-06', stage, 'meaning_blocking must be derived from communicative_impact', 'hard_failure', path),
      );
    }

    if (observation.scope === 'local') {
      failures.push(...validateLocalObservationBinding(observation, candidateResponse, path));
    }

    const group = observation.pattern_group_id;
    if (typeof group === 'string') {
      patternCounts.set(group, (patternCounts.get(group) ?? 0) + 1);
    }
  }

  // Grouping exists so a repeated pattern is taught once, not so occurrences can
  // be totalled. A group that publishes a count is an error tally in disguise.
  for (const group of asArray(result.pattern_groups)) {
    const record = asObject(group);
    if (!record) continue;
    for (const key of ['occurrence_count', 'count', 'total', 'error_count', 'severity_score']) {
      if (key in record) {
        failures.push(
          fail('V-OB-07', stage, `pattern grouping must not publish "${key}"; frequency informs teaching, not scoring`),
        );
      }
    }
  }

  const strategy = String(result.base_correction_strategy ?? '');
  if (strategy && !['comprehensive', 'focused'].includes(strategy)) {
    failures.push(fail('V-OB-08', stage, `"${strategy}" is not derivable from the current script alone`));
  }
  if (strategy === 'focused' && !String(result.principal_focus ?? '').trim()) {
    failures.push(fail('V-OB-08', stage, 'a focused strategy must name its principal focus', 'retryable_generation_failure'));
  }
  if (strategy === 'comprehensive' && String(result.principal_focus ?? '').trim()) {
    failures.push(fail('V-OB-08', stage, 'a comprehensive strategy has no single principal focus', 'retryable_generation_failure'));
  }

  return failures;
}

function validateLocalObservationBinding(
  observation: Loose,
  candidateResponse: string,
  path: string,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'observations';
  const failures: ValidationRuleFailure[] = [];
  const bindingStatus = String(observation.binding_status ?? '');

  if (bindingStatus === 'unbindable') {
    if (observation.renderable_locally !== false) {
      failures.push(
        fail('V-OB-09', stage, 'an unbindable observation must not be renderable locally', 'hard_failure', path),
      );
    }
    return failures;
  }

  const quote = typeof observation.text_quote === 'string' ? observation.text_quote : '';
  const start = observation.span_start;
  const end = observation.span_end;
  if (!quote || typeof start !== 'number' || typeof end !== 'number') {
    failures.push(
      fail('V-OB-10', stage, 'a bound local observation needs a quote and a resolved span', 'hard_failure', path),
    );
    return failures;
  }

  const boundText = typeof observation.bound_text === 'string' ? observation.bound_text : '';
  if (!verifyBinding(candidateResponse, start, end, boundText)) {
    failures.push(
      fail('V-OB-10', stage, `the span ${start}-${end} does not reproduce the source substring`, 'hard_failure', path),
    );
    return failures;
  }

  const occurrence = typeof observation.occurrence_index === 'number' ? observation.occurrence_index : 0;
  const rebound = bindQuote(candidateResponse, quote, occurrence);
  if (rebound.status !== 'bound' || rebound.span_start !== start || rebound.span_end !== end) {
    failures.push(
      fail('V-OB-10', stage, `occurrence ${occurrence} of "${quote}" does not resolve to ${start}-${end}`, 'hard_failure', path),
    );
  }
  return failures;
}

/** Only an independently re-bound observation may be cited as Cambridge evidence. */
export function eligibleObservationIds(
  observationResult: unknown,
  candidateResponse: string,
): Set<string> {
  const eligible = new Set<string>();
  const result = asObject(observationResult);
  if (!result) return eligible;

  for (const item of asArray(result.observations)) {
    const observation = asObject(item);
    if (!observation) continue;
    const id = String(observation.observation_id ?? '');
    if (!id) continue;

    if (observation.scope === 'local') {
      if (observation.binding_status !== 'bound' || observation.renderable_locally !== true) continue;
      const quote = typeof observation.text_quote === 'string' ? observation.text_quote : '';
      const occurrence =
        typeof observation.occurrence_index === 'number' ? observation.occurrence_index : 0;
      if (bindQuote(candidateResponse, quote, occurrence).status === 'bound') eligible.add(id);
      continue;
    }

    const supported = asArray(observation.supporting_evidence).some((support) => {
      const record = asObject(support);
      if (!record) return false;
      const quote = typeof record.quote === 'string' ? record.quote : '';
      const occurrence = typeof record.occurrence_index === 'number' ? record.occurrence_index : 0;
      return bindQuote(candidateResponse, quote, occurrence).status === 'bound';
    });
    if (supported) eligible.add(id);
  }
  return eligible;
}

// ---------------------------------------------------------------------------
// 3. Assessment record
// ---------------------------------------------------------------------------

export interface AssessmentValidationInput {
  assessment_record: unknown;
  provenance?: unknown;
  candidate_response: string;
  task_analysis?: unknown;
  observations?: unknown;
  mode?: ValidationMode;
}

export function validateAssessment(input: AssessmentValidationInput): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];
  const record = asObject(input.assessment_record);

  if (!record) return [fail('V-AS-01', stage, 'no assessment record was supplied')];

  const parsed = assessmentRecordSchema.safeParse(record);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      failures.push(
        fail('V-AS-01', stage, `assessment contract: ${issue.message}`, 'hard_failure',
          issue.path.join('.') || undefined),
      );
    }
  }

  const status = String(record.status ?? '');
  const criteria = asObject(record.criteria);

  if (status === 'incomplete') {
    failures.push(...validateIncomplete(record, criteria));
  } else if (status === 'complete') {
    failures.push(...validateComplete(record, criteria, input));
  } else {
    failures.push(fail('V-AS-01', stage, `"${status}" is not a valid assessment status`));
  }

  if (record.single_task_scale_claim_allowed !== false) {
    failures.push(fail('V-AS-12', stage, 'a single response may never claim an official scale score'));
  }
  if ('word_count' in record && record.word_count_penalty_applied !== false) {
    failures.push(fail('V-AS-13', stage, 'word count must record that no penalty was applied'));
  }

  const history = findForbiddenAssessmentHistoryKeys(record);
  if (history.length) {
    failures.push(fail('V-AS-14', stage, `learner history must never reach a mark: ${history.join(', ')}`));
  }

  failures.push(...validateNoProgressionLeakage(record, stage));
  failures.push(...detectForbiddenHeuristics(record, stage));
  failures.push(...validateProvenance(input.provenance, stage, input.mode ?? DEFAULT_VALIDATION_MODE));

  // §4.8 decision 2 — an unresolved reader cannot yield a complete /20.
  if (input.task_analysis && status === 'complete' && isTargetReaderUnresolved(input.task_analysis)) {
    failures.push(
      fail('V-AS-15', stage,
        'an unresolved target reader leaves Communicative Achievement unassessable, so the result must be incomplete'),
    );
  }

  return failures;
}

function validateIncomplete(record: Loose, criteria: Loose | null): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];

  if (!String(record.incomplete_reason ?? '').trim()) {
    failures.push(fail('V-AS-02', stage, 'an incomplete assessment must record its reason'));
  }
  if (criteria) {
    failures.push(fail('V-AS-03', stage, 'an incomplete assessment must not expose criterion marks'));
  }
  if (record.raw_total !== undefined) {
    failures.push(
      fail('V-AS-03', stage,
        `an incomplete assessment has no raw total; "insufficient evidence" is not ${record.raw_total}/20`),
    );
  }
  return failures;
}

function validateComplete(
  record: Loose,
  criteria: Loose | null,
  input: AssessmentValidationInput,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];

  if (!criteria) {
    return [fail('V-AS-04', stage, 'a complete assessment requires all four criterion decisions')];
  }

  const present = Object.keys(criteria);
  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    if (!(key in criteria)) {
      failures.push(fail('V-AS-04', stage, `the ${key} decision is missing`));
    }
  }
  for (const key of present) {
    if (!(CAMBRIDGE_CRITERION_KEYS as readonly string[]).includes(key)) {
      failures.push(fail('V-AS-04', stage, `"${key}" is not a Cambridge criterion`));
    }
  }

  const eligible = input.observations
    ? eligibleObservationIds(input.observations, input.candidate_response)
    : null;

  const marks: number[] = [];
  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    const decision = asObject(criteria[key]);
    if (!decision) continue;
    const path = `criteria.${key}`;

    if (decision.criterion !== key) {
      failures.push(fail('V-AS-04', stage, `${path}.criterion must equal "${key}"`, 'hard_failure', path));
    }

    const mark = decision.mark;
    if (typeof mark !== 'number' || !Number.isInteger(mark) || mark < 0 || mark > 5) {
      failures.push(
        fail('V-AS-05', stage, `${path}.mark must be a whole number from 0 to 5, received ${String(mark)}`,
          'hard_failure', path),
      );
    } else {
      marks.push(mark);
      failures.push(...validateBandBoundary(decision, mark, path));
    }

    failures.push(...validateCriterionEvidence(decision, input, eligible, path));
    failures.push(...validateCriterionProvenance(decision, key, path));
  }

  // Doc 03 S02 — the total is derived, never asserted.
  if (marks.length === CAMBRIDGE_CRITERION_KEYS.length) {
    const expected = sumCriterionMarks(criteria as never);
    if (record.raw_total !== expected) {
      failures.push(
        fail('V-AS-06', stage,
          `raw_total must be the exact sum of the four marks (${expected}), received ${String(record.raw_total)}`),
      );
    }
    if (typeof record.raw_total === 'number' && record.raw_total > 20) {
      failures.push(fail('V-AS-06', stage, 'raw_total cannot exceed 20 for one response'));
    }
  }

  failures.push(...validateCriterionIndependence(criteria));
  return failures;
}

function validateBandBoundary(
  decision: Loose,
  mark: number,
  path: string,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];

  const whyNotHigher = String(decision.why_not_higher ?? '').trim();
  const whyNotLower = String(decision.why_not_lower ?? '').trim();

  if (mark <= 4 && !whyNotHigher) {
    failures.push(
      fail('V-AS-07', stage, 'every mark below the ceiling must say why the next band is not reached',
        'retryable_generation_failure', `${path}.why_not_higher`),
    );
  }
  if (mark === 5 && !whyNotHigher) {
    failures.push(
      fail('V-AS-07', stage, 'a band 5 must state that band 5 is the top of the scale',
        'retryable_generation_failure', `${path}.why_not_higher`),
    );
  }
  if (mark >= 1 && !whyNotLower) {
    failures.push(
      fail('V-AS-08', stage, 'every mark from 1 to 5 must say why the lower band is exceeded',
        'retryable_generation_failure', `${path}.why_not_lower`),
    );
  }
  if (mark === 0 && whyNotLower) {
    failures.push(
      fail('V-AS-08', stage, 'band 0 is the bottom of the scale and has no lower band to compare with',
        'hard_failure', `${path}.why_not_lower`),
    );
  }
  if (decision.band_ceiling_reached !== (mark === 5)) {
    failures.push(fail('V-AS-09', stage, 'band_ceiling_reached must follow the mark', 'hard_failure', path));
  }
  if (decision.band_floor_reached !== (mark === 0)) {
    failures.push(fail('V-AS-09', stage, 'band_floor_reached must follow the mark', 'hard_failure', path));
  }

  const adjacent = asObject(decision.adjacent_band_evidence);
  if (mark === 2 || mark === 4) {
    if (!adjacent) {
      failures.push(
        fail('V-AS-10', stage, `band ${mark} is a mixed profile and needs evidence from both neighbours`,
          'retryable_generation_failure', `${path}.adjacent_band_evidence`),
      );
    } else {
      for (const side of ['lower_band_evidence', 'higher_band_evidence'] as const) {
        if (!String(adjacent[side] ?? '').trim()) {
          failures.push(
            fail('V-AS-10', stage, `band ${mark} requires concrete ${side.replace('_', ' ')}`,
              'retryable_generation_failure', `${path}.adjacent_band_evidence.${side}`),
          );
        }
      }
      for (const side of ['lower_band_reference', 'higher_band_reference'] as const) {
        if (!String(adjacent[side] ?? '').trim()) {
          failures.push(
            fail('V-AS-10', stage, `band ${mark} requires a ${side.replace('_', ' ')}`,
              'retryable_generation_failure', `${path}.adjacent_band_evidence.${side}`),
          );
        }
      }
    }
  } else if (adjacent) {
    failures.push(
      fail('V-AS-10', stage, 'adjacent-band evidence belongs to the mixed bands 2 and 4 only',
        'hard_failure', `${path}.adjacent_band_evidence`),
    );
  }

  const confidence = String(decision.confidence ?? '');
  if (!['high', 'medium', 'low'].includes(confidence)) {
    failures.push(
      fail('V-AS-11', stage, `"${confidence}" is not a Doc 03 confidence value (high, medium, low)`,
        'hard_failure', `${path}.confidence`),
    );
  }
  if (confidence !== 'high' && !String(decision.confidence_reason ?? '').trim()) {
    failures.push(
      fail('V-AS-11', stage, 'confidence below high must record its reason',
        'retryable_generation_failure', `${path}.confidence_reason`),
    );
  }
  return failures;
}

function validateCriterionEvidence(
  decision: Loose,
  input: AssessmentValidationInput,
  eligible: Set<string> | null,
  path: string,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];
  const evidence = asArray(decision.text_evidence);

  if (!evidence.length) {
    failures.push(
      fail('V-EV-01', stage, 'every criterion decision must cite text evidence',
        'retryable_generation_failure', path),
    );
  }

  for (let i = 0; i < evidence.length; i += 1) {
    const item = asObject(evidence[i]);
    const itemPath = `${path}.text_evidence[${i}]`;
    if (!item) {
      failures.push(fail('V-EV-01', stage, 'malformed evidence item', 'hard_failure', itemPath));
      continue;
    }

    const quote = typeof item.quote === 'string' ? item.quote : '';
    const boundText = typeof item.bound_text === 'string' ? item.bound_text : '';
    const start = item.span_start;
    const end = item.span_end;
    const occurrence = typeof item.occurrence_index === 'number' ? item.occurrence_index : 0;

    if (typeof start !== 'number' || typeof end !== 'number') {
      failures.push(fail('V-EV-02', stage, 'evidence must carry a resolved span', 'hard_failure', itemPath));
      continue;
    }
    // A forged offset is the dangerous case: the record looks traceable while
    // pointing somewhere else in the script.
    if (!verifyBinding(input.candidate_response, start, end, boundText)) {
      failures.push(
        fail('V-EV-02', stage, `the span ${start}-${end} does not reproduce "${boundText}" in the response`,
          'hard_failure', itemPath),
      );
      continue;
    }
    const rebound = bindQuote(input.candidate_response, quote, occurrence);
    if (rebound.status !== 'bound') {
      const detail =
        rebound.reason === 'occurrence_out_of_range'
          ? `occurrence_out_of_range (requested_occurrence_index=${occurrence}, occurrences_found=${rebound.occurrences_found})`
          : `quote_not_found (requested_occurrence_index=${occurrence}, occurrences_found=${rebound.occurrences_found})`;
      failures.push(
        fail('V-EV-03', stage, `the quote "${quote}" failed binding: ${detail}`,
          'hard_failure', itemPath),
      );
      continue;
    }
    if (rebound.span_start !== start || rebound.span_end !== end) {
      failures.push(
        fail('V-EV-04', stage,
          `occurrence ${occurrence} of "${quote}" resolves to ${rebound.span_start}-${rebound.span_end}, not ${start}-${end}`,
          'hard_failure', itemPath),
      );
    }
  }

  // A Cambridge quote needs no observation id — the assessment reads the whole
  // response. But an id that is cited must point at an eligible observation.
  if (eligible) {
    for (const id of asArray(decision.evidence_observation_ids)) {
      if (typeof id === 'string' && !eligible.has(id)) {
        failures.push(
          fail('V-EV-05', stage,
            `observation "${id}" is not eligible as Cambridge evidence; its evidence could not be bound independently`,
            'hard_failure', path),
        );
      }
    }
  }
  return failures;
}

function validateCriterionProvenance(
  decision: Loose,
  criterion: string,
  path: string,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];
  const ruleIds = asArray(decision.source_rule_ids).filter(
    (id): id is string => typeof id === 'string',
  );

  if (!ruleIds.length) {
    failures.push(
      fail('V-PR-01', stage, 'a score decision must cite its Cambridge scoring provenance',
        'retryable_generation_failure', `${path}.source_rule_ids`),
    );
    return failures;
  }

  const unknown = ruleIds.filter((id) => !isDoc03RuleId(id));
  if (unknown.length) {
    const teacherDna = unknown.filter((id) => /^R\d{2}$/.test(id));
    failures.push(
      fail('V-PR-02', stage,
        teacherDna.length
          ? `Teacher DNA rules are not scoring authority: ${teacherDna.join(', ')}`
          : `unknown scoring rule ids: ${unknown.join(', ')}`,
        'hard_failure', `${path}.source_rule_ids`),
    );
  }

  const known = ruleIds.filter(isDoc03RuleId);
  if (known.length && !known.some((id) => isRuleCitableBy(criterion as never, id))) {
    failures.push(
      fail('V-PR-03', stage,
        `${criterion} is justified only by rules belonging to another construct: ${known.join(', ')}`,
        'hard_failure', `${path}.source_rule_ids`),
    );
  }
  return failures;
}

/**
 * Structural only. A shared textual feature is legitimate; a rationale copied
 * verbatim into a second criterion is not, because each construct must explain
 * its own consequence (Doc 03 X01, X09). Semantic paraphrase is deliberately
 * left to borderline fixtures, golden calibration and human review — no second
 * model call is made here.
 */
function validateCriterionIndependence(criteria: Loose): ValidationRuleFailure[] {
  const stage: ValidationStage = 'assessment';
  const failures: ValidationRuleFailure[] = [];
  const seen = new Map<string, string>();

  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    const decision = asObject(criteria[key]);
    if (!decision) continue;

    const rationales = [
      decision.band_ceiling_reached === true ? '' : String(decision.why_not_higher ?? ''),
      String(decision.why_not_lower ?? ''),
      ...asArray(decision.positive_evidence).map(String),
      ...asArray(decision.limiting_evidence).map(String),
    ].filter((text) => text.trim().length > 0);

    for (const rationale of rationales) {
      const normalised = normaliseRequirementText(rationale);
      if (normalised.length < MIN_DISTINCT_RATIONALE_LENGTH) continue;
      const owner = seen.get(normalised);
      if (owner && owner !== key) {
        failures.push(
          fail('V-AS-16', stage,
            `${owner} and ${key} reuse the same rationale, so one of them explains no distinct construct consequence: "${rationale}"`),
        );
      } else {
        seen.set(normalised, key);
      }
    }
  }
  return failures;
}

// ---------------------------------------------------------------------------
// 3b. Feedback payload (Phase 6)
// ---------------------------------------------------------------------------

export interface FeedbackValidationInput {
  feedback_payload: unknown;
  assessment_record: unknown;
  candidate_response: string;
  observations?: unknown;
}

/**
 * Feedback explains the assessment; it may not become a second assessment. The
 * first rule here is the important one: whatever prose the model produced, the
 * numbers on the page must be the numbers the examiner layer decided.
 */
export function validateFeedbackPayload(
  input: FeedbackValidationInput,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const payload = asObject(input.feedback_payload);

  if (!payload) return [fail('V-FB-01', stage, 'no feedback payload was supplied')];

  const parsed = feedbackPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      failures.push(
        fail('V-FB-01', stage, `feedback contract: ${issue.message}`, 'retryable_generation_failure',
          issue.path.join('.') || undefined),
      );
    }
  }

  failures.push(...validateFrozenMarks(payload, input.assessment_record));
  failures.push(...validateCriterionFeedback(payload));
  failures.push(...validateFeedbackAnnotations(payload, input));
  failures.push(...validateFeedbackStrengths(payload, input.observations));
  failures.push(...validateReviewNext(payload, input));

  if (payload.final_cta !== FINAL_CTA) {
    failures.push(
      fail('V-FB-09', stage, `the final action must be exactly "${FINAL_CTA}"`, 'hard_failure', 'final_cta'),
    );
  }

  const styling = findForbiddenStylingKeys(payload);
  if (styling.length) {
    failures.push(fail('V-FB-10', stage, `feedback carries no colour or styling: ${styling.join(', ')}`));
  }

  for (const issue of findFeedbackTextIssues(payload, payload.learner_history_applied === true)) {
    const rule =
      issue.kind === 'history_claim'
        ? 'V-FB-11'
        : issue.kind === 'ai_voice'
          ? 'V-FB-12'
          : issue.kind === 'false_authority'
            ? 'V-FB-13'
            : 'V-FB-14';
    failures.push(fail(rule, stage, `${issue.kind}: "${issue.match}"`, 'hard_failure', issue.path));
  }

  failures.push(...validateNoProgressionLeakage(payload, stage));
  failures.push(...detectForbiddenHeuristics(payload, stage));
  return failures;
}

function validateFrozenMarks(payload: Loose, assessmentRecord: unknown): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const record = asObject(assessmentRecord);
  const criteria = asObject(record?.criteria);
  const result = asObject(payload.global_result);

  if (!criteria || !result) {
    return [fail('V-FB-02', stage, 'frozen marks cannot be verified without a complete assessment')];
  }

  const shown = asObject(result.criteria);
  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    const expected = asObject(criteria[key])?.mark;
    if (shown?.[key] !== expected) {
      failures.push(
        fail('V-FB-02', stage,
          `feedback shows ${key} as ${String(shown?.[key])} but the assessment decided ${String(expected)}`,
          'hard_failure', `global_result.criteria.${key}`),
      );
    }
  }
  if (result.raw_total !== record?.raw_total) {
    failures.push(
      fail('V-FB-02', stage,
        `feedback shows ${String(result.raw_total)}/20 but the assessment decided ${String(record?.raw_total)}/20`,
        'hard_failure', 'global_result.raw_total'),
    );
  }

  for (const row of asArray(payload.criterion_feedback)) {
    const entry = asObject(row);
    if (!entry) continue;
    const key = String(entry.criterion);
    const expected = asObject(criteria[key])?.mark;
    if (entry.mark !== expected) {
      failures.push(
        fail('V-FB-02', stage,
          `criterion feedback restates ${key} as ${String(entry.mark)} instead of ${String(expected)}`),
      );
    }
  }
  return failures;
}

function validateFeedbackAnnotations(
  payload: Loose,
  input: FeedbackValidationInput,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const byId = new Map<string, Loose>();

  for (const item of asArray(asObject(input.observations)?.observations)) {
    const observation = asObject(item);
    if (observation) byId.set(String(observation.observation_id), observation);
  }

  const annotations = asArray(payload.annotations);
  for (let i = 0; i < annotations.length; i += 1) {
    const annotation = asObject(annotations[i]);
    if (!annotation) continue;
    const path = `annotations[${i}]`;

    if (!isWritingCategoryKey(String(annotation.category_key))) {
      failures.push(
        fail('V-FB-03', stage, `"${String(annotation.category_key)}" is not one of the six closed categories`,
          'hard_failure', path),
      );
    }

    const start = annotation.span_start;
    const end = annotation.span_end;
    const original = String(annotation.original_text ?? '');
    if (typeof start !== 'number' || typeof end !== 'number' ||
        !verifyBinding(input.candidate_response, start, end, original)) {
      failures.push(
        fail('V-FB-04', stage, `the annotation span does not reproduce "${original}" in the response`,
          'hard_failure', path),
      );
    }

    if (!byId.size) continue;
    const source = byId.get(String(annotation.observation_id));
    if (!source) {
      failures.push(
        fail('V-FB-05', stage, `annotation cites unknown observation "${String(annotation.observation_id)}"`,
          'hard_failure', path),
      );
      continue;
    }
    // An observation Phase 3 could not place on the text cannot acquire a
    // position simply by being rendered.
    if (source.binding_status !== 'bound' || source.renderable_locally !== true) {
      failures.push(
        fail('V-FB-05', stage,
          `observation "${String(annotation.observation_id)}" is not locally renderable and cannot become an annotation`,
          'hard_failure', path),
      );
      continue;
    }
    if (source.span_start !== start || source.span_end !== end) {
      failures.push(
        fail('V-FB-04', stage,
          `the annotation span ${String(start)}-${String(end)} does not match the observation span ${String(source.span_start)}-${String(source.span_end)}`,
          'hard_failure', path),
      );
    }
  }
  return failures;
}

function validateFeedbackStrengths(
  payload: Loose,
  observations: unknown,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const positive = new Set<string>();
  const known = new Set<string>();

  for (const item of asArray(asObject(observations)?.observations)) {
    const observation = asObject(item);
    if (!observation) continue;
    known.add(String(observation.observation_id));
    // Eligible for opening strengths = genuine positive evidence that can be
    // shown locally (same gate as feedback-composer selectEligibleStrengths).
    if (
      observation.polarity === 'positive' &&
      observation.observation_type === 'strength' &&
      observation.renderable_locally === true
    ) {
      positive.add(String(observation.observation_id));
    }
  }
  if (!known.size) return failures;

  const strengths = asArray(payload.opening_strengths);
  for (let i = 0; i < strengths.length; i += 1) {
    const strength = asObject(strengths[i]);
    if (!strength) continue;
    const id = String(strength.observation_id);
    if (!known.has(id)) {
      failures.push(
        fail('V-FB-06', stage, `opening strength cites unknown observation "${id}"`,
          'hard_failure', `opening_strengths[${i}]`),
      );
    } else if (!positive.has(id)) {
      failures.push(
        fail('V-FB-06', stage, `opening strength "${id}" does not refer to positive evidence`,
          'hard_failure', `opening_strengths[${i}]`),
      );
    }
  }

  if (positive.size === 0 && strengths.length > 0) {
    failures.push(
      fail('V-FB-07', stage, 'praise was generated although the response offered no genuine strength'),
    );
    return failures;
  }

  // Over- or under-selection is a bad generation, not a bad architecture: the
  // right answer is to compose again, never to slice the array and let code
  // decide which of the learner's genuine strengths is dropped.
  if (!validateOpeningStrengthsCardinality(strengths as never, positive.size)) {
    failures.push(
      fail('V-FB-07', stage,
        `${strengths.length} opening strengths were selected from ${positive.size} eligible: ${describeExpectedStrengthCount(positive.size)}`,
        'retryable_generation_failure', 'opening_strengths'),
    );
  }
  return failures;
}

function normaliseFeedbackPhrase(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function isMechanicalNextFocus(nextFocus: string, whatLimited: string): boolean {
  const trimmed = nextFocus.trim();
  if (MECHANICAL_NEXT_FOCUS_PREFIX.test(trimmed)) return true;

  const normalisedFocus = normaliseFeedbackPhrase(trimmed);
  const normalisedLimit = normaliseFeedbackPhrase(whatLimited);
  if (!normalisedLimit || normalisedLimit.length < 10) return false;

  let stripped = normalisedFocus.replace(/^to move closer to the next band work on /, '');
  stripped = stripped.replace(/^work on /, '');
  if (stripped === normalisedLimit) return true;
  if (
    normalisedLimit.length >= MIN_DISTINCT_RATIONALE_LENGTH &&
    normalisedFocus.includes(normalisedLimit) &&
    stripped.length <= normalisedLimit.length + 8
  ) {
    return true;
  }
  return false;
}

function validateCriterionFeedback(payload: Loose): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const rows = asArray(payload.criterion_feedback);

  for (let i = 0; i < rows.length; i += 1) {
    const row = asObject(rows[i]);
    if (!row) continue;
    const expanded = asObject(row.expanded);
    const whatLimited = String(expanded?.what_limited_the_band ?? '');
    const nextFocus = String(expanded?.next_focus ?? row.next_focus ?? '');
    const path = `criterion_feedback[${i}].expanded.next_focus`;

    if (nextFocus && whatLimited && isMechanicalNextFocus(nextFocus, whatLimited)) {
      failures.push(
        fail(
          'V-FB-15',
          stage,
          'next_focus must be independently composed, not a mechanical reuse of what_limited_the_band',
          'retryable_generation_failure',
          path,
        ),
      );
    }
  }
  return failures;
}

function validateReviewNext(
  payload: Loose,
  input: FeedbackValidationInput,
): ValidationRuleFailure[] {
  const stage: ValidationStage = 'feedback';
  const failures: ValidationRuleFailure[] = [];
  const observationIds = new Set(
    asArray(asObject(input.observations)?.observations)
      .map((item) => String(asObject(item)?.observation_id ?? ''))
      .filter(Boolean),
  );

  const items = asArray(payload.review_next);
  const seenReasons = new Map<string, number>();

  for (let i = 0; i < items.length; i += 1) {
    const item = asObject(items[i]);
    if (!item) continue;
    const path = `review_next[${i}]`;

    if (item.resource_key !== null) {
      failures.push(fail('V-FB-08', stage, 'v1 review items carry no resource link', 'hard_failure', path));
    }
    const ids = asArray(item.source_ids).map(String);
    if (!ids.length) {
      failures.push(fail('V-FB-08', stage, 'a review item must name its evidence', 'hard_failure', path));
      continue;
    }
    if (item.source === 'observation' && observationIds.size) {
      const unknownId = ids.find((id) => !observationIds.has(id));
      if (unknownId) {
        failures.push(
          fail('V-FB-08', stage, `review item cites unknown observation "${unknownId}"`, 'hard_failure', path),
        );
      }
    }
    if (item.source === 'assessment_limitation') {
      const unknownKey = ids.find((id) => !(CAMBRIDGE_CRITERION_KEYS as readonly string[]).includes(id));
      if (unknownKey) {
        failures.push(
          fail('V-FB-08', stage, `"${unknownKey}" is not a Cambridge criterion`, 'hard_failure', path),
        );
      }
    }

    const reason = String(item.reason ?? '').trim();
    if (reason) {
      for (const pattern of GENERIC_REVIEW_NEXT_REASON_PATTERNS) {
        if (pattern.test(reason)) {
          failures.push(
            fail(
              'V-FB-16',
              stage,
              'review_next reason is too generic; explain why this particular concept matters',
              'retryable_generation_failure',
              `${path}.reason`,
            ),
          );
          break;
        }
      }

      const normalised = normaliseFeedbackPhrase(reason);
      if (normalised.length >= MIN_DISTINCT_RATIONALE_LENGTH) {
        const duplicateIndex = seenReasons.get(normalised);
        if (duplicateIndex !== undefined) {
          failures.push(
            fail(
              'V-FB-16',
              stage,
              `review_next[${duplicateIndex}] and review_next[${i}] repeat the same substantive reason`,
              'retryable_generation_failure',
              `${path}.reason`,
            ),
          );
        } else {
          seenReasons.set(normalised, i);
        }
      }
    }
  }
  return failures;
}

// ---------------------------------------------------------------------------
// 4. Progression leakage and provenance
// ---------------------------------------------------------------------------

/**
 * The 12/20 star rule is `legacy_product_progression_rule` and lives outside the
 * engine. Nothing here evaluates it; this only stops its vocabulary appearing in
 * a v3 contract.
 */
export function validateNoProgressionLeakage(
  value: unknown,
  stage: ValidationStage = 'engine_output',
): ValidationRuleFailure[] {
  const failures: ValidationRuleFailure[] = [];
  const keys = findForbiddenV3FieldKeys(value);
  if (keys.length) {
    failures.push(
      fail('V-PL-01', stage, `v3 contracts must not expose progression fields: ${keys.join(', ')}`),
    );
  }
  for (const failure of detectForbiddenHeuristics(value, stage)) {
    if (['FH-09', 'FH-10', 'FH-11', 'FH-12', 'FH-13'].includes(failure.rule_id)) {
      failures.push({ ...failure, rule_id: 'V-PL-02' });
    }
  }
  return failures;
}

export function validateProvenance(
  provenance: unknown,
  stage: ValidationStage,
  mode: ValidationMode = DEFAULT_VALIDATION_MODE,
): ValidationRuleFailure[] {
  const failures: ValidationRuleFailure[] = [];
  if (provenance === undefined) return failures;

  const record = asObject(provenance);
  if (!record) return [fail('V-VS-01', stage, 'provenance must be an object')];

  const historical = mode === 'historical_read';
  const driftSeverity: ValidationSeverity = historical ? 'non_blocking_warning' : 'hard_failure';
  const drifted: string[] = [];

  const required: Array<[string, unknown]> = [
    ['engine_version', record.engine_version],
    ['schema_version', record.schema_version],
  ];
  for (const [name, value] of required) {
    if (!String(value ?? '').trim()) {
      failures.push(fail('V-VS-01', stage, `provenance is missing ${name}`));
    }
  }
  if (record.engine_version && record.engine_version !== WRITING_ENGINE_VERSION) {
    drifted.push('engine_version');
    failures.push(
      fail('V-VS-02', stage,
        `provenance records engine ${String(record.engine_version)} but this build is ${WRITING_ENGINE_VERSION}`,
        driftSeverity),
    );
  }
  if (record.schema_version && record.schema_version !== SCHEMA_VERSION) {
    drifted.push('schema_version');
    failures.push(
      fail('V-VS-02', stage,
        `provenance records schema ${String(record.schema_version)} but this build is ${SCHEMA_VERSION}`,
        driftSeverity),
    );
  }

  const docs = asObject(record.doc_versions);
  if (!docs) {
    failures.push(fail('V-VS-03', stage, 'provenance is missing the source document versions'));
  } else {
    for (const key of ['task_requirements', 'teacher_dna', 'cambridge_assessment'] as const) {
      if (!String(docs[key] ?? '').trim()) {
        failures.push(fail('V-VS-03', stage, `provenance is missing the ${key} document version`));
      } else if (docs[key] !== SOURCE_DOC_VERSIONS[key]) {
        drifted.push(key);
        failures.push(
          fail('V-VS-03', stage,
            `provenance records ${key} ${String(docs[key])} but this build uses ${SOURCE_DOC_VERSIONS[key]}`,
            driftSeverity),
        );
      }
    }
  }

  const promptVersion =
    record.assessment_prompt_version ?? record.prompt_version ?? asObject(record.prompt_versions);
  if (!promptVersion) {
    failures.push(fail('V-VS-04', stage, 'provenance is missing the prompt version'));
  }

  failures.push(...validateModelIdentity(record.model_config, stage, 'V-VS-05'));

  // Readability is not authority: an old record may be displayed, but it cannot
  // keep claiming a calibration that was measured on a different configuration.
  if (historical && drifted.length && record.calibration_status === 'calibrated') {
    failures.push(
      fail('V-VS-06', stage,
        `a historical result cannot present itself as calibrated after ${drifted.join(', ')} changed`),
    );
  }
  return failures;
}

function validateModelIdentity(
  config: unknown,
  stage: ValidationStage,
  ruleId: string,
): ValidationRuleFailure[] {
  const record = asObject(config);
  if (!record) return [fail(ruleId, stage, 'the model identity is missing from provenance')];

  const snapshot = String(record.snapshot_id ?? record.model ?? '');
  if (!snapshot) {
    return [fail(ruleId, stage, 'the model identity is missing from provenance')];
  }
  if (!PINNED_SNAPSHOT_PATTERN.test(snapshot)) {
    return [
      fail(ruleId, stage,
        `"${snapshot}" is not a pinned dated snapshot; no production model is approved for calibration yet`),
    ];
  }
  return [];
}

// ---------------------------------------------------------------------------
// 5. Composite entry point
// ---------------------------------------------------------------------------

export interface EngineValidationInput {
  candidate_response: string;
  task_analysis?: unknown;
  observations?: unknown;
  assessment?: unknown;
  feedback?: unknown;
  attempt?: number;
  mode?: ValidationMode;
  now?: () => string;
}

/** Earlier stages are regenerated first: a bad task analysis poisons everything after it. */
const RETRY_ORDER: ValidationStage[] = ['task_analysis', 'observations', 'assessment', 'feedback'];

export function validateEngineOutput(input: EngineValidationInput): ValidationResult {
  const failures: ValidationRuleFailure[] = [];

  if (input.task_analysis !== undefined) {
    failures.push(...validateTaskAnalysis(input.task_analysis));
  }
  if (input.observations !== undefined) {
    failures.push(...validateObservations(input.observations, input.candidate_response));
  }
  if (input.assessment !== undefined) {
    const assessment = asObject(input.assessment);
    failures.push(
      ...validateAssessment({
        assessment_record: assessment?.assessment_record ?? input.assessment,
        provenance: assessment?.provenance,
        candidate_response: input.candidate_response,
        task_analysis: input.task_analysis,
        observations: input.observations,
        mode: input.mode,
      }),
    );
  }

  if (input.feedback !== undefined) {
    const assessment = asObject(input.assessment);
    failures.push(
      ...validateFeedbackPayload({
        feedback_payload: input.feedback,
        assessment_record: assessment?.assessment_record ?? input.assessment,
        candidate_response: input.candidate_response,
        observations: input.observations,
      }),
    );
  }

  return buildValidationResult(failures, {
    stage: 'engine_output',
    attempt: input.attempt ?? 1,
    now: input.now,
  });
}

export function buildValidationResult(
  failures: ValidationRuleFailure[],
  options: { stage: ValidationStage; attempt?: number; now?: () => string },
): ValidationResult {
  const warnings = failures.filter((f) => f.severity === 'non_blocking_warning');
  const blocking = failures.filter((f) => f.severity !== 'non_blocking_warning');
  const hard = blocking.filter((f) => f.severity === 'hard_failure');

  let validation_status: ValidationResult['validation_status'] = 'passed';
  let retry_target: ValidationStage | undefined;
  let retry_reason: string | undefined;

  if (hard.length) {
    validation_status = 'failed';
  } else if (blocking.length) {
    validation_status = 'retry_required';
    retry_target = RETRY_ORDER.find((stage) => blocking.some((f) => f.stage === stage));
    retry_reason = `${blocking.length} rule(s) could be resolved by regenerating ${retry_target}: ${blocking
      .map((f) => f.rule_id)
      .join(', ')}`;
  }

  return validationResultSchema.parse({
    validation_status,
    stage: options.stage,
    attempt: options.attempt ?? 1,
    failed_rules: blocking,
    warnings,
    ...(retry_target ? { retry_target } : {}),
    ...(retry_reason ? { retry_reason } : {}),
    validated_at: (options.now ?? (() => new Date().toISOString()))(),
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    validator_version: VALIDATOR_VERSION,
  });
}
