import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { sendBulkTransactionalEmail } from '@/lib/sendTransactionalEmail';
import { buildSiteReviewInviteEmail, listReviewInviteRecipients } from '@/lib/siteReviews';

const MAX_RECIPIENTS = 400;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const auth = await authenticateMarketingPlanAdminRequest(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (body.confirm !== true) {
    return NextResponse.json({ error: 'Confirma el envío antes de lanzar el correo.' }, { status: 400 });
  }

  const recipients = await listReviewInviteRecipients();
  if (!recipients.ok) {
    return NextResponse.json({ error: recipients.error }, { status: 500 });
  }

  const emails = recipients.emails.filter((email) => EMAIL_RE.test(email));
  if (!emails.length) {
    return NextResponse.json(
      { error: 'No hay personas que hayan aceptado los envíos comerciales.' },
      { status: 400 },
    );
  }

  const message = buildSiteReviewInviteEmail();
  const slice = emails.slice(0, MAX_RECIPIENTS);
  const result = await sendBulkTransactionalEmail({
    recipients: slice,
    subject: message.subject,
    text: message.text,
    ctaLabel: message.ctaLabel,
    preheader: 'Puedes dejar tu reseña en la web de Dralo.',
  });

  return NextResponse.json({
    ok: result.failed === 0,
    sent: result.sent,
    failed: result.failed,
    recipients: slice.length,
    truncated: emails.length > slice.length,
  });
}
