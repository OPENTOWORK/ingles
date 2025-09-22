'use client';
import { useState } from 'react';
import Link from 'next/link';

const questions = [
  {
    id: 1,
    text: "(1) ........",
    options: ["instead", "rather", "except", "sooner"],
    correct: "B"
  },
  {
    id: 2,
    text: "(2) ........",
    options: ["cause", "mean", "result", "lead"],
    correct: "D"
  },
  {
    id: 3,
    text: "(3) ........",
    options: ["accomplish", "access", "approach", "admit"],
    correct: "B"
  },
  {
    id: 4,
    text: "(4) ........",
    options: ["fee", "price", "charge", "expense"],
    correct: "D"
  },
  {
    id: 5,
    text: "(5) ........",
    options: ["describe", "define", "remark", "regard"],
    correct: "C"
  },
  {
    id: 6,
    text: "(6) ........",
    options: ["reveals", "opens", "begins", "arises"],
    correct: "A"
  },
  {
    id: 7,
    text: "(7) ........",
    options: ["older", "greater", "higher", "further"],
    correct: "D"
  },
  {
    id: 8,
    text: "(8) ........",
    options: ["attended", "participated", "included", "associated"],
    correct: "B"
  }
];

export default function Part1() {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState({});

  const handleSelect = (id, option) => {
    const isCorrect = questions.find(q => q.id === id).correct === option;
    setAnswers({ ...answers, [id]: option });
    setShowResult({ ...showResult, [id]: isCorrect });
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Part 1: Multiple-Choice Cloze</h1>

      <div style={{ backgroundColor: "#f5f5f5", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
        <p>
          Genealogy is a <strong>(1)</strong> ........ of history. It concerns family history, <strong>(2)</strong> ........ than
          the national or world history studied at school. It doesn’t merely involve drawing a family tree, however –
          tracing your family history can also <strong>(3)</strong> ........ in learning about your roots and your identity.
          The internet enables millions of people worldwide to <strong>(4)</strong> ........ information about their family
          history, without great <strong>(5)</strong> ........ .
        </p>
        <p>
          People who research their family history often <strong>(6)</strong> ........ that it’s a fascinating hobby which
          <strong> (7)</strong> ........ a lot about where they come from and whether they have famous ancestors.
          According to a survey involving 900 people who had researched their family history, the chances of discovering
          a celebrity in your past are one in ten. The survey also concluded that the <strong>(8)</strong> ........ back you
          follow your family line, the more likely you are to find a relation who was much wealthier than you are.
        </p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Choose your answers</h2>

      {questions.map((q) => (
        <div key={q.id} style={{ marginTop: "1.5rem" }}>
          <p><strong>({q.id})</strong> Choose the correct word:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {q.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const selected = answers[q.id] === letter;
              const correct = q.correct === letter;
              const isCorrect = showResult[q.id] !== undefined && correct;
              const isWrong = showResult[q.id] === false && selected;

              return (
                <button
                  key={letter}
                  onClick={() => handleSelect(q.id, letter)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: isCorrect
                      ? "lightgreen"
                      : isWrong
                      ? "#f8d7da"
                      : selected
                      ? "#cce4ff"
                      : "#eee",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {letter}. {opt}
                </button>
              );
            })}
          </div>

          {showResult[q.id] !== undefined && (
            <div style={{ marginTop: "0.5rem" }}>
              {showResult[q.id] ? (
                <span style={{ color: "green" }}>✔ Correct</span>
              ) : (
                <span style={{ color: "red" }}>
                  ✘ Incorrect. Correct answer: {q.correct}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/b2">⬅ Back to B2 Overview</Link>
        <Link href="/niveles/b2/exam-1/part-2">Next ➡️</Link>
      </div>
    </main>
  );
}
