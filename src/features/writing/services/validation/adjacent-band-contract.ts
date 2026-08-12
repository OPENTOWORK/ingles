/**
 * Adjacent-band evidence generation contract (Doc 03 §1.2).
 *
 * Bands 2 and 4 are mixed profiles and MUST carry concrete neighbouring-band
 * evidence. Bands 0, 1, 3 and 5 must NOT carry the field.
 *
 * Invalid model output is rejected with precise retry feedback — never silently
 * stripped, and never repaired by changing the mark.
 */

export type AdjacentBandEvidenceLike = {
  lower_band_reference?: unknown;
  lower_band_evidence?: unknown;
  higher_band_reference?: unknown;
  higher_band_evidence?: unknown;
} | null | undefined;

export type AdjacentBandDecisionLike = {
  criterion: string;
  mark: number;
  adjacent_band_evidence?: AdjacentBandEvidenceLike;
};

function hasConcreteAdjacent(value: AdjacentBandEvidenceLike): boolean {
  if (!value || typeof value !== 'object') return false;
  const sides = [
    value.lower_band_reference,
    value.lower_band_evidence,
    value.higher_band_reference,
    value.higher_band_evidence,
  ];
  return sides.every((side) => typeof side === 'string' && side.trim().length > 0);
}

/**
 * Returns null when the decision satisfies the adjacent-band contract.
 * Otherwise returns a precise, mark-preserving retry instruction.
 */
export function describeAdjacentBandContractViolation(
  decision: AdjacentBandDecisionLike,
): string | null {
  const { criterion, mark } = decision;
  const present = decision.adjacent_band_evidence != null;
  const concrete = hasConcreteAdjacent(decision.adjacent_band_evidence);

  if (mark === 2 || mark === 4) {
    if (!present || !concrete) {
      return (
        `Criterion ${criterion} has mark ${mark}. adjacent_band_evidence is REQUIRED for marks 2 and 4 ` +
        `and must include non-empty lower_band_reference, lower_band_evidence, higher_band_reference and ` +
        `higher_band_evidence from both neighbouring bands. Regenerate this criterion with that field; ` +
        `do not change the mark to avoid the requirement.`
      );
    }
    return null;
  }

  if (present) {
    return (
      `Criterion ${criterion} has mark ${mark}. adjacent_band_evidence is only permitted for marks 2 and 4. ` +
      `Regenerate the criterion with adjacent_band_evidence set to null. Do not change the mark.`
    );
  }

  return null;
}

export function collectAdjacentBandContractViolations(
  decisions: AdjacentBandDecisionLike[],
): string[] {
  return decisions
    .map((decision) => describeAdjacentBandContractViolation(decision))
    .filter((message): message is string => Boolean(message));
}
