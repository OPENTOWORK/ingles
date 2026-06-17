'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import { mergeExamModeStatsRows } from '@/utils/examModeStatsRows';
import { computeExamModeStats } from '@/utils/examModeStats';
import {
  aggregateExamModeAttemptHistory,
  loadExamModeAttemptHistory,
} from '@/utils/examModeAttemptHistory';

/**
 * Exam-mode statistics: current attempt (session) + archived attempt history.
 */
export function useExamModeStatistics(slug, examSlot) {
  const { session, ready, userId, repeatExam: repeatSession } = useExamModeSession(slug, examSlot);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryReady(false);
    const attempts = await loadExamModeAttemptHistory(slug, examSlot, userId);
    setAttemptHistory(attempts);
    setHistoryReady(true);
  }, [slug, examSlot, userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const { rows } = useMemo(
    () =>
      mergeExamModeStatsRows({
        slug,
        session: ready ? session : null,
        puntuacionesRows: [],
        estadisticasRows: [],
      }),
    [slug, session, ready],
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
    refresh,
  };
}
