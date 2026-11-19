import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';

const PAID_PLANS = new Set(['starter', 'premium', 'pro']);
const PAID_STATUSES = new Set(['active', 'trialing', 'past_due', 'canceled', 'cancelled', 'unpaid']);

export const BLACK_FRIDAY_EMAILS = [
  {
    date: '2026-11-20',
    slug: 'black_friday_offer',
    src: 'bf-email-1',
    trigger: AUTOMATED_EMAIL_TRIGGERS.BLACK_FRIDAY_OFFER,
  },
  {
    date: '2026-11-27',
    slug: 'black_friday_writing',
    src: 'bf-email-2',
    trigger: AUTOMATED_EMAIL_TRIGGERS.BLACK_FRIDAY_WRITING,
  },
  {
    date: '2026-11-30',
    slug: 'black_friday_last_day',
    src: 'bf-email-3',
    trigger: AUTOMATED_EMAIL_TRIGGERS.BLACK_FRIDAY_LAST_DAY,
  },
];

export const BLACK_FRIDAY_EMAIL_LEGAL =
  'Oferta válida hasta el 30/11/2026. El plan anual se renueva automáticamente al precio vigente (actualmente 34,99 €/año). Puedes cancelar la renovación desde tu cuenta.';

export function madridYmd(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function blackFridayEmailForDate(now = new Date()) {
  const ymd = madridYmd(now);
  return BLACK_FRIDAY_EMAILS.find((item) => item.date === ymd) || null;
}

export function blackFridayOfferUrl(origin, src) {
  const base = String(origin || 'https://www.dralo.es').replace(/\/$/, '');
  return `${base}/precios/?facturacion=anual&utm_source=email&utm_campaign=black_friday&src=${encodeURIComponent(src)}`;
}

export function blackFridayGreeting(nombre) {
  const first = formatNombreVariable(nombre).trim();
  return first ? `, ${first}` : '';
}

/** True si el perfil o la suscripción indican que ya pagó o ya tiene un plan de pago. */
export function userAlreadyPaid({ planId, subscription } = {}) {
  if (PAID_PLANS.has(String(planId || '').trim().toLowerCase())) return true;
  if (!subscription) return false;
  const plan = String(subscription.plan_id || '').trim().toLowerCase();
  const status = String(subscription.status || '').trim().toLowerCase();
  const stripeId = String(subscription.stripe_subscription_id || '').trim();
  if (stripeId && status && status !== 'incomplete' && status !== 'incomplete_expired') return true;
  const store = String(subscription.store || '').trim().toLowerCase();
  if ((store === 'google' || store === 'apple') && PAID_PLANS.has(plan)) return true;
  return PAID_PLANS.has(plan) && PAID_STATUSES.has(status);
}
