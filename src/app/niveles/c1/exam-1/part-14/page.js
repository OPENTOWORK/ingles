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

// Estilos específicos para el speaking
const speakingStyles = `
  .question-audio-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .audio-player-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .question-audio {
    width: 100%;
    max-width: 400px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
  }

  .audio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .audio-icon {
    font-size: 1.2rem;
  }

  .question-text {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-left: 4px solid #667eea;
    border-radius: 0 8px 8px 0;
  }

  .speaking-tips {
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
  }

  .speaking-tips h4 {
    color: #1976d2;
    margin: 0 0 0.5rem 0;
  }

  .response-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #f5f5f5;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
  }

  .response-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .recording-status {
    font-weight: 600;
    color: #666;
  }

  .response-textarea {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
  }

  .response-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .response-feedback {
    margin-top: 1rem;
  }

  .response-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .response-stats span {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .improvement-tip {
    color: #ff9800;
    font-weight: 600;
  }

  .good-response {
    color: #4caf50;
    font-weight: 600;
  }

  .speaking-tips-detailed ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .speaking-tips-detailed li {
    margin: 0.25rem 0;
    color: #555;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = speakingStyles;
  document.head.appendChild(styleSheet);
}

const EXAM_ID = 'exam-1';
const PART_ID = 'part-14';
const TOTAL_TIME = 90 * 60;

const questions = [
  {
    id: 1,
    text: "Tell me about yourself. What do you do?",
    audio: "/audio/speaking-part1-question1.mp3",
    category: "Personal Information",
    tips: "Talk about your job, studies, or main activities. Mention where you're from and what you enjoy doing."
  },
  {
    id: 2,
    text: "What are your hobbies and interests?",
    audio: "/audio/speaking-part1-question2.mp3",
    category: "Personal Interests",
    tips: "Describe what you like to do in your free time. Be specific and explain why you enjoy these activities."
  },
  {
    id: 3,
    text: "Where are you from? Tell me about your hometown.",
    audio: "/audio/speaking-part1-question3.mp3",
    category: "Background",
    tips: "Describe your hometown or country. Mention what it's famous for, the weather, or what you like about it."
  },
  {
    id: 4,
    text: "What do you like most about your job/studies?",
    audio: "/audio/speaking-part1-question4.mp3",
    category: "Work/Studies",
    tips: "Explain what aspects of your work or studies you find most interesting or rewarding."
  },
  {
    id: 5,
    text: "What are your plans for the future?",
    audio: "/audio/speaking-part1-question5.mp3",
    category: "Future Plans",
    tips: "Talk about your career goals, travel plans, or personal objectives. Be specific about what you want to achieve."
  },
  {
    id: 6,
    text: "What's your favorite type of music/film/book? Why?",
    audio: "/audio/speaking-part1-question6.mp3",
    category: "Entertainment",
    tips: "Choose one and explain why you like it. Give specific examples and explain what makes it special to you."
  }
];

export default function Part14Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [responses, setResponses] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
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
    const savedResponses = {};
    questions.forEach(q => {
      const response = stored[q.id];
      if (response) {
        savedResponses[q.id] = response;
      }
    });
    setResponses(savedResponses);
  }, [answers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setResponses(prev => ({
          ...prev,
          [currentQuestion]: transcript
        }));
        updateAnswer(EXAM_ID, PART_ID, currentQuestion, transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognition);
    }
  }, [currentQuestion, updateAnswer]);

  const handleResponseChange = (questionId, response) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
    updateAnswer(EXAM_ID, PART_ID, questionId, response);
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
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
      'part-13': 'Listening - Part 1',
      'part-14': 'Speaking - Part 1',
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

  const total = questions.length;
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.speaking, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 14: Speaking - Personal questions</h1>
          <p>C1 Advanced - Speaking</p>
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
          <span className="timer-text">Time remaining for Speaking: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            In this part of the test, I'm going to ask you some questions about yourself. Please answer each question as fully as possible, giving reasons and examples where appropriate. You can record your answers using the microphone or type them in the text area.
          </p>
        </div>

        <div className="questions-container">
          {questions.map((q) => {
            const response = responses[q.id] || '';
            const hasResponse = response.trim().length > 0;

            return (
              <div key={q.id} className="question" id={`question-${q.id}`}>
                <div className="question-header">
                  <h3>Question {q.id}</h3>
                  <div className="question-category">
                    <span className="category-badge">{q.category}</span>
                  </div>
                  {hasResponse && (
                    <div className="question-status">
                      <span className="status-badge answered">✅ Respondida</span>
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <div className="question-audio-section">
                    <div className="audio-player-container">
                      <audio controls className="question-audio">
                        <source src={q.audio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <div className="audio-label">
                        <span className="audio-icon">🎧</span>
                        <span>Listen to the interviewer's question</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="question-text">
                    <p><strong>{q.id}.</strong> {q.text}</p>
                  </div>
                  
                  <div className="speaking-tips">
                    <h4>💡 Tips for this question:</h4>
                    <p>{q.tips}</p>
                  </div>

                  <div className="response-section">
                    <div className="response-controls">
                      <button
                        className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!recognition}
                      >
                        {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                      </button>
                      <span className="recording-status">
                        {isRecording ? '🔴 Recording...' : '⏸️ Not recording'}
                      </span>
                    </div>

                    <textarea
                      className="response-textarea"
                      placeholder="Type your answer here or use the microphone to record..."
                      value={response}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      rows={4}
                    />

                    {response && (
                      <div className="response-feedback">
                        <div className="response-stats">
                          <span>Words: {response.split(' ').filter(word => word.length > 0).length}</span>
                          <span>Characters: {response.length}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {hasResponse && (
                    <div className="question-feedback">
                      <div className="feedback-actions">
                        <button
                          className={`btn ${showExplanation[q.id] ? 'btn-info' : 'btn-secondary'}`}
                          onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        >
                          📘 {showExplanation[q.id] ? 'Ocultar consejos' : 'Ver consejos de mejora'}
                        </button>
                      </div>

                      {showExplanation[q.id] && (
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>📖 Consejos de Mejora</h4>
                            <div className="explanation-status">
                              <span className="status-info">💬 Tu respuesta está guardada</span>
                            </div>
                          </div>
                          
                          <div className="explanation-content">
                            <div className="response-analysis">
                              <p><strong>Análisis de tu respuesta:</strong></p>
                              <p>Tu respuesta tiene {response.split(' ').filter(word => word.length > 0).length} palabras.</p>
                              {response.split(' ').filter(word => word.length > 0).length < 20 && (
                                <p className="improvement-tip">💡 <strong>Sugerencia:</strong> Intenta dar más detalles y ejemplos para enriquecer tu respuesta.</p>
                              )}
                              {response.split(' ').filter(word => word.length > 0).length >= 20 && (
                                <p className="good-response">✅ <strong>¡Excelente!</strong> Tu respuesta tiene buena longitud y detalle.</p>
                              )}
                            </div>
                            
                            <div className="speaking-tips-detailed">
                              <p><strong>Consejos para mejorar:</strong></p>
                              <ul>
                                <li>Usa conectores como "because", "for example", "in addition"</li>
                                <li>Da ejemplos específicos de tu experiencia</li>
                                <li>Explica el "por qué" detrás de tus respuestas</li>
                                <li>Habla con fluidez y confianza</li>
                              </ul>
                            </div>
                            
                            <div className="learning-tip">
                              <p><strong>💡 Consejo:</strong> En el speaking, es importante mostrar tu personalidad y dar respuestas auténticas y detalladas.</p>
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
          <h3>Your progress: {answered} / {total} questions answered</h3>
          <p className="score-info">
            🎯 Complete all questions to finish this part of the exam.
          </p>
          {answered === total && (
            <p className="score-passed">✅ You have completed all speaking questions!</p>
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
              className={`nav-part-btn ${partNum === 14 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-13" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-15" className="btn btn-primary">
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