/** Rutas de landing de conversión (ads): sin menú, solo logo. */
export const MINIMAL_LANDING_PATH_PREFIXES = ['/campana', '/preparar-b2-cambridge'];

export function isMinimalLandingPath(pathname = '') {
  if (!pathname) return false;
  return MINIMAL_LANDING_PATH_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
