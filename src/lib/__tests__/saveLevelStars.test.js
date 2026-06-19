import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS_EXAM_OR_SKILL,
  LEVELS_SCORE_SOURCE,
  examOrSkillToScoreSource,
  scoreSourceToExamOrSkill,
} from '@/utils/levelsScoreSource';
import {
  computeLevelsStarsFromProgress,
  labelFromLevelsPuntuacionDescripcion,
} from '@/utils/levelsStars';

test('scoreSourceToExamOrSkill maps exam_mode and skill_practice', () => {
  assert.equal(scoreSourceToExamOrSkill(LEVELS_SCORE_SOURCE.EXAM_MODE), LEVELS_EXAM_OR_SKILL.EXAM_MODE);
  assert.equal(
    scoreSourceToExamOrSkill(LEVELS_SCORE_SOURCE.SKILL_PRACTICE),
    LEVELS_EXAM_OR_SKILL.SKILL_PRACTICE,
  );
  assert.equal(scoreSourceToExamOrSkill('unknown'), LEVELS_EXAM_OR_SKILL.SKILL_PRACTICE);
});

test('examOrSkillToScoreSource round-trips', () => {
  assert.equal(examOrSkillToScoreSource(1), LEVELS_SCORE_SOURCE.EXAM_MODE);
  assert.equal(examOrSkillToScoreSource(2), LEVELS_SCORE_SOURCE.SKILL_PRACTICE);
});

test('labelFromLevelsPuntuacionDescripcion extracts pipe suffix', () => {
  const desc = 'uoe_meta:{"v":1}|Part 3 · 12/20 · passed';
  assert.equal(labelFromLevelsPuntuacionDescripcion(desc), 'Part 3 · 12/20 · passed');
});

test('computeLevelsStarsFromProgress uses V2 points when present', () => {
  assert.equal(
    computeLevelsStarsFromProgress({
      scoringVersion: 2,
      puntosObtenidos: 10,
      puntosMaximos: 20,
    }),
    2,
  );
});
