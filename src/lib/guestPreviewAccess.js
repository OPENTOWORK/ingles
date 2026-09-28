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

export function isGuestExamPracticeLockedHref(href = '') {
  const path = normalizeGuestPath(href);
  return path.includes('/exam-mode') || path.includes('/quiz-game');
}

export function isGuestExamSlotAllowed(slot) {
  const n = Number(slot);
  return Number.isFinite(n) && n === 1;
}

export function isGuestTrainingLevelAllowed(levelNum) {
  return Number(levelNum) === 1;
}

export function isGuestTrainingNodeAllowed(levelNumber = '') {
  const raw = String(levelNumber || '');
  if (/^review-\d+$/i.test(raw)) return false;
  const n = parseInt(raw.replace(/^level-/, ''), 10);
  return isGuestTrainingLevelAllowed(n);
}
