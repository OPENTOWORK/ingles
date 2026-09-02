/**
 * Persistencia de suscripciones (solo servidor).
 *
 * `public.suscripciones` únicamente la escribe el webhook a través de la
 * service role key. El cliente lee su propia fila vía RLS.
 */
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  findPlanByPriceId,
  getStripe,
  isStripeConfigured,
  subscriptionGrantsAccess,
  subscriptionInterval,
  subscriptionPeriodEndIso,
  subscriptionPriceId,
} from './server';
import { isPaidPlanSlug, markReferralPaid } from '@/lib/referrals';

export const SUBSCRIPTIONS_TABLE = 'suscripciones';

/** Cliente con service role: salta RLS, nunca debe usarse desde el navegador. */
export function getSubscriptionsDb() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function findSubscriptionByUserId(db, userId) {
  if (!db || !userId) return null;
  const { data, error } = await db
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function findSubscriptionByCustomerId(db, customerId) {
  if (!db || !customerId) return null;
  const { data, error } = await db
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

function customerIdOf(subscription) {
  const raw = subscription?.customer;
  return typeof raw === 'string' ? raw : raw?.id || null;
}

/**
 * Averigua a qué usuario de Supabase pertenece una suscripción de Stripe.
 * Orden: metadata de la suscripción → fila existente → metadata del customer.
 */
export async function resolveUserId(db, subscription) {
  const fromMetadata = subscription?.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;

  const customerId = customerIdOf(subscription);
  const existing = await findSubscriptionByCustomerId(db, customerId);
  if (existing?.user_id) return existing.user_id;

  if (!customerId) return null;
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!customer?.deleted && customer?.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }
  } catch {
    /* customer borrado o clave sin permisos: seguimos sin usuario */
  }
  return null;
}

function resolvePlanSlug(subscription) {
  const byPrice = findPlanByPriceId(subscriptionPriceId(subscription));
  if (byPrice) return byPrice.planSlug;
  return subscription?.metadata?.plan_slug || null;
}

/**
 * Mantiene `user_metadata.subscription_plan` alineado con la suscripción real,
 * que es lo que lee hoy la ficha de perfil.
 */
export async function syncAuthPlanMetadata(db, userId, planSlug) {
  if (!db || !userId || !planSlug) return;
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error || !data?.user) return;
  const current = data.user.user_metadata || {};
  if (current.subscription_plan === planSlug) return;
  await db.auth.admin.updateUserById(userId, {
    user_metadata: { ...current, subscription_plan: planSlug },
  });
}

/**
 * Vuelca el estado de una suscripción de Stripe en Supabase.
 * Idempotente: los webhooks de Stripe pueden llegar duplicados o desordenados.
 */
export async function syncSubscriptionFromStripe(subscription, { userId: knownUserId } = {}) {
  const db = getSubscriptionsDb();
  if (!db) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para escribir suscripciones.');

  const userId = knownUserId || (await resolveUserId(db, subscription));
  if (!userId) {
    return { skipped: 'unknown_user', subscriptionId: subscription?.id || null };
  }

  const customerId = customerIdOf(subscription);
  const planSlug = resolvePlanSlug(subscription);
  const status = String(subscription?.status || 'incomplete');
  const active = subscriptionGrantsAccess(status);

  const row = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription?.id || null,
    stripe_price_id: subscriptionPriceId(subscription),
    plan_id: planSlug || 'free',
    interval: subscriptionInterval(subscription),
    status,
    current_period_end: subscriptionPeriodEndIso(subscription),
    cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
  };

  const { error } = await db.from(SUBSCRIPTIONS_TABLE).upsert(row, { onConflict: 'user_id' });
  if (error) throw error;

  if (active && planSlug) {
    await db.from('Usuarios_y_Perfil_users').update({ plan_id: planSlug }).eq('id', userId);
  }

  await syncAuthPlanMetadata(db, userId, active && planSlug ? planSlug : 'free');

  if (active && isPaidPlanSlug(planSlug)) {
    try {
      await markReferralPaid({ userId, planSlug });
    } catch (err) {
      console.error('[subscriptions] referral paid', err);
    }
  }

  return { userId, planSlug: row.plan_id, status, active };
}

