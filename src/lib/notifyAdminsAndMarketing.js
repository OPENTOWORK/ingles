import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { listAdminAndMarketingEmails, staffNoticeDb } from '@/lib/staffNoticeRecipients';
import { normalizeEmail } from '@/utils/authRoles';

/**
 * Avisa a admin y a marketing. Un fallo de correo no debe tumbar la acción del usuario.
 */
export async function notifyAdminsAndMarketing({
  adminClient = null,
  triggerEvent,
  variables = {},
  replyTo,
  excludeEmail,
} = {}) {
  if (!triggerEvent) return { sent: false, skipped: true, reason: 'missing_trigger' };

  const db = staffNoticeDb(adminClient);
  const skip = normalizeEmail(excludeEmail || variables.email || '');
  const recipients = (await listAdminAndMarketingEmails(db)).filter((email) => email !== skip);

  if (!recipients.length) return { sent: false, skipped: true, reason: 'no_recipients' };

  let sent = 0;
  const errors = [];
  for (const [index, to] of recipients.entries()) {
    try {
      const mail = await dispatchAutomatedEmail({
        adminClient: db,
        triggerEvent,
        to,
        replyTo: replyTo || undefined,
        syncTemplates: index === 0,
        variables,
      });
      if (mail?.sent || mail?.queued) sent += 1;
      else if (mail?.error) errors.push(`${to}: ${mail.error}`);
    } catch (err) {
      console.error('[staff-notice] send:', to, err);
      errors.push(`${to}: ${err?.message || 'error'}`);
    }
  }

  return {
    sent: sent > 0,
    count: sent,
    ...(errors.length ? { errors } : {}),
  };
}
