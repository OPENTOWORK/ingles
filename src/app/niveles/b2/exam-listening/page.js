'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function B2ListeningExamsPage() {
  return (
    <B2ExamPaperPracticePage
      title="B2 Listening Practice"
      subtitle="Partes 10 a 13"
      partMin={10}
      partMax={13}
      emptyErrorMessage="No hay preguntas disponibles para B2 Listening."
      loadingLabel="Cargando Listening (Partes 10 a 13)..."
      refreshLabel="Refrescar Listening (10-13)"
      preferOpenInputs={false}
      showAudioFromEnunciado
    />
  );
}
