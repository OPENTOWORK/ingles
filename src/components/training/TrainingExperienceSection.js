'use client';

import LevelProgressCard from '@/components/dralo/LevelProgressCard';
import { useTrainingExperience } from '@/hooks/useTrainingExperience';

export default function TrainingExperienceSection({ accessToken, lang = 'en' }) {
  const { totalXp, levelInfo, loading, error, isEmpty } = useTrainingExperience(accessToken);

  return (
    <LevelProgressCard
      totalXp={totalXp}
      levelInfo={levelInfo}
      loading={loading}
      error={error}
      isEmpty={isEmpty}
      lang={lang}
    />
  );
}
