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
  /** Encuesta founding: se abre desde el correo, con token y sin iniciar sesión. */
  '/founding/encuesta',
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
