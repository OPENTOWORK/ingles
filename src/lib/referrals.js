import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const REFERRAL_INVITATIONS_TABLE = 'referral_invitations';

export const REFERRAL_STATUS = {
  SENT: 'sent',
  REGISTERED: 'registered',
  PAID: 'paid',
};

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

/**
 * Crea o actualiza la fila de invitación al enviar el correo.
 */
export async function recordReferralInvitation({
  inviterUserId,
  inviteeEmail,
  customMessage,
  origin,
}) {
  const db = getReferralsDb();
  if (!db) return { ok: false, error: 'NO_SERVICE_ROLE' };

  const email = String(inviteeEmail || '').trim().toLowerCase();
  if (!inviterUserId || !email) return { ok: false, error: 'INVALID_INPUT' };

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
 * Marca la invitación como pagada cuando el invitado activa un plan de pago.
 */
export async function markReferralPaid({ userId, planSlug }) {
  const db = getReferralsDb();
  if (!db || !userId || !isPaidPlanSlug(planSlug)) return { ok: false };

  const { data: invitation } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .select('id, status, inviter_user_id')
    .eq('invited_user_id', userId)
    .in('status', [REFERRAL_STATUS.REGISTERED, REFERRAL_STATUS.PAID])
    .order('registered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invitation) return { ok: false, reason: 'no_invitation' };
  if (invitation.status === REFERRAL_STATUS.PAID) return { ok: true, alreadyPaid: true };

  const { error } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .update({
      status: REFERRAL_STATUS.PAID,
      paid_plan_slug: planSlug,
      paid_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)
    .eq('status', REFERRAL_STATUS.REGISTERED);

  if (error) {
    console.error('[referrals] mark paid', error);
    return { ok: false, error: error.message };
  }

  return { ok: true, invitationId: invitation.id, inviterUserId: invitation.inviter_user_id };
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
      'id, invitee_email, status, email_sent_at, registered_at, paid_at, paid_plan_slug, custom_message',
    )
    .eq('inviter_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (!isMissingTableError(error)) console.error('[referrals] list', error);
    return [];
  }

  return data || [];
}
