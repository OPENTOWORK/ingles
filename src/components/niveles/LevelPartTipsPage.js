'use client';

import NivelesPartTipsRoute from '@/components/niveles/NivelesPartTipsRoute';

/** @deprecated Usar NivelesPartTipsRoute directamente. */
export default function LevelPartTipsPage({
  slug,
  skillFolder,
  exercisesConfig,
  getExercise,
}) {
  return (
    <NivelesPartTipsRoute
      levelSlug={slug}
      skillFolder={skillFolder}
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
    />
  );
}
