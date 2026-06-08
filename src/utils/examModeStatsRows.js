import { getLevelFullExamSections } from '@/data/nivelesLevelHub';
import { getLevelsPartScoring } from '@/utils/levelsA2PartScoring';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

/** Scores vacíos por sección (todas las partes a 0 con totales del examen). */
export function buildEmptySectionScores(slug, partMin, partMax) {
  let total = 0;
  /** @type {Record<number, { correct: number, total: number, passing: number }>} */
  const byPart = {};

  for (let p = partMin; p <= partMax; p += 1) {
    const cfg = getLevelsPartScoring(slug, p);
    const partTotal = cfg?.total ?? 1;
    const passing = cfg?.passing ?? Math.max(1, Math.ceil(partTotal * 0.6));
    byPart[p] = { correct: 0, total: partTotal, passing };
    total += partTotal;
  }

  return { correct: 0, total, byPart };
}

/**
 * Filas base del examen: estructura completa con ceros y estados de sesión (si existe).
 * @param {string} slug
 * @param {import('@/utils/examModeSession').ExamModeSession | null} [session]
 */
export function buildDefaultExamModeRows(slug, session = null) {
  const sections = getLevelFullExamSections(slug);
  const sessionByKey = new Map((session?.sections || []).map((s) => [s.key, s]));

  return sections.map((sec, idx) => {
    const sessionSec = sessionByKey.get(sec.key);
    const scores = buildEmptySectionScores(slug, sec.partMin, sec.partMax);

    let status = 'locked';
    if (sessionSec?.status) {
      status = sessionSec.status;
    } else if (idx === 0) {
      status = 'active';
    }

    return {
      key: sec.key,
      title: sec.title,
      emoji: sec.emoji,
      href: sec.href,
      partMin: sec.partMin,
      partMax: sec.partMax,
      partsLabel: sec.partsLabel,
      status,
      scores,
      pct: 0,
    };
  });
}

