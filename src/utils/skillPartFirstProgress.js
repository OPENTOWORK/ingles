import { starsFromTheorySessionScore } from '@/lib/theoryTopicLevels';

/** Tema visual de skill practice (no exam mode). */
export function getSkillPracticeThemeKey(skillRoute) {
  const route = String(skillRoute || '').toLowerCase();
  if (route.includes('writing')) return 'writing';
  if (route.includes('listening')) return 'listening';
  if (route.includes('speaking')) return 'speaking';
  return 'reading';
}

/** Estrellas 0–3 para un ejercicio (parte + variante) desde levels_puntuaciones. */
export function starsFromPartExerciseScore(part) {
  if (!part?.total) return 0;
  return starsFromTheorySessionScore(part.correct, part.total);
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
        ? { [pn]: { correct: part.correct, total: part.total, passed: part.passed } }
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
