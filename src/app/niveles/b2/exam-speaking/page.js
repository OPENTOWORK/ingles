'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function B2SpeakingExamsPage() {
  return (
    <B2ExamPaperPracticePage
      title="B2 Speaking Practice"
      subtitle="Partes 14 a 17"
      partMin={14}
      partMax={17}
      emptyErrorMessage="No hay preguntas disponibles para B2 Speaking."
      loadingLabel="Cargando Speaking (Partes 14 a 17)..."
      refreshLabel="Refrescar Speaking (14-17)"
      preferOpenInputs={false}
      showAudioFromEnunciado={false}
    />
  );
}
