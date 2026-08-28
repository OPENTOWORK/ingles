export const PUBLISH_MODE_NOW = 'now';
export const PUBLISH_MODE_SCHEDULE = 'schedule';
export const PUBLISH_MODE_DRAFT = 'draft';

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** @param {Date} date */
export function toDateInputValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** @param {Date} date */
export function toTimeInputValue(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** @param {string | null | undefined} iso */
export function toScheduleInputs(iso) {
  if (!iso) return { date: '', time: '09:00' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: '', time: '09:00' };
  return { date: toDateInputValue(date), time: toTimeInputValue(date) };
}

/** @param {string} date YYYY-MM-DD @param {string} time HH:mm */
export function combineScheduleInputs(date, time = '09:00') {
  if (!date) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = String(time || '09:00').split(':').map(Number);
  if (!year || !month || !day) return null;
  const local = new Date(year, month - 1, day, hours || 9, minutes || 0, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

/** @param {string | null | undefined} iso */
export function isFutureSchedule(iso) {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

/** @param {string | null | undefined} iso */
export function formatScheduledDateTime(iso, locale = 'es-ES') {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function nextMonday(from = new Date()) {
  const date = startOfDay(from);
  const day = date.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  date.setDate(date.getDate() + daysUntilMonday);
  date.setHours(9, 0, 0, 0);
  return date;
}

export function getScheduleQuickPresets() {
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const inSevenDays = startOfDay(new Date());
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  inSevenDays.setHours(9, 0, 0, 0);

  return [
    { id: 'tomorrow', label: 'Mañana 9:00', iso: tomorrow.toISOString() },
    { id: 'next-monday', label: 'Próximo lunes', iso: nextMonday().toISOString() },
    { id: 'in-seven-days', label: 'En 7 días', iso: inSevenDays.toISOString() },
  ];
}

/** @param {{ published?: boolean, scheduled_publish_at?: string | null }} article */
export function resolvePublishModeFromArticle(article) {
  if (article?.published) return PUBLISH_MODE_NOW;
  if (isFutureSchedule(article?.scheduled_publish_at)) return PUBLISH_MODE_SCHEDULE;
  return PUBLISH_MODE_DRAFT;
}
