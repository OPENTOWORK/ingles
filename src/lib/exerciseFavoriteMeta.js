import { applyExamSlotToHref, getLevelSkillPracticeHref } from '@/data/nivelesLevelHub';

/**
 * @typedef {{
 *   title: string,
 *   heading?: string | null,
 *   levelSlug: string,
 *   skillRoute?: string | null,
 *   partNumber?: number | null,
 *   examSlot?: number | null,
 *   sectionTitle?: string | null,
 * }} ExerciseFavoriteMeta
 */

/** @param {ExerciseFavoriteMeta} meta */
export function serializeExerciseFavoriteMeta(meta) {
  return JSON.stringify({
    title: meta.title || 'Exercise',
    heading: meta.heading || null,
    levelSlug: meta.levelSlug || 'b2',
    skillRoute: meta.skillRoute || null,
    partNumber: meta.partNumber ?? null,
    examSlot: meta.examSlot ?? null,
    sectionTitle: meta.sectionTitle || null,
  });
}

/** @param {string | null | undefined} raw */
export function parseExerciseFavoriteMeta(raw) {
  if (!raw) return { title: 'Exercise' };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* legacy plain text */
  }
  return { title: String(raw) };
}

/** @param {ReturnType<typeof parseExerciseFavoriteMeta>} meta */
export function buildExerciseFavoritePracticeHref(meta) {
  const levelSlug = String(meta.levelSlug || 'b2').toLowerCase();
  const skillRoute = meta.skillRoute || null;
  const partNumber = Number(meta.partNumber);
  const examSlot = Number(meta.examSlot);

  let base =
    (skillRoute && getLevelSkillPracticeHref(levelSlug, skillRoute)) ||
    `/niveles/${levelSlug}`;

  if (Number.isFinite(partNumber) && partNumber > 0) {
    const sep = base.includes('?') ? '&' : '?';
    base = `${base}${sep}part=${partNumber}`;
  }

  if (Number.isFinite(examSlot) && examSlot > 1) {
    base = applyExamSlotToHref(base, levelSlug, examSlot);
  } else if (Number.isFinite(examSlot) && examSlot === 1) {
    const sep = base.includes('?') ? '&' : '?';
    if (!base.includes('examen=')) base = `${base}${sep}examen=1`;
  }

  return base;
}

/** @param {ExerciseFavoriteMeta} meta */
export function buildExerciseFavoriteMeta(meta) {
  return {
    title: meta.title || meta.heading || 'Exercise',
    heading: meta.heading || null,
    levelSlug: String(meta.levelSlug || 'b2').toLowerCase(),
    skillRoute: meta.skillRoute || null,
    partNumber: meta.partNumber ?? null,
    examSlot: meta.examSlot ?? null,
    sectionTitle: meta.sectionTitle || null,
  };
}
