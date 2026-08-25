/**
 * Sincroniza la suscripción del usuario desde Stripe → Supabase.
 * Útil tras volver del Checkout en local (sin webhook) o para reparar desfases.
 */
import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { isStripeConfigured } from '@/lib/stripe/server';
import { syncUserSubscriptionFromStripe } from '@/lib/stripe/subscriptions';

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

    const result = await syncUserSubscriptionFromStripe(auth.user);
    if (!result.synced) {
      return NextResponse.json(
        { synced: false, reason: result.reason || 'unknown' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      synced: true,
      planSlug: result.planSlug,
      status: result.status,
      active: result.active,
    });
  } catch (err) {
    console.error('[stripe/sync-subscription]', err);
    return NextResponse.json({ error: 'No se pudo sincronizar la suscripción.' }, { status: 500 });
  }
}
