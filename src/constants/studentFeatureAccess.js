import {
  ADMIN_EMAIL,
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isTeacherRole,
  normalizeEmail,
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
 * Admin, profesor e informático: acceso completo al contenido pedagógico.
 */
export function hasFullNivelesLevelAccess(userRole = '', email = '') {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) return true;
  if (isAdminRole(userRole)) return true;
  if (isTeacherRole(userRole)) return true;
  if (isItRole(userRole)) return true;
  return false;
}

export function usesStudentContentRestrictions(userRole = '') {
  if (hasFullNivelesLevelAccess(userRole)) return false;
  if (isCoordinatorRole(userRole)) return true;
  return isStudentRole(userRole);
}

export function isTrainingLockedForUser(userRole = '') {
  if (!STUDENT_TRAINING_COMING_SOON) return false;
  return usesStudentContentRestrictions(userRole);
}

export function isNivelesLevelComingSoonForUser(userRole = '', level = '', email = '') {
  if (hasFullNivelesLevelAccess(userRole, email)) return false;
  if (!usesStudentContentRestrictions(userRole)) return false;
  const normalized = String(level || '')
    .trim()
    .toUpperCase();
  return STUDENT_NIVELES_COMING_SOON_LEVELS.has(normalized);
}
