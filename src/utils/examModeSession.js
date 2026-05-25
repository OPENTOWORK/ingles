import { getLevelFullExamSections } from '@/data/nivelesLevelHub';
import { getCambridgeSectionDurationSeconds } from '@/data/cambridgeExamTimings';

export const EXAM_MODE_SESSION_VERSION = 1;

/** @typedef {'locked' | 'active' | 'completed'} ExamModeSectionStatus */

/**
 * @typedef {object} ExamModeSectionState
 * @property {string} key
 * @property {string} title
 * @property {string} href
 * @property {number} partMin
 * @property {number} partMax
 * @property {number} durationSeconds
 * @property {ExamModeSectionStatus} status
 * @property {string|null} startedAt
 * @property {string|null} finishedAt
 * @property {number|null} remainingSeconds
 * @property {object|null} answers
 * @property {{ correct: number, total: number, byPart: Record<number, { correct: number, total: number, passing: number }> }|null} scores
 */

/**
 * @typedef {object} ExamModeSession
 * @property {number} version
 * @property {string} slug
 * @property {number} examSlot
 * @property {string} status - 'in_progress' | 'completed'
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {ExamModeSectionState[]} sections
 * @property {boolean} resultsReleased
 */

function storageKey(slug, examSlot, userId = '') {
  const uid = userId ? `${userId}_` : '';
  return `dralo_exam_mode_v${EXAM_MODE_SESSION_VERSION}_${uid}${slug}_${examSlot}`;
}

export function createExamModeSession(slug, examSlot) {
  const sections = getLevelFullExamSections(slug).map((s) => ({
    key: s.key,
    title: s.title,
    href: s.href,
    partMin: s.partMin,
    partMax: s.partMax,
    durationSeconds: getCambridgeSectionDurationSeconds(slug, s.title),
    status: /** @type {ExamModeSectionStatus} */ ('locked'),
    startedAt: null,
    finishedAt: null,
    remainingSeconds: getCambridgeSectionDurationSeconds(slug, s.title),
    answers: null,
    scores: null,
  }));

  if (sections.length > 0) {
    sections[0].status = 'active';
  }

  const now = new Date().toISOString();
  return {
    version: EXAM_MODE_SESSION_VERSION,
    slug,
    examSlot,
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
    sections,
    resultsReleased: false,
  };
}

export function loadExamModeSession(slug, examSlot, userId = '') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(slug, examSlot, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== EXAM_MODE_SESSION_VERSION) return null;
    if (parsed.slug !== slug || parsed.examSlot !== examSlot) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveExamModeSession(session, userId = '') {
  if (typeof window === 'undefined' || !session) return;
  const next = { ...session, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(
      storageKey(session.slug, session.examSlot, userId),
      JSON.stringify(next),
    );
  } catch (e) {
    console.warn('exam mode session save failed:', e);
  }
  return next;
}

export function getOrCreateExamModeSession(slug, examSlot, userId = '') {
  const existing = loadExamModeSession(slug, examSlot, userId);
  if (existing) return existing;
  const created = createExamModeSession(slug, examSlot);
  return saveExamModeSession(created, userId);
}

/** Clears stored progress and starts a fresh exam-mode session for the same test. */
export function resetExamModeSession(slug, examSlot, userId = '') {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(storageKey(slug, examSlot, userId));
    } catch {
      /* ignore */
    }
  }
  const fresh = createExamModeSession(slug, examSlot);
  return saveExamModeSession(fresh, userId);
}

/** @param {ExamModeSession} session */
/** @param {string} sectionKey */
export function getExamModeSection(session, sectionKey) {
  return session?.sections?.find((s) => s.key === sectionKey) ?? null;
}

/** @param {ExamModeSession} session */
export function getActiveExamModeSection(session) {
  return session?.sections?.find((s) => s.status === 'active') ?? null;
}

/** @param {ExamModeSession} session */
export function isExamModeComplete(session) {
  return session?.sections?.every((s) => s.status === 'completed') ?? false;
}

/**
 * @param {ExamModeSession} session
 * @param {string} sectionKey
 * @param {object} answers
 * @param {object|null} scores
 */
export function completeExamModeSection(session, sectionKey, answers, scores) {
  const idx = session.sections.findIndex((s) => s.key === sectionKey);
  if (idx < 0) return session;

  const now = new Date().toISOString();
  const sections = session.sections.map((s, i) => {
    if (s.key !== sectionKey) return s;
    return {
      ...s,
      status: 'completed',
      finishedAt: now,
      answers,
      scores,
      remainingSeconds: 0,
    };
  });

  if (idx + 1 < sections.length) {
    sections[idx + 1] = {
      ...sections[idx + 1],
      status: 'active',
      startedAt: sections[idx + 1].startedAt || now,
    };
  }

  const allDone = sections.every((s) => s.status === 'completed');
  return {
    ...session,
    sections,
    status: allDone ? 'completed' : 'in_progress',
    resultsReleased: allDone,
    updatedAt: now,
  };
}

/** @param {ExamModeSession} session */
/** @param {string} sectionKey */
export function startExamModeSectionTimer(session, sectionKey) {
  const sections = session.sections.map((s) => {
    if (s.key !== sectionKey) return s;
    if (s.startedAt) return s;
    return { ...s, startedAt: new Date().toISOString() };
  });
  return { ...session, sections, updatedAt: new Date().toISOString() };
}

/** @param {ExamModeSession} session */
/** @param {string} sectionKey */
/** @param {number} remainingSeconds */
export function updateExamModeSectionRemaining(session, sectionKey, remainingSeconds) {
  const sections = session.sections.map((s) =>
    s.key === sectionKey ? { ...s, remainingSeconds: Math.max(0, remainingSeconds) } : s,
  );
  return { ...session, sections, updatedAt: new Date().toISOString() };
}

/** Resolve section key from part range. */
export function resolveExamModeSectionKey(slug, partMin, partMax) {
  const sections = getLevelFullExamSections(slug);
  const match = sections.find((s) => partMin >= s.partMin && partMax <= s.partMax);
  return match?.key ?? null;
}

export function buildExamModePracticeHref(baseHref, examSlot, { review = false } = {}) {
  if (!baseHref) return baseHref;
  const sep = baseHref.includes('?') ? '&' : '?';
  const mode = review ? 'review' : '1';
  return `${baseHref}${sep}examen=${examSlot}&examMode=${mode}`;
}
