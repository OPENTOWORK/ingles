'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const TrainingLevelPathMap = dynamic(
  () => import('@/components/training/TrainingLevelPathMap'),
  {
    ssr: false,
    loading: () => (
      <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Loading path…</p>
    ),
  },
);

function formatSkillTitle(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1).replace(/-/g, ' ');
}

function formatDifficultyTitle(difficulty) {
  const map = {
    basico: 'Basic',
    intermedio: 'Intermediate',
    avanzado: 'Advanced',
  };
  return map[difficulty] || difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export default function DifficultyPage({ params }) {
  const { level, skill, difficulty } = params;
  const [levelStars, setLevelStars] = useState({});

  useEffect(() => {
    try {
      const savedStars = localStorage.getItem(`stars_${level}_${skill}_${difficulty}`);
      if (savedStars) {
        setLevelStars(JSON.parse(savedStars));
      }
    } catch (error) {
      console.warn('Could not load stars:', error);
    }
  }, [level, skill, difficulty]);

  const baseHref = `/training/${level}/${skill}/${difficulty}`;
  const skillTitle = formatSkillTitle(skill);
  const difficultyTitle = formatDifficultyTitle(difficulty);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          {skillTitle} — {difficultyTitle}
        </h1>
        <p className={styles.subtitle}>Choose a level on the path</p>
      </header>

      <TrainingLevelPathMap
        baseHref={baseHref}
        levelStars={levelStars}
        cefrLevel={level}
        difficulty={difficulty}
        skill={skill}
      />

      <div className={styles.back}>
        <Link href={`/training/${level}/${skill}`} className={styles.backBtn}>
          ← Back to {skillTitle}
        </Link>
      </div>
    </main>
  );
}
