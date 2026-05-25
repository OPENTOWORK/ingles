import { LEVEL_EXAM_SECTION_RANGES } from '@/data/levelExamPartMap';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

const SKILLS = ['reading', 'writing', 'listening', 'speaking'];

const IMPROVEMENT_TIPS = {
  reading: 'Refuerza comprensión lectora y use of English',
  writing: 'Desarrolla técnicas de escritura y estructura',
  listening: 'Refuerza la comprensión auditiva con más práctica',
  speaking: 'Practica fluidez y pronunciación en speaking',
};

function emptySections() {
  return Object.fromEntries(
    SKILLS.map((s) => [s, { attempts: 0, averageScore: 0, bestScore: 0, totalTime: 0, _pctSum: 0, _pctWeight: 0 }]),
  );
}

/** @returns {'reading'|'writing'|'listening'|'speaking'|null} */
export function skillFromPartLabel(label) {
  const s = String(label || '').toLowerCase();
  if (/listening|auditiv|audio/.test(s)) return 'listening';
  if (/speaking|oral|habla/.test(s)) return 'speaking';
  if (/\bwriting\b|escritura/.test(s) && !/reading/.test(s)) return 'writing';
  if (/reading|use of english|use-of-english|lector|gramática|grammar/.test(s)) return 'reading';
  return null;
}

/** @returns {'reading'|'writing'|'listening'|'speaking'|null} */
export function skillFromPartNumber(parteNumero, levelSlug = 'b2') {
  const n = Number(parteNumero);
  if (!n || Number.isNaN(n)) return null;
  const ranges = LEVEL_EXAM_SECTION_RANGES[levelSlug] || LEVEL_EXAM_SECTION_RANGES.b2;
  for (const [sectionName, range] of Object.entries(ranges)) {
    if (n >= range.partMin && n <= range.partMax) {
      return skillFromPartLabel(sectionName);
    }
  }
  return null;
}

function normalizeLevelSlug(name) {
  const m = String(name || '')
    .trim()
    .toLowerCase()
    .match(/\b(a2|b1|b2|c1|c2)\b/);
  return m ? m[1] : 'b2';
}

function inTimeRange(isoDate, timeRange) {
  if (!isoDate || timeRange === 'all') return true;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return true;
  const now = Date.now();
  const days = timeRange === 'week' ? 7 : 30;
  return now - d.getTime() <= days * 86400000;
}

function bumpSection(sections, skill, { attempts = 0, pct = null, bestPct = null, timeSec = 0 }) {
  if (!skill || !sections[skill]) return;
  const s = sections[skill];
  s.attempts += attempts;
  s.totalTime += timeSec;
  if (pct != null && !Number.isNaN(pct)) {
    s._pctSum += pct * attempts;
    s._pctWeight += attempts;
  }
  if (bestPct != null && bestPct > s.bestScore) {
    s.bestScore = bestPct;
  }
}

function finalizeSections(sections) {
  const out = {};
  for (const skill of SKILLS) {
    const s = sections[skill];
    const avg =
      s._pctWeight > 0 ? Math.round(s._pctSum / s._pctWeight) : s.attempts > 0 ? Math.round(s.bestScore) : 0;
    out[skill] = {
      attempts: s.attempts,
      averageScore: avg,
      bestScore: Math.round(s.bestScore),
      totalTime: s.totalTime,
    };
  }
  return out;
}

function pctFromEstadisticaRow(row) {
  if (row.ultimo_porcentaje != null && !Number.isNaN(Number(row.ultimo_porcentaje))) {
    return Math.round(Number(row.ultimo_porcentaje));
  }
  if (row.mejor_porcentaje != null && !Number.isNaN(Number(row.mejor_porcentaje))) {
    return Math.round(Number(row.mejor_porcentaje));
  }
  const ev = Number(row.respuestas_evaluadas) || 0;
  if (ev > 0) {
    return Math.round((100 * (Number(row.respuestas_correctas) || 0)) / ev);
  }
  return null;
}

/**
 * @param {object} opts
 * @param {Array} opts.estadisticas — levels_estadisticas
 * @param {Array} opts.puntuaciones — levels_puntuaciones
 * @param {Record<string,string>} opts.partNames — parte_id → label
 * @param {Record<string,string>} opts.examNames — examen_id → nombre
 * @param {Record<string,string>} [opts.preguntaLevel] — pregunta_id → level slug
 * @param {string} [opts.timeRange] — week | month | all
 */
