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
const PART_ID = 'part-7';
const TOTAL_TIME = 90 * 60;

const correctAnswers = {
  37: 'G',
  38: 'B',
  39: 'F',
  40: 'A',
  41: 'E',
  42: 'D'
};

const options = {
  A: "Through endless tries at the usual exercises and frequent failures, ballet dancers develop the neural pathways in the brain necessary to control accurate, fast and smooth movement.",
  B: "The ballet shoe offers some support, but the real strength is in the muscles, built up through training.",
  C: "As technology takes away activity from the lives of many, perhaps the ballet dancer's physicality is ever more difficult for most people to imagine.",
  D: "Ballet technique is certainly extreme but it is not, in itself, dangerous.",
  E: "The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result.",
  F: "No one avoids this: it is ballet's great democratiser, the well established members of the company working alongside the newest recruits.",
  G: "It takes at least a decade of high-quality, regular practice to become an expert in any physical discipline."
};

export default function Part7Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [localAnswers, setLocalAnswers] = useState({});
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
    if (Object.keys(stored).length > 0) {
      setLocalAnswers(stored);

      const initialFeedback = {};
      Object.entries(stored).forEach(([num, val]) => {
        const number = parseInt(num);
        const isCorrect = val?.trim().toUpperCase() === correctAnswers[number];
        initialFeedback[number] = {
          correct: isCorrect,
          answer: correctAnswers[number]
        };
      });
      setShowResult(initialFeedback);
    }
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleSelect = (number, option) => {
    if (showResult[number]) return;
    const updated = { ...localAnswers, [number]: option };
    setLocalAnswers(updated);
    updateAnswer(EXAM_ID, PART_ID, number, option);
    
    const correct = option === correctAnswers[number];
    setShowResult(prev => ({
      ...prev,
      [number]: {
        correct,
        answer: correctAnswers[number]
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

  const questions = Object.keys(correctAnswers).map(Number);
  const total = questions.length;
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
          <h1>Part 7: Reading - Cross-text Multiple Matching</h1>
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
            questions={questions.map(n => ({ id: n }))}
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
            You will read four short texts on a related topic. You have to match each question with the correct text.
            Choose the letter (A, B, C, D, E, F, or G) that corresponds to the text that best matches each question.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern" style={{ position: 'sticky', top: '1rem', zIndex: 5 }}>
          <div className="text-content">
            <h2>Texts about Ballet Training</h2>
            <div className="text-options">
              {Object.entries(options).map(([letter, text]) => (
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
          {questions.map((number) => {
            const selected = partAnswers[number];
            const correct = correctAnswers[number];
            const wasAnswered = !!showResult[number];

            return (
              <div key={number} className="question" id={`question-${number}`}>
                <div className="question-header">
                  <h3>Question {number}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>{number}.</strong> Which text mentions...</p>
                  
                  <div className="options">
                    {Object.keys(options).map((letter) => {
                      const isSelected = selected === letter;
                      const isCorrect = letter === correct;

                      return (
                        <label key={letter} className={`option ${isSelected ? 'selected' : ''} ${wasAnswered ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : ''}`}>
                          <input
                            type="radio"
                            name={`question-${number}`}
                            value={letter}
                            checked={isSelected}
                            onChange={() => handleSelect(number, letter)}
                            disabled={wasAnswered}
                          />
                          <span className="option-letter">{letter}</span>
                          <span className="option-text">{options[letter]}</span>
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
                          className={`btn ${showExplanation[number] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [number]: !prev[number] }))}
                        >
                          📘 {showExplanation[number] ? 'Ocultar explicación' : 'Obtener explicación'}
                        </button>
                      </div>

                      {showExplanation[number] && (
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
                              <p><strong>💡 Consejo:</strong> En ejercicios de matching, busca palabras clave y conceptos específicos que conecten la pregunta con el texto correcto.</p>
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
              className={`nav-part-btn ${partNum === 7 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-6" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-8" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={questions.map(n => ({ id: n }))}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}