import {
  formatSmtpAuthError,
  getSupportSmtpPass,
  getSupportSmtpUser,
} from '@/lib/supportSmtpCredentials';

/**
 * Envío SMTP de respaldo. El destinatario público es support@dralo.es.
 */
export async function sendSupportTicketViaSmtp({ to, subject, text, html, replyTo, bcc }) {
  const user = getSupportSmtpUser();
  const pass = getSupportSmtpPass();

  if (!user || !pass) {
    return { sent: false, skipped: true };
  }

  try {
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `Dralo <${user}>`,
      to,
      bcc: bcc || undefined,
      replyTo: replyTo || undefined,
      subject,
      text,
      html: html || undefined,
    });

    return { sent: true, deliveredTo: to, channel: 'smtp' };
  } catch (err) {
    const msg = err?.message || '';
    return {
      sent: false,
      skipped: false,
      error: formatSmtpAuthError(msg),
    };
  }
}
