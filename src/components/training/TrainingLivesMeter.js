'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatTrainingLifeWait } from '@/lib/trainingLives';
import styles from './TrainingLivesMeter.module.css';

function Heart({ filled }) {
  return (
    <svg className={filled ? styles.heartOn : styles.heartOff} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.1C5 8 6.8 6.2 9.1 6.2c1.3 0 2.4.6 2.9 1.6.5-1 1.6-1.6 2.9-1.6 2.3 0 4.1 1.8 4.1 4.7C19 15.6 12 20 12 20z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrainingLivesMeter({
  loading = false,
  unlimited = false,
  lives = null,
  max = null,
  nextLifeAt = null,
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (unlimited || !nextLifeAt || lives == null || (max != null && lives >= max)) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [unlimited, nextLifeAt, lives, max]);

  if (loading) {
    return <span className={styles.meter} aria-hidden />;
  }

  if (unlimited) {
    return (
      <span className={styles.meter} aria-label="Unlimited lives">
        <Heart filled />
        <span className={styles.unlimited}>∞</span>
      </span>
    );
  }

  const cap = max || 0;
  const left = Math.max(0, Number(lives) || 0);
  const waiting = left < cap && nextLifeAt;

  return (
    <span className={styles.meter} aria-label={`${left} of ${cap} lives`}>
      <span className={styles.hearts}>
        {Array.from({ length: cap }, (_, index) => (
          <Heart key={index} filled={index < left} />
        ))}
      </span>
      {waiting ? (
        <span className={styles.wait}>Next life in {formatTrainingLifeWait(nextLifeAt)}</span>
      ) : null}
    </span>
  );
}

export function TrainingLivesEmpty({ backHref, nextLifeAt, regenHours = 10, feature = 'Training' }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [nextLifeAt]);

  const hours = regenHours || 10;

  return (
    <div className={styles.empty} role="status">
      <h2 className={styles.emptyTitle}>Out of lives</h2>
      <p className={styles.emptyText}>
        The free plan includes 3 {feature} lives. One life comes back every {hours} hours
        {nextLifeAt ? ` — next one in ${formatTrainingLifeWait(nextLifeAt)}` : ''}.
      </p>
      <p className={styles.emptyText}>Plus and Premium include unlimited lives.</p>
      <div className={styles.emptyActions}>
        <Link href="/precios" className={styles.primary}>
          See plans
        </Link>
        {backHref ? (
          <Link href={backHref} className={styles.secondary}>
            Back to path
          </Link>
        ) : null}
      </div>
    </div>
  );
}
