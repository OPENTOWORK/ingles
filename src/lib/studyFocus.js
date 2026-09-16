import { formatSessionDuration, parseDbTimestamp, withinDateRange } from '@/lib/userActivity';

/**
 * Clasificación de rutas para el seguimiento de estudio.
 *
 * El navegador no permite saber a qué sitios externos va el alumno: solo podemos
 * medir el tiempo dentro de Dralo y el tiempo conectado sin actividad atribuible
 * (pestaña en segundo plano o inactividad).
 */
const STUDY_AREA_RULES = [
  { area: 'Exam practice', prefixes: ['/niveles', '/exam-practice'] },
  { area: 'Exam strategies', prefixes: ['/teoria', '/exam-strategies'] },
  { area: 'Training', prefixes: ['/training'] },
  { area: 'Speaking', prefixes: ['/speaking', '/speaking-lab'] },
  { area: 'Dralo AI', prefixes: ['/dralo-ai'] },
  { area: 'Placement test', prefixes: ['/prueba-nivel', '/placement'] },
];

const NON_STUDY_AREA_RULES = [
  { area: 'Paneles de staff', prefixes: ['/admin', '/teacher', '/coordinador', '/paneles'] },
  { area: 'Buzón', prefixes: ['/buzon'] },
  { area: 'Tareas', prefixes: ['/tareas'] },
  { area: 'Perfil', prefixes: ['/perfil', '/profile'] },
  { area: 'Marketing y blog', prefixes: ['/blog', '/precios', '/campana', '/contact', '/contacto'] },
  { area: 'Acceso', prefixes: ['/login', '/registro', '/register', '/auth'] },
];

function normalizePath(path = '') {
  const clean = String(path || '').split('?')[0].trim();
  if (!clean) return '/';
  const withoutTrailing = clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
  return withoutTrailing || '/';
}

function matchesPrefix(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Devuelve el área de la ruta y si cuenta como tiempo de estudio real. */
export function classifyStudyPath(path) {
  const normalized = normalizePath(path);

  for (const rule of STUDY_AREA_RULES) {
    if (rule.prefixes.some((prefix) => matchesPrefix(normalized, prefix))) {
      return { area: rule.area, isStudy: true };
    }
  }

  for (const rule of NON_STUDY_AREA_RULES) {
    if (rule.prefixes.some((prefix) => matchesPrefix(normalized, prefix))) {
      return { area: rule.area, isStudy: false };
    }
  }

  if (normalized === '/') return { area: 'Inicio', isStudy: false };
  return { area: 'Otras páginas', isStudy: false };
}

function ratio(part, total) {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Métricas de seguimiento por alumno a partir de navegación y sesiones.
 *
 * - `studySeconds`: tiempo en páginas de estudio.
 * - `browsingSeconds`: tiempo en páginas de la plataforma que no son estudio.
 * - `unattributedSeconds`: tiempo conectado sin página activa (pestaña en segundo
 *   plano o inactividad). Es la señal más cercana a "no está estudiando".
 */
export function buildStudyFocusByUser(pageViews, sessions, { startDate = '', endDate = '' } = {}) {
  /** @type {Map<string, any>} */
  const byUser = new Map();

  const ensureUser = (userId) => {
    const key = String(userId);
    if (!byUser.has(key)) {
      byUser.set(key, {
        userId: key,
        studySeconds: 0,
        browsingSeconds: 0,
        sessionSeconds: 0,
        sessionCount: 0,
        pageViewCount: 0,
        lastActivityAt: null,
        areaSeconds: new Map(),
      });
    }
    return byUser.get(key);
  };

  for (const row of pageViews || []) {
    if (!row?.user_id) continue;
    if (!withinDateRange(row.visited_at, startDate, endDate)) continue;

    const entry = ensureUser(row.user_id);
    const seconds = Math.max(0, Number(row.duration_seconds) || 0);
    const { area, isStudy } = classifyStudyPath(row.path);

    if (isStudy) entry.studySeconds += seconds;
    else entry.browsingSeconds += seconds;

    entry.pageViewCount += 1;
    entry.areaSeconds.set(area, (entry.areaSeconds.get(area) || 0) + seconds);

    const visited = parseDbTimestamp(row.visited_at);
    if (visited && (!entry.lastActivityAt || visited > entry.lastActivityAt)) {
      entry.lastActivityAt = visited;
    }
  }

  for (const row of sessions || []) {
    if (!row?.user_id) continue;
    if (!withinDateRange(row.started_at, startDate, endDate)) continue;

    const entry = ensureUser(row.user_id);
    entry.sessionSeconds += Math.max(0, Number(row.duration_seconds) || 0);
    entry.sessionCount += 1;
  }

  return Array.from(byUser.values())
    .map((entry) => {
      const trackedSeconds = entry.studySeconds + entry.browsingSeconds;
      const unattributedSeconds = Math.max(0, entry.sessionSeconds - trackedSeconds);
      const focusBase = trackedSeconds + unattributedSeconds;

      const topAreas = Array.from(entry.areaSeconds.entries())
        .map(([area, seconds]) => ({
          area,
          seconds,
          label: formatSessionDuration(seconds),
          isStudy: STUDY_AREA_RULES.some((rule) => rule.area === area),
        }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 4);

      return {
        userId: entry.userId,
        studySeconds: entry.studySeconds,
        studyLabel: formatSessionDuration(entry.studySeconds),
        browsingSeconds: entry.browsingSeconds,
        browsingLabel: formatSessionDuration(entry.browsingSeconds),
        unattributedSeconds,
        unattributedLabel: formatSessionDuration(unattributedSeconds),
        sessionSeconds: entry.sessionSeconds,
        sessionLabel: formatSessionDuration(entry.sessionSeconds),
        sessionCount: entry.sessionCount,
        pageViewCount: entry.pageViewCount,
        focusRatio: ratio(entry.studySeconds, focusBase),
        lastActivityAt: entry.lastActivityAt ? entry.lastActivityAt.toISOString() : null,
        topAreas,
      };
    })
    .filter((entry) => entry.sessionSeconds > 0 || entry.studySeconds > 0 || entry.browsingSeconds > 0)
    .sort((a, b) => b.studySeconds - a.studySeconds);
}

/** Totales del panel de seguimiento. */
export function summarizeStudyFocus(users) {
  const rows = users || [];
  const studySeconds = rows.reduce((sum, row) => sum + row.studySeconds, 0);
  const browsingSeconds = rows.reduce((sum, row) => sum + row.browsingSeconds, 0);
  const unattributedSeconds = rows.reduce((sum, row) => sum + row.unattributedSeconds, 0);
  const totalSeconds = studySeconds + browsingSeconds + unattributedSeconds;
  const studentsWithStudy = rows.filter((row) => row.studySeconds > 0).length;

  const avgStudySeconds = studentsWithStudy > 0 ? Math.round(studySeconds / studentsWithStudy) : 0;

  return {
    trackedUsers: rows.length,
    studentsWithStudy,
    studySeconds,
    studyLabel: formatSessionDuration(studySeconds),
    browsingSeconds,
    browsingLabel: formatSessionDuration(browsingSeconds),
    unattributedSeconds,
    unattributedLabel: formatSessionDuration(unattributedSeconds),
    avgStudySeconds,
    avgStudyLabel: formatSessionDuration(avgStudySeconds),
    focusRatio: ratio(studySeconds, totalSeconds),
  };
}