function applyScoresToRow(row, incoming, slug) {
  const base = buildEmptySectionScores(slug, row.partMin, row.partMax);
  const byPart = { ...base.byPart };
  let correct = 0;
  let total = 0;

  for (let p = row.partMin; p <= row.partMax; p += 1) {
    const src = incoming?.byPart?.[p];
    if (!src) continue;
    const cfg = getLevelsPartScoring(slug, p);
    const partTotal = src.total ?? cfg?.total ?? base.byPart[p].total;
    const partCorrect = Math.max(0, Number(src.correct) || 0);
    const passing = src.passing ?? cfg?.passing ?? base.byPart[p].passing;
    byPart[p] = { correct: partCorrect, total: partTotal, passing };
    correct += partCorrect;
    total += partTotal;
  }

  if (!incoming?.byPart || Object.keys(incoming.byPart).length === 0) {
    if (incoming?.correct != null || incoming?.total != null) {
      correct = Math.max(0, Number(incoming.correct) || 0);
      total = Math.max(0, Number(incoming.total) || row.scores.total);
    }
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return {
    ...row,
    scores: { correct, total, byPart },
    pct,
  };
}

/** Aplica puntuaciones de la sesión local (intento actual en exam mode). */
export function applySessionScoresToRows(rows, session, slug) {
  if (!session?.sections?.length) return rows;

  const byKey = Object.fromEntries(session.sections.map((s) => [s.key, s]));

  return rows.map((row) => {
    const sec = byKey[row.key];
    if (!sec) return row;

    let next = { ...row, status: sec.status || row.status };
    if (sec.scores && (sec.status === 'completed' || sec.scores.total > 0)) {
      next = applyScoresToRow(next, sec.scores, slug);
    }
    return next;
  });
}

/**
 * Normaliza filas de levels_puntuaciones a mapa parte → score.
 * @param {Array<object>} puntuacionesRows
 */
export function puntuacionesToPartMap(puntuacionesRows = []) {
  /** @type {Record<number, { correct: number, total: number, passing?: number, aprobado?: boolean, preguntaId?: string }>} */
  const byPart = {};

  for (const row of puntuacionesRows) {
    let partNumber = Number(row.parte_numero);
    let correct = Number(row.correctas);
    let total = Number(row.total_preguntas);
    let aprobado = row.aprobado === true;

    const meta = parseUoePartDescripcion(row.descripcion);
    if (!partNumber && meta) partNumber = meta.parteNumero;
    if (!Number.isFinite(correct) && meta) correct = meta.correctas;
    if (!Number.isFinite(total) && meta) total = meta.total;
    if (!aprobado && meta) aprobado = meta.aprobado;

    if (!partNumber) continue;

    byPart[partNumber] = {
      correct: Math.max(0, correct || 0),
      total: Math.max(1, total || 1),
      aprobado,
      preguntaId: row.id_pregunta,
    };
  }

  return byPart;
}

/** Superpone levels_puntuaciones (Supabase) sobre filas; la sesión local tiene prioridad si ya completó la sección. */
export function applyPuntuacionesToRows(rows, puntuacionesRows, slug, session = null) {
  const partMap = puntuacionesToPartMap(puntuacionesRows);
  const sessionCompletedKeys = new Set(
    (session?.sections || []).filter((s) => s.status === 'completed').map((s) => s.key),
  );

  return rows.map((row) => {
    if (sessionCompletedKeys.has(row.key)) return row;

    const byPart = {};
    let hasData = false;

    for (let p = row.partMin; p <= row.partMax; p += 1) {
      const saved = partMap[p];
      if (!saved) continue;
      hasData = true;
      const cfg = getLevelsPartScoring(slug, p);
      byPart[p] = {
        correct: saved.correct,
        total: saved.total ?? cfg?.total ?? 1,
        passing: cfg?.passing,
      };
    }

    if (!hasData) return row;

    const incoming = {
      byPart,
      correct: Object.values(byPart).reduce((n, x) => n + x.correct, 0),
      total: Object.values(byPart).reduce((n, x) => n + x.total, 0),
    };

    let next = applyScoresToRow(row, incoming, slug);
    const allPartsInSection = row.partMax - row.partMin + 1;
    const partsWithScore = Object.keys(byPart).length;
    if (partsWithScore >= allPartsInSection) {
      next = { ...next, status: 'completed' };
    } else if (partsWithScore > 0) {
      next = { ...next, status: row.status === 'locked' ? 'active' : row.status };
    }
    return next;
  });
}

/**
 * Agrega métricas de levels_estadisticas para las preguntas del examen.
 * @param {Array<object>} estadisticasRows
 * @param {Array<object>} puntuacionesRows
 */
export function aggregateExamEstadisticas(estadisticasRows = [], puntuacionesRows = []) {
  const preguntaIds = new Set(
    puntuacionesRows.map((r) => r.id_pregunta).filter(Boolean),
  );

  let intentos = 0;
  let evaluadas = 0;
  let correctas = 0;
  let tiempoSegundos = 0;

  for (const row of estadisticasRows) {
    if (!preguntaIds.has(row.pregunta_id)) continue;
    intentos += Number(row.intentos_completados) || 0;
    evaluadas += Number(row.respuestas_evaluadas) || 0;
    correctas += Number(row.respuestas_correctas) || 0;
    tiempoSegundos += Number(row.tiempo_segundos_total) || 0;
  }

  return { intentos, evaluadas, correctas, tiempoSegundos };
}

/**
 * Combina plantilla, sesión local y Supabase.
 */
export function mergeExamModeStatsRows({ slug, session, puntuacionesRows = [], estadisticasRows = [] }) {
  let rows = buildDefaultExamModeRows(slug, session);
  rows = applyPuntuacionesToRows(rows, puntuacionesRows, slug, session);
  rows = applySessionScoresToRows(rows, session, slug);
  const estadisticas = aggregateExamEstadisticas(estadisticasRows, puntuacionesRows);
  return { rows, estadisticas };
}
