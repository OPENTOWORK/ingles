'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import ExamExitWarning from '@/components/ExamExitWarning';
import ExamTimer from '@/components/ExamTimer';
import AdvancedProgress from '@/components/AdvancedProgress';
import QuickNavigation from '@/components/QuickNavigation';
import EnhancedFeedback from '@/components/EnhancedFeedback';
import '@/styles/quick-exam-navigation.css';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-6';
const TOTAL_TIME = 90 * 60;

const correctAnswers = {
  43: 'A',
  44: 'C',
  45: 'B',
  46: 'D',
  47: 'C',
  48: 'B',
  49: 'C',
  50: 'B',
  51: 'D',
  52: 'D',
};

const questions = {
  43: 'states how surprised the writer was at Duncan\'s early difficulties?',
  44: 'says that Duncan sometimes seems much more mature than he really is?',
  45: 'describes the frustration felt by Duncan\'s father?',
  46: 'says that Duncan is on course to reach a high point in his profession?',
  47: 'suggests that Duncan caught up with his team-mates in terms of physical development?',
  48: 'explains how Duncan was a good all-round sportsperson?',
  49: 'gives an example of how Gavin reassured his son?',
  50: 'mentions Duncan\'s current club\'s low opinion of him at one time?',
  51: 'mentions a personal success despite a failure for the team?',
  52: 'explains how Duncan and his father are fulfilling a similar role?'
};

const texts = {
  A: "Duncan's early struggles were unexpected. His natural talent was evident from the start, but the technical demands of professional football proved more challenging than anyone had anticipated. The transition from youth football to the professional game required not just physical adaptation, but mental resilience that took time to develop.",
  B: "Gavin watched his son's development with a mixture of pride and concern. The pressure to succeed was immense, and there were moments when Duncan's confidence seemed to waver. Gavin found himself constantly encouraging his son, reminding him that every great player had faced similar challenges in their early career.",
  C: "Despite his young age, Duncan displayed a maturity that often surprised his coaches and teammates. His understanding of the game's tactical aspects was remarkable, and he approached training with a professionalism that belied his years. This combination of youth and wisdom made him a unique presence in the dressing room.",
  D: "Duncan's journey mirrors his father's own path in many ways. Both faced similar challenges in their early careers, and both had to prove themselves against more experienced players. The father-son connection extends beyond blood - they share a deep understanding of what it takes to succeed at the highest level of the sport."
};

