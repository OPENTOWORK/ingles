/**
 * Crea la Checkout Session de Stripe para suscribirse a un plan.
 * El alta real en `suscripciones` la hace el webhook, no esta ruta.
 */
import { NextResponse } from 'next/server';
import { getPlanBySlug, canUpgradeToPlan } from '@/data/financialPlanConfig';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { resolveUserPlanSlug } from '@/lib/planAccess';
import {
  getSiteUrl,
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  subscriptionGrantsAccess,
  toStripeInterval,
} from '@/lib/stripe/server';
import {
  findSubscriptionByUserId,
  getOrCreateStripeCustomer,
  getSubscriptionsDb,
} from '@/lib/stripe/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión para suscribirte.' }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Pagos no configurados.' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const planSlug = String(body.planSlug || '').toLowerCase();
    const interval = toStripeInterval(body.billingCycle);

    const plan = getPlanBySlug(planSlug);
    if (!plan || plan.slug !== planSlug || Number(plan.precio) <= 0 || plan.activo === false) {
      return NextResponse.json({ error: 'Plan no válido.' }, { status: 400 });
    }

    const priceId = getStripePriceId(plan.slug, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: `Falta el precio de Stripe para ${plan.slug} (${interval}).` },
        { status: 503 },
      );
    }

    const db = getSubscriptionsDb();
    if (!db) {
      return NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 503 });
    }

    const currentPlanSlug = await resolveUserPlanSlug(auth.user.id, auth.user.user_metadata);
    if (!canUpgradeToPlan(currentPlanSlug, plan.slug)) {
      return NextResponse.json({ error: 'Ya tienes este plan o uno superior.' }, { status: 400 });
    }

    // Con una suscripción viva, los cambios de plan van por el portal de Stripe:
    // así se prorratea en lugar de crear una segunda suscripción.
    const existing = await findSubscriptionByUserId(db, auth.user.id);
    if (existing && subscriptionGrantsAccess(existing.status)) {
      return NextResponse.json({ alreadySubscribed: true, usePortal: true });
    }

    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomer(db, auth.user);
    const siteUrl = getSiteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: auth.user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto', name: 'auto' },
      locale: 'es',
      success_url: `${siteUrl}/perfil/?checkout=success`,
      cancel_url: `${siteUrl}/precios/?checkout=cancelled`,
      metadata: { supabase_user_id: auth.user.id, plan_slug: plan.slug },
      subscription_data: {
        metadata: { supabase_user_id: auth.user.id, plan_slug: plan.slug },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 });
  }
}
