import { describe, expect, it } from 'vitest';

const MAX_FOUNDING_SLOT = 50;
const FIRST_AUTO_SLOT = 2;

function shouldGrantFoundingPlus(slotNumber) {
  return Boolean(slotNumber && slotNumber >= FIRST_AUTO_SLOT && slotNumber <= MAX_FOUNDING_SLOT);
}

describe('founding member plus slots', () => {
  it('reserves slot 1 for manual grant only', () => {
    expect(shouldGrantFoundingPlus(1)).toBe(false);
  });

  it('grants slots 2 through 50', () => {
    expect(shouldGrantFoundingPlus(2)).toBe(true);
    expect(shouldGrantFoundingPlus(50)).toBe(true);
  });

  it('stops after slot 50', () => {
    expect(shouldGrantFoundingPlus(51)).toBe(false);
    expect(shouldGrantFoundingPlus(null)).toBe(false);
  });
});
