import { assignUserPlan } from '@/lib/adminUserPlan';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';
import {
  FIRST_AUTO_SLOT,
  FOUNDING_CAMPAIGN_STARTED_AT,
  MAX_FOUNDING_SLOT,
  PLUS_PLAN_SLUG,
  computeFoundingSlotAvailability,
  parseFoundingSlotNumber,
  shouldAttemptFoundingPlus,
  shouldGrantFoundingPlus,
} from '@/lib/foundingMemberPlus.rules';

const FOUNDING_MEMBER_TABLE = 'founding_member_grants';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('claim_founding_member_slot') ||
    msg.includes('founding_member_grants')
  );
}

/**
 * Reclama cupo de founding member (2–50) y, si aplica, asigna Plan Plus + correo.
 * El cupo 1 está reservado manualmente (Belén).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ userId: string, email: string, nombre?: string, createdAt?: string }} params
 */
export async function maybeGrantFoundingMemberPlus(adminClient, { userId, email, nombre, createdAt }) {
  if (!adminClient || !userId || !email) {
    return { granted: false, reason: 'missing_params' };
  }
  if (!shouldAttemptFoundingPlus(createdAt)) {
    return { granted: false, reason: 'before_campaign' };
  }

  try {
    const slotNumber = await claimFoundingMemberSlot(adminClient, userId, email);
    if (!shouldGrantFoundingPlus(slotNumber)) {
      const reason = slotNumber === 1 ? 'slot_reserved' : 'no_slot_available';
      console.info(`[foundingMemberPlus] skip ${email}: ${reason} (slot=${slotNumber || 'none'})`);
      return {
        granted: false,
        slotNumber: slotNumber || null,
        reason,
      };
    }

    await assignUserPlan(adminClient, userId, PLUS_PLAN_SLUG);

    const alreadyEmailed = await hasFoundingPlusEmailBeenSent(adminClient, userId, email);
    if (alreadyEmailed) {
      return {
        granted: true,
        slotNumber,
        planSlug: PLUS_PLAN_SLUG,
        emailSent: false,
        reason: 'already_emailed',
      };
    }

    let emailSent = false;
    try {
      const mail = await dispatchAutomatedEmail({
        adminClient,
        triggerEvent: AUTOMATED_EMAIL_TRIGGERS.FOUNDING_MEMBER_PLUS_GRANTED,
        to: email,
        variables: {
          email,
          nombre: formatNombreVariable(nombre),
        },
      });
      emailSent = Boolean(mail?.sent || mail?.queued);
      if (emailSent) {
        await markFoundingPlusEmailSent(adminClient, userId);
      }
    } catch (mailErr) {
      console.error('[foundingMemberPlus] email:', mailErr);
    }

    return {
      granted: true,
      slotNumber,
      planSlug: PLUS_PLAN_SLUG,
      emailSent,
    };
  } catch (err) {
    console.error('[foundingMemberPlus]', err);
    return { granted: false, error: err?.message || 'unknown_error' };
  }
}

async function hasFoundingPlusEmailBeenSent(adminClient, userId, email) {
  const { data: grantRow } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .select('email_sent_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (grantRow?.email_sent_at) return true;

  const { data: logRow } = await adminClient
    .from('soporte_correos_log')
    .select('id')
    .eq('slug', 'founding_member_plus')
    .eq('destinatario', String(email).trim().toLowerCase())
    .eq('ok', true)
    .limit(1)
    .maybeSingle();
  return Boolean(logRow?.id);
}

async function markFoundingPlusEmailSent(adminClient, userId) {
  const { error } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .update({ email_sent_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error && !isMissingTableError(error)) {
    console.error('[foundingMemberPlus] mark email sent:', error);
  }
}

/**
 * Estadísticas públicas de cupos founding (sin datos personales).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 */
export async function getFoundingMemberSlotAvailability(adminClient) {
  if (!adminClient) {
    return computeFoundingSlotAvailability(0);
  }

  try {
    const { data: rpcData, error: rpcError } = await adminClient.rpc(
      'get_public_founding_slot_availability',
    );

    if (!rpcError && rpcData && typeof rpcData === 'object') {
      const claimed = Math.max(0, Number(rpcData.claimed) || 0);
      const remaining = Math.max(0, Number(rpcData.remaining) || 0);
      const total = Math.max(0, Number(rpcData.total) || MAX_FOUNDING_SLOT);
      return {
        total,
        claimed,
        remaining,
        soldOut: Boolean(rpcData.soldOut ?? remaining === 0),
      };
    }

    if (rpcError && !isMissingTableError(rpcError)) {
      console.error('[foundingMemberPlus] slot availability RPC:', rpcError);
    }

    const { data: maxRow, error: maxError } = await adminClient
      .from(FOUNDING_MEMBER_TABLE)
      .select('slot_number')
      .order('slot_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) {
      if (isMissingTableError(maxError)) {
        return computeFoundingSlotAvailability(0);
      }
      throw maxError;
    }

    return computeFoundingSlotAvailability(parseFoundingSlotNumber(maxRow?.slot_number) ?? 0);
  } catch (err) {
    console.error('[foundingMemberPlus] slot availability:', err);
    return computeFoundingSlotAvailability(0);
  }
}

async function claimFoundingMemberSlot(adminClient, userId, email) {
  const { data: rpcSlot, error: rpcError } = await adminClient.rpc('claim_founding_member_slot', {
    p_user_id: userId,
    p_email: email,
  });

  if (!rpcError) {
    const parsed = parseFoundingSlotNumber(rpcSlot);
    if (parsed) return parsed;
    console.error('[foundingMemberPlus] RPC returned unusable slot:', rpcSlot);
  } else if (!isMissingTableError(rpcError)) {
    throw rpcError;
  } else {
    console.error('[foundingMemberPlus] RPC unavailable, using table fallback:', rpcError.message || rpcError);
  }

  const { data: existing, error: existingError } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .select('slot_number')
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError && !isMissingTableError(existingError)) throw existingError;
  if (existing?.slot_number) return parseFoundingSlotNumber(existing.slot_number);

  const { data: maxRow, error: maxError } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .select('slot_number')
    .order('slot_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxError && !isMissingTableError(maxError)) throw maxError;

  const nextSlot = (parseFoundingSlotNumber(maxRow?.slot_number) || 0) + 1;
  if (nextSlot > MAX_FOUNDING_SLOT) return null;

  const { data: inserted, error: insertError } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .insert({ user_id: userId, slot_number: nextSlot, email: String(email).trim().toLowerCase() })
    .select('slot_number')
    .maybeSingle();

  if (insertError) {
    if (String(insertError.message || '').includes('duplicate') || insertError.code === '23505') {
      const { data: retry } = await adminClient
        .from(FOUNDING_MEMBER_TABLE)
        .select('slot_number')
        .eq('user_id', userId)
        .maybeSingle();
      return parseFoundingSlotNumber(retry?.slot_number);
    }
    throw insertError;
  }

  return parseFoundingSlotNumber(inserted?.slot_number) ?? nextSlot;
}
