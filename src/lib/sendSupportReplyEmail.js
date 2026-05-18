import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';

/** Respuesta de soporte al email del usuario que abrió el ticket. */
export async function sendSupportReplyEmail({ to, ticketSubject, message, agentName }) {
  const subject = `Re: [Soporte] ${ticketSubject}`;
  const text = [
    'Hola,',
    '',
    message,
    '',
    '—',
    agentName ? `${agentName} · Equipo Dralo` : 'Equipo Dralo',
    'draloenglish@gmail.com',
  ].join('\n');

  const smtp = await sendSupportTicketViaSmtp({
    to,
    subject,
    text,
    replyTo: undefined,
  });

  if (smtp.sent) {
    return { sent: true, channel: smtp.channel };
  }

  return {
    sent: false,
    error: smtp.error || 'No se pudo enviar el correo al usuario.',
  };
}
