"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {
    id: 1,
    type: "translation",
    word: "Hello",
    translation: "Hola",
    question: "What does 'Hello' mean in Spanish?",
    options: ["Adiós", "Hola", "Gracias", "Por favor"],
    correct: "Hola",
    explanation: "'Hello' means 'Hola' in Spanish. It's the most common way to greet someone in Spanish-speaking countries."
  },
  {
    id: 2,
    type: "translation",
    word: "Cat",
    translation: "Gato",
    question: "What does 'Cat' mean in Spanish?",
    options: ["Perro", "Gato", "Pájaro", "Pez"],
    correct: "Gato",
    explanation: "'Cat' means 'Gato' in Spanish. It's a domestic animal that many people keep as a pet."
  },
  {
    id: 3,
    type: "translation",
    word: "Book",
    translation: "Libro",
    question: "What does 'Book' mean in Spanish?",
    options: ["Libro", "Bolígrafo", "Papel", "Lápiz"],
    correct: "Libro",
    explanation: "'Book' means 'Libro' in Spanish. It's something you read, like a novel or textbook."
  },
  {
    id: 4,
    type: "translation",
    word: "Water",
    translation: "Agua",
    question: "What does 'Water' mean in Spanish?",
    options: ["Leche", "Agua", "Café", "Té"],
    correct: "Agua",
    explanation: "'Water' means 'Agua' in Spanish. It's the clear liquid we drink to stay hydrated."
  },
  {
    id: 5,
    type: "translation",
    word: "House",
    translation: "Casa",
    question: "What does 'House' mean in Spanish?",
    options: ["Casa", "Coche", "Árbol", "Flor"],
    correct: "Casa",
    explanation: "'House' means 'Casa' in Spanish. It's a building where people live with their families."
  },
  {
    id: 6,
    type: "translation",
    word: "Family",
    translation: "Familia",
    question: "What does 'Family' mean in Spanish?",
    options: ["Amigos", "Familia", "Trabajo", "Escuela"],
    correct: "Familia",
    explanation: "'Family' means 'Familia' in Spanish. It refers to your parents, siblings, and relatives."
  },
  {
    id: 7,
    type: "translation",
    word: "Food",
    translation: "Comida",
    question: "What does 'Food' mean in Spanish?",
    options: ["Bebida", "Comida", "Ropa", "Casa"],
    correct: "Comida",
    explanation: "'Food' means 'Comida' in Spanish. It's what we eat to nourish our bodies."
  },
  {
    id: 8,
    type: "translation",
    word: "Friend",
    translation: "Amigo",
    question: "What does 'Friend' mean in Spanish?",
    options: ["Enemigo", "Amigo", "Extraño", "Vecino"],
    correct: "Amigo",
    explanation: "'Friend' means 'Amigo' in Spanish. It's someone you like and spend time with."
  }
];

export default function A1VocabularyBasicoLevel1Page() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(new Set());

  const exercise = exercises[currentExercise];

  const checkAnswer = () => {
    const isCorrect = selectedOption === exercise.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
      setCompletedExercises(prev => new Set([...prev, exercise.id]));
      
      // Show celebration for streaks
      if (streak + 1 >= 3) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    } else {
      setStreak(0); // Reset streak on wrong answer
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
    setStreak(0);
    setMaxStreak(0);
    setShowCelebration(false);
    setCompletedExercises(new Set());
  };

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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>🧠 Vocabulary - Level 1</h1>
          <p style={{ color: "#64748b" }}>Exercise {currentExercise + 1} of {exercises.length}</p>
          
          {/* Stats Row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
            marginBottom: "1rem"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f0f9ff",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "1px solid #0ea5e9"
            }}>
              <span style={{ fontSize: "1.2rem" }}>🔥</span>
              <span style={{ fontWeight: "bold", color: "#0ea5e9" }}>Streak: {streak}</span>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f0fdf4",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "1px solid #22c55e"
            }}>
              <span style={{ fontSize: "1.2rem" }}>⭐</span>
              <span style={{ fontWeight: "bold", color: "#22c55e" }}>Score: {score}/{exercises.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
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

        {/* Celebration Component */}
        {showCelebration && (
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fef3c7",
            border: "2px solid #f59e0b",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
            zIndex: 1000,
            animation: "pulse 0.5s ease-in-out"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "#92400e", marginBottom: "0.5rem" }}>Amazing Streak!</h2>
            <p style={{ color: "#92400e", fontWeight: "bold" }}>🔥 {streak} correct answers in a row!</p>
          </div>
        )}

        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1rem", color: "#1e293b" }}>Exercise {exercise.id}</h2>
          
          <div style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "#374151" }}>Word Translation:</h3>
            <div style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>
              {exercise.word}
            </div>
            <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>Spanish: {exercise.translation}</p>
            <p style={{ color: "#64748b" }}>{exercise.question}</p>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            {exercise.options.map((option, index) => {
              let buttonStyle = {
                padding: "1rem",
                backgroundColor: "#fff",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "16px"
              };

              if (showResult) {
                if (option === exercise.correct) {
                  buttonStyle.backgroundColor = "#dcfce7";
                  buttonStyle.border = "2px solid #22c55e";
                  buttonStyle.color = "#166534";
                } else if (option === selectedOption && option !== exercise.correct) {
                  buttonStyle.backgroundColor = "#fef2f2";
                  buttonStyle.border = "2px solid #ef4444";
                  buttonStyle.color = "#dc2626";
                }
              } else if (selectedOption === option) {
                buttonStyle.backgroundColor = "#dbeafe";
                buttonStyle.border = "2px solid #3b82f6";
              }

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedOption(option)}
                  disabled={showResult}
                  style={buttonStyle}
                >
                  {option}
                  {showResult && option === exercise.correct && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "1.2rem" }}>✅</span>
                  )}
                  {showResult && option === selectedOption && option !== exercise.correct && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "1.2rem" }}>❌</span>
                  )}
                </button>
              );
            })}
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
                  <div style={{
                    backgroundColor: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    border: "1px solid #e2e8f0"
                  }}>
                    <p style={{ marginBottom: "0.5rem" }}>📊 <strong>Final Score:</strong> {score}/{exercises.length}</p>
                    <p style={{ marginBottom: "0.5rem" }}>🔥 <strong>Best Streak:</strong> {maxStreak}</p>
                    <p style={{ marginBottom: "0.5rem" }}>📈 <strong>Accuracy:</strong> {Math.round((score / exercises.length) * 100)}%</p>
                  </div>
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
                      cursor: "pointer",
                      marginRight: "1rem"
                    }}
                  >
                    Try Again
                  </button>
                  <Link
                    href="/training/a1/vocabulary/basico/level-2"
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
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/training/a1/vocabulary/basico"
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
