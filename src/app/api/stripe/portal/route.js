/**
 * Portal de facturación de Stripe: cambiar de plan, actualizar la tarjeta,
 * ver facturas y cancelar la suscripción.
 */
import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSiteUrl, getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { findSubscriptionByUserId, getSubscriptionsDb } from '@/lib/stripe/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Pagos no configurados.' }, { status: 503 });
    }

    const db = getSubscriptionsDb();
    if (!db) {
      return NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 503 });
    }

    const subscription = await findSubscriptionByUserId(db, auth.user.id);
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Todavía no tienes una suscripción que gestionar.' },
        { status: 404 },
      );
    }

    const configurationId = (process.env.STRIPE_PORTAL_CONFIGURATION_ID || '').trim();
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getSiteUrl(req)}/perfil/`,
      locale: 'es',
      ...(configurationId ? { configuration: configurationId } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/portal]', err);
    return NextResponse.json({ error: 'No se pudo abrir el portal de pagos.' }, { status: 500 });
  }
}
