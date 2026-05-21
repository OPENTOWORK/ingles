'use client';

import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';

const buttonStyle = {
  backgroundColor: '#c1f2cd',
  padding: '0.75rem 1.25rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  display: 'inline-block',
  textAlign: 'center',
};

/**
 * Cabecera y rejilla de partes unificada (estilo Use of English) para B2 partes 1–17.
 */
export function B2ExamPracticeLayout({ examPracticeOpen, children }) {
  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'Segoe UI, sans-serif',
        ...(!examPracticeOpen
          ? {
              minHeight: 'calc(100vh - 4rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }
          : {}),
      }}
    >
      {children}
    </main>
  );
}

export function B2ExamPracticeChrome({
  examSlot,
  onSelectExam,
  progressBySlot,
  partsInPaper,
  examLabelsBySlot = {},
  examPracticeOpen,
  title,
  subtitle,
  timerLabel,
  refreshLabel,
  loading,
  onRefresh,
  showRefresh = true,
  partScoreMetrics,
  hideScorePanel = false,
  partFinishNotice,
  partsData,
  selectedPartId,
  onSelectPart,
  getPartSavedScoreLabel,
  children,
}) {
  return (
    <>
      <B2ExamSlotProgressPicker
        value={examSlot}
        onSelect={onSelectExam}
        progressBySlot={progressBySlot}
        partsInPaper={partsInPaper}
        examLabelsBySlot={examLabelsBySlot}
      />

      {!examPracticeOpen ? null : (
        <>
          <h1 style={{ textAlign: 'center' }}>{title}</h1>
          {subtitle ? (
            <p style={{ textAlign: 'center', margin: '0.35rem 0 0', color: '#4a5568', fontSize: '1rem' }}>
              {subtitle}
            </p>
          ) : null}

          {showRefresh && onRefresh ? (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  border: '1px solid #2f855a',
                  background: loading ? '#e2e8f0' : '#f0fff4',
                  color: '#1a202c',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Actualizando…' : refreshLabel}
              </button>
              <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#718096' }}>
                Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.
              </p>
            </div>
          ) : null}

          <LevelsCategoryTimer categoryLabel={`Sesión: ${title}`} timeLabel={timerLabel} />

          {!hideScorePanel && partScoreMetrics ? (
            <LevelsPartScorePanel
              correctCount={partScoreMetrics.correctCount}
              totalSlots={partScoreMetrics.totalSlots}
              passingCount={partScoreMetrics.passingCount}
            />
          ) : null}

          {partFinishNotice && !partFinishNotice.error ? (
            <LevelsPartFinishBanner
              passed={partFinishNotice.passed}
              correct={partFinishNotice.correct}
              total={partFinishNotice.total}
              passing={partFinishNotice.passing}
            />
          ) : null}
          {partFinishNotice?.error ? (
            <LevelsPartFinishBanner
              passed={false}
              correct={0}
              total={0}
              passing={0}
              error={partFinishNotice.error}
            />
          ) : null}

          {partsData?.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                justifyItems: 'center',
                margin: '1.5rem auto',
                maxWidth: '800px',
              }}
            >
              {partsData.map((part) => {
                const savedScore = getPartSavedScoreLabel?.(part, examSlot);
                return (
                  <button
                    key={part.id}
                    type="button"
                    style={{
                      ...buttonStyle,
                      border:
                        selectedPartId === part.id ? '2px solid #1f6f43' : '2px solid transparent',
                      width: '100%',
                      cursor: 'pointer',
                      transform: selectedPartId === part.id ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={() => onSelectPart(part)}
                  >
                    <span>{part.nombre}</span>
                    {savedScore ? (
                      <span
                        style={{
                          display: 'block',
                          marginTop: '0.3rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#2f855a',
                        }}
                      >
                        Guardado: {savedScore}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {children}
        </>
      )}
    </>
  );
}
