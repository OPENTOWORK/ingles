/**
 * Webhook de Stripe: única fuente de escritura de `public.suscripciones`.
 *
 * Configúralo en Stripe → Developers → Webhooks apuntando a
 *   https://www.dralo.es/api/stripe/webhook/     (con la barra final: trailingSlash)
 * con los eventos checkout.session.completed, customer.subscription.*,
 * invoice.payment_succeeded e invoice.payment_failed.
 */
import { NextResponse } from 'next/server';
import { getStripe, getStripeWebhookSecret, isStripeConfigured } from '@/lib/stripe/server';
import { syncSubscriptionFromStripe } from '@/lib/stripe/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** El id de suscripción cambió de sitio en la API 2025-03-31: aceptamos ambos. */
function invoiceSubscriptionId(invoice) {
  const legacy = invoice?.subscription;
  if (typeof legacy === 'string') return legacy;
  if (legacy?.id) return legacy.id;
  const modern = invoice?.parent?.subscription_details?.subscription;
  if (typeof modern === 'string') return modern;
  return modern?.id || null;
}

async function retrieveSubscription(stripe, subscriptionId) {
  if (!subscriptionId) return null;
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe no configurado.' }, { status: 503 });
  }

  const secret = getStripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Falta STRIPE_WEBHOOK_SECRET.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma.' }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe/webhook] firma no válida', err?.message);
    return NextResponse.json({ error: 'Firma no válida.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;
        const subscription = await retrieveSubscription(
          stripe,
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
        );
        if (subscription) {
          await syncSubscriptionFromStripe(subscription, {
            userId: session.client_reference_id || session.metadata?.supabase_user_id || null,
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        await syncSubscriptionFromStripe(event.data.object);
        break;
      }

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const subscription = await retrieveSubscription(
          stripe,
          invoiceSubscriptionId(event.data.object),
        );
        if (subscription) await syncSubscriptionFromStripe(subscription);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Devolvemos 500 para que Stripe reintente en lugar de perder el evento.
    console.error(`[stripe/webhook] ${event.type}`, err);
    return NextResponse.json({ error: 'Error procesando el evento.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
