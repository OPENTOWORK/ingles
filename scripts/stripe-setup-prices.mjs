/**
 * Crea (o reutiliza) en Stripe los productos, los precios mensual/anual y la
 * configuración del Customer Portal, e imprime las variables de entorno.
 *
 *   npm run stripe:setup
 *
 * Es idempotente: los precios se buscan por `lookup_key`, así que puedes
 * ejecutarlo las veces que quieras sin duplicar nada. Ejecútalo una vez con la
 * clave de test y otra con la de producción.
 *
 * Las suscripciones se cobran al instante (sin periodo de prueba).
 */
import Stripe from 'stripe';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

// Espejo de DRALO_SUBSCRIPTION_PLANS y ANNUAL_BILLING_DISCOUNT_PERCENT en
// src/data/financialPlanConfig.js (ese fichero es ESM y este proyecto es CJS).
const ANNUAL_DISCOUNT_PERCENT = 25;
const PLANS = [
  {
    slug: 'premium',
    name: 'Dralo PLUS',
    description: 'Acceso completo a A2–C2, 10 exámenes al mes y corrección avanzada de Writing.',
    monthly: 7.99,
  },
  {
    slug: 'pro',
    name: 'Dralo PREMIUM',
    description: 'Exámenes ilimitados, Writing 20/mes, Speaking 20/día y soporte prioritario.',
    monthly: 14.99,
  },
];

const CURRENCY = 'eur';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dralo.es').replace(/\/$/, '');

const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
if (!secretKey.startsWith('sk_')) {
  console.error('Falta STRIPE_SECRET_KEY en .env.local (debe empezar por sk_test_ o sk_live_).');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const isLive = secretKey.startsWith('sk_live_');

function centsFor(plan, interval) {
  if (interval === 'year') {
    const discounted = plan.monthly * (1 - ANNUAL_DISCOUNT_PERCENT / 100);
    return Math.round(discounted * 12 * 100);
  }
  return Math.round(plan.monthly * 100);
}

async function findPriceByLookupKey(lookupKey) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, active: true });
  return found.data[0] || null;
}

async function ensureProduct(plan, reusableProductId) {
  if (reusableProductId) return reusableProductId;
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { dralo_plan_slug: plan.slug },
  });
  console.log(`  producto creado: ${product.id}`);
  return product.id;
}

async function ensurePrice(plan, interval, productId) {
  const lookupKey = `dralo_${plan.slug}_${interval}`;
  const target = centsFor(plan, interval);
  const existing = await findPriceByLookupKey(lookupKey);

  if (existing && existing.unit_amount === target && existing.currency === CURRENCY) {
    console.log(`  ${lookupKey}: correcto (${existing.id}, ${(target / 100).toFixed(2)} €)`);
    return existing;
  }

  // En Stripe el importe de un precio es inmutable: cambiarlo implica crear uno
  // nuevo, llevarse la lookup_key y archivar el viejo. Quien ya esté suscrito
  // sigue en el precio antiguo hasta que cambie de plan desde el portal.
  const price = await stripe.prices.create({
    product: productId,
    currency: CURRENCY,
    unit_amount: target,
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: Boolean(existing),
    metadata: { dralo_plan_slug: plan.slug, dralo_interval: interval },
  });

  if (existing) {
    await stripe.prices.update(existing.id, { active: false });
    console.log(
      `  ${lookupKey}: ${(existing.unit_amount / 100).toFixed(2)} € → ${(target / 100).toFixed(2)} € ` +
        `(nuevo ${price.id}, archivado ${existing.id})`,
    );
  } else {
    console.log(`  ${lookupKey}: creado (${price.id}, ${(target / 100).toFixed(2)} €)`);
  }
  return price;
}

function productIdOf(price) {
  return typeof price.product === 'string' ? price.product : price.product?.id || null;
}

async function main() {
  console.log(`Stripe en modo ${isLive ? 'LIVE (dinero real)' : 'TEST'}\n`);

  const envLines = [];
  const portalProducts = [];

  for (const plan of PLANS) {
    console.log(`Plan ${plan.slug} (${plan.name})`);

    // Si ya existe alguno de los dos precios, reutilizamos su producto.
    const already = (await findPriceByLookupKey(`dralo_${plan.slug}_month`)) ||
      (await findPriceByLookupKey(`dralo_${plan.slug}_year`));
    const productId = await ensureProduct(plan, already ? productIdOf(already) : null);

    const monthly = await ensurePrice(plan, 'month', productId);
    const yearly = await ensurePrice(plan, 'year', productId);

    envLines.push(`STRIPE_PRICE_${plan.slug.toUpperCase()}_MONTHLY=${monthly.id}`);
    envLines.push(`STRIPE_PRICE_${plan.slug.toUpperCase()}_YEARLY=${yearly.id}`);
    portalProducts.push({ product: productId, prices: [monthly.id, yearly.id] });
    console.log('');
  }

  const portalParams = {
    business_profile: {
      headline: 'Gestiona tu suscripción de Dralo English',
      privacy_policy_url: `${SITE_URL}/politica-privacidad/`,
      terms_of_service_url: `${SITE_URL}/terminos-condiciones/`,
    },
    default_return_url: `${SITE_URL}/perfil/`,
    features: {
      customer_update: { enabled: true, allowed_updates: ['email', 'address', 'name'] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'promotion_code'],
        proration_behavior: 'create_prorations',
        products: portalProducts,
      },
    },
  };

  // Reutilizamos la configuración existente: crear una nueva en cada ejecución
  // iría dejando configuraciones huérfanas apuntando a precios archivados.
  let portalConfigurationId = (process.env.STRIPE_PORTAL_CONFIGURATION_ID || '').trim();
  try {
    if (portalConfigurationId) {
      const updated = await stripe.billingPortal.configurations.update(
        portalConfigurationId,
        portalParams,
      );
      console.log(`Customer Portal actualizado: ${updated.id}\n`);
    } else {
      const created = await stripe.billingPortal.configurations.create(portalParams);
      portalConfigurationId = created.id;
      console.log(`Customer Portal creado: ${created.id}\n`);
    }
  } catch (err) {
    console.warn(`No se pudo configurar el portal: ${err.message}`);
    console.warn('Configúralo a mano en https://dashboard.stripe.com/settings/billing/portal\n');
  }

  if (portalConfigurationId) {
    envLines.push(`STRIPE_PORTAL_CONFIGURATION_ID=${portalConfigurationId}`);
  }

  console.log('Copia esto en .env.local y en las variables de entorno de Vercel:\n');
  console.log(envLines.join('\n'));
  console.log('\nDespués crea el webhook apuntando a:');
  console.log(`  ${SITE_URL}/api/stripe/webhook/`);
  console.log('y guarda su signing secret en STRIPE_WEBHOOK_SECRET.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
