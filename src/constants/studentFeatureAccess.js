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

/** @deprecated Students have full Exam Strategies access; kept for legacy imports. */
export const STUDENT_EXAM_STRATEGIES_COMING_SOON = false;

/** CEFR levels on /niveles that show COMING SOON for students (B2 stays open). */
export const STUDENT_NIVELES_COMING_SOON_LEVELS = new Set(['A2', 'B1', 'C1', 'C2']);

/** Exam-mode sections unavailable for students (skill practice uses hub `enabledForStudents`). */
export const STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS = new Set(['speaking']);

export function isStudentRole(userRole = '') {
  const role = normalizeRoleName(userRole);
  return role === 'student' || role === 'alumno';
}

/**
 * Profesorado y coordinación: acceso completo a niveles, exámenes y teoría.
 * Admin, informático y Resp.marketing comparten la misma experiencia de contenido.
 */
export function hasFullNivelesLevelAccess(userRole = '', email = '') {
  if (normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)) return true;
  if (isAdminRole(userRole)) return true;
  if (isTeacherRole(userRole)) return true;
  if (isCoordinatorRole(userRole)) return true;
  if (isItRole(userRole)) return true;
  if (isMarketingRole(userRole)) return true;
  return false;
}

export function usesStudentContentRestrictions(userRole = '') {
  if (hasFullNivelesLevelAccess(userRole)) return false;
  return isStudentRole(userRole);
}

/** Profesorado y coordinación abren cualquier test sin desbloqueo secuencial por estrellas. */
export function bypassesExamStarGating(userRole = '', email = '') {
  return hasFullNivelesLevelAccess(userRole, email);
}

export function isTrainingLockedForUser(userRole = '') {
  if (!STUDENT_TRAINING_COMING_SOON) return false;
  return usesStudentContentRestrictions(userRole);
}

/** Exam Strategies is open for all logged-in roles (including students). */
export function isExamStrategiesLockedForUser(_userRole = '') {
  return false;
}

export function isNivelesLevelComingSoonForUser(userRole = '', level = '', email = '') {
  if (hasFullNivelesLevelAccess(userRole, email)) return false;
  if (!usesStudentContentRestrictions(userRole)) return false;
  const normalized = String(level || '')
    .trim()
    .toUpperCase();
  return STUDENT_NIVELES_COMING_SOON_LEVELS.has(normalized);
}

/** Speaking stays blocked in full exam mode for students; listening follows hub flags like writing/RUOE. */
export function isExamModeSectionKeyBlockedForStudent(userRole = '', sectionKey = '') {
  if (!usesStudentContentRestrictions(userRole)) return false;
  const key = String(sectionKey || '').toLowerCase();
  return STUDENT_EXAM_MODE_BLOCKED_SECTION_KEYS.has(key);
}
