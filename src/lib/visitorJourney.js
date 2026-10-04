import { getPageTitleForPath } from '@/lib/pageViewLabels';
import { landingLabelFromPath } from '@/lib/trafficSource';
import { formatSessionDuration } from '@/lib/userActivity';

export function normalizeVisitPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://www.dralo.es');
    const path = `${url.pathname}${url.search}`.replace(/\/+$/, '') || '/';
    return path.slice(0, 500);
  } catch {
    return raw.split('#')[0].replace(/\/+$/, '').slice(0, 500) || '/';
  }
}

export function titleForVisitPath(path) {
  const normalized = normalizeVisitPath(path);
  const landing = landingLabelFromPath(normalized);
  if (landing && landing !== '—' && landing !== normalized.toLowerCase()) return landing;
  return getPageTitleForPath(normalized) || 'Página';
}

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatJourneyPage(row, index = 0) {
  const path = normalizeVisitPath(row?.path || row?.page_url || '');
  const visitedAt = toIso(row?.visitedAt || row?.visited_at || row?.event_timestamp);
  const visited = visitedAt ? new Date(visitedAt) : null;
  const durationSeconds = Math.max(0, Number(row?.durationSeconds ?? row?.duration_seconds) || 0);
  return {
    id: row?.id || row?.event_public_id || `page-${index}-${visitedAt || path}`,
    path: path || '/',
    pageTitle: String(row?.pageTitle || row?.page_title || '').trim() || titleForVisitPath(path),
    visitedAt,
    visitedLabel: visited
      ? visited.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    durationSeconds,
    durationLabel: durationSeconds > 0 ? formatSessionDuration(durationSeconds) : '',
  };
}

function pageKey(row) {
  const path = normalizeVisitPath(row?.path || row?.page_url || '');
  const visitedAt = toIso(row?.visitedAt || row?.visited_at || row?.event_timestamp) || '';
  return `${path}|${visitedAt.slice(0, 16)}`;
}

export function fallbackJourneyFromVisit({ landing, seenAt, seconds } = {}) {
  const path = normalizeVisitPath(landing);
  if (!path && !(Number(seconds) > 0)) return [];
  return [
    formatJourneyPage({
      id: 'landing',
      path: path || '/',
      pageTitle: titleForVisitPath(path || '/'),
      visitedAt: seenAt,
      durationSeconds: Number(seconds) || 0,
    }),
  ];
}

/** Recorrido en orden, sin repetir la misma página seguida. */
export function journeyTrail(rows = [], landingPath = '') {
  const ordered = [...rows].sort((a, b) => {
    const aTime = new Date(a?.visited_at || a?.visitedAt || 0).getTime();
    const bTime = new Date(b?.visited_at || b?.visitedAt || 0).getTime();
    return (Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime);
  });
  const stops = [];
  for (const row of ordered) {
    const path = normalizeVisitPath(row?.path || row?.page_url || '');
    if (!path) continue;
    const title = String(row?.page_title || row?.pageTitle || '').trim() || titleForVisitPath(path);
    const previous = stops[stops.length - 1];
    if (previous && previous.path === path) continue;
    stops.push({ path, title });
  }

  const landing = normalizeVisitPath(landingPath);
  if (landing) {
    const landingTitle = titleForVisitPath(landing);
    const first = stops[0];
    if (!first) {
      stops.push({ path: landing, title: landingTitle });
    } else if (first.path !== landing && first.title !== landingTitle) {
      stops.unshift({ path: landing, title: landingTitle });
    }
  }

  return stops.slice(0, 12);
}

const CAMPAIGN_LANDING_TITLE = 'Landing B2';

export function continuedPastLanding(stops = []) {
  return stops.some((stop) => stop?.title && stop.title !== CAMPAIGN_LANDING_TITLE);
}

function landingStops(visit) {
  return Array.isArray(visit?.stops)
    ? visit.stops
    : journeyTrail(visit?.pages || [], visit?.landing);
}

/** Visitas a la landing de B2: se quedan o abren otra página, y a qué secciones llegan. */
export function summarizeLandingPass(visits = []) {
  let stayed = 0;
  let passed = 0;
  const destinationCounts = new Map();
  for (const visit of visits) {
    if (landingLabelFromPath(visit?.landing) !== CAMPAIGN_LANDING_TITLE) continue;
    const stops = landingStops(visit);
    if (!continuedPastLanding(stops)) {
      stayed += 1;
      continue;
    }
    passed += 1;
    const seen = new Set();
    for (const stop of stops) {
      const title = String(stop?.title || '').trim();
      if (!title || title === CAMPAIGN_LANDING_TITLE || seen.has(title)) continue;
      seen.add(title);
      destinationCounts.set(title, (destinationCounts.get(title) || 0) + 1);
    }
  }
  const total = stayed + passed;
  const rate = (count) => (total ? Math.round((count / total) * 100) : 0);
  const destinations = [...destinationCounts.entries()]
    .map(([name, totalVisits]) => ({ name, total: totalVisits }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'));
  return { stayed, passed, total, stayedRate: rate(stayed), passedRate: rate(passed), destinations };
}

export function mergeVisitorJourneySources({
  visitorPages = [],
  userPages = [],
  eventPages = [],
  fallback = [],
} = {}) {
  const collected = [...visitorPages, ...userPages, ...eventPages];
  const rows = collected.length ? collected : fallback;
  const seen = new Set();
  return rows
    .map((row, index) => formatJourneyPage(row, index))
    .filter((row) => {
      const key = pageKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aTime = a.visitedAt ? new Date(a.visitedAt).getTime() : 0;
      const bTime = b.visitedAt ? new Date(b.visitedAt).getTime() : 0;
      return bTime - aTime;
    });
}
