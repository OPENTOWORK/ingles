import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PLUS_EXAMS_UNLOCK_BATCH,
  getMaxExamSlotForPlan,
  getPlusMaxExamSlot,
  getPlusUnlockProgress,
  getSubscriptionTenureMonths,
} from '@/lib/plusExamUnlock.js';

describe('plusExamUnlock', () => {
  it('computes subscription tenure months in UTC', () => {
    assert.equal(
      getSubscriptionTenureMonths('2026-01-15T10:00:00.000Z', new Date('2026-01-20T00:00:00.000Z')),
      1,
    );
    assert.equal(
      getSubscriptionTenureMonths('2026-01-15T10:00:00.000Z', new Date('2026-02-01T00:00:00.000Z')),
      2,
    );
    assert.equal(
      getSubscriptionTenureMonths('2026-01-15T10:00:00.000Z', new Date('2026-03-31T00:00:00.000Z')),
      3,
    );
  });

  it('unlocks 10 exams per subscription month for PLUS', () => {
    assert.equal(getPlusMaxExamSlot(1), 10);
    assert.equal(getPlusMaxExamSlot(2), 20);
    assert.equal(getPlusMaxExamSlot(3), 20);
    assert.equal(getMaxExamSlotForPlan('premium', { subscriptionMonths: 1 }), 10);
    assert.equal(getMaxExamSlotForPlan('premium', { subscriptionMonths: 2 }), 20);
  });

  it('keeps FREE at exam 1 and PREMIUM at full catalog', () => {
    assert.equal(getMaxExamSlotForPlan('free'), 1);
    assert.equal(getMaxExamSlotForPlan('pro', { subscriptionMonths: 1 }), 20);
    assert.equal(PLUS_EXAMS_UNLOCK_BATCH, 10);
  });

  it('reports next unlock batch for PLUS progress', () => {
    const month1 = getPlusUnlockProgress(1);
    assert.equal(month1.maxSlot, 10);
    assert.equal(month1.fullyUnlocked, false);
    assert.equal(month1.nextUnlockSlotStart, 11);
    assert.equal(month1.nextUnlockSlotEnd, 20);

    const month2 = getPlusUnlockProgress(2, 20);
    assert.equal(month2.maxSlot, 20);
    assert.equal(month2.fullyUnlocked, true);
    assert.equal(month2.nextUnlockAtMonth, null);
  });
});
