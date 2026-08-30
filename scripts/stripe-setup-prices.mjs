/**
 * Crea (o reutiliza) en Stripe los productos, los precios mensual/anual y la
 * configuración del Customer Portal, e imprime las variables de entorno.
 *
 *   npm run stripe:setup
 *
 * Los importes salen de src/data/financialPlanConfig.js (precios de lanzamiento).
 * Es idempotente: los precios se buscan por `lookup_key`.
 */
import Stripe from 'stripe';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvLocal } from './load-env-local.mjs';
import { upsertEnvLocalLine } from './stripe-vercel-env.mjs';
import {
  DRALO_SUBSCRIPTION_PLANS,
  getPlanMonthlyPrice,
} from '../src/data/financialPlanConfig.js';

loadEnvLocal();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_LOCAL = path.join(ROOT, '.env.local');

const CURRENCY = 'eur';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dralo.es').replace(/\/$/, '');
const WEBHOOK_URL = `${SITE_URL}/api/stripe/webhook/`;

const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];

const PLANS = DRALO_SUBSCRIPTION_PLANS.filter(
  (plan) => plan.activo !== false && Number(plan.precio) > 0,
).map((plan) => ({
  slug: plan.slug,
  name: `Dralo ${plan.nombre}`,
  description: plan.descripcionCorta || plan.descripcion,
  getAmountEuros: (interval) =>
    getPlanMonthlyPrice(plan, interval === 'year' ? 'annual' : 'monthly'),
}));

const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
if (!secretKey.startsWith('sk_')) {
  console.error('Falta STRIPE_SECRET_KEY en .env.local (debe empezar por sk_test_ o sk_live_).');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const isLive = secretKey.startsWith('sk_live_');

function centsFor(plan, interval) {
  const monthlyEuros = plan.getAmountEuros(interval);
  if (interval === 'year') {
    return Math.round(monthlyEuros * 12 * 100);
  }
  return Math.round(monthlyEuros * 100);
}

function formatEuros(cents) {
  return `${(cents / 100).toFixed(2)} €`;
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
    console.log(`  ${lookupKey}: correcto (${existing.id}, ${formatEuros(target)})`);
    return existing;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: CURRENCY,
    unit_amount: target,
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: Boolean(existing),
    metadata: {
      dralo_plan_slug: plan.slug,
      dralo_interval: interval,
      dralo_launch_pricing: 'true',
    },
  });

  if (existing) {
    await stripe.prices.update(existing.id, { active: false });
    console.log(
      `  ${lookupKey}: ${formatEuros(existing.unit_amount)} → ${formatEuros(target)} ` +
        `(nuevo ${price.id}, archivado ${existing.id})`,
    );
  } else {
    console.log(`  ${lookupKey}: creado (${price.id}, ${formatEuros(target)})`);
  }
  return price;
}

function productIdOf(price) {
  return typeof price.product === 'string' ? price.product : price.product?.id || null;
}

function upsertEnvLocal(lines) {
  if (!existsSync(ENV_LOCAL)) return;
  const keys = new Set(lines.map((line) => line.split('=')[0]));
  const current = readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/);
  const kept = current.filter((line) => {
    const key = line.trim().split('=')[0];
    return !keys.has(key);
  });
  const next = [...kept.filter((line, index, arr) => !(line === '' && index === arr.length - 1)), ...lines, ''];
  writeFileSync(ENV_LOCAL, next.join('\n'), 'utf8');
  console.log('\nActualizado .env.local con los nuevos STRIPE_PRICE_*.');
}

async function main() {
  console.log(`Stripe en modo ${isLive ? 'LIVE (dinero real)' : 'TEST'}\n`);
  console.log('Precios de lanzamiento (financialPlanConfig.js):\n');

  const envLines = [];
  const portalProducts = [];

  for (const plan of PLANS) {
    const monthlyEuros = plan.getAmountEuros('month');
    const annualMonthlyEuros = plan.getAmountEuros('year');
    console.log(
      `Plan ${plan.slug} (${plan.name}) — mensual ${monthlyEuros.toFixed(2)} €/mes · ` +
        `anual ${annualMonthlyEuros.toFixed(2)} €/mes (${(annualMonthlyEuros * 12).toFixed(2)} €/año)`,
    );

    const already =
      (await findPriceByLookupKey(`dralo_${plan.slug}_month`)) ||
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
  upsertEnvLocal(envLines);

  const webhookSecret = await ensureWebhookEndpoint();
  if (webhookSecret) {
    upsertEnvLocalLine('STRIPE_WEBHOOK_SECRET', webhookSecret);
    console.log('\nSTRIPE_WEBHOOK_SECRET guardado en .env.local');
  } else if (!(process.env.STRIPE_WEBHOOK_SECRET || '').trim().startsWith('whsec_')) {
    console.log('\nAñade STRIPE_WEBHOOK_SECRET en .env.local (whsec_ del dashboard live).');
    console.log(`  Webhook URL: ${WEBHOOK_URL}`);
  }

  console.log('\nPara subir todo a Vercel: npm run stripe:sync-vercel');
  console.log('O el flujo completo: npm run stripe:go-live');
}

async function ensureWebhookEndpoint() {
  const existingSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = endpoints.data.find((endpoint) => endpoint.url === WEBHOOK_URL);

  if (match) {
    console.log(`\nWebhook existente: ${match.id} → ${WEBHOOK_URL}`);
    if (existingSecret.startsWith('whsec_')) {
      console.log('Se reutiliza STRIPE_WEBHOOK_SECRET de .env.local');
      return null;
    }
    console.warn(
      'No hay STRIPE_WEBHOOK_SECRET en .env.local. Cópialo del dashboard o elimina el endpoint y vuelve a ejecutar.',
    );
    return null;
  }

  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: 'Dralo producción — suscripciones',
  });
  console.log(`\nWebhook creado: ${created.id} → ${WEBHOOK_URL}`);
  return created.secret || null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
