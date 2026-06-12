import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

/** Respuesta de soporte al email del usuario que abrió el ticket. */
export async function sendSupportReplyEmail({
  to,
  ticketSubject,
  message,
  agentName,
  adminClient = null,
}) {
  const result = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_REPLY_SENT,
    to,
    variables: {
      ticket_subject: ticketSubject || '',
      message: message || '',
      agent_name: agentName || 'Equipo Dralo',
    },
  });

  if (result.sent || result.queued) {
    return { sent: true, channel: result.results?.[0]?.channel };
  }

  return {
    sent: false,
    error: result.error || 'No se pudo enviar el correo al usuario.',
  };
}
