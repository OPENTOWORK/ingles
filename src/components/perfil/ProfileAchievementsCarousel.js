'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  ACHIEVEMENT_PAGE_COUNT,
  ACHIEVEMENT_PAGES,
  ACHIEVEMENTS_PER_PAGE,
} from '@/data/profileAchievementsCatalog';
import {
  evaluateAchievementPages,
  fetchAchievementStats,
} from '@/lib/evaluateProfileAchievements';
import styles from './ProfileAchievementsCarousel.module.css';

const CATEGORY_LABELS = {
  levels: 'Levels',
  theory: 'Theory',
  placement: 'Placement',
  training: 'Training',
};

export default function ProfileAchievementsCarousel({ userId }) {
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setPages(evaluateAchievementPages(ACHIEVEMENT_PAGES, {}));
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const stats = await fetchAchievementStats(supabase, userId);
        if (cancelled) return;
        setPages(evaluateAchievementPages(ACHIEVEMENT_PAGES, stats));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load achievements.');
          setPages(evaluateAchievementPages(ACHIEVEMENT_PAGES, {}));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const currentPage = pages[pageIndex];
  const earnedTotal = useMemo(
    () => pages.reduce((sum, p) => sum + p.badges.filter((b) => b.earned).length, 0),
    [pages],
  );
  const totalBadges = ACHIEVEMENT_PAGE_COUNT * ACHIEVEMENTS_PER_PAGE;

  const goPrev = () => setPageIndex((i) => Math.max(0, i - 1));
  const goNext = () => setPageIndex((i) => Math.min(ACHIEVEMENT_PAGE_COUNT - 1, i + 1));

  if (loading) {
    return <div className={styles.loading}>Loading achievements and badges…</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          Unlocked: <strong>{earnedTotal}</strong> / {totalBadges}
        </span>
        <span className={styles.summaryItem}>
          Page: <strong>{pageIndex + 1}</strong> / {ACHIEVEMENT_PAGE_COUNT}
        </span>
      </div>

      <div className={styles.header}>
        <div>
          <h3 className={styles.pageTitle}>{currentPage?.title}</h3>
          <span className={styles.pageMeta}>
            {currentPage?.badges?.filter((b) => b.earned).length ?? 0} of {ACHIEVEMENTS_PER_PAGE}{' '}
            on this page
          </span>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goPrev}
            disabled={pageIndex === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goNext}
            disabled={pageIndex >= ACHIEVEMENT_PAGE_COUNT - 1}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.grid} role="list">
        {(currentPage?.badges || []).map((badge) => (
          <article
            key={badge.id}
            role="listitem"
            className={`${styles.card} ${badge.earned ? styles.cardEarned : styles.cardLocked}`}
            title={badge.description}
          >
            <span className={styles.icon} aria-hidden>
              {badge.icon}
            </span>
            <span className={styles.name}>{badge.name}</span>
            <span className={styles.desc}>{badge.description}</span>
            {badge.earned && badge.earnedDate ? (
              <span className={styles.date}>Earned: {badge.earnedDate}</span>
            ) : null}
            <span className={styles.categoryTag}>
              {CATEGORY_LABELS[badge.category] || badge.category}
            </span>
          </article>
        ))}
      </div>

      <div className={styles.dots} role="tablist" aria-label="Achievement pages">
        {Array.from({ length: ACHIEVEMENT_PAGE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === pageIndex}
            aria-label={`Page ${i + 1}`}
            className={`${styles.dot} ${i === pageIndex ? styles.dotActive : ''}`}
            onClick={() => setPageIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
