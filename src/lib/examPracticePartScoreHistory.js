import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';
import { getLevelSkillPracticeHref } from '@/data/nivelesLevelHub';

const LOWEST_SCORES_LIMIT = 5;

function scoreRatio(entry) {
  if (!entry?.total) return 0;
  return entry.correct / entry.total;
}

function compareLowestScores(a, b) {
  const ratioDiff = scoreRatio(a) - scoreRatio(b);
  if (ratioDiff !== 0) return ratioDiff;
  if (a.correct !== b.correct) return a.correct - b.correct;
  return a.slot - b.slot;
}

export function getSkillPartExerciseHref({ levelSlug, skillRoute, partNumber, examSlot }) {
  const base = getLevelSkillPracticeHref(levelSlug, skillRoute);
  const part = Number(partNumber);
  const slot = Number(examSlot);
  if (!base || !part || !slot) return null;

  const params = new URLSearchParams();
  params.set('part', String(part));
  params.set('examen', String(slot));
  return `${base}?${params.toString()}`;
}

/**
 * Saved scores for one part across skill-practice exercise variants (slots).
 * Returns up to five exercises with the lowest score ratio.
 */
export function collectPartScoresAcrossSlots(
  progressBySlot,
  partNumber,
  { examSlot, lang = 'en', limit = LOWEST_SCORES_LIMIT } = {},
) {
  if (!partNumber || !progressBySlot) return [];

  const entries = [];

  for (const [slotKey, slotData] of Object.entries(progressBySlot)) {
    const slot = Number(slotKey);
    if (!Number.isFinite(slot)) continue;

    const saved = slotData?.parts?.[partNumber];
    if (!saved?.total) continue;

    entries.push({
      slot,
      label: formatSkillExerciseLabel(slot, lang) || `Test ${slot}`,
      correct: saved.correct,
      total: saved.total,
      passed: saved.passed,
      isCurrent: slot === examSlot,
    });
  }

  return entries.sort(compareLowestScores).slice(0, limit);
}
