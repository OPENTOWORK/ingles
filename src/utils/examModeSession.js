import { getLevelFullExamSections } from '@/data/nivelesLevelHub';
import { getCambridgeSectionDurationSeconds } from '@/data/cambridgeExamTimings';
import { isExamModeSectionKeyBlockedForStudent } from '@/constants/studentFeatureAccess';
import {
  getActiveScoringVersion,
  isExamModeSessionScoringCompatible,
  attachScoringVersionToExamModeScores,
} from '@/lib/b2ScoringV2FeatureFlag';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';

export const EXAM_MODE_SESSION_VERSION = 1;

/** @typedef {'locked' | 'active' | 'completed' | 'blocked'} ExamModeSectionStatus */

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
 * @property {object|null} [sectionDraft]
 * @property {{ correct: number, total: number, byPart: Record<number, { correct: number, total: number, passing: number }> }|null} scores
 * @property {number|null} [redoPart] — single part being re-attempted inside a completed section
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
 * @property {1|2} [scoringVersion] — local scoring model; must match active feature flag
 */

function storageKey(slug, examSlot, userId = '') {
  const uid = userId ? `${userId}_` : '';
  return `dralo_exam_mode_v${EXAM_MODE_SESSION_VERSION}_${uid}${slug}_${examSlot}`;
}

function isSectionBlockedForRole(section, userRole = '') {
  return isExamModeSectionKeyBlockedForStudent(userRole, section?.key);
}

function getPlayableSections(session, userRole = '') {
  return (session?.sections ?? []).filter((s) => !isSectionBlockedForRole(s, userRole));
}

function blockedSectionState(section) {
  return {
    ...section,
    status: /** @type {ExamModeSectionStatus} */ ('blocked'),
    startedAt: null,
    finishedAt: null,
    answers: null,
    sectionDraft: null,
    scores: null,
    remainingSeconds: section.durationSeconds ?? section.remainingSeconds ?? null,
    redoPart: undefined,
  };
}

/** Reconcile active/completed state after student restrictions or section completion. */
export function reconcileExamModeSessionProgress(session, userRole = '') {
  if (!session?.sections?.length) return session;

  const sections = session.sections.map((s) => {
    if (!isSectionBlockedForRole(s, userRole)) return { ...s };
    return blockedSectionState(s);
  });

  const playable = sections.filter((s) => !isSectionBlockedForRole(s, userRole));
  const allPlayableComplete =
    playable.length > 0 && playable.every((s) => s.status === 'completed');
  const hasActive = playable.some((s) => s.status === 'active');

  if (!allPlayableComplete && !hasActive) {
    const firstOpen = playable.find((s) => s.status !== 'completed');
    if (firstOpen) {
      const now = new Date().toISOString();
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].key === firstOpen.key) {
          sections[i] = {
            ...sections[i],
            status: 'active',
            startedAt: sections[i].startedAt || now,
          };
        } else if (sections[i].status === 'active') {
          sections[i] = { ...sections[i], status: 'locked' };
        }
      }
    }
  }

  return {
    ...session,
    sections,
    status: allPlayableComplete ? 'completed' : 'in_progress',
    resultsReleased: allPlayableComplete ? true : session.resultsReleased && allPlayableComplete,
    updatedAt: new Date().toISOString(),
  };
}

/** Strip listening/speaking progress for students and fix session progression. */
export function applyExamModeStudentRestrictions(session, userRole = '') {
  if (!session?.sections?.length) return session;
  return reconcileExamModeSessionProgress(session, userRole);
}

