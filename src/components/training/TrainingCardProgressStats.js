'use client';

import styles from './TrainingCardProgressStats.module.css';

/**
 * @param {{ earned: number, max: number, percent: number, variant?: 'light' | 'dark' }} props
 */
export default function TrainingCardProgressStats({
  earned,
  max,
  percent,
  variant = 'light',
}) {
  return (
    <div className={`${styles.stats} ${styles[variant]}`}>
      <span className={styles.stars}>
        ⭐ {earned}/{max} estrellas
      </span>
      <span className={styles.percent}>{percent}/100%</span>
      <div className={styles.progressTrack} aria-hidden>
        <span className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
