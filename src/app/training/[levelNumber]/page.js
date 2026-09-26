"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';
import TrainingGapFillExercise from '@/components/training/TrainingGapFillExercise';
import TrainingStarsCelebration from '@/components/training/TrainingStarsCelebration';
import { TrainingLivesEmpty, TrainingLivesMeter } from '@/components/training/TrainingLivesMeter';
import { useUserRole } from '@/context/UserRoleContext';
import { useTrainingLives } from '@/hooks/useTrainingLives';
import {
  getTrainingPathCurriculum,
  getTrainingPathLevelCount,
  getLevelTopic,
} from '@/data/trainingPathCurriculum';
import { getPathReview, buildReviewExercise } from '@/data/trainingReviews';
import { isTrainingLevelLocked, isTrainingReviewLocked } from '@/lib/trainingPathUnlock';
import { saveExerciseResult, getUserProgressForExercises, progressTracker } from '@/utils/progressTracker';
import { supabase } from '@/utils/supabaseClient';
import {
  normalizeTrainingCefr,
  normalizeTrainingDifficulty,
  notifyTrainingStarsUpdated,
  trainingHomePath,
  trainingNodePath,
} from '@/utils/trainingStarsProgress';
import styles from './page.module.css';

const TRAINING_SKILL = 'use-of-english';

