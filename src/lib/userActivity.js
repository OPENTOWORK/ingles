/** Umbral para considerar al usuario conectado (último ping). */
export const ONLINE_THRESHOLD_MS = 90 * 1000;

/** Si pasan más de 5 min sin ping, se abre una sesión nueva. */
export const SESSION_GAP_MS = 5 * 60 * 1000;

/** Intervalo de heartbeat en cliente (ms). */
export const HEARTBEAT_INTERVAL_MS = 60 * 1000;

/** @type {Record<string, string>} */
export const DEVICE_TYPE_LABELS = {
  mobile: 'Móvil',
  tablet: 'Tablet',
  desktop: 'Ordenador',
};

/** @param {string | null | undefined} deviceType */
export function formatDeviceTypeLabel(deviceType) {
  if (!deviceType) return '—';
  return DEVICE_TYPE_LABELS[deviceType] || '—';
}

/** Retraso del primer ping para no ralentizar la carga inicial. */
export const HEARTBEAT_INITIAL_DELAY_MS = 20 * 1000;

export function parseDbTimestamp(value) {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  if (/[zZ]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(`${normalized}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isUserOnline(lastSeenAt, now = Date.now()) {
  const seen = parseDbTimestamp(lastSeenAt);
  if (!seen) return false;
  return now - seen.getTime() <= ONLINE_THRESHOLD_MS;
}

export function formatSessionDuration(totalSeconds) {
  const sec = Math.max(0, Number(totalSeconds) || 0);
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h} h ${rm} min` : `${h} h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d} d ${rh} h` : `${d} d`;
}

export function formatDateByPeriod(dateValue, period) {
  const date = parseDbTimestamp(dateValue) || new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  if (period === 'anios') return `${date.getUTCFullYear()}`;
  if (period === 'meses') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  if (period === 'semanas') {
    const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
  return date.toISOString().slice(0, 10);
}

export function withinDateRange(dateValue, startDate, endDate) {
  const target = parseDbTimestamp(dateValue)?.getTime();
  if (target == null || Number.isNaN(target)) return false;
  if (startDate) {
    const min = new Date(`${startDate}T00:00:00Z`).getTime();
    if (target < min) return false;
  }
  if (endDate) {
    const max = new Date(`${endDate}T23:59:59.999Z`).getTime();
    if (target > max) return false;
  }
  return true;
}

/**
 * Agrupa sesiones por intervalo. Tiempo medio = suma del tiempo de cada usuario activo
 * en el intervalo / número de usuarios con actividad.
 */
export function buildConnectionAnalytics(sessions, startDate, endDate) {
  const hours = {};
  const weekdays = {};
  const heatmapMap = {};
  let totalSeconds = 0;
  let sessionCount = 0;
  const users = new Set();

  for (const row of sessions || []) {
    if (!withinDateRange(row.started_at, startDate, endDate)) continue;
    sessionCount += 1;
    const sec = Number(row.duration_seconds) || 0;
    totalSeconds += sec;
    if (row.user_id) users.add(row.user_id);

    const d = parseDbTimestamp(row.started_at);
    if (!d) continue;
    const hour = d.getHours();
    const day = d.toLocaleDateString('es-ES', { weekday: 'short' });
    hours[hour] = (hours[hour] || 0) + 1;
    weekdays[day] = (weekdays[day] || 0) + 1;
    const heatKey = `${day} ${String(hour).padStart(2, '0')}:00`;
    heatmapMap[heatKey] = (heatmapMap[heatKey] || 0) + 1;
  }

  const activeUsers = users.size;
  const horaPicoEntry = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
  const diaPicoEntry = Object.entries(weekdays).sort((a, b) => b[1] - a[1])[0];
  const heatmap = Object.entries(heatmapMap)
    .map(([slot, total]) => ({ slot, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const avgPerUserSeconds =
    activeUsers > 0 ? Math.round(totalSeconds / activeUsers) : 0;

  return {
    totalSessionSeconds: totalSeconds,
    totalSessionLabel: formatSessionDuration(totalSeconds),
    sessionCount,
    activeUsers,
    avgPerUserSeconds,
    avgPerUserLabel: formatSessionDuration(avgPerUserSeconds),
    horaPico: horaPicoEntry ? `${horaPicoEntry[0]}:00` : '-',
    diaPico: diaPicoEntry?.[0] ?? '-',
    heatmap,
  };
}

/** Agrupa sesiones por día calendario (locale es-ES) para la ficha de alumno. */
export function groupSessionsByDate(sessions) {
  /** @type {Map<string, { date: string, totalSeconds: number, sessions: object[] }>} */
  const byDate = new Map();

  for (const row of sessions || []) {
    const started = parseDbTimestamp(row.started_at);
    if (!started) continue;
    const dateKey = started.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const sec = Number(row.duration_seconds) || 0;
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { date: dateKey, totalSeconds: 0, sessions: [] });
    }
    const bucket = byDate.get(dateKey);
    bucket.totalSeconds += sec;
    bucket.sessions.push({
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at || null,
      durationSeconds: sec,
      durationLabel: formatSessionDuration(sec),
      deviceType: row.device_type || null,
      deviceLabel: formatDeviceTypeLabel(row.device_type),
      startedLabel: started.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  return Array.from(byDate.values())
    .map((bucket) => ({
      ...bucket,
      totalLabel: formatSessionDuration(bucket.totalSeconds),
      sessions: bucket.sessions.sort((a, b) => {
        const ta = parseDbTimestamp(a.startedAt)?.getTime() || 0;
        const tb = parseDbTimestamp(b.startedAt)?.getTime() || 0;
        return tb - ta;
      }),
    }))
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    });
}

/** Usuarios con sesiones en el rango, agrupados por franja horaria de inicio. */
export function buildActiveUsersActivityReport(sessions, startDate, endDate) {
  /** @type {Map<string, { userId: string, totalSeconds: number, sessionCount: number, slotMap: Map<string, { slot: string, count: number, totalSeconds: number }> }>} */
  const byUser = new Map();

  for (const row of sessions || []) {
    if (!withinDateRange(row.started_at, startDate, endDate)) continue;
    if (!row.user_id) continue;

    const userId = String(row.user_id);
    const sec = Number(row.duration_seconds) || 0;

    if (!byUser.has(userId)) {
      byUser.set(userId, { userId, totalSeconds: 0, sessionCount: 0, slotMap: new Map() });
    }
    const bucket = byUser.get(userId);
    bucket.totalSeconds += sec;
    bucket.sessionCount += 1;

    const d = parseDbTimestamp(row.started_at);
    if (!d) continue;
    const day = d.toLocaleDateString('es-ES', { weekday: 'short' });
    const slot = `${day} ${String(d.getHours()).padStart(2, '0')}:00`;
    const existing = bucket.slotMap.get(slot) || { slot, count: 0, totalSeconds: 0 };
    existing.count += 1;
    existing.totalSeconds += sec;
    bucket.slotMap.set(slot, existing);
  }

  return Array.from(byUser.values())
    .map((entry) => ({
      userId: entry.userId,
      totalSeconds: entry.totalSeconds,
      totalLabel: formatSessionDuration(entry.totalSeconds),
      sessionCount: entry.sessionCount,
      timeSlots: Array.from(entry.slotMap.values()).sort(
        (a, b) => b.count - a.count || b.totalSeconds - a.totalSeconds,
      ),
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function buildSessionChartSeries(sessions, period, startDate, endDate) {
  /** @type {Map<string, Map<string, number>>} */
  const bucketUserSeconds = new Map();

  for (const row of sessions || []) {
    if (!withinDateRange(row.started_at, startDate, endDate)) continue;
    const bucket = formatDateByPeriod(row.started_at, period);
    if (!bucket || !row.user_id) continue;

    if (!bucketUserSeconds.has(bucket)) {
      bucketUserSeconds.set(bucket, new Map());
    }
    const userMap = bucketUserSeconds.get(bucket);
    userMap.set(
      row.user_id,
      (userMap.get(row.user_id) || 0) + Number(row.duration_seconds || 0),
    );
  }

  return Array.from(bucketUserSeconds.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, userMap]) => {
      const perUserTotals = Array.from(userMap.values());
      const activeUsers = perUserTotals.length;
      const totalSec = perUserTotals.reduce((sum, sec) => sum + sec, 0);
      const avgSessionSeconds =
        activeUsers > 0 ? Math.round(totalSec / activeUsers) : 0;

      return {
        bucket,
        userCount: activeUsers,
        activeUsers,
        avgSessionSeconds,
        avgSessionLabel: formatSessionDuration(avgSessionSeconds),
      };
    });
}
