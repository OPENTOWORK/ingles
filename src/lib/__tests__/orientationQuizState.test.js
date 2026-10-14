import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldOfferOrientationQuiz } from '../orientationQuizState.js';

const newUser = (extra = {}) => ({
  id: 'user-1',
  created_at: '2026-10-14T12:00:00.000Z',
  ...extra,
});

test('offers the quiz only to new accounts that have not seen it', () => {
  assert.equal(shouldOfferOrientationQuiz(newUser()), true);
  assert.equal(shouldOfferOrientationQuiz(newUser(), { seenOnDevice: true }), false);
  assert.equal(shouldOfferOrientationQuiz(null), false);
  assert.equal(shouldOfferOrientationQuiz({}), false);
  assert.equal(
    shouldOfferOrientationQuiz(newUser({ created_at: '2026-10-13T23:00:00.000Z' })),
    false,
  );
  assert.equal(shouldOfferOrientationQuiz(newUser({ created_at: 'no-date' })), false);
});
