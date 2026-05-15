'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getActiveExaminerAudio,
  subscribeExaminerSpeaking,
} from '@/utils/playExaminerAudio';

const BAR_COUNT = 40;

/**
 * Visualizador de voz del examinador (sin texto). Ondas reactivas al audio o animación suave.
 *
 * @param {{ isLoading?: boolean }} props
 */
export default function ExaminerVoiceVisualizer({ isLoading = false }) {
  const [speaking, setSpeaking] = useState({ active: false, mode: 'idle' });
  const [barHeights, setBarHeights] = useState(() => Array(BAR_COUNT).fill(0.12));
  const rafRef = useRef(0);
  const phaseRef = useRef(0);
  const analyserActiveRef = useRef(false);

  useEffect(() => subscribeExaminerSpeaking(setSpeaking), []);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    const tick = () => {
      phaseRef.current += 0.08;
      const t = phaseRef.current;

      if (speaking.active && speaking.mode === 'audio') {
        const audio = getActiveExaminerAudio();
        if (audio && !audio.paused && analyserActiveRef.current) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        if (audio && !audio.paused) {
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
      }

      if (speaking.active && speaking.mode === 'synthesis') {
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

  useEffect(() => {
    if (!speaking.active || speaking.mode !== 'audio') return;

    const audio = getActiveExaminerAudio();
    if (!audio) return;

    let ctx;
    let source;
    let analyser;
    let data;
    let raf;
    let closed = false;

    const setup = async () => {
      try {
        ctx = new AudioContext();
        await ctx.resume();
        source = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
        analyserActiveRef.current = true;

        const draw = () => {
          if (closed) return;
          analyser.getByteFrequencyData(data);
          const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
          const next = Array.from({ length: BAR_COUNT }, (_, i) => {
            const v = data[Math.min(i * step, data.length - 1)] / 255;
            return Math.min(1, Math.max(0.1, v * 1.15));
          });
          setBarHeights(next);
          raf = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        analyserActiveRef.current = false;
      }
    };

    void setup();

    return () => {
      closed = true;
      analyserActiveRef.current = false;
      if (raf) cancelAnimationFrame(raf);
      try {
        source?.disconnect();
        analyser?.disconnect();
        void ctx?.close();
      } catch {
        /* ignore */
      }
    };
  }, [speaking.active, speaking.mode]);

  const statusLabel = speaking.active
    ? 'El examinador está hablando…'
    : isLoading
      ? 'Preparando audio…'
      : 'En espera — pulsa Hablar para responder';

  return (
    <div
      role="region"
      style={{
        marginTop: '1rem',
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        border: '1px solid #334155',
        padding: '1.1rem 1.25rem',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      aria-live="polite"
      aria-label={statusLabel}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background:
              speaking.active || isLoading
                ? 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)'
                : 'linear-gradient(135deg, #475569, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              speaking.active || isLoading
                ? '0 0 24px rgba(236, 72, 153, 0.45)'
                : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
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

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            height: 72,
            minWidth: 0,
          }}
        >
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: `${Math.round(h * 64)}px`,
                minHeight: 6,
                borderRadius: 4,
                background: `linear-gradient(180deg, #f472b6 0%, #a78bfa 45%, #22d3ee 100%)`,
                opacity: speaking.active || isLoading ? 0.95 : 0.45,
                transition: speaking.active ? 'height 0.05s linear' : 'height 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      <p
        style={{
          margin: '0.75rem 0 0',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#94a3b8',
          fontWeight: 500,
        }}
      >
        {statusLabel}
      </p>
    </div>
  );
}
