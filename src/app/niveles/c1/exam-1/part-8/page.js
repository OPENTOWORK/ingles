'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExamExitWarning from '@/components/ExamExitWarning';
import ExamTimer from '@/components/ExamTimer';
import AdvancedProgress from '@/components/AdvancedProgress';
import QuickNavigation from '@/components/QuickNavigation';
import EnhancedFeedback from '@/components/EnhancedFeedback';
import { buildClientApiUrl, getStaticApiHint } from '@/utils/clientApiUrl';
import '@/styles/quick-exam-navigation.css';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-8';
const QUESTION_ID = 'essay';
const TOTAL_TIME = 90 * 60; // 90 minutes for Reading and Use of English parts

const questions = [
  {
    id: 53,
    text: "Essay Task",
    instructions: "Write an essay summarising and evaluating the key points from both texts. Use your own words as much as possible and include your personal opinion. Your answer should be between 240–280 words.",
    wordLimit: 280,
    minWords: 240
  }
];

export default function Part8Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0].id);
  const partAnswers = answers?.[EXAM_ID]?.[PART_ID] || {};

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!globalStart) {
      setGlobalStart(new Date());
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
    const meetsWordRequirement = wordCount >= 240 && wordCount <= 280;

    setFeedback({ wordCount, meetsWordRequirement });
    setLoading(true);
    setAiFeedback('');

    try {
      const externalBaseConfigured = Boolean(
        String(process.env.NEXT_PUBLIC_AI_API_BASE_URL || '').trim(),
      );
      const res = await fetch(buildClientApiUrl('/api/feedback/essay'), {
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
        const hint =
          !externalBaseConfigured && (res.status === 404 || res.status === 405)
            ? ` ${getStaticApiHint()}`
            : '';
        setAiFeedback('⚠️ Error: ' + (data.error || 'Unknown error.') + hint);
      }
    } catch (err) {
      setAiFeedback('⚠️ Error al conectar con Dralo.');
    }

    setLoading(false);
  };

  const getSectionName = (partId) => {
    const sectionNames = {
      'part-1': 'Reading and Use of English - Part 1',
      'part-2': 'Reading and Use of English - Part 2',
      'part-3': 'Reading and Use of English - Part 3',
      'part-4': 'Reading and Use of English - Part 4',
      'part-5': 'Reading and Use of English - Part 5',
      'part-6': 'Reading and Use of English - Part 6',
      'part-7': 'Reading and Use of English - Part 7',
      'part-8': 'Writing - Part 1',
      'part-9': 'Writing - Part 2',
      'part-10': 'Writing - Part 3',
      'part-11': 'Writing - Part 4',
      'part-12': 'Writing - Part 5',
      'part-13': 'Writing - Part 6',
      'part-14': 'Writing - Part 2',
      'part-15': 'Listening - Part 1',
      'part-16': 'Listening - Part 2',
      'part-17': 'Speaking - Part 1'
    };
    return sectionNames[partId] || 'Unknown Section';
  }

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const handleBackToIndex = (e) => {
    e.preventDefault();
    const isExamRoute = /^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      const confirmLeave = window.confirm(
        "⚠️ Estás a punto de salir del examen.\n\nPerderás todo tu progreso si continúas.\n¿Deseas salir?"
      );
      if (confirmLeave) {
        router.push('/niveles/c1/exam-1');
      }
    } else {
      router.push('/niveles/c1/exam-1');
    }
  };

  const handlePreviousPart = (e) => {
    e.preventDefault();
    const confirmLeave = window.confirm(
      "⚠️ Estás a punto de salir de esta parte del examen.\n\nTu progreso se guardará automáticamente.\n¿Deseas continuar?"
    );
    if (confirmLeave) {
      router.push('/niveles/c1/exam-1/part-7');
    }
  };

  const handleNextPart = (e) => {
    e.preventDefault();
    const confirmLeave = window.confirm(
      "⚠️ Estás a punto de salir de esta parte del examen.\n\nTu progreso se guardará automáticamente.\n¿Deseas continuar?"
    );
    if (confirmLeave) {
      router.push('/niveles/c1/exam-1/part-9');
    }
  };

  return (
    <div className="shell">
      <ExamExitWarning />
      
      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-label">Writing Progress</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: essay ? '100%' : '0%' }}></div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="timer-section">
        <ExamTimer 
          totalTime={TOTAL_TIME}
          sectionName={getSectionName('part-8')}
          onTimeUp={() => router.push('/niveles/c1/exam-1')}
          onWarning={(timeLeft) => console.log(`Warning: ${timeLeft} seconds left`)}
        />
      </div>

      {/* Header */}
      <div className="exam-header">
        <div className="header">
          <h1>Part 8: Writing - Essay</h1>
          <p>Write an essay based on the given texts</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions-section">
        <div className="instructions-text">
          <p>
            In this part, you will read two short texts. Then, you must write an essay summarising and evaluating the key points from both.
            Use your own words as much as possible and include your personal opinion.
          </p>
          <p>
            Your answer should be between <strong>240–280 words</strong>. Try to stay clear and organized, and support your ideas with examples where appropriate.
          </p>
        </div>
      </div>

      {/* Reading texts with modern styling */}
      <div className="reading-text-modern">
        <div className="text-content">
          <h3>Text 1: <em>The Excitement of Advertising</em></h3>
          <p>
            Outdoor advertising has to attract, engage and persuade potential customers; it is the most important way of grabbing customers' attention. 
            In today's fast-paced world, people are constantly bombarded with information, making it crucial for advertisers to create compelling and memorable campaigns. 
            The best outdoor advertisements combine creativity with strategic placement to maximize impact and reach the right audience at the right time.
          </p>
          
          <h3>Text 2: <em>Advertising: an undesirable business</em></h3>
          <p>
            Once upon a time outdoor advertising was straightforward. Posters were stuck up on anything from a bus shelter to a motorway hoarding. 
            However, the industry has become increasingly complex and controversial. Critics argue that outdoor advertising contributes to visual pollution, 
            exploits public spaces for commercial gain, and manipulates consumers through psychological techniques. The debate continues about whether 
            the benefits of advertising outweigh its negative impacts on society and the environment.
          </p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="questions-container">
        <div className="questions-section-header">
          <h2>Your Essay</h2>
        </div>
        
        <div className="question">
          <div className="question-header">
            <h3>{questions[0].text}</h3>
          </div>
          
          <div className="question-content">
            <p><strong>Instructions:</strong> {questions[0].instructions}</p>
            
            <div className="word-limit-info">
              <p><strong>Word limit:</strong> 240-280 words</p>
              <p><strong>Current count:</strong> {wordCount} words</p>
              {feedback?.meetsWordRequirement === false && (
                <p style={{ color: '#dc2626' }}>❌ Your essay does not meet the word requirement (240–280 words).</p>
              )}
            </div>

            <textarea
              className="writing-textarea"
              rows={15}
              placeholder="Write your essay here..."
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
                  {loading ? 'Enviando a Dralo para corrección…' : 'Enviar a Dralo para corrección'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corrección Dralo */}
      {aiFeedback && (
        <div className="explanation" style={{ marginTop: '2rem', backgroundColor: '#eef7ff', border: '1px solid #3b82f6' }}>
          <div className="explanation-header">
            <h4>🧠 Corrección Dralo</h4>
          </div>
          <div className="explanation-content">
            <div dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      )}

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
              className={`nav-part-btn ${partNum === 8 ? 'current' : ''}`}
            >
              Part {partNum}
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="exam-navigation">
        <button className="btn btn-secondary" onClick={handleBackToIndex}>
          Back to C1 Overview
        </button>
        <button className="btn btn-secondary" onClick={handlePreviousPart}>
          ← Part 7
        </button>
        <button className="btn btn-secondary" onClick={handleNextPart}>
          Part 9 →
        </button>
      </div>
    </div>
  );
}