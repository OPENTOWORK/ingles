import {
  EXAM_THEORY_CATALOG,
  SECTIONS,
} from '@/data/teoriaSections';
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
  const topic = getExamTheoryTopicsFlat().find((t) => t.href === topicHref);
  return topic?.unidad ?? null;
}

function topicIdFromHref(href) {
  return href.replace(/^\/teoria\//, '');
}

function resolveTopicPercent(href, { dbByHref, localLevels, theoryAll }) {
  const legacyId = topicIdFromHref(href);
  const fromDb = dbByHref[href];
  const fromLocal = localLevels[href]?.progreso_pct;
  const fromTheory =
    theoryAll[href]?.progress ?? theoryAll[legacyId]?.progress ?? null;

  const value =
    fromDb != null
      ? Number(fromDb)
      : fromLocal != null
        ? Number(fromLocal)
        : fromTheory != null
          ? Number(fromTheory)
          : 0;

  return Math.min(100, Math.max(0, Math.round(value)));
}

function progressContext(dbRows = [], userId = null) {
  return {
    dbByHref: Object.fromEntries(
      (dbRows || []).map((row) => [row.topic_href, row.progreso_pct ?? 0]),
    ),
    localLevels: readLocalLevelsProgreso(userId),
    theoryAll: userId ? getAllTheoryProgress(userId) : {},
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
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLocalLevelsProgreso(userId, topicHref, progresoPct) {
  if (typeof window === 'undefined' || !userId) return;
  const all = readLocalLevelsProgreso(userId);
  all[topicHref] = {
    topic_href: topicHref,
    unidad: findExamUnitSlugForTopicHref(topicHref),
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
