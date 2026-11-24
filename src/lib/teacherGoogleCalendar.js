const GOOGLE_HOSTS = new Set(['calendar.google.com', 'www.google.com']);
const WEEKDAY_INDEX = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };

export function normalizeGoogleCalendarIcalUrl(value = '') {
  const match = String(value || '').match(/https:\/\/calendar\.google\.com\/calendar\/ical\/[^\s"'<>]+/i);
  const raw = (match ? match[0] : String(value || '')).trim().replace(/&amp;/g, '&');
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' || url.username || url.password) return '';
  if (!GOOGLE_HOSTS.has(url.hostname.toLowerCase())) return '';
  if (!url.pathname.toLowerCase().startsWith('/calendar/ical/')) return '';
  if (!url.pathname.toLowerCase().endsWith('.ics')) return '';
  return url.toString();
}

export function isGoogleCalendarHost(value = '') {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GOOGLE_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function unfoldIcs(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function unescapeIcs(value = '') {
  return String(value)
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function fieldMap(block) {
  const fields = {};
  String(block || '').split('\n').forEach((line) => {
    const splitAt = line.indexOf(':');
    if (splitAt < 1) return;
    const left = line.slice(0, splitAt);
    const value = line.slice(splitAt + 1).trim();
    const [name, ...params] = left.split(';');
    const key = name.toUpperCase();
    if (key === 'EXDATE') {
      fields.EXDATE = fields.EXDATE || [];
      fields.EXDATE.push({ value, params });
      return;
    }
    if (!fields[key]) fields[key] = { value, params };
  });
  return fields;
}

function madridParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value || '';
  return {
    key: `${read('year')}-${read('month')}-${read('day')}`,
    timeLabel: `${read('hour')}:${read('minute')}`,
  };
}

function parseIcsStamp(field) {
  if (!field?.value) return null;
  const raw = field.value.trim();
  const params = (field.params || []).join(';').toUpperCase();
  const allDay = params.includes('VALUE=DATE') || /^\d{8}$/.test(raw);
  if (allDay) {
    const match = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) return null;
    return { key: `${match[1]}-${match[2]}-${match[3]}`, allDay: true, timeLabel: '' };
  }
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!match) return null;
  if (raw.endsWith('Z')) {
    const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5]));
    const zoned = madridParts(date);
    return { key: zoned.key, allDay: false, timeLabel: zoned.timeLabel };
  }
  return { key: `${match[1]}-${match[2]}-${match[3]}`, allDay: false, timeLabel: `${match[4]}:${match[5]}` };
}

function parseRrule(value = '') {
  const parts = Object.fromEntries(
    String(value)
      .split(';')
      .map((part) => {
        const [key, rest] = part.split('=');
        return [String(key || '').toUpperCase(), rest || ''];
      }),
  );
  if (!parts.FREQ) return null;
  return {
    freq: parts.FREQ,
    interval: Math.max(1, Number(parts.INTERVAL || 1) || 1),
    byday: parts.BYDAY ? parts.BYDAY.split(',').filter((day) => WEEKDAY_INDEX[day] != null) : [],
    untilKey: parts.UNTIL ? parseIcsStamp({ value: parts.UNTIL, params: [] })?.key || '' : '',
    count: parts.COUNT ? Number(parts.COUNT) : null,
  };
}

function keyToDate(key) {
  return new Date(`${key}T12:00:00`);
}

function dateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - offset);
  return next;
}

function weekdayCode(key) {
  const index = (keyToDate(key).getDay() + 6) % 7;
  return Object.keys(WEEKDAY_INDEX).find((code) => WEEKDAY_INDEX[code] === index) || 'MO';
}

function exdateKeys(fields) {
  const keys = new Set();
  (fields.EXDATE || []).forEach((field) => {
    String(field.value || '')
      .split(',')
      .forEach((value) => {
        const stamp = parseIcsStamp({ value, params: field.params });
        if (stamp?.key) keys.add(stamp.key);
      });
  });
  return keys;
}

export function calendarNameFromIcs(ics = '') {
  const match = unfoldIcs(ics).match(/^X-WR-CALNAME:(.+)$/im);
  return match ? unescapeIcs(match[1]) : '';
}

export function parseIcsEvents(ics = '') {
  const text = unfoldIcs(ics);
  return text
    .split(/BEGIN:VEVENT/i)
    .slice(1)
    .map((block) => {
      const fields = fieldMap(block.split(/END:VEVENT/i)[0]);
      const start = parseIcsStamp(fields.DTSTART);
      if (!start) return null;
      const end = parseIcsStamp(fields.DTEND);
      return {
        uid: fields.UID?.value || `${start.key}-${fields.SUMMARY?.value || 'evento'}`,
        title: unescapeIcs(fields.SUMMARY?.value || 'Sin título'),
        location: unescapeIcs(fields.LOCATION?.value || ''),
        start,
        end,
        rrule: parseRrule(fields.RRULE?.value || ''),
        excluded: exdateKeys(fields),
      };
    })
    .filter(Boolean);
}

