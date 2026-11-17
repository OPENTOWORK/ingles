/**
 * Confirma una suscripción cobrada por Google Play o por la App Store.
 * El plan solo se activa si la tienda reconoce el comprobante.
 */
import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { grantStorePurchase, refreshStoredStoreSubscription } from '@/lib/store/grant';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import { findSubscriptionByUserId, getSubscriptionsDb } from '@/lib/stripe/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión para suscribirte.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.refresh === true) {
      const refreshed = await refreshStoredStoreSubscription(auth.user.id);
      return NextResponse.json(refreshed);
    }

    const db = getSubscriptionsDb();
    const existing = db ? await findSubscriptionByUserId(db, auth.user.id) : null;
    if (
      existing?.stripe_subscription_id &&
      subscriptionGrantsAccess(existing.status) &&
      existing.store !== 'google' &&
      existing.store !== 'apple'
    ) {
      return NextResponse.json(
        { error: 'Ya tienes una suscripción activa. Gestiónala desde la web.' },
        { status: 409 },
      );
    }

    const result = await grantStorePurchase(auth.user.id, body);
    return NextResponse.json(result);
  } catch (err) {
    const status = Number(err?.status) || 500;
    if (status >= 500) console.error('[store/subscription]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudo activar la suscripción.' },
      { status },
    );
  }
}
