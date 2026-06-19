'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import { mergeExamModeStatsRows } from '@/utils/examModeStatsRows';
import { computeExamModeStats } from '@/utils/examModeStats';
import {
  aggregateExamModeAttemptHistory,
  loadExamModeAttemptHistory,
} from '@/utils/examModeAttemptHistory';
import {
  applyExamModeSessionScorePatch,
  buildExamModeRescoreTrigger,
  rescoreExamModeSessionFromDrafts,
} from '@/utils/examModeRescoreFromDrafts';

/**
 * Exam-mode statistics: current attempt (session) + archived attempt history.
 */
export function useExamModeStatistics(slug, examSlot) {
  const {
    session,
    ready,
    userId,
    repeatExam: repeatSession,
    repeatSection,
    repeatPart,
    applyScoreRescorePatch,
  } = useExamModeSession(slug, examSlot);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [scorePatch, setScorePatch] = useState(null);
  const [rescoreBusy, setRescoreBusy] = useState(false);
  const rescoreInFlightRef = useRef(false);
  const lastRescoreTriggerRef = useRef('');

  const rescoreTrigger = useMemo(() => buildExamModeRescoreTrigger(session), [session]);

  const loadHistory = useCallback(async () => {
    setHistoryReady(false);
    const attempts = await loadExamModeAttemptHistory(slug, examSlot, userId);
    setAttemptHistory(attempts);
    setHistoryReady(true);
  }, [slug, examSlot, userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!ready || !session) {
      setScorePatch(null);
      lastRescoreTriggerRef.current = '';
    }
  }, [ready, session]);

  useEffect(() => {
    if (!ready || !session || !rescoreTrigger) {
      return undefined;
    }

    if (rescoreInFlightRef.current || lastRescoreTriggerRef.current === rescoreTrigger) {
      return undefined;
    }

    const sessionSnapshot = session;
    let cancelled = false;
    rescoreInFlightRef.current = true;
    setRescoreBusy(true);

    void rescoreExamModeSessionFromDrafts(sessionSnapshot, slug, examSlot)
      .then(async ({ patch, snapshotsBySection }) => {
        if (cancelled) return;
        if (patch) {
          setScorePatch(patch);
          const persisted = await applyScoreRescorePatch(patch, snapshotsBySection);
          if (persisted) {
            void loadHistory();
          }
        }
        lastRescoreTriggerRef.current = rescoreTrigger;
      })
      .catch((err) => {
        console.warn('exam mode rescore from drafts:', err);
        lastRescoreTriggerRef.current = rescoreTrigger;
      })
      .finally(() => {
        rescoreInFlightRef.current = false;
        if (!cancelled) setRescoreBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, slug, examSlot, rescoreTrigger, applyScoreRescorePatch, loadHistory]);

  const sessionForStats = useMemo(
    () => applyExamModeSessionScorePatch(session, scorePatch),
    [session, scorePatch],
  );

  const { rows } = useMemo(
    () =>
      mergeExamModeStatsRows({
        slug,
        session: ready ? sessionForStats : null,
        puntuacionesRows: [],
        estadisticasRows: [],
      }),
    [slug, sessionForStats, ready],
  );

  const stats = useMemo(() => computeExamModeStats(rows), [rows]);

  const generalStats = useMemo(
    () => aggregateExamModeAttemptHistory(attemptHistory),
    [attemptHistory],
  );

  const repeatExam = useCallback(
    async (options = {}) => {
      const ok = await repeatSession(options);
      if (ok) await loadHistory();
      return ok;
    },
    [repeatSession, loadHistory],
  );

  const refresh = useCallback(() => {
    void loadHistory();
  }, [loadHistory]);

  return {
    rows,
    stats,
    generalStats,
    attemptHistory,
    session,
    ready: ready && historyReady,
    userId,
    repeatExam,
    repeatSection,
    repeatPart,
    rescoreBusy,
    refresh,
  };
}
