'use client';

import { useCallback, useEffect, useState } from 'react';
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
  startExamModeSectionTimer,
  updateExamModeSectionRemaining,
} from '@/utils/examModeSession';

/**
 * Persisted exam-mode session for a level + test slot.
 */
export function useExamModeSession(slug, examSlot) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState('');
  const [ready, setReady] = useState(false);

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

  return {
    session,
    ready,
    userId,
    persist,
    reload,
    finishSection,
    touchSectionTimer,
    setSectionRemaining,
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
