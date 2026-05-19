'use client';

import Link from 'next/link';
import styles from './TrainingCefrLevelCard.module.css';

/**
 * @param {{
 *   level: string,
 *   color: string,
 *   emoji: string,
 *   earned: number,
 *   max: number,
 *   percent: number,
 *   locked?: boolean,
 *   href?: string,
 * }} props
 */
export default function TrainingCefrLevelCard({
  level,
  color,
  emoji,
  earned,
  max,
  percent,
  locked = false,
  href,
}) {
  const content = (
    <>
      <div className={styles.emoji}>{emoji}</div>
      <div className={styles.title}>Level {level}</div>
      <div className={styles.stats}>
        <span className={styles.stars}>
          ⭐ {earned}/{max} estrellas
        </span>
        <span className={styles.percent}>{percent}/100%</span>
      </div>
      <div className={styles.progressTrack} aria-hidden>
        <span className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </>
  );

  if (locked) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card} style={{ backgroundColor: color }} aria-disabled="true">
          {content}
        </div>
        <div className={styles.lockedOverlay}>Coming soon</div>
      </div>
    );
  }

  return (
    <Link href={href} className={styles.cardLink}>
      <div className={styles.card} style={{ backgroundColor: color }}>
        {content}
      </div>
    </Link>
  );
}
