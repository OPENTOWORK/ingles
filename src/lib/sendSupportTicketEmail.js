import { Resend } from 'resend';
import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';

const RESEND_TEST_MODE_HINT =
  'You can only send testing emails to your own email address';

function buildPlainText({ name, email, userType, subject, message, status, topic }) {
  return [
    'Nuevo ticket de soporte',
    '',
    `Asunto: ${subject}`,
    `Nombre: ${name}`,
    `Email del usuario: ${email}`,
    `Tipo de usuario: ${userType}`,
    `Estado: ${status}`,
    `Tema: ${topic}`,
    '',
    'Mensaje:',
    message,
  ].join('\n');
}

function isResendTestModeError(error) {
  const msg = String(error?.message || '');
  return error?.statusCode === 403 && msg.includes(RESEND_TEST_MODE_HINT);
}

/**
 * @param {import('@/components/SupportTicketEmail').SupportTicketEmailProps} ticket
 * @returns {Promise<{ sent: boolean, usedFallback: boolean, error?: string, deliveredTo?: string }>}
 */
export async function sendSupportTicketEmail(ticket) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      usedFallback: false,
      error: 'RESEND_API_KEY no configurada en el servidor.',
    };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const text = buildPlainText(ticket);
  const subject = `[Soporte] ${ticket.subject}`;
  const payload = {
    from,
    replyTo: ticket.email,
    subject,
    text,
  };

  const primary = await resend.emails.send({
    ...payload,
    to: [SUPPORT_TICKET_INBOX_EMAIL],
  });

  if (!primary.error) {
    return { sent: true, usedFallback: false, deliveredTo: SUPPORT_TICKET_INBOX_EMAIL };
  }

  if (!isResendTestModeError(primary.error)) {
    return {
      sent: false,
      usedFallback: false,
      error: primary.error.message || 'Error al enviar el correo.',
    };
  }

  const fallbackTo =
    process.env.RESEND_DEV_FALLBACK_TO?.trim() || 'carlos.garcia.cano87@gmail.com';

  const fallback = await resend.emails.send({
    ...payload,
    to: [fallbackTo],
    subject: `[Soporte → ${SUPPORT_TICKET_INBOX_EMAIL}] ${ticket.subject}`,
    text: [
      `Este aviso iba a ${SUPPORT_TICKET_INBOX_EMAIL}, pero Resend exige verificar un dominio propio.`,
      'Verifica un dominio en https://resend.com/domains y configura RESEND_FROM_EMAIL (ej. soporte@dralo.es).',
      '',
      text,
    ].join('\n'),
  });

  if (fallback.error) {
    return {
      sent: false,
      usedFallback: true,
      error: fallback.error.message || 'Error al enviar el correo de respaldo.',
    };
  }

  return {
    sent: true,
    usedFallback: true,
    deliveredTo: fallbackTo,
    error: `Resend en modo prueba: el aviso se envió a ${fallbackTo}. Para recibir en ${SUPPORT_TICKET_INBOX_EMAIL} verifica un dominio en Resend.`,
  };
}
