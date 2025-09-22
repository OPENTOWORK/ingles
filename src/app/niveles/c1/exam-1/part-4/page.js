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
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', background: '#e6f0ff' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Part 4: Key Word Transformations</h1>

      <div style={{ marginBottom: '0.25rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>Progress: {progress}%</div>
      <div style={{ height: '12px', backgroundColor: '#ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ width: `${progress}%`, backgroundColor: '#3b82f6', height: '100%' }} />
      </div>

      <div style={{ textAlign: 'right', fontSize: '0.95rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
        ⏱️ Time remaining for Parts 1–7: {formatTime(Math.max(90 * 60 - sectionTimers.reading, 0))}
      </div>

      <p style={{ fontSize: '1rem', color: '#333', marginBottom: '2rem' }}>
        Complete the second sentence so that it means the same as the first, using the word given. Use between two and five words.
      </p>

      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: '2rem', background: '#fefefe', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>{q.id}.</strong> {q.text}</p>
          <p style={{ fontWeight: 'bold' }}>{q.keyword}</p>
          <p>{q.secondSentence}</p>
          <input
            type="text"
            placeholder="Type your answer"
            value={userAnswers[q.id] || ''}
            onChange={(e) => handleChange(e, q.id)}
            onKeyDown={(e) => handleKeyPress(e, q.id, q.answer)}
            disabled={!!feedback[q.id]}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: feedback[q.id]?.correct ? '#d4edda' : feedback[q.id] ? '#f8d7da' : 'white'
            }}
          />
          {feedback[q.id] && (
            <p style={{ marginTop: '0.5rem' }}>
              {feedback[q.id].correct ? (
                <span style={{ color: 'green' }}>✔ Correct</span>
              ) : (
                <span style={{ color: 'red' }}>✘ Incorrect. Correct answer: <strong>{feedback[q.id].answer}</strong></span>
              )}
              <br />
              <button style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                📘 Obtener explicación
              </button>
            </p>
          )}
        </div>
      ))}

      <div style={{ marginTop: '2.5rem' }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: '0.95rem', color: '#333' }}>🎯 You need <strong>{required}</strong> correct answers to pass.</p>
        {answered === total && (
          passed ? (
            <p style={{ color: 'green' }}>✅ You passed the test!</p>
          ) : (
            <p style={{ color: 'red' }}>❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/niveles/c1/exam-1/part-3">⬅ Back to Part 3</Link>
        <Link href="/niveles/c1/exam-1/part-5">Next ➡️</Link>
      </div>
    </main>
  );
}
