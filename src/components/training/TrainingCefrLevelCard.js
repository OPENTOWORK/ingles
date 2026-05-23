'use client';

import Link from 'next/link';
import TrainingCardProgressStats from '@/components/training/TrainingCardProgressStats';
import { getCefrLevelLabel } from '@/constants/cefrLevelColors';
import styles from './TrainingCefrLevelCard.module.css';

/**
 * @param {{
 *   level: string,
 *   accent: string,
 *   earned: number,
 *   max: number,
 *   percent: number,
 *   locked?: boolean,
 *   href?: string,
 * }} props
 */
export default function TrainingCefrLevelCard({
  level,
  accent,
  earned,
  max,
  percent,
  locked = false,
  href,
}) {
  const sublabel = getCefrLevelLabel(level);

  const content = (
    <div className={styles.cefrCard}>
      <div className={styles.accent} style={{ backgroundColor: accent }} aria-hidden />
      <div className={styles.body}>
        <span className={styles.badge} style={{ backgroundColor: accent }}>
          {level}
        </span>
        <span className={styles.sublabel}>{sublabel}</span>
        <span className={styles.title}>Training path</span>
        <div className={styles.stats}>
          <TrainingCardProgressStats
            earned={earned}
            max={max}
            percent={percent}
            variant="card"
            accentColor={accent}
          />
        </div>
      </div>
    </div>
  );

  if (locked) {
    return (
      <div className={styles.wrap}>
        {content}
        <div className={styles.lockedOverlay}>Coming soon</div>
      </div>
    );
  }

  return (
    <Link href={href} className={styles.cardLink}>
      {content}
    </Link>
  );
}
