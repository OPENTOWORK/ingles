import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import { loadExamModeSession } from '@/utils/examModeSession';
import {
  PROFILE_CEFR_LEVELS,
  ensureAllCefrLevelCharts,
  getPartMaxForLevel,
  getSkillZonesForLevel,
  padBarsToFullPaper,
} from '@/lib/aggregateLevelsStatsByPart';

function partScoreToPct(correct, total) {
  const c = Number(correct) || 0;
  const t = Number(total) || 0;
  if (t <= 0) return null;
  return Math.round((100 * c) / t);
}

function mergePartEntry(existing, incoming) {
  if (!incoming) return existing;
  if (!existing) return incoming;

  const existingPct = partScoreToPct(existing.correct, existing.total);
  const incomingPct = partScoreToPct(incoming.correct, incoming.total);

  if (incomingPct == null) return existing;
  if (existingPct == null) return incoming;
  if (incomingPct > existingPct) return incoming;
  if (incomingPct < existingPct) return existing;

  const incomingTs = incoming.updatedAt || '';
  const existingTs = existing.updatedAt || '';
  return incomingTs >= existingTs ? incoming : existing;
}

function partDisplayToBarEntry(partNumber, display, source = 'remote') {
  const correct = Number(display.correct) || 0;
  const total = Number(display.total) || 0;
  const incorrect = Math.max(0, total - correct);
  return {
    parteId: `exam-mode-${partNumber}`,
    partSort: partNumber,
    name: `Part ${partNumber}`,
    scorePct: partScoreToPct(correct, total),
    correctas: correct,
    evaluadas: total,
    incorrectas: incorrect,
    accesos: 0,
    source,
    updatedAt: display.updatedAt || null,
  };
}

function mergeBestPartsFromBySlot(bySlot = {}) {
  const merged = {};
  for (const slotProgress of Object.values(bySlot)) {
    const parts = slotProgress?.parts || {};
    for (const [partKey, display] of Object.entries(parts)) {
      const partNumber = Number(partKey);
      if (!partNumber) continue;
      const incoming = {
        correct: display.correct,
        total: display.total,
        updatedAt: display.updatedAt || null,
      };
      merged[partNumber] = mergePartEntry(merged[partNumber], incoming);
    }
  }
  return merged;
}

function extractPartsFromLocalSession(session) {
  const merged = {};
  if (!session?.sections?.length) return merged;

  const updatedAt = session.updatedAt || session.createdAt || null;

  for (const section of session.sections) {
    if (section.status !== 'completed' || !section.scores?.byPart) continue;
    for (const [partKey, part] of Object.entries(section.scores.byPart)) {
      const partNumber = Number(partKey);
      if (!partNumber) continue;
      const correct = Number(part.pointsEarned ?? part.correct) || 0;
      const total = Number(part.maxPoints ?? part.total) || 0;
      if (total <= 0) continue;
      const incoming = { correct, total, updatedAt };
      merged[partNumber] = mergePartEntry(merged[partNumber], incoming);
    }
  }

  return merged;
}

function buildLevelExamModeChart(slug, levelName, mergedParts) {
  const levelTag = String(levelName || slug).toUpperCase();
  const bars = Object.entries(mergedParts).map(([partKey, display]) =>
    partDisplayToBarEntry(Number(partKey), display),
  );
  const fullBars = padBarsToFullPaper(levelTag, bars);

  return {
    levelId: slug,
    levelSlug: slug,
    levelName: levelTag,
    partMax: getPartMaxForLevel(levelTag),
    skillZones: getSkillZonesForLevel(levelTag),
    bars: fullBars,
    hasData: fullBars.some((b) => b.scorePct != null),
  };
}

/**
 * Remote exam-mode scores (levels_puntuaciones, score_source = exam_mode).
 */
export async function fetchExamModeProfileCharts(supabase, userId) {
  if (!userId) return ensureAllCefrLevelCharts([], []);

  const charts = [];
  const levelCatalog = [];

  for (const slug of PROFILE_CEFR_LEVELS) {
    const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
    if (!levelData?.id) continue;

    levelCatalog.push({ id: levelData.id, nombre: levelData.nombre });

    const examenIdBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
    const partMax = getPartMaxForLevel(slug);

    const { bySlot } = await fetchB2PuntuacionesProgress(supabase, {
      userId,
      examenIdBySlot,
      partMin: 1,
      partMax,
      partsInPaper: partMax,
      scoreSource: LEVELS_SCORE_SOURCE.EXAM_MODE,
    });

    const mergedParts = mergeBestPartsFromBySlot(bySlot);
    charts.push(buildLevelExamModeChart(slug, levelData.nombre, mergedParts));
  }

  return ensureAllCefrLevelCharts(charts, levelCatalog);
}

/**
 * Merge local exam-mode sessions (localStorage) into profile charts — client only.
 */
export function mergeLocalExamModeIntoCharts(charts = [], userId = '') {
  if (typeof window === 'undefined' || !charts.length) return charts;

  return charts.map((chart) => {
    const slug = chart.levelSlug || String(chart.levelName || '').toLowerCase();
    if (!slug) return chart;

    let mergedParts = {};
    for (const bar of chart.bars || []) {
      if (bar.scorePct == null) continue;
      mergedParts[bar.partSort] = {
        correct: bar.correctas,
        total: bar.evaluadas,
        updatedAt: bar.updatedAt || null,
      };
    }

    for (let slot = 1; slot <= B2_EXAM_SLOT_MAX; slot += 1) {
      const session = loadExamModeSession(slug, slot, userId);
      const localParts = extractPartsFromLocalSession(session);
      for (const [partKey, display] of Object.entries(localParts)) {
        mergedParts[partKey] = mergePartEntry(mergedParts[partKey], display);
      }
    }

    const rebuilt = buildLevelExamModeChart(slug, chart.levelName, mergedParts);
    return { ...chart, ...rebuilt };
  });
}
