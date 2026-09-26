'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TrainingLevelPathMap from '@/components/training/TrainingLevelPathMap';
import TrainingGapFillExercise from '@/components/training/TrainingGapFillExercise';
import { getTrainingPathCurriculum } from '@/data/trainingPathCurriculum';

function Preview() {
  const params = useSearchParams();
  const level = Number(params.get('level')) || 0;
  const formats = params.get('formats') || '';
  const [items, setItems] = useState(null);
  const curriculum = getTrainingPathCurriculum('a2', 'basico', 'use-of-english');

  useEffect(() => {
    if (!level) return;
    const wanted = formats.split(',').filter(Boolean);
    import('@/data/trainingExercises').then(async ({ loadExercisesByLevel }) => {
      const loaded = await loadExercisesByLevel('a2', 'use-of-english', 'basico', `level${level}`);
      setItems(loaded.filter((item) => !wanted.length || wanted.includes(item.format)));
    });
  }, [level, formats]);

  if (!level) {
    return (
      <TrainingLevelPathMap
        baseHref="/training"
        levelStars={{}}
        cefrLevel={params.get('cefr') || 'a2'}
        difficulty={params.get('difficulty') || 'basico'}
        skill="use-of-english"
        onCefrChange={() => {}}
        onDifficultyChange={() => {}}
      />
    );
  }
  if (!items) return <p>Loading…</p>;
  return (
    <TrainingGapFillExercise
      exercise={{ exerciseId: items[0]?.exerciseId, instruction: items[0]?.instruction, items }}
      sectionTitle={curriculum.levelMap[level]?.section?.title}
      topicLabel={curriculum.levelMap[level]?.topic}
      levelNumber={`level-${level}`}
      levelNum={level}
      sessionSize={items.length}
      backHref="/training/?cefr=a2&difficulty=basico"
      cefrLevel="a2"
      skill="use-of-english"
      difficulty="basico"
      userId={null}
    />
  );
}

export default function DevTrainingPreview() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Preview />
    </Suspense>
  );
}
