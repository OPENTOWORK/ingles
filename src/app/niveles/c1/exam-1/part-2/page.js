'use client';

import { useState, useEffect } from 'react';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';

const correctAnswers = {
  1: 'as',
  9: 'where',
  10: 'so',
  11: 'myself',
  12: 'in',
  13: 'that',
  14: 'on',
  15: 'from',
  16: 'any'
};

const EXAM_ID = 'exam-1';
const PART_ID = 'part-2';
const CURRENT_PART = 2;
const TOTAL_PARTS = 17;

export default function Part2() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers } = useExam();
  const [feedback, setFeedback] = useState({});
  const [localAnswers, setLocalAnswers] = useState({});

  useEffect(() => {
    if (!globalStart) {
      setGlobalStart(new Date());
    }

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
    setFeedback(prefeedback);
  }, [answers, globalStart, setGlobalStart]);

  const handleChange = (e, index) => {
    setLocalAnswers({ ...localAnswers, [index]: e.target.value });
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && !feedback[index]) {
      e.preventDefault();
      const userInput = localAnswers[index]?.trim().toLowerCase();
      const correct = correctAnswers[index];

      updateAnswer(EXAM_ID, PART_ID, index, userInput);

      setFeedback({
        ...feedback,
        [index]: {
          correct: userInput === correct,
          answer: correct
        }
      });
    }
  };

  const inputs = Object.keys(correctAnswers).map(Number);
  const total = inputs.length;
  const score = Object.values(feedback).filter((f) => f.correct).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const answered = Object.keys(feedback).length;
  const progress = Math.round((answered / total) * 100);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "#e6f0ff" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Part 2: Open Cloze</h1>

      <div style={{ marginBottom: "0.25rem", textAlign: "right", fontWeight: "bold", fontSize: "0.9rem", color: "#333" }}>
        Progress: {progress}%
      </div>

      <div style={{
        height: "12px",
        backgroundColor: "#ddd",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "1rem"
      }}>
        <div style={{
          width: `${progress}%`,
          backgroundColor: "#3b82f6",
          height: "100%",
          transition: "width 0.3s"
        }} />
      </div>

      <div style={{ textAlign: "right", fontSize: "0.95rem", fontWeight: "bold", color: "#333", marginBottom: "1rem" }}>
        ⏳ Time remaining for Parts 1–7: {formatTime(90 * 60 - sectionTimers.reading)}
      </div>

      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#333" }}>
        In this part, you read a text with gaps. Each gap requires a single word. 
        You must write a grammatically and lexically correct word that fits the context.
      </p>

      <h2 style={{ marginTop: "1rem", fontWeight: "normal" }}>Motorbike stunt rider</h2>

      <div style={{ backgroundColor: "#fefefe", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
        <p>
          I work <strong>(0)</strong> <em>as</em> a motorbike stunt rider – that is, I do tricks on my motorbike at shows.
          The Le Mans race track in France was <strong>(9)</strong> ........ I first saw some guys doing motorbike stunts.
          I’d never seen anyone riding a motorbike using just the back wheel before and I was <strong>(10)</strong> ........ impressed
          I went straight home and taught <strong>(11)</strong> ........ to do the same.
        </p>
        <p>
          I have a degree <strong>(12)</strong> ........ mechanical engineering; this helps me to look at the physics <strong>(13)</strong> ........
          lies behind each stunt. In addition to being responsible for design changes to the motorbike, I have to work <strong>(14)</strong> ........
          every stunt I do. Apart <strong>(15)</strong> ........ some minor mechanical problem happening occasionally,
          I never feel in <strong>(16)</strong> ........ kind of danger because I’m very experienced.
        </p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Your Answers (press Enter to check)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {inputs.map((n) => (
          <div key={n}>
            <label htmlFor={`gap-${n}`}>({n})</label>
            <input
              type="text"
              id={`gap-${n}`}
              placeholder="Your answer"
              value={localAnswers[n] || ""}
              onChange={(e) => handleChange(e, n)}
              onKeyDown={(e) => handleKeyPress(e, n)}
              disabled={!!feedback[n]}
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
                backgroundColor:
                  feedback[n]?.correct === true ? "#d4edda" :
                  feedback[n]?.correct === false ? "#f8d7da" : "white"
              }}
            />
            {feedback[n] && (
              <>
                <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  {feedback[n].correct ? (
                    <span style={{ color: "green" }}>✔ Correct</span>
                  ) : (
                    <span style={{ color: "red" }}>
                      ✘ Incorrect. Answer: <strong>{feedback[n].answer}</strong>
                    </span>
                  )}
                </p>
                <button
                  onClick={() => alert(`📘 Explicación para la respuesta (${n})`)}
                  style={{
                    marginTop: "0.3rem",
                    display: "inline-block",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "6px",
                    padding: "0.4rem 0.8rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  📘 Obtener explicación
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {answered === total && (
          passed ? (
            <p style={{ color: "green" }}>✅ You passed the test!</p>
          ) : (
            <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/c1/exam-1/part-1">⬅ Back to Part 1</Link>
        <Link href="/niveles/c1/exam-1/part-3">Next ➡️</Link>
      </div>
    </main>
  );
}
