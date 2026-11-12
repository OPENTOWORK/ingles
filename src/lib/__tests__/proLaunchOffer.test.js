import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRO_LAUNCH_AFTER_EXPIRY,
  PRO_LAUNCH_MONTHS,
  PRO_LAUNCH_SLOT_LIMIT,
  PRO_LAUNCH_STARTED_AT,
  computeProLaunchAvailability,
  isEligibleForProLaunch,
  proLaunchSlotsLabel,
  proTrialEndsAt,
} from '../proLaunchOffer.rules.js';

describe('pro launch offer slots', () => {
  it('counts only the new cap of 25', () => {
    assert.equal(PRO_LAUNCH_SLOT_LIMIT, 25);
    assert.equal(PRO_LAUNCH_MONTHS, 3);
    assert.deepEqual(computeProLaunchAvailability(0), {
      cohort: 'pro_launch_25',
      total: 25,
      months: 3,
      claimed: 0,
      remaining: 25,
      soldOut: false,
    });
    assert.equal(computeProLaunchAvailability(24).remaining, 1);
    assert.equal(computeProLaunchAvailability(24).soldOut, false);
    assert.deepEqual(computeProLaunchAvailability(25), {
      cohort: 'pro_launch_25',
      total: 25,
      months: 3,
      claimed: 25,
      remaining: 0,
      soldOut: true,
    });
    assert.equal(computeProLaunchAvailability(50).claimed, 25);
    assert.equal(computeProLaunchAvailability(50).soldOut, true);
  });

  it('labels the real remainder and the completed state', () => {
    assert.equal(proLaunchSlotsLabel(9, 25), 'Quedan 9 de 25 plazas');
    assert.equal(proLaunchSlotsLabel(1, 25), 'Queda 1 de 25 plazas');
    assert.equal(proLaunchSlotsLabel(0, 25), 'Plazas completadas');
  });

  it('does not enrol accounts created before the offer', () => {
    assert.equal(isEligibleForProLaunch('2026-09-01T12:14:53.961Z'), false);
    assert.equal(isEligibleForProLaunch(PRO_LAUNCH_STARTED_AT), true);
    assert.equal(isEligibleForProLaunch('2026-11-12T08:00:00.000Z'), true);
    assert.equal(isEligibleForProLaunch(null), false);
  });

  it('stores an end date three calendar months later', () => {
    assert.equal(proTrialEndsAt('2026-11-12T00:00:00.000Z'), '2027-02-12T00:00:00.000Z');
    assert.equal(proTrialEndsAt('2026-11-30T10:00:00.000Z'), '2027-02-28T10:00:00.000Z');
  });

  it('does not invent what happens when the three months end', () => {
    assert.equal(PRO_LAUNCH_AFTER_EXPIRY, null);
  });
});
