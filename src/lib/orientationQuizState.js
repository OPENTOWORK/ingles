/** Solo se abre sola en cuentas creadas desde que el cuestionario dejó la landing. */
export const ORIENTATION_QUIZ_SINCE = Date.parse('2026-10-14T00:00:00.000Z');

const DEVICE_KEY_PREFIX = 'dralo:orientation-quiz-seen:';

/** Cuentas nuevas que aún no han cerrado el cuestionario en este dispositivo. */
export function shouldOfferOrientationQuiz(user, { seenOnDevice = false } = {}) {
  if (!user?.id || seenOnDevice) return false;
  const createdAt = Date.parse(user.created_at || '');
  return Number.isFinite(createdAt) && createdAt >= ORIENTATION_QUIZ_SINCE;
}

export function wasOrientationQuizSeen(userId) {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(`${DEVICE_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

export function markOrientationQuizSeen(userId) {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${DEVICE_KEY_PREFIX}${userId}`, '1');
  } catch {
    /* modo privado */
  }
}
