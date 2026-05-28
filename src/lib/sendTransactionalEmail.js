import { deliverTransactionalEmail } from '@/lib/emailDelivery';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function sendTransactionalEmail({ to, subject, text }) {
  if (!isValidEmail(to)) {
    return { ok: false, error: 'Email no válido.' };
  }
  return deliverTransactionalEmail({ to, subject, text });
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
