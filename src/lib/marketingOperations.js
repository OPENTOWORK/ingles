import { journeyTrail, continuedPastLanding } from '@/lib/visitorJourney';
import { landingLabelFromPath, trafficSourceWithAd } from '@/lib/trafficSource';
import { normalizeUserPlanSlug } from '@/data/financialPlanConfig';

/** Precio mensual vigente. El anual es el equivalente al mes en lanzamiento. */
const MONTHLY_PRICE_EUR = {
  starter: 4.99,
  premium: 3.99,
  pro: 8.99,
};

const YEARLY_EQUIVALENT_EUR = {
  premium: 1.99,
  pro: 4.99,
  starter: 4.99,
};

export function monthlyPlanRevenueEur(planId, interval) {
  const slug = normalizeUserPlanSlug(planId);
  if (String(interval || '').toLowerCase() === 'year') {
    return YEARLY_EQUIVALENT_EUR[slug] || MONTHLY_PRICE_EUR[slug] || 0;
  }
  return MONTHLY_PRICE_EUR[slug] || 0;
}

function sourceLabel(visit) {
  const key = String(visit?.source || '').trim();
  if (!key) return 'Directo';
  return trafficSourceWithAd(key, visit?.landing) || 'Directo';
}

function movedOn(visit) {
  const stops = Array.isArray(visit?.stops) ? visit.stops : [];
  if (landingLabelFromPath(visit?.landing) === 'Landing B2') {
    return continuedPastLanding(stops);
  }
  return stops.length > 1;
}

/** Mes civil en España, para no mezclar el histórico de un mes con el siguiente. */
export function visitMonthKey(createdAt, timeZone = 'Europe/Madrid') {
  const date = new Date(createdAt || '');
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).format(date).slice(0, 7);
}

export function listVisitMonths(visits = []) {
  const months = new Set();
  for (const visit of visits) {
    const key = visitMonthKey(visit?.createdAt);
    if (key) months.add(key);
  }
  return [...months].sort((a, b) => b.localeCompare(a));
}

function zonedMonthStart(year, month, timeZone) {
  const guess = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(guess);
  const read = (type) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(read('year'), read('month') - 1, read('day'), read('hour'), read('minute'), read('second'));
  return new Date(guess.getTime() - (asUtc - guess.getTime()));
}

/** Inicio inclusive y fin exclusivo del mes civil en España, en UTC. */
export function monthBoundsIso(monthKey, timeZone = 'Europe/Madrid') {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    start: zonedMonthStart(year, month, timeZone).toISOString(),
    end: zonedMonthStart(nextYear, nextMonth, timeZone).toISOString(),
  };
}

/** Meses entre dos fechas, del más nuevo al más antiguo. Incluye los extremos. */
export function monthsSpanning(oldestAt, newestAt) {
  const start = visitMonthKey(oldestAt);
  const end = visitMonthKey(newestAt);
  if (!start || !end || start > end) return [];
  const months = [];
  let cursor = start;
  while (cursor <= end && months.length < 48) {
    months.push(cursor);
    const [year, month] = cursor.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    cursor = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  }
  return months.sort((a, b) => b.localeCompare(a));
}

function parseStoredUtc(value) {
  const raw = String(value || '').trim();
  if (!raw) return NaN;
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) return Date.parse(raw);
  return Date.parse(`${raw.replace(' ', 'T')}Z`);
}

function isRegisterStop(stop) {
  const title = String(stop?.title || '').trim().toLowerCase();
  const path = String(stop?.path || '').toLowerCase();
  return title === 'registro' || path.startsWith('/register') || path.startsWith('/registro');
}

/**
 * Quien se registra sin confirmar el correo no llega a iniciar sesión, así que
 * la visita sigue anónima. Si abrió Registro justo antes del alta, esa visita
 * es la del registro.
 */
export function attachUnlinkedSignups(visits = [], accounts = []) {
  const linked = new Set(visits.map((visit) => visit.userId).filter(Boolean));
  for (const account of accounts) {
    if (!account?.userId || account.staff || linked.has(account.userId)) continue;
    const created = parseStoredUtc(account.createdAt);
    if (!Number.isFinite(created)) continue;
    let best = null;
    let bestDelta = Infinity;
    for (const visit of visits) {
      if (visit.userId) continue;
      const registerStop = (visit.stops || []).find((stop) => isRegisterStop(stop));
      if (!registerStop) continue;
      const seen = parseStoredUtc(registerStop.visitedAt || visit.createdAt);
      if (!Number.isFinite(seen)) continue;
      const delta = created - seen;
      if (delta < -2 * 60 * 1000 || delta > 30 * 60 * 1000) continue;
      if (Math.abs(delta) >= bestDelta) continue;
      best = visit;
      bestDelta = Math.abs(delta);
    }
    if (!best) continue;
    best.userId = account.userId;
    linked.add(account.userId);
  }
  return visits;
}

/**
 * Visita en la que se creó la cuenta: la más cercana al alta, no una visita
 * posterior. Si no hay fecha de alta, se usa la visita más antigua ya enlazada.
 */
