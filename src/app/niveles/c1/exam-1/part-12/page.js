'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const questions = [
  {
    id: 16,
    text: "Gina’s interest in marine biology dates from",
    options: [
      "her earliest recollections of life in Africa.",
      "one memorable experience in childhood.",
      "the years she spent studying in England.",
      "a postgraduate research project she led."
    ],
    correct: "B"
  },
  {
    id: 17,
    text: "The first wildlife TV series they both worked on",
    options: [
      "made use of a previously untried format.",
      "was not filmed in a natural environment.",
      "was not intended to be taken too seriously.",
      "required them to do background research."
    ],
    correct: "D"
  },
  {
    id: 18,
    text: "How did Thomas feel when he was asked to produce the programmes about Antarctica?",
    options: [
      "disappointed not to be presenting the series",
      "surprised that people thought he was suitable",
      "uncertain how well he would get on with the team",
      "worried about having to spend the winter there"
    ],
    correct: "B"
  },
  {
    id: 19,
    text: "When they were in Antarctica, they would have appreciated",
    options: [
      "a less demanding work schedule.",
      "more time to study certain animals.",
      "a close friend to share their feelings with.",
      "a chance to share their work with colleagues."
    ],
    correct: "D"
  },
  {
    id: 20,
    text: "What was most impressive about the whales they filmed?",
    options: [
      "the unusual sounds the whales made",
      "the number of whales feeding in a small bay",
      "how long the whales stayed feeding in one area",
      "how well the whales co-operated with each other"
    ],
    correct: "D"
  }
];

export default function Part12() {
  const part = 'part-12';
  const { answers, updateAnswer } = useExam();
  const [userAnswers, setUserAnswers] = useState(() => answers?.[part]?.userAnswers || {});
  const [results, setResults] = useState(() => answers?.[part]?.results || {});

  const required = 4;
  const back = "/niveles/c1/exam-1/part-11";
  const next = "/niveles/c1/exam-1/part-13";

  useEffect(() => {
    updateAnswer(part, 'userAnswers', userAnswers);
    updateAnswer(part, 'results', results);
    updateAnswer(part, 'score', Object.values(results).filter(Boolean).length);
  }, [userAnswers, results]);

  const handleSelect = (id, option) => {
    const question = questions.find(q => q.id === id);
    const letter = String.fromCharCode(65 + question.options.indexOf(option));
    const isCorrect = letter === question.correct;

    setUserAnswers(prev => ({ ...prev, [id]: letter }));
    setResults(prev => ({ ...prev, [id]: isCorrect }));
  };

  const total = questions.length;
  const score = Object.values(results).filter(Boolean).length;
  const passed = score >= required;

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#e8f4ff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Part 12: Listening – Multiple Choice</h1>

      <p style={{
        fontSize: "1rem",
        marginTop: "0.5rem",
        color: "#333",
        textAlign: "center",
        maxWidth: "800px",
        marginInline: "auto"
      }}>
        You will hear a discussion between two marine biologists, Gina Kelso and Thomas Lundman,
        about an award-winning television film they made about wildlife in Antarctica.
        <br />
        For questions <strong>16–20</strong>, choose the answer <strong>(A, B, C or D)</strong> which fits best according to what you hear.
      </p>

      <section style={{ maxWidth: "800px", margin: "2rem auto" }}>
        <audio controls style={{ width: "100%", marginBottom: "1.5rem" }}>
          <source src="/audio/extract5.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {questions.map((q) => {
          const selected = userAnswers[q.id];
          const correctLetter = q.correct;

          return (
            <div key={q.id} style={{ marginBottom: "2rem" }}>
              <p><strong>{q.id}. {q.text}</strong></p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {q.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selected === letter;
                  const isCorrect = letter === correctLetter;
                  const wasAnswered = !!selected;

                  let backgroundColor = "#fff";
                  if (wasAnswered) {
                    if (isSelected && isCorrect) backgroundColor = "#d4edda";
                    else if (isSelected && !isCorrect) backgroundColor = "#f8d7da";
                    else if (!isSelected && isCorrect) backgroundColor = "#d4edda";
                  }

                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelect(q.id, opt)}
                      disabled={wasAnswered}
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 1rem",
                        backgroundColor,
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: wasAnswered ? "default" : "pointer"
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
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Resultados */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Your score: {score} / {total}</h3>
        <p>🎯 You need {required} correct answers to pass.</p>
        {Object.keys(userAnswers).length === total && (
          passed
            ? <p style={{ color: 'green' }}>✅ You passed!</p>
            : <p style={{ color: 'red' }}>❌ Not enough correct answers.</p>
        )}
      </div>

      {/* Navegación */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: "800px",
        marginInline: "auto"
      }}>
        <Link href={back}>⬅ Back</Link>
        <Link href={next}>Next ➡️</Link>
      </div>
    </main>
  );
}
