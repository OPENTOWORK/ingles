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
import TheoryExerciseLevelFilter from '@/components/theory/TheoryExerciseLevelFilter';
import {
  defaultExerciseLevel,
  getPrimaryHandcraftedLevel,
  parseTopicLevels,
} from '@/lib/theoryExerciseLevelConfig';
import {
  THEORY_EXERCISE_PROGRESS_EVENT,
  computeTopicExerciseProgressPercent,
  getPassedExerciseKeysForTopic,
  shouldPersistExercisePass,
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
  estimatedTime = "30 min",
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
  const primaryHandcraftedLevel = useMemo(() => getPrimaryHandcraftedLevel(level), [level]);
  const applicableLevels = useMemo(() => parseTopicLevels(level), [level]);
  const [selectedExerciseLevel, setSelectedExerciseLevel] = useState(() =>
    defaultExerciseLevel(level),
  );
  const [activeTab, setActiveTab] = useState('theory');
  const [passedExerciseKeys, setPassedExerciseKeys] = useState(new Set());
  const [loadedExercises, setLoadedExercises] = useState(null);
  const [loadedExerciseLevel, setLoadedExerciseLevel] = useState(null);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [progressHydrated, setProgressHydrated] = useState(false);

  const exerciseCount = useMemo(() => {
    if (Array.isArray(exercises) && exercises.length > 0) return exercises.length;
    if (getExercises) return 20;
    return 0;
  }, [exercises, getExercises]);

  useEffect(() => {
    setActiveTab('theory');
    setLoadedExercises(null);
    setLoadedExerciseLevel(null);
    setExercisesLoading(false);
    setSelectedExerciseLevel(defaultExerciseLevel(level));
    setPassedExerciseKeys(new Set());
    setProgressHydrated(false);
  }, [title, level]);

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

  const resolveExercises = useCallback(
    (exerciseLevel) => {
      if (typeof getExercises === 'function') {
        if (getExercises.length >= 2) {
          return getExercises(exerciseLevel, primaryHandcraftedLevel);
        }
        return getExercises(exerciseLevel);
      }
      return exercises;
    },
    [getExercises, exercises, primaryHandcraftedLevel],
  );

  useEffect(() => {
    if (activeTab !== 'exercises') return undefined;
    if (loadedExercises && loadedExerciseLevel === selectedExerciseLevel) return undefined;

    let cancelled = false;
    setExercisesLoading(true);

    const run = () => {
      if (cancelled) return;
      try {
        setLoadedExercises(resolveExercises(selectedExerciseLevel));
        setLoadedExerciseLevel(selectedExerciseLevel);
      } finally {
        if (!cancelled) setExercisesLoading(false);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [activeTab, loadedExercises, loadedExerciseLevel, resolveExercises, selectedExerciseLevel]);

  const handleExerciseComplete = useCallback(
    async (exerciseKey, score) => {
      if (!shouldPersistExercisePass(score)) return;

      const userId = session?.user?.id;
      if (!userId || !topicHref) return;

      setPassedExerciseKeys((prev) => {
        if (prev.has(exerciseKey)) return prev;
        const next = new Set(prev);
        next.add(exerciseKey);
        return next;
      });

      writeLocalPassedExercise(userId, topicHref, selectedExerciseLevel, exerciseKey);

      await saveTheoryExercisePass({
        userId,
        accessToken: session?.access_token,
        topicHref,
        topicLevelLabel: level,
        cefrLevel: selectedExerciseLevel,
        exerciseKey,
        score,
      });
    },
    [session, topicHref, selectedExerciseLevel, level],
  );

  const progressPercent = useMemo(() => {
    if (!topicHref) return 0;
    return computeTopicExerciseProgressPercent({
      passedCount: passedExerciseKeys.size,
      topicLevelLabel: level,
    });
  }, [topicHref, level, passedExerciseKeys, progressHydrated]);

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

  const displayExercises = loadedExercises ?? (Array.isArray(exercises) ? exercises : []);

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
        backHref={examUnitSlug ? `/teoria/${examUnitSlug}` : '/niveles#exam-theory'}
        backLabel={
          sectionKey ? `Back to ${sectionKey}` : 'Back to Exam theory'
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: '#666'
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
              color: '#2d3748',
              margin: '0 0 0.5rem 0',
              lineHeight: 1.2
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
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
              <span style={{
                background: '#f7fafc',
                color: '#4a5568',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0'
              }}>
                ⏱️ {estimatedTime}
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

          {/* Tabs */}
          <div className="theory-tabs-row">
            <div className="theory-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('theory')}
                className={`theory-tab-btn${activeTab === 'theory' ? ' theory-tab-btn--active' : ''}`}
              >
                <span className="theory-tab-btn__icon" aria-hidden>📖</span>
                <span>Theory</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exercises')}
                className={`theory-tab-btn${activeTab === 'exercises' ? ' theory-tab-btn--active' : ''}`}
              >
                <span className="theory-tab-btn__icon" aria-hidden>🎯</span>
                <span>Exercises</span>
                {exerciseCount > 0 && (
                  <span className="theory-tab-btn__count" aria-label={`${exerciseCount} exercises`}>
                    {exerciseCount}
                  </span>
                )}
              </button>
            </div>

            {exerciseCount > 0 ? (
              <TheoryExerciseLevelFilter
                selectedLevel={selectedExerciseLevel}
                onChange={(nextLevel) => {
                  setLoadedExercises(null);
                  setLoadedExerciseLevel(null);
                  setSelectedExerciseLevel(nextLevel);
                }}
              />
            ) : null}
          </div>
          <style jsx>{`
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
              background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.05);
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
              background: rgba(255, 255, 255, 0.9);
              color: #4338ca;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
            }
            .theory-tab-btn--active {
              color: #fff;
              background: linear-gradient(135deg, #667eea 0%, #5b6fd6 50%, #764ba2 100%);
              box-shadow: 0 4px 16px rgba(102, 126, 234, 0.45), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            .theory-tab-btn--active:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
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
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: #fff;
              box-shadow: 0 2px 6px rgba(102, 126, 234, 0.35);
            }
            .theory-tab-btn--active .theory-tab-btn__count {
              background: rgba(255, 255, 255, 0.28);
              box-shadow: none;
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
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          minHeight: '600px'
        }}>
          {activeTab === 'theory' && (
            <TheorySectionProvider key={title}>
              <TheoryPageShell topicTitle={title} enableInlinePractice={enableInlinePractice}>
                {theoryContent}
              </TheoryPageShell>
            </TheorySectionProvider>
          )}
          
          {activeTab === 'exercises' && (
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎯 Practice Exercises
              </h2>
              <p style={{
                margin: '0 0 1.5rem',
                color: '#64748b',
                fontSize: '0.92rem',
              }}>
                Nivel {selectedExerciseLevel} · 20 ejercicios
              </p>
              
              {exercisesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }} role="status">
                  <span className="route-loading__spinner" aria-hidden="true" style={{ display: 'inline-block', marginBottom: '1rem' }} />
                  <p style={{ margin: 0 }}>Loading exercises…</p>
                </div>
              ) : displayExercises.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <p>No exercises are available for this topic yet.</p>
                  <p>Interactive exercises coming soon!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {displayExercises.map((exercise, index) => (
                    <div key={exercise.key || index}>
                      {wrapExerciseElement(exercise, index)}
                    </div>
                  ))}
                </div>
              )}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          ← Back to Theory
        </Link>
        
        {activeTab === 'theory' && exerciseCount > 0 && (
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
