/**
 * Shared structured findings for RUOE validators (v1.1.1).
 * @typedef {'HARD_FAIL'|'QUALITY_FAIL'|'WARNING'} RuoeSeverity
 * @typedef {{ rule_id: string, severity: RuoeSeverity, location: string, evidence: string, reason: string, recommended_local_action: string, source?: string }} RuoeFinding
 */

export function createFinding({
  rule_id,
  severity,
  location,
  evidence,
  reason,
  recommended_local_action,
  source = 'deterministic',
}) {
  return {
    rule_id,
    severity,
    location,
    evidence: String(evidence || '').slice(0, 240),
    reason,
    recommended_local_action,
    source,
  };
}

export function findingToMessage(finding) {
  return `[${finding.rule_id}] ${finding.location}: ${finding.reason}`;
}

export function partitionFindings(findings = []) {
  const hardFails = [];
  const qualityFails = [];
  const warnings = [];
  for (const f of findings) {
    const msg = findingToMessage(f);
    if (f.severity === 'HARD_FAIL') hardFails.push(msg);
    else if (f.severity === 'QUALITY_FAIL') qualityFails.push(msg);
    else warnings.push(msg);
  }
  return { hardFails, qualityFails, warnings };
}
