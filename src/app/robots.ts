import type { MetadataRoute } from 'next';

/** Canonical domain for SEO — never use VERCEL_URL or request host. */
const SITE_URL = 'https://www.dralo.es';

/**
 * Prefijos internos verificados en src/app. La barra final evita coincidir con
 * páginas públicas de otro nombre. No incluye práctica, blog, estrategias,
 * precios, contacto, guías ni APIs que esas páginas piden al renderizar.
 */
const PRIVATE_PATHS = [
  '/admin/',
  '/teacher/',
  '/coordinador/',
  '/soporte/',
  '/informatico/',
  '/paneles/',
  '/tareas/',
  '/buzon/',
  '/centro-empresa/',
  '/clases-grupos/',
  '/plan-objetivos/',
  '/prueba-nivel/',
  '/profile/',
  '/perfil/',
  '/fix-page/',
  '/founding/',
  '/auth/',
  '/api/admin/',
  '/api/auth/',
  '/api/cron/',
  '/api/coordinator/',
  '/api/teacher/',
  '/api/informatico/',
  '/api/buzon/',
  '/api/staff/',
  '/api/internal/',
  '/api/perfil/',
  '/api/profile/',
  '/api/support/',
  '/api/account/',
  '/api/stripe/',
  '/api/auro/',
  '/api/placement/',
  '/api/plan-objetivos/',
  '/api/invitations/',
];

/** Public robots.txt. Preview deployments must not be indexed. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'preview') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
