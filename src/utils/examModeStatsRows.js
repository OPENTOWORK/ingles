import { getLevelFullExamSections } from '@/data/nivelesLevelHub';
import { getLevelsPartScoring } from '@/utils/levelsA2PartScoring';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';
import {
  B2_PART_SCORING_V2,
  B2_PAPER_SCORING_V2,
} from '@/utils/levelsB2PartScoring';
import { maxPointsForPartRange } from '@/utils/b2ScoringV2Engine';

function partMaxScore(slug, partNumber) {
  const key = String(slug || '').toLowerCase();
  if (key === 'b2' && isB2ScoringV2Enabled() && partNumber >= 1 && partNumber <= 7) {
    return B2_PART_SCORING_V2[partNumber]?.maxPoints ?? getLevelsPartScoring(slug, partNumber)?.total ?? 1;
  }
  return getLevelsPartScoring(slug, partNumber)?.total ?? 1;
}

/** Scores vacíos por sección (todas las partes a 0 con totales del examen). */
export function buildEmptySectionScores(slug, partMin, partMax) {
  let total = 0;
  /** @type {Record<number, { correct: number, total: number, passing: number, maxPoints?: number, pointsEarned?: number, scoringVersion?: number }>} */
  const byPart = {};

  for (let p = partMin; p <= partMax; p += 1) {
    const cfg = getLevelsPartScoring(slug, p);
    const partTotal = partMaxScore(slug, p);
    const passing = cfg?.passing ?? Math.max(1, Math.ceil(partTotal * 0.6));
    const v2 = String(slug).toLowerCase() === 'b2' && isB2ScoringV2Enabled() && p >= 1 && p <= 7;
    byPart[p] = {
      correct: 0,
      total: partTotal,
      passing,
      ...(v2
        ? {
            scoringVersion: 2,
            pointsEarned: 0,
            maxPoints: partTotal,
            correctItems: 0,
            totalQuestions: B2_PART_SCORING_V2[p]?.questionCount ?? partTotal,
          }
        : {}),
    };
    total += partTotal;
  }

  const result = { correct: 0, total, byPart, scoringVersion: 1 };

  if (String(slug).toLowerCase() === 'b2' && isB2ScoringV2Enabled()) {
    result.scoringVersion = 2;
    result.pointsEarned = 0;
    result.maxPoints = total;
    if (partMin <= 7 && partMax >= 1) {
      const hasReading = B2_PAPER_SCORING_V2.reading.parts.some((p) => p >= partMin && p <= partMax);
      const hasUoe = B2_PAPER_SCORING_V2.useOfEnglish.parts.some((p) => p >= partMin && p <= partMax);
      if (hasReading) {
        result.reading = {
          pointsEarned: 0,
          maxPoints: maxPointsForPartRange(
            Math.max(partMin, 1),
            Math.min(partMax, 7),
            B2_PART_SCORING_V2,
          ),
        };
      }
      if (hasUoe) {
        result.useOfEnglish = {
          pointsEarned: 0,
          maxPoints: maxPointsForPartRange(
            Math.max(partMin, 2),
            Math.min(partMax, 4),
            B2_PART_SCORING_V2,
          ),
        };
      }
    }
  }

  return result;
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
  const v2 = incoming?.scoringVersion === 2 || base.scoringVersion === 2;
  const fullSectionTotal = base.total;

  for (let p = row.partMin; p <= row.partMax; p += 1) {
    const src = incoming?.byPart?.[p];
    if (!src) continue;
    const cfg = getLevelsPartScoring(slug, p);
    const partTotal =
      src.maxPoints ?? src.total ?? partMaxScore(slug, p) ?? cfg?.total ?? base.byPart[p].total;
    const partCorrect = v2
      ? Math.max(0, Number(src.pointsEarned ?? src.correct) || 0)
      : Math.max(0, Number(src.correct) || 0);
    const passing = src.passing ?? cfg?.passing ?? base.byPart[p].passing;
    byPart[p] = {
      ...base.byPart[p],
      ...src,
      correct: v2 ? partCorrect : partCorrect,
      total: partTotal,
      passing,
      ...(v2
        ? {
            scoringVersion: 2,
            pointsEarned: partCorrect,
            maxPoints: partTotal,
            correctItems: src.correctItems ?? src.correct ?? 0,
          }
        : {}),
    };
    correct += partCorrect;
  }

  if (
    correct === 0 &&
    (!incoming?.byPart || Object.keys(incoming.byPart).length === 0) &&
    (incoming?.correct != null || incoming?.total != null)
  ) {
    correct = Math.max(0, Number(incoming.pointsEarned ?? incoming.correct) || 0);
  }

  const total = fullSectionTotal;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return {
    ...row,
    scores: {
      correct,
      total,
      byPart,
      scoringVersion: v2 ? 2 : 1,
      ...(v2
        ? {
            pointsEarned: correct,
            maxPoints: total,
            reading: incoming?.reading,
            useOfEnglish: incoming?.useOfEnglish,
          }
        : {}),
    },
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
    const preview = sec.sectionDraft?.scorePreview;
    let scores = null;
    if (sec.status === 'completed' && sec.scores) {
      scores = sec.scores;
    } else if (preview) {
      scores = preview;
    } else if (sec.scores && (sec.scores.correct > 0 || sec.scores.total > 0)) {
      scores = sec.scores;
    }

    if (scores) {
      next = applyScoresToRow(next, scores, slug);
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
  // During an active exam attempt, skill-practice puntuaciones must not bleed into statistics.
  if (session?.status === 'in_progress') {
    return rows;
  }

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
 * Combina plantilla y sesión de exam mode.
 * Skill-practice puntuaciones are intentionally excluded — separate attempts.
 */
export function mergeExamModeStatsRows({ slug, session, puntuacionesRows = [], estadisticasRows = [] }) {
  let rows = buildDefaultExamModeRows(slug, session);
  rows = applySessionScoresToRows(rows, session, slug);
  const estadisticas = aggregateExamEstadisticas(estadisticasRows, puntuacionesRows);
  return { rows, estadisticas };
}
