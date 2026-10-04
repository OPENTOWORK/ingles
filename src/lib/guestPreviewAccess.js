export const GUEST_PREVIEW_REGISTER_LABEL = 'Sign up to see more';

const GUEST_APP_PREFIXES = [
  '/exam-practice',
  '/exam-strategies',
  '/training',
  '/precios',
  '/pricing',
  '/niveles',
  '/teoria/exam-strategies',
  '/teoria/exam-part-tips',
  '/exam-theory',
];

export function normalizeGuestPath(value = '') {
  const raw = String(value || '').split('?')[0].split('#')[0].trim().toLowerCase();
  if (!raw || raw === '/') return '/';
  return raw.replace(/\/+$/, '') || '/';
}

/** Rutas de la app que un invitado puede abrir (con recortes de contenido). */
export function isGuestBrowsablePath(pathname = '') {
  const path = normalizeGuestPath(pathname);
  return GUEST_APP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getGuestRegisterHref(targetHref = '/login') {
  return `/login?next=${encodeURIComponent(targetHref)}`;
}

export function isGuestExamStrategiesChapterAllowed(pathname = '') {
  const path = normalizeGuestPath(pathname);
  if (path === '/exam-strategies' || path === '/teoria/exam-strategies') return true;
  if (
    /^\/(exam-strategies|teoria\/exam-strategies)\/(reading-and-use-of-english|writing|listening|speaking)$/.test(
      path,
    )
  ) {
    return true;
  }
  if (/\/overall-strategy$/.test(path)) return true;
  if (/\/exam-part-tips\/[a-z0-9-]+\/[a-z0-9-]+\/part-1$/.test(path)) return true;
  return false;
}

/** Cookie y marca local del único intento de Writing sin cuenta. */
export const GUEST_WRITING_COOKIE = 'dralo_guest_writing_used';
export const GUEST_WRITING_ATTEMPT_KEY = 'dralo-guest-writing-used';

export function hasGuestWritingAttempt() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(GUEST_WRITING_ATTEMPT_KEY) === '1';
  } catch {
    return false;
  }
}

export function markGuestWritingAttempt() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_WRITING_ATTEMPT_KEY, '1');
  } catch {
    /* ignore */
  }
}

function isGuestB2SkillPracticePath(path, skill) {
  return (
    path === `/exam-practice/b2/${skill}` ||
    path === `/niveles/b2/${skill}` ||
    path.endsWith(`/b2/${skill}`)
  );
}

export function isGuestExamPracticeLockedHref(href = '') {
  const path = normalizeGuestPath(href);
  if (path.includes('/exam-mode')) return true;
  if (
    isGuestB2SkillPracticePath(path, 'exam-listening') ||
    isGuestB2SkillPracticePath(path, 'exam-writing')
  ) {
    return false;
  }
  if (path.includes('/exam-writing') || path.includes('/exam-listening')) return true;
  if (path.includes('/exam-strategies') || path.includes('/teoria/exam-part-tips')) return false;
  return /\/(writing|listening)(\/|$)/.test(path);
}

export function isGuestExamSlotAllowed(slot) {
  const n = Number(slot);
  return Number.isFinite(n) && n === 1;
}

/** Cualquier nivel del camino. Avanzar pide 1 estrella en el anterior. */
export function isGuestTrainingLevelAllowed(levelNum) {
  const n = Number(levelNum);
  return Number.isFinite(n) && n >= 1;
}

export function isGuestTrainingNodeAllowed(levelNumber = '') {
  const raw = String(levelNumber || '');
  if (/^review-\d+$/i.test(raw)) return true;
  const n = parseInt(raw.replace(/^level-/, ''), 10);
  return isGuestTrainingLevelAllowed(n);
}
