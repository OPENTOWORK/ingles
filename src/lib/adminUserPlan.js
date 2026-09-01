import { normalizeAdminAssignablePlanSlug } from '@/data/financialPlanConfig';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import {
  findSubscriptionByUserId,
  syncAuthPlanMetadata,
} from '@/lib/stripe/subscriptions';

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

const USER_PROFILES_TABLE = 'Usuarios_y_Perfil_users';

export async function assignUserPlan(db, userId, planSlug) {
  const normalized = normalizeAdminAssignablePlanSlug(planSlug);

  const { data: updatedRow, error } = await db
    .from(USER_PROFILES_TABLE)
    .update({ plan_id: normalized })
    .eq('id', userId)
    .select('id')
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

  await syncAuthPlanMetadata(db, userId, normalized);
  return resolveEffectivePlanForUser(db, userId, normalized);
}
