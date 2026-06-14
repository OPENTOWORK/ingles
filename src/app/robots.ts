import type { MetadataRoute } from 'next';

/** Canonical domain for SEO — never use VERCEL_URL or request host. */
const SITE_URL = 'https://www.dralo.es';

/** Public robots.txt — allows marketing pages; blocks private app areas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/teacher/',
        '/coordinador/',
        '/soporte/',
        '/informatico/',
        '/perfil/',
        '/auth/',
        '/login/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
