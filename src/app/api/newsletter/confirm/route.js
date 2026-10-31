import { NextResponse } from 'next/server';
import { tryConsumeNewsletterTokenAction } from '@/lib/newsletter';
import { confirmNewsletterToken } from '@/lib/newsletterStore';
import { getClientIpFromRequest } from '@/lib/marketing/crm/rateLimit';

const MESSAGES = {
  invalid: 'Este enlace no es válido.',
  inactive: 'Esta suscripción está dada de baja. Puedes volver a apuntarte desde la newsletter.',
  no_db: 'No hemos podido confirmar la suscripción. Inténtalo más tarde.',
  no_table: 'No hemos podido confirmar la suscripción. Inténtalo más tarde.',
  read_failed: 'No hemos podido confirmar la suscripción. Inténtalo más tarde.',
  write_failed: 'No hemos podido confirmar la suscripción. Inténtalo más tarde.',
};

export async function POST(req) {
  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (!tryConsumeNewsletterTokenAction(getClientIpFromRequest(req))) {
    return NextResponse.json(
      { ok: false, error: 'Has usado este enlace varias veces. Espera un poco e inténtalo de nuevo.' },
      { status: 429 },
    );
  }

  const result = await confirmNewsletterToken(body?.token);
  if (!result.ok) {
    const status = result.error === 'invalid' || result.error === 'inactive' ? 400 : 503;
    return NextResponse.json(
      { ok: false, error: MESSAGES[result.error] || MESSAGES.write_failed },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    already: result.already === true,
  });
}
