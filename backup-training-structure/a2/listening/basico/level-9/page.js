"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {
    id: 1,
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["I would rather stay home tonight", "I would rather go out tonight", "I would rather eat here", "I would rather sleep early"],
    correct: "I would rather stay home tonight",
    explanation: "The audio says 'I would rather stay home tonight' - expressing preference using 'would rather'."
  },
  {
    id: 2,
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["I had better finish this work", "I had better eat lunch", "I had better sleep now", "I had better play later"],
    correct: "I had better finish this work",
    explanation: "The audio says 'I had better finish this work' - expressing advice or necessity using 'had better'."
  },
  {
    id: 3,
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["I used to play tennis every week", "I used to work here", "I used to study here", "I used to live here"],
    correct: "I used to play tennis every week",
    explanation: "The audio says 'I used to play tennis every week' - talking about past habits using 'used to'."
  },
  {
    id: 4,
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["I am used to working late", "I am used to eating early", "I am used to sleeping late", "I am used to playing games"],
    correct: "I am used to working late",
    explanation: "The audio says 'I am used to working late' - expressing familiarity with something using 'be used to'."
  },
  {
    id: 5,
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["I look forward to seeing you tomorrow", "I look forward to eating", "I look forward to sleeping", "I look forward to playing"],
    correct: "I look forward to seeing you tomorrow",
    explanation: "The audio says 'I look forward to seeing you tomorrow' - expressing anticipation using 'look forward to'."
  }
];

export default function A2ListeningBasicoLevel9Page() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const exercise = exercises[currentExercise];

  const playAudio = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>🎧 Listening - Level 9</h1>
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
            <button
              onClick={playAudio}
              disabled={isPlaying}
              style={{
                backgroundColor: isPlaying ? "#94a3b8" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                fontSize: "32px",
                cursor: isPlaying ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                marginBottom: "1rem"
              }}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              {isPlaying ? "Playing audio..." : "Click to play audio"}
            </p>
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
                    🎉 Congratulations! You completed Level 9!
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
                    href="/training/a2/listening/basico/level-10"
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
            href="/training/a2/listening/basico"
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
            ← Back to Basico Levels
          </Link>
        </div>
      </div>
    </main>
  );
}