export function createExamModeSession(slug, examSlot, userRole = '') {
  const sections = getLevelFullExamSections(slug).map((s) => ({
    key: s.key,
    title: s.title,
    href: s.href,
    partMin: s.partMin,
    partMax: s.partMax,
    durationSeconds: getCambridgeSectionDurationSeconds(slug, s.title),
    status: /** @type {ExamModeSectionStatus} */ (
      isSectionBlockedForRole({ key: s.key }, userRole) ? 'blocked' : 'locked'
    ),
    startedAt: null,
    finishedAt: null,
    remainingSeconds: getCambridgeSectionDurationSeconds(slug, s.title),
    answers: null,
    sectionDraft: null,
    scores: null,
  }));

  const now = new Date().toISOString();
  const session = {
    version: EXAM_MODE_SESSION_VERSION,
    slug,
    examSlot,
    scoringVersion: getActiveScoringVersion(),
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
    sections,
    resultsReleased: false,
  };

  return reconcileExamModeSessionProgress(session, userRole);
}

export function loadExamModeSession(slug, examSlot, userId = '') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(slug, examSlot, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== EXAM_MODE_SESSION_VERSION) return null;
    if (parsed.slug !== slug || parsed.examSlot !== examSlot) return null;
    if (!isExamModeSessionScoringCompatible(parsed)) {
      try {
        localStorage.removeItem(storageKey(slug, examSlot, userId));
      } catch {
        /* ignore */
      }
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveExamModeSession(session, userId = '') {
  if (typeof window === 'undefined' || !session) return;
  const next = {
    ...session,
    scoringVersion: session.scoringVersion ?? getActiveScoringVersion(),
    updatedAt: new Date().toISOString(),
  };
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

export function getOrCreateExamModeSession(slug, examSlot, userId = '', userRole = '') {
  const existing = loadExamModeSession(slug, examSlot, userId);
  if (existing) {
    return saveExamModeSession(applyExamModeStudentRestrictions(existing, userRole), userId);
  }
  const created = createExamModeSession(slug, examSlot, userRole);
  return saveExamModeSession(created, userId);
}

/** Clears stored progress and starts a fresh exam-mode session for the same test. */
export function resetExamModeSession(slug, examSlot, userId = '', userRole = '') {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(storageKey(slug, examSlot, userId));
    } catch {
      /* ignore */
    }
  }
  const fresh = createExamModeSession(slug, examSlot, userRole);
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
export function isExamModeComplete(session, userRole = '') {
  const playable = getPlayableSections(session, userRole);
  if (!playable.length) return false;
  return playable.every((s) => s.status === 'completed');
}

export function resolveExamModeSectionScoreDisplay(scores) {
  if (!scores) return { correct: 0, total: 0 };
  const v2 = Number(scores.scoringVersion) === 2;
  return {
    correct: Math.max(
      0,
      Number(v2 ? (scores.pointsEarned ?? scores.correct) : scores.correct) || 0,
    ),
    total: Math.max(
      0,
      Number(v2 ? (scores.maxPoints ?? scores.total) : scores.total) || 0,
    ),
  };
}

/**
 * @param {ExamModeSession|null|undefined} session
 * @returns {{ stars: number, correct: number, total: number, approvedParts: number, inProgress: boolean }}
 */
export function buildExamModeSlotProgress(session, userRole = '') {
  const empty = { stars: 0, correct: 0, total: 0, approvedParts: 0, inProgress: false };
  if (!session?.sections?.length) return empty;

  let correct = 0;
  let total = 0;
  let approvedParts = 0;

  for (const sec of session.sections) {
    if (isSectionBlockedForRole(sec, userRole)) continue;
    if (sec.status !== 'completed' || !sec.scores) continue;
    approvedParts += 1;
    const display = resolveExamModeSectionScoreDisplay(sec.scores);
    correct += display.correct;
    total += display.total;
  }

  const inProgress =
    session.status === 'in_progress' &&
    session.sections.some((sec) => sec.status === 'active' || sec.status === 'completed' || sec.startedAt);

  return {
    stars: starsFromLevelsEarnedMax(correct, total),
    correct,
    total,
    approvedParts,
    inProgress,
  };
}

/**
 * @param {string} slug
 * @param {string} [userId]
 * @param {number[]} [slots]
 */
export function buildExamModeProgressBySlot(slug, userId = '', slots = [], userRole = '') {
  const bySlot = {};
  for (const slot of slots) {
    const session = loadExamModeSession(slug, slot, userId);
    const normalized = session ? applyExamModeStudentRestrictions(session, userRole) : null;
    bySlot[slot] = buildExamModeSlotProgress(normalized, userRole);
  }
  return bySlot;
}

/**
 * @param {ExamModeSession} session
 * @param {string} sectionKey
 * @param {object} answers
 * @param {object|null} scores
 */
export function completeExamModeSection(session, sectionKey, answers, scores, userRole = '') {
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
      sectionDraft: null,
      scores: attachScoringVersionToExamModeScores(scores),
      remainingSeconds: 0,
    };
  });

  let nextIdx = idx + 1;
  while (nextIdx < sections.length && isSectionBlockedForRole(sections[nextIdx], userRole)) {
    nextIdx += 1;
  }

  if (nextIdx < sections.length) {
    sections[nextIdx] = {
      ...sections[nextIdx],
      status: 'active',
      startedAt: sections[nextIdx].startedAt || now,
    };
  }

  const allDone = getPlayableSections({ sections }, userRole).every((s) => {
    const current = sections.find((row) => row.key === s.key);
    return current?.status === 'completed';
  });

  return {
    ...session,
    sections,
    status: allDone ? 'completed' : 'in_progress',
    resultsReleased: allDone,
    updatedAt: now,
  };
}