function pushKey(keys, key, event, rangeStart, rangeEnd) {
  if (!key || event.excluded.has(key)) return;
  if (key < rangeStart || key >= rangeEnd) return;
  keys.push(key);
}

export function eventKeysInRange(event, rangeStart, rangeEnd) {
  const keys = [];
  if (!event?.start?.key) return keys;

  if (!event.rrule) {
    if (event.start.allDay && event.end?.key && event.end.key > event.start.key) {
      let cursor = keyToDate(event.start.key);
      const end = keyToDate(event.end.key);
      while (cursor < end && keys.length < 40) {
        pushKey(keys, dateToKey(cursor), event, rangeStart, rangeEnd);
        cursor = addDays(cursor, 1);
      }
      return keys;
    }
    pushKey(keys, event.start.key, event, rangeStart, rangeEnd);
    return keys;
  }

  const { freq, interval, byday, untilKey, count } = event.rrule;
  const limit = count || 400;
  let emitted = 0;

  if (freq === 'DAILY') {
    let cursor = keyToDate(event.start.key);
    while (emitted < limit) {
      const key = dateToKey(cursor);
      if (untilKey && key > untilKey) break;
      if (key >= rangeEnd) break;
      emitted += 1;
      pushKey(keys, key, event, rangeStart, rangeEnd);
      cursor = addDays(cursor, interval);
    }
    return keys;
  }

  if (freq !== 'WEEKLY') {
    pushKey(keys, event.start.key, event, rangeStart, rangeEnd);
    return keys;
  }

  const days = byday.length ? byday : [weekdayCode(event.start.key)];
  let week = startOfWeek(keyToDate(event.start.key));
  const rangeEndDate = keyToDate(rangeEnd);
  while (week < rangeEndDate && emitted < limit) {
    for (const code of days) {
      const key = dateToKey(addDays(week, WEEKDAY_INDEX[code]));
      if (key < event.start.key) continue;
      if (untilKey && key > untilKey) return keys;
      emitted += 1;
      if (emitted > limit) return keys;
      pushKey(keys, key, event, rangeStart, rangeEnd);
    }
    week = addDays(week, 7 * interval);
  }
  return keys;
}

export function googleEventsForRange(ics, rangeStart, rangeEnd) {
  const events = [];
  parseIcsEvents(ics).forEach((event) => {
    eventKeysInRange(event, rangeStart, rangeEnd).forEach((date) => {
      events.push({
        id: `${event.uid}-${date}`,
        title: event.title,
        date,
        time: event.start.allDay ? '' : event.start.timeLabel,
        allDay: event.start.allDay,
        location: event.location,
        source: 'google',
      });
    });
  });
  events.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return events.slice(0, 500);
}

export async function fetchGoogleCalendarIcs(url) {
  const initial = normalizeGoogleCalendarIcalUrl(url);
  if (!initial) {
    const error = new Error('Pega la dirección secreta iCal de Google Calendar.');
    error.status = 400;
    throw error;
  }

  let current = initial;
  for (let hop = 0; hop < 3; hop += 1) {
    const res = await fetch(current, {
      redirect: 'manual',
      headers: { Accept: 'text/calendar, text/plain;q=0.9' },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      const next = location ? new URL(location, current).toString() : '';
      if (!next || !isGoogleCalendarHost(next)) {
        const error = new Error('Google redirigió el calendario fuera de su dominio.');
        error.status = 400;
        throw error;
      }
      current = next;
      continue;
    }
    if (!res.ok) {
      const error = new Error('Google no aceptó esa dirección. Comprueba que sea la dirección secreta iCal.');
      error.status = 400;
      throw error;
    }
    const text = await res.text();
    if (text.length > 2_000_000) {
      const error = new Error('Ese calendario es demasiado grande para enlazarlo.');
      error.status = 400;
      throw error;
    }
    if (!/BEGIN:VCALENDAR/i.test(text)) {
      const error = new Error('Esa dirección no devolvió un calendario de Google.');
      error.status = 400;
      throw error;
    }
    return { ics: text, url: initial, name: calendarNameFromIcs(text) };
  }

  const error = new Error('Google redirigió el calendario demasiadas veces.');
  error.status = 400;
  throw error;
}

export function monthRange(monthParam = '') {
  const match = String(monthParam || '').match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const month = match ? Number(match[2]) : now.getMonth() + 1;
  const safeMonth = Math.min(12, Math.max(1, month));
  const start = `${year}-${String(safeMonth).padStart(2, '0')}-01`;
  const next = new Date(year, safeMonth, 1);
  const end = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`;
  return { start, end, month: `${year}-${String(safeMonth).padStart(2, '0')}` };
}
