'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function B2ListeningExamsPage() {
  return (
    <B2ExamPaperPracticePage
      title="B2 Listening Practice"
      subtitle="Parts 10 to 13"
      partMin={10}
      partMax={13}
      emptyErrorMessage="No questions available for B2 Listening."
      loadingLabel="Loading Listening (Parts 10 to 13)…"
      refreshLabel="Refresh Listening (10–13)"
      preferOpenInputs={false}
      showAudioFromEnunciado
      lang="en"
    />
  );
}
