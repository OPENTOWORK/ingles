/**
 * Rutas accesibles sin iniciar sesión (móvil, tablet y escritorio).
 * Cualquier otra ruta → middleware y cliente redirigen a /login.
 */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/login',
  '/contacto',
  '/contact',
  /** OAuth / enlaces de recuperación de contraseña (no son contenido de la app). */
  '/auth/callback',
  '/reset-password',
  '/update-password',
];

export function isPublicPath(pathname = '') {
  if (!pathname) return false;
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
