import {
  ADMIN_EMAIL,
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isMarketingRole,
  isTeacherRole,
  normalizeEmail,
  normalizeRoleName,
} from '@/utils/authRoles';

/** When true, Training paths show COMING SOON for students only. */
export const STUDENT_TRAINING_COMING_SOON = true;

/** When true, Exam Strategies hub and routes show COMING SOON for students only. */
export const STUDENT_EXAM_STRATEGIES_COMING_SOON = true;

/** CEFR levels on /niveles that show COMING SOON for students (B2 stays open). */
export const STUDENT_NIVELES_COMING_SOON_LEVELS = new Set(['A2', 'B1', 'C1', 'C2']);

/** Exam-mode sections unavailable for students/coordinators (skill practice uses the same rule). */
export const STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS = new Set(['listening', 'speaking']);

export function isStudentRole(userRole = '') {
  const role = normalizeRoleName(userRole);
  return role === 'student' || role === 'alumno';
}

/**
 * Alumno y coordinador: misma experiencia de contenido (coming soon, locks, perfil, etc.).
 * Admin, profesor, informático y Resp.marketing: acceso completo a Exam Practice,
 * Exam Strategies y Dralo AI (sin restricciones de alumno ni límites de plan).
 */
export function hasFullNivelesLevelAccess(userRole = '', email = '') {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) return true;
  if (isAdminRole(userRole)) return true;
  if (isTeacherRole(userRole)) return true;
  if (isItRole(userRole)) return true;
  if (isMarketingRole(userRole)) return true;
  return false;
}

export function usesStudentContentRestrictions(userRole = '') {
  if (hasFullNivelesLevelAccess(userRole)) return false;
  if (isCoordinatorRole(userRole)) return true;
  return isStudentRole(userRole);
}

/**
 * El profesorado necesita abrir cualquier test de cualquier parte para preparar clases,
 * así que se salta el desbloqueo secuencial por estrellas.
 */
export function bypassesExamStarGating(userRole = '', email = '') {
  return hasFullNivelesLevelAccess(userRole, email);
}

export function isTrainingLockedForUser(userRole = '') {
  if (!STUDENT_TRAINING_COMING_SOON) return false;
  return usesStudentContentRestrictions(userRole);
}

/** Exam Strategies: coming soon for logged-in students only (staff/coordinators keep access). */
export function isExamStrategiesLockedForUser(userRole = '') {
  if (!STUDENT_EXAM_STRATEGIES_COMING_SOON) return false;
  return isStudentRole(userRole);
}

export function isNivelesLevelComingSoonForUser(userRole = '', level = '', email = '') {
  if (hasFullNivelesLevelAccess(userRole, email)) return false;
  if (!usesStudentContentRestrictions(userRole)) return false;
  const normalized = String(level || '')
    .trim()
    .toUpperCase();
  return STUDENT_NIVELES_COMING_SOON_LEVELS.has(normalized);
}

/** Listening and Speaking are blocked in exam mode for the same roles as skill practice. */
export function isExamModeSectionKeyBlockedForStudent(userRole = '', sectionKey = '') {
  if (!usesStudentContentRestrictions(userRole)) return false;
  const key = String(sectionKey || '').toLowerCase();
  return STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS.has(key);
}
