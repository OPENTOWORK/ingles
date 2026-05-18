import {
  formatSmtpAuthError,
  getSupportSmtpPass,
  getSupportSmtpUser,
} from '@/lib/supportSmtpCredentials';

/**
 * Envío SMTP directo a la bandeja (draloenglish@gmail.com).
 */
export async function sendSupportTicketViaSmtp({ to, subject, text, replyTo }) {
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
      from: `Dralo Soporte <${user}>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      text,
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
