import { parseTopicLevels } from '@/lib/theoryExerciseLevelConfig';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import {
  isTheoryExercisePassed,
  theoryExerciseStorageKey,
} from '@/lib/theoryExerciseMeta';

export const THEORY_EXERCISE_PROGRESS_EVENT = 'theory-exercise-progress-updated';

const LOCAL_PASSED_PREFIX = 'theory_exercises_passed_';

function readLocalPassed(userId) {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_PASSED_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLocalPassedExercise(userId, topicHref, cefrLevel, exerciseKey) {
  if (typeof window === 'undefined' || !userId) return;
  const href = normalizeTopicHref(topicHref);
  const all = readLocalPassed(userId);
  const key = theoryExerciseStorageKey(href, cefrLevel, exerciseKey);
  all[key] = {
    topic_href: href,
    cefr_level: cefrLevel,
    exercise_key: exerciseKey,
    passed_at: new Date().toISOString(),
  };
  localStorage.setItem(`${LOCAL_PASSED_PREFIX}${userId}`, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(THEORY_EXERCISE_PROGRESS_EVENT));
}

export function getPassedExerciseKeysForTopic(userId, topicHref, cefrLevels = null) {
  const href = normalizeTopicHref(topicHref);
  const all = readLocalPassed(userId);
  const levels = cefrLevels?.length ? cefrLevels : null;
  const keys = new Set();

  Object.entries(all).forEach(([storageKey, row]) => {
    if (normalizeTopicHref(row?.topic_href) !== href) return;
    if (levels && !levels.includes(row.cefr_level)) return;
    keys.add(row.exercise_key || storageKey.split('|').pop());
  });

  return keys;
}

export function computeTopicExerciseProgressPercent({
  passedCount,
  topicLevelLabel,
  exercisesPerLevel = 0,
}) {
  if (!exercisesPerLevel || exercisesPerLevel <= 0) return 0;
  const levels = parseTopicLevels(topicLevelLabel);
  const total = Math.max(1, levels.length * exercisesPerLevel);
  return Math.min(100, Math.round((passedCount / total) * 100));
}

export function isExamTheoryTopic(topicHref) {
  return Boolean(findExamUnitSlugForTopicHref(topicHref));
}

export function isHubTheoryTopic(topicHref) {
  return Boolean(findTheoryApartadoForTopicHref(topicHref));
}

export function countPassedForTopic(userId, topicHref, topicLevelLabel) {
  const levels = parseTopicLevels(topicLevelLabel);
  const keys = getPassedExerciseKeysForTopic(userId, topicHref, levels);
  return keys.size;
}

export function shouldPersistExercisePass(score) {
  return isTheoryExercisePassed(score);
}

/** Cualquier intento evaluado (acierto o fallo) se guarda en Supabase. */
export function shouldRecordTheoryExerciseAttempt(score) {
  const n = Number(score);
  return Number.isFinite(n) && n >= 0 && n <= 100;
}
