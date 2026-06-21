import {
  formatPartTimeComparison,
  getSectionBudgetSeconds,
} from '@/utils/partSessionTime';
import { LEVELS_SCORE_SOURCE, resolveLevelsScoreSource } from '@/utils/levelsScoreSource';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { inferSectionTitleFromPart } from '@/data/levelExamPartMap';
import { getSkillPartPracticeTitle } from '@/utils/formatLevelsPartDisplayName';
import { scoreSourceModeLabel } from '@/utils/partSessionSaveHelpers';
import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';

const LEVEL_ORDER = ['a2', 'b1', 'b2', 'c1', 'c2'];

function normalizeHistoryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const partNumber = Number(raw.partNumber);
  const seconds = Math.round(Number(raw.seconds) || 0);
  const levelSlug = String(raw.levelSlug || 'b2').toLowerCase();
  if (!partNumber || seconds < 1) return null;

  return {
    partNumber,
    seconds,
    levelSlug,
    examSlot: raw.examSlot ?? null,
    skillRoute: raw.skillRoute ?? null,
    sectionTitle: raw.sectionTitle || inferSectionTitleFromPart(levelSlug, partNumber),
    scoreSource: resolveLevelsScoreSource(raw.scoreSource),
    scoreLabel: raw.scoreLabel || null,
    scorePercent: raw.scorePercent != null ? Number(raw.scorePercent) : null,
    passed: raw.passed ?? null,
    recordedAt: raw.recordedAt || null,
    preguntaId: raw.preguntaId || null,
  };
}

function sessionGroupKey(entry) {
  return [
    entry.levelSlug,
    entry.sectionTitle || 'Practice',
    entry.partNumber,
    entry.scoreSource,
  ].join('|');
}

function partDisplayLabel(levelSlug, partNumber) {
  const { heading } = getSkillPartPracticeTitle(levelSlug, partNumber, 'en');
  if (heading) return heading;
  return `Part ${partNumber}`;
}

function buildModeSummary(entries, budgetSeconds) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime(),
  );
  const last = sorted[0] || null;
  const bestSeconds = sorted.reduce(
    (min, entry) => (min == null || entry.seconds < min ? entry.seconds : min),
    null,
  );

  const byExamSlot = new Map();
  for (const entry of sorted) {
    const slotKey = entry.examSlot != null ? String(entry.examSlot) : 'unknown';
    const prev = byExamSlot.get(slotKey);
    if (!prev || new Date(entry.recordedAt || 0) > new Date(prev.recordedAt || 0)) {
      byExamSlot.set(slotKey, entry);
    }
  }

  const examComparisons = [...byExamSlot.entries()]
    .map(([slotKey, entry]) => ({
      examSlot: slotKey,
      seconds: entry.seconds,
      scoreLabel: entry.scoreLabel,
      scorePercent: entry.scorePercent,
      recordedAt: entry.recordedAt,
      ...formatPartTimeComparison(entry.seconds, budgetSeconds),
    }))
    .sort((a, b) => {
      const slotA = Number(a.examSlot);
      const slotB = Number(b.examSlot);
      if (Number.isFinite(slotA) && Number.isFinite(slotB)) return slotA - slotB;
      return String(a.examSlot).localeCompare(String(b.examSlot));
    });

  return {
    scoreSource: last?.scoreSource || entries[0]?.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
    modeLabel: scoreSourceModeLabel(
      last?.scoreSource || entries[0]?.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
      'en',
    ),
    lastSeconds: last?.seconds ?? null,
    bestSeconds,
    lastScoreLabel: last?.scoreLabel ?? null,
    lastScorePercent: last?.scorePercent ?? null,
    lastPassed: last?.passed ?? null,
    sessionCount: sorted.length,
    lastComparison: last ? formatPartTimeComparison(last.seconds, budgetSeconds) : null,
    bestComparison:
      bestSeconds != null ? formatPartTimeComparison(bestSeconds, budgetSeconds) : null,
    examComparisons,
  };
}

