/** Una sola config de la oferta: 25 plazas y 3 meses de Plan PREMIUM (slug `pro`). */
export const PRO_LAUNCH_COHORT = 'pro_launch_25';
export const PRO_LAUNCH_SLOT_LIMIT = 25;
export const PRO_LAUNCH_MONTHS = 3;
export const PRO_LAUNCH_PLAN_SLUG = 'pro';
/**
 * En el catálogo público el slug `pro` se llama Plan PREMIUM.
 * No hay un plan distinto llamado "Pro".
 */
export const PRO_LAUNCH_PLAN_LABEL = 'Plan PREMIUM';
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
  badge: `Oferta de lanzamiento · ${PRO_LAUNCH_SLOT_LIMIT} plazas`,
  title: `Prepara tu B2 First con ${PRO_LAUNCH_MONTHS} meses de ${PRO_LAUNCH_PLAN_LABEL} gratis`,
  subtitle: `Practica las partes del examen, recibe feedback sobre tus respuestas y entiende qué necesitas mejorar. Solo para los primeros ${PRO_LAUNCH_SLOT_LIMIT} registros.`,
  cta: 'Reservar mi plaza',
  ctaSoldOut: 'Crear mi cuenta',
  soldOutTitle: 'Plazas completadas',
  soldOutText: `Las ${PRO_LAUNCH_SLOT_LIMIT} plazas de ${PRO_LAUNCH_MONTHS} meses de ${PRO_LAUNCH_PLAN_LABEL} ya están asignadas. Puedes crear tu cuenta, sin esta oferta.`,
  previousOfferNote: 'Las 50 plazas de la oferta anterior ya están asignadas.',
  microcopy: `${PRO_LAUNCH_MONTHS} meses de ${PRO_LAUNCH_PLAN_LABEL} sin coste. La oferta termina al completarse las ${PRO_LAUNCH_SLOT_LIMIT} plazas.`,
  metaDescription: `Practica el B2 First con ejercicios en formato examen. Los primeros ${PRO_LAUNCH_SLOT_LIMIT} registros tienen ${PRO_LAUNCH_MONTHS} meses de ${PRO_LAUNCH_PLAN_LABEL} gratis.`,
  metaDescriptionClosed:
    'Practica el B2 First con ejercicios en formato examen, entiende tus errores y recibe correcciones de Writing. Crea tu cuenta gratis, sin tarjeta.',
};
