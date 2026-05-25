'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Countdown for one exam-mode section. Persists remaining via onTick.
 */
export function useExamModeSectionTimer({
  active,
  initialSeconds,
  onTick,
  onExpire,
}) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (active) setRemaining(initialSeconds);
  }, [active, initialSeconds]);

  useEffect(() => {
    if (!active || expired || remaining <= 0) return undefined;

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        onTick?.(next);
        if (next === 0) {
          setExpired(true);
          onExpire?.();
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [active, expired, remaining, onTick, onExpire]);

  const formatTime = useCallback((sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  return {
    remaining,
    expired,
    label: formatTime(remaining),
    formatTime,
  };
}
