/**
 * Sincroniza todas las variables Stripe de .env.local a Vercel (production).
 * Uso: npm run stripe:sync-vercel
 */
import {
  STRIPE_VERCEL_KEYS,
  addVercelEnv,
  assertLiveStripeKey,
  loadEnvLocal,
} from './stripe-vercel-env.mjs';

const local = loadEnvLocal();
assertLiveStripeKey(local.STRIPE_SECRET_KEY);

const publishable = local.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || '';
if (!publishable.startsWith('pk_live_')) {
  console.error(
    'ABORTADO: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY debe ser pk_live_... en .env.local.',
  );
  process.exit(1);
}

if (!local.STRIPE_WEBHOOK_SECRET?.trim().startsWith('whsec_')) {
  console.error(
    'ABORTADO: falta STRIPE_WEBHOOK_SECRET (whsec_...) en .env.local.\n' +
      'Ejecuta npm run stripe:setup para crear el webhook live, o cópialo del dashboard.',
  );
  process.exit(1);
}

let ok = 0;
for (const key of STRIPE_VERCEL_KEYS) {
  const val = local[key]?.trim();
  if (!val) {
    console.log(`—   ${key} no está en .env.local`);
    continue;
  }
  if (addVercelEnv(key, val, 'production')) ok += 1;
}

console.log(`\n${ok} variable(s) Stripe sincronizadas con Vercel production.`);
console.log('Redeploy recomendado: npm run stripe:deploy');