export function buildExamStatisticsFromLevels({
  estadisticas = [],
  puntuaciones = [],
  partNames = {},
  examNames = {},
  preguntaLevel = {},
  timeRange = 'all',
}) {
  const sections = emptySections();
  let totalTime = 0;

  for (const row of estadisticas) {
    if (!inTimeRange(row.ultima_interaccion || row.creado_en, timeRange)) continue;

    const partLabel = partNames[row.parte_id] || '';
    const levelSlug = preguntaLevel[row.pregunta_id] || 'b2';
    const skill =
      skillFromPartLabel(partLabel) ||
      skillFromPartNumber(parsePartNumberFromLabel(partLabel), levelSlug);

    const attempts = Math.max(Number(row.intentos_completados) || 0, row.respuestas_evaluadas > 0 ? 1 : 0);
    const pct = pctFromEstadisticaRow(row);
    const bestPct = row.mejor_porcentaje != null ? Math.round(Number(row.mejor_porcentaje)) : pct;
    const timeSec = Number(row.tiempo_segundos_total) || 0;

    totalTime += timeSec;
    if (attempts > 0 || pct != null) {
      bumpSection(sections, skill || 'reading', {
        attempts: attempts || 1,
        pct: pct ?? 0,
        bestPct: bestPct ?? pct ?? 0,
        timeSec,
      });
    }
  }

  const recentAttempts = [];
  const examScores = new Map();

  for (const row of puntuaciones) {
    if (!inTimeRange(row.created_at, timeRange)) continue;

    const meta = parseUoePartDescripcion(row.descripcion);
    const examId = row.examen_id || meta?.examenId;
    const parteNumero = Number(row.parte_numero) || meta?.parteNumero;
    const correct = Number(row.correctas ?? meta?.correctas) || 0;
    const total = Number(row.total_preguntas ?? meta?.total) || 0;
    const pct =
      row.puntuacion != null && !Number.isNaN(Number(row.puntuacion))
        ? Math.round(Number(row.puntuacion))
        : total > 0
          ? Math.round((100 * correct) / total)
          : 0;

    const levelSlug = 'b2';
    const skill = skillFromPartNumber(parteNumero, levelSlug) || 'reading';
    const attempts = 1;

    bumpSection(sections, skill, {
      attempts,
      pct,
      bestPct: pct,
      timeSec: 0,
    });

    const examLabel = examNames[examId] || row.descripcion?.split('|').pop()?.trim() || 'Examen de práctica';
    const partLabel = parteNumero ? `Parte ${parteNumero}` : '';

    recentAttempts.push({
      id: row.id,
      examId,
      label: partLabel ? `${examLabel} · ${partLabel}` : examLabel,
      score: correct,
      totalQuestions: total,
      percentage: pct,
      date: new Date(row.created_at || Date.now()),
      timeSpent: 0,
      aprobado: row.aprobado === true || meta?.aprobado === true,
    });

    if (examId) {
      const prev = examScores.get(examId) || { sum: 0, count: 0, date: row.created_at };
      prev.sum += pct;
      prev.count += 1;
      if (new Date(row.created_at) > new Date(prev.date)) prev.date = row.created_at;
      examScores.set(examId, prev);
    }
  }

  recentAttempts.sort((a, b) => b.date - a.date);

  const finalized = finalizeSections(sections);
  const sectionEntries = Object.entries(finalized).filter(([, s]) => s.attempts > 0);
  const sorted = [...sectionEntries].sort((a, b) => b[1].averageScore - a[1].averageScore);

  const strengths = sorted.slice(0, 2).map(([k]) => k);
  const weakSkills = sorted.length > 0 ? sorted.slice(-2).map(([k]) => k) : [];
  const improvementAreas = weakSkills.length
    ? weakSkills.map((k) => IMPROVEMENT_TIPS[k] || `Mejora en ${k}`)
    : [
        'Practica más ejercicios en Niveles',
        'Completa partes de examen para ver tu progreso',
      ];

  const allPcts = recentAttempts.map((a) => a.percentage).filter((n) => n > 0);
  const distinctExams = examScores.size;
  const completedExams = recentAttempts.filter((a) => a.aprobado || a.percentage >= 60).length;

  return {
    totalExams: distinctExams || estadisticas.length || recentAttempts.length,
    completedExams: completedExams || recentAttempts.length,
    averageScore: allPcts.length
      ? allPcts.reduce((a, b) => a + b, 0) / allPcts.length
      : sectionEntries.length
        ? sectionEntries.reduce((s, [, v]) => s + v.averageScore, 0) / sectionEntries.length
        : 0,
    bestScore: allPcts.length ? Math.max(...allPcts) : Math.max(0, ...sectionEntries.map(([, v]) => v.bestScore)),
    totalTime,
    sections: finalized,
    recentAttempts,
    strengths,
    weaknesses: weakSkills,
    improvementAreas,
    hasData: estadisticas.length > 0 || puntuaciones.length > 0,
  };
}

