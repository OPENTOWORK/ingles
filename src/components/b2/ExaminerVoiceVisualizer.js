'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeExaminerSpeaking } from '@/utils/playExaminerAudio';

const BAR_COUNT = 40;

/**
 * Visualizador de voz del examinador (sin texto). Ondas animadas — NO usa Web Audio API
 * (createMediaElementSource silenciaba el audio en Chrome/Edge).
 */
export default function ExaminerVoiceVisualizer({
  isLoading = false,
  statusLabel,
  waitingToStart = false,
}) {
  const [speaking, setSpeaking] = useState({ active: false, mode: 'idle' });
  const [barHeights, setBarHeights] = useState(() => Array(BAR_COUNT).fill(0.12));
  const rafRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => subscribeExaminerSpeaking(setSpeaking), []);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    const tick = () => {
      phaseRef.current += 0.08;
      const t = phaseRef.current;

      if (speaking.active) {
        setBarHeights(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const wave =
              Math.sin(t * 2.2 + i * 0.35) * 0.35 +
              Math.sin(t * 4.1 + i * 0.18) * 0.25 +
              0.45;
            return Math.min(1, Math.max(0.15, wave));
          }),
        );
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isLoading) {
        setBarHeights(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const pulse = 0.2 + Math.sin(t * 3 + i * 0.2) * 0.12;
            return pulse;
          }),
        );
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setBarHeights(
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const idle = 0.1 + Math.sin(t * 1.2 + i * 0.15) * 0.04;
          return idle;
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speaking, isLoading]);

  const defaultStatusLabel = speaking.active
    ? 'The examiner is speaking…'
    : isLoading
      ? 'Preparing audio…'
      : waitingToStart
        ? 'Press Play to start the exercise'
        : 'Waiting — press Speak to respond';

  const resolvedStatusLabel = statusLabel || defaultStatusLabel;
  const isActive = speaking.active || isLoading;

  return (
    <div
      role="region"
      className={`examiner-voice-visualizer${isActive ? ' examiner-voice-visualizer--active' : ''}`}
      aria-live="polite"
      aria-label={resolvedStatusLabel}
    >
      <div className="examiner-voice-visualizer__inner">
        <div className="examiner-voice-visualizer__icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
              fill="white"
            />
            <path
              d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="examiner-voice-visualizer__waveform" aria-hidden="true">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="examiner-voice-visualizer__bar"
              style={{
                height: `${Math.round(h * 64)}px`,
                opacity: isActive ? 0.95 : 0.45,
              }}
            />
          ))}
        </div>
      </div>

      <p className="examiner-voice-visualizer__status">{resolvedStatusLabel}</p>
    </div>
  );
}
