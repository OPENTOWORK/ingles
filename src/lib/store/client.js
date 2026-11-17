/**
 * Cobro dentro de la app. El navegador no usa este módulo: sigue en Stripe.
 * La pantalla de pago es la de Google Play o la de Apple.
 */
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';
import { STORE_PACKAGE_NAME, storeProductFor } from './products.js';

export function isNativeStoreApp() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  if (ua.includes('DraloApp')) return true;
  return window.Capacitor?.isNativePlatform?.() === true;
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
    const error = new Error(payload.error || 'No se pudo completar el pago.');
    error.status = res.status;
    throw error;
  }
  return payload;
}

function nativeStore() {
  const bridge = typeof window !== 'undefined' ? window.Capacitor : null;
  if (!bridge?.nativePromise) {
    const error = new Error('Actualiza la app para pagar con Google Play o la App Store.');
    error.code = 'store_unavailable';
    throw error;
  }
  return bridge;
}

function asStoreError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  if (code === 'cancelled' || /cancel/i.test(message)) {
    const cancelled = new Error('Compra cancelada.');
    cancelled.code = 'cancelled';
    return cancelled;
  }
  if (code === 'UNIMPLEMENTED' || code === 'store_unavailable') return error;
  return error instanceof Error ? error : new Error('No se pudo abrir la pantalla de pago.');
}

async function currentGoogleToken() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from('suscripciones')
    .select('store, store_purchase_token, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || data?.store !== 'google' || !data.store_purchase_token) return null;
  if (!['active', 'trialing', 'past_due'].includes(String(data.status || ''))) return null;
  return data.store_purchase_token;
}

/** Abre la hoja de pago de la tienda y activa el plan si la tienda confirma el cobro. */
export async function startStoreCheckout({ planSlug, billingCycle }) {
  const product = storeProductFor(planSlug, billingCycle);
  if (!product) {
    throw new Error('Ese plan no está disponible en la app.');
  }

  const bridge = nativeStore();
  const currentPurchaseToken = await currentGoogleToken();
  let purchase;
  try {
    purchase = await bridge.nativePromise('DraloStore', 'purchase', {
      productId: product.productId,
      ...(currentPurchaseToken ? { currentPurchaseToken } : {}),
    });
  } catch (error) {
    throw asStoreError(error);
  }

  const result = await postWithAuth('/api/store/subscription', {
    store: purchase?.store,
    productId: purchase?.productId || product.productId,
    purchaseToken: purchase?.purchaseToken || null,
    transactionId: purchase?.transactionId || purchase?.orderId || null,
    signedTransaction: purchase?.signedTransaction || null,
  });
  window.location.assign('/perfil/?checkout=success');
  return result;
}

export function storeManagementUrl(store, productId) {
  if (store === 'apple') return 'https://apps.apple.com/account/subscriptions';
  const sku = productId ? `&sku=${encodeURIComponent(productId)}` : '';
  return `https://play.google.com/store/account/subscriptions?package=${STORE_PACKAGE_NAME}${sku}`;
}

export function openStoreManagement(store, productId) {
  window.location.assign(storeManagementUrl(store, productId));
}

/** Recupera compras ya hechas en este teléfono y las aplica a la cuenta iniciada. */
export async function restoreStorePurchases() {
  const bridge = nativeStore();
  let restored;
  try {
    restored = await bridge.nativePromise('DraloStore', 'restore');
  } catch (error) {
    throw asStoreError(error);
  }

  const purchases = Array.isArray(restored?.purchases) ? restored.purchases : [];
  let last = null;
  for (const purchase of purchases) {
    last = await postWithAuth('/api/store/subscription', {
      store: purchase.store,
      productId: purchase.productId,
      purchaseToken: purchase.purchaseToken || null,
      transactionId: purchase.transactionId || purchase.orderId || null,
      signedTransaction: purchase.signedTransaction || null,
    });
  }
  return { restored: purchases.length, last };
}

/** Al abrir la app, confirma de nuevo las compras de este teléfono sin mostrar la hoja de pago. */
export async function syncNativeStoreOnLaunch() {
  if (!isNativeStoreApp()) return;
  const { data } = await supabase.auth.getSession();
  if (!data?.session?.access_token) return;
  try {
    await refreshStoreSubscription();
    await restoreStorePurchases();
  } catch {
    /* Sin compras en este teléfono, o la tienda todavía no está configurada. */
  }
}

/** Al abrir la app, alarga una suscripción de Play ya guardada si sigue vigente. */
export async function refreshStoreSubscription() {
  if (!isNativeStoreApp()) return { refreshed: false };
  try {
    return await postWithAuth('/api/store/subscription', { refresh: true });
  } catch {
    return { refreshed: false };
  }
}
