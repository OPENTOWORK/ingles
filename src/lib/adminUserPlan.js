import { randomBytes } from 'node:crypto';
import { normalizeAdminAssignablePlanSlug } from '@/data/financialPlanConfig';
import { FIRST_AUTO_SLOT, MAX_FOUNDING_SLOT } from '@/lib/foundingMemberPlus.rules';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import {
  findSubscriptionByUserId,
  syncAuthPlanMetadata,
} from '@/lib/stripe/subscriptions';

const USER_PROFILES_TABLE = 'Usuarios_y_Perfil_users';
const FOUNDING_GRANTS_TABLE = 'founding_member_grants';
const FOUNDING_SURVEY_TABLE = 'founding_member_encuestas';

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
 * El trigger `preserve_founding_member_plus` devuelve `premium` mientras el
 * founding no tenga `plan_revocado_en`. El admin tiene que marcar eso antes
 * de bajar a FREE.
 */
async function releaseFoundingPlusLock(db, userId) {
  const { data: grant, error: grantError } = await db
    .from(FOUNDING_GRANTS_TABLE)
    .select('slot_number, email')
    .eq('user_id', userId)
    .maybeSingle();

  if (grantError) {
    if (isMissingTableError(grantError)) return;
    throw new Error(grantError.message || 'No se pudo leer el cupo founding.');
  }

  const slot = Number(grant?.slot_number);
  if (!Number.isInteger(slot) || slot < FIRST_AUTO_SLOT || slot > MAX_FOUNDING_SLOT) {
    return;
  }

  const now = new Date().toISOString();
  const { data: survey, error: surveyError } = await db
    .from(FOUNDING_SURVEY_TABLE)
    .select('id, plan_revocado_en')
    .eq('user_id', userId)
    .maybeSingle();

  if (surveyError) {
    if (isMissingTableError(surveyError)) return;
    throw new Error(surveyError.message || 'No se pudo leer la encuesta founding.');
  }

  if (survey?.plan_revocado_en) return;

  if (survey?.id) {
    const { error: markError } = await db
      .from(FOUNDING_SURVEY_TABLE)
      .update({
        plan_revocado_en: now,
        revocacion_omitida_motivo: 'admin',
      })
      .eq('id', survey.id);
    if (markError) {
      throw new Error(markError.message || 'No se pudo revocar el Plus founding.');
    }
    return;
  }

  const { data: profile } = await db
    .from(USER_PROFILES_TABLE)
    .select('email')
    .eq('id', userId)
    .maybeSingle();

  const { error: insertError } = await db.from(FOUNDING_SURVEY_TABLE).insert({
    user_id: userId,
    slot_number: slot,
    email: grant.email || profile?.email || '',
    token: randomBytes(24).toString('base64url'),
    plan_revocado_en: now,
    revocacion_omitida_motivo: 'admin',
  });
  if (insertError && !isMissingTableError(insertError)) {
    throw new Error(insertError.message || 'No se pudo revocar el Plus founding.');
  }
}

export async function resolveEffectivePlanForUser(db, userId, assignedPlanSlug = 'free') {
  const sub = await findSubscriptionByUserId(db, userId);
  if (sub && subscriptionGrantsAccess(sub.status) && sub.plan_id) {
    return {
      planSlug: normalizeAdminAssignablePlanSlug(sub.plan_id),
      assignedPlanSlug: normalizeAdminAssignablePlanSlug(assignedPlanSlug),
      source: 'stripe',
      stripeStatus: sub.status,
    };
  }

  const slug = normalizeAdminAssignablePlanSlug(assignedPlanSlug);
  return {
    planSlug: slug,
    assignedPlanSlug: slug,
    source: 'admin',
    stripeStatus: sub?.status || null,
  };
}

export async function assignUserPlan(db, userId, planSlug) {
  const normalized = normalizeAdminAssignablePlanSlug(planSlug);

  if (normalized === 'free') {
    await releaseFoundingPlusLock(db, userId);
  }

  const { data: updatedRow, error } = await db
    .from(USER_PROFILES_TABLE)
    .update({ plan_id: normalized })
    .eq('id', userId)
    .select('id, plan_id')
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'No se pudo actualizar el plan del usuario.');
  }

  if (!updatedRow) {
    const { error: upsertError } = await db.from(USER_PROFILES_TABLE).upsert(
      { id: userId, plan_id: normalized },
      { onConflict: 'id' },
    );
    if (upsertError) {
      throw new Error(upsertError.message || 'No se pudo crear el perfil del usuario.');
    }
  }

  const { data: stored } = await db
    .from(USER_PROFILES_TABLE)
    .select('plan_id')
    .eq('id', userId)
    .maybeSingle();
  const storedSlug = normalizeAdminAssignablePlanSlug(stored?.plan_id || normalized);
  if (storedSlug !== normalized) {
    throw new Error(
      'El plan no se ha guardado. Si es founding Plus, vuelve a elegir FREE o avisa a informática.',
    );
  }

  await syncAuthPlanMetadata(db, userId, storedSlug);
  return resolveEffectivePlanForUser(db, userId, storedSlug);
}
