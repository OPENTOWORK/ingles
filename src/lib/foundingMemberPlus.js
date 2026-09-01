import { assignUserPlan } from '@/lib/adminUserPlan';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';

const FOUNDING_MEMBER_TABLE = 'founding_member_grants';
const MAX_FOUNDING_SLOT = 50;
const FIRST_AUTO_SLOT = 2;
const PLUS_PLAN_SLUG = 'premium';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('claim_founding_member_slot')
  );
}

/**
 * Reclama cupo de founding member (2–50) y, si aplica, asigna Plan Plus + correo.
 * El cupo 1 está reservado manualmente (Belén).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ userId: string, email: string, nombre?: string }} params
 */
export async function maybeGrantFoundingMemberPlus(adminClient, { userId, email, nombre }) {
  if (!adminClient || !userId || !email) {
    return { granted: false, reason: 'missing_params' };
  }

  try {
    const slotNumber = await claimFoundingMemberSlot(adminClient, userId, email);
    if (!slotNumber || slotNumber < FIRST_AUTO_SLOT || slotNumber > MAX_FOUNDING_SLOT) {
      return {
        granted: false,
        slotNumber: slotNumber || null,
        reason: slotNumber === 1 ? 'slot_reserved' : 'no_slot_available',
      };
    }

    await assignUserPlan(adminClient, userId, PLUS_PLAN_SLUG);

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

async function claimFoundingMemberSlot(adminClient, userId, email) {
  const { data: rpcSlot, error: rpcError } = await adminClient.rpc('claim_founding_member_slot', {
    p_user_id: userId,
    p_email: email,
  });

  if (!rpcError) {
    return typeof rpcSlot === 'number' ? rpcSlot : null;
  }

  if (!isMissingTableError(rpcError)) {
    throw rpcError;
  }

  // Fallback si la migración aún no está aplicada: lectura + inserción simple.
  const { data: existing } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .select('slot_number')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.slot_number) return existing.slot_number;

  const { data: maxRow } = await adminClient
    .from(FOUNDING_MEMBER_TABLE)
    .select('slot_number')
    .order('slot_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSlot = (maxRow?.slot_number || 0) + 1;
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
      return retry?.slot_number ?? null;
    }
    throw insertError;
  }

  return inserted?.slot_number ?? nextSlot;
}
