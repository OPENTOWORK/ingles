'use client';

import { useParams, usePathname } from 'next/navigation';
import ExamPartTipsView from '@/components/theory/ExamPartTipsView';
import { getExamPartTipsMeta } from '@/data/examTheoryPartTips';
import { getExamPartTipsExerciseBundle } from '@/lib/examPartTipsExerciseRegistry';

export default function ExamPartTipsPage() {
  const params = useParams();
  const pathname = usePathname();
  const levelSlug = String(params.level || '').toLowerCase();
  const skillFolder = String(params.skill || '');
  const partParam = String(params.part || '');

  const info = getExamPartTipsMeta(levelSlug, skillFolder, partParam);
  const { exercisesConfig, getExercise } = getExamPartTipsExerciseBundle(levelSlug, skillFolder);

  return (
    <ExamPartTipsView
      levelSlug={levelSlug}
      skillFolder={skillFolder}
      partParam={partParam}
      info={info}
      pathname={pathname}
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
    />
  );
}