/** Reset one paper so the student can attempt it again in exam mode. */
export function resetExamModeSection(session, sectionKey) {
  if (session.sections.findIndex((s) => s.key === sectionKey) < 0) return session;

  const now = new Date().toISOString();
  const sections = session.sections.map((s) => {
    if (s.key !== sectionKey) return s;
    return {
      ...s,
      status: /** @type {ExamModeSectionStatus} */ ('active'),
      startedAt: null,
      finishedAt: null,
      answers: null,
      sectionDraft: null,
      scores: null,
      remainingSeconds: s.durationSeconds ?? null,
    };
  });

  return {
    ...session,
    sections,
    status: 'in_progress',
    resultsReleased: false,
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

/** Persist in-progress answers for an active section (explicit save). */
export function saveExamModeSectionDraft(session, sectionKey, draft) {
  const sections = session.sections.map((s) =>
    s.key === sectionKey ? { ...s, sectionDraft: draft ?? null } : s,
  );
  return { ...session, sections, updatedAt: new Date().toISOString() };
}

/** Resolve section key from part range. */
export function resolveExamModeSectionKey(slug, partMin, partMax) {
  const sections = getLevelFullExamSections(slug);
  const match = sections.find((s) => partMin >= s.partMin && partMax <= s.partMax);
  return match?.key ?? null;
}

export function buildExamModePracticeHref(
  baseHref,
  examSlot,
  { review = false, part = null, repeatPart = false } = {},
) {
  if (!baseHref) return baseHref;
  const sep = baseHref.includes('?') ? '&' : '?';
  const mode = review ? 'review' : '1';
  let url = `${baseHref}${sep}examen=${examSlot}&examMode=${mode}`;
  if (part != null && Number.isFinite(Number(part))) {
    url += `&part=${Number(part)}`;
  }
  if (repeatPart) {
    url += '&repeatPart=1';
  }
  return url;
}

/**
 * Footer "back" target while inside an exam-mode section (hub for the current test slot).
 * @param {string} [slug='b2']
 * @param {number} [examSlot=1]
 * @param {'en'|'es'} [lang='en']
 */
export function getExamModeHubNav(slug = 'b2', examSlot = 1, lang = 'en') {
  const key = String(slug || 'b2').toLowerCase();
  const slot = Math.min(5, Math.max(1, Number(examSlot) || 1));
  const isEn = lang === 'en';
  const levelTag = key.toUpperCase();
  return {
    href: `/niveles/${key}/exam-mode?examen=${slot}`,
    label: isEn
      ? `Back to ${levelTag} exam simulation`
      : `Volver a simulación examen ${levelTag}`,
  };
}
