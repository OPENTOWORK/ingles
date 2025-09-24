'use client';

import { useState, useEffect } from 'react';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-4';
const CURRENT_PART = 4;
const TOTAL_PARTS = 17;

const questions = [
  { id: 25, text: 'Joan was in favour of visiting the museum.', keyword: 'IDEA', secondSentence: 'Joan thought it would be .................................................. to the museum.', answer: 'A GOOD IDEA TO GO' },
  { id: 26, text: 'Arthur has the talent to become a concert pianist.', keyword: 'THAT', secondSentence: 'Arthur is so .................................................. could become a concert pianist.', answer: 'TALENTED THAT HE' },
  { id: 27, text: '‘Do you know when the match starts, Sally?’ asked Mary.', keyword: 'IF', secondSentence: 'Mary asked Sally .................................................. time the match started.', answer: 'IF SHE KNEW WHAT' },
  { id: 28, text: 'I knocked for ages at Ruth’s door but I got no reply.', keyword: 'LONG', secondSentence: 'I .................................................. knocking at Ruth’s door but I got no reply.', answer: 'KNOCKED FOR A LONG TIME' },
  { id: 29, text: 'Everyone says that the band is planning to go on a world tour next year.', keyword: 'SAID', secondSentence: 'The band .................................................. planning to go on a world tour next year.', answer: 'IS SAID TO BE' },
  { id: 30, text: 'I’d prefer not to cancel the meeting.', keyword: 'CALL', secondSentence: 'I’d rather .................................................. the meeting.', answer: 'NOT CALL OFF' }
];

export default function Part4Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers } = useExam();
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    if (!globalStart) setGlobalStart(new Date());
    const stored = answers?.[EXAM_ID]?.[PART_ID] || {};
    setUserAnswers(stored);
    const initialFeedback = {};
    questions.forEach(q => {
      const input = stored[q.id]?.trim().toUpperCase();
      if (input) {
        initialFeedback[q.id] = {
          correct: input === q.answer.toUpperCase(),
          answer: q.answer
        };
      }
    });
    setFeedback(initialFeedback);
  }, [answers, globalStart, setGlobalStart]);

  const handleKeyPress = (e, id, correctAnswer) => {
    if (e.key === 'Enter' && !feedback[id]) {
      const input = userAnswers[id]?.trim().toUpperCase();
      updateAnswer(EXAM_ID, PART_ID, id, input);
      setFeedback(prev => ({
        ...prev,
        [id]: {
          correct: input === correctAnswer.toUpperCase(),
          answer: correctAnswer
        }
      }));
    }
  };

  const handleChange = (e, id) => {
    if (!feedback[id]) {
      setUserAnswers({ ...userAnswers, [id]: e.target.value });
    }
  };

  const total = questions.length;
  const answered = Object.keys(feedback).length;
  const score = Object.values(feedback).filter(f => f.correct).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const progress = Math.round((answered / total) * 100);
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <main className="shell part-page">
      <header className="header">
        <h1>Part 4: Key Word Transformations</h1>
        <p>Complete the second sentence so that it means the same as the first, using the word given. Use between two and five words.</p>
      </header>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Progress: {progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Timer */}
      <div className="timer">
        ⏱️ Time remaining for Parts 1–7: {formatTime(Math.max(90 * 60 - sectionTimers.reading, 0))}
      </div>

      {/* Questions */}
      <section className="questions-section">
        {questions.map(q => (
          <div key={q.id} className="transformation-question">
            <div className="question-content">
              <p><strong>{q.id}.</strong> {q.text}</p>
              <p className="keyword">{q.keyword}</p>
              <p>{q.secondSentence}</p>
              <input
                type="text"
                placeholder="Type your answer"
                value={userAnswers[q.id] || ''}
                onChange={(e) => handleChange(e, q.id)}
                onKeyDown={(e) => handleKeyPress(e, q.id, q.answer)}
                disabled={!!feedback[q.id]}
                className={`transformation-input ${feedback[q.id]?.correct ? 'correct' : feedback[q.id] ? 'incorrect' : ''}`}
              />
              {feedback[q.id] && (
                <div className="feedback">
                  {feedback[q.id].correct ? (
                    <span className="correct">✔ Correct</span>
                  ) : (
                    <span className="incorrect">
                      ✘ Incorrect. Correct answer: <strong>{feedback[q.id].answer}</strong>
                    </span>
                  )}
                  <button className="explanation-button">
                    📘 Obtener explicación
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Score */}
      <div className="score-section">
        <h3>Your score: {score} / {total}</h3>
        <p className="score-info">
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {answered === total && (
          passed ? (
            <p className="passed">✅ You passed the test!</p>
          ) : (
            <p className="failed">❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      {/* Navigation */}
      <div className="navigation">
        <Link href="/niveles/c1/exam-1/part-3" className="nav-button">
          ⬅ Back to Part 3
        </Link>
        <Link href="/niveles/c1/exam-1/part-5" className="nav-button nav-button--next">
          Next ➡️
        </Link>
      </div>

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .part-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .header h1{font-size:1.8rem;font-weight:bold;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666;font-size:1rem}
      .progress-section{margin:1rem 0}
      .progress-info{margin-bottom:0.25rem;text-align:right;font-weight:bold;font-size:0.9rem;color:#333}
      .progress-bar{height:12px;background-color:#ddd;border-radius:6px;overflow:hidden;margin-bottom:1rem}
      .progress-fill{background-color:#3b82f6;height:100%;transition:width 0.3s}
      .timer{text-align:right;font-size:0.95rem;font-weight:bold;color:#333;margin-bottom:1rem}
      .questions-section{margin-top:2rem}
      .transformation-question{margin-bottom:2rem;background:#fefefe;padding:1rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
      .question-content p{margin-bottom:0.5rem;color:var(--text)}
      .keyword{font-weight:bold;color:#0070f3;font-size:1.1rem}
      .transformation-input{width:100%;padding:0.5rem;font-size:1rem;border:1px solid #ccc;border-radius:4px;margin-top:0.5rem;transition:all 0.2s}
      .transformation-input:focus{outline:none;border-color:#0070f3;box-shadow:0 0 0 2px rgba(0,112,243,0.2)}
      .transformation-input.correct{background-color:#d4edda;border-color:#28a745}
      .transformation-input.incorrect{background-color:#f8d7da;border-color:#dc3545}
      .feedback{margin-top:0.5rem}
      .correct{color:green}
      .incorrect{color:red}
      .explanation-button{margin-top:0.5rem;padding:0.3rem 0.6rem;font-weight:bold;font-size:0.9rem;cursor:pointer;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;transition:background 0.2s}
      .explanation-button:hover{background:#fde68a}
      .score-section{margin-top:2.5rem}
      .score-section h3{margin-bottom:0.5rem;color:var(--text)}
      .score-info{font-size:0.95rem;color:#333;margin-bottom:0.5rem}
      .passed{color:green;font-weight:bold}
      .failed{color:red;font-weight:bold}
      .navigation{margin-top:2.5rem;display:flex;justify-content:space-between;align-items:center}
      .nav-button{text-decoration:none;color:#0070f3;font-weight:bold;padding:0.5rem 1rem;border:1px solid #0070f3;border-radius:4px;background:transparent;cursor:pointer;transition:all 0.2s}
      .nav-button:hover{background:#0070f3;color:#fff}
      .nav-button--next{background:#0070f3;color:#fff}
      .nav-button--next:hover{background:#005bb5}
    `}</style>
  );
}
