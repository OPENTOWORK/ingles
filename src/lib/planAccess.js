/**
 * Plan efectivo del alumno + cuotas de uso (solo rol estudiante / alumno).
 */
import {
  authMetadataPlanSlug,
  getPlanBySlug,
  isPlusTierPlanSlug,
  normalizeAdminAssignablePlanSlug,
} from '@/data/financialPlanConfig';
import {
  getDraloAiDailyLimit,
  getDraloAiMonthlyLimit,
  getSpeakingCorrectionMonthlyLimit,
  getWritingCorrectionMonthlyLimit,
  hasEntitlement,
} from '@/lib/subscriptionPlans';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import { getSubscriptionsDb, findSubscriptionByUserId } from '@/lib/stripe/subscriptions';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import {
  hasFullNivelesLevelAccess,
  isStudentRole,
} from '@/constants/studentFeatureAccess';
import { ADMIN_EMAIL, normalizeEmail } from '@/utils/authRoles';
import {
  getMaxExamSlotForPlan as resolveMaxExamSlotForPlan,
  getPlusUnlockProgress,
  getSubscriptionTenureMonths,
} from '@/lib/plusExamUnlock';

import { PLAN_USAGE_KEYS } from '@/lib/planUsageKeys';

export { getMaxExamSlotForPlan } from '@/lib/plusExamUnlock';

export { PLAN_USAGE_KEYS };

function utcMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function utcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getDb() {
  return getSubscriptionsDb() || getSupabaseAdmin();
}

/** ¿Aplicar límites de plan? Solo estudiante/alumno; staff sin límites (incl. Resp.marketing). */
export async function shouldApplyPlanUsageLimits(userId, userEmail = '') {
  if (!userId) return false;
  if (normalizeEmail(userEmail) === normalizeEmail(ADMIN_EMAIL)) return false;

  const db = getDb();
  if (!db) return false;

  const role = await getUserRoleNameServer(userId, db);
  if (hasFullNivelesLevelAccess(role, userEmail)) return false;
  return isStudentRole(role);
}

/** Plan activo: suscripción Stripe viva → plan asignado en perfil → metadata JWT → free. */
export async function resolveUserPlanSlug(userId, userMetadata = null) {
  const db = getDb();
  if (db && userId) {
    const row = await findSubscriptionByUserId(db, userId);
    if (row && subscriptionGrantsAccess(row.status) && row.plan_id) {
      return normalizeAdminAssignablePlanSlug(row.plan_id);
    }

    const { data: profileRow } = await db
      .from('Usuarios_y_Perfil_users')
      .select('plan_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileRow?.plan_id) {
      return normalizeAdminAssignablePlanSlug(profileRow.plan_id);
    }
  }
  return authMetadataPlanSlug(userMetadata?.subscription_plan);
}

export function getPlanUsageLimit(planSlug, usageKey) {
  const slug = String(planSlug || 'free').toLowerCase();
  switch (usageKey) {
    case PLAN_USAGE_KEYS.WRITING_CORRECTION:
      return getWritingCorrectionMonthlyLimit(slug);
    case PLAN_USAGE_KEYS.SPEAKING_CORRECTION:
      return getSpeakingCorrectionMonthlyLimit(slug);
    case PLAN_USAGE_KEYS.EXAM_SESSION: {
      // PLUS / Friendly PLUS: el cupo lo marca el desbloqueo progresivo de slots.
      if (isPlusTierPlanSlug(slug) || slug === 'pro' || slug === 'friendly_premium') return Infinity;
      const n = getPlanBySlug(slug).entitlements.examsPerMonth;
      return n == null ? Infinity : n;
    }
    case PLAN_USAGE_KEYS.DRALO_ASSISTANT: {
      const monthly = getDraloAiMonthlyLimit(slug);
      if (monthly !== Infinity) {
        return { periodType: 'month', limit: monthly };
      }
      const daily = getDraloAiDailyLimit(slug);
      if (daily === Infinity) return { periodType: 'month', limit: Infinity };
      if (daily > 0) return { periodType: 'day', limit: daily };
      return { periodType: 'month', limit: 0 };
    }
    default:
      return Infinity;
  }
}

