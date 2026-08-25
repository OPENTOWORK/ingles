/**
 * Helpers de suscripción (entitlements, límites Dralo AI, Stripe-ready slugs).
 */
import {
  DRALO_SUBSCRIPTION_PLANS,
  getPlanBySlug,
  planSlugFromDbRow,
  planMeetsMinimum,
  isLevelIncludedInPlan,
  authMetadataPlanSlug,
} from '@/data/financialPlanConfig';

export {
  DRALO_SUBSCRIPTION_PLANS,
  getPlanBySlug,
  planSlugFromDbRow,
  planMeetsMinimum,
  isLevelIncludedInPlan,
  authMetadataPlanSlug,
};

export function getDraloAiDailyLimit(planSlug) {
  const e = getPlanBySlug(planSlug).entitlements;
  if (e.draloAiDaily == null) {
    // Planes con cupo mensual (p. ej. FREE) no tienen límite diario.
    return e.draloAiMonthly != null ? 0 : Infinity;
  }
  return e.draloAiDaily;
}

export function getDraloAiMonthlyLimit(planSlug) {
  const n = getPlanBySlug(planSlug).entitlements.draloAiMonthly;
  return n == null ? Infinity : n;
}

export function getWritingCorrectionMonthlyLimit(planSlug) {
  const plan = getPlanBySlug(planSlug);
  const n = plan.entitlements.writingCorrectionMonthly;
  return n == null ? Infinity : n;
}

export function getSpeakingCorrectionMonthlyLimit(planSlug) {
  const plan = getPlanBySlug(planSlug);
  const n = plan.entitlements.speakingCorrectionMonthly;
  return n == null ? Infinity : n;
}

export function getSpeakingMissionsDailyLimit(planSlug) {
  const plan = getPlanBySlug(planSlug);
  const n = plan.entitlements.speakingMissionsDaily;
  return n == null ? Infinity : n;
}

export function monthlyLimitLabel(n) {
  if (n == null || n === Infinity) return 'Ilimitadas';
  return `${n}/mes`;
}

export function dailyLimitLabel(n) {
  if (n == null || n === Infinity) return 'Ilimitadas';
  return `${n}/día`;
}

export function speakingMissionsLimitLabel(planSlug) {
  const n = getSpeakingMissionsDailyLimit(planSlug);
  return n === Infinity ? 'Ilimitadas' : `${n} misiones/día`;
}

export function hasEntitlement(planSlug, key) {
  const plan = getPlanBySlug(planSlug);
  const e = plan.entitlements;
  switch (key) {
    case 'writingBasic':
      return Boolean(e.writingBasic);
    case 'writingAdvanced':
      return Boolean(e.writingAdvanced);
    case 'speakingCoach':
      return Boolean(e.speakingCoach);
    case 'placementTest':
      return Boolean(e.placementTest);
    case 'priorityAccess':
      return Boolean(e.priorityAccess);
    case 'prioritySupport':
      return Boolean(e.prioritySupport);
    default:
      return false;
  }
}

export function examsLimitLabel(planSlug) {
  const n = getPlanBySlug(planSlug).entitlements.examsPerMonth;
  if (n == null) return 'Ilimitados';
  if (n === 1) return '1';
  return `${n} exámenes al mes`;
}

export function rowToDbInsert(plan) {
  return {
    nombre: plan.nombre,
    descripcion: plan.descripcion,
    precio: plan.precio,
    duracion_dias: plan.duracion_dias,
    activo: plan.activo !== false,
    slug: plan.slug,
    badge: plan.badge,
    orden: plan.orden ?? 0,
    stripe_price_id: plan.stripe_price_id || null,
    metadata: {
      descripcion_corta: plan.descripcionCorta,
      entitlements: plan.entitlements,
      badge_variant: plan.badgeVariant,
      recommended: plan.recommended,
    },
  };
}
