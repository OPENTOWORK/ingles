'use client';

/**
 * @param {{
 *   passed: boolean,
 *   correct: number,
 *   total: number,
 *   passing: number,
 *   error?: string | null,
 * }} props
 */
export default function LevelsPartFinishBanner({ passed, correct, total, passing, error = null }) {
  if (error) {
    return (
      <div
        role="alert"
        style={{
          textAlign: 'center',
          margin: '0 auto 1.25rem',
          padding: '1rem 1.1rem',
          maxWidth: '560px',
          borderRadius: '12px',
          border: '2px solid #fc8181',
          background: '#fff5f5',
          color: '#9b2c2c',
          fontWeight: 600,
        }}
      >
        No se pudo guardar la puntuación: {error}
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{
        textAlign: 'center',
        margin: '0 auto 1.25rem',
        padding: '1rem 1.1rem',
        maxWidth: '560px',
        borderRadius: '12px',
        border: `2px solid ${passed ? '#48bb78' : '#ed8936'}`,
        background: passed ? '#f0fff4' : '#fffaf0',
        color: passed ? '#22543d' : '#9c4221',
      }}
    >
      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
        {passed ? '¡Parte aprobada!' : 'Parte no aprobada'}
      </p>
      <p style={{ margin: '0.45rem 0 0', fontSize: '1rem', fontWeight: 600 }}>
        Resultado: {correct} / {total} (necesitas {passing} para aprobar)
      </p>
      <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
        Puntuación guardada en tu historial.
      </p>
    </div>
  );
}


