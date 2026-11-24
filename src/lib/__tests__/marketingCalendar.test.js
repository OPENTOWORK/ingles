import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blackFriday,
  cyberMonday,
  easterSunday,
  getMarketingEvents,
  getMarketingPromos,
  promoIncludesKey,
  promoOnDay,
} from '@/lib/marketingCalendar';

test('San Valentín is 14 February', () => {
  const events = getMarketingEvents(2026);
  const valentine = events.find((event) => event.name === 'San Valentín');
  assert.equal(valentine.month, 2);
  assert.equal(valentine.day, 14);
  assert.equal(valentine.category, 'comercial');
});

test('Black Friday is the Friday after the fourth Thursday of November', () => {
  assert.deepEqual(blackFriday(2025), { year: 2025, month: 11, day: 28 });
  assert.deepEqual(blackFriday(2026), { year: 2026, month: 11, day: 27 });
  assert.deepEqual(cyberMonday(2026), { year: 2026, month: 11, day: 30 });
});

test('Easter and the Spanish campaign dates that move each year', () => {
  assert.deepEqual(easterSunday(2025), { year: 2025, month: 4, day: 20 });
  assert.deepEqual(easterSunday(2026), { year: 2026, month: 4, day: 5 });

  const events = getMarketingEvents(2026);
  const byName = Object.fromEntries(events.map((event) => [event.name, event]));
  assert.equal(byName['Semana Santa'].day, 3);
  assert.equal(byName['Semana Santa'].month, 4);
  assert.equal(byName['Día de la Madre'].day, 3);
  assert.equal(byName['Día de la Madre'].month, 5);
  assert.equal(byName['Vuelta al cole'].month, 9);
  assert.equal(byName['Vuelta al cole'].day, 14);
});

test('each temporary promo keeps its own color', () => {
  const promos = getMarketingPromos(2026);
  const blackFriday = promos.find((promo) => promo.id === 'promo-black-friday-plus-year');
  const plus = promos.find((promo) => promo.id === 'promo-plus-free-month');
  assert.equal(blackFriday.color, 'green');
  assert.equal(blackFriday.startKey, '2026-11-18');
  assert.equal(blackFriday.endKey, '2026-11-30');
  assert.equal(plus.name, 'Te regalamos un mes gratis con tu Plan Plus');
  assert.equal(plus.published, false);
  assert.equal(plus.color, 'amber');
  assert.equal(plus.startKey, '2026-12-01');
  assert.equal(plus.endKey, '2026-12-31');
  assert.notEqual(blackFriday.color, plus.color);
  assert.equal(promoOnDay(promos, '2026-11-27').id, blackFriday.id);
  assert.equal(promoOnDay(promos, '2026-12-01').id, plus.id);
  assert.equal(promoIncludesKey(blackFriday, '2026-11-17'), false);
  assert.equal(getMarketingPromos(2027).length, 0);
});

test('the Plus annual Black Friday offer ends on 30 November 2026 only', () => {
  const in2026 = getMarketingEvents(2026).find((event) => event.name === 'Fin Black Friday · Plan Plus anual');
  assert.equal(in2026.month, 11);
  assert.equal(in2026.day, 30);
  assert.equal(in2026.category, 'comercial');
  assert.equal(
    getMarketingEvents(2027).some((event) => event.name === 'Fin Black Friday · Plan Plus anual'),
    false,
  );
});

test('each year includes the main commercial peaks once', () => {
  const names = getMarketingEvents(2026).map((event) => event.name);
  for (const name of ['San Valentín', 'Black Friday', 'Cyber Monday', 'Navidad', 'Reyes']) {
    assert.equal(names.filter((item) => item === name).length, 1);
  }
});
