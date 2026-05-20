import { THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import { shouldApplySequentialLock } from '@/lib/theoryLockConfig';

const COMPLETE_PERCENT = 100;

export const THEORY_SECTION_SLUGS = THEORY_SECTION_CATALOG.map((area) => area.slug);

export function isTheorySectionSlug(slug) {
  return THEORY_SECTION_SLUGS.includes(slug);
}

export function getTheorySectionKeyBySlug(sectionSlug) {
  return THEORY_SECTION_CATALOG.find((area) => area.slug === sectionSlug)?.key ?? null;
}

export function getTheoryApartadoFromPathname(pathname) {
  if (!pathname?.startsWith('/teoria/')) return null;
  const segment = pathname.replace(/^\/teoria\//, '').split('/')[0];
  return isTheorySectionSlug(segment) ? segment : null;
}

function unitsBySlug(units = []) {
  return Object.fromEntries((units || []).map((unit) => [unit.slug, unit]));
}

export function getTeoriaApartadoUnlockStates(units = [], isStudent = false) {
  const bySlug = unitsBySlug(units);
  const lockActive = shouldApplySequentialLock(isStudent);

  return THEORY_SECTION_CATALOG.map((area, index) => {
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

    const previous = THEORY_SECTION_CATALOG[index - 1];
    const previousPercent = bySlug[previous.slug]?.percent ?? 0;

    return {
      slug: area.slug,
      key: area.key,
      locked: previousPercent < COMPLETE_PERCENT,
      requiredPrevious: previous.key,
      partNumber: index + 1,
    };
  });
}

export function isTeoriaApartadoLocked(slug, units = [], isStudent = false) {
  if (!shouldApplySequentialLock(isStudent) || !isTheorySectionSlug(slug)) return false;
  const state = getTeoriaApartadoUnlockStates(units, true).find((item) => item.slug === slug);
  return state?.locked ?? false;
}

export function getTeoriaApartadoUnlockInfo(slug, units = [], isStudent = false) {
  return getTeoriaApartadoUnlockStates(units, isStudent).find((item) => item.slug === slug) ?? null;
}
