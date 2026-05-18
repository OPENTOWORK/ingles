/** Rutas accesibles sin login (incluye subrutas). */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/login',
  '/auth/callback',
  '/registro',
  '/reset-password',
  '/contacto',
  '/speaking',
  '/teoria',
  '/politica-privacidad',
  '/politica-cookies',
  '/terminos-condiciones',
  '/proteccion-datos',
];

export function isPublicPath(pathname = '') {
  if (!pathname) return false;
  if (pathname === '/niveles' || pathname.startsWith('/niveles/')) return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
