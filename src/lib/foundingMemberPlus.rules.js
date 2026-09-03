export const MAX_FOUNDING_SLOT = 50;
export const FIRST_AUTO_SLOT = 2;
export const PLUS_PLAN_SLUG = 'premium';
/** Belén (#1). Solo inscripciones posteriores entran en los cupos 2–50. */
export const FOUNDING_CAMPAIGN_STARTED_AT = '2026-09-01T12:14:53.961Z';

export function parseFoundingSlotNumber(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return parseFoundingSlotNumber(value[0]);
  if (typeof value === 'object') {
    return parseFoundingSlotNumber(
      value.slot_number ?? value.claim_founding_member_slot ?? Object.values(value)[0],
    );
  }
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function shouldGrantFoundingPlus(slotNumber) {
  const slot = parseFoundingSlotNumber(slotNumber);
  return Boolean(slot && slot >= FIRST_AUTO_SLOT && slot <= MAX_FOUNDING_SLOT);
}

export function shouldAttemptFoundingPlus(createdAt) {
  if (!createdAt) return true;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return true;
  return t >= new Date(FOUNDING_CAMPAIGN_STARTED_AT).getTime();
}

/** Cupos públicos de la campaña founding (slots 1–50 en `founding_member_grants`). */
export function computeFoundingSlotAvailability(claimedCount) {
  const claimed = Math.max(0, Number(claimedCount) || 0);
  const cappedClaimed = Math.min(claimed, MAX_FOUNDING_SLOT);
  const remaining = Math.max(0, MAX_FOUNDING_SLOT - cappedClaimed);
  return {
    total: MAX_FOUNDING_SLOT,
    claimed: cappedClaimed,
    remaining,
    soldOut: remaining === 0,
  };
}
