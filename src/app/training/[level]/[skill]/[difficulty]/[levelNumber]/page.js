"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AudioPlayer from '@/components/AudioPlayer';
import { getTrainingPathCurriculum, getLevelTopic } from '@/data/trainingPathCurriculum';
import { saveExerciseResult, getUserProgressForExercises, progressTracker } from '@/utils/progressTracker';
import { supabase } from '@/utils/supabaseClient';
import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { notifyTrainingStarsUpdated } from '@/utils/trainingStarsProgress';
import styles from './page.module.css';

const SKILL_LABELS = {
  'use-of-english': 'Grammar & vocabulary',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
  speaking: 'Speaking',
  writing: 'Writing',
};

const DIFFICULTY_LABELS = {
  basico: 'Basic',
  intermedio: 'Intermediate',
  avanzado: 'Advanced',
};

export default function ExercisePage({ params }) {
  const { level, skill, difficulty, levelNumber } = params;
  
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

  const exercise = exercises[currentExercise];
  const levelNumInt = parseInt(levelNumber.replace('level-', ''), 10) || 1;
  const curriculum = useMemo(
    () => getTrainingPathCurriculum(level, difficulty, skill),
    [level, difficulty, skill],
  );
  const topicLabel = getLevelTopic(levelNumInt, curriculum);
  const skillLabel = SKILL_LABELS[skill] || skill.replace(/-/g, ' ');
  const progressPct = exercises.length
    ? Math.round(((currentExercise + 1) / exercises.length) * 100)
    : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showResult || exercises.length === 0) return;
    if (currentExercise !== exercises.length - 1) return;

    try {
      const storageKey = `stars_${level}_${skill}_${difficulty}`;
      const savedStars = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const previous = Number(savedStars[levelNumber]) || 0;

      if (previous >= stars) return;

      savedStars[levelNumber] = stars;
      localStorage.setItem(storageKey, JSON.stringify(savedStars));
      notifyTrainingStarsUpdated(storageKey);
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
        const { loadExercisesByLevel } = await import('@/data/trainingExercises');
        const loadedExercises = await loadExercisesByLevel(
          level.toLowerCase(),
          skill,
          difficulty,
          levelKey,
        );
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
  }, [level, skill, difficulty, levelKey]);

  useEffect(() => {
    setExerciseStartTime(Date.now());
  }, [currentExercise]);

  if (exercisesReady && (!exercises || exercises.length === 0)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        textAlign: 'center',
        padding: '2rem',
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(to right, #f0f8ff, #e6f0ff)"
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          maxWidth: "500px"
        }}>
          <h1 style={{ color: "#e74c3c", marginBottom: "1rem" }}>⚠️ No Exercises Available</h1>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            No exercises found for {level.toUpperCase()} - {skill} - {difficulty} - Level {levelNumber.replace('level-', '')}
          </p>
          <Link
            href={`/training/${level}/${skill}/${difficulty}`}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            ← Back to {DIFFICULTY_LABELS[difficulty] || difficulty} levels
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
  };

  // Función para obtener el siguiente nivel
  const getNextLevel = () => {
    const currentLevelNum = parseInt(levelNumber.replace('level-', ''));
    if (currentLevelNum < TRAINING_LEVEL_COUNT) {
      return `level-${currentLevelNum + 1}`;
    }
    return null;
  };

  if (loading || !exercisesReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading…
      </div>
    );
  }

  // Verificación adicional para asegurar que exercise existe
  if (!exercise) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        textAlign: 'center',
        padding: '2rem',
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(to right, #f0f8ff, #e6f0ff)"
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          maxWidth: "500px"
        }}>
          <h1 style={{ color: "#e74c3c", marginBottom: "1rem" }}>⚠️ Exercise Not Found</h1>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            The requested exercise could not be loaded.
          </p>
          <Link
            href={`/training/${level}/${skill}/${difficulty}`}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            ← Back to {DIFFICULTY_LABELS[difficulty] || difficulty} levels
          </Link>
        </div>
      </div>
    );
  }

  const isCorrectAnswer =
    exercise.type === 'write' || exercise.type === 'transformation'
      ? writtenAnswer.trim().toLowerCase() === String(exercise.correct || '').toLowerCase()
      : selectedOption === exercise.correct;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              {level.toUpperCase()} · {DIFFICULTY_LABELS[difficulty] || difficulty} · {topicLabel}
            </p>
            <h1 className={styles.title}>{skillLabel}</h1>
            <p className={styles.subtitle}>
              Level {levelNumInt} · Question {currentExercise + 1} of {exercises.length}
            </p>
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
              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
                lineHeight: '1.6',
                color: '#374151'
              }}>
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
              <div style={{
                padding: '1rem',
                backgroundColor: '#fce7f3',
                borderRadius: '8px',
                border: '2px solid #f9a8d4',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: '#831843'
              }}>
                <strong>Situation:</strong> {exercise.situation}
              </div>
            )}
            
            {/* Mostrar prompt para writing */}
            {skill === 'writing' && exercise.prompt && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                border: '2px solid #60a5fa',
                marginBottom: '1rem',
                color: '#1e3a8a'
              }}>
                <strong>Task:</strong> {exercise.prompt}
              </div>
            )}
            
            {/* Progress indicator for this exercise */}
            {userProgress[exercise.id] && (
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: '#0369a1'
              }}>
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
                exercise.type === 'write' || exercise.type === 'transformation'
                  ? !writtenAnswer.trim()
                  : !selectedOption
              }
            >
              Check answer
            </button>
          )}

          {showResult && (
            <div className={styles.feedback}>
              <p className={styles.feedbackTitle}>
                {isCorrectAnswer ? '✓ Correct' : '✗ Not quite'}
              </p>
              <p className={styles.feedbackText}>{exercise.explanation}</p>
              {currentExercise < exercises.length - 1 ? (
                <div className={styles.actions}>
                  <button type="button" className={styles.btnNext} onClick={nextExercise}>
                    Next question →
                  </button>
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
                        href={`/training/${level}/${skill}/${difficulty}/${getNextLevel()}`}
                        className={styles.btnNext}
                      >
                        Next level →
                      </Link>
                    )}
                    <Link
                      href={`/training/${level}/${skill}/${difficulty}`}
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
          <Link href={`/training/${level}/${skill}/${difficulty}`} className={styles.btnBack}>
            ← Back to levels
          </Link>
        </footer>
      </div>
    </main>
  );
}
