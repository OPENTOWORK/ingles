import { isStudentRole } from '@/utils/authRoles';

const DONE_KEY_PREFIX = 'dralo:welcome-form-done:';

/** El formulario de bienvenida solo se pide al alumno con el correo confirmado. */
export function isWelcomeFormEligible(user, userRole) {
  return (
    Boolean(user?.id) &&
    Boolean(user.email_confirmed_at || user.confirmed_at) &&
    isStudentRole(userRole)
  );
}

/** En esta sesión ya se envió o no había formulario pendiente. */
export function isWelcomeFormDone(userId) {
  try {
    return window.sessionStorage.getItem(`${DONE_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeFormDone(userId) {
  try {
    window.sessionStorage.setItem(`${DONE_KEY_PREFIX}${userId}`, '1');
  } catch {
    /* ignore */
  }
}
