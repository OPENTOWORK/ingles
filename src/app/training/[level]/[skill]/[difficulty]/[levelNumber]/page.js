"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AudioPlayer from '@/components/AudioPlayer';
import { getExercisesByLevel } from '@/data/trainingExercises';
import { saveExerciseResult, getUserProgress, progressTracker } from '@/utils/progressTracker';
import { supabase } from '@/utils/supabaseClient';
import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { notifyTrainingStarsUpdated } from '@/utils/trainingStarsProgress';

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
  const [stars, setStars] = useState(0); // Sistema de estrellas
  const [completedExercises, setCompletedExercises] = useState([]); // Ejercicios completados

  const exercise = exercises[currentExercise];

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
      notifyTrainingStarsUpdated();
    } catch (error) {
      console.warn('Could not save stars:', error);
    }
  }, [showResult, currentExercise, exercises.length, level, skill, difficulty, levelNumber, stars]);
  
  // Cargar ejercicios solo una vez al inicio
  useEffect(() => {
    const loadedExercises = getExercisesByLevel(level.toLowerCase(), skill, difficulty, levelKey);
    setExercises(loadedExercises);
  }, [level, skill, difficulty, levelKey]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user && exercises.length > 0) {
          // Load existing progress
          const progress = {};
          for (let i = 0; i < exercises.length; i++) {
            try {
              const exProgress = await getUserProgress(user.id, exercises[i].id);
              if (exProgress) {
                progress[exercises[i].id] = exProgress;
              }
            } catch (progressError) {
              // Silently handle individual progress loading errors
            }
          }
          setUserProgress(progress);
        }
      } catch (error) {
        // Silently handle auth errors
      } finally {
        setLoading(false);
      }
    };
    
    if (exercises.length > 0) {
      getUser();
    }
  }, [exercises]);

  useEffect(() => {
    setExerciseStartTime(Date.now());
  }, [currentExercise]);

  // Verificar que hay ejercicios disponibles
  if (!exercises || exercises.length === 0) {
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
            ← Back to {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Levels
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

      // Check for achievements
      try {
        const achievements = await progressTracker.checkAchievements(user.id, {
          exerciseId: exercise.id,
          score: exerciseScore,
          timeSpent: exerciseTime
        });

        if (achievements.length > 0) {
          // Show achievements notification
          console.log('New achievements:', achievements);
        }
      } catch (achievementError) {
        // Silently handle achievement errors
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading exercises...
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
            ← Back to {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Levels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif",
      background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
      minHeight: "100vh",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>
            🎧 {skill.charAt(0).toUpperCase() + skill.slice(1).replace(/-/g, ' ')} - Level {levelNumber.replace('level-', '')}
          </h1>
          <p style={{ color: "#64748b" }}>Exercise {currentExercise + 1} of {exercises.length}</p>
          <div style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e2e8f0",
            borderRadius: "4px",
            marginTop: "1rem"
          }}>
            <div style={{
              width: `${((currentExercise + 1) / exercises.length) * 100}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }}></div>
          </div>
        </div>

        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Exercise {exercise.id}</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
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
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '2px solid #fbbf24',
                marginBottom: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#78350f',
                textAlign: 'center'
              }}>
                {exercise.text}
              </div>
            )}
            
            {/* Mostrar palabra para vocabulary */}
            {skill === 'vocabulary' && exercise.word && (
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#ede9fe',
                borderRadius: '8px',
                border: '2px solid #a78bfa',
                marginBottom: '1rem',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#5b21b6',
                textAlign: 'center'
              }}>
                {exercise.word}
              </div>
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

          <p style={{ marginBottom: "1rem", fontWeight: "bold", color: "#1e293b" }}>{exercise.question}</p>
          
          {/* Ejercicio de tipo escribir */}
          {(exercise.type === 'write' || exercise.type === 'transformation' || exercise.type === 'error_detection' || exercise.type === 'word_formation') ? (
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={showResult}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          ) : (
            /* Ejercicio de opción múltiple */
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  disabled={showResult}
                  style={{
                    padding: "1rem",
                    backgroundColor: selectedOption === option ? "#dbeafe" : "#fff",
                    border: selectedOption === option ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: showResult ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "16px"
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={exercise.type === 'write' ? !writtenAnswer.trim() : !selectedOption}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "1rem 2rem",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "1rem",
                opacity: (exercise.type === 'write' ? !writtenAnswer.trim() : !selectedOption) ? 0.5 : 1
              }}
            >
              Check Answer
            </button>
          )}

          {showResult && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              border: "1px solid #0ea5e9"
            }}>
              <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {selectedOption === exercise.correct ? "✅ Correct!" : "❌ Incorrect"}
              </p>
              <p style={{ fontSize: "14px", color: "#64748b" }}>{exercise.explanation}</p>
              {currentExercise < exercises.length - 1 ? (
                <button
                  onClick={nextExercise}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginTop: "1rem"
                  }}
                >
                  Next Exercise
                </button>
              ) : (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    🎉 Congratulations! You completed Level {levelNumber.replace('level-', '')}!
                  </p>
                  
                  {/* Mostrar estrellas obtenidas */}
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: "2.5rem",
                          color: star <= stars ? "#ffd700" : "#d1d5db",
                          opacity: star <= stars ? 1 : 0.3,
                          transition: "color 0.3s ease"
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  
                  <p style={{ marginBottom: "1rem" }}>Score: {score}/{exercises.length} ({(score/exercises.length*100).toFixed(0)}%)</p>
                  <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
                    Time spent: {Math.round((Date.now() - startTime) / 1000)} seconds
                  </p>
                  
                  {/* Mensaje de rendimiento */}
                  {stars === 3 && (
                    <p style={{ marginBottom: "1rem", color: "#059669", fontWeight: "bold", fontSize: "1.1rem" }}>
                      🌟 Perfect! You got 100% correct! All 3 stars earned!
                    </p>
                  )}
                  {stars === 2 && (
                    <p style={{ marginBottom: "1rem", color: "#d97706", fontWeight: "bold", fontSize: "1.1rem" }}>
                      ⭐⭐ Great job! 80-99% correct - 2 stars earned!
                    </p>
                  )}
                  {stars === 1 && (
                    <p style={{ marginBottom: "1rem", color: "#ea580c", fontWeight: "bold", fontSize: "1.1rem" }}>
                      ⭐ Good effort! 60-79% correct - 1 star earned!
                    </p>
                  )}
                  {stars === 0 && (
                    <p style={{ marginBottom: "1rem", color: "#6b7280", fontWeight: "bold", fontSize: "1.1rem" }}>
                      💪 Keep practicing! You need 60% or more to earn stars!
                    </p>
                  )}
                  
                  {/* Achievement notifications */}
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.9rem", color: "#059669" }}>
                      ✅ Progress saved automatically
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                      onClick={resetExercise}
                      style={{
                        backgroundColor: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.75rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Try Again
                    </button>
                    {getNextLevel() && (
                      <Link
                        href={`/training/${level}/${skill}/${difficulty}/${getNextLevel()}`}
                        style={{
                          backgroundColor: "#10b981",
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
                        Next Level
                      </Link>
                    )}
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
                      Back to {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "2rem" }}>
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
            ← Back to {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Levels
          </Link>
        </div>
      </div>
    </main>
  );
}
