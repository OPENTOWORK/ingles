import type { MetadataRoute } from 'next';
import { fetchPublishedBlogArticles } from '@/lib/blogArticles';
import { buildSitemapEntries } from '@/lib/sitemapPaths';

export const dynamic = 'force-dynamic';

/** Public XML sitemap for Google Search Console — no auth required. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Array<Record<string, unknown>> = [];
  try {
    articles = await fetchPublishedBlogArticles(500);
  } catch (error) {
    console.error('[sitemap] blog articles:', error);
  }
  return buildSitemapEntries({ articles });
}
