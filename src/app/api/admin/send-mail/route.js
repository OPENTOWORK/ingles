import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { deliverTransactionalEmail } from '@/lib/emailDelivery';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const rawTo = Array.isArray(body?.to) ? body.to : body?.to ? [body.to] : [];
    const recipients = [
      ...new Set(
        rawTo.map((e) => String(e || '').trim().toLowerCase()).filter(isValidEmail),
      ),
    ];

    if (!recipients.length) {
      return NextResponse.json({ error: 'No hay destinatarios válidos.' }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ error: 'Asunto y mensaje son obligatorios.' }, { status: 400 });
    }

    const adminName =
      auth.user.user_metadata?.name ||
      auth.user.email?.split('@')[0] ||
      'Administración Dralo';

    const text = [
      message,
      '',
      '—',
      `${adminName} · Dralo English`,
    ].join('\n');

    let sent = 0;
    const errors = [];

    for (const to of recipients) {
      const result = await deliverTransactionalEmail({ to, subject, text });
      if (result.ok) {
        sent += 1;
      } else {
        errors.push({ to, error: result.error });
      }
    }

    if (sent === 0) {
      return NextResponse.json(
        {
          error: errors[0]?.error || 'No se pudo enviar ningún correo.',
          sent: 0,
          failed: recipients.length,
          errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sent,
      failed: recipients.length - sent,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error('[admin/send-mail]', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
