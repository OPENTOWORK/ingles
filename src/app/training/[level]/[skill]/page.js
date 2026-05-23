'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import TrainingDifficultyCard from '@/components/training/TrainingDifficultyCard';
import TrainingRepasoCard from '@/components/training/TrainingRepasoCard';
import { getTrainingPathLevelCount } from '@/data/trainingPathCurriculum';
import { MAX_STARS_PER_PATH_LEVEL } from '@/utils/trainingStarsProgress';
import { useTrainingDifficultyStarProgressMap } from '@/hooks/useTrainingCefrStarProgress';
import { getCefrLevelColor } from '@/constants/cefrLevelColors';
import ui from '@/components/training/training-ui.module.css';

const difficulties = [
  { id: 'basico', title: 'Basic', description: 'Core phrases and everyday vocabulary' },
  { id: 'intermedio', title: 'Intermediate', description: 'Clear sentence structures and common patterns' },
  { id: 'avanzado', title: 'Advanced', description: 'Longer texts and more demanding tasks' },
];

function formatSkillTitle(skill) {
  return skill
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SkillPage({ params }) {
  const { level, skill } = params;
  const difficultyProgressMap = useTrainingDifficultyStarProgressMap(level, skill);
  const maxStarsByDifficulty = useMemo(
    () =>
      Object.fromEntries(
        difficulties.map(({ id }) => [
          id,
          getTrainingPathLevelCount(level, id, skill) * MAX_STARS_PER_PATH_LEVEL,
        ]),
      ),
    [level, skill],
  );
  const skillTitle = formatSkillTitle(skill);
  const levelAccent = getCefrLevelColor(level);

  return (
    <main className={ui.pageNarrow}>
      <header className={ui.header}>
        <p className={ui.eyebrow} style={{ color: levelAccent }}>
          Level {level.toUpperCase()} · {skillTitle}
        </p>
        <h1 className={ui.title}>Choose difficulty</h1>
        <p className={ui.subtitle}>Work through the path levels. Start with Basic if you are unsure.</p>
      </header>

      <div className={ui.difficultyList}>
        {difficulties.map(({ id, title, description }) => {
          const maxStars = maxStarsByDifficulty[id] ?? 72;
          const progress = difficultyProgressMap[id] ?? {
            earned: 0,
            max: maxStars,
            percent: 0,
          };

          return (
            <TrainingDifficultyCard
              key={id}
              href={`/training/${level}/${skill}/${id}`}
              id={id}
              title={title}
              description={description}
              earned={progress.earned}
              max={progress.max}
              percent={progress.percent}
              accentColor={levelAccent}
            />
          );
        })}
      </div>

      <TrainingRepasoCard href={`/training/${level}/${skill}/repaso`} pendingCount={0} />

      <div style={{ textAlign: 'center' }}>
        <Link href={`/training/${level}`} className={ui.backLink}>
          ← Back to skills
        </Link>
      </div>
    </main>
  );
}
