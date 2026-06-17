import { starsFromPartExerciseScore } from '@/utils/skillPartFirstProgress';

/** Best star rating (0–3) for a part across all exam slots. */
export function getBestPartStars(progressBySlot = {}, partNumber, slots = []) {
  let best = 0;
  for (const slot of slots) {
    const part = progressBySlot[slot]?.parts?.[partNumber];
    const stars = starsFromPartExerciseScore(part);
    if (stars > best) best = stars;
  }
  return best;
}

export function countPartAttempts(progressBySlot = {}, partNumber, slots = []) {
  let count = 0;
  for (const slot of slots) {
    if (progressBySlot[slot]?.parts?.[partNumber]?.total > 0) count += 1;
  }
  return count;
}

export function getBestPartScore(progressBySlot = {}, partNumber, slots = []) {
  let best = null;
  for (const slot of slots) {
    const part = progressBySlot[slot]?.parts?.[partNumber];
    if (!part?.total) continue;
    const stars = starsFromPartExerciseScore(part);
    if (!best || stars > best.stars || (stars === best.stars && part.correct > best.correct)) {
      best = { ...part, stars, slot };
    }
  }
  return best;
}

export function getExerciseStars(progressBySlot = {}, partNumber, slot) {
  const part = progressBySlot[slot]?.parts?.[partNumber];
  return starsFromPartExerciseScore(part);
}

export function getExerciseScore(progressBySlot = {}, partNumber, slot) {
  return progressBySlot[slot]?.parts?.[partNumber] ?? null;
}
