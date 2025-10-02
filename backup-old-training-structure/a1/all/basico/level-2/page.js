"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {
    id: 1,
    skill: "listening",
    type: "multiple_choice",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    question: "What do you hear?",
    options: ["Good morning", "Good afternoon", "Good evening", "Good night"],
    correct: "Good morning",
    explanation: "The audio says 'Good morning' - a greeting used in the morning."
  },
  {
    id: 2,
    skill: "reading",
    type: "comprehension",
    text: "I have a cat. Her name is Luna. Luna is black and white. She likes to sleep on the sofa. Every evening, Luna sits by the window.",
    question: "What does Luna like to do?",
    options: ["Play with a ball", "Sleep on the sofa", "Eat fish", "Run outside"],
    correct: "Sleep on the sofa",
    explanation: "The text states 'She likes to sleep on the sofa'."
  },
  {
    id: 3,
    skill: "vocabulary",
    type: "translation",
    word: "Dog",
    translation: "Perro",
    question: "What does 'Dog' mean in Spanish?",
    options: ["Gato", "Perro", "Pájaro", "Pez"],
    correct: "Perro",
    explanation: "'Dog' means 'Perro' in Spanish - a domestic animal."
  },
  {
    id: 4,
    skill: "use-of-english",
    type: "grammar",
    sentence: "They _____ students.",
    options: ["am", "is", "are", "be"],
    correct: "are",
    explanation: "Use 'are' with 'they' (third person plural)."
  },
  {
    id: 5,
    skill: "writing",
    type: "sentence_completion",
    prompt: "Complete the sentence:",
    sentence: "You _____ a student.",
    options: ["am", "is", "are", "be"],
    correct: "are",
    explanation: "Use 'are' with 'you' (second person)."
  }
];

export default function A1AllBasicoLevel2Page() {
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

  const getSkillEmoji = (skill) => {
    const emojis = {
      listening: "🎧",
      reading: "📖",
      vocabulary: "🧠",
      "use-of-english": "📘",
      writing: "✍️",
      speaking: "🗣️"
    };
    return emojis[skill] || "📚";
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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>🧩 All Skills - Level 2</h1>
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
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "2rem", marginRight: "0.5rem" }}>
              {getSkillEmoji(exercise.skill)}
            </span>
            <h2 style={{ margin: 0, color: "#1e293b" }}>
              {exercise.skill.charAt(0).toUpperCase() + exercise.skill.slice(1)} - Exercise {exercise.id}
            </h2>
          </div>
          
          {exercise.type === "multiple_choice" && (
            <div>
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
            </div>
          )}

          {exercise.type === "comprehension" && (
            <div>
              <div style={{
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem",
                lineHeight: "1.6"
              }}>
                <h3 style={{ marginBottom: "1rem", color: "#374151" }}>Read the text:</h3>
                <p style={{ fontSize: "16px", color: "#4b5563" }}>{exercise.text}</p>
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
            </div>
          )}

          {exercise.type === "translation" && (
            <div>
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
            </div>
          )}

          {exercise.type === "grammar" && (
            <div>
              <div style={{
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{ marginBottom: "1rem", color: "#374151" }}>Complete the sentence:</h3>
                <div style={{
                  fontSize: "18px",
                  color: "#4b5563",
                  marginBottom: "1rem",
                  lineHeight: "1.6"
                }}>
                  {exercise.sentence.split('_____').map((part, index) => (
                    <span key={index}>
                      {part}
                      {index < exercise.sentence.split('_____').length - 1 && (
                        <span style={{
                          backgroundColor: "#fef3c7",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          margin: "0 0.25rem",
                          fontWeight: "bold"
                        }}>
                          _____
                        </span>
                      )}
                    </span>
                  ))}
                </div>
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
            </div>
          )}

          {exercise.type === "sentence_completion" && (
            <div>
              <div style={{
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{ marginBottom: "1rem", color: "#374151" }}>{exercise.prompt}</h3>
                <div style={{
                  fontSize: "18px",
                  color: "#4b5563",
                  marginBottom: "1rem",
                  lineHeight: "1.6"
                }}>
                  {exercise.sentence.split('_____').map((part, index) => (
                    <span key={index}>
                      {part}
                      {index < exercise.sentence.split('_____').length - 1 && (
                        <span style={{
                          backgroundColor: "#fef3c7",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          margin: "0 0.25rem",
                          fontWeight: "bold"
                        }}>
                          _____
                        </span>
                      )}
                    </span>
                  ))}
                </div>
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
            </div>
          )}

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
                    🎉 Congratulations! You completed Level 2!
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
                    href="/training/a1/all/basico/level-3"
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
            href="/training/a1/all/basico"
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



