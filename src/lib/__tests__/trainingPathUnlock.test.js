import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isGuestTrainingLevelLocked,
  isGuestTrainingReviewLocked,
  isTrainingLevelLocked,
} from '../trainingPathUnlock.js';

test('a student needs two stars on the previous level', () => {
  assert.equal(isTrainingLevelLocked(1, {}, 'student', 25), false);
  assert.equal(isTrainingLevelLocked(2, {}, 'student', 25), true);
  assert.equal(isTrainingLevelLocked(2, { 'level-1': 2 }, 'student', 25), false);
  assert.equal(isTrainingLevelLocked(3, { 'level-1': 3 }, 'alumno', 25), true);
});

test('an admin can open any level inside the path', () => {
  assert.equal(isTrainingLevelLocked(12, {}, 'admin', 25), false);
  assert.equal(isTrainingLevelLocked(25, {}, 'administrador', 25), false);
  assert.equal(isTrainingLevelLocked(26, {}, 'admin', 25), true);
});

test('a guest needs one star on the previous level', () => {
  assert.equal(isGuestTrainingLevelLocked(1, {}, 25), false);
  assert.equal(isGuestTrainingLevelLocked(2, {}, 25), true);
  assert.equal(isGuestTrainingLevelLocked(2, { 'level-1': 1 }, 25), false);
  assert.equal(isGuestTrainingLevelLocked(3, { 'level-1': 1 }, 25), true);
  assert.equal(isGuestTrainingLevelLocked(3, { 'level-1': 1, 'level-2': 1 }, 25), false);
  assert.equal(isGuestTrainingReviewLocked({ to: 5 }, { 'level-5': 0 }), true);
  assert.equal(isGuestTrainingReviewLocked({ to: 5 }, { 'level-5': 1 }), false);
});

test('teachers and coordinators still follow the star lock', () => {
  assert.equal(isTrainingLevelLocked(4, {}, 'teacher', 25), true);
  assert.equal(isTrainingLevelLocked(4, {}, 'coordinador', 25), true);
});
