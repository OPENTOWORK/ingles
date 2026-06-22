import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';
import { isExerciseSlotUnlocked } from '@/utils/b2StarsWayProgress';

/** Slots 1…N with a linked examen id, or 1…B2_EXAM_SLOT_MAX as fallback. */
export function getSortedExamSlots(examenIdBySlot = {}) {
  const fromCatalog = Object.keys(examenIdBySlot)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0 && examenIdBySlot[n])
    .sort((a, b) => a - b);
  if (fromCatalog.length) return fromCatalog;
  return Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);
}

/** Previous exercise slot before `currentSlot`, or null if none. */
export function getPreviousExamSlot(currentSlot, examenIdBySlot = {}) {
  const slots = getSortedExamSlots(examenIdBySlot);
  const idx = slots.indexOf(currentSlot);
  if (idx > 0) return slots[idx - 1];
  const behind = [...slots].reverse().find((s) => s < currentSlot);
  return behind ?? null;
}

/** Next exercise slot after `currentSlot`, or null if none. */
export function getNextExamSlot(currentSlot, examenIdBySlot = {}) {
  const slots = getSortedExamSlots(examenIdBySlot);
  const idx = slots.indexOf(currentSlot);
  if (idx >= 0 && idx < slots.length - 1) return slots[idx + 1];
  const ahead = slots.find((s) => s > currentSlot);
  return ahead ?? null;
}

/** Whether the user can open the next exam variant for this part. */
export function canGoToNextExercise(
  examSlot,
  examenIdBySlot = {},
  partNumber = null,
  progressBySlot = null,
) {
  const nextSlot = getNextExamSlot(examSlot, examenIdBySlot);
  if (nextSlot == null) return false;
  if (partNumber == null) return true;
  if (!progressBySlot) return false;
  return isExerciseSlotUnlocked(progressBySlot, partNumber, nextSlot, examenIdBySlot);
}

/** Whether there is a previous exam variant in the catalog. */
export function canGoToPreviousExercise(examSlot, examenIdBySlot = {}) {
  return getPreviousExamSlot(examSlot, examenIdBySlot) != null;
}

/**
 * Footer nav state for skill practice Previous / Next exercise controls.
 */
export function getSkillExerciseNavState({
  examSlot,
  examenIdBySlot = {},
  partNumber = null,
  partMin = 1,
  partMax = null,
  progressBySlot = null,
}) {
  const canGoPrevious = canGoToPreviousExercise(examSlot, examenIdBySlot);
  const nextSlot = getNextExamSlot(examSlot, examenIdBySlot);
  const pn = Number(partNumber);
  const hasPartRange = Number.isFinite(pn) && partMax != null && pn >= partMin;

  if (nextSlot != null) {
    const unlocked = canGoToNextExercise(examSlot, examenIdBySlot, partNumber, progressBySlot);
    return {
      canGoPrevious,
      canGoNext: unlocked,
      nextAction: unlocked ? 'exercise' : 'none',
      nextBlockedReason: unlocked ? null : 'need_star',
      pendingNextSlot: nextSlot,
      previousSlot: getPreviousExamSlot(examSlot, examenIdBySlot),
      nextSlot: unlocked ? nextSlot : null,
    };
  }

  const canAdvancePart =
    hasPartRange && (pn < partMax || (pn >= partMax && partMin < partMax));

  return {
    canGoPrevious,
    canGoNext: canAdvancePart,
    nextAction: canAdvancePart ? 'part' : 'none',
    nextBlockedReason: null,
    pendingNextSlot: null,
    previousSlot: getPreviousExamSlot(examSlot, examenIdBySlot),
    nextSlot: null,
  };
}

/**
 * Skill practice footer: advance to the next exam variant, then the next part if needed.
 */
export function runKeepPracticingSkillFlow({
  examSlot,
  examenIdBySlot,
  partNumber = null,
  progressBySlot = null,
  onSelectExamSlot,
  onReturnToExercisePicker,
  onAdvanceToNextPart,
}) {
  const nextSlot = getNextExamSlot(examSlot, examenIdBySlot);
  if (nextSlot != null) {
    const nextUnlocked = canGoToNextExercise(
      examSlot,
      examenIdBySlot,
      partNumber,
      progressBySlot,
    );
    if (nextUnlocked) {
      onSelectExamSlot(nextSlot);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    return;
  }
  if (onAdvanceToNextPart) {
    onAdvanceToNextPart();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }
  onReturnToExercisePicker?.();
}

/** Go to the previous exam variant within the current part. */
export function runBackExerciseSkillFlow({ examSlot, examenIdBySlot, onSelectExamSlot }) {
  const prevSlot = getPreviousExamSlot(examSlot, examenIdBySlot);
  if (prevSlot == null) return false;
  onSelectExamSlot?.(prevSlot);
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return true;
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

function partNumberFromName(nombre = '') {
  return Number(String(nombre).match(/\d+/)?.[0] || 0);
}

/**
 * Keep the same skill part (e.g. Part 1) when switching exam variant (?examen=).
 * @param {Array<{ id: string, nombre?: string }>} normalizedParts
 * @param {string | null | undefined} previousPartId
 * @param {Array<{ id: string, nombre?: string }>} [previousParts]
 */
export function resolvePartIdAfterExamReload(normalizedParts, previousPartId, previousParts = []) {
  if (previousPartId && normalizedParts.some((p) => p.id === previousPartId)) {
    return previousPartId;
  }
  const prevMeta = previousParts.find((p) => p.id === previousPartId);
  const prevNum = partNumberFromName(prevMeta?.nombre);
  if (prevNum > 0) {
    const match = normalizedParts.find((p) => partNumberFromName(p.nombre) === prevNum);
    if (match) return match.id;
  }
  return normalizedParts[0]?.id ?? null;
}

/**
 * Keep question picks where still valid; otherwise first question per part.
 * @param {Array<{ id: string, questions?: Array<{ preguntaId: string }> }>} normalizedParts
 * @param {Record<string, string>} previousSelection
 */
export function buildQuestionSelectionAfterExamReload(normalizedParts, previousSelection = {}) {
  return normalizedParts.reduce((acc, part) => {
    if (!part.questions?.length) return acc;
    const prevId = previousSelection[part.id];
    if (prevId && part.questions.some((q) => q.preguntaId === prevId)) {
      acc[part.id] = prevId;
      return acc;
    }
    acc[part.id] = part.questions[0].preguntaId;
    return acc;
  }, {});
}
