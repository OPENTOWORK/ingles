const CLARITY_API_URL = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';
const CACHE_TTL_MS = 45 * 60 * 1000;

const cacheByKey = new Map();

function pickUrl(row) {
  return row.URL || row.Url || row.url || row['Popular Pages'] || null;
}

function pickCount(row, keys = []) {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return Number(row.totalSessionCount) || Number(row.count) || Number(row.value) || 0;
}

function rowsByUrl(rows, valueKeys) {
  const map = new Map();
  for (const row of rows) {
    const url = pickUrl(row);
    if (!url) continue;
    const count = pickCount(row, valueKeys);
    if (!count) continue;
    map.set(url, (map.get(url) || 0) + count);
  }
  return [...map.entries()]
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count);
}

export function parseClarityInsights(raw, numOfDays = 3) {
  if (!Array.isArray(raw)) {
    return {
      summary: { totalSessions: 0, totalUsers: 0, numOfDays },
      topPages: [],
      rageClicks: [],
      deadClicks: [],
      quickbackClicks: [],
      excessiveScroll: [],
      engagementByUrl: [],
      scrollDepthByUrl: [],
      metricNames: [],
    };
  }

  const byMetric = {};
  for (const block of raw) {
    if (!block?.metricName) continue;
    byMetric[block.metricName] = Array.isArray(block.information) ? block.information : [];
  }

  const trafficRows = byMetric.Traffic || [];
  let totalSessions = 0;
  let totalUsers = 0;

  const topPages = trafficRows
    .map((row) => {
      const url = pickUrl(row);
      const sessions = Number(row.totalSessionCount) || 0;
      const users = Number(row.distantUserCount) || 0;
      totalSessions += sessions;
      totalUsers += users;
      return {
        url: url || '(sin URL)',
        sessions,
        users,
        pagesPerSession: row.PagesPerSessionPercentage ?? null,
      };
    })
    .filter((row) => row.sessions > 0 || row.users > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20);

  return {
    summary: {
      totalSessions,
      totalUsers,
      numOfDays,
      rageClickTotal: sumMetric(byMetric['Rage Click Count']),
      deadClickTotal: sumMetric(byMetric['Dead Click Count']),
      quickbackTotal: sumMetric(byMetric['Quickback Click']),
      errorClickTotal: sumMetric(byMetric['Error Click Count']),
    },
    topPages,
    rageClicks: rowsByUrl(byMetric['Rage Click Count'] || [], ['rageClickCount', 'Rage Click Count']),
    deadClicks: rowsByUrl(byMetric['Dead Click Count'] || [], ['deadClickCount', 'Dead Click Count']),
    quickbackClicks: rowsByUrl(byMetric['Quickback Click'] || [], ['quickbackClick', 'Quickback Click']),
    excessiveScroll: rowsByUrl(byMetric['Excessive Scroll'] || [], ['excessiveScroll', 'Excessive Scroll']),
    engagementByUrl: rowsByUrl(byMetric['Engagement Time'] || [], ['engagementTime', 'Engagement Time']),
    scrollDepthByUrl: rowsByUrl(byMetric['Scroll Depth'] || [], ['scrollDepth', 'Scroll Depth']),
    metricNames: Object.keys(byMetric),
  };
}

function sumMetric(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((acc, row) => acc + pickCount(row), 0);
}

export async function fetchClarityInsights({
  numOfDays = 3,
  dimension1 = 'URL',
  dimension2 = '',
  dimension3 = '',
  forceRefresh = false,
} = {}) {
  const token = process.env.CLARITY_API_TOKEN?.trim();
  if (!token) {
    return {
      ok: false,
      error: 'not_configured',
      message: 'Falta CLARITY_API_TOKEN en el servidor.',
    };
  }

  const safeDays = [1, 2, 3].includes(Number(numOfDays)) ? Number(numOfDays) : 3;
  const cacheKey = `${safeDays}|${dimension1}|${dimension2}|${dimension3}`;
  const cached = cacheByKey.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ok: true, cached: true, fetchedAt: cached.at, ...cached.data };
  }

  const params = new URLSearchParams({
    numOfDays: String(safeDays),
    dimension1,
  });
  if (dimension2) params.set('dimension2', dimension2);
  if (dimension3) params.set('dimension3', dimension3);

  const res = await fetch(`${CLARITY_API_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    return {
      ok: false,
      error: res.status === 429 ? 'rate_limit' : 'api_error',
      status: res.status,
      message: message || res.statusText,
    };
  }

  const responseText = await res.text();
  let raw;
  try {
    raw = JSON.parse(responseText);
  } catch {
    return {
      ok: false,
      error: 'api_error',
      status: res.status,
      message: responseText || 'Respuesta no válida de Clarity.',
    };
  }

  const parsed = parseClarityInsights(raw, safeDays);
  const payload = {
    projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '',
    ...parsed,
  };

  cacheByKey.set(cacheKey, { at: Date.now(), data: payload });

  return { ok: true, cached: false, fetchedAt: Date.now(), ...payload };
}
