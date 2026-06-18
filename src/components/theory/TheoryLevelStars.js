'use client';

import styles from './TheoryLevelStars.module.css';

/**
 * Muestra hasta 3 estrellas enteras (0–3) para levels / Stars way.
 * @param {{ stars: number, size?: 'sm' | 'md' | 'lg', variant?: 'default' | 'gold' }} props
 */
export default function TheoryLevelStars({ stars = 0, size = 'md', variant = 'default' }) {
  const value = Math.min(3, Math.max(0, Math.round(Number(stars) || 0)));
  const isGold = variant === 'gold';

  if (isGold) {
    return (
      <div
        className={`${styles.wrap} ${styles[`wrap--${size}`]} ${styles.wrapGold} levels-exercise-stars--gold`}
        role="img"
        aria-label={`${value} out of 3 stars`}
      >
        {[1, 2, 3].map((index) => {
          const filled = value >= index;
          return (
            <span
              key={index}
              className={`${styles.starSvgWrap}${filled ? ` ${styles.starSvgWrapFilled}` : ` ${styles.starSvgWrapEmpty}`}`}
              aria-hidden
            >
              <svg className={styles.starSvg} viewBox="0 0 24 24" focusable="false">
                <path
                  className={styles.starSvgPath}
                  d="M12 2.5l2.82 5.71 6.3.92-4.56 4.44 1.08 6.28L12 17.02l-5.64 2.96 1.08-6.28L2.88 9.13l6.3-.92L12 2.5z"
                />
              </svg>
            </span>
          );
        })}
      </div>
    );
  }

  const legacyValue = Math.min(3, Math.max(0, Number(stars) || 0));

  return (
    <div
      className={`${styles.wrap} ${styles[`wrap--${size}`]}`}
      role="img"
      aria-label={`${legacyValue} out of 3 stars`}
    >
      {[1, 2, 3].map((index) => {
        const filled = legacyValue >= index;
        const half = !filled && legacyValue >= index - 0.5;
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