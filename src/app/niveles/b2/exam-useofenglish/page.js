'use client';

import dynamic from 'next/dynamic';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const UseOfEnglishPracticeClient = dynamic(
  () => import('./UseOfEnglishPracticeClient'),
  {
    ssr: false,
    loading: () => (
      <main style={{ padding: '2rem', textAlign: 'center', fontFamily: "var(--font-landing), 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
        <RouteLoadingMascot label="Loading practice…" variant={3} />
      </main>
    ),
  },
);

export default function UseOfEnglishExamsPage() {
  return <UseOfEnglishPracticeClient />;
}
