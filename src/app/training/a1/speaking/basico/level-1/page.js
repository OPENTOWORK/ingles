"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {
    id: 1,
    type: "pronunciation",
    word: "Hello",
    phonetic: "/həˈloʊ/",
    question: "How do you pronounce 'Hello'?",
    options: ["HEL-lo", "he-LO", "HEL-o", "he-lo"],
    correct: "he-LO",
    explanation: "'Hello' is pronounced with stress on the second syllable: he-LO."
  },
  {
    id: 2,
    type: "pronunciation",
    word: "Thank you",
    phonetic: "/θæŋk ju/",
    question: "How do you pronounce 'Thank you'?",
    options: ["THANK you", "thank YOU", "THANK YOU", "thank you"],
    correct: "THANK you",
    explanation: "'Thank you' has stress on the first word: THANK you."
  },
  {
    id: 3,
    type: "pronunciation",
    word: "Good morning",
    phonetic: "/ɡʊd ˈmɔːrnɪŋ/",
    question: "How do you pronounce 'Good morning'?",
    options: ["GOOD morning", "good MORNING", "GOOD MORNING", "good morning"],
    correct: "good MORNING",
    explanation: "'Good morning' has stress on 'morning': good MORNING."
  },
  {
    id: 4,
    type: "pronunciation",
    word: "Please",
    phonetic: "/pliːz/",
    question: "How do you pronounce 'Please'?",
    options: ["PLE-ase", "ple-ASE", "PLE-ASE", "ple-ase"],
    correct: "PLE-ase",
    explanation: "'Please' has stress on the first syllable: PLE-ase."
  },
  {
    id: 5,
    type: "pronunciation",
    word: "Excuse me",
    phonetic: "/ɪkˈskjuːz mi/",
    question: "How do you pronounce 'Excuse me'?",
    options: ["EX-cuse me", "ex-CUSE me", "EX-CUSE ME", "ex-cuse me"],
    correct: "ex-CUSE me",
    explanation: "'Excuse me' has stress on 'cuse': ex-CUSE me."
  }
];

export default function A1SpeakingBasicoLevel1Page() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const exercise = exercises[currentExercise];

  const checkAnswer = () => {
    const isCorrect = selectedOption === exercise.correct;
    
    if (isCorrect) {
      setScore(score + 1);
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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>🗣️ Speaking - Level 1</h1>
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
          
          <div style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "#374151" }}>Pronunciation Practice:</h3>
            <div style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>
              {exercise.word}
            </div>
            <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>Phonetic: {exercise.phonetic}</p>
            <p style={{ color: "#64748b" }}>{exercise.question}</p>
          </div>

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
                  <p style={{ marginBottom: "1rem" }}>Score: {score}/{exercises.length}</p>
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
                    href="/training/a1/speaking/basico/level-2"
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
            href="/training/a1/speaking/basico"
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



