'use client';

import Link from 'next/link';
import { useExamStrategiesAccess } from '@/hooks/useExamStrategiesAccess';

export function ExamStrategiesBlockedScreen() {
  return (
    <main className="shell niveles-page" style={{ padding: '2rem 1.5rem', maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Exam Strategies no disponible
      </h1>
      <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
        Tips y estrategias por skill no están incluidos en tu plan actual. Puedes seguir
        practicando en <strong>Exam practice</strong> o ver los planes con acceso completo.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link href="/precios" className="home-cta__btn home-cta__btn--inline">
          Ver planes
        </Link>
        <Link href="/exam-practice/b2" className="home-cta__btn home-cta__btn--inline">
          Ir a Exam practice
        </Link>
      </div>
    </main>
  );
}

export default function ExamStrategiesFeatureGuard({ children }) {
  const { locked, loading } = useExamStrategiesAccess();

  if (loading) {
    return (
      <main className="shell niveles-page" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p>Cargando…</p>
      </main>
    );
  }

  if (locked) {
    return <ExamStrategiesBlockedScreen />;
  }

  return children;
}
