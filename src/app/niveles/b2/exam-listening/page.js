'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';
import GuestRegisterTeaser from '@/components/auth/GuestRegisterTeaser';
import { useUserRole } from '@/context/UserRoleContext';

export default function B2ListeningExamsPage() {
  const { session } = useUserRole();
  if (!session) {
    return (
      <main className="shell content-hub-shell">
        <GuestRegisterTeaser
          nextHref="/exam-practice/b2/exam-listening"
          message="Create a free account to unlock Listening practice."
        />
      </main>
    );
  }

  return (
    <B2ExamPaperPracticePage
      skillRoute="exam-listening"
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
