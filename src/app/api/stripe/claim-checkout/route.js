/**
 * Después del pago, la cuenta nueva reclama la suscripción si el correo coincide.
 */
import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { claimGuestCheckout } from '@/lib/stripe/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MESSAGES = {
  email_mismatch: 'Regístrate con el mismo correo que has usado al pagar.',
  unpaid: 'El pago todavía no está confirmado.',
  already_claimed: 'Este pago ya está asociado a otra cuenta.',
  invalid_session: 'No encontramos el pago.',
  not_guest: 'Este pago no se puede asociar desde aquí.',
  incomplete: 'El pago no tiene suscripción.',
};

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión para activar el plan.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await claimGuestCheckout(auth.user, body.sessionId);
    if (!result.claimed) {
      const status = result.reason === 'email_mismatch' ? 409 : 400;
      return NextResponse.json(
        { error: MESSAGES[result.reason] || 'No se pudo activar el plan.', reason: result.reason },
        { status },
      );
    }
    return NextResponse.json({ ok: true, planSlug: result.planSlug });
  } catch (err) {
    console.error('[stripe/claim-checkout]', err);
    return NextResponse.json({ error: 'No se pudo activar el plan.' }, { status: 500 });
  }
}
