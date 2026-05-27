'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function A2SpeakingExamPage() {
  return (
    <B2ExamPaperPracticePage
      slug="a2"
      title="A2 Speaking Practice"
      subtitle="Parts 13 to 14"
      partMin={13}
      partMax={14}
      emptyErrorMessage="No tasks available for A2 Speaking. An admin must generate the exam first."
      loadingLabel="Loading Speaking (Parts 13–14)…"
      refreshLabel="Refresh Speaking"
      preferOpenInputs
      lang="en"
    />
  );
}
