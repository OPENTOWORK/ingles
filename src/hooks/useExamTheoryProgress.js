'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EXAM_THEORY_PROGRESS_EVENT,
  buildTopicProgressByHref,
  computeExamTheoryProgressSummary,
} from '@/lib/examTheoryProgress';

export function useExamTheoryProgress(userId, accessToken) {
  const [dbRows, setDbRows] = useState([]);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    refresh();
    let debounceId = null;
    const onUpdate = () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => refresh(), 350);
    };
    window.addEventListener('storage', onUpdate);
    window.addEventListener(EXAM_THEORY_PROGRESS_EVENT, onUpdate);
    return () => {
      if (debounceId) clearTimeout(debounceId);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener(EXAM_THEORY_PROGRESS_EVENT, onUpdate);
    };
  }, [refresh]);

  useEffect(() => {
    if (!userId || !accessToken) {
      setDbRows([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/levels-progreso', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setDbRows(json.rows ?? []);
      } catch {
        /* offline */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, accessToken, tick]);

  const summary = useMemo(
    () => computeExamTheoryProgressSummary({ dbRows, userId }),
    [dbRows, userId, tick],
  );

  const topicProgressByHref = useMemo(
    () => buildTopicProgressByHref({ dbRows, userId }),
    [dbRows, userId, tick],
  );

  return { ...summary, topicProgressByHref };
}
