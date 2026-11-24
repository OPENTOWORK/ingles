import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBlackFridayCampaign, buildPlusFreeMonthCampaign } from '@/lib/marketingCampaigns';

test('Black Friday is an active campaign through 30 November 2026', () => {
  const during = buildBlackFridayCampaign(new Date('2026-11-21T08:00:00Z'));
  assert.equal(during.estado, 'activa');
  assert.match(during.nombre, /Black Friday/);
  assert.match(during.descripcion, /19,99/);
  assert.equal(during.enlace, '/precios/?facturacion=anual');
});

test('the December free month stays unpublished', () => {
  const campaign = buildPlusFreeMonthCampaign();
  assert.equal(campaign.estado, 'sin_publicar');
  assert.equal(campaign.enlace, '');
  assert.match(campaign.nombre, /mes gratis/);
});

test('Black Friday becomes inactive after the offer ends', () => {
  const after = buildBlackFridayCampaign(new Date('2026-12-01T08:00:00Z'));
  assert.equal(after.estado, 'inactiva');
});
