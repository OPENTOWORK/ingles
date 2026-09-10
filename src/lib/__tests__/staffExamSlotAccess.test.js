import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bypassesExamStarGating } from '@/constants/studentFeatureAccess.js';
import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog.js';
import { isExerciseSlotUnlocked } from '@/utils/b2StarsWayProgress.js';

const NO_PROGRESS = {};
const SLOTS = Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);

describe('staff exam slot access', () => {
  it('lets teachers, coordinators and admins skip star gating', () => {
    for (const role of ['profesor', 'teacher', 'coordinador', 'admin', 'informatico', 'Resp.marketing']) {
      assert.equal(bypassesExamStarGating(role), true, role);
    }
    assert.equal(bypassesExamStarGating('alumno'), false);
  });

  it('opens every slot for staff even when their plan cap is 1', () => {
    for (const slot of SLOTS) {
      assert.equal(
        isExerciseSlotUnlocked(NO_PROGRESS, 1, slot, SLOTS, {
          bypassStarGating: true,
          maxExamSlot: 1,
        }),
        true,
        `slot ${slot}`,
      );
    }
  });

  it('still caps students at their plan slot and requires a star to advance', () => {
    const opts = { bypassStarGating: false, maxExamSlot: 10 };
    assert.equal(isExerciseSlotUnlocked(NO_PROGRESS, 1, 1, SLOTS, opts), true);
    assert.equal(isExerciseSlotUnlocked(NO_PROGRESS, 1, 2, SLOTS, opts), false);
    assert.equal(isExerciseSlotUnlocked(NO_PROGRESS, 1, 11, SLOTS, opts), false);
  });
});
