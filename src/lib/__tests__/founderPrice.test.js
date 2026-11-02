import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOUNDER_PRICE_DETAIL,
  FOUNDER_PRICE_LABEL,
  FOUNDER_PRICE_UNTIL,
  isFounderPriceActive,
} from '../../data/financialPlanConfig.js';

describe('founder price label', () => {
  it('names the offer and its last day', () => {
    assert.equal(FOUNDER_PRICE_LABEL, 'Precio fundador');
    assert.equal(FOUNDER_PRICE_DETAIL, 'Para siempre hasta el 31/12/2026');
    assert.equal(FOUNDER_PRICE_UNTIL, '2026-12-31');
  });

  it('stays visible through the end of 31 December 2026 in Madrid', () => {
    assert.equal(isFounderPriceActive(new Date('2026-12-31T22:30:00.000Z')), true);
    assert.equal(isFounderPriceActive(new Date('2026-12-31T23:30:00.000Z')), false);
  });
});