function buildExerciseComparisons({
  partNumber,
  scoreSource,
  examComparisons = [],
  puntuacionesRows = [],
  examenIdBySlot = {},
}) {
  const examenIdToSlot = Object.entries(examenIdBySlot || {}).reduce((acc, [slot, id]) => {
    if (id) acc[id] = Number(slot);
    return acc;
  }, {});

  const scoreBySlot = new Map();
  for (const row of puntuacionesRows || []) {
    const meta = parseUoePartDescripcion(row.descripcion);
    const rowSource = row.score_source || meta?.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    if (rowSource !== scoreSource) continue;

    const examenId = row.examen_id || meta?.examenId;
    const pn = Number(row.parte_numero ?? meta?.parteNumero);
    if (!examenId || pn !== partNumber) continue;

    const slot = examenIdToSlot[examenId];
    if (!slot) continue;

    const scoringVersion = Number(row.scoring_version ?? meta?.scoringVersion) || 1;
    const isV2 = scoringVersion === 2;
    const correct = Math.max(
      0,
      Number(
        isV2
          ? row.puntos_obtenidos ?? meta?.puntosObtenidos
          : row.correctas ?? meta?.correctas,
      ) || 0,
    );
    const total = Math.max(
      1,
      Number(
        isV2
          ? row.puntos_maximos ?? meta?.puntosMaximos
          : row.total_preguntas ?? meta?.total,
      ) || 0,
    );

    const existing = scoreBySlot.get(slot);
    const createdAt = row.created_at ? new Date(row.created_at).getTime() : 0;
    const existingAt = existing?.createdAt ?? 0;
    if (existing && existingAt >= createdAt) continue;

    scoreBySlot.set(slot, {
      correct,
      total,
      passed: row.aprobado === true || meta?.aprobado === true,
      scoreLabel: `${correct}/${total}`,
      createdAt,
    });
  }

  const timeBySlot = new Map();
  for (const exam of examComparisons) {
    const slot = Number(exam.examSlot);
    if (!Number.isFinite(slot) || slot < 1) continue;
    timeBySlot.set(slot, exam);
  }

  const slotNumbers = new Set([...scoreBySlot.keys(), ...timeBySlot.keys()]);

  return [...slotNumbers]
    .sort((a, b) => a - b)
    .map((slot) => {
      const time = timeBySlot.get(slot);
      const score = scoreBySlot.get(slot);
      return {
        examSlot: slot,
        exerciseLabel: formatSkillExerciseLabel(slot, 'en'),
        scoreLabel: score?.scoreLabel ?? null,
        passed: score?.passed ?? null,
        elapsedLabel: time?.elapsedLabel ?? null,
      };
    });
}

function enrichEntryFromPuntuaciones(entry, puntuacionesRows = []) {
  if (entry.scoreLabel) return entry;

  const candidates = (puntuacionesRows || [])
    .map((row) => {
      const meta = parseUoePartDescripcion(row.descripcion);
      if (!meta || meta.parteNumero !== entry.partNumber) return null;
      if (meta.scoreSource !== entry.scoreSource) return null;
      if (entry.preguntaId && row.pregunta_id && row.pregunta_id !== entry.preguntaId) return null;
      const isV2 = Number(meta.scoringVersion) === 2;
      const correct = isV2 ? meta.puntosObtenidos : meta.correctas;
      const total = isV2 ? meta.puntosMaximos : meta.total;
      const pct = total > 0 ? Math.round((100 * correct) / total) : null;
      return {
        scoreLabel: `Part ${meta.parteNumero} · ${correct}/${total} · ${meta.aprobado ? 'passed' : 'not passed'}${pct != null ? ` (${pct}%)` : ''}`,
        scorePercent: pct,
        passed: meta.aprobado,
        createdAt: row.created_at || row.fecha || null,
      };
    })
    .filter(Boolean);

  if (!candidates.length) return entry;

  const recordedAt = entry.recordedAt ? new Date(entry.recordedAt).getTime() : null;
  const best = candidates.reduce((pick, candidate) => {
    if (!pick) return candidate;
    if (!recordedAt || !candidate.createdAt) return pick;
    const diffPick = Math.abs(new Date(pick.createdAt).getTime() - recordedAt);
    const diffCandidate = Math.abs(new Date(candidate.createdAt).getTime() - recordedAt);
    return diffCandidate < diffPick ? candidate : pick;
  }, null);

  if (!best) return entry;

  return {
    ...entry,
    scoreLabel: best.scoreLabel,
    scorePercent: best.scorePercent,
    passed: best.passed,
  };
}

/**
 * Aggregate practice times + scores across all levels, skills and modes.
 */
