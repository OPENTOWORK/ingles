import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eventKeysInRange,
  googleEventsForRange,
  monthRange,
  normalizeGoogleCalendarIcalUrl,
  parseIcsEvents,
} from '@/lib/teacherGoogleCalendar';

const PRIVATE_URL =
  'https://calendar.google.com/calendar/ical/profe%40gmail.com/private-abc123/basic.ics';

test('only a Google Calendar iCal address is accepted', () => {
  assert.equal(normalizeGoogleCalendarIcalUrl(PRIVATE_URL), PRIVATE_URL);
  assert.equal(normalizeGoogleCalendarIcalUrl(`  ${PRIVATE_URL}  `), PRIVATE_URL);
  assert.equal(normalizeGoogleCalendarIcalUrl('https://example.com/calendar/ical/basic.ics'), '');
  assert.equal(normalizeGoogleCalendarIcalUrl('http://calendar.google.com/calendar/ical/a/basic.ics'), '');
  assert.equal(
    normalizeGoogleCalendarIcalUrl(`<iframe src="${PRIVATE_URL}"></iframe>`),
    PRIVATE_URL,
  );
});

test('timed and all-day events land on the Madrid day', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'X-WR-CALNAME:Clases',
    'BEGIN:VEVENT',
    'UID:one',
    'SUMMARY:Clase con Ana',
    'DTSTART:20261124T080000Z',
    'DTEND:20261124T090000Z',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:two',
    'SUMMARY:Entrega de redacciones',
    'DTSTART;VALUE=DATE:20261120',
    'DTEND;VALUE=DATE:20261122',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  const events = googleEventsForRange(ics, '2026-11-01', '2026-12-01');
  const clase = events.find((event) => event.title === 'Clase con Ana');
  assert.equal(clase.date, '2026-11-24');
  assert.equal(clase.time, '09:00');
  assert.deepEqual(
    events.filter((event) => event.title === 'Entrega de redacciones').map((event) => event.date),
    ['2026-11-20', '2026-11-21'],
  );
});

test('weekly classes expand inside the visible month', () => {
  const [event] = parseIcsEvents(
    [
      'BEGIN:VEVENT',
      'UID:weekly',
      'SUMMARY:Speaking',
      'DTSTART;TZID=Europe/Madrid:20261103T170000',
      'DTEND;TZID=Europe/Madrid:20261103T180000',
      'RRULE:FREQ=WEEKLY;BYDAY=TU',
      'EXDATE;TZID=Europe/Madrid:20261110T170000',
      'END:VEVENT',
    ].join('\n'),
  );

  assert.deepEqual(eventKeysInRange(event, '2026-11-01', '2026-12-01'), [
    '2026-11-03',
    '2026-11-17',
    '2026-11-24',
  ]);
});

test('month range is the calendar month', () => {
  assert.deepEqual(monthRange('2026-11'), {
    start: '2026-11-01',
    end: '2026-12-01',
    month: '2026-11',
  });
});
