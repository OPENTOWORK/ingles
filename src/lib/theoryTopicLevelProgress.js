import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { THEORY_TOPIC_LEVEL_COUNT } from '@/lib/theoryTopicLevels';

const STORAGE_PREFIX = 'theory_topic_level_stars_';

function storageKey(userId, topicHref) {
  return `${STORAGE_PREFIX}${userId}_${normalizeTopicHref(topicHref)}`;
}

/** @returns {Record<number, number>} level 1–12 → stars */
export function readTheoryTopicLevelStars(userId, topicHref) {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = localStorage.getItem(storageKey(userId, topicHref));
    const parsed = raw ? JSON.parse(raw) : {};
    const out = {};
    for (let i = 1; i <= THEORY_TOPIC_LEVEL_COUNT; i += 1) {
      if (parsed[i] != null) out[i] = Number(parsed[i]);
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Guarda estrellas si mejora el récord del nivel.
 * @returns {number} estrellas guardadas
 */
export function saveTheoryTopicLevelStars(userId, topicHref, levelNum, stars) {
  if (typeof window === 'undefined' || !userId) return stars;
  const href = normalizeTopicHref(topicHref);
  const level = Math.min(THEORY_TOPIC_LEVEL_COUNT, Math.max(1, Number(levelNum) || 1));
  const nextStars = Math.min(3, Math.max(0, Number(stars) || 0));
  const all = readTheoryTopicLevelStars(userId, href);
  const prev = all[level];
  if (prev != null && prev !== undefined && prev >= nextStars) return prev;
  all[level] = nextStars;
  localStorage.setItem(storageKey(userId, href), JSON.stringify(all));
  window.dispatchEvent(new CustomEvent('theory-topic-level-stars-updated'));
  return nextStars;
}
