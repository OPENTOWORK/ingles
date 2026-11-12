import { assignUserPlan } from '@/lib/adminUserPlan';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';
import {
  PRO_LAUNCH_AFTER_EXPIRY,
  PRO_LAUNCH_COHORT,
  PRO_LAUNCH_MONTHS,
  PRO_LAUNCH_PLAN_SLUG,
  PRO_LAUNCH_SLOT_LIMIT,
  computeProLaunchAvailability,
  isEligibleForProLaunch,
  proTrialEndsAt,
} from '@/lib/proLaunchOffer.rules';

const TABLE = 'pro_launch_grants';
const FOUNDING_TABLE = 'founding_member_grants';

function isMissingRelation(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    error?.code === '42883' ||
    msg.includes('does not exist') ||
    msg.includes('could not find') ||
    msg.includes('claim_pro_launch_slot') ||
    msg.includes('pro_launch_grants')
  );
}

function parseSlotPayload(value) {
  if (!value) return null;
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') return null;
  const slot = Number(row.slot_number);
  if (!Number.isInteger(slot) || slot < 1) return null;
  return {
    slotNumber: slot,
    endsAt: row.pro_trial_ends_at || null,
    already: Boolean(row.already),
  };
}

/**
 * TODO: PRO_LAUNCH_AFTER_EXPIRY es null. No hay job que cambie el plan al vencer
 * `pro_trial_ends_at`. No inventar el destino (gratis, cobro o tarjeta).
 */
export function proLaunchExpiryAction() {
  return PRO_LAUNCH_AFTER_EXPIRY;
}

/**
 * Reserva una plaza real de la cohorte nueva y asigna Plan PREMIUM (`pro`).
 * No toca `founding_member_grants` ni el Plan Plus de quien ya lo tiene.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 */
function isPublicStudentRole(role) {
  const value = String(role || '').trim().toLowerCase();
  if (!value) return true;
  return value === 'student' || value === 'alumno' || value === 'alumno/a';
}

export async function maybeGrantProLaunch(
  adminClient,
  { userId, email, nombre, createdAt, role, sendEmail = true },
) {
  if (!adminClient || !userId || !email) {
    return { granted: false, reason: 'missing_params' };
  }
  if (!isPublicStudentRole(role)) {
    return { granted: false, reason: 'not_student' };
  }
  if (!isEligibleForProLaunch(createdAt)) {
    return { granted: false, reason: 'before_offer' };
  }

  try {
    if (await hasFoundingGrant(adminClient, userId)) {
      return { granted: false, reason: 'founding_member' };
    }

    const claimed = await claimProLaunchSlot(adminClient, userId, email);
    if (!claimed) {
      return { granted: false, reason: 'sold_out' };
    }

    if (!claimed.already) {
      await assignUserPlan(adminClient, userId, PRO_LAUNCH_PLAN_SLUG);
    }

    let emailSent = false;
    if (sendEmail && !(await hasProLaunchEmailBeenSent(adminClient, userId))) {
      try {
        const mail = await dispatchAutomatedEmail({
          adminClient,
          triggerEvent: AUTOMATED_EMAIL_TRIGGERS.PRO_LAUNCH_GRANTED,
          to: email,
          variables: {
            email,
            nombre: formatNombreVariable(nombre),
            meses: String(PRO_LAUNCH_MONTHS),
          },
        });
        emailSent = Boolean(mail?.sent || mail?.queued);
        if (emailSent) await markProLaunchEmailSent(adminClient, userId);
      } catch (mailErr) {
        console.error('[proLaunchOffer] email:', mailErr);
      }
    }

    return {
      granted: true,
      slotNumber: claimed.slotNumber,
      endsAt: claimed.endsAt,
      planSlug: PRO_LAUNCH_PLAN_SLUG,
      emailSent,
      already: claimed.already,
    };
  } catch (err) {
    console.error('[proLaunchOffer]', err);
    return { granted: false, error: err?.message || 'unknown_error' };
  }
}

