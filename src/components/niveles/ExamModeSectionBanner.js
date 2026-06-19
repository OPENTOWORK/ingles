'use client';

import { useCallback, useRef, useState } from 'react';
import { useExamModeSectionTimer } from '@/hooks/useExamModeSectionTimer';

/**
 * Sticky banner: Cambridge countdown + finish section (exam mode).
 */
export default function ExamModeSectionBanner({
  sectionKey,
  sectionTitle,
  durationSeconds,
  initialRemainingSeconds,
  active,
  onTick,
  onFinish,
  lang = 'en',
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const autoFinishRequestedRef = useRef(false);

  const handleExpire = useCallback(() => {
    if (autoFinishRequestedRef.current) return;
    autoFinishRequestedRef.current = true;
    onFinish?.();
  }, [onFinish]);

  const timerHydrationKey = sectionKey ?? 'exam-section';

  const { remaining, expired, label } = useExamModeSectionTimer({
    active,
    initialSeconds: initialRemainingSeconds ?? durationSeconds,
    hydrationKey: timerHydrationKey,
    onTick,
    onExpire: handleExpire,
  });

  const finishLabel = lang === 'en' ? 'Finish section' : 'Terminar sección';
  const timeLabel = lang === 'en' ? 'Time left' : 'Tiempo restante';
  const examLabel = lang === 'en' ? 'Exam mode' : 'Modo examen';
  const confirmTitle =
    lang === 'en'
      ? 'Finish this section?'
      : '¿Terminar esta sección?';
  const confirmBody =
    lang === 'en'
      ? 'You cannot return to this section until you complete the full exam and view your results. Your answers will be saved.'
      : 'No podrás volver a esta sección hasta terminar el examen completo y ver los resultados. Tus respuestas se guardarán.';
  const confirmYes = lang === 'en' ? 'Yes, finish section' : 'Sí, terminar';
  const confirmNo = lang === 'en' ? 'Continue' : 'Seguir';
  const expiredNote =
    lang === 'en'
      ? 'Time is up. Submitting this section…'
      : 'Se acabó el tiempo. Enviando esta sección…';

  return (
    <div
      className="exam-mode-banner"
      role="region"
      aria-label={examLabel}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        margin: '0 0 1.25rem',
        padding: '0.85rem 1.1rem',
        borderRadius: '12px',
        background: expired ? '#fff5f5' : '#ebf8ff',
        border: `2px solid ${expired ? '#fc8181' : '#63b3ed'}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#2b6cb0', textTransform: 'uppercase' }}>
          {examLabel}
        </p>
        <p style={{ margin: '0.15rem 0 0', fontWeight: 700, color: '#1a365d' }}>{sectionTitle}</p>
        {expired ? (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#c53030', fontWeight: 600 }}>{expiredNote}</p>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#4a5568' }}>{timeLabel}</p>
          <p
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: remaining <= 300 || expired ? '#c53030' : '#2d3748',
            }}
          >
            {label}
          </p>
        </div>
        {!expired ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            style={{
              borderRadius: '8px',
              border: 'none',
              background: '#2b6cb0',
              color: '#fff',
              padding: '0.65rem 1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {finishLabel}
          </button>
        ) : null}
      </div>

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.75rem' }}>{confirmTitle}</h3>
            <p style={{ margin: '0 0 1.25rem', lineHeight: 1.5, color: '#4a5568' }}>{confirmBody}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onFinish?.();
                }}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2b6cb0',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {confirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {confirmNo}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
