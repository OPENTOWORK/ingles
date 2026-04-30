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

const correctAnswers = {
  17: 'producer',
  18: 'illness',
  19: 'effective',
  20: 'scientists',
  21: 'addition',
  22: 'pressure',
  23: 'disadvantage',
  24: 'spicy'
};

const baseWords = {
  17: 'PRODUCT',
  18: 'ILL',
  19: 'EFFECT',
  20: 'SCIENCE',
  21: 'ADD',
  22: 'PRESS',
  23: 'ADVANTAGE',
  24: 'SPICE'
};

const EXAM_ID = 'exam-1';
const PART_ID = 'part-3';
const TOTAL_TIME = 90 * 60;

export default function Part3Page() {
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
    setLocalAnswers(stored);
    const prefeedback = {};
    Object.entries(stored).forEach(([index, value]) => {
      const correct = correctAnswers[index];
      prefeedback[index] = {
        correct: value?.trim().toLowerCase() === correct,
        answer: correct
      };
    });
    setShowResult(prefeedback);
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleChange = (e, index) => {
    setLocalAnswers({ ...localAnswers, [index]: e.target.value });
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && !showResult[index]) {
      e.preventDefault();
      const userInput = localAnswers[index]?.trim().toLowerCase();
      const correct = correctAnswers[index];

      updateAnswer(EXAM_ID, PART_ID, index, userInput);

      setShowResult({
        ...showResult,
        [index]: {
          correct: userInput === correct,
          answer: correct
        }
      });
    }
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

  const inputs = Object.keys(correctAnswers).map(Number);
  const total = inputs.length;
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
          <h1>Part 3: Use of english - Word Formation</h1>
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
            questions={inputs.map(n => ({ id: n }))}
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
            In this part, you will read a short text containing eight gaps. Each gap corresponds to a word that needs to be formed from a given base word.
            You must use the correct form of the word to complete the sentence meaningfully and grammatically. This exercise tests your understanding of word families, prefixes, suffixes, and spelling.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern" style={{ position: 'sticky', top: '1rem', zIndex: 5 }}>
          <div className="text-content">
            <h2>An Incredible Vegetable</h2>
            <p>
              Garlic, a member of the Liliaceae family which also includes onions, is <strong>(0)</strong> <em>commonly</em> used in cooking all around the world.
              China is currently the largest <strong>(17)</strong> ........ of garlic, which is particularly associated with the dishes of northern Africa and southern Europe.
              It is native to central Asia and has long had a history as a health-giving food, used both to prevent and cure <strong>(18)</strong> ........ .
            </p>
            <p>
              In Ancient Egypt, workers building the pyramids were given garlic to keep them strong, while Olympic athletes in Greece ate it to increase their resistance to infection.
            </p>
            <p>
              The forefather of antibiotic medicine, Louis Pasteur, claimed garlic was as <strong>(19)</strong> ........ as penicillin in treating infections.
              Modern-day <strong>(20)</strong> ........ have proved that garlic can indeed kill bacteria and even some viruses, so it can be very useful for people who have coughs and colds.
            </p>
            <p>
              In <strong>(21)</strong> ........ , some doctors believe that garlic can reduce blood <strong>(22)</strong> ........ .
            </p>
            <p>
              The only <strong>(23)</strong> ........ to this truly amazing food is that the strong and rather <strong>(24)</strong> ........ smell of garlic is not the most pleasant!
            </p>
          </div>
        </div>

        <div className="questions-section-header">
          <h2>Your Answers (press Enter to check)</h2>
        </div>

        <div className="questions-container">
          {inputs.map((n) => {
            const selected = partAnswers[n];
            const correct = correctAnswers[n];
            const wasAnswered = !!showResult[n];

            return (
              <div key={n} className="question" id={`question-${n}`}>
                <div className="question-header">
                  <h3>Gap {n}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>({n})</strong> Base word: <strong>{baseWords[n]}</strong></p>
                  <p>Write the correct form of the word:</p>
                  
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={localAnswers[n] || ""}
                      onChange={(e) => handleChange(e, n)}
                      onKeyDown={(e) => handleKeyPress(e, n)}
                      disabled={wasAnswered}
                      className={`answer-input ${wasAnswered ? (showResult[n]?.correct ? 'correct' : 'incorrect') : ''}`}
                    />
                  </div>

                  {wasAnswered && (
                    <div className="question-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[n] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [n]: !prev[n] }))}
                        >
                          📘 {showExplanation[n] ? 'Ocultar explicación' : 'Obtener explicación'}
                        </button>
                      </div>

                      {showExplanation[n] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Explicación Detallada</h4>
                            <div className="explanation-status">
                              {showResult[n]?.correct ? (
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
                              <p>La palabra base <strong>{baseWords[n]}</strong> necesita ser transformada usando prefijos, sufijos o cambios de categoría gramatical para encajar en el contexto.</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En Word Formation, presta atención a la categoría gramatical necesaria (sustantivo, adjetivo, verbo, adverbio) y los cambios de significado.</p>
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
              className={`nav-part-btn ${partNum === 3 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-2" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-4" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={inputs.map(n => ({ id: n }))}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}
