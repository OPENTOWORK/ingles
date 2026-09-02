/**
 * Desbloqueo progresivo de exámenes B2 para plan PLUS (slug `premium`).
 * Mes 1 → exámenes 1–10, mes 2 → 11–20, etc., hasta completar el catálogo.
 */
import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';
import { isPlusTierPlanSlug } from '@/data/financialPlanConfig';

export const PLUS_EXAMS_UNLOCK_BATCH = 10;

/**
 * Meses de suscripción (1-based) desde la fecha ancla.
 * Mismo mes calendario UTC que el alta = mes 1.
 */
export function getSubscriptionTenureMonths(anchorIso, now = new Date()) {
  if (!anchorIso) return 1;
  const start = new Date(anchorIso);
  if (Number.isNaN(start.getTime())) return 1;
  const months =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - start.getUTCMonth()) +
    1;
  return Math.max(1, months);
}

export function getPlusMaxExamSlot(subscriptionMonths, catalogMax = B2_EXAM_SLOT_MAX) {
  const months = Math.max(1, Number(subscriptionMonths) || 1);
  return Math.min(months * PLUS_EXAMS_UNLOCK_BATCH, catalogMax);
}

/**
 * @param {string} planSlug
 * @param {{ subscriptionMonths?: number | null }} [options]
 */
export function getMaxExamSlotForPlan(planSlug, { subscriptionMonths = null } = {}) {
  const slug = String(planSlug || 'free').toLowerCase();
  if (slug === 'free') return 1;
  if (isPlusTierPlanSlug(slug)) {
    return getPlusMaxExamSlot(subscriptionMonths ?? 1);
  }
  return B2_EXAM_SLOT_MAX;
}

export function getPlusUnlockProgress(subscriptionMonths, catalogMax = B2_EXAM_SLOT_MAX) {
  const months = Math.max(1, Number(subscriptionMonths) || 1);
  const maxSlot = getPlusMaxExamSlot(months, catalogMax);
  const fullyUnlocked = maxSlot >= catalogMax;
  return {
    subscriptionMonths: months,
    maxSlot,
    batchSize: PLUS_EXAMS_UNLOCK_BATCH,
    fullyUnlocked,
    nextUnlockAtMonth: fullyUnlocked ? null : months + 1,
    nextUnlockSlotStart: fullyUnlocked ? null : maxSlot + 1,
    nextUnlockSlotEnd: fullyUnlocked
      ? null
      : Math.min(maxSlot + PLUS_EXAMS_UNLOCK_BATCH, catalogMax),
  };
}
