import { normalizeBlogSlug } from '@/lib/blogArticles';
import { indexableBlogCategoryPaths } from '@/lib/blogCategories';
import { SITE_URL } from '@/lib/siteSeo';

/**
 * URLs canónicas indexables. Sin variantes noindex, sin redirecciones
 * (/contact, /niveles, /exam-theory) y sin /dralo-ai: el middleware manda
 * a los rastreadores anónimos a /login. A2, B1, C1 y C2 siguen en
 * "Coming soon" y no se listan. Los artículos salen de la misma consulta
 * que el listado público del blog.
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
  '/exam-practice/b2',
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
    path === '/guia-b2-first' ||
    path === '/blog' ||
    path === '/precios'
  ) {
    return 'weekly';
  }
  return 'monthly';
}

function priorityFor(path) {
  if (path === '/') return 1;
  if (path === '/exam-practice' || path === '/exam-strategies' || path === '/preparar-b2-cambridge' || path === '/guia-b2-first') {
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

function articleLastModified(article) {
  const raw = article?.updated_at || article?.published_at;
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

/**
 * Las páginas estáticas no tienen una fecha de modificación fiable: no llevan lastmod.
 * Los artículos usan updated_at o, si no existe, published_at.
 *
 * @param {{ articles?: Array<Record<string, unknown>> } | Date} [options]
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export function buildSitemapEntries(options = {}) {
  const articles = options && Array.isArray(options.articles) ? options.articles : [];
  const pages = SITEMAP_PATHS.map((path) => ({
    url: sitemapAbsoluteUrl(path),
    changeFrequency: changeFrequencyFor(path),
    priority: priorityFor(path),
  }));

  const posts = [];
  for (const article of articles) {
    const slug = normalizeBlogSlug(article?.slug);
    if (!slug) continue;
    const lastModified = articleLastModified(article);
    posts.push({
      url: sitemapAbsoluteUrl(`/blog/${slug}`),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return [...pages, ...posts];
}