export function buildPracticePerformanceSummary(
  estadisticasRows = [],
  { puntuacionesRows = [], examenIdsByLevel = {} } = {},
) {
  const entriesByKey = new Map();

  for (const row of estadisticasRows || []) {
    const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    const history = Array.isArray(metadata.partTimeHistory) ? metadata.partTimeHistory : [];

    for (const raw of history) {
      const entry = normalizeHistoryEntry({
        ...raw,
        preguntaId: raw.preguntaId || row.pregunta_id || null,
      });
      if (!entry) continue;
      const enriched = enrichEntryFromPuntuaciones(entry, puntuacionesRows);
      const key = `${sessionGroupKey(enriched)}:${enriched.recordedAt}:${enriched.examSlot}`;
      entriesByKey.set(key, enriched);
    }

    const partTimesByPart =
      metadata.partTimesByPart && typeof metadata.partTimesByPart === 'object'
        ? metadata.partTimesByPart
        : null;
    if (partTimesByPart) {
      for (const [partKey, summary] of Object.entries(partTimesByPart)) {
        const partNumber = Number(partKey);
        const seconds = Math.round(Number(summary?.lastSeconds) || 0);
        if (!partNumber || seconds < 1) continue;
        const levelSlug = String(summary?.levelSlug || metadata.levelSlug || 'b2').toLowerCase();
        const entry = normalizeHistoryEntry({
          partNumber,
          seconds,
          levelSlug,
          examSlot: summary?.lastExamSlot ?? null,
          scoreSource: summary?.lastScoreSource ?? null,
          scoreLabel: summary?.lastScoreLabel ?? null,
          recordedAt: summary?.updatedAt || null,
          preguntaId: row.pregunta_id || null,
          sectionTitle: inferSectionTitleFromPart(levelSlug, partNumber),
        });
        if (!entry) continue;
        const enriched = enrichEntryFromPuntuaciones(entry, puntuacionesRows);
        const key = `${sessionGroupKey(enriched)}:${enriched.recordedAt}:${enriched.examSlot}:fallback`;
        if (!entriesByKey.has(key)) entriesByKey.set(key, enriched);
      }
    }
  }

  const tree = new Map();

  for (const entry of entriesByKey.values()) {
    if (!tree.has(entry.levelSlug)) tree.set(entry.levelSlug, new Map());
    const levelMap = tree.get(entry.levelSlug);
    const sectionKey = entry.sectionTitle || 'Practice';
    if (!levelMap.has(sectionKey)) levelMap.set(sectionKey, new Map());
    const sectionMap = levelMap.get(sectionKey);
    if (!sectionMap.has(entry.partNumber)) sectionMap.set(entry.partNumber, new Map());
    const partMap = sectionMap.get(entry.partNumber);
    const modeKey = entry.scoreSource;
    if (!partMap.has(modeKey)) partMap.set(modeKey, []);
    partMap.get(modeKey).push(entry);
  }

  const levels = LEVEL_ORDER.filter((slug) => tree.has(slug)).map((levelSlug) => {
    const levelMap = tree.get(levelSlug);
    const sections = [...levelMap.entries()].map(([sectionTitle, sectionMap]) => {
      const budgetSeconds = getSectionBudgetSeconds(levelSlug, sectionTitle);
      const parts = [...sectionMap.entries()]
        .sort(([a], [b]) => a - b)
        .map(([partNumber, partMap]) => ({
          partNumber,
          partLabel: partDisplayLabel(levelSlug, partNumber),
          modes: [LEVELS_SCORE_SOURCE.SKILL_PRACTICE, LEVELS_SCORE_SOURCE.EXAM_MODE]
            .map((scoreSource) => {
              const entries = partMap.get(scoreSource) || [];
              if (!entries.length) return null;
              const mode = buildModeSummary(entries, budgetSeconds);
              return {
                ...mode,
                exerciseComparisons: buildExerciseComparisons({
                  partNumber,
                  scoreSource,
                  examComparisons: mode.examComparisons,
                  puntuacionesRows,
                  examenIdBySlot: examenIdsByLevel[levelSlug] || {},
                }),
              };
            })
            .filter(Boolean),
        }))
        .filter((part) => part.modes.length > 0);

      const sectionSeconds = parts.flatMap((part) =>
        part.modes.flatMap((mode) => mode.examComparisons.map((exam) => exam.seconds)),
      );
      const totalSectionSeconds = sectionSeconds.reduce((sum, value) => sum + value, 0);

      return {
        sectionTitle,
        budgetSeconds,
        budgetComparison: formatPartTimeComparison(budgetSeconds, budgetSeconds),
        totalSectionSeconds,
        totalComparison: formatPartTimeComparison(totalSectionSeconds, budgetSeconds),
        parts,
      };
    });

    return {
      levelSlug,
      levelLabel: levelSlug.toUpperCase(),
      sections: sections.filter((section) => section.parts.length > 0),
    };
  });

  const hasAnyData = levels.some((level) => level.sections.some((section) => section.parts.length > 0));

  return { levels, hasAnyData };
}

/** @deprecated Use buildPracticePerformanceSummary */
export function buildRuoePartTimePerformanceSummary(rows, options = {}) {
  const summary = buildPracticePerformanceSummary(rows, options);
  const level = summary.levels.find((item) => item.levelSlug === (options.levelSlug || 'b2'));
  const section = level?.sections.find((item) =>
    String(item.sectionTitle).includes('Reading and Use of English'),
  );
  const budgetSeconds = section?.budgetSeconds ?? getSectionBudgetSeconds('b2', 'Reading and Use of English');

  const parts = (section?.parts || []).map((part) => {
    const skillMode = part.modes.find((mode) => mode.scoreSource === LEVELS_SCORE_SOURCE.SKILL_PRACTICE);
    return {
      partNumber: part.partNumber,
      title: part.partLabel,
      lastSeconds: skillMode?.lastSeconds ?? null,
      bestSeconds: skillMode?.bestSeconds ?? null,
      sessionCount: skillMode?.sessionCount ?? 0,
      lastComparison: skillMode?.lastComparison ?? null,
      bestComparison: skillMode?.bestComparison ?? null,
      examComparisons: skillMode?.examComparisons ?? [],
    };
  });

  return {
    levelSlug: options.levelSlug || 'b2',
    budgetSeconds,
    budgetComparison: formatPartTimeComparison(budgetSeconds, budgetSeconds),
    totalTrackedSeconds: section?.totalSectionSeconds ?? 0,
    totalComparison: section?.totalComparison ?? formatPartTimeComparison(0, budgetSeconds),
    parts,
    hasAnyData: parts.some((part) => part.lastSeconds != null),
  };
}
