import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { planPlusProductJsonLd, planPlusProductJsonLdScript } from '../planPlusProductJsonLd.js';

describe('plan plus product json-ld', () => {
  it('publishes one product and the three prices shown on the pricing card', () => {
    const data = planPlusProductJsonLd();
    assert.equal(data['@type'], 'Product');
    assert.equal(data.name, 'Dralo Plan Plus');
    assert.equal(data.description.length > 0, true);
    assert.equal(data.image, 'https://www.dralo.es/mascot/3.png');
    assert.equal(data.offers.length, 3);
    assert.deepEqual(
      data.offers.map((offer) => offer.price),
      ['3.99', '34.99', '19.99'],
    );
    assert.deepEqual(
      data.offers.map((offer) => offer.name),
      ['Plan Plus mensual', 'Plan Plus anual', 'Plan Plus anual Black Friday'],
    );
    for (const offer of data.offers) {
      assert.equal(offer.availability, 'https://schema.org/OnlineOnly');
      assert.equal(offer.validFrom, '2026-11-21');
      assert.equal(offer.priceCurrency, 'EUR');
    }
    assert.equal(data.offers[0].priceValidUntil, '2026-12-31');
    assert.equal(data.offers[1].priceValidUntil, '2026-12-31');
    assert.equal(data.offers[2].priceValidUntil, '2026-11-30');
    assert.equal(data.offers.every((offer) => typeof offer.priceValidUntil === 'string' && offer.priceValidUntil.length > 0), true);
    const published = JSON.parse(planPlusProductJsonLdScript());
    assert.equal(published.offers[1].name, 'Plan Plus anual');
    assert.equal(published.offers[1].price, '34.99');
    assert.equal(published.offers[1].priceValidUntil, '2026-12-31');
    assert.equal(data.aggregateRating, undefined);
    assert.equal(data.review, undefined);
  });
});
