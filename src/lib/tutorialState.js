import { nivelesPathToExamPractice } from '@/config/appRoutes';

/** Clave en user_metadata: la cuenta ya ha visto el tutorial. */
export const TUTORIAL_SEEN_METADATA_KEY = 'tutorial_seen_at';

/** Solo se abre solo en cuentas creadas desde que existe el tutorial. */
export const TUTORIAL_AUTO_OPEN_SINCE = Date.parse('2026-10-12T00:00:00.000Z');

const DEVICE_KEY_PREFIX = 'dralo:tutorial-seen:';

/** Páginas de entrada: abrirlo aquí no corta ningún examen. */
const AUTO_OPEN_PATHS = new Set([
  '/',
  '/exam-practice/b2',
  '/exam-practice/b2/exam-reading-and-use-of-english',
  '/exam-practice/b2/exam-writing',
  '/exam-practice/b2/exam-listening',
  '/training',
  '/perfil',
  '/profile',
]);

function normalizePath(pathname = '') {
  const path = String(pathname || '').split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return path === '/' ? path : nivelesPathToExamPractice(path);
}

/** El simulacro cronometrado (?examMode) usa las mismas rutas que la práctica. */
export function isTutorialAutoOpenPath(pathname, search = '') {
  if (new URLSearchParams(search).has('examMode')) return false;
  return AUTO_OPEN_PATHS.has(normalizePath(pathname));
}

export function shouldAutoOpenTutorial(user, { seenOnDevice = false } = {}) {
  if (!user?.id || seenOnDevice) return false;
  if (user.user_metadata?.[TUTORIAL_SEEN_METADATA_KEY]) return false;
  const createdAt = Date.parse(user.created_at || '');
  return Number.isFinite(createdAt) && createdAt >= TUTORIAL_AUTO_OPEN_SINCE;
}

export function wasTutorialSeenOnDevice(userId) {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(`${DEVICE_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

export function rememberTutorialSeenOnDevice(userId) {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${DEVICE_KEY_PREFIX}${userId}`, '1');
  } catch {
    /* modo privado */
  }
}
