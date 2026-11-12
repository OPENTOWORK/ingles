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

/**
 * A second letter survives only when the key adjudicator still accepts it.
 * An omitted gap keeps the original dispute, so a missed review cannot hide a double key.
 */
export function confirmedPart5DoubleKeys(disputes, verdictRows) {
  const judged = new Map(
    asArray(verdictRows).map((row) => [Number(row?.number), part5Letters(row)]),
  );
  const confirmed = [];
  for (const row of asArray(disputes)) {
    const letters = judged.get(Number(row?.number));
    const kept = letters && letters.length ? letters : part5Letters(row);
    if (kept.length > 1) {
      confirmed.push({
        number: row.number,
        letters: kept,
        reason: 'A key adjudication confirmed more than one option would be accepted as the official answer.',
      });
    }
  }
  return confirmed;
}
