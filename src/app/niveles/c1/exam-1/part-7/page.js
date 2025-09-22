'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-7';
const TOTAL_TIME = 90 * 60;

const correctAnswers = {
  43: 'A',
  44: 'C',
  45: 'B',
  46: 'D',
  47: 'C',
  48: 'B',
  49: 'C',
  50: 'B',
  51: 'D',
  52: 'D',
};

const questions = {
  43: 'states how surprised the writer was at Duncan’s early difficulties?',
  44: 'says that Duncan sometimes seems much more mature than he really is?',
  45: 'describes the frustration felt by Duncan’s father?',
  46: 'says that Duncan is on course to reach a high point in his profession?',
  47: 'suggests that Duncan caught up with his team-mates in terms of physical development?',
  48: 'explains how Duncan was a good all-round sportsperson?',
  49: 'gives an example of how Gavin reassured his son?',
  50: 'mentions Duncan’s current club’s low opinion of him at one time?',
  51: 'mentions a personal success despite a failure for the team?',
  52: 'explains how Duncan and his father are fulfilling a similar role?'
};

export default function Part7Page() {
  const { answers: globalAnswers, updateAnswer, sectionTimers } = useExam();
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const stored = globalAnswers?.[EXAM_ID]?.[PART_ID] || {};
    setAnswers(stored);

    const initialFeedback = {};
    for (const [id, correct] of Object.entries(correctAnswers)) {
      const val = stored[id]?.trim().toUpperCase();
      if (val) {
        initialFeedback[id] = val === correct;
      }
    }
    setFeedback(initialFeedback);
  }, [globalAnswers]);

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && feedback[index] === undefined) {
      const value = answers[index]?.trim().toUpperCase();
      const isCorrect = value === correctAnswers[index];
      setFeedback(prev => ({ ...prev, [index]: isCorrect }));
      updateAnswer(EXAM_ID, PART_ID, index, value);
    }
  };

  const handleChange = (e, index) => {
    if (feedback[index] !== undefined) return;
    const updated = { ...answers, [index]: e.target.value };
    setAnswers(updated);
  };

  const total = Object.keys(correctAnswers).length;
  const answered = Object.keys(feedback).length;
  const score = Object.entries(feedback).filter(([_, correct]) => correct).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const progress = Math.round((answered / total) * 100);
  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.reading, 0);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', background: '#e6f0ff' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Part 7: Multiple Matching</h1>

      <div style={{ marginBottom: "0.25rem", textAlign: "right", fontWeight: "bold", fontSize: "0.9rem" }}>
        Progress: {progress}%
      </div>
      <div style={{ height: "12px", backgroundColor: "#ddd", borderRadius: "6px", overflow: "hidden", marginBottom: "1rem" }}>
        <div style={{ width: `${progress}%`, backgroundColor: "#3b82f6", height: "100%" }} />
      </div>
      <div style={{
        textAlign: "right",
        fontSize: "0.95rem",
        fontWeight: "bold",
        color: timeRemaining <= 60 ? "red" : "#333",
        marginBottom: "1rem"
      }}>
        ⏳ Time remaining for Parts 1–7: {formatTime(timeRemaining)}
      </div>

      <p style={{ maxWidth: '800px', margin: '1rem auto 2rem', lineHeight: '1.6', textAlign: 'center', color: '#333' }}>
        You are going to read a newspaper article about a young professional footballer.  
        For questions 43–52, choose from the sections (A–D).  
        The sections may be chosen more than once.
      </p>

      <section style={{ backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '8px', lineHeight: '1.6', marginBottom: '2rem' }}>
        <p><strong>A</strong> It’s my first time driving to Chelsea’s training ground and I turn off slightly too early... career was nearly all over before it began.</p>
        <p><strong>B</strong> Gavin, himself a fine footballer – a member of the national team in his time – and now a professional coach... and got much stronger as well.</p>
        <p><strong>C</strong> Duncan takes up the story: ‘The first half of that season I played in the youth team... you have to use your brain a lot more.’</p>
        <p><strong>D</strong> Not every kid gets advice from an ex-England player over dinner, nor their own private training sessions... That’s for somebody else to decide.’</p>
      </section>

      <h2 style={{ marginBottom: '1rem' }}>Questions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {Object.entries(questions).map(([num, text]) => {
          const value = answers[num] || '';
          const isCorrect = feedback[num] === true;
          const isWrong = feedback[num] === false;
          const correct = correctAnswers[num];

          return (
            <div key={num}>
              <label htmlFor={`q${num}`} style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                {num}. <span style={{ fontWeight: 'normal' }}>{text}</span>
              </label>
              <input
                id={`q${num}`}
                value={value}
                onChange={(e) => handleChange(e, num)}
                onKeyDown={(e) => handleKeyPress(e, num)}
                placeholder="A, B, C or D"
                maxLength={1}
                disabled={feedback[num] !== undefined}
                style={{
                  padding: '0.5rem',
                  fontSize: '1rem',
                  width: '4rem',
                  textAlign: 'center',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: isCorrect ? '#d4edda' : isWrong ? '#f8d7da' : 'white'
                }}
              />
              {feedback[num] !== undefined && (
                <>
                  <p style={{ marginTop: '0.3rem', color: isCorrect ? 'green' : 'red' }}>
                    {isCorrect ? '✔ Correct' : `✘ Incorrect. Answer: ${correct}`}
                  </p>
                  <button
                    onClick={() => alert(`📘 Explicación para la pregunta ${num}`)}
                    style={{
                      marginTop: '0.2rem',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #facc15',
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    📘 Obtener explicación
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {answered === total && (
          passed
            ? <p style={{ color: "green" }}>✅ You passed the test!</p>
            : <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
        )}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/niveles/c1/exam-1/part-6">⬅ Back to Part 6</Link>
        <Link href="/niveles/c1/exam-1/part-8">Next ➡️</Link>
      </div>
    </main>
  );
}
