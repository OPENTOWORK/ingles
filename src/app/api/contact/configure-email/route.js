import { NextResponse } from 'next/server';
import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';
import {
  formatSmtpAuthError,
  saveSupportSmtpCredentials,
} from '@/lib/supportSmtpCredentials';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';

function isLocalDev(req) {
  if (process.env.NODE_ENV === 'production') return false;
  const host = req.headers.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

function isValidGmail(value) {
  return /^[^\s@]+@gmail\.com$/i.test(String(value || '').trim());
}

export async function POST(req) {
  if (!isLocalDev(req)) {
    return NextResponse.json({ error: 'Solo disponible en desarrollo local.' }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const gmailUser = String(body?.gmailUser || SUPPORT_TICKET_INBOX_EMAIL).trim().toLowerCase();
  const pass = String(body?.appPassword || '').replace(/\s+/g, '');

  if (!isValidGmail(gmailUser)) {
    return NextResponse.json(
      { error: 'El remitente debe ser una cuenta @gmail.com.' },
      { status: 400 },
    );
  }

  if (pass.length !== 16) {
    return NextResponse.json(
      {
        error:
          'La contraseña de aplicación tiene exactamente 16 caracteres (sin espacios). No uses tu contraseña normal de Gmail.',
      },
      { status: 400 },
    );
  }

  saveSupportSmtpCredentials({ user: gmailUser, pass });
  process.env.SUPPORT_SMTP_USER = gmailUser;
  process.env.SUPPORT_SMTP_PASS = pass;

  const test = await sendSupportTicketViaSmtp({
    to: SUPPORT_TICKET_INBOX_EMAIL,
    subject: '[Soporte] Prueba de configuración',
    text: 'Si recibes este correo, los tickets de soporte llegarán aquí correctamente.',
    replyTo: body?.testReplyTo || undefined,
  });

  if (!test.sent) {
    return NextResponse.json(
      {
        error: formatSmtpAuthError(test.error) || 'No se pudo enviar el correo de prueba.',
        saved: false,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    deliveredTo: test.deliveredTo,
    gmailUser,
    message: `Correo de prueba enviado a ${SUPPORT_TICKET_INBOX_EMAIL}.`,
  });
}
