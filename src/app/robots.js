import { getSiteUrl } from '@/lib/siteSeo';

/** Served at /robots.txt — public, includes sitemap URL for crawlers. */
export default function robots() {
  const baseUrl = getSiteUrl();

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
        '/centro-empresa/',
        '/clases-grupos/',
        '/perfil/',
        '/plan-objetivos/',
        '/dralo-ai/',
        '/auth/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
