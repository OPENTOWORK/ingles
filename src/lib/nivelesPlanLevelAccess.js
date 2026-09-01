import {
  getPlanBySlug,
  isLevelIncludedInPlan,
  minPlanForLevel,
} from '@/data/financialPlanConfig';

/**
 * Si el plan del alumno no incluye el nivel, devuelve el plan mínimo requerido.
 * @returns {{ level: string, requiredPlanSlug: string, requiredPlanName: string } | null}
 */
export function getNivelesLevelPlanLock(level, planSlug = 'free') {
  const levelSlug = String(level || '').toLowerCase();
  if (!levelSlug) return null;
  if (isLevelIncludedInPlan(levelSlug, planSlug)) return null;

  const requiredPlanSlug = minPlanForLevel(levelSlug);
  const requiredPlan = getPlanBySlug(requiredPlanSlug);
  return {
    level: levelSlug.toUpperCase(),
    requiredPlanSlug,
    requiredPlanName: requiredPlan?.nombre || requiredPlanSlug.toUpperCase(),
  };
}
