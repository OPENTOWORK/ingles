import { deliverTransactionalEmail } from '@/lib/emailDelivery';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function sendTransactionalEmail({ to, subject, text, html, branded = true, ctaLabel, preheader }) {
  if (!isValidEmail(to)) {
    return { ok: false, error: 'Email no válido.' };
  }

  let resolvedHtml = html;
  if (!resolvedHtml && branded) {
    resolvedHtml = buildBrandedEmailFromPlainText(text, {
      preheader: preheader || subject,
      ctaLabel,
      headline: subject,
    }).html;
  }

  return deliverTransactionalEmail({ to, subject, text, html: resolvedHtml });
}

export async function sendBulkTransactionalEmail({ recipients, subject, text, branded = true, ctaLabel, preheader }) {
  let sent = 0;
  const errors = [];
  for (const to of recipients) {
    const result = await sendTransactionalEmail({ to, subject, text, branded, ctaLabel, preheader });
    if (result.ok) sent += 1;
    else errors.push({ to, error: result.error });
  }
  return { sent, failed: recipients.length - sent, errors };
}

export { isValidEmail };
