/**
 * Suscripciones que se cobran en Google Play y en la App Store.
 * El id es el mismo en las dos tiendas. El precio lo pone cada consola;
 * aquí solo se usa para comprobar que el catálogo no se desvía del de la web.
 *
 * Play Console y App Store Connect, suscripción auto-renovable:
 *   plus_monthly      PLUS     3,99 € / mes
 *   plus_yearly       PLUS    23,88 € / año
 *   premium_monthly   PREMIUM  8,99 € / mes
 *   premium_yearly    PREMIUM 59,88 € / año
 *
 * En Apple van en el mismo grupo de suscripción. En Play, cada id es una
 * suscripción. El paquete y el bundle son es.dralo.academy.
 */
import { getPlanBySlug, getPlanMonthlyPrice } from '@/data/financialPlanConfig';

export const STORE_PACKAGE_NAME = 'es.dralo.academy';

function yearlyChargeEur(plan) {
  return Math.round(getPlanMonthlyPrice(plan, 'annual') * 12 * 100) / 100;
}

const plus = getPlanBySlug('premium');
const premium = getPlanBySlug('pro');

export const STORE_PRODUCTS = [
  { productId: 'plus_monthly', planSlug: 'premium', interval: 'month', priceEur: plus.precio },
  { productId: 'plus_yearly', planSlug: 'premium', interval: 'year', priceEur: yearlyChargeEur(plus) },
  { productId: 'premium_monthly', planSlug: 'pro', interval: 'month', priceEur: premium.precio },
  { productId: 'premium_yearly', planSlug: 'pro', interval: 'year', priceEur: yearlyChargeEur(premium) },
];

export function storeProductById(productId) {
  return STORE_PRODUCTS.find((item) => item.productId === productId) || null;
}

/** @param {string} planSlug @param {'monthly'|'annual'|'month'|'year'} billingCycle */
export function storeProductFor(planSlug, billingCycle) {
  const interval = billingCycle === 'annual' || billingCycle === 'year' ? 'year' : 'month';
  return (
    STORE_PRODUCTS.find((item) => item.planSlug === planSlug && item.interval === interval) || null
  );
}
