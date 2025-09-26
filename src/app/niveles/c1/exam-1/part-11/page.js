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
const PART_ID = 'part-11';
const TOTAL_TIME = 90 * 60;

const questions = [
  { id: 7, text: "Mastic is collected from a tree which looks like a smaller form of the...", correct: "oak" },
  { id: 8, text: "Mastic resin will ________ only in the region around the Mediterranean.", correct: "grow" },
  { id: 9, text: "Basic tools like ________ are employed to remove impurities from the mastic.", correct: "knives" },
  { id: 10, text: "Crystals of mastic have been referred to as ________ in literature.", correct: "tears" },
  { id: 11, text: "The sale of mastic crystals is handled by a ________ to ensure that the growers get a fair deal.", correct: "cooperative" },
  { id: 12, text: "It is thought that mastic was first used as ________ by ancient peoples.", correct: "medicine" },
  { id: 13, text: "When mastic is added to ________ it slows down the melting process.", correct: "chocolate" },
  { id: 14, text: "Flavoured drinks are made in ________ which have had mastic burned under them.", correct: "jugs" },
  { id: 15, text: "Some people believe that mastic can help in the treatment of health problems, especially some ________ conditions.", correct: "stomach" }
];

export default function Part11Page() {
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
    const prefeedback = {};
    questions.forEach(q => {
      const answer = stored[q.id];
      if (answer) {
        prefeedback[q.id] = {
          correct: answer.trim().toLowerCase() === q.correct.toLowerCase(),
          answer: q.correct
        };
      }
    });
    setShowResult(prefeedback);
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleChange = (e, id) => {
    if (!showResult[id]) {
      setUserAnswers({ ...userAnswers, [id]: e.target.value });
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'Enter' && !showResult[id]) {
      const answer = userAnswers[id]?.trim();
      updateAnswer(EXAM_ID, PART_ID, id, answer);
      
      const correct = answer.toLowerCase() === questions.find(q => q.id === id)?.correct.toLowerCase();
      setShowResult(prev => ({
        ...prev,
        [id]: {
          correct,
          answer: questions.find(q => q.id === id)?.correct
        }
      }));
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

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.listening, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 11: Listening - Sentence Completion</h1>
          <p>Cambridge C1 Advanced - Listening</p>
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
            questions={questions}
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
          <span className="timer-text">Time remaining for Listening: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            You will hear a nutritionist talking about the production and uses of mastic. 
            Complete the sentences with a word or short phrase. Press Enter to check your answer.
          </p>
        </div>

        {/* Audio player */}
        <div className="audio-section">
          <h2>Audio</h2>
          <audio controls style={{ width: "100%", marginBottom: "1.5rem" }}>
            <source src="/audio/extract4.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="questions-section-header">
          <h2>Complete the sentences</h2>
        </div>

        <div className="questions-container">
          {questions.map((q) => {
            const selected = partAnswers[q.id];
            const correct = q.correct;
            const wasAnswered = !!showResult[q.id];

            return (
              <div key={q.id} className="question" id={`question-${q.id}`}>
                <div className="question-header">
                  <h3>Question {q.id}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>{q.id}.</strong> {q.text}</p>
                  
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={userAnswers[q.id] || ""}
                      onChange={(e) => handleChange(e, q.id)}
                      onKeyDown={(e) => handleKeyPress(e, q.id)}
                      disabled={wasAnswered}
                      className={`answer-input ${wasAnswered ? (showResult[q.id]?.correct ? 'correct' : 'incorrect') : ''}`}
                    />
                  </div>

                  {wasAnswered && (
                    <div className="question-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[q.id] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        >
                          📘 {showExplanation[q.id] ? 'Ocultar explicación' : 'Obtener explicación'}
                        </button>
                      </div>

                      {showExplanation[q.id] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Explicación Detallada</h4>
                            <div className="explanation-status">
                              {showResult[q.id]?.correct ? (
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
                              <p>Esta información se menciona específicamente en el audio. Presta atención a las palabras clave y el contexto.</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En ejercicios de sentence completion, escucha atentamente las palabras exactas y toma notas si es necesario.</p>
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
              className={`nav-part-btn ${partNum === 11 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-10" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-12" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={questions}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}