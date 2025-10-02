'use client';
import Link from 'next/link';

export default function Exam1Resultado() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Exam Results</h1>
      <p>Your results will be displayed here.</p>
      <Link href="/niveles/a2">
        <div style={{ 
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: '#0070f3',
          color: 'white',
          borderRadius: '8px',
          marginTop: '1rem',
          fontWeight: 'bold',
          textDecoration: 'none'
        }}>
          Back to A2 Overview
        </div>
      </Link>
    </div>
  );
}
