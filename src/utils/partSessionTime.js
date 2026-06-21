import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { getCambridgeSectionDurationSeconds } from '@/data/cambridgeExamTimings';
import { formatElapsedLevelsTimer } from '@/hooks/useLevelsCategoryTimer';
import { buildPartSessionHistoryEntry } from '@/utils/partSessionSaveHelpers';

/** B2 Reading & Use of English section budget (seconds). */
export function getRuoeSectionBudgetSeconds(levelSlug = 'b2') {
  return getCambridgeSectionDurationSeconds(String(levelSlug).toLowerCase(), 'Reading and Use of English');
}

export function getSectionBudgetSeconds(levelSlug, sectionTitle) {
  if (!sectionTitle) return 45 * 60;
  return getCambridgeSectionDurationSeconds(String(levelSlug || 'b2').toLowerCase(), sectionTitle);
}

export function formatPartTimeComparison(seconds, budgetSeconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const budget = Math.max(1, Math.round(Number(budgetSeconds) || 0));
  const pct = Math.round((100 * s) / budget);
  return {
    elapsedLabel: formatElapsedLevelsTimer(s),
    budgetLabel: formatElapsedLevelsTimer(budget),
    percentOfBudget: pct,
  };
}

/**
 * Persist elapsed time for a completed part session (levels_estadisticas).
 */
export async function recordPartPracticeSessionTime({
  userId,
  preguntaId,
  parteId = null,
  partNumber,
  examSlot = null,
  levelSlug = 'b2',
  seconds,
  skillRoute = null,
  scoreSource = null,
  progress = null,
  sectionTitle = null,
  scoreLabel = null,
}) {
  const rounded = Math.round(Number(seconds) || 0);
  if (!userId || !preguntaId || rounded < 1) return { saved: false };

  const partKey = String(partNumber);
  const historyEntry = buildPartSessionHistoryEntry({
    levelSlug,
    partNumber,
    examSlot,
    seconds: rounded,
    skillRoute,
    scoreSource,
    progress,
    sectionTitle,
    scoreLabel,
  });

  const metadataPatch = {
    partTimeHistoryEntry: historyEntry,
    partTimesByPartKey: partKey,
    partTimesByPartValue: {
      lastSeconds: rounded,
      lastExamSlot: examSlot ?? null,
      lastScoreLabel: historyEntry.scoreLabel,
      lastScoreSource: historyEntry.scoreSource,
      levelSlug: String(levelSlug || 'b2').toLowerCase(),
      sectionTitle: historyEntry.sectionTitle,
      updatedAt: new Date().toISOString(),
    },
  };

  const { error } = await mergeLevelsEstadisticas({
    userId,
    preguntaId,
    parteId,
    deltaTiempoSegundos: rounded,
    metadataPatch,
  });

  return { saved: !error, error };
}
