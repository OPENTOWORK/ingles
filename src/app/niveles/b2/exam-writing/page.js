'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';

export default function B2WritingExamsPage() {
  return (
    <B2ExamPaperPracticePage
      title="B2 Writing Practice"
      subtitle="Partes 8 a 9"
      partMin={8}
      partMax={9}
      emptyErrorMessage="No hay preguntas disponibles para B2 Writing."
      loadingLabel="Cargando Writing (Partes 8 a 9)..."
      refreshLabel="Refrescar Writing (8-9)"
      preferOpenInputs
      showAudioFromEnunciado={false}
      longFormWritingWithAi
      writingWordMin={140}
      writingWordMax={190}
    />
  );
}
