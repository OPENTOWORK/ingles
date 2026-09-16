/**
 * Enlaces y fechas de la encuesta founding. Sin dependencias de Supabase ni
 * Stripe, para poder usarse tanto en las rutas como en scripts sueltos.
 */

export function foundingAppBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dralo.es';
  return base.replace(/\/$/, '');
}

/** La barra final evita el redirect 308 de `trailingSlash` al abrir el correo. */
export function buildFoundingSurveyUrl(token) {
  return `${foundingAppBaseUrl()}/founding/encuesta/${encodeURIComponent(token)}/`;
}

export function formatFoundingDeadline(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(date);
}
