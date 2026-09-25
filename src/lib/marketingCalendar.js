/** Fechas de campaña para el calendario de marketing. España, con picos comerciales internacionales. */

export const MARKETING_CATEGORIES = {
  comercial: { id: 'comercial', label: 'Comercial' },
  academia: { id: 'academia', label: 'Academia' },
};

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const FIXED_EVENTS = [
  {
    month: 1,
    day: 1,
    name: 'Año Nuevo',
    category: 'academia',
    note: 'Campaña de propósitos: empezar el año con un plan de inglés.',
  },
  {
    month: 1,
    day: 6,
    name: 'Reyes',
    category: 'comercial',
    note: 'Regalo de Reyes. La promo encaja del 26 de diciembre al 5 de enero.',
  },
  {
    month: 1,
    day: 7,
    name: 'Rebajas de enero',
    category: 'comercial',
    note: 'Inicio habitual de las rebajas de invierno en España.',
  },
  {
    month: 2,
    day: 14,
    name: 'San Valentín',
    category: 'comercial',
    note: 'Regalo en pareja. Conviene lanzar la campaña unos 10 días antes.',
  },
  {
    month: 3,
    day: 19,
    name: 'Día del Padre',
    category: 'comercial',
    note: 'En España es el 19 de marzo. Preparar la oferta la semana anterior.',
  },
  {
    month: 4,
    day: 23,
    name: 'Sant Jordi',
    category: 'academia',
    note: 'Día del Libro. Sirve para contenido y regalos ligados a la lectura.',
  },
  {
    month: 7,
    day: 1,
    name: 'Rebajas de verano',
    category: 'comercial',
    note: 'Inicio habitual de las rebajas de verano.',
  },
  {
    month: 10,
    day: 31,
    name: 'Halloween',
    category: 'comercial',
    note: 'Campaña corta, en la última semana de octubre.',
  },
  {
    month: 12,
    day: 1,
    name: 'Inicio de Navidad',
    category: 'comercial',
    note: 'Arranque de la campaña de regalos de Navidad.',
  },
  {
    month: 12,
    day: 6,
    name: 'Puente de diciembre',
    category: 'comercial',
    note: 'Constitución e Inmaculada. Buen momento para un intensivo corto.',
  },
  {
    month: 12,
    day: 25,
    name: 'Navidad',
    category: 'comercial',
    note: 'Pico de regalos. Conviene cerrar la promo antes del día 24.',
  },
];

/**
 * @param {number} year
 * @returns {{ year: number, month: number, day: number }}
 */
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @param {number} weekday 0 domingo … 6 sábado
 * @param {number} n
 */
export function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month - 1, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return { year, month, day };
}

/** Viernes siguiente al cuarto jueves de noviembre. */
export function blackFriday(year) {
  const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4);
  return addDays(thanksgiving, 1);
}

export function cyberMonday(year) {
  return addDays(blackFriday(year), 3);
}

function addDays(date, days) {
  const next = new Date(date.year, date.month - 1, date.day + days);
  return { year: next.getFullYear(), month: next.getMonth() + 1, day: next.getDate() };
}

function dateKey(date) {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

/**
 * @param {number} year
 */
export function getMarketingEvents(year) {
  const goodFriday = addDays(easterSunday(year), -2);
  const mothersDay = nthWeekdayOfMonth(year, 5, 0, 1);
  const backToSchool = nthWeekdayOfMonth(year, 9, 1, 2);
  const friday = blackFriday(year);
  const monday = cyberMonday(year);
  const schoolEnd = addDays({ year, month: 6, day: 21 }, -((new Date(year, 5, 21).getDay() + 2) % 7));

  const variable = [
    {
      ...goodFriday,
      name: 'Semana Santa',
      category: 'academia',
      note: 'Viernes Santo. La semana suele frenar el estudio; encaja un intensivo corto antes o después.',
    },
    {
      ...mothersDay,
      name: 'Día de la Madre',
      category: 'comercial',
      note: 'Primer domingo de mayo en España. Lanzar la oferta la semana anterior.',
    },
    {
      ...schoolEnd,
      name: 'Fin de curso',
      category: 'academia',
      note: 'Fecha orientativa, alrededor del 21 de junio. Cambia según la comunidad.',
    },
    {
      ...backToSchool,
      name: 'Vuelta al cole',
      category: 'academia',
      note: 'Segunda semana de septiembre. La fecha exacta cambia según la comunidad.',
    },
    {
      ...friday,
      name: 'Black Friday',
      category: 'comercial',
      note: 'Mayor pico de descuento del año. Preparar la oferta en la primera quincena de noviembre.',
    },
    {
      ...monday,
      name: 'Cyber Monday',
      category: 'comercial',
      note: 'Lunes posterior al Black Friday. Sirve para alargar la misma promo un día más.',
    },
  ];

  return [...FIXED_EVENTS.map((event) => ({ ...event, year })), ...variable]
    .map((event) => ({
      ...event,
      id: `${event.category}-${dateKey(event)}-${event.name}`,
      key: dateKey(event),
      weekday: WEEKDAYS[new Date(event.year, event.month - 1, event.day).getDay()],
      monthLabel: MONTHS[event.month - 1],
    }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.name.localeCompare(b.name));
}

export function formatEventDay(event) {
  return `${event.day} de ${event.monthLabel}`;
}

/**
 * @param {{ year: number, month: number, day: number }} date
 * @param {Date} [today]
 */
export function daysUntil(date, today = new Date()) {
  const target = new Date(date.year, date.month - 1, date.day);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function monthNames() {
  return MONTHS;
}
