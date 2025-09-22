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
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "#e6f0ff" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Part 1: Multiple-Choice Cloze</h1>

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

      <div style={{
        textAlign: "right",
        fontSize: "0.95rem",
        fontWeight: "bold",
        color: timeRemaining <= 60 ? "red" : "#333",
        marginBottom: "1rem"
      }}>
        ⏳ Time remaining for Parts 1–7: {formatTime(timeRemaining)}
      </div>

      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#333" }}>
        In this part, you read a short text with eight gaps. For each gap, there is a choice of four words (A, B, C, or D) to fill in.
        You must choose the word that fits best in the context of the sentence and the whole text.
      </p>

      <div style={{
        backgroundColor: "#fefefe",
        padding: "1rem",
        borderRadius: "6px",
        lineHeight: "1.6",
        marginTop: "1.5rem",
        boxShadow: "0 0 4px rgba(0,0,0,0.1)"
      }}>
        <p>
          Genealogy is a <strong>(1)</strong> ........ of history. It concerns family history, <strong>(2)</strong> ........ than
          the national or world history studied at school. It doesn’t merely involve drawing a family tree, however – tracing your family history can also
          <strong>(3)</strong> ........ in learning about your roots and your identity. The internet enables millions of people worldwide to
          <strong>(4)</strong> ........ information about their family history, without great <strong>(5)</strong> ........ .
        </p>
        <p>
          People who research their family history often <strong>(6)</strong> ........ that it’s a fascinating hobby which
          <strong>(7)</strong> ........ a lot about where they come from and whether they have famous ancestors.
          According to a survey involving 900 people who had researched their family history, the chances of discovering
          a celebrity in your past are one in ten. The survey also concluded that the <strong>(8)</strong> ........ back you
          follow your family line, the more likely you are to find a relation who was much wealthier than you are.
        </p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Choose your answers</h2>

      {questions.map((q) => {
        const selected = partAnswers[q.id];
        const correctLetter = q.answer;
        const wasAnswered = !!selected;

        return (
          <div key={q.id} style={{ marginTop: "1.5rem" }}>
            <p><strong>({q.id})</strong> Choose the correct word:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
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
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor,
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: wasAnswered ? "default" : "pointer",
                    }}
                  >
                    {letter}. {opt}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div style={{ marginTop: "0.5rem" }}>
                {selected === correctLetter ? (
                  <span style={{ color: "green" }}>✔ Correct</span>
                ) : (
                  <span style={{ color: "red" }}>
                    ✘ Incorrect. Correct answer: {correctLetter}
                  </span>
                )}

                <button
                  onClick={() => alert(`📘 Explicación para la pregunta (${q.id})`)}
                  style={{
                    marginTop: "0.5rem",
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
              </div>
            )}
          </div>
        );
      })}

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
        <button onClick={handleBackToIndex} className="text-blue-600 hover:underline">
          ⬅ Back to C1 Overview
        </button>
        <Link href="/niveles/c1/exam-1/part-2">Next ➡️</Link>
      </div>
    </main>
  );
}
