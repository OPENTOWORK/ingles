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

function reachedRegister(visit) {
  return (visit?.stops || []).some((stop) => {
    const title = String(stop?.title || '').trim().toLowerCase();
    const path = String(stop?.path || '').toLowerCase();
    return title === 'registro' || path.startsWith('/register') || path.startsWith('/registro');
  });
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

/**
 * Visita en la que se creó la cuenta: la más cercana al alta, no una visita
 * posterior. Si no hay fecha de alta, se usa la visita más antigua ya enlazada.
 */
export function signupVisitIds(visits = [], createdAtByUser = new Map()) {
  const earliest = new Map();
  const matched = new Map();
  for (const visit of visits) {
    if (!visit?.userId || visit.staff) continue;
    const seen = Date.parse(visit.createdAt || '');
    if (!Number.isFinite(seen)) continue;
    const prevEarly = earliest.get(visit.userId);
    if (!prevEarly || seen < prevEarly.seen) earliest.set(visit.userId, { id: visit.id, seen });
    if (!createdAtByUser.has(visit.userId)) continue;
    const created = Date.parse(createdAtByUser.get(visit.userId) || '');
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
    const qualifies = signupId
      ? visit.id === signupId
      : Boolean(visit.signedUp) || reachedRegister(visit);
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
