'use client';

import { IconStar } from '@/components/training/TrainingIcons';
import styles from './TrainingCardProgressStats.module.css';

/**
 * @param {{ earned: number, max: number, percent: number, variant?: 'light' | 'dark' | 'card', accentColor?: string }} props
 */
export default function TrainingCardProgressStats({
  earned,
  max,
  percent,
  variant = 'card',
  accentColor,
}) {
  const variantClass = variant === 'card' ? styles.stats : `${styles.stats} ${styles[variant]}`;

  return (
    <div className={variantClass}>
      <div className={styles.row}>
        <span className={styles.stars}>
          <IconStar filled className={styles.starIcon} />
          {earned} / {max} stars
        </span>
        <span className={styles.percent}>{percent}%</span>
      </div>
      <div className={styles.progressTrack} aria-hidden>
        <span
          className={styles.progressFill}
          style={{
            width: `${Math.min(100, percent)}%`,
            ...(accentColor ? { background: accentColor } : {}),
          }}
        />
      </div>
    </div>
  );
}
