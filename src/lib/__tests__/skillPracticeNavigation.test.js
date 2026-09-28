import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canGoToPreviousExercise,
  getNextExamSlot,
  getPreviousExamSlot,
  runBackExerciseSkillFlow,
} from '@/utils/skillPracticeNavigation.js';

describe('skill practice previous / next test', () => {
  it('goes back from test 2 to test 1 even when the catalog omits slot 1', () => {
    const catalog = { 2: 'exam-2', 3: 'exam-3' };
    assert.equal(getPreviousExamSlot(2, catalog), 1);
    assert.equal(getPreviousExamSlot('2', catalog), 1);
    assert.equal(canGoToPreviousExercise(2, catalog), true);
    assert.equal(canGoToPreviousExercise(1, catalog), false);
  });

  it('uses catalog order when both slots exist', () => {
    const catalog = { 1: 'exam-1', 2: 'exam-2', 3: 'exam-3' };
    assert.equal(getPreviousExamSlot(2, catalog), 1);
    assert.equal(getNextExamSlot(1, catalog), 2);
  });

  it('selects the previous slot from Previous test', () => {
    let selected = null;
    const ok = runBackExerciseSkillFlow({
      examSlot: 2,
      examenIdBySlot: { 2: 'exam-2' },
      onSelectExamSlot: (slot) => {
        selected = slot;
      },
    });
    assert.equal(ok, true);
    assert.equal(selected, 1);
  });
});
