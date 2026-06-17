/**
 * Keeps exam-mode and skill-practice features stable when admin regenerates exam content.
 *
 * Contract for future work:
 * - Key practice state by slug + examSlot + partNumber (not preguntaId alone).
 * - Separate exam_mode vs skill_practice scores (see levelsScoreSource.js).
 * - After any regeneration, call notifyLevelsExamRegenerated() and reload catalog/data.
 * - After loading parts, call syncPracticeSessionWithExamContent() so stale drafts are dropped.
 */

export const LEVELS_EXAM_REGENERATED_EVENT = 'dralo:levels-exam-regenerated';

function revisionStorageKey(slug, examSlot) {
  return `dralo_exam_content_rev_${String(slug || '').toLowerCase()}_${Number(examSlot) || 1}`;
}

function pendingStorageKey(slug, examSlot) {
  return `dralo_exam_regen_pending_${String(slug || '').toLowerCase()}_${Number(examSlot) || 1}`;
}

function hashString(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return `r${(hash >>> 0).toString(36)}`;
}

/** Fingerprint from part numbers + pregunta ids (stable across UI refactors). */
export function buildExamContentRevision(partsData = []) {
  const fragments = partsData
    .map((part) => {
      const partNumber = Number(part.nombre?.match(/\d+/)?.[0] || part.partNumber || 0);
      const ids = (part.questions || [])
        .map((q) => String(q.preguntaId || q.id || ''))
        .filter(Boolean)
        .sort()
        .join(',');
      return `${partNumber}:${ids}`;
    })
    .sort()
    .join('|');
  return hashString(fragments);
}

export function getStoredExamContentRevision(slug, examSlot) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(revisionStorageKey(slug, examSlot));
  } catch {
    return null;
  }
}

export function setStoredExamContentRevision(slug, examSlot, revision) {
  if (typeof window === 'undefined' || !revision) return;
  try {
    localStorage.setItem(revisionStorageKey(slug, examSlot), revision);
  } catch {
    /* ignore */
  }
}

function setPendingRegeneration(slug, examSlot) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(pendingStorageKey(slug, examSlot), String(Date.now()));
  } catch {
    /* ignore */
  }
}

function consumePendingRegeneration(slug, examSlot) {
  if (typeof window === 'undefined') return false;
  try {
    const key = pendingStorageKey(slug, examSlot);
    const pending = localStorage.getItem(key);
    if (!pending) return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** Drop in-progress drafts when content changed; keep completed section results. */
export function reconcileExamModeSessionForContentRevision(session, contentRevision) {
  if (!session) return null;

  const sections = session.sections.map((section) => {
    if (section.status === 'completed') return section;
    return {
      ...section,
      sectionDraft: null,
      answers: null,
    };
  });

  return {
    ...session,
    contentRevision,
    sections,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * @param {object} params
 * @param {string} params.slug
 * @param {number} params.examSlot
 * @param {Array} params.partsData
 * @param {object|null} [params.examModeSession]
 * @param {(session: object, userId?: string) => object|null} [params.saveExamModeSession]
 * @param {string} [params.userId]
 * @param {{ current?: Record<number, object> }} [params.examDraftRef]
 */
export function syncPracticeSessionWithExamContent({
  slug,
  examSlot,
  partsData,
  examModeSession = null,
  saveExamModeSession = null,
  userId = '',
  examDraftRef = null,
}) {
  const revision = buildExamContentRevision(partsData);
  const previous = getStoredExamContentRevision(slug, examSlot);
  const pendingRegeneration = consumePendingRegeneration(slug, examSlot);
  const revisionChanged = previous != null && previous !== revision;
  const contentChanged = pendingRegeneration || revisionChanged;

  setStoredExamContentRevision(slug, examSlot, revision);

  if (!contentChanged) {
    if (examModeSession && examModeSession.contentRevision !== revision && saveExamModeSession) {
      const tagged = { ...examModeSession, contentRevision: revision };
      saveExamModeSession(tagged, userId);
      return { contentChanged: false, revision, session: tagged };
    }
    return { contentChanged: false, revision, session: examModeSession };
  }

  if (examDraftRef) {
    examDraftRef.current = {};
  }

  let session = examModeSession;
  if (session && saveExamModeSession) {
    session = reconcileExamModeSessionForContentRevision(session, revision);
    session = saveExamModeSession(session, userId);
  }

  return { contentChanged: true, revision, session };
}

export function notifyLevelsExamRegenerated({ slug, examSlot }) {
  if (typeof window === 'undefined') return;
  const normalizedSlug = String(slug || '').toLowerCase();
  const slot = Number(examSlot) || 1;
  setPendingRegeneration(normalizedSlug, slot);
  window.dispatchEvent(
    new CustomEvent(LEVELS_EXAM_REGENERATED_EVENT, {
      detail: { slug: normalizedSlug, examSlot: slot },
    }),
  );
}

/** Shared post-regeneration refresh for exam-mode and skill practice pages. */
export function createLevelsExamCatalogUpdatedHandler(tasks = []) {
  return async () => {
    for (const task of tasks) {
      if (typeof task === 'function') {
        await task();
      }
    }
  };
}
