#!/usr/bin/env node
/**
 * Sincroniza la suscripción de un usuario desde Stripe a public.suscripciones.
 * Uso: node scripts/stripe-sync-user.mjs puppygosupport@gmail.com
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

config({ path: '.env.local' });
config({ path: '.env' });

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/stripe-sync-user.mjs <email>');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !serviceKey || !stripeKey?.startsWith('sk_')) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o STRIPE_SECRET_KEY.');
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const stripe = new Stripe(stripeKey);

const ENTITLED = new Set(['trialing', 'active', 'past_due']);

function subscriptionPriceId(subscription) {
  return subscription?.items?.data?.[0]?.price?.id || null;
}

function subscriptionInterval(subscription) {
  const raw = subscription?.items?.data?.[0]?.price?.recurring?.interval;
  return raw === 'year' ? 'year' : 'month';
}

function subscriptionPeriodEndIso(subscription) {
  const seconds =
    subscription?.items?.data?.[0]?.current_period_end ?? subscription?.current_period_end ?? null;
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function findPlanByPriceId(priceId) {
  if (!priceId) return null;
  for (const slug of ['premium', 'pro', 'starter']) {
    for (const interval of ['month', 'year']) {
      const suffix = interval === 'year' ? 'YEARLY' : 'MONTHLY';
      const envName = `STRIPE_PRICE_${slug.toUpperCase()}_${suffix}`;
      if (process.env[envName] === priceId) return slug;
    }
  }
  return null;
}

async function main() {
  const { data: users, error: usersError } = await db.auth.admin.listUsers({ perPage: 200 });
  if (usersError) throw usersError;
  const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`Usuario no encontrado: ${email}`);
    process.exit(1);
  }

  const customers = await stripe.customers.list({ email: user.email, limit: 20 });
  const customer =
    customers.data.find((c) => c.metadata?.supabase_user_id === user.id) ||
    customers.data[0] ||
    null;

  if (!customer) {
    console.error('No hay customer de Stripe para este usuario.');
    process.exit(1);
  }

  const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 20 });
  const subscription =
    subs.data.find((s) => ENTITLED.has(s.status)) || subs.data[0] || null;

  if (!subscription) {
    console.error('No hay suscripción en Stripe.');
    process.exit(1);
  }

  const priceId = subscriptionPriceId(subscription);
  const planSlug =
    findPlanByPriceId(priceId) ||
    subscription.metadata?.plan_slug ||
    'premium';
  const active = ENTITLED.has(subscription.status);

  const row = {
    user_id: user.id,
    stripe_customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_id: planSlug,
    interval: subscriptionInterval(subscription),
    status: subscription.status,
    current_period_end: subscriptionPeriodEndIso(subscription),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  };

  const { error: upsertError } = await db.from('suscripciones').upsert(row, { onConflict: 'user_id' });
  if (upsertError) throw upsertError;

  const metadata = user.user_metadata || {};
  const nextPlan = active && planSlug ? planSlug : 'free';
  if (metadata.subscription_plan !== nextPlan) {
    await db.auth.admin.updateUserById(user.id, {
      user_metadata: { ...metadata, subscription_plan: nextPlan },
    });
  }

  console.log('Sincronizado:', {
    email: user.email,
    plan: row.plan_id,
    status: row.status,
    subscriptionId: row.stripe_subscription_id,
    customerId: row.stripe_customer_id,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
