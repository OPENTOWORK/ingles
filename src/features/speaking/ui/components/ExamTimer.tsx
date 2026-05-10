'use client';

import { useEffect, useState } from 'react';

type Props = {
  seconds: number;
  onExpire?: () => void;
  resetKey?: number;
};

export function ExamTimer({ seconds, onExpire, resetKey = 0 }: Props) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => {
      setLeft((s) => {
        if (s <= 1) {
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [left, onExpire]);

  const mm = Math.floor(left / 60)
    .toString()
    .padStart(2, '0');
  const ss = (left % 60).toString().padStart(2, '0');

  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 font-mono text-lg text-white"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {mm}:{ss}
    </div>
  );
}
