'use client';

import B2SpeakingExamPractice from '@/components/b2/B2SpeakingExamPractice';

export default function B2SpeakingExamsPage() {
  return (
    <B2SpeakingExamPractice
      title="B2 Speaking Practice"
      subtitle="Parts 1 to 4 — voice examiner simulation"
      loadingLabel="Loading Speaking (Parts 1 to 4)…"
      refreshLabel="Refresh Speaking (1–4)"
      lang="en"
    />
  );
}
