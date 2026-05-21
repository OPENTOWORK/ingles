'use client';

import Link from 'next/link';
import TrainingCardProgressStats from '@/components/training/TrainingCardProgressStats';
import styles from './TrainingDifficultyCard.module.css';

const DIFFICULTY_ACCENT = {
  basico: '#059669',
  intermedio: '#d97706',
  avanzado: '#2563eb',
};

/**
 * @param {{
 *   href: string,
 *   id: string,
 *   title: string,
 *   description: string,
 *   earned: number,
 *   max: number,
 *   percent: number,
 *   accentColor?: string,
 * }} props
 */
export default function TrainingDifficultyCard({
  href,
  id,
  title,
  description,
  earned,
  max,
  percent,
  accentColor,
}) {
  const dotAccent = DIFFICULTY_ACCENT[id] || '#64748b';
  const progressAccent = accentColor || dotAccent;

  return (
    <Link
      href={href}
      className={styles.link}
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      <div className={styles.row}>
        <span className={styles.dot} style={{ backgroundColor: dotAccent }} aria-hidden />
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
          <TrainingCardProgressStats
            earned={earned}
            max={max}
            percent={percent}
            variant="card"
            accentColor={progressAccent}
          />
        </div>
      </div>
    </Link>
  );
}
