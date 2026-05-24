import { SECTIONS, THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import {
  computeTopicExerciseProgressPercent,
  countPassedForTopic,
} from '@/lib/theoryExerciseProgress';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
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
  const href = normalizeTopicHref(topicHref);
  const topic = getTheoryTopicsFlat().find((t) => t.href === href);
  return topic?.apartado ?? null;
}

function topicIdFromHref(href) {
  return href.replace(/^\/teoria\//, '');
}

function readLocalTeoriaProgreso(userId) {
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

export function writeLocalTeoriaProgreso(userId, topicHref, progresoPct) {
  if (typeof window === 'undefined' || !userId) return;
  const href = normalizeTopicHref(topicHref);
  const all = readLocalTeoriaProgreso(userId);
  all[href] = {
    topic_href: href,
    apartado: findTheoryApartadoForTopicHref(href),
    progreso_pct: Math.min(100, Math.max(0, Math.round(progresoPct))),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_KEY_PREFIX}${userId}`, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(TEORIA_PROGRESS_EVENT));
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

function resolveTopicPercent(href, { dbByHref, localRows, theoryAll, userId }) {
  const canonicalHref = normalizeTopicHref(href);
  const legacyId = topicIdFromHref(canonicalHref);
  const fromDb = dbByHref[canonicalHref];
  const fromLocal = localRows[canonicalHref]?.progreso_pct;
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
    localRows: readLocalTeoriaProgreso(userId),
    theoryAll: userId ? getAllTheoryProgress(userId) : {},
    userId,
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
