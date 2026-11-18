/**
 * Activa en Supabase el plan comprado en Google Play o en la App Store.
 * La fila es la misma que usa Stripe (`suscripciones`), con el origen en `store`.
 */
import { notifyAdminsOfPaidPlan, shouldNotifyPaidPlan } from '@/lib/notifyAdminsOfPaidPlan';
import { isPaidPlanSlug, markReferralPaid } from '@/lib/referrals';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import {
  findSubscriptionByUserId,
  getSubscriptionsDb,
  syncAuthPlanMetadata,
} from '@/lib/stripe/subscriptions';
import { verifyAppleSignedTransaction, entitlementFromAppleTransaction } from './appleStore.js';
import { verifyGooglePurchase } from './googlePlay.js';
import { storeProductById } from './products.js';

function schemaMissing(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42703' ||
    error?.code === '23502' ||
    error?.code === 'PGRST204' ||
    message.includes('stripe_customer_id') ||
    message.includes("could not find the 'store")
  );
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function assertTokenOwner(db, transactionId, userId) {
  if (!transactionId) return;
  const { data, error } = await db
    .from('suscripciones')
    .select('user_id')
    .eq('store_transaction_id', transactionId)
    .maybeSingle();
  if (error) {
    if (error.code === '23505') throw httpError('Esta compra ya está asociada a otra cuenta.', 409);
    if (schemaMissing(error)) throw httpError('Falta aplicar scripts/suscripciones_store.sql en Supabase.', 503);
    throw error;
  }
  if (data?.user_id && data.user_id !== userId) {
    throw httpError('Esta compra ya está asociada a otra cuenta.', 409);
  }
}

async function writeGrant(db, userId, { store, product, entitlement, purchaseToken }) {
  const previous = await findSubscriptionByUserId(db, userId);
  await assertTokenOwner(db, entitlement.transactionId || purchaseToken, userId);
  const planSlug = entitlement.active ? product.planSlug : 'free';
  const row = {
    user_id: userId,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    plan_id: planSlug,
    interval: product.interval,
    status: entitlement.status,
    current_period_end: entitlement.expiresAt,
    cancel_at_period_end: Boolean(entitlement.cancelAtPeriodEnd),
    store,
    store_product_id: product.productId,
    store_purchase_token: purchaseToken || null,
    store_transaction_id: entitlement.transactionId || purchaseToken || null,
  };

  const { error } = await db.from('suscripciones').upsert(row, { onConflict: 'user_id' });
  if (error) {
    if (error.code === '23505') throw httpError('Esta compra ya está asociada a otra cuenta.', 409);
    if (schemaMissing(error)) throw httpError('Falta aplicar scripts/suscripciones_store.sql en Supabase.', 503);
    throw error;
  }

  await db.from('Usuarios_y_Perfil_users').update({ plan_id: planSlug }).eq('id', userId);
  await syncAuthPlanMetadata(db, userId, planSlug);

  if (entitlement.active && isPaidPlanSlug(planSlug)) {
    try {
      await markReferralPaid({ userId, planSlug });
    } catch (err) {
      console.error('[store] referral paid', err);
    }
  }

  if (
    shouldNotifyPaidPlan({
      previousActive: Boolean(previous && subscriptionGrantsAccess(previous.status)),
      previousPlan: previous?.plan_id,
      nextPlan: planSlug,
    })
  ) {
    try {
      await notifyAdminsOfPaidPlan(db, {
        userId,
        planSlug,
        interval: product.interval,
        channel: store,
        subscriptionId: entitlement.transactionId || purchaseToken || '',
      });
    } catch (err) {
      console.error('[store] paid plan notice', err);
    }
  }

  return { store, planSlug, status: entitlement.status, active: entitlement.active };
}

async function entitlementForPurchase(purchase) {
  const store = purchase?.store === 'apple' ? 'apple' : purchase?.store === 'google' ? 'google' : '';
  if (!store) throw httpError('La tienda de la compra no es válida.', 400);

  if (store === 'apple') {
    const payload = verifyAppleSignedTransaction(purchase.signedTransaction);
    const entitlement = entitlementFromAppleTransaction(payload);
    return { store, entitlement, purchaseToken: null };
  }

  const entitlement = await verifyGooglePurchase(purchase.purchaseToken, purchase.productId);
  return { store, entitlement, purchaseToken: purchase.purchaseToken };
}

export async function grantStorePurchase(userId, purchase) {
  const db = getSubscriptionsDb();
  if (!db) throw httpError('Servidor sin configurar.', 503);
  if (!userId) throw httpError('Inicia sesión para suscribirte.', 401);

  const { store, entitlement, purchaseToken } = await entitlementForPurchase(purchase);
  const product = storeProductById(entitlement.productId);
  if (!product) throw httpError('Ese producto no es un plan de Dralo.', 400);
  if (purchase?.productId && purchase.productId !== product.productId) {
    throw httpError('El producto cobrado no coincide con el plan elegido.', 400);
  }
  if (!entitlement.active) throw httpError('La suscripción no está activa.', 402);

  return writeGrant(db, userId, { store, product, entitlement, purchaseToken });
}

/** Vuelve a preguntar a Google Play por la suscripción ya guardada. */
export async function refreshStoredStoreSubscription(userId) {
  const db = getSubscriptionsDb();
  if (!db || !userId) return { refreshed: false };
  const existing = await findSubscriptionByUserId(db, userId);
  if (existing?.store !== 'google' || !existing.store_purchase_token) return { refreshed: false };

  const entitlement = await verifyGooglePurchase(existing.store_purchase_token, existing.store_product_id);
  const product = storeProductById(entitlement.productId || existing.store_product_id);
  if (!product) return { refreshed: false };
  const granted = await writeGrant(db, userId, {
    store: 'google',
    product,
    entitlement,
    purchaseToken: existing.store_purchase_token,
  });
  return { refreshed: true, ...granted };
}
