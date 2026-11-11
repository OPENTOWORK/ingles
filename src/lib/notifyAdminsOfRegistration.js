import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { loadRegistrationSources } from '@/lib/marketingRegistrationAttribution';
import { listAdminAndMarketingEmails } from '@/lib/staffNoticeRecipients';
import { normalizeEmail } from '@/utils/authRoles';

const LOG_TABLE = 'soporte_correos_log';
const NOTICE_SLUG = 'admin_registration_notice';
const USERS_TABLE = 'Usuarios_y_Perfil_users';
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

function appOrigin() {
  return String(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.dralo.es',
  ).replace(/\/$/, '');
}

async function noticeAlreadySent(adminClient, registrantEmail) {
  try {
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .select('id')
      .eq('slug', NOTICE_SLUG)
      .eq('destinatario', registrantEmail)
      .eq('canal', 'marker')
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

async function claimNotice(adminClient, registrantEmail) {
  try {
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .insert({
        slug: NOTICE_SLUG,
        destinatario: registrantEmail,
        trigger_event: AUTOMATED_EMAIL_TRIGGERS.ADMIN_REGISTRATION_NOTICE,
        canal: 'marker',
        ok: true,
        error_msg: null,
      })
      .select('id')
      .single();
    if (error || !data?.id) {
      console.error('[notifyAdminsOfRegistration] marker:', error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error('[notifyAdminsOfRegistration] marker:', err);
    return null;
  }
}

async function ownsNoticeClaim(adminClient, registrantEmail, claimId) {
  try {
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .select('id')
      .eq('slug', NOTICE_SLUG)
      .eq('destinatario', registrantEmail)
      .eq('canal', 'marker')
      .eq('ok', true)
      .order('enviado_en', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error || !data?.id) return true;
    return data.id === claimId;
  } catch {
    return true;
  }
}

async function registrationNoticeVariables(adminClient, { userId, email, nombre, createdAt }) {
  let confirmed = false;
  let signedUpAt = createdAt || null;
  let id = userId || null;

  if (!id) {
    const { data: profile } = await adminClient
      .from(USERS_TABLE)
      .select('id, creado_en')
      .eq('email', email)
      .maybeSingle();
    id = profile?.id || null;
    signedUpAt = signedUpAt || profile?.creado_en || null;
  }

  if (id) {
    try {
      const { data } = await adminClient.auth.admin.getUserById(id);
      confirmed = Boolean(data?.user?.email_confirmed_at);
      signedUpAt = signedUpAt || data?.user?.created_at || null;
    } catch (err) {
      console.error('[notifyAdminsOfRegistration] auth user:', err);
    }
  }

  let answered = false;
  if (id) {
    const { data: survey, error } = await adminClient
      .from('founding_member_encuestas')
      .select('respondida_en')
      .eq('user_id', id)
      .maybeSingle();
    if (error && !isMissingTableError(error)) {
      console.error('[notifyAdminsOfRegistration] survey:', error);
    }
    answered = Boolean(survey?.respondida_en);
  }

  let origen = 'No indicado';
  if (id) {
    try {
      const sources = await loadRegistrationSources(adminClient, [{ id, createdAt: signedUpAt }]);
      origen = sources.get(id) || 'No indicado';
    } catch (err) {
      console.error('[notifyAdminsOfRegistration] source:', err);
    }
  }

  const fichaUrl = id ? `${appOrigin()}/admin/usuarios/${id}/` : appOrigin();

  return {
    nombre: String(nombre || '').trim() || 'No indicado',
    email,
    correo_confirmado: confirmed ? 'Sí' : 'No',
    formulario: answered ? 'Respondido' : 'Todavía no',
    origen,
    action_url: fichaUrl,
  };
}

/**
 * Avisa a administración y a marketing una sola vez por cada cuenta nueva.
 * No lanza: un fallo de correo no debe impedir el registro.
 */
export async function notifyAdminsOfRegistration(
  adminClient,
  { userId, email, nombre, createdAt } = {},
) {
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

  const claimId = await claimNotice(adminClient, registrantEmail);
  if (!claimId) {
    return { sent: false, skipped: true, reason: 'marker_failed' };
  }
  if (!(await ownsNoticeClaim(adminClient, registrantEmail, claimId))) {
    return { sent: false, skipped: true, reason: 'already_sent' };
  }

  const variables = await registrationNoticeVariables(adminClient, {
    userId,
    email: registrantEmail,
    nombre,
    createdAt,
  });
  const recipients = (await listAdminAndMarketingEmails(adminClient)).filter(
    (staffEmail) => staffEmail !== registrantEmail,
  );

  if (!recipients.length) {
    return { sent: false, skipped: true, reason: 'no_recipients' };
  }

  let anySent = false;
  for (const [index, staffEmail] of recipients.entries()) {
    try {
      const mail = await dispatchAutomatedEmail({
        adminClient,
        triggerEvent: AUTOMATED_EMAIL_TRIGGERS.ADMIN_REGISTRATION_NOTICE,
        to: staffEmail,
        syncTemplates: index === 0,
        variables,
      });
      if (mail?.sent || mail?.queued) anySent = true;
    } catch (err) {
      console.error('[notifyAdminsOfRegistration] send:', staffEmail, err);
    }
  }

  return { sent: anySent, skipped: false };
}
