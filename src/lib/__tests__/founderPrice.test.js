import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PLUS_OFFER_END_DATE,
  PLUS_ORIGINAL_PRICE,
  PLUS_PRICE,
  PLUS_PRICE_AFTER_OFFER,
  isPlusOfferActive,
  plusOfferDiscountPercent,
} from '../../data/financialPlanConfig.js';

describe('plus price offer', () => {
  it('keeps one selling price, one crossed price and a calculated 60 percent', () => {
    assert.equal(PLUS_PRICE, 3.99);
    assert.equal(PLUS_ORIGINAL_PRICE, 9.99);
    assert.equal(PLUS_OFFER_END_DATE, '2026-12-31');
    assert.equal(PLUS_PRICE_AFTER_OFFER, null);
    assert.equal(plusOfferDiscountPercent(), 60);
  });

  it('stays visible through the end of 31 December 2026 in Madrid', () => {
    assert.equal(isPlusOfferActive(new Date('2026-12-31T22:30:00.000Z')), true);
    assert.equal(isPlusOfferActive(new Date('2026-12-31T23:30:00.000Z')), false);
  });
});
