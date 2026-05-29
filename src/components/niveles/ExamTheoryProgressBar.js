'use client';

import styles from './ExamTheoryProgressBar.module.css';

/**
 * Barra 0–100 % reutilizable (global o por unidad).
 */
export default function ExamTheoryProgressBar({
  percent = 0,
  label,
  size = 'md',
  accentColor = '#1cb0f6',
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      <div className={styles.labelRow}>
        {label ? <span className={styles.label}>{label}</span> : <span className={styles.label} aria-hidden />}
        <span className={styles.value}>{safePercent}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label}: ${safePercent}%` : `${safePercent}%`}
      >
        <span
          className={styles.fill}
          style={{
            width: `${safePercent}%`,
            background: `linear-gradient(90deg, ${accentColor}, #58cc02)`,
          }}
        />
      </div>
    </div>
  );
}
