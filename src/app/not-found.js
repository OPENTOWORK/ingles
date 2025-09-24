'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="main-content" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#0070f3' }}>
        404
      </h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px', color: '#333' }}>
        Página no encontrada
      </h2>
      <p style={{ margin: '0 0 24px', color: '#666', maxWidth: '500px' }}>
        La página que buscas no existe o ha sido movida. 
        Verifica la URL o regresa a la página principal.
      </p>
      <Link
        href="/"
        className="exam-link"
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          background: '#0070f3',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'background-color 0.2s'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
