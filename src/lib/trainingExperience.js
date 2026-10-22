import { getTrainingPathLevelCount } from '@/data/trainingPathCurriculum';
import {
  MAX_STARS_PER_PATH_LEVEL,
  TRAINING_CEFR_LEVELS,
  TRAINING_DIFFICULTY_IDS,
  TRAINING_SKILL_IDS,
} from '@/utils/trainingStarsProgress';

/** Each star of a Training path level is worth 10 XP (3 stars = 30 XP). */
export const TRAINING_XP_PER_STAR = 10;

/** More than every level of every Training path; caps what one request can send. */
export const TRAINING_EXPERIENCE_MAX_LEVELS = 4000;

export function trainingXpForStars(stars) {
  return Math.max(0, Math.floor(Number(stars) || 0)) * TRAINING_XP_PER_STAR;
}

/**
 * Keeps only real path levels with 1–3 stars. When a level comes twice, the best result wins.
 * @returns {{ cefr: string, skill: string, difficulty: string, level: number, stars: number }[]}
 */
export function normalizeTrainingExperienceLevels(list) {
  if (!Array.isArray(list)) return [];

  const best = new Map();
  for (const entry of list.slice(0, TRAINING_EXPERIENCE_MAX_LEVELS)) {
    const cefr = String(entry?.cefr || '').toLowerCase();
    const skill = String(entry?.skill || '');
    const difficulty = String(entry?.difficulty || '');
    const level = Number(entry?.level);
    const stars = Number(entry?.stars);

    if (!TRAINING_CEFR_LEVELS.includes(cefr)) continue;
    if (!TRAINING_SKILL_IDS.includes(skill)) continue;
    if (!TRAINING_DIFFICULTY_IDS.includes(difficulty)) continue;
    if (!Number.isInteger(stars) || stars < 1 || stars > MAX_STARS_PER_PATH_LEVEL) continue;
    if (!Number.isInteger(level) || level < 1) continue;
    if (level > getTrainingPathLevelCount(cefr, difficulty, skill)) continue;

    const key = `${cefr}|${skill}|${difficulty}|${level}`;
    if ((best.get(key)?.stars ?? 0) < stars) {
      best.set(key, { cefr, skill, difficulty, level, stars });
    }
  }
  return [...best.values()];
}

/**
 * Path-level stars saved in this browser (`stars_{cefr}_{skill}_{difficulty}` → `level-N`).
 * Reviews do not count, same as the star totals in Training statistics.
 * @param {Storage} storage
 */
export function readStoredTrainingStars(storage) {
  const levels = [];
  if (!storage) return levels;

  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    const match = /^stars_([a-z0-9]+)_(.+)_([a-z]+)$/.exec(key || '');
    if (!match) continue;

    let saved;
    try {
      saved = JSON.parse(storage.getItem(key) || '{}');
    } catch {
      continue;
    }

    for (const [node, value] of Object.entries(saved || {})) {
      const levelMatch = /^level-(\d+)$/.exec(node);
      const stars = Math.floor(Number(value) || 0);
      if (!levelMatch || stars < 1) continue;
      levels.push({
        cefr: match[1],
        skill: match[2],
        difficulty: match[3],
        level: Number(levelMatch[1]),
        stars: Math.min(MAX_STARS_PER_PATH_LEVEL, stars),
      });
    }
  }
  return levels;
}
