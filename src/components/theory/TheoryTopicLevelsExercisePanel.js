'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildSupabaseTheoryExerciseElements } from '@/components/theory/buildSupabaseTheoryExerciseElements';
import TheoryEngagementExerciseFlow from '@/components/theory/TheoryEngagementExerciseFlow';
import SiteMascot from '@/components/SiteMascot';
import { MASCOT_THINKING_VARIANT } from '@/config/mascotAssets';
import TheoryTopicLevelStaircase from '@/components/theory/TheoryTopicLevelStaircase';
import styles from './TheoryTopicLevelsExercisePanel.module.css';
import { defaultExerciseLevel } from '@/lib/theoryExerciseLevelConfig';
import {
  readTheoryTopicLevelStars,
  saveTheoryTopicLevelStars,
} from '@/lib/theoryTopicLevelProgress';
import {
  starsFromTheorySessionScore,
  topicProgressPercentFromStars,
  THEORY_EXERCISES_PER_TOPIC_LEVEL,
} from '@/lib/theoryTopicLevels';
import { saveExamTheoryTopicProgress } from '@/lib/saveExamTheoryTopicProgress';
import { saveTeoriaTopicProgress } from '@/lib/saveTeoriaTopicProgress';
import { saveTheoryProgress } from '@/utils/theoryProgress';

export default function TheoryTopicLevelsExercisePanel({
  topicHref,
  topicTitle = '',
  topicLevelLabel = 'B2',
  userId = null,
  accessToken = null,
  wrapExercise,
}) {
  const cefrLevel = defaultExerciseLevel(topicLevelLabel);
  const [starsByLevel, setStarsByLevel] = useState({});
  const [poolCount, setPoolCount] = useState(0);
  const [activeTopicLevel, setActiveTopicLevel] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);

  const hydrateStars = useCallback(() => {
    if (!userId || !topicHref) {
      setStarsByLevel({});
      return;
    }
    setStarsByLevel(readTheoryTopicLevelStars(userId, topicHref));
  }, [userId, topicHref]);

  useEffect(() => {
    hydrateStars();
    const onUpdate = () => hydrateStars();
    window.addEventListener('theory-topic-level-stars-updated', onUpdate);
    return () => window.removeEventListener('theory-topic-level-stars-updated', onUpdate);
  }, [hydrateStars]);

  useEffect(() => {
    if (!topicHref) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          topic_href: topicHref,
          cefr_level: cefrLevel,
          random: '0',
          limit: '1',
        });
        const res = await fetch(`/api/theory-exercises?${params}`);
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) setPoolCount(json.poolCount ?? json.count ?? 0);
      } catch {
        if (!cancelled) setPoolCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicHref, cefrLevel]);

  const syncTopicProgress = useCallback(
    (nextStars) => {
      const pct = topicProgressPercentFromStars(nextStars);
      if (!userId || !topicHref) return;
      const topicId = topicHref.replace(/^\/teoria\//, '');
      saveTheoryProgress(userId, topicHref, pct);
      saveTheoryProgress(userId, topicId, pct);
      saveExamTheoryTopicProgress({
        userId,
        accessToken,
        topicHref,
        progresoPct: pct,
      });
      saveTeoriaTopicProgress({
        userId,
        accessToken,
        topicHref,
        progresoPct: pct,
      });
    },
    [userId, topicHref, accessToken],
  );

  const startLevel = async (topicLevel) => {
    setLoading(true);
    setActiveTopicLevel(topicLevel);
    const seed = Date.now();
    setSessionSeed(seed);
    try {
      const params = new URLSearchParams({
        topic_href: topicHref,
        cefr_level: cefrLevel,
        topic_level: String(topicLevel),
        random: '1',
        limit: String(THEORY_EXERCISES_PER_TOPIC_LEVEL),
        seed: String(seed),
      });
      const res = await fetch(`/api/theory-exercises?${params}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.exercises?.length) {
        setSessionExercises([]);
        return;
      }
      setPoolCount(json.poolCount ?? poolCount);
      const built = buildSupabaseTheoryExerciseElements(json.exercises);
      const unique = built.filter(
        (ex, index, arr) =>
          ex?.key && arr.findIndex((e) => e?.key === ex.key) === index,
      );
      if (unique.length < THEORY_EXERCISES_PER_TOPIC_LEVEL) {
        setSessionExercises([]);
        return;
      }
      setSessionExercises(unique.slice(0, THEORY_EXERCISES_PER_TOPIC_LEVEL));
    } catch {
      setSessionExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = useCallback(
    ({ correctCount, totalCount }) => {
      if (!activeTopicLevel || !userId) return;
      const stars = starsFromTheorySessionScore(correctCount, totalCount);
      const saved = saveTheoryTopicLevelStars(userId, topicHref, activeTopicLevel, stars);
      setStarsByLevel((prev) => {
        const next = { ...prev, [activeTopicLevel]: saved };
        syncTopicProgress(next);
        return next;
      });
    },
    [activeTopicLevel, userId, topicHref, syncTopicProgress],
  );

  const backToLadder = () => {
    setActiveTopicLevel(null);
    setSessionExercises([]);
    hydrateStars();
  };

  if (activeTopicLevel && !loading && sessionExercises.length > 0) {
    return (
      <div>
        <button type="button" className="theory-ladder-back" onClick={backToLadder}>
          ← Back to ladder
        </button>
        <TheoryEngagementExerciseFlow
          key={`level-${activeTopicLevel}-${sessionSeed}`}
          exercises={sessionExercises}
          selectedLevel={String(activeTopicLevel)}
          topicHref={topicHref}
          topicLevelNum={activeTopicLevel}
          topicTitle={topicTitle}
          wrapExercise={wrapExercise}
          onSessionComplete={handleSessionComplete}
          onBackToLadder={backToLadder}
        />
      </div>
    );
  }

  if (activeTopicLevel && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }} role="status">
        <span className="route-loading__spinner" aria-hidden style={{ display: 'inline-block' }} />
        <p>Loading level {activeTopicLevel}…</p>
      </div>
    );
  }

  if (activeTopicLevel && !loading && sessionExercises.length === 0) {
    return (
      <div>
        <button type="button" className="theory-ladder-back" onClick={backToLadder}>
          ← Back to ladder
        </button>
        <div className={styles.emptyDralo} role="status" aria-label="Not enough exercises yet">
          <SiteMascot
            variant={MASCOT_THINKING_VARIANT}
            width={200}
            className={styles.emptyDraloMascot}
            alt="Dralo thinking"
          />
        </div>
      </div>
    );
  }

  return (
    <TheoryTopicLevelStaircase
      starsByLevel={starsByLevel}
      poolCount={poolCount}
      onSelectLevel={startLevel}
    />
  );
}
