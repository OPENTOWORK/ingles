'use client';

import Link from 'next/link';
import styles from './StarsWayHubTabs.module.css';

/** Full-width banner on the B2 hub linking to the Stars way path. */
export default function StarsWayHubTabs({ embedded = false }) {
  return (
    <Link
      href="/niveles/b2/stars-way"
      className={[styles.banner, embedded ? styles.bannerEmbedded : ''].filter(Boolean).join(' ')} aria-label="Open Stars way to B2">
      <span className={styles.bannerGlow} aria-hidden />
      <span className={styles.pathDecor} aria-hidden>
        <span className={styles.pathNode} />
        <span className={styles.pathLine} />
        <span className={`${styles.pathNode} ${styles.pathNodeMid}`} />
        <span className={styles.pathLine} />
        <span className={`${styles.pathNode} ${styles.pathNodeGold}`} />
      </span>

      <span className={styles.bannerContent}>
        <span className={styles.bannerEyebrow}>Your learning path</span>
        <span className={styles.bannerTitle}>
          <span className={styles.bannerStar} aria-hidden>
            ★
          </span>
          Stars way to B2
        </span>
        <span className={styles.bannerDesc}>
          Follow the path skill by skill · earn up to 3 stars on every exercise
        </span>
      </span>

      <span className={styles.bannerAction} aria-hidden>
        <span className={styles.bannerActionLabel}>Start the path</span>
        <span className={styles.bannerArrow}>→</span>
      </span>
    </Link>
  );
}
