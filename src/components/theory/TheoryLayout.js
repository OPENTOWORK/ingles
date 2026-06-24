'use client';
import { useCallback, useEffect, useMemo, useState, isValidElement, cloneElement } from 'react';
import { TheorySectionProvider } from '@/components/theory/TheoryContent';
import { TheoryPageShell } from '@/components/theory/TheoryPageShell';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { saveExamTheoryTopicProgress } from '@/lib/saveExamTheoryTopicProgress';
import { saveTeoriaTopicProgress } from '@/lib/saveTeoriaTopicProgress';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import {
  getExamTheoryUnlockInfo,
  getExamUnitSlugFromPathname,
  isExamTheorySectionSlug,
  isExamTheorySlugLocked,
} from '@/lib/examTheoryUnlock';
import {
  getExamTopicUnlockInfo,
  getSectionKeyBySlug,
  isExamTopicHrefLocked,
} from '@/lib/examTheoryTopicUnlock';
import {
  getTeoriaApartadoUnlockInfo,
  getTheorySectionKeyBySlug,
  isTeoriaApartadoLocked,
  isTheorySectionSlug,
} from '@/lib/teoriaUnlock';
import {
  getTeoriaTopicUnlockInfo,
  isTeoriaTopicHrefLocked,
} from '@/lib/teoriaTopicUnlock';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import { useTeoriaProgress } from '@/hooks/useTeoriaProgress';
import ExamTheoryLockedNotice from '@/components/niveles/ExamTheoryLockedNotice';
import { shouldApplySequentialLock } from '@/lib/theoryLockConfig';
import { saveTheoryProgress } from '@/utils/theoryProgress';
import {
  defaultExerciseLevel,
  getPrimaryHandcraftedLevel,
  parseTopicLevels,
} from '@/lib/theoryExerciseLevelConfig';
import { readTheoryTopicLevelStars } from '@/lib/theoryTopicLevelProgress';
import {
  topicProgressPercentFromStars,
  THEORY_TOPIC_LEVEL_COUNT,
} from '@/lib/theoryTopicLevels';
import TheoryTopicLevelsExercisePanel from '@/components/theory/TheoryTopicLevelsExercisePanel';
import {
  THEORY_EXERCISE_PROGRESS_EVENT,
  computeTopicExerciseProgressPercent,
  getPassedExerciseKeysForTopic,
  shouldPersistExercisePass,
  shouldRecordTheoryExerciseAttempt,
  writeLocalPassedExercise,
} from '@/lib/theoryExerciseProgress';
import { saveTheoryExercisePass } from '@/lib/saveTheoryExerciseProgress';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';

