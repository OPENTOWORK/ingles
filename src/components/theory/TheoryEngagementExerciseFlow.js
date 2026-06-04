'use client';

import { useCallback, useEffect, useMemo, useState, cloneElement, isValidElement } from 'react';
import {
  pickEngagementHook,
  THEORY_ENGAGEMENT_COMPLETE,
} from '@/data/theoryEngagementHooks';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import { starsFromTheorySessionScore } from '@/lib/theoryTopicLevels';
import styles from './TheoryEngagementExerciseFlow.module.css';

/** @typedef {'idle' | 'active' | 'complete'} FlowPhase */

/**
 * Un ejercicio a la vez, estilo pop-up de engagement.
 * Check Answer → botón verde/rojo Continue → siguiente ejercicio.
 */
export default function TheoryEngagementExerciseFlow({
  exercises = [],
  selectedLevel = 'B2',
  topicHref = '',
  topicLevelNum = null,
  topicTitle = '',
  wrapExercise,
  onSessionProgress,
  onSessionComplete,
  onBackToLadder,
}) {
  const total = exercises.length;
  const [phase, setPhase] = useState(/** @type {FlowPhase} */ ('idle'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);
  const [sessionStars, setSessionStars] = useState(null);

  const sessionKey = useMemo(
    () => `${selectedLevel}-${total}-${exercises.map((e) => e?.key).join(',')}`,
    [selectedLevel, total, exercises],
  );

  useEffect(() => {
    setPhase(total > 0 ? 'idle' : 'complete');
    setCurrentIndex(0);
    setLastScore(null);
    setCompletedCount(0);
    setSessionScores([]);
    setSessionStars(null);
    setAnimating(false);
  }, [sessionKey, total]);

  useEffect(() => {
    onSessionProgress?.({ completed: completedCount, total, currentIndex });
  }, [completedCount, total, currentIndex, onSessionProgress]);

  const hook = useMemo(
    () => pickEngagementHook(currentIndex, total),
    [currentIndex, total],
  );

  const currentExercise = exercises[currentIndex] ?? null;
  const currentTypeLabel =
    (isValidElement(currentExercise) && currentExercise.props?.colloquialLabel) ||
    (isValidElement(currentExercise) && currentExercise.props?.typeLabel) ||
    null;

  const goNext = useCallback(() => {
    const hasNext = currentIndex < total - 1;
    setAnimating(true);
    setTimeout(() => {
      if (hasNext) {
        setCurrentIndex((i) => i + 1);
        setLastScore(null);
        setPhase('active');
      } else {
        setPhase('complete');
      }
      setAnimating(false);
    }, 280);
  }, [currentIndex, total]);

  const wrapCurrent = useCallback(() => {
    if (!currentExercise || typeof wrapExercise !== 'function') return null;
    const wrapped = wrapExercise(currentExercise, currentIndex);
    if (!isValidElement(wrapped)) return wrapped;

    const exerciseKey = String(wrapped.key || `exercise-${currentIndex}`);

    return cloneElement(wrapped, {
      key: `${exerciseKey}-step-${currentIndex}`,
      engagementMode: true,
      isLastStep: currentIndex >= total - 1,
      topicHref,
      cefrLevel: selectedLevel,
      onComplete: (score) => {
        wrapped.props.onComplete?.(score);
      },
      onAdvance: (score) => {
        const pts = Number(score) || 0;
        setLastScore(score);
        setSessionScores((prev) => {
          const next = [...prev, pts];
          if (currentIndex >= total - 1) {
            const correct = next.filter((s) => s >= 100).length;
            const stars = starsFromTheorySessionScore(correct, next.length);
            setSessionStars(stars);
            onSessionComplete?.({
              correctCount: correct,
              totalCount: next.length,
              stars,
            });
          }
          return next;
        });
        setCompletedCount((c) => Math.max(c, currentIndex + 1));
        goNext();
      },
    });
  }, [
    currentExercise,
    currentIndex,
    total,
    topicHref,
    selectedLevel,
    wrapExercise,
    goNext,
    onSessionComplete,
  ]);

  const startSession = () => {
    setCurrentIndex(0);
    setLastScore(null);
    setCompletedCount(0);
    setSessionScores([]);
    setSessionStars(null);
    setPhase('active');
  };

  const restartSession = () => {
    startSession();
  };

  const levelLabel =
    topicLevelNum != null ? `Level ${topicLevelNum}` : `Level ${selectedLevel}`;

  if (total === 0) return null;

  const popupClass = `${styles.popup}${animating ? ` ${styles['popup--exit']}` : ''}`;

  if (phase === 'idle') {
    const intro = pickEngagementHook(0, total);
    return (
      <div className={styles.wrap}>
        <div className={popupClass}>
          <span className={styles.ping} aria-hidden />
          <div className={styles.banner}>
            <span className={styles.bannerEmoji} aria-hidden>
              {intro.emoji}
            </span>
            <div className={styles.bannerText}>
              <p className={styles.bannerTitle}>Dralo Sprint</p>
              <p className={styles.bannerSubtitle}>{levelLabel}</p>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.resultPanel}>
              <p className={styles.resultTitle}>{intro.title}</p>
              <p className={styles.resultSubtitle}>{intro.subtitle}</p>
              <button type="button" className={styles.continueBtn} onClick={startSession}>
                Let&apos;s go →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    const done = THEORY_ENGAGEMENT_COMPLETE;
    const correct = sessionScores.filter((s) => s >= 100).length;
    const stars = sessionStars ?? starsFromTheorySessionScore(correct, sessionScores.length);

    return (
      <div className={styles.wrap}>
        <div className={popupClass}>
          <div className={styles.banner}>
            <span className={styles.bannerEmoji} aria-hidden>
              {stars >= 2.5 ? '🏆' : stars > 0 ? done.emoji : '💪'}
            </span>
            <div className={styles.bannerText}>
              <p className={styles.bannerTitle}>
                {stars >= 3 ? 'Perfect climb!' : stars > 0 ? 'Level complete!' : done.title}
              </p>
              <p className={styles.bannerSubtitle}>
                {correct}/{sessionScores.length} correct · {levelLabel}
              </p>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.resultPanel}>
              <TheoryLevelStars stars={stars} size="lg" />
              <p className={styles.resultSubtitle} style={{ marginTop: '0.75rem' }}>
                {topicTitle ? `${topicTitle} · ` : ''}
                {stars === 0
                  ? 'No stars this time — try again!'
                  : `You earned ${stars} star${stars === 1 ? '' : 's'}.`}
              </p>
              <div className={styles.completeActions}>
                {onBackToLadder ? (
                  <button type="button" className={styles.continueBtn} onClick={onBackToLadder}>
                    Back to ladder →
                  </button>
                ) : (
                  <button type="button" className={styles.continueBtn} onClick={restartSession}>
                    Play again ↻
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={popupClass} key={`step-${currentIndex}-${phase}`}>
        <span className={styles.ping} aria-hidden />
        <div className={styles.banner}>
          <span className={styles.bannerEmoji} aria-hidden>
            {hook.emoji}
          </span>
          <div className={styles.bannerText}>
            <p className={styles.bannerTitle}>{currentTypeLabel || hook.title}</p>
            <p className={styles.bannerSubtitle}>{levelLabel}</p>
          </div>
        </div>

        <div className={styles.progress}>
          <span>
            Exercise {hook.index} of {hook.total}
          </span>
          <div className={styles.dots} aria-hidden>
            {exercises.map((ex, i) => (
              <span
                key={ex?.key ?? i}
                className={`${styles.dot}${
                  i < currentIndex ? ` ${styles['dot--done']}` : ''
                }${i === currentIndex && phase === 'active' ? ` ${styles['dot--active']}` : ''}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.body}>{wrapCurrent()}</div>
      </div>
    </div>
  );
}
