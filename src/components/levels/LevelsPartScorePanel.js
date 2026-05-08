'use client';

/**
 * @param {{ correctCount: number, totalSlots: number, passingCount: number }} props
 */
export default function LevelsPartScorePanel({ correctCount, totalSlots, passingCount }) {
  if (!totalSlots || totalSlots < 1) return null;

  return (
    <div
      style={{
        textAlign: 'center',
        margin: '0 auto 1.25rem',
        padding: '0.85rem 1rem 1rem',
        maxWidth: '520px',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#6b46c1',
        }}
      >
        Tu puntuación: {correctCount} / {totalSlots}
      </p>
      <p
        style={{
          margin: '0.45rem 0 0',
          fontSize: '0.98rem',
          color: '#4a5568',
          fontWeight: 500,
        }}
      >
        🎯 Necesitas al menos {passingCount} respuestas correctas para aprobar esta parte.
      </p>
    </div>
  );
}
