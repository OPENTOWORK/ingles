/**
 * Saved scores for one part across exam variants (slots).
 */
export function collectPartScoresAcrossSlots(
  progressBySlot,
  partNumber,
  { examSlot, examLabelsBySlot } = {},
) {
  if (!partNumber || !progressBySlot) return [];

  const entries = [];

  for (const [slotKey, slotData] of Object.entries(progressBySlot)) {
    const slot = Number(slotKey);
    if (!Number.isFinite(slot)) continue;

    const saved = slotData?.parts?.[partNumber];
    if (!saved?.total) continue;

    entries.push({
      slot,
      label: examLabelsBySlot?.[slot] || `Test ${slot}`,
      correct: saved.correct,
      total: saved.total,
      passed: saved.passed,
      isCurrent: slot === examSlot,
    });
  }

  entries.sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return b.slot - a.slot;
  });

  return entries;
}
