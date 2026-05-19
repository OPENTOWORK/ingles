import { EXAM_THEORY_CATALOG, SECTIONS } from '@/data/teoriaSections';
import { computeSectionPercent } from '@/lib/examTheoryProgress';

const COMPLETE_PERCENT = 100;

export function getSectionKeyBySlug(sectionSlug) {
  return EXAM_THEORY_CATALOG.find((area) => area.slug === sectionSlug)?.key ?? null;
}

/** Desbloqueo secuencial de temas dentro de un apartado (solo estudiantes). */
export function getExamSectionTopicUnlockStates(
  topics = [],
  progressByHref = {},
  isStudent = false,
) {
  return topics.map((topic, index) => {
    const percent = progressByHref[topic.href] ?? 0;

    if (!isStudent) {
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
    const unlocked = previousPercent >= COMPLETE_PERCENT;

    return {
      href: topic.href,
      text: topic.text,
      locked: !unlocked,
      percent,
      requiredPrevious: previous.text,
      topicNumber: index + 1,
    };
  });
}

export function isExamTopicHrefLocked(
  topicHref,
  sectionKey,
  progressByHref = {},
  isStudent = false,
) {
  if (!isStudent || !sectionKey || !topicHref) return false;
  const topics = SECTIONS[sectionKey] || [];
  const state = getExamSectionTopicUnlockStates(topics, progressByHref, true).find(
    (item) => item.href === topicHref,
  );
  return state?.locked ?? false;
}

export function getExamTopicUnlockInfo(
  topicHref,
  sectionKey,
  progressByHref = {},
  isStudent = false,
) {
  const topics = SECTIONS[sectionKey] || [];
  return (
    getExamSectionTopicUnlockStates(topics, progressByHref, isStudent).find(
      (item) => item.href === topicHref,
    ) ?? null
  );
}

export function getSectionProgressSummary(topics, progressByHref = {}) {
  const states = topics.map((topic) => ({
    href: topic.href,
    percent: progressByHref[topic.href] ?? 0,
  }));
  const percent = computeSectionPercent(topics, progressByHref);
  const completedTopics = states.filter((item) => item.percent >= COMPLETE_PERCENT).length;

  return {
    percent,
    completedTopics,
    topicsTotal: topics.length,
    topicStates: states,
  };
}
