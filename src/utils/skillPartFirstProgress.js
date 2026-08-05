import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import { getExerciseStars, isExerciseSlotUnlocked } from '@/utils/b2StarsWayProgress';
import { getSortedExamSlots } from '@/utils/skillPracticeNavigation';

/** User-facing label for a skill-practice exam variant (slot 1 → "Test 1"). */
export function formatSkillExerciseLabel(examSlot, lang = 'en') {
  const slot = Number(examSlot);
  if (!slot) return '';
  return `Test ${slot}`;
}

/** Tema visual de skill practice (no exam mode). */
export function getSkillPracticeThemeKey(skillRoute) {
  const route = String(skillRoute || '').toLowerCase();
  if (route.includes('writing')) return 'writing';
  if (route.includes('listening')) return 'listening';
  if (route.includes('speaking')) return 'speaking';
  return 'reading';
}

/** Estrellas 0–3 para un ejercicio (parte + variante) desde levels_stars o levels_puntuaciones. */
export function starsFromPartExerciseScore(part) {
  if (part?.stars != null && Number.isFinite(Number(part.stars))) {
    return Math.min(3, Math.max(0, Number(part.stars)));
  }
  if (!part?.total) return 0;
  const earned =
    part.scoringVersion === 2 ? (part.puntosObtenidos ?? part.correct) : part.correct;
  const max = part.scoringVersion === 2 ? (part.puntosMaximos ?? part.total) : part.total;
  return starsFromLevelsEarnedMax(earned, max);
}

/** First unlocked exercise variant (slot) with zero stars for this part. */
export function findFirstExerciseSlotWithoutStars(
  progressBySlot = {},
  partNumber,
  examenIdBySlot = {},
  options = {},
) {
  const slots = getSortedExamSlots(examenIdBySlot);
  for (const slot of slots) {
    if (!isExerciseSlotUnlocked(progressBySlot, partNumber, slot, examenIdBySlot, options)) continue;
    if (getExerciseStars(progressBySlot, partNumber, slot) === 0) return slot;
  }
  for (const slot of slots) {
    if (isExerciseSlotUnlocked(progressBySlot, partNumber, slot, examenIdBySlot, options)) {
      return slot;
    }
  }
  return slots[0] ?? 1;
}

/** Keep requested slot when unlocked; otherwise fall back to the first available exercise. */
export function resolveSkillPracticeExamSlot(
  progressBySlot = {},
  partNumber,
  examenIdBySlot = {},
  requestedSlot = null,
  options = {},
) {
  const slot = Number(requestedSlot);
  if (
    Number.isFinite(slot) &&
    slot > 0 &&
    isExerciseSlotUnlocked(progressBySlot, partNumber, slot, examenIdBySlot, options)
  ) {
    return slot;
  }
  return findFirstExerciseSlotWithoutStars(progressBySlot, partNumber, examenIdBySlot, options);
}

/**
 * Overlay in-session part progress onto saved progress so footer nav unlock
 * matches live stars shown in the chrome before Supabase refresh completes.
 */
export function buildProgressBySlotWithLiveOverlay(
  progressBySlot = {},
  examSlot,
  partNumber,
  livePartProgress = null,
) {
  if (!livePartProgress?.complete) return progressBySlot;

  const slot = Number(examSlot);
  const pn = Number(partNumber);
  if (!Number.isFinite(slot) || slot <= 0 || !Number.isFinite(pn) || pn <= 0) {
    return progressBySlot;
  }

  const liveStars = starsFromPartExerciseScore(livePartProgress);
  if (liveStars <= 0) return progressBySlot;

  const slotEntry = progressBySlot[slot] || { parts: {} };
  const existing = slotEntry.parts?.[pn];
  const savedStars = starsFromPartExerciseScore(existing);

  if (liveStars <= savedStars && existing?.total) return progressBySlot;

  return {
    ...progressBySlot,
    [slot]: {
      ...slotEntry,
      parts: {
        ...(slotEntry.parts || {}),
        [pn]: {
          ...existing,
          ...livePartProgress,
          stars: Math.max(liveStars, savedStars),
        },
      },
    },
  };
}

export function filterProgressByPart(progressBySlot = {}, partNumber) {
  const pn = Number(partNumber);
  if (!pn) return progressBySlot;

  const filtered = {};
  for (const [slot, prog] of Object.entries(progressBySlot)) {
    const part = prog?.parts?.[pn];
    filtered[slot] = {
      stars: starsFromPartExerciseScore(part),
      correct: part?.correct ?? 0,
      total: part?.total ?? 0,
      approvedParts: part?.passed ? 1 : 0,
      parts: part
        ? {
            [pn]: {
              correct: part.correct,
              total: part.total,
              passed: part.passed,
              stars: part.stars,
              scoringVersion: part.scoringVersion,
              puntosObtenidos: part.puntosObtenidos,
              puntosMaximos: part.puntosMaximos,
            },
          }
        : {},
    };
  }
  return filtered;
}

export function aggregatePartProgress(progressBySlot = {}, partNumber, slots = []) {
  let attempted = 0;
  const examCount = slots.length;
  for (const slot of slots) {
    const part = progressBySlot[slot]?.parts?.[partNumber];
    if (part?.total > 0) attempted += 1;
  }
  return { attempted, examCount };
}
