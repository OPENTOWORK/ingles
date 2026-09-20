import { formatSessionDuration } from '@/lib/userActivity';

/**
 * Versión del texto de consentimiento. Súbela cuando cambie lo que se explica
 * al alumno: las sesiones guardan la versión que aceptaron.
 */
export const STUDY_CONSENT_VERSION = '2026-09-1';

/** Cada cuánto envía el cliente sus contadores de foco. */
export const STUDY_PING_INTERVAL_MS = 30 * 1000;

/** Sin interacción durante este tiempo, el alumno cuenta como inactivo. */
export const STUDY_IDLE_THRESHOLD_MS = 90 * 1000;

/** Una sesión sin pings durante este tiempo se cierra sola. */
export const STUDY_SESSION_STALE_MS = 10 * 60 * 1000;

/** Tope por ping para que un cliente manipulado no infle los totales. */
const MAX_DELTA_SECONDS = 300;

function clampSeconds(value) {
  const num = Math.floor(Number(value) || 0);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(num, MAX_DELTA_SECONDS);
}

/** Valida y acota un ping del cliente antes de sumarlo. */
export function normalizeFocusDelta(payload = {}) {
  const areas = {};
  const rawAreas = payload?.areas;
  if (rawAreas && typeof rawAreas === 'object' && !Array.isArray(rawAreas)) {
    for (const [area, seconds] of Object.entries(rawAreas)) {
      const clean = clampSeconds(seconds);
      if (clean > 0 && typeof area === 'string' && area.length <= 60) {
        areas[area] = clean;
      }
    }
  }

  return {
    focusSeconds: clampSeconds(payload.focusSeconds),
    awaySeconds: clampSeconds(payload.awaySeconds),
    idleSeconds: clampSeconds(payload.idleSeconds),
    awayEvents: Math.min(Math.max(Math.floor(Number(payload.awayEvents) || 0), 0), 100),
    longestAwaySeconds: clampSeconds(payload.longestAwaySeconds),
    areas,
  };
}

/** Suma un ping a los totales acumulados de la sesión. */
export function accumulateSession(session = {}, delta) {
  const clean = normalizeFocusDelta(delta);
  const areas = { ...(session.areas || {}) };
  for (const [area, seconds] of Object.entries(clean.areas)) {
    areas[area] = (Number(areas[area]) || 0) + seconds;
  }

  return {
    focus_seconds: (Number(session.focus_seconds) || 0) + clean.focusSeconds,
    away_seconds: (Number(session.away_seconds) || 0) + clean.awaySeconds,
    idle_seconds: (Number(session.idle_seconds) || 0) + clean.idleSeconds,
    away_count: (Number(session.away_count) || 0) + clean.awayEvents,
    longest_away_seconds: Math.max(
      Number(session.longest_away_seconds) || 0,
      clean.longestAwaySeconds,
    ),
    areas,
  };
}

function qualityFor(focusRatio) {
  if (focusRatio >= 85) return { key: 'excelente', label: 'Concentración excelente' };
  if (focusRatio >= 70) return { key: 'buena', label: 'Buena concentración' };
  if (focusRatio >= 50) return { key: 'irregular', label: 'Concentración irregular' };
  return { key: 'dispersa', label: 'Sesión muy dispersa' };
}

/**
 * Métricas derivadas de una sesión cerrada o en curso. Es la entrada tanto de la
 * UI como del prompt de resumen.
 */
