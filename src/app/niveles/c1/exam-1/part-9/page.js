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
const PART_ID = 'part-9';
const QUESTION_ID = 'essay';
const TOTAL_TIME = 90 * 60;

export default function Part9Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const savedEssay = answers?.[EXAM_ID]?.[PART_ID]?.[QUESTION_ID] || '';
    if (savedEssay && !essay) {
      setEssay(savedEssay);
    }
  }, [answers?.[EXAM_ID]?.[PART_ID]?.[QUESTION_ID], essay]);

  useEffect(() => {
    if (essay !== '') {
      updateAnswer(EXAM_ID, PART_ID, QUESTION_ID, essay);
    }
  }, [essay, updateAnswer]);

  const evaluateEssay = async () => {
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    const meetsWordRequirement = wordCount >= 280 && wordCount <= 320;

    setFeedback({ wordCount, meetsWordRequirement });
    setLoading(true);
    setAiFeedback('');

    try {
      const res = await fetch('/api/feedback/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay }),
      });

      const data = await res.json();

      if (res.ok) {
        setAiFeedback(data.feedback);
        setFeedback(prev => ({ ...prev, ...data.scores }));

        // ✅ Guardar puntuación en contexto para el cálculo global
        updateAnswer(EXAM_ID, PART_ID, 'writing', {
          score: data.scores.total,
          max: 20,
        });

      } else {
        setAiFeedback('⚠️ Error: ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      setAiFeedback('⚠️ Error connecting to AI.');
    }

    setLoading(false);
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

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.writing, 0);

  return (
    <div className="shell">
      <ExamExitWarning />
      
      <div className="exam-header">
        <div className="header">
          <h1>Part 9: Writing - Report</h1>
          <p>Cambridge C1 Advanced - Writing</p>
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
            questions={[{ id: 1 }]}
            answers={partAnswers}
            showResult={{}}
            sectionName={`${getSectionName(PART_ID)}`}
          />
        </div>
      </div>

      <div className="exam-content">
        {/* Progress bar with modern styling */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Writing Progress</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: essay ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Timer with modern styling */}
        <div className={`timer-section ${timeRemaining <= 60 ? 'timer-warning' : ''}`}>
          <span className="timer-icon">⏳</span>
          <span className="timer-text">Time remaining for Writing: {formatTime(timeRemaining)}</span>
        </div>

        {/* Instructions with modern styling */}
        <div className="instructions-section">
          <p className="instructions-text">
            Write a report based on the given information. Your report should be between 280-320 words.
            Use formal language and include appropriate headings and structure.
          </p>
        </div>

        {/* Reading text with modern styling */}
        <div className="reading-text-modern">
          <div className="text-content">
            <h2>Task: Environmental Impact Report</h2>
            <p>
              You work for an environmental consultancy. Your manager has asked you to write a report on the environmental impact of a proposed shopping center development in your town.
            </p>
            <p>
              <strong>Key points to include:</strong>
            </p>
            <ul>
              <li>Traffic increase and air pollution concerns</li>
              <li>Impact on local wildlife and green spaces</li>
              <li>Energy consumption and waste management</li>
              <li>Recommendations for minimizing environmental damage</li>
            </ul>
          </div>
        </div>

        <div className="questions-section-header">
          <h2>Your Report</h2>
        </div>

        <div className="questions-container">
          <div className="question" id="question-1">
            <div className="question-header">
              <h3>Environmental Impact Report</h3>
            </div>
            
            <div className="question-content">
              <div className="word-limit-info">
                <p><strong>Word limit:</strong> 280-320 words</p>
                <p><strong>Current count:</strong> {wordCount} words</p>
                {feedback?.meetsWordRequirement === false && (
                  <p style={{ color: '#dc2626' }}>❌ Your report does not meet the word requirement (280–320 words).</p>
                )}
              </div>

              <textarea
                className="writing-textarea"
                rows={15}
                placeholder="Write your report here..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
            </div>

            {essay && (
              <div className="question-feedback">
                <div className="feedback-actions">
                  <button
                    className="btn btn-primary"
                    onClick={evaluateEssay}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#6b7280' : '#3b82f6',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Sending to AI...' : 'Submit Report for AI Feedback'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Feedback Section */}
        {aiFeedback && (
          <div className="explanation" style={{ marginTop: '2rem', backgroundColor: '#eef7ff', border: '1px solid #3b82f6' }}>
            <div className="explanation-header">
              <h4>🧠 AI Feedback</h4>
            </div>
            <div className="explanation-content">
              <div dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        )}
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
              className={`nav-part-btn ${partNum === 9 ? 'current' : ''}`}
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
          <Link href="/niveles/c1/exam-1/part-8" className="btn btn-secondary">
            ⬅ Previous
          </Link>
          <Link href="/niveles/c1/exam-1/part-10" className="btn btn-primary">
            Next ➡️
          </Link>
        </div>
      </div>

      <QuickNavigation 
        questions={[{ id: 1 }]}
        answers={partAnswers}
        currentQuestion={currentQuestion}
        onNavigate={handleNavigateToQuestion}
        sectionName={`${getSectionName(PART_ID)}`}
      />
    </div>
  );
}