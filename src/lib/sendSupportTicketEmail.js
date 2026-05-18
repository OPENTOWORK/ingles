import { Resend } from 'resend';
import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { isSupportSmtpReady } from '@/lib/supportSmtpCredentials';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';
import { sendSupportTicketViaWeb3forms } from '@/lib/sendSupportTicketViaWeb3forms';

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

/**
 * @param {import('@/components/SupportTicketEmail').SupportTicketEmailProps} ticket
 */
export async function sendSupportTicketEmail(ticket) {
  const inbox = SUPPORT_TICKET_INBOX_EMAIL;
  const text = buildPlainText(ticket);
  const subject = `[Soporte] ${ticket.subject}`;

  const trySmtp = () =>
    sendSupportTicketViaSmtp({
      to: inbox,
      subject,
      text,
      replyTo: ticket.email,
    });

  // 0) Web3Forms (sin Gmail): WEB3FORMS_ACCESS_KEY en .env.local
  const web3 = await sendSupportTicketViaWeb3forms(ticket, text, subject);
  if (web3.sent) {
    return { sent: true, usedFallback: false, deliveredTo: inbox, channel: 'web3forms' };
  }

  // 1) Gmail SMTP
  if (isSupportSmtpReady()) {
    const smtp = await trySmtp();
    if (smtp.sent) {
      return { sent: true, usedFallback: false, deliveredTo: inbox, channel: 'smtp' };
    }
    return {
      sent: false,
      usedFallback: false,
      deliveredTo: null,
      error: smtp.error || 'Error al enviar por SMTP.',
    };
  }

  // 2) Resend con dralo.es verificado
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && (await isResendDomainReady())) {
    const resend = new Resend(apiKey);
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
    const { error } = await resend.emails.send({
      from,
      to: [inbox],
      replyTo: ticket.email,
      subject,
      text,
    });
    if (!error) {
      return { sent: true, usedFallback: false, deliveredTo: inbox, channel: 'resend' };
    }
    return {
      sent: false,
      usedFallback: false,
      deliveredTo: null,
      error: error.message || 'Error Resend.',
    };
  }

  return {
    sent: false,
    usedFallback: false,
    deliveredTo: null,
    error:
      'Correo no configurado. Abre /contacto/configurar-correo y pega la contraseña de aplicación de Gmail.',
  };
}