const TheoryLayout = ({ 
  title, 
  description, 
  level, 
  children, 
  theoryContent, 
  exercises = [],
  getExercises,
  prerequisites = [],
  enableInlinePractice = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const theoryApartadoEarly = findTheoryApartadoForTopicHref(pathname);
  const examSlugEarly = getExamUnitSlugFromPathname(pathname);
  const pathSegmentEarly = pathname?.replace(/^\/teoria\//, '').split('/')[0] ?? '';
  const needsTeoriaProgress =
    Boolean(theoryApartadoEarly) ||
    Boolean(pathSegmentEarly && isTheorySectionSlug(pathSegmentEarly));
  const needsExamProgress =
    Boolean(examSlugEarly) ||
    Boolean(pathSegmentEarly && isExamTheorySectionSlug(pathSegmentEarly));
  const needsBothProgress =
    Boolean(pathname?.startsWith('/teoria/')) && !needsTeoriaProgress && !needsExamProgress;

  const { session, userRole } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const examProgressUserId =
    needsExamProgress || needsBothProgress ? session?.user?.id : null;
  const teoriaProgressUserId =
    needsTeoriaProgress || needsBothProgress ? session?.user?.id : null;
  const { units, topicProgressByHref: examTopicProgressByHref } = useExamTheoryProgress(
    examProgressUserId,
    examProgressUserId ? session?.access_token : null,
  );
  const { units: teoriaUnits, topicProgressByHref: teoriaTopicProgressByHref } =
    useTeoriaProgress(
      teoriaProgressUserId,
      teoriaProgressUserId ? session?.access_token : null,
    );
  const examUnitSlug = examSlugEarly ?? getExamUnitSlugFromPathname(pathname);
  const sectionKey = examUnitSlug ? getSectionKeyBySlug(examUnitSlug) : null;
  const lockActive = shouldApplySequentialLock(isStudent);
  const examUnitLocked =
    lockActive &&
    examUnitSlug &&
    isExamTheorySlugLocked(examUnitSlug, units, true);
  const examUnitLockInfo = examUnitLocked
    ? getExamTheoryUnlockInfo(examUnitSlug, units, true)
    : null;
  const pathSegment = pathname?.replace(/^\/teoria\//, '').split('/')[0];
  const isSectionHub =
    pathSegment &&
    (isExamTheorySectionSlug(pathSegment) || isTheorySectionSlug(pathSegment));
  const topicHrefForLock =
    pathname?.startsWith('/teoria/') && !isSectionHub ? normalizeTopicHref(pathname) : null;
  const examTopicLocked =
    lockActive &&
    sectionKey &&
    topicHrefForLock &&
    isExamTopicHrefLocked(
      topicHrefForLock,
      sectionKey,
      examTopicProgressByHref,
      true,
    );
  const examTopicLockInfo = examTopicLocked
    ? getExamTopicUnlockInfo(
        topicHrefForLock,
        sectionKey,
        examTopicProgressByHref,
        true,
      )
    : null;
  const theoryApartado = findTheoryApartadoForTopicHref(pathname);
  const theorySectionKey = theoryApartado
    ? getTheorySectionKeyBySlug(theoryApartado)
    : null;
  const theoryApartadoLocked =
    lockActive &&
    theoryApartado &&
    isTeoriaApartadoLocked(theoryApartado, teoriaUnits, true);
  const theoryApartadoLockInfo = theoryApartadoLocked
    ? getTeoriaApartadoUnlockInfo(theoryApartado, teoriaUnits, true)
    : null;
  const theoryTopicLocked =
    lockActive &&
    theorySectionKey &&
    topicHrefForLock &&
    isTeoriaTopicHrefLocked(
      topicHrefForLock,
      theorySectionKey,
      teoriaTopicProgressByHref,
      true,
    );
  const theoryTopicLockInfo = theoryTopicLocked
    ? getTeoriaTopicUnlockInfo(
        topicHrefForLock,
        theorySectionKey,
        teoriaTopicProgressByHref,
        true,
      )
    : null;
  const topicHref = useMemo(() => {
    if (!pathname?.startsWith('/teoria/') || isSectionHub) return null;
    return normalizeTopicHref(pathname);
  }, [pathname, isSectionHub]);
  const hideExamTheoryPracticeForStudent =
    isStudent && Boolean(topicHref) && needsExamProgress && !isSectionHub;
  const primaryHandcraftedLevel = useMemo(() => getPrimaryHandcraftedLevel(level), [level]);
  const applicableLevels = useMemo(() => parseTopicLevels(level), [level]);
  const [activeTab, setActiveTab] = useState('theory');
  const [passedExerciseKeys, setPassedExerciseKeys] = useState(new Set());
  const [progressHydrated, setProgressHydrated] = useState(false);
  const [ladderStarsByLevel, setLadderStarsByLevel] = useState({});

  const exerciseTabCount = THEORY_TOPIC_LEVEL_COUNT;

  useEffect(() => {
    setActiveTab('theory');
    setPassedExerciseKeys(new Set());
    setProgressHydrated(false);
    setLadderStarsByLevel({});
  }, [title, level]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !topicHref) return;
    const refresh = () => setLadderStarsByLevel(readTheoryTopicLevelStars(userId, topicHref));
    refresh();
    window.addEventListener('theory-topic-level-stars-updated', refresh);
    return () => window.removeEventListener('theory-topic-level-stars-updated', refresh);
  }, [session?.user?.id, topicHref]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !topicHref) {
      setProgressHydrated(true);
      return undefined;
    }

    let cancelled = false;

    const hydrateLocal = () => {
      const localKeys = getPassedExerciseKeysForTopic(userId, topicHref, applicableLevels);
      setPassedExerciseKeys(localKeys);
    };

    hydrateLocal();

    (async () => {
      if (!session?.access_token) {
        if (!cancelled) setProgressHydrated(true);
        return;
      }
      try {
        const res = await fetch(
          `/api/theory-exercise-progress?topic_href=${encodeURIComponent(topicHref)}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const remoteKeys = (json.passedKeys || []).map((storageKey) => {
          const parts = String(storageKey).split('|');
          return parts[parts.length - 1];
        });
        if (cancelled) return;
        setPassedExerciseKeys((prev) => {
          const merged = new Set(prev);
          remoteKeys.forEach((key) => merged.add(key));
          return merged;
        });
      } catch {
        /* offline */
      } finally {
        if (!cancelled) setProgressHydrated(true);
      }
    })();

    const onProgressUpdate = () => hydrateLocal();
    window.addEventListener(THEORY_EXERCISE_PROGRESS_EVENT, onProgressUpdate);
    window.addEventListener('storage', onProgressUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(THEORY_EXERCISE_PROGRESS_EVENT, onProgressUpdate);
      window.removeEventListener('storage', onProgressUpdate);
    };
  }, [session?.user?.id, session?.access_token, topicHref, applicableLevels, title]);

  const handleExerciseComplete = useCallback(
    async (exerciseKey, score) => {
      if (!shouldRecordTheoryExerciseAttempt(score)) return;

      const userId = session?.user?.id;
      if (!userId || !topicHref) return;

      if (shouldPersistExercisePass(score)) {
        setPassedExerciseKeys((prev) => {
          if (prev.has(exerciseKey)) return prev;
          const next = new Set(prev);
          next.add(exerciseKey);
          return next;
        });
      }

      await saveTheoryExercisePass({
        userId,
        accessToken: session?.access_token,
        topicHref,
        topicLevelLabel: level,
        cefrLevel: defaultExerciseLevel(level),
        exerciseKey,
        score,
      });
    },
    [session, topicHref, level],
  );

  const progressPercent = useMemo(() => {
    if (!topicHref) return 0;
    const ladderPct = topicProgressPercentFromStars(ladderStarsByLevel);
    if (ladderPct > 0) return ladderPct;
    return computeTopicExerciseProgressPercent({
      passedCount: passedExerciseKeys.size,
      topicLevelLabel: level,
      exercisesPerLevel: 0,
    });
  }, [topicHref, level, passedExerciseKeys, ladderStarsByLevel, progressHydrated]);

  const isExercisePassed = useCallback(
    (exerciseKey) => passedExerciseKeys.has(exerciseKey),
    [passedExerciseKeys],
  );

  const wrapExerciseElement = useCallback(
    (exercise, index) => {
      if (!isValidElement(exercise)) return exercise;
      const exerciseKey = String(exercise.key || `exercise-${index}`);
      return cloneElement(exercise, {
        key: exerciseKey,
        isCompleted: isExercisePassed(exerciseKey),
        onComplete: (score) => handleExerciseComplete(exerciseKey, score),
      });
    },
    [handleExerciseComplete, isExercisePassed],
  );

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !topicHref) return;

    const topicId = topicHref.replace(/^\/teoria\//, '');
    saveTheoryProgress(userId, topicHref, progressPercent);
    saveTheoryProgress(userId, topicId, progressPercent);

    saveExamTheoryTopicProgress({
      userId,
      accessToken: session?.access_token,
      topicHref,
      progresoPct: progressPercent,
    });
    saveTeoriaTopicProgress({
      userId,
      accessToken: session?.access_token,
      topicHref,
      progresoPct: progressPercent,
    });
  }, [progressPercent, session, topicHref]);

  if (examUnitLocked) {
    return (
      <ExamTheoryLockedNotice
        requiredPartName={examUnitLockInfo?.requiredPrevious}
        partNumber={examUnitLockInfo?.partNumber}
      />
    );
  }

  if (examTopicLocked) {
    return (
      <ExamTheoryLockedNotice
        variant="topic"
        requiredPartName={examTopicLockInfo?.requiredPrevious}
        backHref={examUnitSlug ? `/teoria/${examUnitSlug}` : '/niveles?tab=theory'}
        backLabel={
          sectionKey ? `Back to ${sectionKey}` : 'Back to Exam Strategies'
        }
      />
    );
  }

  if (theoryApartadoLocked) {
    return (
      <ExamTheoryLockedNotice
        requiredPartName={theoryApartadoLockInfo?.requiredPrevious}
        partNumber={theoryApartadoLockInfo?.partNumber}
        backHref="/teoria"
        backLabel="Back to Theory"
      />
    );
  }

  if (theoryTopicLocked) {
    return (
      <ExamTheoryLockedNotice
        variant="topic"
        requiredPartName={theoryTopicLockInfo?.requiredPrevious}
        backHref={theoryApartado ? `/teoria/${theoryApartado}` : '/teoria'}
        backLabel={
          theorySectionKey ? `Back to ${theorySectionKey}` : 'Back to Theory'
        }
      />
    );
  }

  return (
    <div className="theory-layout-page" style={{
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        marginBottom: '2rem'
      }}>
        <div className="theory-layout-card" style={{
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: 'var(--color-text-secondary, #666)'
          }}>
            <Link href="/teoria" style={{ color: '#667eea', textDecoration: 'none' }}>
              📚 Theory
            </Link>
            <span>›</span>
            <span>{title}</span>
          </nav>

          {/* Title and Meta */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--text, #2d3748)',
              margin: '0 0 0.5rem 0',
              lineHeight: 1.2
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--color-text-secondary, #666)',
              margin: '0 0 1rem 0',
              lineHeight: 1.6
            }}>
              {description}
            </p>
            
            {/* Meta Info */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                background: '#667eea',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Level {level}
              </span>
              {prerequisites.length > 0 && (
                <span style={{
                  background: '#eef2ff',
                  color: '#4338ca',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: '1px solid #c7d2fe'
                }}>
                  📋 Requires: {prerequisites.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {!hideExamTheoryPracticeForStudent ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontWeight: '500', color: '#4a5568' }}>
                  Topic Progress
                </span>
                <span style={{ fontSize: '0.9rem', color: '#667eea' }}>
                  {progressPercent}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ) : null}

          {/* Tabs */}
          <div className="theory-tabs-row">
            <div className="theory-tabs theory-layout-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('theory')}
                className={`theory-tab-btn${activeTab === 'theory' ? ' theory-tab-btn--active' : ''}`}
              >
                <span className="theory-tab-btn__icon" aria-hidden>📖</span>
                <span>Theory</span>
              </button>
              {!hideExamTheoryPracticeForStudent ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('exercises')}
                  className={`theory-tab-btn${activeTab === 'exercises' ? ' theory-tab-btn--active' : ''}`}
                >
                  <span className="theory-tab-btn__icon" aria-hidden>🎯</span>
                  <span>Exercises</span>
                  <span
                    className="theory-tab-btn__count"
                    aria-label={`${exerciseTabCount} levels`}
                  >
                    {exerciseTabCount}
                  </span>
                </button>
              ) : null}
            </div>
          </div>
          <style jsx global>{`
            .theory-tabs-row {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 12px;
            }
            .theory-tabs {
              display: inline-flex;
              gap: 6px;
              padding: 6px;
              background: var(--color-background-secondary, #f8fafc);
              border: 1px solid var(--color-border-tertiary, #e2e8f0);
              border-radius: 14px;
            }
            .theory-tab-btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 11px 22px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-size: 0.95rem;
              font-weight: 600;
              letter-spacing: 0.01em;
              color: #475569;
              background: transparent;
              transition: background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease,
                transform 0.18s ease;
            }
            .theory-tab-btn:hover:not(.theory-tab-btn--active) {
              background: var(--card, #fff);
              color: #4338ca;
            }
            .theory-tab-btn--active {
              color: #fff;
              background: #6366f1;
              box-shadow: none;
            }
            .theory-tab-btn--active:hover {
              background: #4f46e5;
            }
            .theory-tab-btn__icon {
              font-size: 1.05rem;
              line-height: 1;
            }
            .theory-tab-btn__count {
              min-width: 22px;
              height: 22px;
              padding: 0 7px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 999px;
              font-size: 0.75rem;
              font-weight: 700;
              line-height: 1;
              background: #e0e7ff;
              color: #4338ca;
            }
            .theory-tab-btn--active .theory-tab-btn__count {
              background: rgba(255, 255, 255, 0.25);
              color: #fff;
            }
            body.reading-night-mode .theory-layout-tabs {
              background: #334155 !important;
              border-color: #64748b !important;
            }
            body.reading-night-mode .theory-layout-tabs .theory-tab-btn {
              color: #cbd5e1;
            }
            body.reading-night-mode .theory-layout-tabs .theory-tab-btn:hover:not(.theory-tab-btn--active) {
              background: #475569 !important;
              color: #e2e8f0 !important;
            }
            body.reading-night-mode .theory-layout-tabs .theory-tab-btn__count {
              background: rgba(148, 163, 184, 0.25);
              color: #e2e8f0;
            }
          `}</style>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div className="theory-layout-card" style={{
          borderRadius: '20px',
          padding: '2rem',
          minHeight: '600px'
        }}>
          {activeTab === 'theory' && (
            <TheorySectionProvider key={title}>
              <TheoryPageShell
                topicTitle={title}
                enableInlinePractice={enableInlinePractice && !hideExamTheoryPracticeForStudent}
              >
                {theoryContent}
              </TheoryPageShell>
            </TheorySectionProvider>
          )}
          
          {activeTab === 'exercises' && !hideExamTheoryPracticeForStudent && (
            <div>
              <TheoryTopicLevelsExercisePanel
                topicHref={topicHref || ''}
                topicTitle={title}
                topicLevelLabel={level}
                userId={session?.user?.id}
                accessToken={session?.access_token}
                wrapExercise={wrapExerciseElement}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          href="/teoria"
          className="theory-layout-back-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          ← Back to Theory
        </Link>
        
        {activeTab === 'theory' && topicHref && (
          <button
            onClick={() => setActiveTab('exercises')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Go to Exercises →
          </button>
        )}
      </div>
    </div>
  );
};

export default TheoryLayout;
