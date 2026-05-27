'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function A2ListeningExamPage() {
  return (
    <B2ExamPaperPracticePage
      slug="a2"
      title="A2 Listening Practice"
      subtitle="Parts 8 to 12"
      partMin={8}
      partMax={12}
      emptyErrorMessage="No questions available for A2 Listening. An admin must generate the exam first."
      loadingLabel="Loading Listening (Parts 8–12)…"
      refreshLabel="Refresh Listening"
      showAudioFromEnunciado
      lang="en"
    />
  );
}