export default function Part6Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const partAnswers = answers?.[EXAM_ID]?.[PART_ID] || {};
  const initializedRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initializedRef.current && !globalStart) {
      setGlobalStart(new Date());
      initializedRef.current = true;
    }
  }, [setGlobalStart]);

  useEffect(() => {
    const stored = answers?.[EXAM_ID]?.[PART_ID] || {};
    setUserAnswers(stored);

    const initialFeedback = {};
    for (const [id, correct] of Object.entries(correctAnswers)) {
      const val = stored[id]?.trim().toUpperCase();
      if (val) {
        initialFeedback[id] = {
          correct: val === correct,
          answer: correct
        };
      }
    }
    setShowResult(initialFeedback);
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleSelect = (id, option) => {
    if (showResult[id]) return;
    const updated = { ...userAnswers, [id]: option };
    setUserAnswers(updated);
    updateAnswer(EXAM_ID, PART_ID, id, option);
    
    const correct = option === correctAnswers[id];
    setShowResult(prev => ({
      ...prev,
      [id]: {
        correct,
        answer: correctAnswers[id]
      }
    }));
  };

  const handleBackToIndex = (e) => {
    e.preventDefault();
    const isExamRoute = /^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      const confirmLeave = window.confirm(
        "⚠️ Estás a punto de salir del examen.\n\nPerderás todo tu progreso si continúas.\n¿Deseas salir?"
      );
      if (!confirmLeave) return;
      clearAllAnswers();
    }
    router.push("/niveles/c1");
  };

  // Función para navegar a una pregunta específica
  const handleNavigateToQuestion = (questionId) => {
    setCurrentQuestion(questionId);
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Función para obtener el nombre de la sección
  function getSectionName(partId) {
    const sectionNames = {
      'part-1': 'Reading - Part 1',
      'part-2': 'Reading - Part 2',
      'part-3': 'Reading - Part 3',
      'part-4': 'Reading - Part 4',
      'part-5': 'Reading - Part 5',
      'part-6': 'Reading - Part 6',
      'part-7': 'Reading - Part 7',
      'part-8': 'Use of English - Part 1',
      'part-9': 'Use of English - Part 2',
      'part-10': 'Use of English - Part 3',
      'part-11': 'Use of English - Part 4',
      'part-12': 'Writing - Part 1',
      'part-13': 'Writing - Part 2',
      'part-14': 'Writing - Part 2',
      'part-15': 'Listening - Part 1',
      'part-16': 'Listening - Part 2',
      'part-17': 'Speaking - Part 1'
    };
    return sectionNames[partId] || 'Unknown Section';
  }

  // Función para obtener la siguiente parte
  const getNextPart = (currentPart) => {
    const partNumbers = {
      'part-1': 1, 'part-2': 2, 'part-3': 3, 'part-4': 4, 'part-5': 5,
      'part-6': 6, 'part-7': 7, 'part-8': 8, 'part-9': 9, 'part-10': 10,
      'part-11': 11, 'part-12': 12, 'part-13': 13, 'part-14': 14, 'part-15': 15,
      'part-16': 16, 'part-17': 17
    };
    const currentNum = partNumbers[currentPart];
    const nextNum = currentNum + 1;
    if (nextNum <= 17) {
      return `part-${nextNum}`;
    }
    return 'resultado';
  };

  // Función para obtener la parte anterior
  const getPrevPart = (currentPart) => {
    const partNumbers = {
      'part-1': 1, 'part-2': 2, 'part-3': 3, 'part-4': 4, 'part-5': 5,
      'part-6': 6, 'part-7': 7, 'part-8': 8, 'part-9': 9, 'part-10': 10,
      'part-11': 11, 'part-12': 12, 'part-13': 13, 'part-14': 14, 'part-15': 15,
      'part-16': 16, 'part-17': 17
    };
    const currentNum = partNumbers[currentPart];
    const prevNum = currentNum - 1;
    if (prevNum >= 1) {
      return `part-${prevNum}`;
    }
    return null;
  };

  const questionIds = Object.keys(questions).map(Number);
  const total = questionIds.length;
  const answered = Object.keys(showResult).length;
  const score = Object.values(showResult).filter(f => f.correct).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.reading, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 6: Reading - Gapped Text</h1>
          <p>Cambridge C1 Advanced - Reading</p>
        </div>
        
        <div className="exam-controls">
          <ExamTimer 
            totalTime={TOTAL_TIME}
            sectionName={`${getSectionName(PART_ID)}`}
            onTimeUp={() => {
              alert('¡Tiempo agotado! Serás redirigido al siguiente examen.');
              const nextPart = getNextPart(PART_ID);
              if (nextPart === 'resultado') {
                router.push(`/niveles/c1/exam-1/${nextPart}`);
              } else {
                router.push(`/niveles/c1/exam-1/${nextPart}`);
              }
            }}
            onWarning={(timeLeft) => {
              if (timeLeft <= 300) {
                alert(`¡Atención! Te quedan ${Math.floor(timeLeft / 60)} minutos.`);
              }
            }}
          />
          
          <AdvancedProgress 
            questions={questionIds.map(n => ({ id: n }))}
            answers={partAnswers}
            showResult={showResult}
            sectionName={`${getSectionName(PART_ID)}`}
          />
        </div>
      </div>

      <div className="exam-content">
        {/* Progress bar with modern styling */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progress: {progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer with modern styling */}
        <div className={`timer-section ${timeRemaining <= 60 ? 'timer-warning' : ''}`}>
          <span className="timer-icon">⏳</span>
          <span className="timer-text">Time remaining for Parts 1–7: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            You will read a text with gaps. For each gap, choose the text (A, B, C, or D) that best fits the context.
            There is one extra text that does not fit any gap.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern" style={{ position: 'sticky', top: '1rem', zIndex: 5 }}>
          <div className="text-content">
            <h2>Texts about Duncan's Football Career</h2>
            <div className="text-options">
              {Object.entries(texts).map(([letter, text]) => (
                <div key={letter} className="text-option">
                  <strong>{letter}.</strong> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="questions-section-header">
          <h2>Questions</h2>
        </div>

        <div className="questions-container">
          {questionIds.map((id) => {
            const selected = partAnswers[id];
            const correct = correctAnswers[id];
            const wasAnswered = !!showResult[id];

            return (
              <div key={id} className="question" id={`question-${id}`}>
                <div className="question-header">
                  <h3>Question {id}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>{id}.</strong> Which text {questions[id]}</p>
                  
                  <div className="options">
                    {Object.keys(texts).map((letter) => {
                      const isSelected = selected === letter;
                      const isCorrect = letter === correct;

                      return (
                        <label key={letter} className={`option ${isSelected ? 'selected' : ''} ${wasAnswered ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : ''}`}>
                          <input
                            type="radio"
                            name={`question-${id}`}
                            value={letter}
                            checked={isSelected}
                            onChange={() => handleSelect(id, letter)}
                            disabled={wasAnswered}
                          />
                          <span className="option-letter">{letter}</span>
                          {wasAnswered && isCorrect && (
                            <span className="result-indicator correct">✓</span>
                          )}
                          {wasAnswered && isSelected && !isCorrect && (
                            <span className="result-indicator incorrect">✗</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {selected && (
                    <div className="question-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[id] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [id]: !prev[id] }))}
                        >
                          📘 {showExplanation[id] ? 'Ocultar explicación' : 'Obtener explicación'}
                        </button>
                      </div>

                      {showExplanation[id] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Explicación Detallada</h4>
                            <div className="explanation-status">
                              {selected === correct ? (
                                <span className="status-correct">✅ Correcto</span>
                              ) : (
                                <span className="status-incorrect">❌ Incorrecto</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="explanation-content">
                            <div className="answer-section">
                              <p><strong>Tu respuesta:</strong> <span className="user-answer">{selected}</span></p>
                              <p><strong>Respuesta correcta:</strong> <span className="correct-answer">{correct}</span></p>
                            </div>
                            
                            <div className="explanation-text">
                              <p><strong>Explicación:</strong></p>
                              <p>Lee cuidadosamente cada texto y busca la información específica que se menciona en la pregunta.</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En ejercicios de gapped text, presta atención al contexto y la coherencia entre las ideas.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="score-section">
          <h3>Your score: {score} / {total}</h3>
          <p className="score-info">
            🎯 You need <strong>{required}</strong> correct answers to pass.
          </p>
          {answered === total && (
            passed ? (
              <p className="score-passed">✅ You passed the test!</p>
            ) : (
              <p className="score-failed">❌ You did not pass. Try again to improve your score.</p>
            )
          )}
        </div>
      </div>

      {/* Navegación rápida - 17 botones para todas las partes */}
      <div className="quick-exam-navigation">
        <div className="nav-header">
          <h3>📚 Navegación Rápida del Examen</h3>
        </div>
        <div className="nav-buttons-grid">
          {Array.from({ length: 17 }, (_, i) => i + 1).map(partNum => (
            <Link 
              key={partNum} 
              href={`/niveles/c1/exam-1/part-${partNum}`}
              className={`nav-part-btn ${partNum === 6 ? 'current' : ''}`}
            >
              Part {partNum}
            </Link>
          ))}
        </div>
      </div>

      <div className="exam-navigation">
        <div className="nav-buttons">
          <button onClick={handleBackToIndex} className="btn btn-secondary">
            ⬅ Back to C1 Overview
          </button>
          <Link href="/niveles/c1/exam-1/part-5" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-7" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={questionIds.map(n => ({ id: n }))}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}