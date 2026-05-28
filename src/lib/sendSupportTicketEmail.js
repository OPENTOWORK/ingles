import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';
import { deliverTransactionalEmail } from '@/lib/emailDelivery';
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

  // 0) Web3Forms (sin Gmail): WEB3FORMS_ACCESS_KEY en .env.local / Vercel
  const web3 = await sendSupportTicketViaWeb3forms(ticket, text, subject);
  if (web3.sent) {
    return { sent: true, usedFallback: false, deliveredTo: inbox, channel: 'web3forms' };
  }

  const delivered = await deliverTransactionalEmail({
    to: inbox,
    subject,
    text,
    replyTo: ticket.email,
  });

  if (delivered.ok) {
    return {
      sent: true,
      usedFallback: false,
      deliveredTo: delivered.deliveredTo || inbox,
      channel: delivered.channel,
    };
  }

  return {
    sent: false,
    usedFallback: false,
    deliveredTo: null,
    error: delivered.error || 'Correo no configurado.',
  };
}
