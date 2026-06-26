import {
  isAdminRole,
  isCoordinatorRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';

/** When true, Training paths show COMING SOON for students only. */
export const STUDENT_TRAINING_COMING_SOON = true;

/** CEFR levels on /niveles that show COMING SOON for students (B2 stays open). */
export const STUDENT_NIVELES_COMING_SOON_LEVELS = new Set(['A2', 'B1', 'C1', 'C2']);

export function isStudentRole(userRole = '') {
  const role = normalizeRoleName(userRole);
  return role === 'student' || role === 'alumno';
}

/**
 * Alumno y coordinador: misma experiencia de contenido (coming soon, locks, perfil, etc.).
 * Admin y profesor conservan acceso completo al contenido pedagógico.
 */
export function usesStudentContentRestrictions(userRole = '') {
  if (isAdminRole(userRole)) return false;
  if (isCoordinatorRole(userRole)) return true;
  if (isTeacherRole(userRole)) return false;
  return isStudentRole(userRole);
}

export function isTrainingLockedForUser(userRole = '') {
  if (!STUDENT_TRAINING_COMING_SOON) return false;
  return usesStudentContentRestrictions(userRole);
}

export function isNivelesLevelComingSoonForUser(userRole = '', level = '') {
  if (!usesStudentContentRestrictions(userRole)) return false;
  const normalized = String(level || '')
    .trim()
    .toUpperCase();
  return STUDENT_NIVELES_COMING_SOON_LEVELS.has(normalized);
}
