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

const questions = [
  { 
    id: 1, 
    text: "(1)", 
    options: ["instead", "rather", "except", "sooner"], 
    answer: "B",
    explanation: "The correct answer is 'rather' because it means 'somewhat' or 'to a certain extent'. In this context, genealogy is rather a branch of history, meaning it's somewhat related to history."
  },
  { 
    id: 2, 
    text: "(2)", 
    options: ["cause", "mean", "result", "lead"], 
    answer: "D",
    explanation: "The correct answer is 'lead' because it means 'to guide or direct'. In this context, tracing your family history can lead to learning about your roots."
  },
  { 
    id: 3, 
    text: "(3)", 
    options: ["accomplish", "access", "approach", "admit"], 
    answer: "B",
    explanation: "The correct answer is 'access' because it means 'to gain entry or use'. The internet enables people to access information about their family history."
  },
  { 
    id: 4, 
    text: "(4)", 
    options: ["fee", "price", "charge", "expense"], 
    answer: "D",
    explanation: "The correct answer is 'expense' because it refers to the cost of something. People can access information without great expense, meaning without much cost."
  },
  { 
    id: 5, 
    text: "(5)", 
    options: ["describe", "define", "remark", "regard"], 
    answer: "C",
    explanation: "The correct answer is 'remark' because it means 'to comment or observe'. People who research their family history often remark that it's a fascinating hobby."
  },
  { 
    id: 6, 
    text: "(6)", 
    options: ["reveals", "opens", "begins", "arises"], 
    answer: "A",
    explanation: "The correct answer is 'reveals' because it means 'to show or disclose'. Researching family history reveals a lot about where they come from."
  },
  { 
    id: 7, 
    text: "(7)", 
    options: ["older", "greater", "higher", "further"], 
    answer: "D",
    explanation: "The correct answer is 'further' because it means 'additional or more distant'. The further back you follow your family line, the more likely you are to find wealthy relations."
  },
  { 
    id: 8, 
    text: "(8)", 
    options: ["attended", "participated", "included", "associated"], 
    answer: "B",
    explanation: "The correct answer is 'participated' because it means 'to take part in something'. The survey involved 900 people who had participated in researching their family history."
  },
];

const EXAM_ID = 'exam-1';
const PART_ID = 'part-1';
const TOTAL_TIME = 90 * 60;

export default function Part1Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
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

  const handleSelect = (id, selectedLetter) => {
    const correct = questions.find(q => q.id === id)?.answer === selectedLetter;
    updateAnswer(EXAM_ID, PART_ID, id, selectedLetter);
    setShowResult(prev => ({ ...prev, [id]: correct }));
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
  const answered = Object.keys(partAnswers).length;
  const score = Object.values(showResult).filter(Boolean).length;
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
          <h1>Part 1: Use of english - Multiple-Choice Cloze</h1>
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
          <span className="timer-text">Time remaining for Parts 1–7: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            In this part, you read a short text with eight gaps. For each gap, there is a choice of four words (A, B, C, or D) to fill in.
            You must choose the word that fits best in the context of the sentence and the whole text.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern" style={{ position: 'sticky', top: '1rem', zIndex: 5 }}>
          <div className="text-content">
            <p>
              Genealogy is a <strong>(1)</strong> ........ of history. It concerns family history, <strong>(2)</strong> ........ than
              the national or world history studied at school. It doesn't merely involve drawing a family tree, however – tracing your family history can also
              <strong>(3)</strong> ........ in learning about your roots and your identity. The internet enables millions of people worldwide to
              <strong>(4)</strong> ........ information about their family history, without great <strong>(5)</strong> ........ .
            </p>
            <p>
              People who research their family history often <strong>(6)</strong> ........ that it's a fascinating hobby which
              <strong>(7)</strong> ........ a lot about where they come from and whether they have famous ancestors.
              According to a survey involving 900 people who had researched their family history, the chances of discovering
              a celebrity in your past are one in ten. The survey also concluded that the <strong>(8)</strong> ........ back you
              follow your family line, the more likely you are to find a relation who was much wealthier than you are.
            </p>
          </div>
        </div>

        <div className="questions-section-header">
          <h2>Choose your answers</h2>
        </div>

        <div className="questions-container">
          {questions.map((q) => {
            const selected = partAnswers[q.id];
            const correctLetter = q.answer;
            const wasAnswered = !!selected;

            return (
              <div key={q.id} className="question" id={`question-${q.id}`}>
                <div className="question-header">
                  <h3>Pregunta {q.id}</h3>
                  {wasAnswered && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <p><strong>({q.id})</strong> Choose the correct word:</p>
                  
                  <div className="options">
                    {q.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = selected === letter;
                      const isCorrect = letter === correctLetter;

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
                          <span className="option-text">{opt}</span>
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
                              {selected === correctLetter ? (
                                <span className="status-correct">✅ Correcto</span>
                              ) : (
                                <span className="status-incorrect">❌ Incorrecto</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="explanation-content">
                            <div className="answer-section">
                              <p><strong>Tu respuesta:</strong> <span className="user-answer">{selected}</span></p>
                              <p><strong>Respuesta correcta:</strong> <span className="correct-answer">{correctLetter}</span></p>
                            </div>
                            
                            <div className="explanation-text">
                              <p><strong>Explicación:</strong></p>
                              <p>{q.explanation}</p>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En este tipo de ejercicios, lee todo el contexto de la oración para entender qué palabra encaja mejor semánticamente.</p>
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
              className={`nav-part-btn ${partNum === 1 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-2" className="btn btn-primary">
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