function parsePartNumberFromLabel(label) {
  const m = String(label || '').match(/parte\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

export const SKILL_ANALYSIS_KEYS = [
  'reading',
  'writing',
  'listening',
  'speaking',
  'grammar',
  'vocabulary',
];

const SKILL_LABELS = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
};

function emptySkillBuckets() {
  return Object.fromEntries(
    SKILL_ANALYSIS_KEYS.map((k) => [
      k,
      { exercises: 0, _pctSum: 0, _pctCount: 0, _best: 0 },
    ]),
  );
}

/** @returns {typeof SKILL_ANALYSIS_KEYS[number]} */
export function resolveSkillForAnalysis(partLabel, parteNumero, levelSlug = 'b2') {
  const label = String(partLabel || '').toLowerCase();
  if (/vocab|léxico|lexico/.test(label)) return 'vocabulary';
  if (/grammar|gramática|gramatica|use of english|use-of-english/.test(label) && !/reading and writing/.test(label)) {
    return 'grammar';
  }
  const fromPart = skillFromPartLabel(partLabel) || skillFromPartNumber(parteNumero, levelSlug);
  if (fromPart) return fromPart;
  return 'reading';
}

function bumpSkillBucket(buckets, skill, { exercises = 0, pct = null, bestPct = null }) {
  if (!skill || !buckets[skill]) return;
  const b = buckets[skill];
  b.exercises += exercises;
  if (pct != null && !Number.isNaN(pct)) {
    b._pctSum += pct;
    b._pctCount += 1;
  }
  if (bestPct != null && bestPct > b._best) {
    b._best = bestPct;
  }
}

/**
 * Análisis por habilidad para el perfil (Progreso + radar).
 * @returns {Record<string, { score: number, improvement: number, exercises: number }>}
 */
export function buildSkillAnalysisFromLevels({
  estadisticas = [],
  puntuaciones = [],
  partNames = {},
  preguntaLevel = {},
}) {
  const buckets = emptySkillBuckets();

  for (const row of estadisticas) {
    const partLabel = partNames[row.parte_id] || '';
    const levelSlug = preguntaLevel[row.pregunta_id] || 'b2';
    const skill = resolveSkillForAnalysis(
      partLabel,
      parsePartNumberFromLabel(partLabel),
      levelSlug,
    );
    const exercises = Math.max(
      Number(row.intentos_completados) || 0,
      Number(row.respuestas_evaluadas) || 0,
      row.accesos > 0 ? 1 : 0,
    );
    const pct = pctFromEstadisticaRow(row);
    const bestPct =
      row.mejor_porcentaje != null ? Math.round(Number(row.mejor_porcentaje)) : pct;

    if (exercises > 0 || pct != null) {
      bumpSkillBucket(buckets, skill, {
        exercises: exercises || 1,
        pct: pct ?? 0,
        bestPct: bestPct ?? pct ?? 0,
      });
    }
  }

  for (const row of puntuaciones) {
    const meta = parseUoePartDescripcion(row.descripcion);
    const parteNumero = Number(row.parte_numero) || meta?.parteNumero;
    const correct = Number(row.correctas ?? meta?.correctas) || 0;
    const total = Number(row.total_preguntas ?? meta?.total) || 0;
    const pct =
      row.puntuacion != null && !Number.isNaN(Number(row.puntuacion))
        ? Math.round(Number(row.puntuacion))
        : total > 0
          ? Math.round((100 * correct) / total)
          : 0;

    const skill = resolveSkillForAnalysis(
      row.descripcion?.split('|').pop() || '',
      parteNumero,
      'b2',
    );

    bumpSkillBucket(buckets, skill, {
      exercises: 1,
      pct,
      bestPct: pct,
    });
  }

  const out = {};
  for (const key of SKILL_ANALYSIS_KEYS) {
    const b = buckets[key];
    const score = b._pctCount > 0 ? Math.round(b._pctSum / b._pctCount) : 0;
    const improvement = Math.max(0, Math.round((b._best || score) - score));
    out[key] = {
      score,
      improvement,
      exercises: b.exercises,
    };
  }

  return { skills: out, labels: SKILL_LABELS, hasData: estadisticas.length > 0 || puntuaciones.length > 0 };
}

export { SKILL_LABELS, parsePartNumberFromLabel, pctFromEstadisticaRow };
