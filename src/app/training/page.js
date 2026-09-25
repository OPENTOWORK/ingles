'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import {
  TRAINING_STARS_UPDATED_EVENT,
  normalizeTrainingCefr,
  normalizeTrainingDifficulty,
  trainingHomePath,
} from '@/utils/trainingStarsProgress';
import { sitePublicPath } from '@/utils/sitePublicPath';
import styles from './page.module.css';

const ENTRY_SKILL = 'use-of-english';

const TrainingLevelPathMap = dynamic(
  () => import('@/components/training/TrainingLevelPathMap'),
  {
    ssr: false,
    loading: () => (
      <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Loading path…</p>
    ),
  },
);

export default function TrainingHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useUserRole();
  const difficulty = normalizeTrainingDifficulty(searchParams.get('difficulty'));
  const cefrLevel = normalizeTrainingCefr(searchParams.get('cefr'));
  const [levelStars, setLevelStars] = useState({});

  const loadLevelStars = useCallback(() => {
    try {
      const savedStars = localStorage.getItem(
        `stars_${cefrLevel}_${ENTRY_SKILL}_${difficulty}`,
      );
      setLevelStars(savedStars ? JSON.parse(savedStars) : {});
    } catch (error) {
      console.warn('Could not load stars:', error);
      setLevelStars({});
    }
  }, [cefrLevel, difficulty]);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [router, session]);

  useEffect(() => {
    loadLevelStars();
  }, [loadLevelStars]);

  useEffect(() => {
    const onStarsUpdated = () => loadLevelStars();
    window.addEventListener(TRAINING_STARS_UPDATED_EVENT, onStarsUpdated);
    return () => window.removeEventListener(TRAINING_STARS_UPDATED_EVENT, onStarsUpdated);
  }, [loadLevelStars]);

  if (!session) {
    return <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</p>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <header className={styles.head}>
          <h1 className={styles.title}>Training</h1>
        </header>
        <aside className={styles.guide} aria-label="About Training">
          <p className={styles.bubble}>
            This is Training. Follow the levels in order. Each one practises one grammar
            point, and two stars unlock the next.
          </p>
          <img
            className={styles.mascot}
            src={sitePublicPath('/mascot/poses/think.png')}
            alt=""
            width={78}
            height={92}
          />
        </aside>
      </div>

      <TrainingLevelPathMap
        key={`${cefrLevel}-${difficulty}`}
        baseHref="/training"
        levelStars={levelStars}
        cefrLevel={cefrLevel}
        difficulty={difficulty}
        skill={ENTRY_SKILL}
        onCefrChange={(id) => router.replace(trainingHomePath(difficulty, id), { scroll: false })}
        onDifficultyChange={(id) => router.replace(trainingHomePath(id, cefrLevel), { scroll: false })}
      />
    </main>
  );
}
