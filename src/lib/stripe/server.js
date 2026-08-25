/**
 * Cliente de Stripe y resolución de precios (solo servidor).
 *
 * Los price ids viven en variables de entorno con el patrón
 * STRIPE_PRICE_<SLUG>_MONTHLY / STRIPE_PRICE_<SLUG>_YEARLY, de forma que añadir
 * un plan nuevo no exige tocar este fichero. Créalos con:
 *   node scripts/stripe-setup-prices.mjs
 */
import Stripe from 'stripe';
import { DRALO_SUBSCRIPTION_PLANS } from '@/data/financialPlanConfig';

export const STRIPE_INTERVALS = ['month', 'year'];

/** Estados de Stripe que dan acceso de pago al alumno. */
const ENTITLED_STATUSES = new Set(['trialing', 'active', 'past_due']);

let cachedClient = null;
let cachedKey = '';

export function getStripeSecretKey() {
  return (process.env.STRIPE_SECRET_KEY || '').trim();
}

export function getStripeWebhookSecret() {
  return (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
}

export function isStripeConfigured() {
  return getStripeSecretKey().startsWith('sk_');
}

export function getStripe() {
  const key = getStripeSecretKey();
  if (!key) throw new Error('Falta STRIPE_SECRET_KEY en el entorno.');
  if (!cachedClient || cachedKey !== key) {
    cachedKey = key;
    cachedClient = new Stripe(key, {
      appInfo: { name: 'Dralo English', url: 'https://www.dralo.es' },
    });
  }
  return cachedClient;
}

/** Traduce el ciclo de la UI ('monthly' | 'annual') al intervalo de Stripe. */
export function toStripeInterval(billingCycle) {
  return billingCycle === 'annual' || billingCycle === 'year' ? 'year' : 'month';
}

/** Traduce el intervalo de Stripe al ciclo de la UI. */
export function toBillingCycle(interval) {
  return interval === 'year' ? 'annual' : 'monthly';
}

function priceEnvName(planSlug, interval) {
  const suffix = interval === 'year' ? 'YEARLY' : 'MONTHLY';
  return `STRIPE_PRICE_${String(planSlug).toUpperCase()}_${suffix}`;
}

export function getStripePriceId(planSlug, interval) {
  return (process.env[priceEnvName(planSlug, interval)] || '').trim();
}

/** Planes de pago que ya tienen sus dos precios configurados en Stripe. */
export function getPurchasablePlanSlugs() {
  return DRALO_SUBSCRIPTION_PLANS.filter(
    (plan) =>
      plan.activo !== false &&
      Number(plan.precio) > 0 &&
      STRIPE_INTERVALS.every((interval) => getStripePriceId(plan.slug, interval)),
  ).map((plan) => plan.slug);
}

/** Búsqueda inversa para el webhook: price id → { planSlug, interval }. */
export function findPlanByPriceId(priceId) {
  if (!priceId) return null;
  for (const plan of DRALO_SUBSCRIPTION_PLANS) {
    for (const interval of STRIPE_INTERVALS) {
      if (getStripePriceId(plan.slug, interval) === priceId) {
        return { planSlug: plan.slug, interval };
      }
    }
  }
  return null;
}

export function subscriptionGrantsAccess(status) {
  return ENTITLED_STATUSES.has(String(status || ''));
}

/**
 * Desde la API 2025-03-31 el periodo vive en los items, no en la suscripción.
 * Aceptamos ambas formas porque el webhook puede llegar con una versión distinta.
 */
export function subscriptionPeriodEndIso(subscription) {
  const seconds =
    subscription?.items?.data?.[0]?.current_period_end ?? subscription?.current_period_end ?? null;
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

export function subscriptionPriceId(subscription) {
  return subscription?.items?.data?.[0]?.price?.id || null;
}

export function subscriptionInterval(subscription) {
  const raw = subscription?.items?.data?.[0]?.price?.recurring?.interval;
  return raw === 'year' ? 'year' : 'month';
}

/** URL absoluta para success/cancel/return de Stripe. */
export function getSiteUrl(req) {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const origin = req?.nextUrl?.origin || req?.headers?.get?.('origin') || '';
  if (origin) return origin.replace(/\/$/, '');
  return 'https://www.dralo.es';
}
