"use client";

import { useState, useEffect } from 'react';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';

const correctAnswers = {
  17: 'producer',
  18: 'illness',
  19: 'effective',
  20: 'scientists',
  21: 'addition',
  22: 'pressure',
  23: 'disadvantage',
  24: 'spicy'
};

const baseWords = {
  17: 'PRODUCT',
  18: 'ILL',
  19: 'EFFECT',
  20: 'SCIENCE',
  21: 'ADD',
  22: 'PRESS',
  23: 'ADVANTAGE',
  24: 'SPICE'
};

const EXAM_ID = 'exam-1';
const PART_ID = 'part-3';
const CURRENT_PART = 3;
const TOTAL_PARTS = 17;

export default function Part3() {
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
  const score = Object.values(feedback).filter(f => f.correct).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const allAnswered = Object.keys(feedback).length === total;
  const answered = Object.keys(feedback).length;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "#e6f0ff" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Part 3: Word Formation</h1>

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
        ⏱️ Time remaining for Parts 1–7: {formatTime(Math.max(90 * 60 - sectionTimers.reading, 0))}
      </div>

      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#333" }}>
        In this part, you will read a short text containing eight gaps. Each gap corresponds to a word that needs to be formed from a given base word. 
        You must use the correct form of the word to complete the sentence meaningfully and grammatically. This exercise tests your understanding of word families, prefixes, suffixes, and spelling.
      </p>

      <h2 style={{ marginTop: "1rem", fontWeight: "normal" }}>An Incredible Vegetable</h2>

      <div style={{ backgroundColor: "#fefefe", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
        <p>
          Garlic, a member of the Liliaceae family which also includes onions, is <strong>(0)</strong> <em>commonly</em> used in cooking all around the world.
          China is currently the largest <strong>(17)</strong> ........ of garlic, which is particularly associated with the dishes of northern Africa and southern Europe.
          It is native to central Asia and has long had a history as a health-giving food, used both to prevent and cure <strong>(18)</strong> ........ .
        </p>
        <p>
          In Ancient Egypt, workers building the pyramids were given garlic to keep them strong, while Olympic athletes in Greece ate it to increase their resistance to infection.
        </p>
        <p>
          The forefather of antibiotic medicine, Louis Pasteur, claimed garlic was as <strong>(19)</strong> ........ as penicillin in treating infections.
          Modern-day <strong>(20)</strong> ........ have proved that garlic can indeed kill bacteria and even some viruses, so it can be very useful for people who have coughs and colds.
        </p>
        <p>
          In <strong>(21)</strong> ........ , some doctors believe that garlic can reduce blood <strong>(22)</strong> ........ .
        </p>
        <p>
          The only <strong>(23)</strong> ........ to this truly amazing food is that the strong and rather <strong>(24)</strong> ........ smell of garlic is not the most pleasant!
        </p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Your Answers (press Enter to check)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {inputs.map((n) => (
          <div key={n}>
            <label htmlFor={`gap-${n}`}>({n}) {baseWords[n]}</label>
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
                  onClick={() => alert(`Explicación para la palabra (${n}): ${baseWords[n]}`)}
                  style={{
                    marginTop: "0.4rem",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #facc15",
                    borderRadius: "4px",
                    padding: "0.3rem 0.6rem",
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
        ))}
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {allAnswered && (
          passed ? (
            <p style={{ color: "green" }}>✅ You passed the test!</p>
          ) : (
            <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/c1/exam-1/part-2">⬅ Back to Part 2</Link>
        <Link href="/niveles/c1/exam-1/part-4">Next ➡️</Link>
      </div>
    </main>
  );
}