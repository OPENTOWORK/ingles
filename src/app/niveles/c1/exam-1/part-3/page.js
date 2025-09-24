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
    <main className="shell part-page">
      <header className="header">
        <h1>Part 3: Word Formation</h1>
        <p>In this part, you will read a short text containing eight gaps. Each gap corresponds to a word that needs to be formed from a given base word.</p>
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

      {/* Instructions */}
      <div className="instructions">
        <p>You must use the correct form of the word to complete the sentence meaningfully and grammatically. This exercise tests your understanding of word families, prefixes, suffixes, and spelling.</p>
      </div>

      {/* Text */}
      <div className="text-section">
        <h2>An Incredible Vegetable</h2>
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

      {/* Questions */}
      <section className="questions-section">
        <h2>Your Answers (press Enter to check)</h2>
        <div className="inputs-grid">
          {inputs.map((n) => (
            <div key={n} className="input-group">
              <label htmlFor={`gap-${n}`}>({n}) {baseWords[n]}</label>
              <input
                type="text"
                id={`gap-${n}`}
                placeholder="Your answer"
                value={localAnswers[n] || ""}
                onChange={(e) => handleChange(e, n)}
                onKeyDown={(e) => handleKeyPress(e, n)}
                disabled={!!feedback[n]}
                className={`answer-input ${feedback[n]?.correct === true ? 'correct' : feedback[n]?.correct === false ? 'incorrect' : ''}`}
              />
              {feedback[n] && (
                <div className="feedback">
                  {feedback[n].correct ? (
                    <span className="correct">✔ Correct</span>
                  ) : (
                    <span className="incorrect">
                      ✘ Incorrect. Answer: <strong>{feedback[n].answer}</strong>
                    </span>
                  )}
                  <button
                    onClick={() => alert(`Explicación para la palabra (${n}): ${baseWords[n]}`)}
                    className="explanation-button"
                  >
                    📘 Obtener explicación
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Score */}
      <div className="score-section">
        <h3>Your score: {score} / {total}</h3>
        <p className="score-info">
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {allAnswered && (
          passed ? (
            <p className="passed">✅ You passed the test!</p>
          ) : (
            <p className="failed">❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      {/* Navigation */}
      <div className="navigation">
        <Link href="/niveles/c1/exam-1/part-2" className="nav-button">
          ⬅ Back to Part 2
        </Link>
        <Link href="/niveles/c1/exam-1/part-4" className="nav-button nav-button--next">
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
      .instructions{margin:1rem 0;color:#333}
      .text-section{background-color:#fefefe;padding:1rem;border-radius:6px;line-height:1.6;margin-top:1.5rem;box-shadow:0 0 4px rgba(0,0,0,0.1)}
      .text-section h2{margin-top:0;margin-bottom:1rem;font-weight:normal;color:var(--text)}
      .questions-section{margin-top:2rem}
      .questions-section h2{margin-bottom:1rem;color:var(--text)}
      .inputs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem}
      .input-group{display:flex;flex-direction:column;gap:0.25rem}
      .input-group label{font-weight:bold;color:var(--text)}
      .answer-input{width:100%;padding:0.5rem;font-size:1rem;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;transition:all 0.2s}
      .answer-input:focus{outline:none;border-color:#0070f3;box-shadow:0 0 0 2px rgba(0,112,243,0.2)}
      .answer-input.correct{background-color:#d4edda;border-color:#28a745}
      .answer-input.incorrect{background-color:#f8d7da;border-color:#dc3545}
      .feedback{margin-top:0.25rem}
      .correct{color:green}
      .incorrect{color:red}
      .explanation-button{margin-top:0.4rem;display:inline-block;background-color:#fef3c7;border:1px solid #facc15;border-radius:4px;padding:0.3rem 0.6rem;font-weight:bold;font-size:0.9rem;cursor:pointer;transition:background 0.2s}
      .explanation-button:hover{background-color:#fde68a}
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