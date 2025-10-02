"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ExerciseLevel({ exercises, levelNumber, difficulty, backLink, nextLink, storageKey }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [matchingPairs, setMatchingPairs] = useState({});

  const exercise = exercises[currentExercise];

  // Resetear matching pairs cuando cambia el ejercicio
  useEffect(() => {
    if (exercise?.type === 'matching') {
      setMatchingPairs({});
    }
  }, [currentExercise, exercise]);

  // Auto-verificar matching cuando todas las parejas están emparejadas
  useEffect(() => {
    if (exercise?.type === 'matching' && !showResult) {
      const allMatched = Object.keys(matchingPairs).length === exercise.pairs.length;
      if (allMatched) {
        // Verificar si las coincidencias son correctas
        let correct = true;
        exercise.pairs.forEach((pair, idx) => {
          const leftId = `left-${idx}`;
          const matchedRightId = matchingPairs[leftId];
          if (matchedRightId) {
            const rightIndex = parseInt(matchedRightId.split('-')[1]);
            if (idx !== rightIndex) {
              correct = false;
            }
          } else {
            correct = false;
          }
        });
        setSelectedOption(correct ? 'matched' : 'unmatched');
      }
    }
  }, [matchingPairs, exercise, showResult]);

  const checkAnswer = () => {
    let isCorrect = false;
    
    if (exercise.type === 'true_false') {
      isCorrect = selectedOption.toLowerCase() === exercise.correct;
    } else {
      isCorrect = selectedOption === exercise.correct;
    }

    if (isCorrect) setScore(score + 1);
    setShowResult(true);

    // Si es el último ejercicio, calcular y guardar estrellas
    if (currentExercise === exercises.length - 1) {
      const finalScore = isCorrect ? score + 1 : score;
      const accuracy = (finalScore / exercises.length) * 100;
      let finalStars = 0;
      
      if (accuracy === 100) finalStars = 3;
      else if (accuracy >= 80) finalStars = 2;
      else if (accuracy >= 60) finalStars = 1;
      
      setStars(finalStars);

      try {
        const savedStars = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (!savedStars[`level-${levelNumber}`] || savedStars[`level-${levelNumber}`] < finalStars) {
          savedStars[`level-${levelNumber}`] = finalStars;
          localStorage.setItem(storageKey, JSON.stringify(savedStars));
        }
      } catch (error) {
        console.warn('Could not save stars:', error);
      }
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedOption('');
      setShowResult(false);
      setMatchingPairs({});
    }
  };

  const resetExercise = () => {
    setCurrentExercise(0);
    setSelectedOption('');
    setShowResult(false);
    setScore(0);
    setStars(0);
    setMatchingPairs({});
  };

  const renderExercise = () => {
    switch (exercise.type) {
      case 'true_false':
        return (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {['True', 'False'].map(option => (
              <button
                key={option}
                onClick={() => setSelectedOption(option.toLowerCase())}
                disabled={showResult}
                style={{
                  padding: "1rem",
                  backgroundColor: selectedOption === option.toLowerCase() ? "#dbeafe" : "#fff",
                  border: selectedOption === option.toLowerCase() ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: showResult ? "default" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'order_words':
        return (
          <div>
            <p style={{ marginBottom: "1rem", color: "#64748b" }}>Palabras: {exercise.text}</p>
            <input
              type="text"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              placeholder="Escribe la frase ordenada..."
              disabled={showResult}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px"
              }}
            />
          </div>
        );

      case 'error_detection':
        return (
          <div>
            <p style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#fef2f2", borderRadius: "8px", color: "#991b1b" }}>
              ❌ {exercise.text}
            </p>
            <input
              type="text"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              placeholder="Escribe la frase corregida..."
              disabled={showResult}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px"
              }}
            />
          </div>
        );

      case 'matching':
        // Dividir en columnas izquierda y derecha
        const leftColumn = exercise.pairs.map((pair, idx) => ({ id: `left-${idx}`, text: pair[0], originalIndex: idx }));
        const rightColumn = exercise.pairs.map((pair, idx) => ({ id: `right-${idx}`, text: pair[1], originalIndex: idx }))
          .sort(() => Math.random() - 0.5); // Mezclar columna derecha

        const handleMatch = (leftId, rightId) => {
          setMatchingPairs(prev => ({
            ...prev,
            [leftId]: rightId
          }));
        };

        const isMatched = (leftId) => matchingPairs[leftId] !== undefined;
        
        const allMatched = Object.keys(matchingPairs).length === exercise.pairs.length;

        return (
          <div>
            <p style={{ marginBottom: "1rem", color: "#64748b" }}>Empareja correctamente haciendo clic:</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "start" }}>
              {/* Columna izquierda */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {leftColumn.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: isMatched(item.id) ? "#dbeafe" : "#f3f4f6",
                      border: isMatched(item.id) ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: showResult ? "default" : "pointer",
                      fontWeight: isMatched(item.id) ? "bold" : "normal",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Líneas de conexión */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
                {leftColumn.map(item => (
                  <div key={item.id} style={{ height: "45px", display: "flex", alignItems: "center" }}>
                    {isMatched(item.id) ? "↔" : "---"}
                  </div>
                ))}
              </div>

              {/* Columna derecha */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {rightColumn.map(item => {
                  const isUsed = Object.values(matchingPairs).includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!showResult && !isUsed) {
                          // Encontrar el primer elemento sin emparejar de la izquierda
                          const unmatchedLeft = leftColumn.find(left => !isMatched(left.id));
                          if (unmatchedLeft) {
                            handleMatch(unmatchedLeft.id, item.id);
                          }
                        }
                      }}
                      disabled={showResult || isUsed}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: isUsed ? "#dbeafe" : "#ffffff",
                        border: isUsed ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                        borderRadius: "8px",
                        cursor: (showResult || isUsed) ? "default" : "pointer",
                        fontWeight: isUsed ? "bold" : "normal",
                        transition: "all 0.2s",
                        textAlign: "left"
                      }}
                      onMouseEnter={(e) => {
                        if (!showResult && !isUsed) {
                          e.currentTarget.style.backgroundColor = "#f0f9ff";
                          e.currentTarget.style.borderColor = "#3b82f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUsed) {
                          e.currentTarget.style.backgroundColor = "#ffffff";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }
                      }}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {allMatched && (
              <p style={{ marginTop: "1rem", textAlign: "center", color: "#10b981", fontWeight: "bold" }}>
                ✓ Todas las parejas emparejadas
              </p>
            )}
          </div>
        );

      case 'odd_one_out':
        return (
          <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(2, 1fr)" }}>
            {exercise.options.map(option => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                disabled={showResult}
                style={{
                  padding: "1rem",
                  backgroundColor: selectedOption === option ? "#dbeafe" : "#fff",
                  border: selectedOption === option ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: showResult ? "default" : "pointer",
                  fontSize: "16px"
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'fill_blank':
      case 'multiple_choice':
      default:
        return (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {exercise.options.map(option => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                disabled={showResult}
                style={{
                  padding: "1rem",
                  backgroundColor: selectedOption === option ? "#dbeafe" : "#fff",
                  border: selectedOption === option ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: showResult ? "default" : "pointer",
                  fontSize: "16px"
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );
    }
  };

  if (!exercise) {
    return <div>No exercises available</div>;
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "linear-gradient(to right, #f0f8ff, #e6f0ff)", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>
            📘 Use of English - Nivel {levelNumber}
          </h1>
          <p style={{ color: "#64748b" }}>Ejercicio {currentExercise + 1} de {exercises.length}</p>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginTop: "1rem" }}>
            <div style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px", transition: "width 0.3s ease" }}></div>
          </div>
        </div>

        {/* Exercise */}
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ marginBottom: "1.5rem", fontWeight: "bold", color: "#1e293b", fontSize: "1.1rem" }}>
            {exercise.question}
          </p>

          {renderExercise()}

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
            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #0ea5e9" }}>
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
                  Next Exercise →
                </button>
              ) : (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>🎉 ¡Nivel {levelNumber} Completado!</p>

                  {/* Estrellas */}
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                    {[1, 2, 3].map(star => (
                      <span key={star} style={{ fontSize: "2.5rem", color: star <= stars ? "#ffd700" : "#d1d5db", opacity: star <= stars ? 1 : 0.3 }}>
                        ⭐
                      </span>
                    ))}
                  </div>

                  <p style={{ marginBottom: "1rem" }}>Puntuación: {score}/{exercises.length} ({((score / exercises.length) * 100).toFixed(0)}%)</p>

                  {stars === 3 && <p style={{ color: "#059669", fontWeight: "bold" }}>🌟 ¡Perfecto! 3 estrellas</p>}
                  {stars === 2 && <p style={{ color: "#d97706", fontWeight: "bold" }}>⭐⭐ 2 estrellas</p>}
                  {stars === 1 && <p style={{ color: "#ea580c", fontWeight: "bold" }}>⭐ 1 estrella</p>}
                  {stars === 0 && <p style={{ color: "#6b7280", fontWeight: "bold" }}>💪 Sigue practicando</p>}

                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
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
                      Reintentar
                    </button>
                    {nextLink && (
                      <Link
                        href={nextLink}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          borderRadius: "8px",
                          padding: "0.75rem 1.5rem",
                          fontSize: "14px",
                          fontWeight: "bold",
                          textDecoration: "none",
                          display: "inline-block"
                        }}
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back button */}
        <div style={{ marginTop: "2rem" }}>
          <Link
            href={backLink}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "14px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            ← Volver
          </Link>
        </div>
      </div>
    </main>
  );
}
