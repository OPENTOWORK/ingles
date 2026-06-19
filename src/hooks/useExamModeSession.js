'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import {
  shouldSyncExamModeSessionToServer,
  shouldClearExamSlotPuntuacionesOnRepeat,
} from '@/lib/b2ScoringV2FeatureFlag';
import {
  completeExamModeSection,
  getOrCreateExamModeSession,
  loadExamModeSession,
  resetExamModeSession,
  resetExamModeSection,
  saveExamModeSession,
  saveExamModeSectionDraft,
  startExamModeSectionTimer,
  updateExamModeSectionRemaining,
  buildExamModePracticeHref,
} from '@/utils/examModeSession';
import {
  LEVELS_EXAM_REGENERATED_EVENT,
  reconcileExamModeSessionForContentRevision,
  syncPracticeSessionWithExamContent,
} from '@/utils/levelsExamRegenerationSync';
import {
  applyExamModeSessionScorePatch,
  persistRescoredExamModeSnapshots,
  scoresPatchDiffersFromSession,
} from '@/utils/examModeRescoreFromDrafts';
import {
  mergeExamModePartRepeat,
  prepareExamModePartRepeat,
} from '@/utils/examModePartRepeat';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/** Timer ticks: localStorage at most every 5s; server sync at most every 30s. */
const TIMER_LOCAL_SAVE_MS = 5000;
const TIMER_SERVER_SYNC_MS = 30000;

/**
 * Persisted exam-mode session for a level + test slot.
 */
