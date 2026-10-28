import { NextResponse } from 'next/server';
import {
  buildB2GuideDownloadEmail,
  guideConsentError,
  normalizeGuideEmail,
  tryConsumeB2GuideSend,
} from '@/lib/b2GuideDownload';
import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { getClientIpFromRequest } from '@/lib/marketing/crm/rateLimit';

export async function POST(req) {
  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const honeypot = String(body?.website || body?.company || '').trim();
  if (honeypot) return NextResponse.json({ ok: true });

  const email = normalizeGuideEmail(body?.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Escribe un email válido.' }, { status: 400 });
  }

  const consentError = guideConsentError(body);
  if (consentError) {
    return NextResponse.json({ ok: false, error: consentError }, { status: 400 });
  }

  if (!tryConsumeB2GuideSend(getClientIpFromRequest(req), email)) {
    return NextResponse.json(
      { ok: false, error: 'Has pedido la guía varias veces. Espera un poco y revisa tu correo.' },
      { status: 429 },
    );
  }

  const message = buildB2GuideDownloadEmail(email);
  try {
    const sent = await deliverTransactionalEmail({
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    if (!sent?.ok) {
      console.error('[api/guia-b2/enviar]', sent?.error || 'send_failed');
      return NextResponse.json(
        { ok: false, error: 'No hemos podido enviar la guía. Inténtalo de nuevo en unos minutos.' },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('[api/guia-b2/enviar]', err);
    return NextResponse.json(
      { ok: false, error: 'No hemos podido enviar la guía. Inténtalo de nuevo en unos minutos.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
