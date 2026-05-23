'use client';

import { useEffect, useMemo } from 'react';
import styles from './TrainingStarsCelebration.module.css';

const CONFETTI_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e'];

/**
 * @param {{
 *   stars: number,
 *   levelNum: number,
 *   topicLabel?: string,
 *   improved?: boolean,
 *   onClose: () => void,
 * }} props
 */
export default function TrainingStarsCelebration({
  stars,
  levelNum,
  topicLabel = '',
  improved = true,
  onClose,
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${8 + (i * 5) % 84}%`,
        delay: `${(i % 6) * 0.06}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!improved && stars === 0) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-celebration-title"
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {stars > 0 ? (
          <div className={styles.confetti} aria-hidden>
            {particles.map((p) => (
              <span
                key={p.id}
                className={styles.particle}
                style={{
                  left: p.left,
                  top: '12%',
                  background: p.color,
                  animationDelay: p.delay,
                }}
              />
            ))}
          </div>
        ) : null}

        <span className={styles.badge}>Level complete</span>
        <h2 id="training-celebration-title" className={styles.title}>
          {stars > 0 ? 'Great work!' : 'Level finished'}
        </h2>
        <p className={styles.subtitle}>
          Level {levelNum}
          {topicLabel ? ` · ${topicLabel}` : ''}
          {stars > 0 ? ` — you earned ${stars} star${stars === 1 ? '' : 's'}.` : '.'}
        </p>

        <div className={styles.stars} aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${star <= stars ? styles.starOn : ''}`}
              style={star <= stars ? { animationDelay: `${0.15 + star * 0.12}s` } : undefined}
              aria-hidden
            >
              ★
            </span>
          ))}
        </div>

        <button type="button" className={styles.btn} onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