export default function ExercisePage({ params }) {
  const { levelNumber } = params;
  const searchParams = useSearchParams();
  const level = normalizeTrainingCefr(searchParams.get('cefr'));
  const skill = TRAINING_SKILL;
  const difficulty = normalizeTrainingDifficulty(searchParams.get('difficulty'));
  const homeHref = trainingHomePath(difficulty, level);
  const router = useRouter();

  useEffect(() => {
    const isLevel = /^level-\d+$/.test(levelNumber || '');
    const isReview = /^review-\d+$/.test(levelNumber || '');
    if (!isLevel && !isReview) {
      router.replace(homeHref);
    }
  }, [levelNumber, router, homeHref]);
  const { userRole } = useUserRole();
  const trainingLives = useTrainingLives();
  const spendingLifeRef = useRef(false);
  const [lifeError, setLifeError] = useState('');
  
  // Convertir level-1 a level1 para la función getExercisesByLevel
  const levelKey = levelNumber.replace('level-', 'level');
  
  // Fijar los ejercicios una sola vez al montar el componente
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [exerciseStartTime, setExerciseStartTime] = useState(Date.now());
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [exercisesReady, setExercisesReady] = useState(false);
  const [stars, setStars] = useState(0); // Sistema de estrellas
  const [completedExercises, setCompletedExercises] = useState([]); // Ejercicios completados
  const [celebration, setCelebration] = useState(null);
  const celebrationShownRef = useRef(false);

  const exercise = exercises[currentExercise];
  const levelNumInt = parseInt(levelNumber.replace('level-', ''), 10) || 1;
  const curriculum = useMemo(
    () => getTrainingPathCurriculum(level, difficulty, skill),
    [level, difficulty, skill],
  );
  const pathLevelCount = curriculum.totalLevels ?? getTrainingPathLevelCount(level, difficulty, skill);
  const reviewNum = Number((/^review-(\d+)$/.exec(levelNumber || '') || [])[1]) || 0;
  const review = useMemo(
    () => (reviewNum ? getPathReview(curriculum.sections, reviewNum) : null),
    [curriculum, reviewNum],
  );
  const topicLabel = review ? review.sectionTitle : getLevelTopic(levelNumInt, curriculum);
  const skillLabel = review ? 'Review' : 'Grammar';
  const progressPct = exercises.length
    ? Math.round(((currentExercise + 1) / exercises.length) * 100)
    : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `stars_${level}_${skill}_${difficulty}`;
      const savedStars = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (reviewNum) {
        if (!review || isTrainingReviewLocked(review, savedStars, userRole)) {
          router.replace(homeHref);
        }
        return;
      }
      const levelNum = parseInt(levelNumber.replace('level-', ''), 10);
      if (isTrainingLevelLocked(levelNum, savedStars, userRole, pathLevelCount)) {
        router.replace(homeHref);
      }
    } catch {
      /* ignore */
    }
  }, [level, skill, difficulty, levelNumber, userRole, router, pathLevelCount, review, reviewNum, homeHref]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showResult || exercises.length === 0) return;
    if (currentExercise !== exercises.length - 1) return;
    if (celebrationShownRef.current) return;

    try {
      const storageKey = `stars_${level}_${skill}_${difficulty}`;
      const savedStars = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const previous = Number(savedStars[levelNumber]) || 0;

      if (previous >= stars) return;

      savedStars[levelNumber] = stars;
      localStorage.setItem(storageKey, JSON.stringify(savedStars));
      notifyTrainingStarsUpdated(storageKey);
      celebrationShownRef.current = true;
      setCelebration({
        stars,
        levelNum: parseInt(levelNumber.replace('level-', ''), 10) || 1,
        improved: stars > previous,
      });
    } catch (error) {
      console.warn('Could not save stars:', error);
    }
  }, [showResult, currentExercise, exercises.length, level, skill, difficulty, levelNumber, stars]);
  
  useEffect(() => {
    let cancelled = false;
    setExercisesReady(false);
    setLoading(true);

    (async () => {
      try {
        const loadedExercises = reviewNum
          ? ((await buildReviewExercise(review, level, skill, difficulty))?.items || []).map((item, index) => ({
              ...item,
              id: reviewNum * 100000 + index + 1,
            }))
          : await (async () => {
              const { loadExercisesByLevel } = await import('@/data/trainingExercises');
              return loadExercisesByLevel(level.toLowerCase(), skill, difficulty, levelKey);
            })();
        if (cancelled) return;
        setExercises(loadedExercises);
        setExercisesReady(true);
        setLoading(false);

        void (async () => {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (cancelled) return;
            setUser(authUser);

            if (authUser && loadedExercises.length > 0) {
              const ids = loadedExercises.map((ex) => ex.id);
              const progress = await getUserProgressForExercises(authUser.id, ids);
              if (!cancelled) setUserProgress(progress);
            }
          } catch {
            /* progress is optional — exercises already visible */
          }
        })();
      } catch {
        if (!cancelled) {
          setExercises([]);
          setExercisesReady(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [level, skill, difficulty, levelKey, review, reviewNum]);

  useEffect(() => {
    setExerciseStartTime(Date.now());
  }, [currentExercise]);

  if (exercisesReady && (!exercises || exercises.length === 0)) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <h1 className={styles.emptyTitle}>No exercises available</h1>
          <p className={styles.emptyText}>
            {level === 'b2' && difficulty === 'basico'
              ? `No exercises found for level ${levelNumber.replace('level-', '')}`
              : 'Exercises for this level are not ready yet.'}
          </p>
          <Link href={homeHref} className={styles.emptyBtn}>
            ← Back to Training
          </Link>
        </div>
      </div>
    );
  }

  const checkAnswer = async () => {
    if (!user) return;
    
    // Verificar la respuesta según el tipo de ejercicio
    let isCorrect = false;
    if (exercise.type === 'write') {
      // Para ejercicios de escritura, comparar sin distinguir mayúsculas/minúsculas
      isCorrect = writtenAnswer.trim().toLowerCase() === exercise.correct.toLowerCase();
    } else {
      // Para ejercicios de opción múltiple
      isCorrect = selectedOption === exercise.correct;
    }
    const exerciseTime = Math.round((Date.now() - exerciseStartTime) / 1000);
    const exerciseScore = isCorrect ? 100 : 0;

    if (!isCorrect) {
      if (trainingLives.loading || spendingLifeRef.current) return;
      if (!trainingLives.unlimited) {
        if (trainingLives.outOfLives) return;
        spendingLifeRef.current = true;
        const result = await trainingLives.loseLife();
        spendingLifeRef.current = false;
        if (!(result?.unlimited || result?.spent)) {
          if (result?.error) setLifeError('Could not update your lives. Try again.');
          return;
        }
      }
    }

    // Actualizar ejercicios completados
    const newCompletedExercises = [...completedExercises, {
      id: exercise.id,
      correct: isCorrect,
      time: exerciseTime
    }];
    setCompletedExercises(newCompletedExercises);

    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Calcular estrellas basado en el rendimiento
    const correctAnswers = newCompletedExercises.filter(ex => ex.correct).length;
    const totalAnswers = newCompletedExercises.length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    let newStars = 0;
    if (accuracy === 100) newStars = 3; // 3 estrellas: 100% perfecto
    else if (accuracy >= 80) newStars = 2; // 2 estrellas: 80-99%
    else if (accuracy >= 60) newStars = 1; // 1 estrella: 60-79%
    // 0 estrellas: menos del 60%
    
    setStars(newStars);

    // Save progress
    try {
      const existingProgress = userProgress[exercise.id];
      const attempts = existingProgress ? existingProgress.attempts + 1 : 1;
      
      await saveExerciseResult(user.id, exercise.id, exerciseScore, exerciseTime, attempts);
      
      // Update local progress
      setUserProgress(prev => ({
        ...prev,
        [exercise.id]: {
          score: exerciseScore,
          time_spent: exerciseTime,
          attempts: attempts,
          completed_at: new Date().toISOString()
        }
      }));

      if (currentExercise === exercises.length - 1) {
        void progressTracker
          .checkAchievements(user.id, {
            exerciseId: exercise.id,
            score: exerciseScore,
            timeSpent: exerciseTime,
          })
          .catch(() => {});
      }
    } catch (error) {
      // Solo mostrar error si es crítico, no para problemas de conexión menores
      if (!error.message?.includes('Failed to fetch') && !error.message?.includes('Network')) {
        console.warn('Progress save warning:', error.message);
      }
    }
    
    setShowResult(true);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedOption('');
      setWrittenAnswer('');
      setShowResult(false);
    }
  };

  const resetExercise = () => {
    setCurrentExercise(0);
    setSelectedOption('');
    setWrittenAnswer('');
    setShowResult(false);
    setScore(0);
    setStartTime(Date.now());
    setStars(0);
    setCompletedExercises([]);
    setCelebration(null);
    celebrationShownRef.current = false;
  };

  // Función para obtener el siguiente nivel
  const getNextLevel = () => {
    const currentLevelNum = parseInt(levelNumber.replace('level-', ''));
    if (currentLevelNum < pathLevelCount) {
      return `level-${currentLevelNum + 1}`;
    }
    return null;
  };

  if (loading || !exercisesReady) {
    return (
      <div className={styles.loadingPage}>Loading…</div>
    );
  }

  // Niveles con huecos escritos: runner propio (dos intentos, respuestas aceptadas y repaso).
  if (exercise?.type === 'gap_fill') {
    return (
      <TrainingGapFillExercise
        exercise={{
          exerciseId: exercise.exerciseId,
          instruction: exercise.instruction,
          items: exercises,
        }}
        sectionTitle={review ? 'Review' : curriculum.levelMap[levelNumInt]?.section?.title || skillLabel}
        topicLabel={topicLabel}
        levelNumber={levelNumber}
        levelNum={review ? review.n : levelNumInt}
        completeLabel={review ? `Review ${review.n}` : ''}
        sessionSize={review ? 20 : 10}
        backHref={homeHref}
        cefrLevel={level}
        skill={skill}
        difficulty={difficulty}
        userId={user?.id || null}
        trainingLives={trainingLives}
      />
    );
  }

  // Verificación adicional para asegurar que exercise existe
  if (!exercise) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <h1 className={styles.emptyTitle}>Exercise not found</h1>
          <p className={styles.emptyText}>The requested exercise could not be loaded.</p>
          <Link href={homeHref} className={styles.emptyBtn}>
            ← Back to Training
          </Link>
        </div>
      </div>
    );
  }

  if (trainingLives.outOfLives && !showResult) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.card}>
            <TrainingLivesEmpty
              backHref={homeHref}
              nextLifeAt={trainingLives.nextLifeAt}
              regenHours={trainingLives.regenHours}
            />
          </div>
        </div>
      </main>
    );
  }

  const isCorrectAnswer =
    exercise.type === 'write' || exercise.type === 'transformation'
      ? writtenAnswer.trim().toLowerCase() === String(exercise.correct || '').toLowerCase()
      : selectedOption === exercise.correct;

  return (
    <main className={styles.page}>
      {celebration ? (
        <TrainingStarsCelebration
          stars={celebration.stars}
          levelNum={celebration.levelNum}
          topicLabel={topicLabel}
          improved={celebration.improved}
          onClose={() => setCelebration(null)}
        />
      ) : null}
      <div className={styles.shell}>
        <div className={styles.card}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              {topicLabel}
            </p>
            <h1 className={styles.title}>{skillLabel}</h1>
            <p className={styles.subtitle}>
              Level {levelNumInt} · Question {currentExercise + 1} of {exercises.length}
            </p>
            <TrainingLivesMeter
              loading={trainingLives.loading}
              unlimited={trainingLives.unlimited}
              lives={trainingLives.lives}
              max={trainingLives.max}
              nextLifeAt={trainingLives.nextLifeAt}
            />
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </header>

          <div className={styles.body}>
          <div style={{ marginBottom: "1.25rem" }}>
            {/* Mostrar AudioPlayer solo para listening */}
            {skill === 'listening' && exercise.audioUrl && (
              <AudioPlayer
                audioUrl={exercise.audioUrl}
                transcript={exercise.transcript}
                showTranscript={false}
                onPlayStart={() => console.log('Audio started')}
                onPlayEnd={() => console.log('Audio ended')}
                className="exercise-audio"
              />
            )}
            
            {/* Mostrar texto para reading */}
            {skill === 'reading' && exercise.text && (
              <div className={styles.passage}>
                {exercise.text}
              </div>
            )}
            
            {/* Mostrar texto con blank para use-of-english */}
            {skill === 'use-of-english' && exercise.text && (
              <div className={styles.context}>{exercise.text}</div>
            )}

            {skill === 'vocabulary' && exercise.word && (
              <div className={styles.contextVocab}>{exercise.word}</div>
            )}
            
            {/* Mostrar situación para speaking */}
            {skill === 'speaking' && exercise.situation && (
              <div className={styles.situation}>
                <strong>Situation:</strong> {exercise.situation}
              </div>
            )}
            
            {/* Mostrar prompt para writing */}
            {skill === 'writing' && exercise.prompt && (
              <div className={styles.task}>
                <strong>Task:</strong> {exercise.prompt}
              </div>
            )}
            
            {/* Progress indicator for this exercise */}
            {userProgress[exercise.id] && (
              <div className={styles.prior}>
                <strong>Previous attempt:</strong> {userProgress[exercise.id].score}% 
                ({userProgress[exercise.id].attempts} attempt{userProgress[exercise.id].attempts > 1 ? 's' : ''})
              </div>
            )}
          </div>

          <p className={styles.question}>{exercise.question}</p>

          {(exercise.type === 'write' ||
            exercise.type === 'transformation' ||
            exercise.type === 'error_detection' ||
            exercise.type === 'word_formation') ? (
            <input
              type="text"
              className={styles.input}
              value={writtenAnswer}
              onChange={(e) => setWrittenAnswer(e.target.value)}
              placeholder="Type your answer…"
              disabled={showResult}
            />
          ) : (
            <div className={styles.options}>
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  disabled={showResult}
                  className={`${styles.option}${selectedOption === option ? ` ${styles.optionSelected}` : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {!showResult && (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={checkAnswer}
              disabled={
                trainingLives.loading ||
                Boolean(trainingLives.error) ||
                (exercise.type === 'write' || exercise.type === 'transformation'
                  ? !writtenAnswer.trim()
                  : !selectedOption)
              }
            >
              Check answer
            </button>
          )}

          {lifeError || trainingLives.error ? (
            <p className={styles.feedbackText} role="alert">
              Could not update your lives. Try again.
            </p>
          ) : null}

          {showResult && (
            <div className={styles.feedback}>
              <p className={styles.feedbackTitle}>
                {isCorrectAnswer ? '✓ Correct' : '✗ Not quite'}
              </p>
              <p className={styles.feedbackText}>{exercise.explanation}</p>
              {currentExercise < exercises.length - 1 ? (
                <div className={styles.actions}>
                  {trainingLives.outOfLives ? (
                    <TrainingLivesEmpty
                      backHref={homeHref}
                      nextLifeAt={trainingLives.nextLifeAt}
                      regenHours={trainingLives.regenHours}
                    />
                  ) : (
                    <button type="button" className={styles.btnNext} onClick={nextExercise}>
                      Next question →
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <p className={styles.feedbackTitle}>
                    Level {levelNumInt} complete — {topicLabel}
                  </p>
                  <div className={styles.stars}>
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={star <= stars ? styles.starOn : styles.starOff}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className={styles.feedbackText}>
                    Score: {score}/{exercises.length} (
                    {exercises.length ? ((score / exercises.length) * 100).toFixed(0) : 0}%)
                  </p>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnRetry} onClick={resetExercise}>
                      Try again
                    </button>
                    {getNextLevel() && (
                      <Link
                        href={trainingNodePath('/training', getNextLevel(), difficulty, level)}
                        className={styles.btnNext}
                      >
                        Next level →
                      </Link>
                    )}
                    <Link
                      href={homeHref}
                      className={styles.btnBack}
                    >
                      Back to map
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        <footer className={styles.footer}>
          <Link href={homeHref} className={styles.btnBack}>
            ← Back to levels
          </Link>
        </footer>
      </div>
    </main>
  );
}
