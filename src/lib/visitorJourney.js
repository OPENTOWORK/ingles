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
