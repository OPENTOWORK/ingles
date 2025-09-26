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
const PART_ID = 'part-10';
const TOTAL_TIME = 90 * 60;

const questions = [
  {
    id: 1,
    text: "What is the main objective of the project?",
    options: [
      "to raise environmental awareness",
      "to encourage tourism in the islands",
      "to follow the movements of tides"
    ],
    correct: "A",
    explanation: "The speaker mentions that the project aims to educate people about environmental issues and raise awareness about the importance of protecting marine ecosystems."
  },
  {
    id: 2,
    text: "What is the speaker's opinion of the new project?",
    options: [
      "The idea is over-ambitious.",
      "The approach is innovative.",
      "The experiment is unscientific."
    ],
    correct: "B",
    explanation: "The speaker describes the project as 'groundbreaking' and 'revolutionary', indicating they view it as innovative rather than over-ambitious or unscientific."
  },
  {
    id: 3,
    text: "What is the art critic's opinion of Fitzgerald's latest work?",
    options: [
      "It lacks originality.",
      "It shows technical mastery.",
      "It fails to engage the viewer."
    ],
    correct: "B",
    explanation: "The critic praises Fitzgerald's technical skills and describes the work as 'masterfully executed', indicating they appreciate the technical mastery."
  },
  {
    id: 4,
    text: "According to the speaker, what makes this exhibition special?",
    options: [
      "The variety of artists represented",
      "The historical significance of the works",
      "The interactive elements included"
    ],
    correct: "C",
    explanation: "The speaker mentions that visitors can 'interact with the art' and 'experience it in new ways', highlighting the interactive elements as a special feature."
  },
  {
    id: 5,
    text: "What does the speaker suggest about future exhibitions?",
    options: [
      "They will focus on local artists only",
      "They will be more experimental",
      "They will be held in different venues"
    ],
    correct: "B",
    explanation: "The speaker mentions plans for 'more experimental approaches' and 'pushing boundaries', indicating future exhibitions will be more experimental."
  }
];

export default function Part10Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
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
    setSelectedAnswers(stored);
    const prefeedback = {};
    questions.forEach(q => {
      const selected = stored[q.id];
      if (selected) {
        prefeedback[q.id] = {
          correct: selected === q.correct,
          answer: q.correct
        };
      }
    });
    setShowResult(prefeedback);
  }, [answers?.[EXAM_ID]?.[PART_ID]]);

  const handleSelect = (qId, option) => {
    if (showResult[qId]) return;
    const updated = { ...selectedAnswers, [qId]: option };
    setSelectedAnswers(updated);
    updateAnswer(EXAM_ID, PART_ID, qId, option);
    
    const correct = option === questions.find(q => q.id === qId)?.correct;
    setShowResult(prev => ({
      ...prev,
      [qId]: {
        correct,
        answer: questions.find(q => q.id === qId)?.correct
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
          <h1>Part 10: Listening - Short extracts</h1>
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
            You will hear a series of short extracts. For each extract, choose the answer (A, B, or C) that best fits what you hear.
          </p>
        </div>

        {/* Audio player */}
        <div className="audio-section">
          <h2>Audio</h2>
          <audio controls style={{ width: "100%", marginBottom: "1.5rem" }}>
            <source src="/audio/extract3.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="questions-section-header">
          <h2>Questions</h2>
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
                  
                  <div className="options">
                    {q.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = selected === letter;
                      const isCorrect = letter === correct;

                      return (
                        <label key={letter} className={`option ${isSelected ? 'selected' : ''} ${wasAnswered ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : ''}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={letter}
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, letter)}
                          disabled={wasAnswered}
                          />
                          <span className="option-letter">{letter}</span>
                          <span className="option-text">{option}</span>
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
                              <p>{q.explanation}</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En ejercicios de listening, presta atención a las palabras clave y el contexto general de la conversación.</p>
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
              className={`nav-part-btn ${partNum === 10 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-9" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-11" className="btn btn-primary">
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