/** Niveles del heatmap (0 = sin actividad, 4 = máximo). */
export function minutesToIntensity(minutes) {
  const m = Math.max(0, Number(minutes) || 0);
  if (m === 0) return 0;
  if (m < 15) return 1;
  if (m < 30) return 2;
  if (m < 60) return 3;
  return 4;
}

export function formatStudyMinutes(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h} h ${rm} min` : `${h} h`;
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** Mapa fecha → { study_minutes, sessions_count } */
export function rowsToActivityMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const key = row.activity_date || row.activityDate;
    if (!key) continue;
    map.set(String(key).slice(0, 10), {
      study_minutes: Number(row.study_minutes) || 0,
      sessions_count: Number(row.sessions_count) || 0,
    });
  }
  return map;
}

/** Agrupa sesiones de usuario_sesiones_app por día (UTC date). */
export function aggregateSessionsByDay(sessions) {
  const map = new Map();
  for (const row of sessions || []) {
    const started = row.started_at;
    if (!started) continue;
    const key = String(started).slice(0, 10);
    const prev = map.get(key) || { study_minutes: 0, sessions_count: 0 };
    prev.study_minutes += Math.max(0, Math.round((Number(row.duration_seconds) || 0) / 60));
    prev.sessions_count += 1;
    map.set(key, prev);
  }
  return map;
}

/**
 * Cuadrícula tipo GitHub: semanas × 7 días (Dom–Sáb).
 * @param {Map<string, { study_minutes: number, sessions_count: number }>} activityMap
 */
export function buildStudyHeatmapGrid(activityMap, totalWeeks = 52) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const totalDays = totalWeeks * 7;
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (totalDays - 1));
  while (start.getUTCDay() !== 0) {
    start.setUTCDate(start.getUTCDate() - 1);
  }

  const weeks = [];
  const monthLabels = [];
  let cursor = new Date(start);
  let lastMonth = -1;

  while (cursor <= end) {
    const week = [];
    for (let dow = 0; dow < 7; dow += 1) {
      if (cursor > end) {
        week.push(null);
      } else {
        const key = toDateKey(cursor);
        const entry = activityMap.get(key);
        const minutes = entry?.study_minutes ?? 0;
        week.push({
          date: key,
          weekday: cursor.getUTCDay(),
          weekdayLabel: WEEKDAY_LABELS[cursor.getUTCDay()],
          minutes,
          sessions: entry?.sessions_count ?? 0,
          level: minutesToIntensity(minutes),
        });
        const month = cursor.getUTCMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            weekIndex: weeks.length,
            label: MONTH_LABELS[month],
          });
          lastMonth = month;
        }
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthLabels, weekdayLabels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] };
}

export function computeActivitySummary(activityMap) {
  const todayKey = toDateKey(new Date());
  let activeDays = 0;
  let totalMinutes = 0;
  let last90Minutes = 0;
  const sortedKeys = [...activityMap.keys()].sort();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 89);
  const cutoff = toDateKey(ninetyDaysAgo);

  for (const [key, entry] of activityMap) {
    const minutes = entry.study_minutes || 0;
    if (minutes > 0) {
      activeDays += 1;
      totalMinutes += minutes;
    }
    if (key >= cutoff) {
      last90Minutes += minutes;
    }
  }

  let streak = 0;
  if (todayKey) {
    const check = new Date(`${todayKey}T12:00:00Z`);
    for (let i = 0; i < 400; i += 1) {
      const key = toDateKey(check);
      const minutes = activityMap.get(key)?.study_minutes ?? 0;
      if (minutes > 0) {
        streak += 1;
        check.setUTCDate(check.getUTCDate() - 1);
      } else if (i === 0) {
        check.setUTCDate(check.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  const last7Minutes = sortedKeys
    .filter((k) => {
      const d = new Date(`${k}T12:00:00Z`);
      const diff = (Date.now() - d.getTime()) / 86400000;
      return diff >= 0 && diff < 7;
    })
    .reduce((sum, k) => sum + (activityMap.get(k)?.study_minutes ?? 0), 0);

  return {
    activeDays,
    totalMinutes,
    last90Minutes,
    last7Minutes,
    streak,
    totalMinutesLabel: formatStudyMinutes(totalMinutes),
    last7MinutesLabel: formatStudyMinutes(last7Minutes),
    last90MinutesLabel: formatStudyMinutes(last90Minutes),
  };
}
