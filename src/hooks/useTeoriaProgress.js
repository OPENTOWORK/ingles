'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TEORIA_PROGRESS_EVENT,
  computeTeoriaProgressSummary,
} from '@/lib/teoriaProgress';

export function useTeoriaProgress(userId, accessToken) {
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
    window.addEventListener(TEORIA_PROGRESS_EVENT, onUpdate);
    return () => {
      if (debounceId) clearTimeout(debounceId);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener(TEORIA_PROGRESS_EVENT, onUpdate);
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
        const res = await fetch('/api/teoria-progreso', {
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

  return useMemo(
    () => computeTeoriaProgressSummary({ dbRows, userId }),
    [dbRows, userId, tick],
  );
}
