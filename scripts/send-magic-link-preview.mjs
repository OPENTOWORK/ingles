/**
 * Envía una prueba del enlace mágico con la plantilla de Dralo.
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/send-magic-link-preview.mjs [email]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

const to = String(process.argv[2] || 'direccion@opentowork.com').trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { sendMagicLinkEmail } = await import('../src/lib/sendMagicLinkEmail.js');
const result = await sendMagicLinkEmail(admin, { email: to });
console.log(
  JSON.stringify({
    sent: result.sent,
    channel: result.channel,
    deliveredTo: result.deliveredTo,
    error: result.error,
  }),
);
if (!result.sent) process.exit(1);
