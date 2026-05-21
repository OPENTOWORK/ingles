'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import TrainingSkillCard from '@/components/training/TrainingSkillCard';
import {
  getMaxStarsForSkill,
  useTrainingSkillStarProgressMap,
} from '@/hooks/useTrainingCefrStarProgress';
import { getCefrLevelColor } from '@/constants/cefrLevelColors';
import ui from '@/components/training/training-ui.module.css';

const skills = [
  { id: 'use-of-english', label: 'Use of English' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'reading', label: 'Reading' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'all', label: 'All together' },
  { id: 'challenge', label: 'Challenge' },
];

export default function LevelPage({ params }) {
  const { level } = params;
  const router = useRouter();
  const { userRole, session } = useUserRole();
  const skillProgressMap = useTrainingSkillStarProgressMap(level);
  const maxStarsPerSkill = getMaxStarsForSkill();

  useEffect(() => {
    if (level?.toLowerCase() === 'a1') {
      router.replace('/training/a2');
      return;
    }
    if (!session) {
      router.push('/login');
    }
  }, [session, router, level]);

  if (!session) {
    return <p className={ui.subtitle} style={{ textAlign: 'center', padding: '3rem' }}>Loading…</p>;
  }

  const isLockedForStudent = userRole === 'student' || userRole === 'alumno';

  if (isLockedForStudent) {
    return (
      <main className={ui.page}>
        <div className={ui.lockedPanel}>
          <h1>Coming soon</h1>
          <p>
            Training is not available for students yet. You can keep practising from the Levels section.
          </p>
          <Link href="/niveles/b2" className={ui.primaryBtn}>
            Go to Levels B2
          </Link>
        </div>
      </main>
    );
  }

  const levelAccent = getCefrLevelColor(level);

  return (
    <main className={ui.pageNarrow}>
      <header className={ui.header}>
        <p className={ui.eyebrow} style={{ color: levelAccent }}>
          Level {level.toUpperCase()}
        </p>
        <h1 className={ui.title}>Choose a skill</h1>
        <p className={ui.subtitle}>Select the area you want to practise. Each skill has its own learning path.</p>
      </header>

      <div className={ui.skillGrid}>
        {skills.map((skill) => {
          const progress = skillProgressMap[skill.id] ?? {
            earned: 0,
            max: maxStarsPerSkill,
            percent: 0,
          };

          return (
            <TrainingSkillCard
              key={skill.id}
              href={`/training/${level}/${skill.id}`}
              skillId={skill.id}
              label={skill.label}
              earned={progress.earned}
              max={progress.max}
              percent={progress.percent}
              accentColor={levelAccent}
            />
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/training" className={ui.backLink}>
          ← Back to levels
        </Link>
      </div>
    </main>
  );
}
