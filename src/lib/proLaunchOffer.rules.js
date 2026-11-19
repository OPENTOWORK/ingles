/** Una sola config de la oferta: 25 plazas y 3 meses de Plan Plus (slug `premium`). */
export const PRO_LAUNCH_COHORT = 'pro_launch_25';
export const PRO_LAUNCH_SLOT_LIMIT = 25;
export const PRO_LAUNCH_MONTHS = 3;
/** Mismo plan que el Plus de pago. El slug `pro` (PREMIUM) ya no se ofrece. */
export const PRO_LAUNCH_PLAN_SLUG = 'premium';
export const PRO_LAUNCH_PLAN_LABEL = 'Plan Plus';
/** Altas anteriores a esta fecha no entran en el cupo ni lo consumen. */
export const PRO_LAUNCH_STARTED_AT = '2026-11-12T00:00:00.000Z';
export const PRO_LAUNCH_SLOTS_PATH = '/api/pro-launch/slots/';

/**
 * TODO: no hay regla para el día en que terminan los 3 meses.
 * No afirmar cobro, tarjeta ni paso al plan gratuito hasta que se confirme.
 */
export const PRO_LAUNCH_AFTER_EXPIRY = null;

export function computeProLaunchAvailability(claimedCount, total = PRO_LAUNCH_SLOT_LIMIT) {
  const limit = Math.max(0, Number(total) || 0);
  const claimed = Math.min(Math.max(0, Number(claimedCount) || 0), limit);
  const remaining = Math.max(0, limit - claimed);
  return {
    cohort: PRO_LAUNCH_COHORT,
    total: limit,
    months: PRO_LAUNCH_MONTHS,
    claimed,
    remaining,
    soldOut: limit === 0 || remaining === 0,
  };
}

export function isEligibleForProLaunch(createdAt) {
  if (!createdAt) return false;
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return false;
  return time >= new Date(PRO_LAUNCH_STARTED_AT).getTime();
}

/** Suma meses de calendario en UTC. El 31 pasa al último día del mes de destino. */
export function proTrialEndsAt(grantedAt, months = PRO_LAUNCH_MONTHS) {
  const date = new Date(grantedAt);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + Number(months || 0));
  if (date.getUTCDate() < day) date.setUTCDate(0);
  return date.toISOString();
}

export function proLaunchSlotsLabel(remaining, total = PRO_LAUNCH_SLOT_LIMIT) {
  const left = Number(remaining);
  if (!Number.isInteger(left) || left <= 0) return 'Plazas completadas';
  if (left === 1) return `Queda 1 de ${total} plazas`;
  return `Quedan ${left} de ${total} plazas`;
}

export const PRO_LAUNCH_COPY = {
  badge: 'Oferta hasta el 31/12/2026',
  title: 'Prepara tu B2 First con el Plan Plus por 3,99 €/mes',
  subtitle:
    'Practica las partes del examen, recibe feedback sobre tus respuestas y entiende qué necesitas mejorar.',
  cta: 'Empezar con el Plan Plus',
  ctaSoldOut: 'Crear mi cuenta',
  soldOutTitle: 'Oferta cerrada',
  soldOutText: 'Puedes crear tu cuenta y ver el Plan Plus en la página de precios.',
  previousOfferNote: '',
  microcopy: '3,99 €/mes en lugar de 9,99 €. Oferta disponible hasta el 31/12/2026.',
  metaDescription:
    'Practica el B2 First, recibe feedback sobre tus respuestas y entiende tus errores. Plan Plus a 3,99 €/mes hasta el 31/12/2026.',
  metaDescriptionClosed:
    'Practica el B2 First, recibe feedback sobre tus respuestas y entiende tus errores. Plan Plus a 3,99 €/mes hasta el 31/12/2026.',
};
