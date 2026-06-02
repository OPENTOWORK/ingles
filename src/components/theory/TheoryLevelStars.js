'use client';

import styles from './TheoryLevelStars.module.css';

/**
 * Muestra hasta 3 estrellas con medias (0.5, 1.5, 2.5).
 * @param {{ stars: number, size?: 'sm' | 'md' | 'lg' }} props
 */
export default function TheoryLevelStars({ stars = 0, size = 'md' }) {
  const value = Math.min(3, Math.max(0, Number(stars) || 0));

  return (
    <div
      className={`${styles.wrap} ${styles[`wrap--${size}`]}`}
      role="img"
      aria-label={`${value} out of 3 stars`}
    >
      {[1, 2, 3].map((index) => {
        const filled = value >= index;
        const half = !filled && value >= index - 0.5;
        return (
          <span
            key={index}
            className={`${styles.star}${filled ? ` ${styles.starFull}` : ''}${
              half ? ` ${styles.starHalf}` : ''
            }${!filled && !half ? ` ${styles.starEmpty}` : ''}`}
            aria-hidden
          >
            <span className={styles.starBg}>★</span>
            {(filled || half) && <span className={styles.starFg}>★</span>}
          </span>
        );
      })}
    </div>
  );
}
