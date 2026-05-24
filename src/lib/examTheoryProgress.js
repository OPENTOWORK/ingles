import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import {
  EXAM_THEORY_CATALOG,
  SECTIONS,
} from '@/data/teoriaSections';
import {
  computeTopicExerciseProgressPercent,
  countPassedForTopic,
} from '@/lib/theoryExerciseProgress';
import { getAllTheoryProgress } from '@/utils/theoryProgress';

export const EXAM_THEORY_PROGRESS_EVENT = 'exam-theory-progress-updated';

const LOCAL_KEY_PREFIX = 'levels_progreso_local_';

/** Todas las rutas de temas de Exam theory. */
export function getExamTheoryTopicsFlat() {
  return EXAM_THEORY_CATALOG.flatMap((area) =>
    (SECTIONS[area.key] || []).map((topic) => ({
      ...topic,
      unidad: area.slug,
      sectionKey: area.key,
    })),
  );
}

export function findExamUnitSlugForTopicHref(topicHref) {
  const href = normalizeTopicHref(topicHref);
  const topic = getExamTheoryTopicsFlat().find((t) => t.href === href);
  return topic?.unidad ?? null;
}

function topicIdFromHref(href) {
  return href.replace(/^\/teoria\//, '');
}

function findTopicMetaByHref(href) {
  for (const topics of Object.values(SECTIONS)) {
    const topic = topics.find((item) => item.href === href);
    if (topic) return topic;
  }
  return null;
}

function topicLevelLabel(topic) {
  if (!topic?.levels?.length) return null;
  return topic.levels.join('-');
}

function exercisePercentForTopic(href, userId) {
  if (!userId) return null;
  const label = topicLevelLabel(findTopicMetaByHref(href));
  if (!label) return null;
  return computeTopicExerciseProgressPercent({
    passedCount: countPassedForTopic(userId, href, label),
    topicLevelLabel: label,
  });
}

function bestPercent(...candidates) {
  const values = candidates
    .filter((value) => value != null && !Number.isNaN(Number(value)))
    .map((value) => Math.min(100, Math.max(0, Math.round(Number(value)))));
  return values.length ? Math.max(...values) : 0;
}

function resolveTopicPercent(href, { dbByHref, localLevels, theoryAll, userId }) {
  const canonicalHref = normalizeTopicHref(href);
  const legacyId = topicIdFromHref(canonicalHref);
  const fromDb = dbByHref[canonicalHref];
  const fromLocal = localLevels[canonicalHref]?.progreso_pct;
  const fromTheory =
    theoryAll[canonicalHref]?.progress ??
    theoryAll[`${canonicalHref}/`]?.progress ??
    theoryAll[legacyId]?.progress ??
    null;
  const fromExercise = exercisePercentForTopic(canonicalHref, userId);

  return bestPercent(fromDb, fromLocal, fromTheory, fromExercise);
}

function progressContext(dbRows = [], userId = null) {
  return {
    dbByHref: Object.fromEntries(
      (dbRows || []).map((row) => [
        normalizeTopicHref(row.topic_href),
        row.progreso_pct ?? 0,
      ]),
    ),
    localLevels: readLocalLevelsProgreso(userId),
    theoryAll: userId ? getAllTheoryProgress(userId) : {},
    userId,
  };
}

/** Mapa href → % por tema (toda Exam theory o un apartado). */
export function buildTopicProgressByHref({
  dbRows = [],
  userId = null,
  sectionKey = null,
} = {}) {
  const ctx = progressContext(dbRows, userId);
  const topicList = sectionKey
    ? SECTIONS[sectionKey] || []
    : getExamTheoryTopicsFlat();

  return Object.fromEntries(
    topicList.map((topic) => [topic.href, resolveTopicPercent(topic.href, ctx)]),
  );
}

export function getTopicProgressPercent(href, { dbRows = [], userId = null } = {}) {
  return resolveTopicPercent(href, progressContext(dbRows, userId));
}

/** Media de % de todos los temas de un apartado. */
export function computeSectionPercent(topics, progressByHref = {}) {
  if (!topics?.length) return 0;
  const sum = topics.reduce((acc, topic) => acc + (progressByHref[topic.href] ?? 0), 0);
  return Math.round(sum / topics.length);
}

function readLocalLevelsProgreso(userId) {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : {};
    const normalized = {};
    for (const [key, value] of Object.entries(parsed)) {
      const href = normalizeTopicHref(value?.topic_href ?? key);
      const pct = Number(value?.progreso_pct ?? 0);
      const existing = normalized[href]?.progreso_pct ?? 0;
      if (!normalized[href] || existing < pct) {
        normalized[href] = {
          ...value,
          topic_href: href,
          progreso_pct: pct,
        };
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

export function writeLocalLevelsProgreso(userId, topicHref, progresoPct) {
  if (typeof window === 'undefined' || !userId) return;
  const href = normalizeTopicHref(topicHref);
  const all = readLocalLevelsProgreso(userId);
  all[href] = {
    topic_href: href,
    unidad: findExamUnitSlugForTopicHref(href),
    progreso_pct: Math.min(100, Math.max(0, Math.round(progresoPct))),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_KEY_PREFIX}${userId}`, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(EXAM_THEORY_PROGRESS_EVENT));
}

/** Combina Supabase, local levels_progreso y theory_progress legacy. */
export function computeExamTheoryProgressSummary({
  dbRows = [],
  userId = null,
} = {}) {
  const ctx = progressContext(dbRows, userId);
  const progressByHref = buildTopicProgressByHref({ dbRows, userId });

  const units = EXAM_THEORY_CATALOG.map((area) => {
    const topics = SECTIONS[area.key] || [];
    const topicPercents = topics.map((topic) => progressByHref[topic.href] ?? 0);

    const percent =
      topicPercents.length > 0
        ? Math.round(
            topicPercents.reduce((sum, value) => sum + value, 0) / topicPercents.length,
          )
        : 0;

    const completedTopics = topicPercents.filter((value) => value >= 100).length;

    return {
      slug: area.slug,
      key: area.key,
      accent: area.accent,
      description: area.description,
      percent,
      completedTopics,
      topicsTotal: topics.length,
    };
  });

  const globalPercent =
    units.length > 0
      ? Math.round(units.reduce((sum, unit) => sum + unit.percent, 0) / units.length)
      : 0;

  return {
    globalPercent,
    units,
    totalUnits: units.length,
  };
}

export function notifyExamTheoryProgressUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXAM_THEORY_PROGRESS_EVENT));
  }
}
