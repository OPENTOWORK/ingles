import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';

/**
 * Confirmación al estudiante: hemos recibido el ticket.
 */
export async function sendSupportTicketAckEmail({ to, name, subject, adminClient = null }) {
  const result = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.SUPPORT_TICKET_CREATED,
    to,
    variables: {
      name,
      ticket_subject: subject || '',
    },
  });

  if (result.sent || result.queued) {
    return {
      sent: true,
      queued: result.queued,
      channel: result.results?.[0]?.channel,
    };
  }

  return {
    sent: false,
    error: result.error || 'Correo de confirmación no configurado.',
  };
}
