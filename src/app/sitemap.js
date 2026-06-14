import { getPublicSitemapPaths, getSiteUrl, toSitemapUrl } from '@/lib/siteSeo';

/** Served at /sitemap.xml — public, no auth, valid XML for Search Console. */
export default function sitemap() {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return getPublicSitemapPaths().map((path) => ({
    url: toSitemapUrl(baseUrl, path),
    lastModified,
    changeFrequency: path === '/' || path === '/niveles' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/niveles' ? 0.9 : path.startsWith('/niveles/') ? 0.8 : 0.6,
  }));
}
