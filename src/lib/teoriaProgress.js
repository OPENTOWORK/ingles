import { SECTIONS, THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import { getAllTheoryProgress } from '@/utils/theoryProgress';

export const TEORIA_PROGRESS_EVENT = 'teoria-progress-updated';

const LOCAL_KEY_PREFIX = 'teoria_progreso_local_';

export function getTheoryTopicsFlat() {
  return THEORY_SECTION_CATALOG.flatMap((area) =>
    (SECTIONS[area.key] || []).map((topic) => ({
      ...topic,
      apartado: area.slug,
      sectionKey: area.key,
    })),
  );
}

export function findTheoryApartadoForTopicHref(topicHref) {
  const topic = getTheoryTopicsFlat().find((t) => t.href === topicHref);
  return topic?.apartado ?? null;
}

function topicIdFromHref(href) {
  return href.replace(/^\/teoria\//, '');
}

function readLocalTeoriaProgreso(userId) {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLocalTeoriaProgreso(userId, topicHref, progresoPct) {
  if (typeof window === 'undefined' || !userId) return;
  const all = readLocalTeoriaProgreso(userId);
  all[topicHref] = {
    topic_href: topicHref,
    apartado: findTheoryApartadoForTopicHref(topicHref),
    progreso_pct: Math.min(100, Math.max(0, Math.round(progresoPct))),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_KEY_PREFIX}${userId}`, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(TEORIA_PROGRESS_EVENT));
}

function resolveTopicPercent(href, { dbByHref, localRows, theoryAll }) {
  const legacyId = topicIdFromHref(href);
  const fromDb = dbByHref[href];
  const fromLocal = localRows[href]?.progreso_pct;
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
    localRows: readLocalTeoriaProgreso(userId),
    theoryAll: userId ? getAllTheoryProgress(userId) : {},
  };
}

export function buildTeoriaTopicProgressByHref({
  dbRows = [],
  userId = null,
  sectionKey = null,
} = {}) {
  const ctx = progressContext(dbRows, userId);
  const topicList = sectionKey
    ? SECTIONS[sectionKey] || []
    : getTheoryTopicsFlat();

  return Object.fromEntries(
    topicList.map((topic) => [topic.href, resolveTopicPercent(topic.href, ctx)]),
  );
}

export function computeSectionPercent(topics, progressByHref = {}) {
  if (!topics?.length) return 0;
  const sum = topics.reduce((acc, topic) => acc + (progressByHref[topic.href] ?? 0), 0);
  return Math.round(sum / topics.length);
}

export function computeTeoriaProgressSummary({ dbRows = [], userId = null } = {}) {
  const progressByHref = buildTeoriaTopicProgressByHref({ dbRows, userId });

  const units = THEORY_SECTION_CATALOG.map((area) => {
    const topics = SECTIONS[area.key] || [];
    const topicPercents = topics.map((topic) => progressByHref[topic.href] ?? 0);
    const percent =
      topicPercents.length > 0
        ? Math.round(topicPercents.reduce((sum, v) => sum + v, 0) / topicPercents.length)
        : 0;

    return {
      slug: area.slug,
      key: area.key,
      accent: area.accent,
      description: area.description,
      percent,
      completedTopics: topicPercents.filter((v) => v >= 100).length,
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
    topicProgressByHref: progressByHref,
    totalUnits: units.length,
  };
}
