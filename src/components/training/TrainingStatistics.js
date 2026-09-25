'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getTrainingPathCurriculum } from '@/data/trainingPathCurriculum';
import {
  TRAINING_MASTERY_STARS,
  TRAINING_UNLOCK_STARS,
  getTrainingCurrentLevelNumber,
} from '@/lib/trainingPathUnlock';
import {
  TRAINING_STARS_UPDATED_EVENT,
  getTrainingStarsStorageKey,
} from '@/utils/trainingStarsProgress';
import styles from './TrainingStatistics.module.css';

const TRAINING_CEFR = 'b2';
const TRAINING_SKILL = 'use-of-english';
const TRAINING_DIFFICULTY = 'basico';

function readLevelStars() {
  if (typeof window === 'undefined') return {};
  try {
    const key = getTrainingStarsStorageKey(TRAINING_CEFR, TRAINING_SKILL, TRAINING_DIFFICULTY);
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function starsAt(levelStars, n) {
  return Number(levelStars[`level-${n}`]) || 0;
}

export default function TrainingStatistics() {
  const [levelStars, setLevelStars] = useState({});

  const loadStars = useCallback(() => {
    setLevelStars(readLevelStars());
  }, []);

  useEffect(() => {
    loadStars();
    window.addEventListener(TRAINING_STARS_UPDATED_EVENT, loadStars);
    window.addEventListener('storage', loadStars);
    return () => {
      window.removeEventListener(TRAINING_STARS_UPDATED_EVENT, loadStars);
      window.removeEventListener('storage', loadStars);
    };
  }, [loadStars]);

  const curriculum = useMemo(
    () => getTrainingPathCurriculum(TRAINING_CEFR, TRAINING_DIFFICULTY, TRAINING_SKILL),
    [],
  );

  const stats = useMemo(() => {
    const total = curriculum.totalLevels || 0;
    let completed = 0;
    let mastered = 0;
    let stars = 0;

    for (let n = 1; n <= total; n += 1) {
      const value = starsAt(levelStars, n);
      stars += value;
      if (value >= TRAINING_UNLOCK_STARS) completed += 1;
      if (value >= TRAINING_MASTERY_STARS) mastered += 1;
    }

    const current = getTrainingCurrentLevelNumber(levelStars, total);
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const maxStars = total * TRAINING_MASTERY_STARS;

    const sections = (curriculum.sections || []).map((section) => {
      const levels = section.levels || [];
      let sectionCompleted = 0;
      let sectionStars = 0;
      for (const level of levels) {
        const value = starsAt(levelStars, level.n);
        sectionStars += value;
        if (value >= TRAINING_UNLOCK_STARS) sectionCompleted += 1;
      }
      const sectionMax = levels.length * TRAINING_MASTERY_STARS;
      return {
        title: section.title,
        color: section.color || '#6366f1',
        from: section.from,
        to: section.to,
        completed: sectionCompleted,
        total: levels.length,
        stars: sectionStars,
        maxStars: sectionMax,
        percent: levels.length ? Math.round((sectionCompleted / levels.length) * 100) : 0,
        levels: levels.map((level) => ({
          n: level.n,
          topic: level.topic,
          stars: starsAt(levelStars, level.n),
        })),
      };
    });

    return {
      total,
      completed,
      mastered,
      stars,
      maxStars,
      current,
      percent,
      sections,
      hasData: stars > 0 || completed > 0,
    };
  }, [curriculum, levelStars]);

  return (
    <section className={styles.wrap} aria-label="Training statistics">
      <div className={styles.kpis}>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>{stats.completed}/{stats.total}</span>
          <span className={styles.kpiLabel}>Levels done</span>
        </article>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>{stats.stars}/{stats.maxStars}</span>
          <span className={styles.kpiLabel}>Stars</span>
        </article>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>{stats.mastered}</span>
          <span className={styles.kpiLabel}>Mastered</span>
        </article>
        <article className={styles.kpi}>
          <span className={styles.kpiValue}>
            {stats.completed >= stats.total && stats.total ? 'Done' : stats.current}
          </span>
          <span className={styles.kpiLabel}>Current level</span>
        </article>
      </div>

      <div className={styles.overall}>
        <div className={styles.overallHead}>
          <p className={styles.overallTitle}>Path progress</p>
          <p className={styles.overallPct}>{stats.percent}%</p>
        </div>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.barFill} style={{ width: `${stats.percent}%` }} />
        </div>
      </div>

      {!stats.hasData ? (
        <p className={styles.empty}>
          Complete a training level to see your statistics here.{' '}
          <Link href="/training">Open Training</Link>
        </p>
      ) : (
        <div className={styles.sections}>
          <h3 className={styles.blockTitle}>Progress by part</h3>
          <div className={styles.grid}>
            {stats.sections.map((section) => (
              <article key={section.title} className={styles.card}>
                <div className={styles.cardTop}>
                  <h4 className={styles.cardName}>
                    <span className={styles.dot} style={{ backgroundColor: section.color }} />
                    {section.title}
                  </h4>
                  <span className={styles.badge}>
                    {section.completed}/{section.total}
                  </span>
                </div>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{section.stars}</span>
                    <span className={styles.metricLabel}>Stars</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{section.percent}%</span>
                    <span className={styles.metricLabel}>Done</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {section.from}–{section.to}
                    </span>
                    <span className={styles.metricLabel}>Levels</span>
                  </div>
                </div>
                <div className={styles.bar} role="presentation">
                  <div
                    className={styles.barFill}
                    style={{ width: `${section.percent}%`, backgroundColor: section.color }}
                  />
                </div>
                <ol className={styles.levels}>
                  {section.levels.map((level) => (
                    <li key={level.n} className={styles.level}>
                      <span className={styles.levelNum}>{String(level.n).padStart(2, '0')}</span>
                      <span className={styles.levelTopic}>{level.topic}</span>
                      <span className={styles.levelStars} aria-label={`${level.stars} of 3 stars`}>
                        {[1, 2, 3].map((star) => (
                          <span
                            key={star}
                            className={star <= level.stars ? styles.starOn : styles.starOff}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      )}

      <p className={styles.footer}>
        <Link href="/training">Continue training →</Link>
      </p>
    </section>
  );
}
