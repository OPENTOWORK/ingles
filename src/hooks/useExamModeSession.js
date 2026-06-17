'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { shouldSyncExamModeSessionToServer } from '@/lib/b2ScoringV2FeatureFlag';
import {
  completeExamModeSection,
  getOrCreateExamModeSession,
  loadExamModeSession,
  resetExamModeSession,
  saveExamModeSession,
  saveExamModeSectionDraft,
  startExamModeSectionTimer,
  updateExamModeSectionRemaining,
} from '@/utils/examModeSession';
import { mergeExamModeSessionSources } from '@/utils/mergeExamModeSessionSources';
import {
  archiveExamModeAttempt,
} from '@/utils/examModeAttemptHistory';
import {
  LEVELS_EXAM_REGENERATED_EVENT,
  reconcileExamModeSessionForContentRevision,
  syncPracticeSessionWithExamContent,
} from '@/utils/levelsExamRegenerationSync';

const REMAINING_PERSIST_DEBOUNCE_MS = 5000;

/**
 * Persisted exam-mode session for a level + test slot.
 */
export function useExamModeSession(slug, examSlot) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState('');
  const [ready, setReady] = useState(false);
  const sessionRef = useRef(null);
  const liveRemainingRef = useRef({});
  const persistTimerRef = useRef(null);
  const pendingSessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const flushPendingPersist = useCallback(() => {
    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    const pending = pendingSessionRef.current;
    if (!pending) return;
    pendingSessionRef.current = null;
    const saved = saveExamModeSession(pending, userId);
    setSession(saved);
    void syncExamModeToServer(saved, userId);
  }, [userId]);

  const schedulePersist = useCallback(
    (next) => {
      pendingSessionRef.current = next;
      if (persistTimerRef.current) return;
      persistTimerRef.current = window.setTimeout(() => {
        persistTimerRef.current = null;
        flushPendingPersist();
      }, REMAINING_PERSIST_DEBOUNCE_MS);
    },
    [flushPendingPersist],
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushPendingPersist();
    };
    const onPageHide = () => flushPendingPersist();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      flushPendingPersist();
    };
  }, [flushPendingPersist]);

  useEffect(() => {
    void (async () => {
      const uid = (await getSessionUserId()) || '';
      setUserId(uid);

      const local = loadExamModeSession(slug, examSlot, uid);
      let session = local;

      if (uid) {
        const remote = await fetchExamModeSessionFromServer({ slug, examSlot, userId: uid });
        session = mergeExamModeSessionSources(local, remote);
        if (session && session !== local) {
          saveExamModeSession(session, uid);
        }
      }

      if (!session) {
        session = getOrCreateExamModeSession(slug, examSlot, uid);
      }

      setSession(session);
      setReady(true);
    })();
  }, [slug, examSlot]);

  const persist = useCallback(
    (next) => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      pendingSessionRef.current = null;
      const saved = saveExamModeSession(next, userId);
      setSession(saved);
      void syncExamModeToServer(saved, userId);
      return saved;
    },
    [userId],
  );

  const reload = useCallback(() => {
    const s = loadExamModeSession(slug, examSlot, userId);
    if (s) setSession(s);
  }, [slug, examSlot, userId]);

  const finishSection = useCallback(
    (sectionKey, answers, scores) => {
      const current = sessionRef.current;
      if (!current) return null;
      flushPendingPersist();
      const next = completeExamModeSection(current, sectionKey, answers, scores);
      return persist(next);
    },
    [persist, flushPendingPersist],
  );

  const touchSectionTimer = useCallback(
    (sectionKey) => {
      const current = sessionRef.current;
      if (!current) return;
      const section = current.sections.find((s) => s.key === sectionKey);
      if (!section?.startedAt) {
        persist(startExamModeSectionTimer(current, sectionKey));
      }
    },
    [persist],
  );

  const setSectionRemaining = useCallback(
    (sectionKey, remainingSeconds) => {
      const base = pendingSessionRef.current ?? sessionRef.current;
      if (!base) return;
      const safe = Math.max(0, Number(remainingSeconds) || 0);
      liveRemainingRef.current[sectionKey] = safe;
      schedulePersist(updateExamModeSectionRemaining(base, sectionKey, safe));
    },
    [schedulePersist],
  );

  const getSectionRemaining = useCallback(
    (sectionKey) => {
      if (sectionKey && liveRemainingRef.current[sectionKey] != null) {
        return liveRemainingRef.current[sectionKey];
      }
      const sec = sessionRef.current?.sections?.find((s) => s.key === sectionKey);
      return sec?.remainingSeconds ?? null;
    },
    [],
  );

  const saveSectionDraft = useCallback(
    (sectionKey, draft) => {
      const current = sessionRef.current;
      if (!current) return null;
      flushPendingPersist();
      return persist(saveExamModeSectionDraft(current, sectionKey, draft));
    },
    [persist, flushPendingPersist],
  );

  const resetExam = useCallback(() => {
    flushPendingPersist();
    liveRemainingRef.current = {};
    const fresh = resetExamModeSession(slug, examSlot, userId);
    setSession(fresh);
    void syncExamModeToServer(fresh, userId);
    return fresh;
  }, [slug, examSlot, userId, flushPendingPersist]);

  const repeatExam = useCallback(
    async (options = {}) => {
      const { confirm: askConfirm = true } = options;
      if (askConfirm) {
        const ok = window.confirm(
          'Start a new attempt? Your current progress will be cleared, but this attempt will be saved in your exam statistics.',
        );
        if (!ok) return false;
      }
      flushPendingPersist();
      const current = sessionRef.current;
      if (current) {
        await archiveExamModeAttempt({ slug, examSlot, userId, session: current });
      }
      resetExam();
      router.push(`/niveles/${slug}/exam-mode?examen=${examSlot}`);
      return true;
    },
    [resetExam, router, slug, examSlot, userId, flushPendingPersist],
  );

  const applyExamContentSync = useCallback(
    (partsData, examDraftRef = null) => {
      const current = sessionRef.current;
      const result = syncPracticeSessionWithExamContent({
        slug,
        examSlot,
        partsData,
        examModeSession: current,
        saveExamModeSession: (next) => persist(next),
        userId,
        examDraftRef,
      });
      if (result.session && result.session !== current) {
        setSession(result.session);
      }
      return result;
    },
    [slug, examSlot, userId, persist],
  );

  useEffect(() => {
    const onRegenerated = (event) => {
      const detail = event?.detail || {};
      if (detail.slug !== String(slug || '').toLowerCase()) return;
      if (Number(detail.examSlot) !== Number(examSlot)) return;

      const current = sessionRef.current;
      if (!current) return;

      const next = reconcileExamModeSessionForContentRevision(
        current,
        current.contentRevision || 'regenerated',
      );
      persist(next);
    };

    window.addEventListener(LEVELS_EXAM_REGENERATED_EVENT, onRegenerated);
    return () => window.removeEventListener(LEVELS_EXAM_REGENERATED_EVENT, onRegenerated);
  }, [slug, examSlot, persist]);

  return {
    session,
    ready,
    userId,
    persist,
    reload,
    finishSection,
    touchSectionTimer,
    setSectionRemaining,
    getSectionRemaining,
    saveSectionDraft,
    resetExam,
    repeatExam,
    applyExamContentSync,
  };
}

async function fetchExamModeSessionFromServer({ slug, examSlot, userId }) {
  if (!userId) return null;
  try {
    const res = await fetch(
      `/api/levels/exam-mode-session?slug=${encodeURIComponent(slug)}&examen=${examSlot}&userId=${encodeURIComponent(userId)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

async function syncExamModeToServer(session, userId) {
  if (!userId || !session) return;
  if (!shouldSyncExamModeSessionToServer(session)) return;
  try {
    await fetch('/api/levels/exam-mode-session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, userId }),
    });
  } catch {
    /* localStorage remains source of truth */
  }
}
