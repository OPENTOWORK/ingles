'use client';

import Link from 'next/link';
import styles from './ExamPartNavCard.module.css';

/**
 * Exam part row card — shared between Exam Practice and Exam Strategies.
 */
export default function ExamPartNavCard({
  partNumber,
  partName,
  partDesc = null,
  meta = null,
  metaStarted = false,
  href = null,
  onClick = null,
  skillTheme = 'reading',
  className = '',
  ...rest
}) {
  const content = (
    <>
      <span className={styles.partBadge}>{String(partNumber).padStart(2, '0')}</span>
      <span className={styles.partBody}>
        <p className={styles.partName}>{partName}</p>
        {partDesc ? <p className={styles.partDesc}>{partDesc}</p> : null}
        {meta ? (
          <span
            className={`${styles.partMeta}${metaStarted ? ` ${styles['partMeta--started']}` : ''}`}
          >
            {meta}
          </span>
        ) : null}
      </span>
      <span className={styles.partArrow} aria-hidden>
        →
      </span>
    </>
  );

  const cls = `${styles.partCard}${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <Link href={href} className={cls} data-skill-theme={skillTheme} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      data-skill-theme={skillTheme}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}
