import { getPlanBySlug } from '@/data/financialPlanConfig';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { notifyAdminsAndMarketing } from '@/lib/notifyAdminsAndMarketing';
import { normalizeEmail } from '@/utils/authRoles';

const PAID_PLAN_SLUGS = new Set(['starter', 'premium', 'pro']);

function isPaidPlan(planSlug) {
  return PAID_PLAN_SLUGS.has(String(planSlug || '').trim().toLowerCase());
}

const LOG_TABLE = 'soporte_correos_log';
const NOTICE_SLUG = 'admin_paid_plan_notice';
const USERS_TABLE = 'Usuarios_y_Perfil_users';

function appOrigin() {
  return String(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.dralo.es',
  ).replace(/\/$/, '');
}

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

/**
 * Avisa solo cuando el plan de pago cambia. Una renovación del mismo plan no avisa.
 */
export function shouldNotifyPaidPlan({ previousActive = false, previousPlan = '', nextPlan = '' } = {}) {
  if (!isPaidPlan(nextPlan)) return false;
  if (previousActive && String(previousPlan || '') === String(nextPlan || '')) return false;
  return true;
}

function periodLabel(interval) {
  return interval === 'year' ? 'Anual' : 'Mensual';
}

function channelLabel(channel) {
  if (channel === 'google') return 'Google Play';
  if (channel === 'apple') return 'App Store';
  return 'Stripe';
}

function priceLabel(planSlug, interval) {
  const plan = getPlanBySlug(planSlug);
  if (interval === 'year') {
    const monthly = Number(plan?.precioAnualLanzamiento);
    if (monthly > 0) {
      const yearly = (monthly * 12).toFixed(2).replace('.', ',');
      return `${yearly} €/año`;
    }
  }
  return plan?.precioLabel && plan.precioLabel !== '0€' ? plan.precioLabel : 'De pago';
}

function markerKey(userId, planSlug, subscriptionId) {
  return `paid:${userId}:${planSlug}:${subscriptionId || 'sin-id'}`;
}

async function noticeAlreadySent(adminClient, marker) {
  try {
    const { data, error } = await adminClient
      .from(LOG_TABLE)
      .select('id')
      .eq('slug', NOTICE_SLUG)
      .eq('destinatario', marker)
      .eq('canal', 'marker')
      .eq('ok', true)
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error)) return false;
      console.error('[notifyAdminsOfPaidPlan] log lookup:', error);
      return false;
    }
    return Boolean(data?.id);
  } catch (err) {
    console.error('[notifyAdminsOfPaidPlan] log lookup:', err);
    return false;
  }
}

async function claimNotice(adminClient, marker) {
  try {
    const { error } = await adminClient.from(LOG_TABLE).insert({
      slug: NOTICE_SLUG,
      destinatario: marker,
      trigger_event: AUTOMATED_EMAIL_TRIGGERS.ADMIN_PAID_PLAN_NOTICE,
      canal: 'marker',
      ok: true,
      error_msg: null,
    });
    if (error) {
      console.error('[notifyAdminsOfPaidPlan] marker:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[notifyAdminsOfPaidPlan] marker:', err);
    return false;
  }
}

async function payerIdentity(adminClient, userId) {
  let email = '';
  let nombre = '';
  try {
    const { data } = await adminClient
      .from(USERS_TABLE)
      .select('email, nombre')
      .eq('id', userId)
      .maybeSingle();
    email = normalizeEmail(data?.email || '');
    nombre = String(data?.nombre || '').trim();
  } catch (err) {
    console.error('[notifyAdminsOfPaidPlan] profile:', err);
  }

  if (!email || !nombre) {
    try {
      const { data } = await adminClient.auth.admin.getUserById(userId);
      email = email || normalizeEmail(data?.user?.email || '');
      nombre =
        nombre ||
        String(data?.user?.user_metadata?.nombre || data?.user?.user_metadata?.name || '').trim();
    } catch (err) {
      console.error('[notifyAdminsOfPaidPlan] auth user:', err);
    }
  }

  return {
    email: email || 'No indicado',
    nombre: nombre || 'No indicado',
  };
}

/**
 * Avisa a administración y a marketing de un plan de pago nuevo.
 * No lanza: un fallo de correo no debe impedir el cobro.
 */
export async function notifyAdminsOfPaidPlan(
  adminClient,
  { userId, planSlug, interval = 'month', channel = 'stripe', subscriptionId = '' } = {},
) {
  if (!adminClient || !userId || !isPaidPlan(planSlug)) {
    return { sent: false, skipped: true, reason: 'missing_params' };
  }

  const marker = markerKey(userId, planSlug, subscriptionId);
  if (await noticeAlreadySent(adminClient, marker)) {
    return { sent: false, skipped: true, reason: 'already_sent' };
  }
  if (!(await claimNotice(adminClient, marker))) {
    return { sent: false, skipped: true, reason: 'marker_failed' };
  }

  const payer = await payerIdentity(adminClient, userId);
  const plan = getPlanBySlug(planSlug);
  const result = await notifyAdminsAndMarketing({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.ADMIN_PAID_PLAN_NOTICE,
    excludeEmail: payer.email,
    replyTo: payer.email !== 'No indicado' ? payer.email : undefined,
    variables: {
      nombre: payer.nombre,
      email: payer.email,
      plan: plan?.nombre || planSlug,
      periodo: periodLabel(interval),
      precio: priceLabel(planSlug, interval),
      canal: channelLabel(channel),
      action_url: `${appOrigin()}/admin/usuarios/${userId}/`,
    },
  });

  return result;
}
