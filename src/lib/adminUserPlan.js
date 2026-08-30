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

export async function assignUserPlan(db, userId, planSlug) {
  const normalized = normalizeAdminAssignablePlanSlug(planSlug);
  const tables = ['Usuarios_y_Perfil_users', 'user_profiles'];
  let lastError = null;
  let updated = false;

  for (const table of tables) {
    const { error } = await db.from(table).update({ plan_id: normalized }).eq('id', userId);
    if (!error) {
      updated = true;
      break;
    }
    lastError = error;
    const message = String(error.message || '');
    if (!message.includes('plan_id') && !message.includes('column')) {
      break;
    }
  }

  if (!updated) {
    throw new Error(lastError?.message || 'No se pudo actualizar el plan del usuario.');
  }

  await syncAuthPlanMetadata(db, userId, normalized);
  return resolveEffectivePlanForUser(db, userId, normalized);
}
