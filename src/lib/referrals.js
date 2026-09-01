import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { grantReferralReward } from '@/lib/stripe/referralRewards';
import { SUBSCRIPTIONS_TABLE } from '@/lib/stripe/subscriptions';

export const REFERRAL_INVITATIONS_TABLE = 'referral_invitations';

export const REFERRAL_STATUS = {
  SENT: 'sent',
  REGISTERED: 'registered',
  PAID: 'paid',
};

export const REFERRAL_INVITE_ERROR = {
  SELF_INVITE: 'SELF_INVITE',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  ALREADY_REGISTERED_PAID: 'ALREADY_REGISTERED_PAID',
};

const USER_EMAIL_TABLES = ['Usuarios_y_Perfil_users', 'user_profiles'];

function getReferralsDb() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

export function createInviteToken() {
  return randomBytes(24).toString('base64url');
}

export function buildInviteSignupUrl(origin, token) {
  const base = String(origin || 'https://www.dralo.es').replace(/\/$/, '');
  return `${base}/registro?ref=${encodeURIComponent(token)}`;
}

export function isPaidPlanSlug(planSlug) {
  const slug = String(planSlug || '').trim().toLowerCase();
  return Boolean(slug && slug !== 'free');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function findUserIdByEmail(db, email) {
  const normalized = normalizeEmail(email);
  if (!db || !normalized) return null;

  for (const table of USER_EMAIL_TABLES) {
    const { data, error } = await db
      .from(table)
      .select('id')
      .eq('email', normalized)
      .maybeSingle();

    if (error && !isMissingTableError(error)) {
      console.warn(`[referrals] findUserIdByEmail ${table}`, error.message);
    }
    if (data?.id) return data.id;
  }

  let page = 1;
  const perPage = 500;
  while (page <= 10) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.warn('[referrals] listUsers', error.message);
      break;
    }
    const match = data?.users?.find((user) => normalizeEmail(user.email) === normalized);
    if (match?.id) return match.id;
    if (!data?.users?.length || data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

/** True si el usuario ya tuvo o tiene un plan de pago (Stripe o asignación admin). */
export async function userHadPaidPlanAccess(db, userId) {
  if (!db || !userId) return false;

  const { data: sub, error: subError } = await db
    .from(SUBSCRIPTIONS_TABLE)
    .select('plan_id, status, stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (subError && !isMissingTableError(subError)) {
    console.warn('[referrals] userHadPaidPlanAccess subscription', subError.message);
  }

  if (sub) {
    if (isPaidPlanSlug(sub.plan_id)) return true;
    if (sub.stripe_subscription_id) return true;
  }

  for (const table of USER_EMAIL_TABLES) {
    const { data: profile, error } = await db
      .from(table)
      .select('plan_id')
      .eq('id', userId)
      .maybeSingle();

    if (error && !isMissingTableError(error)) {
      console.warn(`[referrals] userHadPaidPlanAccess ${table}`, error.message);
      continue;
    }
    if (profile && isPaidPlanSlug(profile.plan_id)) return true;
  }

  return false;
}

/**
 * Comprueba si el email puede recibir una invitación de referido.
 * Bloquea cuentas existentes (especialmente con historial de pago).
 */
export async function validateReferralInvitee({ inviterUserId, inviterEmail, inviteeEmail }) {
  const db = getReferralsDb();
  const email = normalizeEmail(inviteeEmail);
  const inviter = normalizeEmail(inviterEmail);

  if (!email) {
    return { ok: false, code: 'INVALID_EMAIL', message: 'Enter a valid email for the invitation.' };
  }

  if (inviter && email === inviter) {
    return {
      ok: false,
      code: REFERRAL_INVITE_ERROR.SELF_INVITE,
      message: 'You cannot invite your own email address.',
    };
  }

  if (!db) {
    return { ok: true, skipped: true };
  }

  const existingUserId = await findUserIdByEmail(db, email);
  if (!existingUserId) {
    return { ok: true };
  }

  if (existingUserId === inviterUserId) {
    return {
      ok: false,
      code: REFERRAL_INVITE_ERROR.SELF_INVITE,
      message: 'You cannot invite your own email address.',
    };
  }

  const hadPaid = await userHadPaidPlanAccess(db, existingUserId);
  if (hadPaid) {
    return {
      ok: false,
      code: REFERRAL_INVITE_ERROR.ALREADY_REGISTERED_PAID,
      message:
        'This email already has a Dralo account and has previously had a paid plan, so they cannot be invited for the referral reward.',
    };
  }

  return {
    ok: false,
    code: REFERRAL_INVITE_ERROR.ALREADY_REGISTERED,
    message:
      'This email is already registered on Dralo. Referrals only work for new users who sign up through your invitation.',
  };
}

async function inviteeAccountPredatesInvitation(db, userId, invitation) {
  if (!db || !userId || !invitation?.email_sent_at) return false;

  const { data: authData, error } = await db.auth.admin.getUserById(userId);
  if (error || !authData?.user?.created_at) return false;

  const createdAt = new Date(authData.user.created_at).getTime();
  const sentAt = new Date(invitation.email_sent_at).getTime();
  return createdAt < sentAt - 60_000;
}

/**
 * Crea o actualiza la fila de invitación al enviar el correo.
 */
export async function recordReferralInvitation({
  inviterUserId,
  inviteeEmail,
  customMessage,
  origin,
  inviterEmail,
}) {
  const db = getReferralsDb();
  if (!db) return { ok: false, error: 'NO_SERVICE_ROLE' };

  const email = normalizeEmail(inviteeEmail);
  if (!inviterUserId || !email) return { ok: false, error: 'INVALID_INPUT' };

  const eligibility = await validateReferralInvitee({
    inviterUserId,
    inviterEmail,
    inviteeEmail: email,
  });
  if (!eligibility.ok && !eligibility.skipped) {
    return {
      ok: false,
      error: eligibility.message,
      code: eligibility.code,
    };
  }

  const token = createInviteToken();
  const inviteUrl = buildInviteSignupUrl(origin, token);

  const { data: existing, error: readError } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .select('id, status, invite_token')
    .eq('inviter_user_id', inviterUserId)
    .eq('invitee_email', email)
    .maybeSingle();

  if (readError && !isMissingTableError(readError)) {
    console.error('[referrals] read existing', readError);
    return { ok: false, error: readError.message };
  }

  if (existing?.status === REFERRAL_STATUS.REGISTERED || existing?.status === REFERRAL_STATUS.PAID) {
    return {
      ok: true,
      inviteUrl: buildInviteSignupUrl(origin, existing.invite_token),
      token: existing.invite_token,
      reused: true,
    };
  }

  const row = {
    inviter_user_id: inviterUserId,
    invitee_email: email,
    invite_token: token,
    custom_message: customMessage || null,
    status: REFERRAL_STATUS.SENT,
    email_sent_at: new Date().toISOString(),
  };

  const { error: upsertError } = await db.from(REFERRAL_INVITATIONS_TABLE).upsert(row, {
    onConflict: 'inviter_user_id,invitee_email',
  });

  if (upsertError) {
    if (isMissingTableError(upsertError)) {
      console.warn('[referrals] table missing; run scripts/migrations/create_referral_invitations.sql');
      return { ok: false, error: 'TABLE_MISSING', inviteUrl: buildInviteSignupUrl(origin, token) };
    }
    console.error('[referrals] upsert invitation', upsertError);
    return { ok: false, error: upsertError.message };
  }

  return { ok: true, inviteUrl, token, reused: false };
}

/**
 * Marca la invitación como registrada cuando el amigo crea cuenta.
 */
export async function markReferralRegistered({ userId, email, referralToken }) {
  const db = getReferralsDb();
  if (!db || !userId) return { ok: false };

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return { ok: false };

  let invitation = null;

  if (referralToken) {
    const { data } = await db
      .from(REFERRAL_INVITATIONS_TABLE)
      .select('*')
      .eq('invite_token', referralToken)
      .maybeSingle();
    if (data?.invitee_email === normalizedEmail) invitation = data;
  }

  if (!invitation) {
    const { data } = await db
      .from(REFERRAL_INVITATIONS_TABLE)
      .select('*')
      .eq('invitee_email', normalizedEmail)
      .eq('status', REFERRAL_STATUS.SENT)
      .order('email_sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    invitation = data;
  }

  if (!invitation || invitation.status !== REFERRAL_STATUS.SENT) {
    return { ok: false, reason: 'no_match' };
  }

  if (await inviteeAccountPredatesInvitation(db, userId, invitation)) {
    console.warn('[referrals] existing account blocked from referral', userId, normalizedEmail);
    return { ok: false, reason: 'existing_account' };
  }

  const { error } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .update({
      status: REFERRAL_STATUS.REGISTERED,
      invited_user_id: userId,
      registered_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)
    .eq('status', REFERRAL_STATUS.SENT);

  if (error) {
    console.error('[referrals] mark registered', error);
    return { ok: false, error: error.message };
  }

  return { ok: true, invitationId: invitation.id, inviterUserId: invitation.inviter_user_id };
}

/**
 * Marca la invitación como pagada y concede 2 meses gratis de PLUS al referidor.
 */
export async function markReferralPaid({ userId, planSlug }) {
  const db = getReferralsDb();
  if (!db || !userId || !isPaidPlanSlug(planSlug)) return { ok: false };

  const { data: invitation } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .select('id, status, inviter_user_id, reward_granted_at')
    .eq('invited_user_id', userId)
    .in('status', [REFERRAL_STATUS.REGISTERED, REFERRAL_STATUS.PAID])
    .order('registered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invitation) return { ok: false, reason: 'no_invitation' };

  if (await inviteeAccountPredatesInvitation(db, userId, invitation)) {
    console.warn('[referrals] existing account at paid; reward blocked', userId, invitation.id);
    return { ok: false, reason: 'existing_account' };
  }

  const { data: sub } = await db
    .from(SUBSCRIPTIONS_TABLE)
    .select('created_at, stripe_subscription_id, plan_id')
    .eq('user_id', userId)
    .maybeSingle();

  const regTime = invitation.registered_at
    ? new Date(invitation.registered_at).getTime()
    : Date.now();
  const subCreated = sub?.created_at ? new Date(sub.created_at).getTime() : 0;
  if (
    sub &&
    subCreated < regTime - 60_000 &&
    (isPaidPlanSlug(sub.plan_id) || Boolean(sub.stripe_subscription_id))
  ) {
    console.warn('[referrals] paid plan predates referral; reward blocked', userId, invitation.id);
    return { ok: false, reason: 'existing_paid_account' };
  }

  const now = new Date().toISOString();
  const needsStatusUpdate = invitation.status === REFERRAL_STATUS.REGISTERED;

  if (needsStatusUpdate) {
    const { error } = await db
      .from(REFERRAL_INVITATIONS_TABLE)
      .update({
        status: REFERRAL_STATUS.PAID,
        paid_plan_slug: planSlug,
        paid_at: now,
      })
      .eq('id', invitation.id)
      .eq('status', REFERRAL_STATUS.REGISTERED);

    if (error) {
      console.error('[referrals] mark paid', error);
      return { ok: false, error: error.message };
    }
  }

  if (invitation.reward_granted_at) {
    return {
      ok: true,
      invitationId: invitation.id,
      inviterUserId: invitation.inviter_user_id,
      rewardAlreadyGranted: true,
    };
  }

  const reward = await grantReferralReward({
    inviterUserId: invitation.inviter_user_id,
    invitationId: invitation.id,
  });

  if (reward.ok) {
    await db
      .from(REFERRAL_INVITATIONS_TABLE)
      .update({ reward_granted_at: now })
      .eq('id', invitation.id)
      .is('reward_granted_at', null);
  } else {
    console.error('[referrals] reward not granted', invitation.id, reward);
  }

  return {
    ok: true,
    invitationId: invitation.id,
    inviterUserId: invitation.inviter_user_id,
    rewardGranted: reward.ok,
    reward,
  };
}

export async function listReferralsForUser(userId) {
  if (!userId) return [];

  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return [];

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .select(
      'id, invitee_email, status, email_sent_at, registered_at, paid_at, paid_plan_slug, reward_granted_at, custom_message',
    )
    .eq('inviter_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (!isMissingTableError(error)) console.error('[referrals] list', error);
    return [];
  }

  return data || [];
}
