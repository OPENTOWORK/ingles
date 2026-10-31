import { indexableBlogCategoryPaths } from '@/lib/blogCategories';
import { SITE_URL } from '@/lib/siteSeo';

const CEFR_LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'];

/**
 * URLs canónicas indexables. Sin variantes noindex, sin redirecciones
 * (/contact, /niveles, /exam-theory) y sin /dralo-ai: el middleware manda
 * a los rastreadores anónimos a /login. Los artículos del blog se descubren
 * desde /blog/; el sitemap no consulta la base de datos.
 */
export const SITEMAP_PATHS = [
  '/',
  '/preparar-b2-cambridge',
  '/guia-b2-first',
  '/exam-practice',
  '/exam-strategies',
  '/exam-strategies/reading-and-use-of-english',
  '/exam-strategies/writing',
  '/exam-strategies/listening',
  '/exam-strategies/speaking',
  '/training',
  '/precios',
  '/registro',
  '/blog',
  '/newsletter',
  '/contacto',
  '/contacto/faq',
  '/legal',
  '/aviso-legal',
  '/politica-privacidad',
  '/politica-cookies',
  '/politica-reembolsos',
  '/proteccion-datos',
  '/normas-comunidad',
  '/terminos-condiciones',
  ...CEFR_LEVELS.map((level) => `/exam-practice/${level}`),
  '/exam-practice/b2/exam-reading-and-use-of-english',
  '/exam-practice/b2/exam-writing',
  '/exam-practice/b2/exam-listening',
  ...indexableBlogCategoryPaths(),
];

export function sitemapAbsoluteUrl(path) {
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path}/`;
}

/**
 * @param {string} path
 * @returns {'weekly' | 'monthly'}
 */
function changeFrequencyFor(path) {
  if (
    path === '/' ||
    path === '/exam-practice' ||
    path === '/exam-strategies' ||
    path === '/preparar-b2-cambridge' ||
    path === '/blog' ||
    path === '/precios'
  ) {
    return 'weekly';
  }
  return 'monthly';
}

function priorityFor(path) {
  if (path === '/') return 1;
  if (path === '/exam-practice' || path === '/exam-strategies' || path === '/preparar-b2-cambridge') {
    return 0.9;
  }
  if (
    path === '/precios' ||
    path === '/training' ||
    path === '/registro' ||
    path === '/blog' ||
    path === '/guia-b2-first'
  ) {
    return 0.8;
  }
  if (path === '/contacto' || path === '/newsletter') return 0.6;
  return 0.7;
}

/**
 * @param {Date} [lastModified]
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export function buildSitemapEntries(lastModified = new Date()) {
  return SITEMAP_PATHS.map((path) => ({
    url: sitemapAbsoluteUrl(path),
    lastModified,
    changeFrequency: changeFrequencyFor(path),
    priority: priorityFor(path),
  }));
}
