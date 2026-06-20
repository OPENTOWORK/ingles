'use client';

import { useCallback, useEffect, useState } from 'react';

export function formatElapsedLevelsTimer(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/**
 * Cronómetro de sesión con play / pause / stop.
 */
export function useLevelsCategoryTimer({ autoStart = true } = {}) {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState(autoStart ? 'running' : 'idle');

  useEffect(() => {
    if (status !== 'running') return undefined;
    const id = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const start = useCallback(() => {
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    setStatus('running');
  }, []);

  const stop = useCallback(() => {
    setStatus('stopped');
    return seconds;
  }, [seconds]);

  const reset = useCallback(() => {
    setSeconds(0);
    setStatus('idle');
  }, []);

  return {
    seconds,
    label: formatElapsedLevelsTimer(seconds),
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isIdle: status === 'idle',
    isStopped: status === 'stopped',
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
