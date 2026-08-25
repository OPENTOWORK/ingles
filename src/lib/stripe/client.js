/**
 * Acciones de pago desde el navegador. Todas piden al backend una URL de
 * Stripe y redirigen: nunca se manipulan importes ni planes en el cliente.
 */
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

/** Estados de Stripe con los que el alumno tiene el plan de pago activo. */
export const ACTIVE_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due'];

export function isSubscriptionActive(subscription) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(String(subscription?.status || ''));
}

async function postWithAuth(path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) {
    const error = new Error('Inicia sesión para continuar.');
    error.code = 'no_session';
    throw error;
  }

  const res = await fetch(buildClientApiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload.error || 'No se pudo completar la operación.');
    error.status = res.status;
    throw error;
  }
  return payload;
}

/**
 * Lleva al Checkout de Stripe. Si el usuario ya tiene una suscripción viva,
 * el backend responde `usePortal` y abrimos el portal para cambiar de plan.
 * @param {{ planSlug: string, billingCycle: 'monthly' | 'annual' }} params
 */
export async function startCheckout({ planSlug, billingCycle }) {
  const payload = await postWithAuth('/api/stripe/checkout', { planSlug, billingCycle });
  if (payload.usePortal) return openBillingPortal();
  if (!payload.url) throw new Error('Stripe no devolvió una URL de pago.');
  window.location.assign(payload.url);
  return payload;
}

/** Portal de Stripe: cambiar plan, actualizar tarjeta, facturas y cancelar. */
export async function openBillingPortal() {
  const payload = await postWithAuth('/api/stripe/portal', {});
  if (!payload.url) throw new Error('Stripe no devolvió una URL del portal.');
  window.location.assign(payload.url);
  return payload;
}

/** Tras volver del Checkout: sincroniza Stripe → Supabase si el webhook no llegó. */
export async function syncSubscriptionAfterCheckout() {
  return postWithAuth('/api/stripe/sync-subscription', {});
}
