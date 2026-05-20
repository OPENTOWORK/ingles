import { SECTIONS, THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import { computeSectionPercent } from '@/lib/teoriaProgress';
import { shouldApplySequentialLock } from '@/lib/theoryLockConfig';

const COMPLETE_PERCENT = 100;

export function getTeoriaSectionTopicUnlockStates(
  topics = [],
  progressByHref = {},
  isStudent = false,
) {
  const lockActive = shouldApplySequentialLock(isStudent);

  return topics.map((topic, index) => {
    const percent = progressByHref[topic.href] ?? 0;

    if (!lockActive) {
      return {
        href: topic.href,
        text: topic.text,
        locked: false,
        percent,
        requiredPrevious: null,
        topicNumber: index + 1,
      };
    }

    if (index === 0) {
      return {
        href: topic.href,
        text: topic.text,
        locked: false,
        percent,
        requiredPrevious: null,
        topicNumber: 1,
      };
    }

    const previous = topics[index - 1];
    const previousPercent = progressByHref[previous.href] ?? 0;

    return {
      href: topic.href,
      text: topic.text,
      locked: previousPercent < COMPLETE_PERCENT,
      percent,
      requiredPrevious: previous.text,
      topicNumber: index + 1,
    };
  });
}

export function isTeoriaTopicHrefLocked(
  topicHref,
  sectionKey,
  progressByHref = {},
  isStudent = false,
) {
  if (!shouldApplySequentialLock(isStudent) || !sectionKey || !topicHref) return false;
  const topics = SECTIONS[sectionKey] || [];
  const state = getTeoriaSectionTopicUnlockStates(topics, progressByHref, true).find(
    (item) => item.href === topicHref,
  );
  return state?.locked ?? false;
}

export function getTeoriaTopicUnlockInfo(
  topicHref,
  sectionKey,
  progressByHref = {},
  isStudent = false,
) {
  const topics = SECTIONS[sectionKey] || [];
  return (
    getTeoriaSectionTopicUnlockStates(topics, progressByHref, isStudent).find(
      (item) => item.href === topicHref,
    ) ?? null
  );
}

export function getTeoriaSectionProgressSummary(topics, progressByHref = {}) {
  const percent = computeSectionPercent(topics, progressByHref);
  const completedTopics = topics.filter(
    (topic) => (progressByHref[topic.href] ?? 0) >= COMPLETE_PERCENT,
  ).length;

  return {
    percent,
    completedTopics,
    topicsTotal: topics.length,
  };
}

/** Mapa href → estado de bloqueo para todos los apartados del hub Theory. */
export function buildAllTeoriaTopicUnlockMap(
  progressByHref = {},
  isStudent = false,
  sectionCatalog = THEORY_SECTION_CATALOG,
) {
  const map = {};
  for (const area of sectionCatalog) {
    const topics = SECTIONS[area.key] || [];
    getTeoriaSectionTopicUnlockStates(topics, progressByHref, isStudent).forEach((state) => {
      map[state.href] = { ...state, sectionKey: area.key };
    });
  }
  return map;
}
