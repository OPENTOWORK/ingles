/**
 * Activa Stripe LIVE: crea precios + webhook, sincroniza Vercel y despliega.
 * Requisitos en .env.local: sk_live_, pk_live_ y NEXT_PUBLIC_SITE_URL.
 *
 *   npm run stripe:go-live
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { assertLiveStripeKey, loadEnvLocal } from './stripe-vercel-env.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(label, command, args) {
  console.log(`\n▶ ${label}\n`);
  const child = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (child.status !== 0) {
    console.error(`\n✗ Falló: ${label}`);
    process.exit(child.status || 1);
  }
}

const local = loadEnvLocal();
assertLiveStripeKey(local.STRIPE_SECRET_KEY);

if (!local.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim().startsWith('pk_live_')) {
  console.error('Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... en .env.local');
  process.exit(1);
}

console.log('Stripe LIVE — precios, webhook, Vercel y deploy\n');

run('Crear/actualizar precios y webhook en Stripe', 'node', ['scripts/stripe-setup-prices.mjs']);
run('Sincronizar variables Stripe a Vercel', 'node', ['scripts/sync-stripe-env-vercel.mjs']);
run('Desplegar en Vercel (production)', 'npx', ['vercel@latest', 'deploy', '--prod', '--yes']);

console.log('\n✓ Stripe LIVE activo en https://www.dralo.es');
console.log('  Prueba un pago en /precios/ y revisa eventos en Stripe → Webhooks.');
