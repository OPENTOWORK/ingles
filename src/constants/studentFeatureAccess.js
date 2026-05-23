import { isStaffRole } from '@/lib/placementLevelAccess';

/** When true, Training paths show COMING SOON for students only. */
export const STUDENT_TRAINING_COMING_SOON = true;

/** CEFR levels on /niveles that show COMING SOON for students (B2 stays open). */
export const STUDENT_NIVELES_COMING_SOON_LEVELS = new Set(['A2', 'B1', 'C1', 'C2']);

export function isStudentRole(userRole = '') {
  return userRole === 'student' || userRole === 'alumno';
}

export function isTrainingLockedForUser(userRole = '') {
  if (!STUDENT_TRAINING_COMING_SOON) return false;
  if (!isStudentRole(userRole)) return false;
  if (isStaffRole(userRole)) return false;
  return true;
}

export function isNivelesLevelComingSoonForUser(userRole = '', level = '') {
  if (!isStudentRole(userRole)) return false;
  if (isStaffRole(userRole)) return false;
  const normalized = String(level || '')
    .trim()
    .toUpperCase();
  return STUDENT_NIVELES_COMING_SOON_LEVELS.has(normalized);
}
