/**
 * UI label for an exam slot (levels_examenes.nombre).
 * The product UI uses English "Exam" even when Supabase stores "Examen …".
 */
export function formatExamSlotDisplayLabel(rawName, slot) {
  const text = String(rawName ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text) {
    return text.replace(/^Examen\b/i, 'Exam');
  }
  const n = Number(slot);
  return Number.isFinite(n) && n > 0 ? `Exam ${n}` : 'Exam';
}

/** @param {Record<number | string, string>} namesBySlot */
export function formatExamNamesBySlot(namesBySlot = {}) {
  return Object.fromEntries(
    Object.entries(namesBySlot).map(([slot, name]) => [
      Number(slot),
      formatExamSlotDisplayLabel(name, slot),
    ]),
  );
}
