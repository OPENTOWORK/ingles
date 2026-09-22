const OPEN_MAIN_MENU_KEY = 'dralo_open_main_menu';
const PHONE_MEDIA = '(max-width: 639px)';

/** Misma anchura que el menú lateral de la home en el móvil. */
export function isPhoneViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(PHONE_MEDIA).matches;
}

/** La home debe abrir el menú lateral al llegar desde el login del móvil. */
export function markOpenMainMenuAfterLogin() {
  try {
    sessionStorage.setItem(OPEN_MAIN_MENU_KEY, '1');
  } catch {
    /* modo privado */
  }
}

export function peekOpenMainMenuAfterLogin() {
  try {
    return sessionStorage.getItem(OPEN_MAIN_MENU_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearOpenMainMenuAfterLogin() {
  try {
    sessionStorage.removeItem(OPEN_MAIN_MENU_KEY);
  } catch {
    /* modo privado */
  }
}

/**
 * Destino tras login. En el móvil, sin `next`, es la home (menú principal).
 * Con `next` se respeta la página pedida.
 */
export function destinationAfterLogin({ nextPath, rolePath, phone }) {
  if (nextPath) return normalizePostAuthPath(nextPath);
  if (phone) return '/';
  return normalizePostAuthPath(rolePath || '/perfil/');
}

/**
 * Normaliza rutas tras login/registro para evitar recargas en /profile
 * (rewrite que puede romper el SSR de Next.js). Prefiere /perfil.
 */
export function normalizePostAuthPath(path) {
  if (!path || typeof path !== 'string') return '/perfil/';

  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/perfil/';

  const qIndex = trimmed.indexOf('?');
  const pathname = qIndex >= 0 ? trimmed.slice(0, qIndex) : trimmed;
  const query = qIndex >= 0 ? trimmed.slice(qIndex) : '';

  let normalized = pathname.replace(/\/profile\/?$/i, '/perfil');
  if (normalized !== '/' && !normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }

  return `${normalized}${query}`;
}
