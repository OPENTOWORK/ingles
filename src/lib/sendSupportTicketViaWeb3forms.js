import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';

/** Envío sin Gmail SMTP (clave gratuita en https://web3forms.com → draloenglish@gmail.com). */
export async function sendSupportTicketViaWeb3forms(ticket, text, subject) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) return { sent: false, skipped: true };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        from_name: ticket.name,
        email: ticket.email,
        message: text,
        botcheck: false,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { sent: true, deliveredTo: SUPPORT_TICKET_INBOX_EMAIL, channel: 'web3forms' };
    }
    return {
      sent: false,
      skipped: false,
      error: data.message || 'Web3Forms no pudo enviar el correo.',
    };
  } catch (err) {
    return {
      sent: false,
      skipped: false,
      error: err?.message || 'Error al contactar Web3Forms.',
    };
  }
}
