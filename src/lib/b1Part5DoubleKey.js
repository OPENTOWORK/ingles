function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

export function part5Letters(row) {
  return [...new Set(
    asArray(row?.letters)
      .map((letter) => String(letter).trim().toUpperCase())
      .filter((letter) => /^[A-D]$/.test(letter)),
  )];
}

export function collectPart5Disputes(primaryFits, crossFits) {
  const byNumber = new Map();
  const add = (row) => {
    const number = Number(row?.number);
    const letters = part5Letters(row);
    if (!Number.isInteger(number) || letters.length < 2) return;
    const previous = byNumber.get(number);
    byNumber.set(number, {
      number,
      letters: [...new Set([...(previous?.letters || []), ...letters])],
      reason: previous?.reason || row?.reason || '',
    });
  };
  for (const row of asArray(primaryFits)) add(row);
  for (const row of asArray(crossFits)) add(row);
  return [...byNumber.values()];
}

const SUBSTANTIVE_DEFECTS = new Set(['grammar', 'meaning', 'context']);

/**
 * A rejection is substantive only when the reviewer sets defect to grammar, meaning or context
 * and keeps an explanation for audit. The wording of that explanation is not a decision.
 */
export function part5RejectionIsSubstantive(record) {
  if (!record || typeof record !== 'object') return false;
  const defect = String(record.defect || '').trim().toLowerCase();
  return SUBSTANTIVE_DEFECTS.has(defect) && String(record.reason || '').trim().length > 0;
}

/**
 * A reported alternative stays open until adjudication rejects it with a substantive reason.
 * An omitted gap, a bare single letter, or a preference such as "less common" cannot hide it.
 */
export function adjudicatePart5Disputes(disputes, verdictRows) {
  const judged = new Map(
    asArray(verdictRows).map((row) => [Number(row?.number), row]),
  );
  const doubleKeys = [];
  const rejections = [];
  for (const row of asArray(disputes)) {
    const verdict = judged.get(Number(row?.number));
    const reported = part5Letters(row);
    if (!verdict) {
      doubleKeys.push({
        number: row.number,
        letters: reported,
        reason: 'Adjudication omitted this reported alternative, so it stays open.',
      });
      continue;
    }
    const kept = part5Letters(verdict);
    if (kept.length > 1) {
      doubleKeys.push({
        number: row.number,
        letters: kept,
        reason: 'Adjudication still accepts more than one option as an official answer.',
      });
      continue;
    }
    const dropped = reported.filter((letter) => !kept.includes(letter));
    const rejected = asArray(verdict.rejected);
    const unresolved = [];
    for (const letter of dropped) {
      const record = rejected.find((item) => String(item?.letter || '').trim().toUpperCase() === letter);
      if (part5RejectionIsSubstantive(record)) {
        rejections.push({
          number: row.number,
          letter,
          defect: String(record.defect).trim().toLowerCase(),
          reason: String(record.reason).trim(),
        });
      } else {
        unresolved.push(letter);
      }
    }
    if (unresolved.length) {
      doubleKeys.push({
        number: row.number,
        letters: [...new Set([...kept, ...unresolved])],
        reason: 'A reported alternative was not rejected for grammar, collocation or meaning.',
      });
    }
  }
  return { doubleKeys, rejections };
}

export function confirmedPart5DoubleKeys(disputes, verdictRows) {
  return adjudicatePart5Disputes(disputes, verdictRows).doubleKeys;
}
