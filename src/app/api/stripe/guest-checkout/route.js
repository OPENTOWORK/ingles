/**
 * Checkout del año de Plus para quien todavía no tiene cuenta.
 * El alta en Supabase llega después, al registrarse con el mismo correo.
 */
import { NextResponse } from 'next/server';
import { getPlanBySlug } from '@/data/financialPlanConfig';
import {
  getSiteUrl,
  getStripe,
  isStripeConfigured,
  resolveActivePriceId,
  toStripeInterval,
} from '@/lib/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Pagos no configurados.' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const planSlug = String(body.planSlug || '').toLowerCase();
    const interval = toStripeInterval(body.billingCycle);
    if (planSlug !== 'premium' || interval !== 'year') {
      return NextResponse.json({ error: 'Esta compra directa es solo del año de Plus.' }, { status: 400 });
    }

    const plan = getPlanBySlug(planSlug);
    if (!plan || Number(plan.precio) <= 0 || plan.activo === false) {
      return NextResponse.json({ error: 'Plan no válido.' }, { status: 400 });
    }

    const priceId = await resolveActivePriceId(plan.slug, interval);
    if (!priceId) {
      return NextResponse.json({ error: 'Falta el precio anual de Plus en Stripe.' }, { status: 503 });
    }

    const siteUrl = getSiteUrl(req);
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'es',
      success_url: `${siteUrl}/registro/?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/precios/?facturacion=anual&checkout=cancelled`,
      metadata: { plan_slug: plan.slug, guest_checkout: '1', billing_cycle: 'annual' },
      subscription_data: {
        metadata: { plan_slug: plan.slug, guest_checkout: '1' },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[stripe/guest-checkout]', err);
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 });
  }
}
