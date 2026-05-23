import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { canAccessTeacherPanel } from '@/utils/authRoles';

/** Primer nivel sin completar (o último+1 si todo hecho). */
export function getTrainingCurrentLevelNumber(
  levelStars = {},
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  const total = Math.max(1, Number(maxLevel) || TRAINING_LEVEL_COUNT);
  let lastCompleted = 0;
  for (let n = 1; n <= total; n++) {
    const stars = Number(levelStars[`level-${n}`]) || 0;
    if (stars > 0) lastCompleted = n;
  }
  if (lastCompleted >= total) return total;
  return lastCompleted + 1;
}

export function isTrainingPathStaffBypass(userRole = '') {
  return canAccessTeacherPanel(userRole);
}

/** Estudiantes: solo niveles hasta el actual; admin/profesor: todos. */
export function isTrainingLevelLocked(
  levelNum,
  levelStars = {},
  userRole = '',
  maxLevel = TRAINING_LEVEL_COUNT,
) {
  if (isTrainingPathStaffBypass(userRole)) return false;
  const num = Number(levelNum);
  if (!num || num < 1) return true;
  const current = getTrainingCurrentLevelNumber(levelStars, maxLevel);
  return num > current;
}
