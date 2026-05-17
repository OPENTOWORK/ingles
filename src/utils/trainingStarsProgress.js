import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';

export const TRAINING_CEFR_LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'];

export const TRAINING_SKILL_IDS = [
  'use-of-english',
  'writing',
  'listening',
  'speaking',
  'reading',
  'vocabulary',
  'all',
  'challenge',
];

export const TRAINING_DIFFICULTY_IDS = ['basico', 'intermedio', 'avanzado'];

export const MAX_STARS_PER_PATH_LEVEL = 3;

function sumStarsFromStorageData(data) {
  let earned = 0;
  for (let n = 1; n <= TRAINING_LEVEL_COUNT; n++) {
    const stars = Number(data[`level-${n}`]) || 0;
    earned += Math.min(MAX_STARS_PER_PATH_LEVEL, Math.max(0, stars));
  }
  return earned;
}

function readEarnedFromStorageKey(storageKey) {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    return sumStarsFromStorageData(JSON.parse(raw));
  } catch {
    return 0;
  }
}

function toPercent(earned, max) {
  return max > 0 ? Math.min(100, Math.round((earned / max) * 100)) : 0;
}

/** Máximo de estrellas alcanzables en un nivel CEFR (todos los skills y dificultades). */
export function getMaxStarsForCefrLevel() {
  return (
    TRAINING_SKILL_IDS.length *
    TRAINING_DIFFICULTY_IDS.length *
    TRAINING_LEVEL_COUNT *
    MAX_STARS_PER_PATH_LEVEL
  );
}

/** Máximo por skill (las 3 dificultades). */
export function getMaxStarsForSkill() {
  return TRAINING_DIFFICULTY_IDS.length * TRAINING_LEVEL_COUNT * MAX_STARS_PER_PATH_LEVEL;
}

/** Máximo por dificultad (24 niveles del camino). */
export function getMaxStarsForDifficulty() {
  return TRAINING_LEVEL_COUNT * MAX_STARS_PER_PATH_LEVEL;
}

/**
 * Suma estrellas guardadas en localStorage para un nivel CEFR (p. ej. b2).
 * @param {string} cefrLevel
 * @returns {{ earned: number, max: number, percent: number }}
 */
export function computeCefrStarProgress(cefrLevel) {
  const max = getMaxStarsForCefrLevel();
  const levelKey = (cefrLevel || 'a2').toLowerCase();

  if (typeof window === 'undefined') {
    return { earned: 0, max, percent: 0 };
  }

  let earned = 0;

  for (const skill of TRAINING_SKILL_IDS) {
    for (const difficulty of TRAINING_DIFFICULTY_IDS) {
      earned += readEarnedFromStorageKey(`stars_${levelKey}_${skill}_${difficulty}`);
    }
  }

  return { earned, max, percent: toPercent(earned, max) };
}

/**
 * Progreso de un skill dentro de un nivel CEFR (suma las 3 dificultades).
 */
export function computeSkillStarProgress(cefrLevel, skillId) {
  const max = getMaxStarsForSkill();
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const skill = skillId || TRAINING_SKILL_IDS[0];

  if (typeof window === 'undefined') {
    return { earned: 0, max, percent: 0 };
  }

  let earned = 0;
  for (const difficulty of TRAINING_DIFFICULTY_IDS) {
    earned += readEarnedFromStorageKey(`stars_${levelKey}_${skill}_${difficulty}`);
  }

  return { earned, max, percent: toPercent(earned, max) };
}

export function computeAllSkillStarProgress(cefrLevel) {
  return Object.fromEntries(
    TRAINING_SKILL_IDS.map((skill) => [skill, computeSkillStarProgress(cefrLevel, skill)])
  );
}

/**
 * Progreso de una dificultad dentro de un skill y nivel CEFR.
 */
export function computeDifficultyStarProgress(cefrLevel, skillId, difficultyId) {
  const max = getMaxStarsForDifficulty();
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const skill = skillId || TRAINING_SKILL_IDS[0];
  const difficulty = difficultyId || TRAINING_DIFFICULTY_IDS[0];

  if (typeof window === 'undefined') {
    return { earned: 0, max, percent: 0 };
  }

  const earned = readEarnedFromStorageKey(`stars_${levelKey}_${skill}_${difficulty}`);
  return { earned, max, percent: toPercent(earned, max) };
}

export function computeAllDifficultyStarProgress(cefrLevel, skillId) {
  return Object.fromEntries(
    TRAINING_DIFFICULTY_IDS.map((difficulty) => [
      difficulty,
      computeDifficultyStarProgress(cefrLevel, skillId, difficulty),
    ])
  );
}

export function computeAllCefrStarProgress() {
  return Object.fromEntries(
    TRAINING_CEFR_LEVELS.map((level) => [level, computeCefrStarProgress(level)])
  );
}

export const TRAINING_STARS_UPDATED_EVENT = 'training-stars-updated';

export function notifyTrainingStarsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TRAINING_STARS_UPDATED_EVENT));
  }
}
