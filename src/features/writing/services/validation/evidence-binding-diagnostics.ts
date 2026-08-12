/**
 * Calibration-local evidence-binding diagnostics.
 *
 * Inspects a raw assessment model payload against the authoritative candidate
 * response using the approved assessment binding contract.
 */

import {
  bindAssessmentEvidenceQuote,
  type BindingFailureReason,
} from './evidence-binding';

export interface EvidenceBindingInspectionRow {
  criterion: string;
  quote: string;
  /** Raw model-provided occurrence index (diagnostic). */
  requested_occurrence_index: number;
  /** Canonical index used for location after the assessment contract. */
  canonical_occurrence_index: number | null;
  model_index_ignored: boolean;
  occurrences_found: number;
  binding_status: 'bound' | 'failed';
  binding_reason: BindingFailureReason | null;
  span_start: number | null;
  span_end: number | null;
  bound_text: string | null;
}

export interface AssessmentBindingAttemptDiagnostic {
  attempt: number;
  criterion_of_first_failure: string | null;
  first_failure_reason: BindingFailureReason | null;
  evidence_bindings: EvidenceBindingInspectionRow[];
  /** Raw model JSON — no API secrets; calibration-local only. */
  raw_assessment_payload: unknown;
  contract_failures?: string[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Walk every criterion.text_evidence item and apply the assessment binding
 * contract. Raw model occurrence_index is retained for diagnostics; unique
 * quotes bind at canonical 0.
 */
export function inspectAssessmentEvidenceBindings(
  candidateResponse: string,
  payload: unknown,
): EvidenceBindingInspectionRow[] {
  const root = asRecord(payload);
  if (!root) return [];

  const criteria = asArray(root.criteria);
  const rows: EvidenceBindingInspectionRow[] = [];

  for (const entry of criteria) {
    const decision = asRecord(entry);
    if (!decision) continue;
    const criterion = typeof decision.criterion === 'string' ? decision.criterion : 'unknown';
    for (const evidence of asArray(decision.text_evidence)) {
      const item = asRecord(evidence);
      if (!item) continue;
      const quote = typeof item.quote === 'string' ? item.quote : '';
      const requested =
        typeof item.occurrence_index === 'number' && Number.isInteger(item.occurrence_index)
          ? item.occurrence_index
          : 0;
      const binding = bindAssessmentEvidenceQuote(candidateResponse, quote, requested);
      if (binding.status === 'bound') {
        rows.push({
          criterion,
          quote,
          requested_occurrence_index: binding.model_occurrence_index,
          canonical_occurrence_index: binding.canonical_occurrence_index,
          model_index_ignored: binding.model_index_ignored,
          occurrences_found: binding.occurrences_found,
          binding_status: 'bound',
          binding_reason: null,
          span_start: binding.span_start,
          span_end: binding.span_end,
          bound_text: binding.bound_text,
        });
      } else {
        rows.push({
          criterion,
          quote,
          requested_occurrence_index: binding.model_occurrence_index,
          canonical_occurrence_index: null,
          model_index_ignored: binding.model_index_ignored,
          occurrences_found: binding.occurrences_found,
          binding_status: 'failed',
          binding_reason: binding.reason,
          span_start: null,
          span_end: null,
          bound_text: null,
        });
      }
    }
  }

  return rows;
}

export function formatEvidenceBindingFailureMessage(params: {
  criterion: string;
  quote: string;
  reason: BindingFailureReason;
  requested_occurrence_index: number;
  occurrences_found: number;
}): string {
  const { criterion, quote, reason, requested_occurrence_index, occurrences_found } = params;
  if (reason === 'occurrence_out_of_range') {
    return (
      `${criterion}: evidence quote occurrence_out_of_range ` +
      `(requested_occurrence_index=${requested_occurrence_index}, ` +
      `occurrences_found=${occurrences_found}): "${quote}"`
    );
  }
  return (
    `${criterion}: evidence quote quote_not_found ` +
    `(requested_occurrence_index=${requested_occurrence_index}, ` +
    `occurrences_found=${occurrences_found}): "${quote}"`
  );
}
