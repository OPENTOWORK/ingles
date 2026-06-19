import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

/**
 * Score persistence contexts for Levels practice.
 *
 * Exam mode and skill practice may share the same exam slot today, but they are
 * independent attempts. Never merge or overwrite scores across sources.
 */
export const LEVELS_SCORE_SOURCE = {
  SKILL_PRACTICE: 'skill_practice',
  EXAM_MODE: 'exam_mode',
};

/** Values stored in public."Levels_stars".exam_or_skill */
export const LEVELS_EXAM_OR_SKILL = {
  EXAM_MODE: 1,
  SKILL_PRACTICE: 2,
};

export function scoreSourceToExamOrSkill(scoreSource) {
  return scoreSource === LEVELS_SCORE_SOURCE.EXAM_MODE
    ? LEVELS_EXAM_OR_SKILL.EXAM_MODE
    : LEVELS_EXAM_OR_SKILL.SKILL_PRACTICE;
}

export function examOrSkillToScoreSource(examOrSkill) {
  return Number(examOrSkill) === LEVELS_EXAM_OR_SKILL.EXAM_MODE
    ? LEVELS_SCORE_SOURCE.EXAM_MODE
    : LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
}

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

/** URL ?examMode=1|review → exam mode scores; otherwise skill practice. */
export function resolvePracticeScoreSourceFromExamModeParam(examModeParam) {
  if (examModeParam === '1' || examModeParam === 'review') {
    return LEVELS_SCORE_SOURCE.EXAM_MODE;
  }
  return LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
}
