/**
 * Rutas accesibles sin iniciar sesión (móvil, tablet y escritorio).
 * Cualquier otra ruta → middleware y cliente redirigen a /login.
 */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/campana',
  '/preparar-b2-cambridge',
  '/login',
  '/registro',
  '/contacto',
  '/contact',
  '/blog',
  '/exam-practice',
  '/exam-strategies',
  '/exam-theory',
  '/training',
  '/precios',
  '/pricing',
  '/niveles',
  '/teoria/exam-strategies',
  '/teoria/exam-part-tips',
  '/legal',
  '/terminos-condiciones',
  '/aviso-legal',
  '/politica-reembolsos',
  '/normas-comunidad',
  '/politica-privacidad',
  '/politica-cookies',
  '/proteccion-datos',
  /** Guías en PDF que se regalan fuera de la app (Instagram, correo). */
  '/guias',
  /** Encuesta founding: se abre desde el correo, con token y sin iniciar sesión. */
  '/founding/encuesta',
  /**
   * Manifiestos ARD. Si el middleware los manda a /login, el auditor recibe HTML.
   * /.well-known/ai-catalog.json y /.well-known/ard.json viven en public/.
   */
  '/.well-known',
  /** OAuth / enlaces de recuperación de contraseña (no son contenido de la app). */
  '/auth/callback',
  '/auth/confirm',
  '/reset-password',
  '/update-password',
];

export function isPublicPath(pathname = '') {
  if (!pathname) return false;
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
