/** Canonical production URL for SEO (sitemap, robots, Open Graph). */
const DEFAULT_SITE_URL = 'https://www.dralo.es';

export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (process.env.VERCEL_URL && process.env.VERCEL === '1') {
    const host = process.env.VERCEL_URL.replace(/\/$/, '');
    return host.startsWith('http') ? host : `https://${host}`;
  }

  return DEFAULT_SITE_URL;
}

const CEFR_LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'];

/** Public indexable paths (no login). Matches publicRoutes + level hubs. */
export function getPublicSitemapPaths() {
  const paths = new Set([
    '/',
    '/niveles',
    '/teoria',
    '/contacto',
    '/login',
    '/registro',
    '/reset-password',
    '/prueba-nivel',
    '/precios',
    '/politica-privacidad',
    '/politica-cookies',
    '/terminos-condiciones',
    '/proteccion-datos',
    '/aviso-legal',
    '/normas-comunidad',
    '/politica-reembolsos',
  ]);

  for (const level of CEFR_LEVELS) {
    paths.add(`/niveles/${level}`);
  }

  return [...paths].sort((a, b) => a.localeCompare(b));
}

export function toSitemapUrl(baseUrl, path) {
  const base = baseUrl.replace(/\/$/, '');
  if (path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}/`;
}
