/**
 * Phase 9 — Cambridge golden calibration types.
 *
 * Golden labels and examiner commentary live here and in golden-cases.ts only.
 * They must never be passed into Task Analysis, Observation or Assessment requests.
 */

import type { B2FirstTaskType } from '../domain/task-types';

export type GoldenSourceFamily = 'digital' | 'paper';

export type GoldenSourceVerificationStatus = 'verified' | 'GOLDEN_SOURCE_MISSING';

export interface GoldenExpectedMarks {
  content: number;
  communicative_achievement: number;
  organisation: number;
  language: number;
}

export interface GoldenSourceVerification {
  task_prompt: GoldenSourceVerificationStatus;
  candidate_response: GoldenSourceVerificationStatus;
  marks_source: string;
}

export interface GoldenCase {
  case_id: string;
  label: string;
  source_family: GoldenSourceFamily;
  source_reference: string;
  task_type: B2FirstTaskType;
  /** Verbatim official task wording. Null when source is missing. */
  task_prompt: string | null;
  /** Verbatim candidate script. Null when source is missing. */
  candidate_response: string | null;
  source_verification: GoldenSourceVerification;
  expected_marks: GoldenExpectedMarks;
  /** Human-review only — never fed into scoring requests. */
  examiner_commentary?: string;
  sample_identity?: string;
  marks_source?: string;
  /** SHA-256 of normalised task_prompt when present. */
  task_prompt_checksum?: string | null;
  /** SHA-256 of normalised candidate_response when present. */
  candidate_response_checksum: string | null;
}

export interface CriterionComparison {
  criterion: keyof GoldenExpectedMarks;
  expected: number;
  actual: number | null;
  match: boolean;
}

export interface GoldenProfileComparison {
  case_id: string;
  expected_marks: GoldenExpectedMarks;
  actual_marks: GoldenExpectedMarks | null;
  expected_total: number;
  actual_total: number | null;
  exact_profile_match: boolean;
  same_total_wrong_profile: boolean;
  criterion_comparisons: CriterionComparison[];
  exact_criteria_matched: number;
}

export interface CalibrationMismatchDiagnostic {
  case_id: string;
  criterion: keyof GoldenExpectedMarks;
  expected_mark: number;
  actual_mark: number;
  positive_evidence: string[];
  limiting_evidence: string[];
  why_not_higher: string;
  why_not_lower: string;
  source_rule_ids: string[];
  evidence_quotes: string[];
  task_analysis_appears_correct: boolean | null;
  mismatch_origin:
    | 'task_interpretation'
    | 'evidence_interpretation'
    | 'descriptor_application'
    | 'boundary_decision'
    | 'unknown';
}

export interface CalibrationUsageRecord {
  stage: 'task_analysis' | 'observation' | 'assessment';
  case_id: string;
  attempt: number;
  requested_model: string;
  actual_model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  latency_ms: number;
  provider_metadata: Record<string, unknown>;
}

/** Calibration-local binding failure capture — never sent to the model. */
export interface CalibrationEvidenceBindingRow {
  criterion: string;
  quote: string;
  requested_occurrence_index: number;
  canonical_occurrence_index?: number | null;
  model_index_ignored?: boolean;
  occurrences_found: number;
  binding_status: 'bound' | 'failed';
  binding_reason: 'quote_not_found' | 'occurrence_out_of_range' | null;
  span_start: number | null;
  span_end: number | null;
  bound_text: string | null;
}

export interface CalibrationBindingAttemptDiagnostic {
  attempt: number;
  criterion_of_first_failure: string | null;
  first_failure_reason: 'quote_not_found' | 'occurrence_out_of_range' | null;
  evidence_bindings: CalibrationEvidenceBindingRow[];
  raw_assessment_payload: unknown;
  /** Non-binding AssessmentValidationError.failures (e.g. schema/contract). */
  contract_failures?: string[];
}

export interface CalibrationCaseResult {
  case_id: string;
  label: string;
  runnable: boolean;
  source_verification: GoldenSourceVerification;
  comparison: GoldenProfileComparison | null;
  validation_status: 'passed' | 'failed' | 'not_run';
  validation_failures: string[];
  assessment_confidence: string | null;
  retries: number;
  latency_ms: number;
  usage: CalibrationUsageRecord[];
  diagnostics: CalibrationMismatchDiagnostic[];
  /** Present when assessment binding failed; calibration-local only. */
  binding_diagnostics?: CalibrationBindingAttemptDiagnostic[];
  error?: string;
  task_analysis_status?: string;
  assessment_status?: string;
}

export interface CalibrationBaselineReport {
  baseline_id: string;
  generated_at: string;
  engine_version: string;
  schema_version: string;
  prompt_versions: Record<string, string>;
  model_config: {
    model: string;
    snapshot_id: string;
    temperature: number;
    response_format: string;
  };
  status: 'complete' | 'blocked_missing_sources' | 'partial';
  missing_source_cases: string[];
  runnable_cases: number;
  case_results: CalibrationCaseResult[];
  aggregate: {
    exact_profiles_matched: number;
    total_cases: number;
    exact_criterion_marks_matched: number;
    total_criterion_marks: number;
    content_accuracy: number;
    communicative_achievement_accuracy: number;
    organisation_accuracy: number;
    language_accuracy: number;
    mean_absolute_mark_deviation: Record<keyof GoldenExpectedMarks, number>;
    same_total_wrong_profile_cases: string[];
    validation_failures: number;
    retry_failures: number;
  };
}
