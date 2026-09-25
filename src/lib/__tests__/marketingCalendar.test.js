import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blackFriday,
  cyberMonday,
  easterSunday,
  getMarketingEvents,
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

test('each year includes the main commercial peaks once', () => {
  const names = getMarketingEvents(2026).map((event) => event.name);
  for (const name of ['San Valentín', 'Black Friday', 'Cyber Monday', 'Navidad', 'Reyes']) {
    assert.equal(names.filter((item) => item === name).length, 1);
  }
});
