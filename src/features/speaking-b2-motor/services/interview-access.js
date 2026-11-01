import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isStudentRole,
  isTeacherRole,
} from '@/utils/authRoles';

/**
 * Students can start the interview. A visitor with no account can start test 1.
 * SPEAKING_B2_OPEN_TO_STUDENTS=1 also admits the remaining signed-in roles.
 */
export function speakingB2InterviewOpenToStudents(env = process.env) {
  const flag = String(env.SPEAKING_B2_OPEN_TO_STUDENTS || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(flag);
}

export function canStartSpeakingB2Interview(roleName, env = process.env) {
  const role = String(roleName || '').trim();
  if (!role || isStudentRole(role)) return true;
  if (speakingB2InterviewOpenToStudents(env)) return true;
  return isAdminRole(role) || isTeacherRole(role) || isCoordinatorRole(role) || isItRole(role);
}
