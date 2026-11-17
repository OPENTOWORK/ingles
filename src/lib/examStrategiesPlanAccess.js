import { isPlusTierPlanSlug, isProTierPlanSlug } from '@/data/financialPlanConfig';
import { normalizeGuestPath } from '@/lib/guestPreviewAccess';

const SKILL_INDEX =
  /^\/(exam-strategies|teoria\/exam-strategies)\/(reading-and-use-of-english|writing|listening|speaking)$/;

/** Plus y el antiguo Premium abren Exam Strategies entero. El resto, solo la parte 1. */
export function isExamStrategiesFirstPartOnlyPlan(planSlug) {
  return !isPlusTierPlanSlug(planSlug) && !isProTierPlanSlug(planSlug);
}

/**
 * El plan gratuito puede abrir el índice y la parte 1 de cada nivel y skill.
 * Overall strategy y el resto de partes quedan fuera.
 */
export function isFreeExamStrategiesPathAllowed(pathname = '') {
  const path = normalizeGuestPath(pathname);
  if (path === '/exam-strategies' || path === '/exam-theory' || path === '/teoria/exam-strategies') {
    return true;
  }
  if (SKILL_INDEX.test(path)) return true;
  return (
    /\/exam-part-tips\/[a-z0-9-]+\/[a-z0-9-]+\/(?:part-)?1$/.test(path) ||
    /\/(?:exam-practice|niveles)\/[a-z0-9-]+\/[a-z0-9-]+\/part-1$/.test(path) ||
    /\/(?:exam-practice|niveles)\/[a-z0-9-]+\/(?:listening|speaking)\/1$/.test(path)
  );
}
