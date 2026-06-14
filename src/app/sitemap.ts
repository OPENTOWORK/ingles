import type { MetadataRoute } from 'next';

/** Canonical domain for SEO — never use VERCEL_URL or request host. */
const SITE_URL = 'https://www.dralo.es';

const CEFR_LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'] as const;

/** Public, indexable paths only — no login or private app areas. */
const PUBLIC_PATHS = [
  '/',
  '/aviso-legal',
  '/contacto',
  '/niveles',
  '/exam-theory',
  '/exam-practice',
  '/dralo-ai',
  '/politica-privacidad',
  '/politica-cookies',
  '/terminos-condiciones',
  ...CEFR_LEVELS.map((level) => `/niveles/${level}`),
];

function toAbsoluteUrl(path: string): string {
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path}/`;
}

/** Public XML sitemap for Google Search Console — no auth required. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: toAbsoluteUrl(path),
    lastModified,
    changeFrequency:
      path === '/' || path === '/exam-practice' || path === '/exam-theory' ? 'weekly' : 'monthly',
    priority:
      path === '/'
        ? 1
        : path === '/exam-practice' || path === '/exam-theory'
          ? 0.9
          : path === '/dralo-ai'
            ? 0.8
            : path === '/contacto'
              ? 0.6
              : 0.7,
  }));
}
