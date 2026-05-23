'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function B2WritingExamsPage() {
  return (
    <B2ExamPaperPracticePage
      title="B2 Writing Practice"
      subtitle="Parts 8 to 9"
      partMin={8}
      partMax={9}
      emptyErrorMessage="No questions available for B2 Writing."
      loadingLabel="Loading Writing (Parts 8 to 9)…"
      refreshLabel="Refresh Writing (8–9)"
      preferOpenInputs
      showAudioFromEnunciado={false}
      longFormWritingWithAi
      writingWordMin={140}
      writingWordMax={190}
      lang="en"
    />
  );
}
