'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const questions = [
  { id: 1, text: "(1)", options: ["instead", "rather", "except", "sooner"], answer: "B" },
  { id: 2, text: "(2)", options: ["cause", "mean", "result", "lead"], answer: "D" },
  { id: 3, text: "(3)", options: ["accomplish", "access", "approach", "admit"], answer: "B" },
  { id: 4, text: "(4)", options: ["fee", "price", "charge", "expense"], answer: "D" },
  { id: 5, text: "(5)", options: ["describe", "define", "remark", "regard"], answer: "C" },
  { id: 6, text: "(6)", options: ["reveals", "opens", "begins", "arises"], answer: "A" },
  { id: 7, text: "(7)", options: ["older", "greater", "higher", "further"], answer: "D" },
  { id: 8, text: "(8)", options: ["attended", "participated", "included", "associated"], answer: "B" },
];

const EXAM_ID = 'exam-1';
const PART_ID = 'part-1';
const TOTAL_TIME = 90 * 60;

export default function Part1Page() {
  const { answers, updateAnswer, globalStart, setGlobalStart, sectionTimers, clearAllAnswers } = useExam();
  const [showResult, setShowResult] = useState({});
  const partAnswers = answers?.[EXAM_ID]?.[PART_ID] || {};

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!globalStart) {
      setGlobalStart(new Date());
    }
  }, [globalStart, setGlobalStart]);

  const handleSelect = (id, selectedLetter) => {
    const correct = questions.find(q => q.id === id)?.answer === selectedLetter;
    updateAnswer(EXAM_ID, PART_ID, id, selectedLetter);
    setShowResult(prev => ({ ...prev, [id]: correct }));
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

  const total = questions.length;
  const answered = Object.keys(partAnswers).length;
  const score = Object.values(showResult).filter(Boolean).length;
  const required = Math.ceil(total * 0.6);
  const passed = score >= required;
  const progress = Math.round((answered / total) * 100);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(TOTAL_TIME - sectionTimers.reading, 0);

  return (
    <main className="shell part-page">
      <header className="header">
        <h1>Part 1: Multiple-Choice Cloze</h1>
        <p>In this part, you read a short text with eight gaps. For each gap, there is a choice of four words (A, B, C, or D) to fill in.</p>
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
        ⏳ Time remaining for Parts 1–7: {formatTime(timeRemaining)}
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>You must choose the word that fits best in the context of the sentence and the whole text.</p>
      </div>

      {/* Text */}
      <div className="text-section">
        <p>
          Genealogy is a <strong>(1)</strong> ........ of history. It concerns family history, <strong>(2)</strong> ........ than
          the national or world history studied at school. It doesn't merely involve drawing a family tree, however – tracing your family history can also
          <strong>(3)</strong> ........ in learning about your roots and your identity. The internet enables millions of people worldwide to
          <strong>(4)</strong> ........ information about their family history, without great <strong>(5)</strong> ........ .
        </p>
        <p>
          People who research their family history often <strong>(6)</strong> ........ that it's a fascinating hobby which
          <strong>(7)</strong> ........ a lot about where they come from and whether they have famous ancestors.
          According to a survey involving 900 people who had researched their family history, the chances of discovering
          a celebrity in your past are one in ten. The survey also concluded that the <strong>(8)</strong> ........ back you
          follow your family line, the more likely you are to find a relation who was much wealthier than you are.
        </p>
      </div>

      {/* Questions */}
      <section className="questions-section">
        <h2>Choose your answers</h2>
        {questions.map((q) => {
          const selected = partAnswers[q.id];
          const correctLetter = q.answer;
          const wasAnswered = !!selected;

          return (
            <div key={q.id} className="question">
              <p><strong>({q.id})</strong> Choose the correct word:</p>
              <div className="options">
                {q.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selected === letter;
                  const isCorrect = letter === correctLetter;

                  let backgroundColor = "#eee";
                  if (wasAnswered) {
                    if (isSelected && isCorrect) backgroundColor = "lightgreen";
                    else if (isSelected && !isCorrect) backgroundColor = "#f8d7da";
                    else if (!isSelected && isCorrect) backgroundColor = "lightgreen";
                  }

                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelect(q.id, letter)}
                      disabled={wasAnswered}
                      className="option-button"
                      style={{ backgroundColor }}
                    >
                      {letter}. {opt}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="feedback">
                  {selected === correctLetter ? (
                    <span className="correct">✔ Correct</span>
                  ) : (
                    <span className="incorrect">
                      ✘ Incorrect. Correct answer: {correctLetter}
                    </span>
                  )}

                  <button
                    onClick={() => alert(`📘 Explicación para la pregunta (${q.id})`)}
                    className="explanation-button"
                  >
                    📘 Obtener explicación
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
        <button onClick={handleBackToIndex} className="nav-button">
          ⬅ Back to C1 Overview
        </button>
        <Link href="/niveles/c1/exam-1/part-2" className="nav-button nav-button--next">
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
      .questions-section{margin-top:2rem}
      .questions-section h2{margin-bottom:1rem;color:var(--text)}
      .question{margin-top:1.5rem}
      .question p{margin-bottom:0.5rem;color:var(--text)}
      .options{display:flex;flex-wrap:wrap;gap:1rem}
      .option-button{padding:0.5rem 1rem;border:1px solid #ccc;border-radius:4px;cursor:pointer;transition:all 0.2s}
      .option-button:disabled{cursor:default}
      .option-button:hover:not(:disabled){background-color:#f0f0f0}
      .feedback{margin-top:0.5rem}
      .correct{color:green}
      .incorrect{color:red}
      .explanation-button{margin-top:0.5rem;display:inline-block;background-color:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:0.4rem 0.8rem;font-weight:bold;cursor:pointer;font-size:0.9rem;transition:background 0.2s}
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
