'use client';

import { LEVEL_XP_STEP } from '@/lib/dralo-levels';
import { useTrainingExperience } from '@/hooks/useTrainingExperience';
import styles from './TrainingExperienceMeter.module.css';

export default function TrainingExperienceMeter({ accessToken, className = '' }) {
  const { totalXp, levelInfo, loading, error, isEmpty } = useTrainingExperience(accessToken);
  const info = levelInfo;
  const progress = isEmpty || loading ? 0 : info.progressPercent;
  const remaining = isEmpty ? LEVEL_XP_STEP : info.xpNeededForNextLevel;

  return (
    <section
      className={`${styles.card}${className ? ` ${className}` : ''}`}
      aria-label="Training experience"
    >
      {loading ? (
        <p className={styles.status}>Loading experience…</p>
      ) : error ? (
        <p className={styles.status}>Could not load experience.</p>
      ) : (
        <>
          <div className={styles.row}>
            <p className={styles.title}>
              Level {info.level} · {info.levelName}
            </p>
            <span className={styles.xp}>{info.currentXp.toLocaleString()} XP</span>
          </div>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={`Level progress ${progress}%`}
          >
            <span
              className={`${styles.fill}${isEmpty ? ` ${styles.fillEmpty}` : ''}`}
              style={{ width: isEmpty ? '4px' : `${progress}%` }}
            />
          </div>
          <p className={styles.meta}>
            {info.isMaxLevel && !isEmpty
              ? 'Maximum level reached'
              : `${(remaining ?? 0).toLocaleString()} XP to next level`}
          </p>
        </>
      )}
    </section>
  );
}
