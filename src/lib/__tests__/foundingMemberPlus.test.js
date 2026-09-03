import { describe, expect, it } from 'vitest';
import {
  FOUNDING_CAMPAIGN_STARTED_AT,
  computeFoundingSlotAvailability,
  parseFoundingSlotNumber,
  shouldAttemptFoundingPlus,
  shouldGrantFoundingPlus,
} from '../foundingMemberPlus.rules';

describe('founding member plus slots', () => {
  it('reserves slot 1 for manual grant only', () => {
    expect(shouldGrantFoundingPlus(1)).toBe(false);
  });

  it('grants slots 2 through 50', () => {
    expect(shouldGrantFoundingPlus(2)).toBe(true);
    expect(shouldGrantFoundingPlus(50)).toBe(true);
    expect(shouldGrantFoundingPlus('2')).toBe(true);
  });

  it('stops after slot 50', () => {
    expect(shouldGrantFoundingPlus(51)).toBe(false);
    expect(shouldGrantFoundingPlus(null)).toBe(false);
  });

  it('parses numeric slots from RPC-like payloads', () => {
    expect(parseFoundingSlotNumber(2)).toBe(2);
    expect(parseFoundingSlotNumber('7')).toBe(7);
    expect(parseFoundingSlotNumber({ slot_number: 3 })).toBe(3);
    expect(parseFoundingSlotNumber([4])).toBe(4);
    expect(parseFoundingSlotNumber({ claim_founding_member_slot: '5' })).toBe(5);
  });

  it('only retries grants for signups from the public campaign onwards', () => {
    expect(shouldAttemptFoundingPlus(FOUNDING_CAMPAIGN_STARTED_AT)).toBe(true);
    expect(shouldAttemptFoundingPlus('2026-09-02T07:11:36.200Z')).toBe(true);
    expect(shouldAttemptFoundingPlus('2026-05-18T08:38:00.000Z')).toBe(false);
    expect(shouldAttemptFoundingPlus(null)).toBe(true);
  });

  it('computes remaining founding slots from claimed count', () => {
    expect(computeFoundingSlotAvailability(1)).toEqual({
      total: 50,
      claimed: 1,
      remaining: 49,
      soldOut: false,
    });
    expect(computeFoundingSlotAvailability(50)).toEqual({
      total: 50,
      claimed: 50,
      remaining: 0,
      soldOut: true,
    });
    expect(computeFoundingSlotAvailability(99).claimed).toBe(50);
  });
});
