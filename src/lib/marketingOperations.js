import { journeyTrail, continuedPastLanding } from '@/lib/visitorJourney';
import { landingLabelFromPath, trafficSourceLabel } from '@/lib/trafficSource';
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
  return trafficSourceLabel(key) || 'Directo';
}

function movedOn(visit) {
  const stops = Array.isArray(visit?.stops) ? visit.stops : [];
  if (landingLabelFromPath(visit?.landing) === 'Landing B2') {
    return continuedPastLanding(stops);
  }
  return stops.length > 1;
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

  for (const visit of visits) {
    const label = sourceLabel(visit);
    const row = bySource.get(label) || { source: label, visits: 0, accounts: 0, paying: 0 };
    row.visits += 1;
    const hasAccount = Boolean(visit.userId);
    const pays = hasAccount && payingUsers.has(visit.userId);
    if (hasAccount) {
      row.accounts += 1;
      withAccount += 1;
    }
    if (pays) {
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
    .slice(0, 30)
    .map((visit) => ({
      id: visit.id,
      when: visit.createdAt || null,
      source: sourceLabel(visit),
      steps: (visit.stops || []).map((stop) => stop.title).filter(Boolean).slice(0, 8),
      account: Boolean(visit.userId),
      paying: Boolean(visit.userId && payingUsers.has(visit.userId)),
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
