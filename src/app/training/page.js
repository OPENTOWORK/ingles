'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { TRAINING_STARS_UPDATED_EVENT } from '@/utils/trainingStarsProgress';
import styles from './page.module.css';

const ENTRY_LEVEL = 'b2';
const ENTRY_SKILL = 'use-of-english';
const ENTRY_DIFFICULTY = 'basico';

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
  const { session } = useUserRole();
  const [levelStars, setLevelStars] = useState({});

  const loadLevelStars = useCallback(() => {
    try {
      const savedStars = localStorage.getItem(
        `stars_${ENTRY_LEVEL}_${ENTRY_SKILL}_${ENTRY_DIFFICULTY}`,
      );
      setLevelStars(savedStars ? JSON.parse(savedStars) : {});
    } catch (error) {
      console.warn('Could not load stars:', error);
      setLevelStars({});
    }
  }, []);

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
      <header className={styles.head}>
        <h1 className={styles.title}>Training</h1>
      </header>

      <TrainingLevelPathMap
        baseHref="/training"
        levelStars={levelStars}
        cefrLevel={ENTRY_LEVEL}
        difficulty={ENTRY_DIFFICULTY}
        skill={ENTRY_SKILL}
      />
    </main>
  );
}
