'use client';

import { useParams, usePathname } from 'next/navigation';
import ExamPartTipsView from '@/components/theory/ExamPartTipsView';
import { getExamPartTipsMeta } from '@/data/examTheoryPartTips';
import { getExamPartTipsExerciseBundle } from '@/lib/examPartTipsExerciseRegistry';

function parsePartNumber(partParam) {
  const raw = String(partParam || '').replace(/^part-/, '');
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Part tips bajo /niveles o /exam-practice (mismo formato que Overall Strategy).
 */
export default function NivelesPartTipsRoute({
  levelSlug,
  skillFolder,
  partNum: partNumProp,
  exercisesConfig: exercisesConfigProp,
  getExercise: getExerciseProp,
}) {
  const params = useParams();
  const pathname = usePathname();
  const level = String(levelSlug || params?.level || params?.slug || '').toLowerCase();
  const skill = String(skillFolder || params?.skill || '');
  const partNum = partNumProp ?? parsePartNumber(params?.part);
  const partParam = `part-${partNum}`;

  const info = getExamPartTipsMeta(level, skill, partParam);
  const bundle = exercisesConfigProp
    ? { exercisesConfig: exercisesConfigProp, getExercise: getExerciseProp }
    : getExamPartTipsExerciseBundle(level, skill);

  return (
    <ExamPartTipsView
      levelSlug={level}
      skillFolder={skill}
      partParam={partParam}
      info={info}
      pathname={pathname}
      exercisesConfig={bundle.exercisesConfig}
      getExercise={bundle.getExercise}
    />
  );
}
