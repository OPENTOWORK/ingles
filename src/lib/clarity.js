/** Rutas internas donde no cargamos Clarity (paneles de staff). */
export function isClarityExcludedPath(pathname = '') {
  if (!pathname) return false;
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/informatico') ||
    pathname.startsWith('/soporte')
  );
}

export function claritySet(key, value) {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  const safeValue = value == null ? '' : String(value).slice(0, 255);
  window.clarity('set', key, safeValue);
}

export function clarityEvent(name) {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
  window.clarity('event', String(name).slice(0, 128));
}