async function resolvePlusSubscriptionAnchor(userId, planSlug) {
  const slug = String(planSlug || 'free').toLowerCase();
  if (!isPlusTierPlanSlug(slug)) return null;

  const db = getDb();
  if (!db || !userId) return null;

  const sub = await findSubscriptionByUserId(db, userId);
  if (sub?.created_at && subscriptionGrantsAccess(sub.status)) {
    return sub.created_at;
  }

  const { data: profileRow } = await db
    .from('Usuarios_y_Perfil_users')
    .select('creado_en, plan_id')
    .eq('id', userId)
    .maybeSingle();

  if (isPlusTierPlanSlug(normalizeAdminAssignablePlanSlug(profileRow?.plan_id))) {
    return profileRow?.creado_en || null;
  }

  return null;
}

export function canAccessExamSlot(planSlug, examSlot, { maxExamSlot } = {}) {
  const slot = Number(examSlot) || 1;
  const cap = maxExamSlot ?? resolveMaxExamSlotForPlan(planSlug);
  return slot >= 1 && slot <= cap;
}

async function readUsageCount(db, userId, usageKey, periodType, periodKey) {
  const { data, error } = await db
    .from('plan_usage_counters')
    .select('count')
    .eq('user_id', userId)
    .eq('usage_key', usageKey)
    .eq('period_type', periodType)
    .eq('period_key', periodKey)
    .maybeSingle();

  if (error) {
    console.warn('[planAccess] readUsageCount', error.message);
    return 0;
  }
  return Number(data?.count) || 0;
}

function resolvePeriod(usageKey, limitSpec) {
  if (usageKey === PLAN_USAGE_KEYS.DRALO_ASSISTANT && limitSpec && typeof limitSpec === 'object') {
    const periodType = limitSpec.periodType === 'day' ? 'day' : 'month';
    const periodKey = periodType === 'day' ? utcDayKey() : utcMonthKey();
    return { periodType, periodKey, limit: limitSpec.limit };
  }
  return { periodType: 'month', periodKey: utcMonthKey(), limit: limitSpec };
}

/** Comprueba cuota sin consumir. */
export async function checkPlanUsage(userId, usageKey, planSlug) {
  const limitSpec = getPlanUsageLimit(planSlug, usageKey);
  if (limitSpec === Infinity || limitSpec?.limit === Infinity) {
    return { allowed: true, unlimited: true, limit: null, used: null };
  }

  const { periodType, periodKey, limit } = resolvePeriod(usageKey, limitSpec);
  if (limit == null || limit <= 0) {
    return { allowed: false, code: 'PLAN_FEATURE_LOCKED', limit: 0, used: 0 };
  }

  const db = getDb();
  if (!db) {
    return { allowed: false, code: 'LIMIT_CHECK_FAILED', limit, used: null };
  }

  const used = await readUsageCount(db, userId, usageKey, periodType, periodKey);
  if (used >= limit) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      limit,
      used,
      periodType,
      periodKey,
    };
  }
  return { allowed: true, limit, used, periodType, periodKey };
}

