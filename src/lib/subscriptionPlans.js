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
  const plan = getPlanBySlug(planSlug);
  const n = plan.entitlements.draloAiDaily;
  return n == null ? Infinity : n;
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
    case 'aiPersonalTutor':
      return Boolean(e.aiPersonalTutor);
    case 'pronunciationCoach':
      return Boolean(e.pronunciationCoach);
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
  return n == null ? 'Ilimitados' : String(n);
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
