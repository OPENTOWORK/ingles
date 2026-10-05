import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { isStudentRole, normalizeRoleName } from '@/utils/authRoles';

/** Estrellas del nivel anterior necesarias para abrir el siguiente. */
export const TRAINING_UNLOCK_STARS = 2;

/** Sin cuenta, una estrella en el nivel anterior abre el siguiente. */
export const GUEST_TRAINING_UNLOCK_STARS = 1;

/** Estrellas que dejan el nivel en amarillo. */
export const TRAINING_MASTERY_STARS = 3;

function starsAt(levelStars, levelNum) {
  return Number(levelStars[`level-${levelNum}`]) || 0;
}

/** Primer nivel que aún no tiene las estrellas para avanzar. */
export function getTrainingCurrentLevelNumber(
  levelStars = {},
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  const total = Math.max(1, Number(maxLevel) || TRAINING_LEVEL_COUNT);
  for (let n = 1; n <= total; n += 1) {
    if (starsAt(levelStars, n) < TRAINING_UNLOCK_STARS) return n;
  }
  return total;
}

/** Cualquier rol con cuenta, salvo estudiante, entra sin estrellas. */
export function isTrainingPathStaffBypass(userRole = '') {
  const role = normalizeRoleName(userRole);
  if (!role) return false;
  return !isStudentRole(role);
}

/** El nivel 1 está abierto. Cada siguiente pide 2 estrellas en el anterior, salvo para un rol que no sea estudiante. */
export function isTrainingLevelLocked(
  levelNum,
  levelStars = {},
  userRole = '',
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  const num = Number(levelNum);
  const total = Math.max(1, Number(maxLevel) || TRAINING_LEVEL_COUNT);
  if (!num || num < 1 || num > total) return true;
  if (isTrainingPathStaffBypass(userRole)) return false;
  if (num === 1) return false;
  return starsAt(levelStars, num - 1) < TRAINING_UNLOCK_STARS;
}

/**
 * A review sits beside the path and opens once the block it covers is done.
 * It is not a level, so it never changes the 1–25 count.
 */
export function isTrainingReviewLocked(review, levelStars = {}, userRole = '') {
  if (!review?.to) return true;
  if (isTrainingPathStaffBypass(userRole)) return false;
  return starsAt(levelStars, review.to) < TRAINING_UNLOCK_STARS;
}

/** El nivel 1 está abierto. Cada siguiente pide 1 estrella en el anterior. */
export function isGuestTrainingLevelLocked(
  levelNum,
  levelStars = {},
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  const num = Number(levelNum);
  const total = Math.max(1, Number(maxLevel) || TRAINING_LEVEL_COUNT);
  if (!num || num < 1 || num > total) return true;
  if (num === 1) return false;
  return starsAt(levelStars, num - 1) < GUEST_TRAINING_UNLOCK_STARS;
}

export function isGuestTrainingReviewLocked(review, levelStars = {}) {
  if (!review?.to) return true;
  return starsAt(levelStars, review.to) < GUEST_TRAINING_UNLOCK_STARS;
}

export function getGuestTrainingCurrentLevelNumber(
  levelStars = {},
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  const total = Math.max(1, Number(maxLevel) || TRAINING_LEVEL_COUNT);
  for (let n = 1; n <= total; n += 1) {
    if (starsAt(levelStars, n) < GUEST_TRAINING_UNLOCK_STARS) return n;
  }
  return total;
}
