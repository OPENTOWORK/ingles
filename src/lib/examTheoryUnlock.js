import { EXAM_THEORY_CATALOG } from '@/data/teoriaSections';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import { shouldApplySequentialLock } from '@/lib/theoryLockConfig';

const COMPLETE_PERCENT = 100;

export const EXAM_THEORY_SLUGS = EXAM_THEORY_CATALOG.map((area) => area.slug);

export function isExamTheorySectionSlug(slug) {
  return EXAM_THEORY_SLUGS.includes(slug);
}

/** Slug de unidad (use-of-english, reading, …) a partir de la ruta /teoria/… */
export function getExamUnitSlugFromPathname(pathname) {
  if (!pathname?.startsWith('/teoria/')) return null;

  const segment = pathname.replace(/^\/teoria\//, '').split('/')[0];
  if (isExamTheorySectionSlug(segment)) return segment;

  return findExamUnitSlugForTopicHref(pathname);
}

function unitsBySlug(units = []) {
  return Object.fromEntries((units || []).map((unit) => [unit.slug, unit]));
}

/** Estado de bloqueo por unidad (solo aplica lógica si isStudent). */
export function getExamTheoryUnlockStates(units = [], isStudent = false) {
  const bySlug = unitsBySlug(units);
  const lockActive = shouldApplySequentialLock(isStudent);

  return EXAM_THEORY_CATALOG.map((area, index) => {
    if (!lockActive) {
      return {
        slug: area.slug,
        key: area.key,
        locked: false,
        requiredPrevious: null,
        partNumber: index + 1,
      };
    }

    if (index === 0) {
      return {
        slug: area.slug,
        key: area.key,
        locked: false,
        requiredPrevious: null,
        partNumber: 1,
      };
    }

    const previous = EXAM_THEORY_CATALOG[index - 1];
    const previousPercent = bySlug[previous.slug]?.percent ?? 0;
    const unlocked = previousPercent >= COMPLETE_PERCENT;

    return {
      slug: area.slug,
      key: area.key,
      locked: !unlocked,
      requiredPrevious: previous.key,
      partNumber: index + 1,
    };
  });
}

export function isExamTheorySlugLocked(slug, units = [], isStudent = false) {
  if (!shouldApplySequentialLock(isStudent) || !isExamTheorySectionSlug(slug)) return false;
  const state = getExamTheoryUnlockStates(units, true).find((item) => item.slug === slug);
  return state?.locked ?? false;
}

export function getExamTheoryUnlockInfo(slug, units = [], isStudent = false) {
  return getExamTheoryUnlockStates(units, isStudent).find((item) => item.slug === slug) ?? null;
}