export function signupVisitIds(visits = [], createdAtByUser = new Map()) {
  const earliest = new Map();
  const matched = new Map();
  for (const visit of visits) {
    if (!visit?.userId || visit.staff) continue;
    const seen = parseStoredUtc(visit.createdAt || '');
    if (!Number.isFinite(seen)) continue;
    const prevEarly = earliest.get(visit.userId);
    if (!prevEarly || seen < prevEarly.seen) earliest.set(visit.userId, { id: visit.id, seen });
    if (!createdAtByUser.has(visit.userId)) continue;
    const created = parseStoredUtc(createdAtByUser.get(visit.userId) || '');
    if (!Number.isFinite(created) || seen > created + 2 * 60 * 1000) continue;
    const prev = matched.get(visit.userId);
    if (!prev || seen > prev.seen) matched.set(visit.userId, { id: visit.id, seen });
  }
  const ids = new Set();
  for (const [userId, visit] of earliest) {
    const chosen = matched.get(userId) || (createdAtByUser.has(userId) ? null : visit);
    if (chosen) ids.add(chosen.id);
  }
  return ids;
}

function rate(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function euros(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

/**
 * Métricas de marketing a partir de visitas, recorridos y suscripciones.
 * @param {{
 *   visits?: Array<{ id?: string, userId?: string|null, createdAt?: string, source?: string, landing?: string, stops?: Array<{ title?: string, path?: string }> }>,
 *   subscriptions?: Array<{ userId?: string, planId?: string, status?: string, interval?: string, grantsAccess?: boolean }>,
 * }} input
 */
export function summarizeMarketingOperations({ visits = [], subscriptions = [] } = {}) {
  const payingUsers = new Map();
  const friendlyUsers = new Set();
  for (const sub of subscriptions) {
    if (!sub?.userId || !sub.grantsAccess) continue;
    const amount = monthlyPlanRevenueEur(sub.planId, sub.interval);
    if (amount > 0) {
      const current = payingUsers.get(sub.userId) || 0;
      if (amount > current) payingUsers.set(sub.userId, amount);
    } else if (normalizeUserPlanSlug(sub.planId) !== 'free') {
      friendlyUsers.add(sub.userId);
    }
  }

  const monthlyRevenueEur = euros([...payingUsers.values()].reduce((sum, value) => sum + value, 0));
  const bySource = new Map();
  let continued = 0;
  let withAccount = 0;
  let visitPaying = 0;
  const accountVisitIds = new Set();
  const payingVisitIds = new Set();
  const countedAccounts = new Set();
  const signupByUser = new Map();
  for (const visit of visits) {
    if (visit?.signedUp && visit.userId && !visit.staff) signupByUser.set(visit.userId, visit.id);
  }
  const chronological = [...visits].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
  );
  for (const visit of chronological) {
    if (visit.staff) continue;
    const signupId = visit.userId ? signupByUser.get(visit.userId) : '';
    const qualifies = signupId ? visit.id === signupId : Boolean(visit.signedUp);
    if (!qualifies) continue;
    const accountKey = visit.userId ? `user:${visit.userId}` : `visit:${visit.id}`;
    if (countedAccounts.has(accountKey)) continue;
    countedAccounts.add(accountKey);
    accountVisitIds.add(visit.id);
    if (visit.userId && payingUsers.has(visit.userId)) payingVisitIds.add(visit.id);
  }

  for (const visit of visits) {
    const label = sourceLabel(visit);
    const row = bySource.get(label) || { source: label, visits: 0, accounts: 0, paying: 0 };
    row.visits += 1;
    if (accountVisitIds.has(visit.id)) {
      row.accounts += 1;
      withAccount += 1;
    }
    if (payingVisitIds.has(visit.id)) {
      row.paying += 1;
      visitPaying += 1;
    }
    if (movedOn(visit)) continued += 1;
    bySource.set(label, row);
  }

  const total = visits.length;
  const acquisition = [...bySource.values()].sort(
    (a, b) => b.visits - a.visits || a.source.localeCompare(b.source, 'es'),
  );

  const journeys = [...visits]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .map((visit) => ({
      id: visit.id,
      when: visit.createdAt || null,
      source: sourceLabel(visit),
      steps: (visit.stops || []).map((stop) => stop.title).filter(Boolean).slice(0, 8),
      account: accountVisitIds.has(visit.id),
      paying: payingVisitIds.has(visit.id),
    }));

  const funnel = [
    { key: 'visits', label: 'Visitas', count: total },
    { key: 'continued', label: 'Siguieron a otra página', count: continued },
    { key: 'accounts', label: 'Crearon cuenta', count: withAccount },
    { key: 'paying', label: 'Suscripción de pago', count: visitPaying },
  ].map((step, index, all) => ({
    ...step,
    rateFromStart: rate(step.count, total),
    rateFromPrevious: rate(step.count, index === 0 ? step.count : all[index - 1].count),
  }));

  return {
    sampleSize: total,
    dashboard: {
      visits: total,
      continued,
      accounts: withAccount,
      payingVisits: visitPaying,
      visitToAccount: rate(withAccount, total),
      accountToPaying: rate(visitPaying, withAccount),
      topSource: acquisition[0]?.source || '—',
      monthlyRevenueEur,
      payingCustomers: payingUsers.size,
    },
    acquisition,
    journeys,
    funnel,
    roi: {
      monthlyRevenueEur,
      payingCustomers: payingUsers.size,
      friendlyCustomers: friendlyUsers.size,
      revenuePerVisitEur: total ? euros(monthlyRevenueEur / total) : 0,
      adSpendEur: null,
      roas: null,
    },
  };
}

export function stopsForVisit(pages = [], landing = '') {
  return journeyTrail(pages, landing);
}
