import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { getTrainingPathLevelCount } from '@/data/trainingPathCurriculum';

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
  for (const [key, value] of Object.entries(data || {})) {
    if (!/^level-\d+$/.test(key)) continue;
    const stars = Number(value) || 0;
    earned += Math.min(MAX_STARS_PER_PATH_LEVEL, Math.max(0, stars));
  }
  return earned;
}

/** @type {Map<string, number> | null} */
let starsStorageIndex = null;

export function invalidateTrainingStarsCache() {
  starsStorageIndex = null;
}

function buildStarsStorageIndex() {
  if (starsStorageIndex) return starsStorageIndex;
  starsStorageIndex = new Map();
  if (typeof window === 'undefined') return starsStorageIndex;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('stars_')) continue;
    try {
      const raw = localStorage.getItem(key);
      starsStorageIndex.set(key, raw ? sumStarsFromStorageData(JSON.parse(raw)) : 0);
    } catch {
      starsStorageIndex.set(key, 0);
    }
  }
  return starsStorageIndex;
}

function readEarnedFromStorageKey(storageKey) {
  if (typeof window === 'undefined') return 0;
  const index = buildStarsStorageIndex();
  if (index.has(storageKey)) return index.get(storageKey);

  try {
    const raw = localStorage.getItem(storageKey);
    const earned = raw ? sumStarsFromStorageData(JSON.parse(raw)) : 0;
    index.set(storageKey, earned);
    return earned;
  } catch {
    index.set(storageKey, 0);
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

/** Máximo por dificultad (por defecto 24 niveles del camino). */
export function getMaxStarsForDifficulty(levelCount = TRAINING_LEVEL_COUNT) {
  return Math.max(1, levelCount) * MAX_STARS_PER_PATH_LEVEL;
}

/**
 * Suma estrellas guardadas en localStorage para un nivel CEFR (p. ej. b2).
 * @param {string} cefrLevel
 * @returns {{ earned: number, max: number, percent: number }}
 */
function earnedForLevelFromIndex(index, levelKey) {
  let earned = 0;
  for (const skill of TRAINING_SKILL_IDS) {
    for (const difficulty of TRAINING_DIFFICULTY_IDS) {
      earned += index.get(`stars_${levelKey}_${skill}_${difficulty}`) ?? 0;
    }
  }
  return earned;
}

export function computeCefrStarProgress(cefrLevel) {
  const max = getMaxStarsForCefrLevel();
  const levelKey = (cefrLevel || 'a2').toLowerCase();

  if (typeof window === 'undefined') {
    return { earned: 0, max, percent: 0 };
  }

  const index = buildStarsStorageIndex();
  const earned = earnedForLevelFromIndex(index, levelKey);
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

  const index = buildStarsStorageIndex();
  let earned = 0;
  for (const difficulty of TRAINING_DIFFICULTY_IDS) {
    earned += index.get(`stars_${levelKey}_${skill}_${difficulty}`) ?? 0;
  }

  return { earned, max, percent: toPercent(earned, max) };
}

export function computeAllSkillStarProgress(cefrLevel) {
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const index = buildStarsStorageIndex();
  const max = getMaxStarsForSkill();

  if (typeof window === 'undefined') {
    return Object.fromEntries(
      TRAINING_SKILL_IDS.map((skill) => [skill, { earned: 0, max, percent: 0 }]),
    );
  }

  return Object.fromEntries(
    TRAINING_SKILL_IDS.map((skill) => {
      let earned = 0;
      for (const difficulty of TRAINING_DIFFICULTY_IDS) {
        earned += index.get(`stars_${levelKey}_${skill}_${difficulty}`) ?? 0;
      }
      return [skill, { earned, max, percent: toPercent(earned, max) }];
    }),
  );
}

/**
 * Progreso de una dificultad dentro de un skill y nivel CEFR.
 */
export function computeDifficultyStarProgress(cefrLevel, skillId, difficultyId) {
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const skill = skillId || TRAINING_SKILL_IDS[0];
  const difficulty = difficultyId || TRAINING_DIFFICULTY_IDS[0];
  const max = getMaxStarsForDifficulty(getTrainingPathLevelCount(levelKey, difficulty, skill));

  if (typeof window === 'undefined') {
    return { earned: 0, max, percent: 0 };
  }

  const earned = readEarnedFromStorageKey(`stars_${levelKey}_${skill}_${difficulty}`);
  return { earned, max, percent: toPercent(earned, max) };
}

export function computeAllDifficultyStarProgress(cefrLevel, skillId) {
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const skill = skillId || TRAINING_SKILL_IDS[0];

  if (typeof window === 'undefined') {
    return Object.fromEntries(
      TRAINING_DIFFICULTY_IDS.map((difficulty) => {
        const max = getMaxStarsForDifficulty(
          getTrainingPathLevelCount(levelKey, difficulty, skill),
        );
        return [difficulty, { earned: 0, max, percent: 0 }];
      }),
    );
  }

  const index = buildStarsStorageIndex();
  return Object.fromEntries(
    TRAINING_DIFFICULTY_IDS.map((difficulty) => {
      const max = getMaxStarsForDifficulty(
        getTrainingPathLevelCount(levelKey, difficulty, skill),
      );
      const earned = index.get(`stars_${levelKey}_${skill}_${difficulty}`) ?? 0;
      return [difficulty, { earned, max, percent: toPercent(earned, max) }];
    }),
  );
}

export function computeAllCefrStarProgress() {
  const max = getMaxStarsForCefrLevel();

  if (typeof window === 'undefined') {
    return Object.fromEntries(
      TRAINING_CEFR_LEVELS.map((level) => [level, { earned: 0, max, percent: 0 }]),
    );
  }

  const index = buildStarsStorageIndex();
  return Object.fromEntries(
    TRAINING_CEFR_LEVELS.map((level) => {
      const levelKey = level.toLowerCase();
      const earned = earnedForLevelFromIndex(index, levelKey);
      return [level, { earned, max, percent: toPercent(earned, max) }];
    }),
  );
}

export const TRAINING_STARS_UPDATED_EVENT = 'training-stars-updated';

/** @param {string} [updatedStorageKey] When set, refresh only that key in the index. */
export function notifyTrainingStarsUpdated(updatedStorageKey) {
  if (typeof window === 'undefined') return;

  if (updatedStorageKey && starsStorageIndex) {
    try {
      const raw = localStorage.getItem(updatedStorageKey);
      starsStorageIndex.set(
        updatedStorageKey,
        raw ? sumStarsFromStorageData(JSON.parse(raw)) : 0,
      );
    } catch {
      invalidateTrainingStarsCache();
    }
  } else {
    invalidateTrainingStarsCache();
  }

  window.dispatchEvent(new CustomEvent(TRAINING_STARS_UPDATED_EVENT));
}
