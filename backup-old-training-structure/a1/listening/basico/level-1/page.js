"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AudioPlayer from '@/components/AudioPlayer';
import { getExercisesByLevel } from '@/data/trainingExercises';
import { saveExerciseResult, getUserProgress, progressTracker } from '@/utils/progressTracker';
import { supabase } from '@/utils/supabaseClient';

const exercises = getExercisesByLevel('A1', 'listening', 'basico', 'level1');

export default function A1ListeningBasicoLevel1Page() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [exerciseStartTime, setExerciseStartTime] = useState(Date.now());
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const exercise = exercises[currentExercise];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Load existing progress
        const progress = {};
        for (let i = 0; i < exercises.length; i++) {
          const exProgress = await getUserProgress(user.id, exercises[i].id);
          if (exProgress) {
            progress[exercises[i].id] = exProgress;
          }
        }
        setUserProgress(progress);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    setExerciseStartTime(Date.now());
  }, [currentExercise]);

  const checkAnswer = async () => {
    if (!user) return;
    
    const isCorrect = selectedOption === exercise.correct;
    const exerciseTime = Math.round((Date.now() - exerciseStartTime) / 1000);
    const exerciseScore = isCorrect ? 100 : 0;
    
    if (isCorrect) {
      setScore(score + 1);
    }

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
      const achievements = await progressTracker.checkAchievements(user.id, {
        exerciseId: exercise.id,
        score: exerciseScore,
        timeSpent: exerciseTime
      });

      if (achievements.length > 0) {
        // Show achievements notification
        console.log('New achievements:', achievements);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    
    setShowResult(true);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedOption('');
      setShowResult(false);
    }
  };

  const resetExercise = () => {
    setCurrentExercise(0);
    setSelectedOption('');
    setShowResult(false);
    setScore(0);
    setStartTime(Date.now());
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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>🎧 Listening - Level 1</h1>
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
            <AudioPlayer
              audioUrl={exercise.audioUrl}
              transcript={exercise.transcript}
              showTranscript={false}
              onPlayStart={() => console.log('Audio started')}
              onPlayEnd={() => console.log('Audio ended')}
              className="exercise-audio"
            />
            
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
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {exercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                style={{
                  padding: "1rem",
                  backgroundColor: selectedOption === option ? "#dbeafe" : "#fff",
                  border: selectedOption === option ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "16px"
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedOption}
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
                opacity: !selectedOption ? 0.5 : 1
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
                    🎉 Congratulations! You completed Level 1!
                  </p>
                  <p style={{ marginBottom: "1rem" }}>Score: {score}/{exercises.length} ({(score/exercises.length*100).toFixed(0)}%)</p>
                  <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
                    Time spent: {Math.round((Date.now() - startTime) / 1000)} seconds
                  </p>
                  
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
                    <Link
                      href="/training/a1/listening/basico/level-2"
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
                    <Link
                      href="/training/a1/listening"
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
                      Back to Listening
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/training/a1/listening/basico"
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
            ← Back to Basic Levels
          </Link>
        </div>
      </div>
    </main>
  );
}
