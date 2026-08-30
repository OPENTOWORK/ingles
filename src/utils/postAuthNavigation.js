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
