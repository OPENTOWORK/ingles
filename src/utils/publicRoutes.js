/** Rutas accesibles sin login (incluye subrutas). Indexables por buscadores. */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/login',
  '/auth/callback',
  '/registro',
  '/reset-password',
  '/update-password',
  '/contacto',
  '/contact',
  '/exam-practice',
  '/exam-theory',
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
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/favicon.ico') {
    return true;
  }
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
