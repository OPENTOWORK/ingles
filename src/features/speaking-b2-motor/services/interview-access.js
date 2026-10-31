import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isStudentRole,
  isTeacherRole,
} from '@/utils/authRoles';

/**
 * While Part 1 is closed to students, only the teaching team can start an interview.
 * Set SPEAKING_B2_OPEN_TO_STUDENTS=1 when it should open to signed-in students.
 */
export function speakingB2InterviewOpenToStudents(env = process.env) {
  const flag = String(env.SPEAKING_B2_OPEN_TO_STUDENTS || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(flag);
}

export function canStartSpeakingB2Interview(roleName, env = process.env) {
  const role = String(roleName || '').trim();
  if (!role) return false;
  if (speakingB2InterviewOpenToStudents(env)) return true;
  if (isStudentRole(role)) return false;
  return isAdminRole(role) || isTeacherRole(role) || isCoordinatorRole(role) || isItRole(role);
}
