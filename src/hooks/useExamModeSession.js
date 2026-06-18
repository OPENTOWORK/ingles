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
  saveExamModeSession,
  saveExamModeSectionDraft,
  startExamModeSectionTimer,
  updateExamModeSectionRemaining,
} from '@/utils/examModeSession';
import {
  LEVELS_EXAM_REGENERATED_EVENT,
  reconcileExamModeSessionForContentRevision,
  syncPracticeSessionWithExamContent,
} from '@/utils/levelsExamRegenerationSync';

/**
 * Persisted exam-mode session for a level + test slot.
 */
export function useExamModeSession(slug, examSlot) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState('');
  const [ready, setReady] = useState(false);
  const sessionRef = useRef(null);

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

  const persist = useCallback(
    (next) => {
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
      if (!session) return;
      persist(updateExamModeSectionRemaining(session, sectionKey, remainingSeconds));
    },
    [session, persist],
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
  };
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
