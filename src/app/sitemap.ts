import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/lib/sitemapPaths';

/** Public XML sitemap for Google Search Console — no auth required. */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(new Date());
}
