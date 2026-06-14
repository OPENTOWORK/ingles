import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';

/** Slots 1…N with a linked examen id, or 1…B2_EXAM_SLOT_MAX as fallback. */
export function getSortedExamSlots(examenIdBySlot = {}) {
  const fromCatalog = Object.keys(examenIdBySlot)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0 && examenIdBySlot[n])
    .sort((a, b) => a - b);
  if (fromCatalog.length) return fromCatalog;
  return Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);
}

/** Next exercise slot after `currentSlot`, or null if none. */
export function getNextExamSlot(currentSlot, examenIdBySlot = {}) {
  const slots = getSortedExamSlots(examenIdBySlot);
  const idx = slots.indexOf(currentSlot);
  if (idx >= 0 && idx < slots.length - 1) return slots[idx + 1];
  const ahead = slots.find((s) => s > currentSlot);
  return ahead ?? null;
}

/**
 * Skill practice footer: advance to the next exam variant, or fall back to the exercise picker.
 */
export function runKeepPracticingSkillFlow({
  examSlot,
  examenIdBySlot,
  onSelectExamSlot,
  onReturnToExercisePicker,
}) {
  const nextSlot = getNextExamSlot(examSlot, examenIdBySlot);
  if (nextSlot != null) {
    onSelectExamSlot(nextSlot);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }
  onReturnToExercisePicker();
}

/** Close practice and keep ?part= but drop ?examen= (exercise picker for current part). */
export function returnToSkillExercisePicker({ setExamPracticeOpen, refreshProgress }) {
  setExamPracticeOpen(false);
  void refreshProgress?.();
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('examen');
    window.history.replaceState(null, '', url.pathname + url.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
