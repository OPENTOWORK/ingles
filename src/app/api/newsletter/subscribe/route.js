import { NextResponse } from 'next/server';
import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import {
  buildNewsletterConfirmEmail,
  newsletterConfirmUrl,
  newsletterConsentError,
  newsletterUnsubscribeUrl,
  normalizeNewsletterEmail,
  tryConsumeNewsletterSignup,
} from '@/lib/newsletter';
import { saveNewsletterSignup } from '@/lib/newsletterStore';
import { getClientIpFromRequest } from '@/lib/marketing/crm/rateLimit';
import { SITE_URL } from '@/lib/siteSeo';

const SAVE_ERRORS = {
  no_db: 'No hemos podido guardar tu correo. Inténtalo más tarde.',
  no_table: 'No hemos podido guardar tu correo. Inténtalo más tarde.',
  read_failed: 'No hemos podido guardar tu correo. Inténtalo más tarde.',
  write_failed: 'No hemos podido guardar tu correo. Inténtalo más tarde.',
};

export async function POST(req) {
  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const honeypot = String(body?.website || body?.company || '').trim();
  if (honeypot) return NextResponse.json({ ok: true, status: 'pending' });

  const email = normalizeNewsletterEmail(body?.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Escribe un correo válido.' }, { status: 400 });
  }

  const consentError = newsletterConsentError(body);
  if (consentError) {
    return NextResponse.json({ ok: false, error: consentError }, { status: 400 });
  }

  if (!tryConsumeNewsletterSignup(getClientIpFromRequest(req), email)) {
    return NextResponse.json(
      { ok: false, error: 'Has pedido el alta varias veces. Espera un poco y revisa tu correo.' },
      { status: 429 },
    );
  }

  const saved = await saveNewsletterSignup(email);
  if (!saved.ok) {
    return NextResponse.json(
      { ok: false, error: SAVE_ERRORS[saved.error] || SAVE_ERRORS.write_failed },
      { status: 503 },
    );
  }

  if (saved.outcome === 'active') {
    return NextResponse.json({ ok: true, status: 'active' });
  }

  const origin = process.env.NODE_ENV === 'production' ? SITE_URL : req.nextUrl?.origin;
  const message = buildNewsletterConfirmEmail({
    confirmUrl: newsletterConfirmUrl(saved.confirmToken, origin),
    unsubscribeUrl: newsletterUnsubscribeUrl(saved.unsubscribeToken, origin),
    siteUrl: origin,
  });

  try {
    const sent = await deliverTransactionalEmail({
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    if (!sent?.ok) {
      console.error('[api/newsletter/subscribe]', sent?.error || 'send_failed');
      return NextResponse.json(
        { ok: false, error: 'Hemos guardado tu correo, pero no hemos podido enviar la confirmación. Inténtalo de nuevo en unos minutos.' },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('[api/newsletter/subscribe]', err);
    return NextResponse.json(
      { ok: false, error: 'Hemos guardado tu correo, pero no hemos podido enviar la confirmación. Inténtalo de nuevo en unos minutos.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, status: 'pending' });
}
