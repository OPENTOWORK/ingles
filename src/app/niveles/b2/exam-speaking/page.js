'use client';

import B2SpeakingExamPractice from '@/components/b2/B2SpeakingExamPractice';

export default function B2SpeakingExamsPage() {
  return (
    <B2SpeakingExamPractice
      title="B2 Speaking Practice"
      subtitle="Parts 14 to 17 — voice examiner simulation"
      loadingLabel="Loading Speaking (Parts 14 to 17)…"
      refreshLabel="Refresh Speaking (14–17)"
      lang="en"
    />
  );
}
