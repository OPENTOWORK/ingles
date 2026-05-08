'use client';

import { useEffect, useState } from 'react';

export function formatElapsedLevelsTimer(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/**
 * Cronómetro de sesión para una categoría (p. ej. todo Use of English en una sola visita a la página).
 */
export function useLevelsCategoryTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { seconds, label: formatElapsedLevelsTimer(seconds) };
}
