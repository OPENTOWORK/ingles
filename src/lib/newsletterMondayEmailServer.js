import {
  buildNewsletterMondayEmail,
  isNewsletterMondaySendTime,
  newsletterMondayId,
  newsletterMondaySlug,
  planNewsletterMondayRecipients,
  unsubscribeUrlForToken,
} from '@/lib/newsletterMondayEmail';
import { sendTransactionalEmail } from '@/lib/sendTransactionalEmail';
import {
  ADMIN_EMAIL,
  isAdminRole,
  isCoordinatorRole,
  isMarketingRole,
  isTeacherRole,
} from '@/utils/authRoles';

const LOG_TABLE = 'soporte_correos_log';

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es'
  );
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function loadActiveSubscribers(adminClient) {
  const { data, error } = await adminClient
    .from('newsletter_suscriptores')
    .select('email, unsubscribe_token, status')
    .eq('status', 'active');
  if (error) throw error;
  return data || [];
}

async function loadStaffEmails(adminClient) {
  const { data: roles, error: rolesError } = await adminClient
    .from('Usuarios_y_Perfil_roles')
    .select('id, nombre');
  if (rolesError) throw rolesError;

  const roleIds = (roles || [])
    .filter(
      (role) =>
        isAdminRole(role.nombre) ||
        isMarketingRole(role.nombre) ||
        isCoordinatorRole(role.nombre) ||
        isTeacherRole(role.nombre),
    )
    .map((role) => role.id);

  const emails = new Set([normalizeEmail(ADMIN_EMAIL)]);
  if (!roleIds.length) return [...emails];

  const { data: users, error: usersError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('email, activo')
    .in('rol_id', roleIds)
    .eq('activo', true);
  if (usersError) throw usersError;

  for (const user of users || []) {
    const email = normalizeEmail(user.email);
    if (email) emails.add(email);
  }
  return [...emails];
}

async function loadAlreadySent(adminClient, slug) {
  const { data, error } = await adminClient
    .from(LOG_TABLE)
    .select('destinatario')
    .eq('slug', slug)
    .eq('ok', true)
    .limit(5000);
  if (error) throw error;
  return (data || []).map((row) => row.destinatario);
}

async function logSend(adminClient, row) {
  try {
    await adminClient.from(LOG_TABLE).insert(row);
  } catch (err) {
    console.error('[newsletter-monday] log', err);
  }
}

/**
 * Lunes a las 10:00 (Madrid). Suscriptores confirmados, o el equipo si la lista está vacía.
 * El equipo es administración, marketing, coordinación y profesorado.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {Date} [now]
 */
export async function runNewsletterMonday(adminClient, now = new Date()) {
  if (!adminClient) return { sent: 0, skipped: true };
  if (!isNewsletterMondaySendTime(now)) {
    return { sent: 0, skipped: true, reason: 'solo lunes a las 10:00 (Madrid)' };
  }

  const mondayId = newsletterMondayId(now);
  const slug = newsletterMondaySlug(mondayId);
  const sample = buildNewsletterMondayEmail({ mondayId, audience: 'subscribers', siteUrl: appOrigin() });
  if (!sample) return { sent: 0, skipped: true, reason: 'sin número para este lunes', mondayId };

  let subscribers;
  let staffEmails;
  let alreadySent;
  try {
    [subscribers, staffEmails, alreadySent] = await Promise.all([
      loadActiveSubscribers(adminClient),
      loadStaffEmails(adminClient),
      loadAlreadySent(adminClient, slug),
    ]);
  } catch (err) {
    return { sent: 0, mondayId, error: err.message || 'No se pudo preparar el envío.' };
  }

  const plan = planNewsletterMondayRecipients({
    activeEmails: subscribers.map((row) => row.email),
    staffEmails,
    alreadySent,
  });

  const tokenByEmail = new Map(
    subscribers.map((row) => [normalizeEmail(row.email), row.unsubscribe_token]),
  );

  let sent = 0;
  const errors = [];
  for (const email of plan.recipients) {
    const unsubscribeUrl =
      plan.audience === 'subscribers'
        ? unsubscribeUrlForToken(tokenByEmail.get(email), appOrigin())
        : '';
    const message = buildNewsletterMondayEmail({
      mondayId,
      audience: plan.audience,
      unsubscribeUrl,
      siteUrl: appOrigin(),
    });
    const result = await sendTransactionalEmail({
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html,
      preheader: message.preheader,
      branded: false,
    });
    await logSend(adminClient, {
      slug,
      destinatario: email,
      trigger_event: 'newsletter_monday',
      canal: result.channel || null,
      ok: Boolean(result.ok),
      error_msg: result.ok ? null : result.error || 'Error desconocido',
    });
    if (result.ok) sent += 1;
    else errors.push(`${email}: ${result.error || 'error'}`);
  }

  return {
    sent,
    eligible: plan.recipients.length,
    audience: plan.audience,
    mondayId,
    ...(errors.length ? { errors } : {}),
  };
}
