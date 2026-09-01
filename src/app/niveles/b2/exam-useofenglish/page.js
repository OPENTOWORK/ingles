'use client';

import dynamic from 'next/dynamic';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const UseOfEnglishPracticeClient = dynamic(
  () => import('./UseOfEnglishPracticeClient'),
  {
    ssr: false,
    loading: () => (
      <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
        <RouteLoadingMascot label="Loading practice…" variant={3} />
      </main>
    ),
  },
);

export default function UseOfEnglishExamsPage() {
  return <UseOfEnglishPracticeClient />;
}
