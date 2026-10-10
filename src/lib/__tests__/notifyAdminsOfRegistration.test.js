import test from 'node:test';
import assert from 'node:assert/strict';
import { isRecentSignup } from '@/lib/notifyAdminsOfRegistration';

test('isRecentSignup only accepts accounts created in the last few hours', () => {
  const now = Date.parse('2026-10-10T08:00:00.000Z');
  assert.equal(isRecentSignup('2026-10-10T07:30:00.000Z', now), true);
  assert.equal(isRecentSignup('2026-10-09T07:30:00.000Z', now), false);
  assert.equal(isRecentSignup(null, now), false);
});