export async function getProLaunchSlotAvailability(adminClient) {
  if (!adminClient) return null;

  try {
    const { data, error } = await adminClient.rpc('get_public_pro_launch_availability');
    if (!error && data && typeof data === 'object') {
      const total = Math.max(0, Number(data.total) || PRO_LAUNCH_SLOT_LIMIT);
      const claimed = Math.max(0, Number(data.claimed) || 0);
      return computeProLaunchAvailability(claimed, total);
    }
    if (error && !isMissingRelation(error)) {
      console.error('[proLaunchOffer] availability RPC:', error);
    }

    const { count, error: countError } = await adminClient
      .from(TABLE)
      .select('user_id', { count: 'exact', head: true })
      .eq('offer_cohort', PRO_LAUNCH_COHORT);
    if (countError || count == null) {
      if (!countError || isMissingRelation(countError)) return null;
      throw countError;
    }
    return computeProLaunchAvailability(count);
  } catch (err) {
    console.error('[proLaunchOffer] availability:', err);
    return null;
  }
}

async function hasFoundingGrant(adminClient, userId) {
  const { data, error } = await adminClient
    .from(FOUNDING_TABLE)
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return false;
    throw error;
  }
  return Boolean(data?.user_id);
}

async function claimProLaunchSlot(adminClient, userId, email) {
  const { data, error } = await adminClient.rpc('claim_pro_launch_slot', {
    p_user_id: userId,
    p_email: email,
  });
  if (!error) return parseSlotPayload(data);
  if (!isMissingRelation(error)) throw error;

  console.error('[proLaunchOffer] RPC unavailable, using table fallback:', error.message || error);
  return claimProLaunchSlotFallback(adminClient, userId, email);
}

async function claimProLaunchSlotFallback(adminClient, userId, email) {
  const { data: existing, error: existingError } = await adminClient
    .from(TABLE)
    .select('slot_number, pro_trial_ends_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) {
    if (isMissingRelation(existingError)) return null;
    throw existingError;
  }
  if (existing?.slot_number) {
    return parseSlotPayload({ ...existing, already: true });
  }

  const { count, error: countError } = await adminClient
    .from(TABLE)
    .select('user_id', { count: 'exact', head: true })
    .eq('offer_cohort', PRO_LAUNCH_COHORT);
  if (countError) throw countError;
  if ((count || 0) >= PRO_LAUNCH_SLOT_LIMIT) return null;

  const endsAt = proTrialEndsAt(new Date().toISOString(), PRO_LAUNCH_MONTHS);
  const slotNumber = (count || 0) + 1;
  const { data: inserted, error: insertError } = await adminClient
    .from(TABLE)
    .insert({
      user_id: userId,
      slot_number: slotNumber,
      email: String(email).trim().toLowerCase(),
      offer_cohort: PRO_LAUNCH_COHORT,
      pro_trial_ends_at: endsAt,
    })
    .select('slot_number, pro_trial_ends_at')
    .maybeSingle();

  if (insertError) {
    if (String(insertError.message || '').includes('duplicate') || insertError.code === '23505') {
      const { data: retry } = await adminClient
        .from(TABLE)
        .select('slot_number, pro_trial_ends_at')
        .eq('user_id', userId)
        .maybeSingle();
      return parseSlotPayload(retry ? { ...retry, already: true } : null);
    }
    throw insertError;
  }
  return parseSlotPayload(inserted);
}

async function hasProLaunchEmailBeenSent(adminClient, userId) {
  const { data, error } = await adminClient
    .from(TABLE)
    .select('email_sent_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data?.email_sent_at);
}

async function markProLaunchEmailSent(adminClient, userId) {
  const { error } = await adminClient
    .from(TABLE)
    .update({ email_sent_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error && !isMissingRelation(error)) {
    console.error('[proLaunchOffer] mark email sent:', error);
  }
}
