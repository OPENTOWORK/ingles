"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {id: 1, type: "multiple-choice", question: "Completa: Were it ___ for her support, we'd have failed.", options: ["not","wasn't","isn't","aren't"], correct: "not", explanation: "'Were it not for' = 'si no fuera por'."},
  {id: 2, type: "multiple-choice", question: "Elige: Had they ___ the risk, they'd have avoided it.", options: ["foreseen","foresaw","foresee","foreseeing"], correct: "foreseen", explanation: "'Had' + subject + past participle."},
  {id: 3, type: "ordering", question: "Ordena las palabras: earlier / had / known / I / acted / have / would / I", options: ["Had I known earlier I would have acted","I had known earlier I would have acted","Had I earlier known I would have acted","I would have acted had I known earlier"], correct: "Had I known earlier I would have acted", explanation: "Inversión condicional: 'Had' + subject + past participle."},
  {id: 4, type: "true-false", question: "Verdadero o falso: 'Should you needs clarification, contact me.'", options: ["Verdadero","Falso"], correct: "Falso", explanation: "Debería ser 'Should you need' (sin -s)."},
  {id: 5, type: "error-correction", question: "Encuentra el error: Were he knows the answer, he'd tell you.", options: ["knows → to know","Were → Was","he'd → he","answer → solution"], correct: "knows → to know", explanation: "'Were' + subject + 'to' + infinitivo."},
  {id: 6, type: "matching", question: "Empareja: were it not ↔ ?", options: ["si no fuera por","condicional invertido","formal","pasado"], correct: "si no fuera por", explanation: "'Were it not' significa 'si no fuera por'."},
  {id: 7, type: "multiple-choice", question: "Completa: Should anything ___, notify us immediately.", options: ["happen","happens","happened","happening"], correct: "happen", explanation: "'Should' + subject + infinitivo sin 'to'."},
  {id: 8, type: "multiple-choice", question: "Selecciona: Had she ___ on time, she'd have arrived earlier.", options: ["left","leave","leaving","to leave"], correct: "left", explanation: "'Had' + subject + past participle."},
  {id: 9, type: "multiple-choice", question: "Completa: Were we ___, it would be catastrophic.", options: ["to fail","failed","failing","fail"], correct: "to fail", explanation: "'Were we to' + infinitivo."},
  {id: 10, type: "odd-one-out", question: "¿Cuál NO pertenece al grupo?", options: ["were I","had I","should you","yesterday"], correct: "yesterday", explanation: "'Yesterday' no es inversión condicional."}];

export default function C2UseOfEnglishAvanzadoLevel3Page() {
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
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>📖 UseOfEnglish - Level 3</h1>
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
                    🎉 Congratulations! You completed Level 3!
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
                    href="/training/c2/use-of-english/avanzado/level-4"
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
            href="/training/c2/use-of-english/avanzado"
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
            ← Back to Avanzado Levels
          </Link>
        </div>
      </div>
    </main>
  );
}
