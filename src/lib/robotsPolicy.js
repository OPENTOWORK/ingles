import { SITE_URL } from '@/lib/siteSeo';

/**
 * robots.txt de producción (Next.js MetadataRoute en src/app/robots.ts).
 * No es un control de acceso: el middleware y cada API siguen exigiendo sesión.
 *
 * Cada ruta privada se publica como `/ruta$` y `/ruta/`. La barra evita que un
 * prefijo corto tape otra URL (`/speaking` no tapa `/speaking-lab`, `/api/dralo`
 * no tapa `/api/dralo-ai`). `$` lo entienden Google, Bing y Yandex; si un
 * rastreador lo ignora, la regla con barra sigue cubriendo la URL canónica
 * (trailingSlash) y la redirección de Next.
 *
 * Un solo User-agent: * . Googlebot, Bingbot y los rastreadores de búsqueda o
 * respuesta de IA (GPTBot, OAI-SearchBot, Google-Extended, etc.) heredan las
 * mismas reglas. No se bloquean bots de IA ni se añaden directivas ajenas al
 * estándar (Content-Signal, Crawl-delay, Host).
 */

export const ROBOTS_SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

/** Recursos que el render y el descubrimiento (AEO) necesitan. */
export const ROBOTS_ALLOW_PATHS = [
  '/',
  '/_next/static/',
  '/_next/image/',
  '/llms.txt',
  '/.well-known/',
  '/listening-preview/',
];

/**
 * Paneles, autenticación y APIs que no son el HTML público.
 * /registro se queda fuera: es la alta pública enlazada desde llms.txt.
 * /campana y las variantes noindex de la guía siguen rastreables para que
 * Google pueda leer noindex y canonical.
 * /api/founding-member/slots, /api/blog y las APIs de práctica no se listan:
 * las páginas públicas las piden al renderizar.
 */
const PRIVATE_ROUTE_ROOTS = [
  '/admin',
  '/teacher',
  '/coordinador',
  '/soporte',
  '/informatico',
  '/paneles',
  '/tareas',
  '/buzon',
  '/centro-empresa',
  '/clases-grupos',
  '/plan-objetivos',
  '/prueba-nivel',
  '/profile',
  '/perfil',
  '/fix-page',
  '/founding',
  '/auth',
  '/login',
  '/reset-password',
  '/update-password',
  '/dralo-dev',
  '/dralo-ai',
  '/speaking',
  '/api/admin',
  '/api/auth',
  '/api/cron',
  '/api/coordinator',
  '/api/teacher',
  '/api/informatico',
  '/api/buzon',
  '/api/staff',
  '/api/internal',
  '/api/perfil',
  '/api/profile',
  '/api/support',
  '/api/account',
  '/api/stripe',
  '/api/auro',
  '/api/placement',
  '/api/plan-objetivos',
  '/api/invitations',
  '/api/activity',
  '/api/ai',
  '/api/estudio',
  '/api/formularios',
  '/api/referrals',
  '/api/subscription',
  '/api/gemini-coach',
  '/api/gemini-transcribe',
  '/api/tutoring',
  '/api/teoria-progreso',
  '/api/theory-exercise-progress',
  '/api/levels-progreso',
  '/api/marketing',
  '/api/site-assistant',
  '/api/dralo',
  '/api/founding-member/encuesta',
];

export function disallowRulesForRoot(root) {
  const normalized = String(root || '').replace(/\/+$/, '');
  if (!normalized.startsWith('/')) {
    throw new Error(`Ruta de robots inválida: ${root}`);
  }
  return [`${normalized}$`, `${normalized}/`];
}

export const ROBOTS_DISALLOW_PATHS = PRIVATE_ROUTE_ROOTS.flatMap(disallowRulesForRoot);

function asList(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Política que consume src/app/robots.ts. En preview no se indexa el deploy.
 * @param {{ preview?: boolean }} [options]
 * @returns {import('next').MetadataRoute.Robots}
 */
export function buildRobotsPolicy({ preview = false } = {}) {
  if (preview) {
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
      allow: ROBOTS_ALLOW_PATHS,
      disallow: ROBOTS_DISALLOW_PATHS,
    },
    sitemap: ROBOTS_SITEMAP_URL,
  };
}

function patternToRegExp(pattern) {
  let source = '^';
  for (const char of pattern) {
    if (char === '*') source += '.*';
    else if (char === '$') source += '$';
    else source += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(source);
}

function patternLength(pattern) {
  return pattern.endsWith('$') ? pattern.length - 1 : pattern.length;
}

/**
 * Misma regla que Google: gana la coincidencia más larga; a igual longitud, Allow.
 * Por defecto se permite. Solo se evalúa el path, sin query.
 */
export function isPathAllowedByRobots(pathname, { preview = false } = {}) {
  const path = String(pathname || '/').split('?')[0].split('#')[0] || '/';
  const policy = buildRobotsPolicy({ preview });
  const groups = asList(policy.rules);
  const group = groups.find((rule) => asList(rule.userAgent).includes('*')) || groups[0];
  let winner = { type: 'allow', length: 0 };

  for (const pattern of asList(group.allow)) {
    if (!patternToRegExp(pattern).test(path)) continue;
    const length = patternLength(pattern);
    if (length >= winner.length) winner = { type: 'allow', length };
  }

  for (const pattern of asList(group.disallow)) {
    if (!patternToRegExp(pattern).test(path)) continue;
    const length = patternLength(pattern);
    if (length > winner.length) winner = { type: 'disallow', length };
  }

  return winner.type === 'allow';
}

/** Texto plano equivalente al robots.txt que emite Next.js 14. */
export function renderRobotsTxt(policy = buildRobotsPolicy()) {
  const lines = [];
  for (const rule of asList(policy.rules)) {
    for (const agent of asList(rule.userAgent)) lines.push(`User-Agent: ${agent}`);
    for (const allow of asList(rule.allow)) lines.push(`Allow: ${allow}`);
    for (const disallow of asList(rule.disallow)) lines.push(`Disallow: ${disallow}`);
    lines.push('');
  }
  for (const sitemap of asList(policy.sitemap)) lines.push(`Sitemap: ${sitemap}`);
  return `${lines.join('\n').replace(/\n+$/, '\n')}`;
}
