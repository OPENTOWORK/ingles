import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { ADMIN_EMAIL, isAdminRole, normalizeEmail } from '@/utils/authRoles';

const LOG_TABLE = 'soporte_correos_log';
const NOTICE_SLUG = 'admin_registration_notice';
const USERS_TABLE = 'Usuarios_y_Perfil_users';
const ROLES_TABLE = 'Usuarios_y_Perfil_roles';
/** Ventana para avisar un alta de Google que no pasó por /api/auth/register. */
const RECENT_SIGNUP_MS = 6 * 60 * 60 * 1000;

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

export function isRecentSignup(createdAt, now = Date.now()) {
  const time = new Date(createdAt || 0).getTime();
  if (!Number.isFinite(time)) return false;
  const age = now - time;
  return age >= 0 && age <= RECENT_SIGNUP_MS;
}

async function noticeAlreadySent(adminClient, registrantEmail) {
  try {
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .select('id')
      .eq('slug', NOTICE_SLUG)
      .eq('destinatario', registrantEmail)
      .eq('ok', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) return false;
      console.error('[notifyAdminsOfRegistration] log lookup:', error);
      return false;
    }
    return Boolean(data?.id);
  } catch (err) {
    console.error('[notifyAdminsOfRegistration] log lookup:', err);
    return false;
  }
}

async function listAdminEmails(adminClient) {
  const emails = new Set([normalizeEmail(ADMIN_EMAIL)].filter(Boolean));

  try {
    const { data: roles } = await adminClient.from(ROLES_TABLE).select('id, nombre');
    const adminRoleIds = (roles || [])
      .filter((role) => isAdminRole(role?.nombre))
      .map((role) => role.id)
      .filter(Boolean);

    if (adminRoleIds.length) {
      const { data: users } = await adminClient
        .from(USERS_TABLE)
        .select('email, activo')
        .in('rol_id', adminRoleIds);

      for (const user of users || []) {
        if (user?.activo === false) continue;
        const email = normalizeEmail(user?.email || '');
        if (email) emails.add(email);
      }
    }
  } catch (err) {
    console.error('[notifyAdminsOfRegistration] admin recipients:', err);
  }

  return [...emails];
}

/**
 * Avisa a los administradores una sola vez por cada cuenta nueva.
 * No lanza: un fallo de correo no debe impedir el registro.
 */
export async function notifyAdminsOfRegistration(adminClient, { email, nombre, createdAt } = {}) {
  const registrantEmail = normalizeEmail(email || '');
  if (!adminClient || !registrantEmail) {
    return { sent: false, skipped: true, reason: 'missing_params' };
  }

  if (createdAt && !isRecentSignup(createdAt)) {
    return { sent: false, skipped: true, reason: 'not_recent' };
  }

  if (await noticeAlreadySent(adminClient, registrantEmail)) {
    return { sent: false, skipped: true, reason: 'already_sent' };
  }

  const displayName = String(nombre || '').trim() || 'No indicado';
  const recipients = (await listAdminEmails(adminClient)).filter(
    (adminEmail) => adminEmail !== registrantEmail,
  );

  if (!recipients.length) {
    return { sent: false, skipped: true, reason: 'no_admins' };
  }

  let anySent = false;
  for (const adminEmail of recipients) {
    try {
      const mail = await dispatchAutomatedEmail({
        adminClient,
        triggerEvent: AUTOMATED_EMAIL_TRIGGERS.ADMIN_REGISTRATION_NOTICE,
        to: adminEmail,
        variables: {
          email: registrantEmail,
          nombre: displayName,
        },
      });
      if (mail?.sent || mail?.queued) anySent = true;
    } catch (err) {
      console.error('[notifyAdminsOfRegistration] send:', adminEmail, err);
    }
  }

  if (anySent) {
    try {
      await adminClient.from(LOG_TABLE).insert({
        slug: NOTICE_SLUG,
        destinatario: registrantEmail,
        trigger_event: AUTOMATED_EMAIL_TRIGGERS.ADMIN_REGISTRATION_NOTICE,
        canal: 'marker',
        ok: true,
        error_msg: null,
      });
    } catch (err) {
      console.error('[notifyAdminsOfRegistration] marker:', err);
    }
  }

  return { sent: anySent, skipped: false };
}
