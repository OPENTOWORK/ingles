import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PLUS_ANNUAL_BF_PRICE,
  PLUS_ANNUAL_REGULAR_PRICE,
  PLUS_OFFER_END_DATE,
  PLUS_ORIGINAL_PRICE,
  PLUS_PRICE,
  PLUS_PRICE_AFTER_OFFER,
  homeBandCta,
  homeHeroCta,
  isBlackFridayOfferActive,
  isPlusOfferActive,
  plusAnnualRegularDiscountPercent,
  plusAnnualRegularSavingsEuros,
  plusAnnualSavingsVersusMonthlyEuros,
  plusBlackFridayEffectiveMonthly,
  plusOfferDiscountPercent,
  plusTwelveMonthsMonthlyTotal,
} from '../../data/financialPlanConfig.js';

describe('plus price offer', () => {
  it('keeps one selling price, one crossed price and a calculated 60 percent', () => {
    assert.equal(PLUS_PRICE, 3.99);
    assert.equal(PLUS_ORIGINAL_PRICE, 9.99);
    assert.equal(PLUS_OFFER_END_DATE, '2026-12-31');
    assert.equal(PLUS_PRICE_AFTER_OFFER, null);
    assert.equal(plusOfferDiscountPercent(), 60);
  });

  it('calculates the Black Friday year from the annual constants', () => {
    assert.equal(PLUS_ANNUAL_REGULAR_PRICE, 34.99);
    assert.equal(PLUS_ANNUAL_BF_PRICE, 19.99);
    assert.equal(plusTwelveMonthsMonthlyTotal(), 47.88);
    assert.equal(plusAnnualRegularSavingsEuros(), 15);
    assert.equal(plusAnnualRegularDiscountPercent(), 43);
    assert.equal(plusAnnualSavingsVersusMonthlyEuros(), 27.89);
    assert.equal(plusBlackFridayEffectiveMonthly(), 1.67);
  });

  it('ends the Black Friday year at 23:59:59 Madrid on 30 November 2026', () => {
    assert.equal(isBlackFridayOfferActive(new Date('2026-11-30T22:59:59.000Z')), true);
    assert.equal(isBlackFridayOfferActive(new Date('2026-11-30T23:00:00.000Z')), false);
    assert.equal(isBlackFridayOfferActive(new Date('2026-12-01T00:00:00.000Z')), false);
  });

  it('puts the year first on the home only through 30 November 2026', () => {
    const during = new Date('2026-11-30T22:59:59.000Z');
    const after = new Date('2026-12-01T00:00:00.000Z');
    assert.equal(homeHeroCta(during).primary.src, 'hero-anual');
    assert.equal(homeHeroCta(during).secondary.src, 'hero');
    assert.equal(homeHeroCta(after).primary.label, 'Probar DRALO gratis');
    assert.equal(homeHeroCta(after).secondary.label, 'Ver la oferta');
    assert.equal(homeBandCta('mid', during).primary.src, 'mid-anual');
    assert.equal(homeBandCta('cierre', during).secondary.src, 'cierre');
    assert.equal(homeBandCta('mid', after).secondary, null);
    assert.equal(homeBandCta('cierre', after).primary.src, 'cierre');
  });

  it('stays visible through the end of 31 December 2026 in Madrid', () => {
    assert.equal(isPlusOfferActive(new Date('2026-12-31T22:30:00.000Z')), true);
    assert.equal(isPlusOfferActive(new Date('2026-12-31T23:30:00.000Z')), false);
  });
});
