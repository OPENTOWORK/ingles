'use client';

import Link from 'next/link';
import styles from './TrainingRepasoCard.module.css';

function IconRefresh({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 0 1 13.4-5.9M20 7v-4m0 0h-4m4 0-3.2 3.2M20 12a8 8 0 0 1-13.4 5.9M4 17v4m0 0h4m-4 0 3.2-3.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {{ href: string, pendingCount?: number }} props
 */
export default function TrainingRepasoCard({ href, pendingCount = 0 }) {
  const countLabel =
    pendingCount === 1
      ? '1 exercise to review'
      : `${pendingCount} exercises to review`;

  return (
    <section className={styles.section} aria-labelledby="training-repaso-heading">
      <p className={styles.sectionLabel} id="training-repaso-heading">
        Extra practice
      </p>
      <Link href={href} className={styles.link}>
        <div className={styles.row}>
          <span className={styles.iconWrap} aria-hidden>
            <IconRefresh className={styles.icon} />
          </span>
          <div className={styles.content}>
            <h2 className={styles.title}>Repaso</h2>
            <p className={styles.description}>
              Exercises you need to practise again — focused on what you still find difficult.
            </p>
            <div className={styles.meta}>
              <span className={styles.metaCount}>{countLabel}</span>
              <span className={styles.metaHint}>Opens your review list →</span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
