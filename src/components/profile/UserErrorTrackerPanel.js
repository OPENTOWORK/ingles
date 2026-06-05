'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getUserPracticeErrors,
  getErrorReviewDetail,
  markPracticeErrorReviewed,
} from '@/lib/errorTracker';
import { summarizePracticeErrors } from '@/lib/fetchUserPracticeErrors';
import styles from './UserErrorTrackerPanel.module.css';

const SOURCE_FILTERS = ['All', 'Exam practice', 'Theory'];

const CATEGORY_FILTERS = [
  'All',
  'Reading',
  'Writing',
  'Listening',
  'Speaking',
  'Grammar',
  'Vocabulary',
];

const LEVEL_FILTERS = ['All', 'A2', 'B1', 'B2', 'C1', 'C2'];

const EMPTY_STATE_TEXT =
  'No mistakes recorded yet. When you score below 50% on an exam or theory exercise, it will appear here so you can review and practise again.';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function sourceBadgeClass(sourceKey) {
  return sourceKey === 'theory' ? styles.badgeSourceTheory : styles.badgeSourceExam;
}

function ErrorReviewModal({ item, detail, loading, error, onClose, onMarkLearned, marking }) {
  if (!item) return null;

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className={styles.modalHeader}>
          <div className={styles.modalBadges}>
            <span className={`${styles.badge} ${sourceBadgeClass(item.sourceKey)}`}>
              {item.source}
            </span>
            {item.category ? (
              <span className={`${styles.badge} ${styles.badgeCategory}`}>{item.category}</span>
            ) : null}
            {item.level ? (
              <span className={`${styles.badge} ${styles.badgeLevel}`}>{item.level}</span>
            ) : null}
          </div>
          <div className={styles.scoreRing} aria-label={`Score ${item.score}%`}>
            {item.score}%
          </div>
        </header>

        <h3 id="error-review-title" className={styles.modalTitle}>
          {detail?.title || item.title}
        </h3>
        {item.subtitle ? <p className={styles.modalSubtitle}>{item.subtitle}</p> : null}

        {loading ? (
          <p className={styles.modalLoading}>Loading explanation…</p>
        ) : error ? (
          <p className={styles.modalError} role="alert">
            {error}
          </p>
        ) : (
          <div className={styles.modalBody}>
            {detail?.question ? (
              <div className={styles.modalBlock}>
                <span className={styles.modalBlockLabel}>Question</span>
                <p className={styles.modalBlockText}>{detail.question}</p>
              </div>
            ) : null}

            {detail?.userAttempt || item.userAttempt ? (
              <div className={`${styles.modalBlock} ${styles.modalBlockWrong}`}>
                <span className={styles.modalBlockLabel}>Your answer</span>
                <p className={styles.modalBlockText}>
                  {detail?.userAttempt || item.userAttempt}
                </p>
              </div>
            ) : null}

            <div className={`${styles.modalBlock} ${styles.modalBlockWhy}`}>
              <span className={styles.modalBlockLabel}>Why it was wrong</span>
              <p className={styles.modalBlockText}>
                {detail?.explanation ||
                  'Review the lesson or exam task and compare your answer with the correct one.'}
              </p>
            </div>

            {detail?.correctAnswer ? (
              <div className={`${styles.modalBlock} ${styles.modalBlockCorrect}`}>
                <span className={styles.modalBlockLabel}>Correct answer</span>
                <p className={styles.modalBlockText}>
                  <strong>{detail.correctAnswer}</strong>
                </p>
              </div>
            ) : null}
          </div>
        )}

        <footer className={styles.modalFooter}>
          <button
            type="button"
            className={styles.learnedBtn}
            onClick={onMarkLearned}
            disabled={marking || loading}
          >
            {marking ? 'Saving…' : '✓ Mark as learned'}
          </button>
          {detail?.practiceHref || item.practiceHref ? (
            <Link
              href={detail?.practiceHref || item.practiceHref}
              className={styles.practiseLink}
              onClick={onClose}
            >
              Practise again →
            </Link>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

export default function UserErrorTrackerPanel({ userId = null }) {
  const [errors, setErrors] = useState([]);
  const [reviewedKeys, setReviewedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [showLearned, setShowLearned] = useState(false);

  const [reviewItem, setReviewItem] = useState(null);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [markingLearned, setMarkingLearned] = useState(false);

  const loadErrors = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const res = await getUserPracticeErrors(userId);
    if (!res.ok) {
      setLoadError(res.error || 'Could not load your mistakes.');
      setErrors([]);
      setReviewedKeys([]);
    } else {
      setErrors(res.data || []);
      setReviewedKeys(res.reviewedKeys || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadErrors();
  }, [loadErrors]);

  const toReviewErrors = useMemo(
    () => errors.filter((e) => !reviewedKeys.includes(e.id)),
    [errors, reviewedKeys],
  );

  const learnedErrors = useMemo(
    () => errors.filter((e) => reviewedKeys.includes(e.id)),
    [errors, reviewedKeys],
  );

  const activeErrors = useMemo(
    () => (showLearned ? learnedErrors : toReviewErrors),
    [showLearned, learnedErrors, toReviewErrors],
  );

  const toReviewSummary = useMemo(() => summarizePracticeErrors(toReviewErrors), [toReviewErrors]);
  const learnedSummary = useMemo(() => summarizePracticeErrors(learnedErrors), [learnedErrors]);
  const learnedCount = learnedErrors.length;
  const toReviewCount = toReviewErrors.length;

  const filtered = useMemo(() => {
    return activeErrors.filter((item) => {
      const sourceOk =
        sourceFilter === 'All' ||
        String(item.source || '').toLowerCase() === sourceFilter.toLowerCase();
      const categoryOk =
        categoryFilter === 'All' ||
        String(item.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const levelOk =
        levelFilter === 'All' ||
        String(item.level || '').toUpperCase() === levelFilter.toUpperCase();
      return sourceOk && categoryOk && levelOk;
    });
  }, [activeErrors, sourceFilter, categoryFilter, levelFilter]);

  const openReview = async (item) => {
    setReviewItem(item);
    setReviewDetail(null);
    setReviewError('');
    setReviewLoading(true);

    const res = await getErrorReviewDetail(item.id);
    if (!res.ok) {
      setReviewError(res.error || 'Could not load review.');
    } else {
      setReviewDetail(res.data);
    }
    setReviewLoading(false);
  };

  const closeReview = () => {
    setReviewItem(null);
    setReviewDetail(null);
    setReviewError('');
    setReviewLoading(false);
    setMarkingLearned(false);
  };

  const handleMarkLearned = async () => {
    if (!reviewItem) return;
    setMarkingLearned(true);
    const res = await markPracticeErrorReviewed(reviewItem.id, userId);
    if (res.ok) {
      setReviewedKeys((prev) =>
        prev.includes(reviewItem.id) ? prev : [...prev, reviewItem.id],
      );
      closeReview();
    } else {
      setReviewError(res.error || 'Could not save.');
      setMarkingLearned(false);
    }
  };

  return (
    <section className={styles.panel}>
      <header className={styles.hero}>
        <h2 className={styles.title}>
          <span aria-hidden="true">🧠</span> My Error Tracker
        </h2>
        <p className={styles.subtitle}>
          Review questions and exercises where you scored below 50%. Practise again to improve.
        </p>
      </header>

      {!loading && !loadError && errors.length > 0 ? (
        <div className={styles.stats}>
          <div className={`${styles.statCard}${!showLearned ? ` ${styles.statCardActive}` : ''}`}>
            <span className={styles.statValue}>{toReviewSummary.total}</span>
            <span className={styles.statLabel}>To review</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {showLearned ? learnedSummary.exam : toReviewSummary.exam}
            </span>
            <span className={styles.statLabel}>Exam practice</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {showLearned ? learnedSummary.theory : toReviewSummary.theory}
            </span>
            <span className={styles.statLabel}>Theory</span>
          </div>
          <div
            className={`${styles.statCard} ${styles.statCardLearned}${showLearned ? ` ${styles.statCardActive}` : ''}`}
          >
            <span className={styles.statValue}>{learnedCount}</span>
            <span className={styles.statLabel}>Learned</span>
          </div>
        </div>
      ) : null}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Source</span>
          <div className={styles.chips}>
            {SOURCE_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip}${sourceFilter === s ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setSourceFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category</span>
          <div className={styles.chips}>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.chip}${categoryFilter === c ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Level</span>
          <div className={styles.chips}>
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles.chip}${levelFilter === l ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setLevelFilter(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>View</span>
          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip}${!showLearned ? ` ${styles.chipActive}` : ''}`}
              onClick={() => setShowLearned(false)}
            >
              To review ({toReviewCount})
            </button>
            <button
              type="button"
              className={`${styles.chip}${showLearned ? ` ${styles.chipActive}` : ''}`}
              onClick={() => setShowLearned(true)}
            >
              Learned ({learnedCount})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.state}>Loading your mistakes…</div>
      ) : loadError ? (
        <div className={`${styles.state} ${styles.stateError}`} role="alert">
          {loadError}
        </div>
      ) : errors.length === 0 ? (
        <div className={styles.state}>{EMPTY_STATE_TEXT}</div>
      ) : showLearned && learnedCount === 0 ? (
        <div className={styles.state}>
          No mistakes marked as learned yet. Open a card, review it, and tap{' '}
          <strong>Mark as learned</strong>.
        </div>
      ) : !showLearned && toReviewCount === 0 ? (
        <div className={styles.state}>
          Great work — you have reviewed all your current mistakes. Check the{' '}
          <strong>Learned</strong> tab to see them.
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.state}>No mistakes match these filters.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => {
            const learned = reviewedKeys.includes(item.id);
            return (
              <article
                key={item.id}
                className={`${styles.card}${learned ? ` ${styles.cardLearned}` : ''}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${sourceBadgeClass(item.sourceKey)}`}>
                      {item.source}
                    </span>
                    {item.category ? (
                      <span className={`${styles.badge} ${styles.badgeCategory}`}>
                        {item.category}
                      </span>
                    ) : null}
                    {item.level ? (
                      <span className={`${styles.badge} ${styles.badgeLevel}`}>{item.level}</span>
                    ) : null}
                    {learned ? (
                      <span className={`${styles.badge} ${styles.badgeLearned}`}>Learned</span>
                    ) : null}
                  </div>
                  <div className={styles.scoreRing} aria-label={`Score ${item.score}%`}>
                    {item.score}%
                  </div>
                </div>

                <div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.subtitle ? <p className={styles.cardSubtitle}>{item.subtitle}</p> : null}
                </div>

                {item.userAttempt ? (
                  <div className={styles.attemptBox}>
                    <span className={styles.attemptLabel}>Your result</span>
                    <p className={styles.attemptText}>{item.userAttempt}</p>
                  </div>
                ) : null}

                {item.contextText ? <p className={styles.contextText}>{item.contextText}</p> : null}

                <div className={styles.cardFooter}>
                  <span className={styles.date}>{formatDate(item.createdAt)}</span>
                  <button
                    type="button"
                    className={styles.reviewBtn}
                    onClick={() => void openReview(item)}
                  >
                    Review →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ErrorReviewModal
        item={reviewItem}
        detail={reviewDetail}
        loading={reviewLoading}
        error={reviewError}
        onClose={closeReview}
        onMarkLearned={() => void handleMarkLearned()}
        marking={markingLearned}
      />
    </section>
  );
}
