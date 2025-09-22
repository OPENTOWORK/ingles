'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-6';
const TOTAL_TIME = 90 * 60;

const correctAnswers = {
  37: 'G',
  38: 'B',
  39: 'F',
  40: 'A',
  41: 'E',
  42: 'D'
};

const options = {
  A: "Through endless tries at the usual exercises and frequent failures, ballet dancers develop the neural pathways in the brain necessary to control accurate, fast and smooth movement.",
  B: "The ballet shoe offers some support, but the real strength is in the muscles, built up through training.",
  C: "As technology takes away activity from the lives of many, perhaps the ballet dancer’s physicality is ever more difficult for most people to imagine.",
  D: "Ballet technique is certainly extreme but it is not, in itself, dangerous.",
  E: "The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result.",
  F: "No one avoids this: it is ballet’s great democratiser, the well established members of the company working alongside the newest recruits.",
  G: "It takes at least a decade of high-quality, regular practice to become an expert in any physical discipline."
};

export default function Part6Page() {
  const { answers, updateAnswer, sectionTimers } = useExam();
  const [localAnswers, setLocalAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const stored = answers?.[EXAM_ID]?.[PART_ID] || {};
    setLocalAnswers(stored);

    const initialFeedback = {};
    Object.entries(stored).forEach(([num, val]) => {
      const number = parseInt(num);
      const isCorrect = val.trim().toUpperCase() === correctAnswers[number];
      initialFeedback[number] = isCorrect;
    });
    setFeedback(initialFeedback);
  }, [answers]);

  const handleCheck = (number) => {
    const userAnswer = localAnswers[number]?.trim().toUpperCase();
    const correct = correctAnswers[number];
    setFeedback(prev => ({ ...prev, [number]: userAnswer === correct }));
  };

  const handleSelect = (num, value) => {
    const updated = { ...localAnswers, [num]: value };
    setLocalAnswers(updated);
    updateAnswer(EXAM_ID, PART_ID, num, value);
  };

  const total = Object.keys(correctAnswers).length;
  const answered = Object.keys(feedback).length;
  const score = Object.keys(feedback).filter(key => feedback[key] === true).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const allAnswered = answered === total;
  const progress = Math.round((answered / total) * 100);
  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.reading, 0);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "#e6f0ff" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Part 6: Gapped Text</h1>

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

      <p style={{ fontSize: "1rem", color: "#333", marginBottom: "2rem", textAlign: "center" }}>
        Choose the correct sentence (A–G) for each gap. One option is extra. This part tests your ability to understand the structure and cohesion of a text.
      </p>

      <div style={{ backgroundColor: "#f9f9f9", padding: "1.5rem", borderRadius: "8px", lineHeight: 1.6 }}>
        <p><em>A former classical ballet dancer explains what ballet training actually involves.</em></p>
        <p>What we ballet dancers do is instinctive, but instinct learnt through a decade of training... <strong>(37)</strong> ...capacity of the healthy human body.</p>
        <p>Over the course of my dancing life... <strong>(38)</strong> ...while maximum flexibility can still be achieved.</p>
        <p>Those first classes I took... <strong>(39)</strong> Even the leading dancers have to do it.</p>
        <p>These classes serve two distinct purposes... <strong>(40)</strong> ...angles impossible to the average person.</p>
        <p>The human body is designed to adapt... <strong>(41)</strong> This level of physical fluency doesn’t hurt; it feels good.</p>
        <p><strong>(42)</strong> But they should not be misled: there is a difference between hard work and hardship.</p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Select the correct option (A–G):</h2>

      {[37, 38, 39, 40, 41, 42].map((num) => {
        const selected = localAnswers[num];
        const correct = correctAnswers[num];
        const isCorrect = feedback[num] === true;
        const isWrong = feedback[num] === false;

        return (
          <div key={num} style={{ marginTop: "1.5rem", background: "#f0f0f0", padding: "1rem", borderRadius: "6px" }}>
            <label htmlFor={`select-${num}`}><strong>({num})</strong></label>
            <select
              id={`select-${num}`}
              value={selected || ''}
              onChange={(e) => handleSelect(num, e.target.value)}
              onBlur={() => handleCheck(num)}
              disabled={feedback[num] !== undefined}
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "1rem",
                marginTop: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: isCorrect ? "#d4edda" : isWrong ? "#f8d7da" : "white"
              }}
            >
              <option value="">-- Select an option --</option>
              {Object.entries(options).map(([key, text]) => (
                <option key={key} value={key}>{key}. {text.slice(0, 60)}...</option>
              ))}
            </select>
            {feedback[num] !== undefined && (
              <>
                <p style={{ marginTop: "0.5rem", color: isCorrect ? "green" : "red" }}>
                  {isCorrect ? "✔ Correct" : `✘ Incorrect. Correct answer: ${correct}`}
                </p>
                <button
                  onClick={() => alert(`📘 Explicación para el hueco (${num}): ${options[correct]}`)}
                  style={{
                    marginTop: "0.4rem",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "6px",
                    padding: "0.4rem 0.8rem",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  📘 Obtener explicación
                </button>
              </>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: "2.5rem" }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {allAnswered && (
          passed
            ? <p style={{ color: "green" }}>✅ You passed the test!</p>
            : <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
        )}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/c1/exam-1/part-5">⬅ Back to Part 5</Link>
        <Link href="/niveles/c1/exam-1/part-7">Next ➡️</Link>
      </div>
    </main>
  );
}
