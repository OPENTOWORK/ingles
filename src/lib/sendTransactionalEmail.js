import { Resend } from 'resend';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';
import { isSupportSmtpReady } from '@/lib/supportSmtpCredentials';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function sendTransactionalEmail({ to, subject, text }) {
  if (!isValidEmail(to)) {
    return { ok: false, error: 'Email no válido.' };
  }

  if (isSupportSmtpReady()) {
    const smtp = await sendSupportTicketViaSmtp({ to, subject, text });
    if (smtp.sent) return { ok: true, channel: 'smtp' };
    if (!smtp.skipped) {
      return { ok: false, error: smtp.error || 'Error SMTP' };
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && (await isResendDomainReady())) {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
    const { error } = await resend.emails.send({ from, to: [to], subject, text });
    if (!error) return { ok: true, channel: 'resend' };
    return { ok: false, error: error.message || 'Error Resend' };
  }

  return {
    ok: false,
    error:
      'Correo no configurado. Configura SMTP en /contacto/configurar-correo o RESEND_API_KEY.',
  };
}

export async function sendBulkTransactionalEmail({ recipients, subject, text }) {
  let sent = 0;
  const errors = [];
  for (const to of recipients) {
    const result = await sendTransactionalEmail({ to, subject, text });
    if (result.ok) sent += 1;
    else errors.push({ to, error: result.error });
  }
  return { sent, failed: recipients.length - sent, errors };
}

export { isValidEmail };
