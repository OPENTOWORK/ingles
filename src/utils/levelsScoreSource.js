import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

/**
 * Score persistence contexts for Levels practice.
 *
 * Exam mode and skill practice may share the same exam slot today, but they are
 * independent attempts. Future versions may use different exam content per skill.
 * Never merge or overwrite scores across sources.
 *
 * When exam content is regenerated (admin), stale drafts must be dropped and both
 * modes must reload via levelsExamRegenerationSync (see notifyLevelsExamRegenerated).
 */
export const LEVELS_SCORE_SOURCE = {
  SKILL_PRACTICE: 'skill_practice',
  EXAM_MODE: 'exam_mode',
};

/** Legacy rows without a tag are treated as skill practice. */
export function resolveLevelsScoreSource(metaOrSource) {
  if (typeof metaOrSource === 'string' && metaOrSource) return metaOrSource;
  if (metaOrSource && typeof metaOrSource === 'object' && metaOrSource.scoreSource) {
    return metaOrSource.scoreSource;
  }
  return LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
}

export function rowMatchesScoreSource(row, scoreSource) {
  if (!row) return false;
  const meta = parseUoePartDescripcion(row.descripcion);
  return resolveLevelsScoreSource(meta) === scoreSource;
}

export function filterPuntuacionesByScoreSource(rows = [], scoreSource) {
  return rows.filter((row) => rowMatchesScoreSource(row, scoreSource));
}