export function useExamModeSession(slug, examSlot) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState('');
  const [ready, setReady] = useState(false);
  const sessionRef = useRef(null);
  const pendingSyncRef = useRef(null);
  const serverSyncTimerRef = useRef(null);
  const localSaveTimerRef = useRef(null);
  const lastLocalSaveAtRef = useRef(0);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    void (async () => {
      const uid = (await getSessionUserId()) || '';
      setUserId(uid);
      const s = getOrCreateExamModeSession(slug, examSlot, uid);
      setSession(s);
      setReady(true);
    })();
  }, [slug, examSlot]);

  const flushServerSync = useCallback(() => {
    if (serverSyncTimerRef.current) {
      window.clearTimeout(serverSyncTimerRef.current);
      serverSyncTimerRef.current = null;
    }
    const toSync = pendingSyncRef.current ?? sessionRef.current;
    pendingSyncRef.current = null;
    if (toSync) void syncExamModeToServer(toSync, userId);
  }, [userId]);

  const scheduleServerSync = useCallback(() => {
    if (serverSyncTimerRef.current) return;
    serverSyncTimerRef.current = window.setTimeout(() => {
      serverSyncTimerRef.current = null;
      flushServerSync();
    }, TIMER_SERVER_SYNC_MS);
  }, [flushServerSync]);

  const flushLocalSave = useCallback(() => {
    if (localSaveTimerRef.current) {
      window.clearTimeout(localSaveTimerRef.current);
      localSaveTimerRef.current = null;
    }
    const current = sessionRef.current;
    if (!current) return;
    const saved = saveExamModeSession(current, userId);
    sessionRef.current = saved;
    pendingSyncRef.current = saved;
    lastLocalSaveAtRef.current = Date.now();
  }, [userId]);

  const scheduleLocalSave = useCallback(() => {
    if (localSaveTimerRef.current) return;
    const elapsed = Date.now() - lastLocalSaveAtRef.current;
    const delay = Math.max(0, TIMER_LOCAL_SAVE_MS - elapsed);
    localSaveTimerRef.current = window.setTimeout(() => {
      localSaveTimerRef.current = null;
      flushLocalSave();
    }, delay);
  }, [flushLocalSave]);

  const persist = useCallback(
    (next) => {
      if (localSaveTimerRef.current) {
        window.clearTimeout(localSaveTimerRef.current);
        localSaveTimerRef.current = null;
      }
      if (serverSyncTimerRef.current) {
        window.clearTimeout(serverSyncTimerRef.current);
        serverSyncTimerRef.current = null;
      }
      const saved = saveExamModeSession(next, userId);
      setSession(saved);
      sessionRef.current = saved;
      pendingSyncRef.current = saved;
      lastLocalSaveAtRef.current = Date.now();
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
      if (!session) return null;
      const next = completeExamModeSection(session, sectionKey, answers, scores);
      return persist(next);
    },
    [session, persist],
  );

  const touchSectionTimer = useCallback(
    (sectionKey) => {
      if (!session) return;
      const section = session.sections.find((s) => s.key === sectionKey);
      if (!section?.startedAt) {
        persist(startExamModeSectionTimer(session, sectionKey));
      }
    },
    [session, persist],
  );

  const setSectionRemaining = useCallback(
    (sectionKey, remainingSeconds) => {
      const current = sessionRef.current;
      if (!current) return;
      const next = updateExamModeSectionRemaining(current, sectionKey, remainingSeconds);
      sessionRef.current = next;
      pendingSyncRef.current = next;
      scheduleLocalSave();
      scheduleServerSync();
    },
    [scheduleLocalSave, scheduleServerSync],
  );

  const resetExam = useCallback(() => {
    const fresh = resetExamModeSession(slug, examSlot, userId);
    setSession(fresh);
    void syncExamModeToServer(fresh, userId);
    return fresh;
  }, [slug, examSlot, userId]);

  const repeatExam = useCallback(
    async (options = {}) => {
      const { confirm: askConfirm = true, examenId = null } = options;
      if (askConfirm) {
        const ok = window.confirm(
          'Start this test again? Your previous answers and scores for this test will be cleared.',
        );
        if (!ok) return false;
      }
      if (examenId && userId && shouldClearExamSlotPuntuacionesOnRepeat(slug)) {
        const { clearExamSlotPuntuaciones } = await import('@/lib/fetchExamModeSlotStats');
        const { supabase } = await import('@/utils/supabaseClient');
        await clearExamSlotPuntuaciones(supabase, { userId, examenId });
      }
      resetExam();
      router.push(`/niveles/${slug}/exam-mode?examen=${examSlot}`);
      return true;
    },
    [resetExam, router, slug, examSlot, userId],
  );

  const repeatSection = useCallback(
    (sectionKey, practiceHref) => {
      if (!session || !sectionKey || !practiceHref) return false;
      const ok = window.confirm(
        'Repeat this section? Your saved answers and score for this paper will be cleared.',
      );
      if (!ok) return false;
      const next = resetExamModeSection(session, sectionKey);
      persist(next);
      router.push(buildExamModePracticeHref(practiceHref, examSlot, { review: false }));
      return true;
    },
    [session, persist, router, examSlot],
  );

  const repeatPart = useCallback(
    (sectionKey, practiceHref, partNumber) => {
      if (!session || !sectionKey || !practiceHref) return false;
      const pn = Number(partNumber);
      if (!Number.isFinite(pn)) return false;
      const ok = window.confirm(
        `Repeat Part ${pn}? Only this part will be reset; the rest of your exam stays as it is.`,
      );
      if (!ok) return false;
      const next = prepareExamModePartRepeat(session, sectionKey, pn, slug);
      persist(next);
      router.push(
        buildExamModePracticeHref(practiceHref, examSlot, {
          review: false,
          part: pn,
          repeatPart: true,
        }),
      );
      return true;
    },
    [session, persist, router, examSlot, slug],
  );

  const finishPartRepeat = useCallback(
    (sectionKey, partNumber, answersSnapshot, partScores) => {
      if (!session || !sectionKey) return null;
      const next = mergeExamModePartRepeat(
        session,
        sectionKey,
        partNumber,
        answersSnapshot,
        partScores,
        slug,
      );
      return persist(next);
    },
    [session, persist, slug],
  );

  const getSectionRemaining = useCallback((sectionKey) => {
    const current = sessionRef.current;
    if (!current || !sectionKey) return null;
    const section = current.sections.find((s) => s.key === sectionKey);
    return section?.remainingSeconds ?? null;
  }, []);

  const saveSectionDraft = useCallback(
    (sectionKey, draft) => {
      const current = sessionRef.current;
      if (!current || !sectionKey) return;
      persist(saveExamModeSectionDraft(current, sectionKey, draft));
    },
    [persist],
  );

  const applyExamContentSync = useCallback(
    (partsData, examDraftRef = null) => {
      const current = sessionRef.current;
      const result = syncPracticeSessionWithExamContent({
        slug,
        examSlot,
        partsData,
        examModeSession: current,
        saveExamModeSession: (next, uid) => saveExamModeSession(next, uid || userId),
        userId,
        examDraftRef,
      });
      if (result.session && result.session !== current) {
        persist(result.session);
      }
    },
    [slug, examSlot, userId, persist],
  );

  useEffect(() => {
    const flushTimerState = () => {
      flushLocalSave();
      flushServerSync();
    };

    window.addEventListener('beforeunload', flushTimerState);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushTimerState();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('beforeunload', flushTimerState);
      document.removeEventListener('visibilitychange', onVisibility);
      flushTimerState();
      if (serverSyncTimerRef.current) window.clearTimeout(serverSyncTimerRef.current);
      if (localSaveTimerRef.current) window.clearTimeout(localSaveTimerRef.current);
    };
  }, [flushLocalSave, flushServerSync]);

  useEffect(() => {
    if (!ready || !session) return undefined;

    const handler = (event) => {
      const detail = event?.detail || {};
      if (detail.slug !== String(slug || '').toLowerCase()) return;
      if (Number(detail.examSlot) !== Number(examSlot)) return;
      const reconciled = reconcileExamModeSessionForContentRevision(
        sessionRef.current,
        sessionRef.current?.contentRevision ?? null,
      );
      if (reconciled) persist(reconciled);
    };

    window.addEventListener(LEVELS_EXAM_REGENERATED_EVENT, handler);
    return () => window.removeEventListener(LEVELS_EXAM_REGENERATED_EVENT, handler);
  }, [ready, session, slug, examSlot, persist]);

  const applyScoreRescorePatch = useCallback(
    async (patch, snapshotsBySection = {}) => {
      const current = sessionRef.current;
      if (!current || !patch || !scoresPatchDiffersFromSession(current, patch)) return false;
      persist(applyExamModeSessionScorePatch(current, patch));
      if (userId && Object.keys(snapshotsBySection).length) {
        void persistRescoredExamModeSnapshots(userId, slug, examSlot, snapshotsBySection).catch(
          (err) => console.warn('exam mode rescore persist:', err),
        );
      }
      return true;
    },
    [persist, userId, slug, examSlot],
  );

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
    applyExamContentSync,
    resetExam,
    repeatExam,
    repeatSection,
    repeatPart,
    finishPartRepeat,
    applyScoreRescorePatch,
  };
}

async function syncExamModeToServer(session, userId) {
  if (!userId || !session) return;
  if (!shouldSyncExamModeSessionToServer(session)) return;
  try {
    await fetch(buildClientApiUrl('/api/levels/exam-mode-session'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, userId }),
      keepalive: true,
    });
  } catch {
    /* localStorage remains source of truth */
  }
}
