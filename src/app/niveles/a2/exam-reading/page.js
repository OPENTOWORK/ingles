'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function A2ReadingExamPage() {
  return (
    <B2ExamPaperPracticePage
      slug="a2"
      title="A2 Reading & Writing Practice"
      subtitle="Parts 1 to 7"
      partMin={1}
      partMax={7}
      emptyErrorMessage="No questions available for A2 Reading & Writing. An admin must generate the exam first."
      loadingLabel="Loading Reading & Writing (Parts 1–7)…"
      refreshLabel="Refresh Reading & Writing"
      preferOpenInputs
      longFormWritingWithAi
      writingWordMin={25}
      writingWordMax={80}
      lang="en"
    />
  );
}
