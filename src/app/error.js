'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, #0b1020, #10183a 60%, #0b1020)',
      color: '#e8ecf3',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial'
    }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#6c8dff' }}>
        ¡Oops!
      </h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px', color: '#a7b0c0' }}>
        Algo salió mal
      </h2>
      <p style={{ margin: '0 0 24px', color: '#a7b0c0', maxWidth: '500px' }}>
        Ha ocurrido un error inesperado. Por favor, intenta recargar la página o vuelve más tarde.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #6c8dff, #a06cff)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 10px 24px rgba(106, 140, 255, 0.35)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

