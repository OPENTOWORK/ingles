'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function formatTime(sec) {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function computeRemaining(endTimeMs) {
  return Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
}

/**
 * Countdown for one exam-mode section (wall-clock based, stable interval).
 *
 * Uses a deadline instead of chaining setInterval ticks so tab throttling and
 * effect re-runs do not drift or stall the clock.
 */
export function useExamModeSectionTimer({
  active,
  initialSeconds,
  hydrationKey,
  onTick,
  onExpire,
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Number(initialSeconds) || 0),
  );
  const [expired, setExpired] = useState(false);

  const endTimeRef = useRef(null);
  const hydratedKeyRef = useRef(null);
  const expiredRef = useRef(false);
  const onTickRef = useRef(onTick);
  const onExpireRef = useRef(onExpire);
  const lastReportedRef = useRef(null);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  /** Initialise deadline once per section visit — ignore parent re-renders from onTick. */
  useEffect(() => {
    if (!active) {
      endTimeRef.current = null;
      hydratedKeyRef.current = null;
      expiredRef.current = false;
      lastReportedRef.current = null;
      return;
    }

    const key = hydrationKey ?? 'default';
    if (hydratedKeyRef.current === key && endTimeRef.current != null) return;

    hydratedKeyRef.current = key;
    const seconds = Math.max(0, Number(initialSeconds) || 0);
    endTimeRef.current = Date.now() + seconds * 1000;
    expiredRef.current = false;
    lastReportedRef.current = null;
    setExpired(false);
    setRemaining(seconds);
  }, [active, hydrationKey, initialSeconds]);

  useEffect(() => {
    if (!active || endTimeRef.current == null) return undefined;

    const tick = () => {
      const next = computeRemaining(endTimeRef.current);
      setRemaining(next);

      if (lastReportedRef.current !== next) {
        lastReportedRef.current = next;
        onTickRef.current?.(next);
      }

      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
        onExpireRef.current?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);

    return () => window.clearInterval(id);
  }, [active, hydrationKey]);

  const formatTimeFn = useCallback((sec) => formatTime(sec), []);

  return {
    remaining,
    expired,
    label: formatTimeFn(remaining),
    formatTime: formatTimeFn,
  };
}