/**
 * Sincroniza la suscripción activa de Stripe para un usuario (fallback cuando
 * el webhook no llega, p. ej. desarrollo en localhost).
 */
export async function syncUserSubscriptionFromStripe(user) {
  const db = getSubscriptionsDb();
  if (!db) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para escribir suscripciones.');
  if (!user?.id) throw new Error('Usuario no válido.');

  const stripe = getStripe();
  let customerId = null;

  const existing = await findSubscriptionByUserId(db, user.id);
  if (existing?.stripe_customer_id) {
    customerId = existing.stripe_customer_id;
  } else {
    const customers = await stripe.customers.list({
      email: user.email || undefined,
      limit: 20,
    });
    const match =
      customers.data.find((c) => c.metadata?.supabase_user_id === user.id) ||
      customers.data.find((c) => !c.deleted) ||
      null;
    customerId = match?.id || null;
  }

  if (!customerId) {
    return { synced: false, reason: 'no_customer' };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 20,
  });

  const subscription =
    subscriptions.data.find((item) => subscriptionGrantsAccess(item.status)) ||
    subscriptions.data[0] ||
    null;

  if (!subscription) {
    return { synced: false, reason: 'no_subscription', customerId };
  }

  const result = await syncSubscriptionFromStripe(subscription, { userId: user.id });
  return { synced: true, ...result };
}

/**
 * Devuelve el customer de Stripe del usuario, creándolo la primera vez.
 * Se guarda `supabase_user_id` en metadata para poder resolverlo al revés.
 */
/**
 * Programa la cancelación de la suscripción de Stripe al final del periodo
 * facturado actual (sin cortar el acceso de inmediato).
 */
export async function scheduleSubscriptionCancelAtPeriodEnd(db, userId) {
  if (!userId) {
    return { scheduled: false, reason: 'no_user' };
  }
  if (!isStripeConfigured()) {
    return { scheduled: false, reason: 'stripe_not_configured' };
  }

  const subscriptionsDb = db || getSubscriptionsDb();
  if (!subscriptionsDb) {
    return { scheduled: false, reason: 'no_db' };
  }

  const existing = await findSubscriptionByUserId(subscriptionsDb, userId);
  if (!existing?.stripe_subscription_id) {
    return { scheduled: false, reason: 'no_subscription' };
  }
  if (!subscriptionGrantsAccess(existing.status)) {
    return { scheduled: false, reason: 'not_active' };
  }

  const accessUntil =
    existing.current_period_end || null;

  if (existing.cancel_at_period_end) {
    return {
      scheduled: true,
      alreadyScheduled: true,
      accessUntil,
      cancelAtPeriodEnd: true,
    };
  }

  const stripe = getStripe();
  const updated = await stripe.subscriptions.update(existing.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await syncSubscriptionFromStripe(updated, { userId });

  return {
    scheduled: true,
    accessUntil: subscriptionPeriodEndIso(updated) || accessUntil,
    cancelAtPeriodEnd: true,
  };
}

export async function getOrCreateStripeCustomer(db, user) {
  const stripe = getStripe();
  const existing = await findSubscriptionByUserId(db, user.id);
  if (existing?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(existing.stripe_customer_id);
      if (!customer?.deleted) return customer.id;
    } catch {
      /* el customer ya no existe (p. ej. se limpió el modo test): creamos otro */
    }
  }

  const created = await stripe.customers.create({
    email: user.email || undefined,
    name: user.user_metadata?.full_name || user.user_metadata?.nombre || undefined,
    metadata: { supabase_user_id: user.id },
  });
  return created.id;
}
