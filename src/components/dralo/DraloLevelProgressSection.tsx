'use client';

import LevelProgressCard from '@/components/dralo/LevelProgressCard';
import { useDraloExperience } from '@/hooks/useDraloExperience';

type DraloLevelProgressSectionProps = {
  accessToken?: string | null;
  lang?: 'en' | 'es';
};

export default function DraloLevelProgressSection({
  accessToken,
  lang = 'en',
}: DraloLevelProgressSectionProps) {
  const { totalXp, levelInfo, loading, error, isEmpty } = useDraloExperience(accessToken);

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
