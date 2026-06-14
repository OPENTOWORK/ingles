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
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
  '/politica-privacidad',
  '/politica-cookies',
  '/terminos-condiciones',
  '/proteccion-datos',
  '/aviso-legal',
  '/normas-comunidad',
  '/politica-reembolsos',
];

export function isPublicPath(pathname = '') {
  if (!pathname) return false;
  if (pathname === '/niveles' || pathname.startsWith('/niveles/')) return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
