/** Rutas de landing de conversión (ads): sin menú, solo logo. */
export const MINIMAL_LANDING_PATH_PREFIXES = ['/campana', '/preparar-b2-cambridge'];

export function isMinimalLandingPath(pathname = '') {
  if (!pathname) return false;
  return MINIMAL_LANDING_PATH_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Variantes A/B. Las URLs originales de campaña y guía no entran aquí. */
export function isAbExperimentPath(pathname = '') {
  const path = String(pathname || '').split('?')[0];
  return /^\/(campana|preparar-b2-cambridge)\/(a|b)\/?$/.test(path);
}