/** Reserva un uso (atómico, mismo patrón que ai_usage_daily_limits). */
export async function consumePlanUsage(userId, usageKey, planSlug) {
  const check = await checkPlanUsage(userId, usageKey, planSlug);
  if (!check.allowed) return check;
  if (check.unlimited) return { ...check, consumed: false };

  const db = getDb();
  if (!db) {
    return { allowed: false, code: 'LIMIT_CHECK_FAILED', limit: check.limit, used: check.used };
  }

  const { periodType, periodKey, limit } = check;
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const used = await readUsageCount(db, userId, usageKey, periodType, periodKey);
    if (used >= limit) {
      return { allowed: false, code: 'PLAN_LIMIT_REACHED', limit, used, periodType, periodKey };
    }

    const { data: existing } = await db
      .from('plan_usage_counters')
      .select('id, count')
      .eq('user_id', userId)
      .eq('usage_key', usageKey)
      .eq('period_type', periodType)
      .eq('period_key', periodKey)
      .maybeSingle();

    if (existing?.id) {
      const rowCount = Number(existing.count) || 0;
      const nextCount = rowCount + 1;
      const { data: updated, error } = await db
        .from('plan_usage_counters')
        .update({ count: nextCount, updated_at: now })
        .eq('id', existing.id)
        .eq('count', rowCount)
        .select('count')
        .maybeSingle();
      if (!error && updated) {
        return { allowed: true, limit, used: updated.count, periodType, periodKey, consumed: true };
      }
      if (error) {
        console.error('[planAccess] consumePlanUsage update', error.message, error.code);
      }
      continue;
    }

    const nextCount = used + 1;
    const { data: inserted, error } = await db
      .from('plan_usage_counters')
      .insert({
        user_id: userId,
        usage_key: usageKey,
        period_type: periodType,
        period_key: periodKey,
        count: nextCount,
        updated_at: now,
      })
      .select('count')
      .maybeSingle();

    if (!error && inserted) {
      return { allowed: true, limit, used: inserted.count, periodType, periodKey, consumed: true };
    }
    if (error) {
      console.error('[planAccess] consumePlanUsage insert', error.message, error.code, {
        userId,
        usageKey,
        periodType,
        periodKey,
      });
    }
    if (error?.code !== '23505') break;
  }

  return { allowed: false, code: 'LIMIT_CHECK_FAILED', limit: check.limit, used: check.used };
}

export async function getPlanUsageSnapshot(userId, usageKey, planSlug) {
  const check = await checkPlanUsage(userId, usageKey, planSlug);
  if (check.unlimited) {
    return { usageKey, unlimited: true, limit: null, used: null, remaining: null, atLimit: false };
  }
  const used = check.used ?? 0;
  const limit = check.limit ?? 0;
  const atLimit = !check.allowed && check.code === 'PLAN_LIMIT_REACHED';
  return {
    usageKey,
    unlimited: false,
    limit,
    used,
    remaining: limit > 0 ? Math.max(0, limit - used) : 0,
    atLimit: atLimit || (limit > 0 && used >= limit),
    periodType: check.periodType || 'month',
  };
}

export async function getStudentPlanContext(userId, userEmail = '', userMetadata = null) {
  const planSlug = await resolveUserPlanSlug(userId, userMetadata);
  const applyLimits = await shouldApplyPlanUsageLimits(userId, userEmail);
  const subscriptionAnchor = await resolvePlusSubscriptionAnchor(userId, planSlug);
  const subscriptionMonths = getSubscriptionTenureMonths(subscriptionAnchor);
  const maxExamSlot = resolveMaxExamSlotForPlan(planSlug, { subscriptionMonths });
  const plusExamUnlock = isPlusTierPlanSlug(planSlug)
      ? getPlusUnlockProgress(subscriptionMonths)
      : null;

  return {
    planSlug,
    applyLimits,
    entitlements: getPlanBySlug(planSlug).entitlements,
    maxExamSlot,
    subscriptionMonths: isPlusTierPlanSlug(planSlug) ? subscriptionMonths : null,
    plusExamUnlock,
    progressTracking: getPlanBySlug(planSlug).entitlements.progressTracking === 'advanced',
    writingAdvanced: hasEntitlement(planSlug, 'writingAdvanced'),
    speakingCoach: hasEntitlement(planSlug, 'speakingCoach'),
  };
}

export async function getStudentPlanUsageBundle(userId, planSlug) {
  const keys = Object.values(PLAN_USAGE_KEYS);
  const entries = await Promise.all(
    keys.map(async (usageKey) => [usageKey, await getPlanUsageSnapshot(userId, usageKey, planSlug)]),
  );
  return Object.fromEntries(entries);
}
