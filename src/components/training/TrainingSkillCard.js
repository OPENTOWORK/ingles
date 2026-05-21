'use client';

import Link from 'next/link';
import TrainingCardProgressStats from '@/components/training/TrainingCardProgressStats';
import { TrainingSkillIcon } from '@/components/training/TrainingIcons';
import styles from './TrainingSkillCard.module.css';

/**
 * @param {{
 *   href: string,
 *   skillId: string,
 *   label: string,
 *   earned: number,
 *   max: number,
 *   percent: number,
 *   accentColor?: string,
 * }} props
 */
export default function TrainingSkillCard({ href, skillId, label, earned, max, percent, accentColor }) {
  return (
    <Link
      href={href}
      className={styles.link}
      style={accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined}
    >
      <span
        className={styles.iconWrap}
        style={accentColor ? { color: accentColor, backgroundColor: `${accentColor}14` } : undefined}
      >
        <TrainingSkillIcon skillId={skillId} />
      </span>
      <span className={styles.label}>{label}</span>
      <TrainingCardProgressStats
        earned={earned}
        max={max}
        percent={percent}
        variant="card"
        accentColor={accentColor}
      />
    </Link>
  );
}