export function buildStudyReport(session = {}) {
  const focusSeconds = Math.max(0, Number(session.focus_seconds) || 0);
  const awaySeconds = Math.max(0, Number(session.away_seconds) || 0);
  const idleSeconds = Math.max(0, Number(session.idle_seconds) || 0);
  const totalSeconds = focusSeconds + awaySeconds + idleSeconds;

  const focusRatio = totalSeconds > 0 ? Math.round((focusSeconds / totalSeconds) * 100) : 0;
  const awayCount = Math.max(0, Number(session.away_count) || 0);

  const areas = Object.entries(session.areas || {})
    .map(([area, seconds]) => ({
      area,
      seconds: Math.max(0, Number(seconds) || 0),
      label: formatSessionDuration(Math.max(0, Number(seconds) || 0)),
    }))
    .filter((row) => row.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  return {
    sessionId: session.id || null,
    startedAt: session.started_at || null,
    endedAt: session.ended_at || null,
    focusSeconds,
    focusLabel: formatSessionDuration(focusSeconds),
    awaySeconds,
    awayLabel: formatSessionDuration(awaySeconds),
    idleSeconds,
    idleLabel: formatSessionDuration(idleSeconds),
    totalSeconds,
    totalLabel: formatSessionDuration(totalSeconds),
    focusRatio,
    awayCount,
    longestAwaySeconds: Math.max(0, Number(session.longest_away_seconds) || 0),
    longestAwayLabel: formatSessionDuration(Number(session.longest_away_seconds) || 0),
    areas,
    topArea: areas[0]?.area || null,
    quality: qualityFor(focusRatio),
  };
}

/** Totales en pantalla = último snapshot del servidor + tramo aún no enviado. */
export function mergeStudyReportWithBuffer(serverReport, buffer = {}) {
  if (!serverReport) return null;

  const focusSeconds =
    Math.max(0, Number(serverReport.focusSeconds) || 0) +
    Math.max(0, Number(buffer.focusSeconds) || 0);
  const awaySeconds =
    Math.max(0, Number(serverReport.awaySeconds) || 0) +
    Math.max(0, Number(buffer.awaySeconds) || 0);
  const idleSeconds =
    Math.max(0, Number(serverReport.idleSeconds) || 0) +
    Math.max(0, Number(buffer.idleSeconds) || 0);
  const totalSeconds = focusSeconds + awaySeconds + idleSeconds;
  const focusRatio = totalSeconds > 0 ? Math.round((focusSeconds / totalSeconds) * 100) : 0;
  const awayCount =
    Math.max(0, Number(serverReport.awayCount) || 0) +
    Math.max(0, Number(buffer.awayEvents) || 0);

  return {
    ...serverReport,
    focusSeconds,
    focusLabel: formatSessionDuration(focusSeconds),
    awaySeconds,
    awayLabel: formatSessionDuration(awaySeconds),
    idleSeconds,
    idleLabel: formatSessionDuration(idleSeconds),
    totalSeconds,
    totalLabel: formatSessionDuration(totalSeconds),
    focusRatio,
    awayCount,
    quality: qualityFor(focusRatio),
  };
}

/**
 * Resumen determinista. Se usa tal cual si la IA no está disponible y como
 * contexto factual del prompt cuando sí lo está.
 */
export function buildFactualSummary(report) {
  const parts = [
    `Tiempo total: ${report.totalLabel}.`,
    `Estudio concentrado: ${report.focusLabel} (${report.focusRatio}%).`,
  ];

  if (report.awayCount > 0) {
    parts.push(
      `Salió de la página ${report.awayCount} ${
        report.awayCount === 1 ? 'vez' : 'veces'
      }, sumando ${report.awayLabel} (pausa más larga: ${report.longestAwayLabel}).`,
    );
  } else {
    parts.push('No salió de la página en toda la sesión.');
  }

  if (report.idleSeconds > 0) {
    parts.push(`Tiempo sin interactuar: ${report.idleLabel}.`);
  }

  if (report.areas.length > 0) {
    parts.push(
      `Reparto por área: ${report.areas
        .slice(0, 4)
        .map((row) => `${row.area} ${row.label}`)
        .join(', ')}.`,
    );
  }

  return parts.join(' ');
}

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

/** Días consecutivos con al menos una sesión, contando hacia atrás desde hoy. */
export function computeStudyStreak(sessions, now = new Date()) {
  const days = new Set();
  for (const session of sessions || []) {
    const key = dayKey(session.started_at);
    if (key) days.add(key);
  }
  if (days.size === 0) return 0;

  const cursor = new Date(now);
  // Si aún no ha estudiado hoy, la racha sigue viva si estudió ayer.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Histórico de sesiones del alumno con sus totales. */
export function buildTrackRecord(sessions, now = new Date()) {
  const entries = (sessions || []).map((session) => ({
    ...buildStudyReport(session),
    resumen: session.resumen || null,
    resumenSource: session.resumen_bullets?.source || null,
  }));

  const focusSeconds = entries.reduce((sum, entry) => sum + entry.focusSeconds, 0);
  const withTime = entries.filter((entry) => entry.totalSeconds > 0);
  const avgFocusRatio =
    withTime.length > 0
      ? Math.round(withTime.reduce((sum, entry) => sum + entry.focusRatio, 0) / withTime.length)
      : 0;

  return {
    entries,
    totals: {
      sessionCount: entries.length,
      focusSeconds,
      focusLabel: formatSessionDuration(focusSeconds),
      avgFocusRatio,
      bestFocusRatio: entries.reduce((max, entry) => Math.max(max, entry.focusRatio), 0),
      streakDays: computeStudyStreak(sessions, now),
    },
  };
}

/** Prompt de resumen. Solo recibe agregados, nunca contenido del alumno. */
export function buildStudySummaryPrompt(report, { studentName = '' } = {}) {
  return [
    studentName ? `Alumno: ${studentName}.` : 'Alumno anónimo.',
    buildFactualSummary(report),
    '',
    'Escribe un resumen de la sesión de estudio en español de España, dirigido al alumno en segunda persona.',
    'Formato: dos o tres frases seguidas, sin listas ni encabezados, máximo 60 palabras.',
    'Tono cercano y constructivo, de tutor que acompaña. Nada de culpabilizar.',
    'Comenta la concentración, destaca lo que ha ido bien y da UNA recomendación concreta para la próxima sesión.',
    'No inventes datos que no estén arriba. No menciones a qué otras webs o aplicaciones fue: eso no se conoce.',
  ].join('\n');
}
