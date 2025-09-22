'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const taskOneOptions = [
  "taught a language", "travelled widely", "worked in an office", "did voluntary work",
  "taught a sport", "worked in a hotel", "worked as a tour guide", "went on an organised expedition"
];

const taskTwoOptions = [
  "making long-lasting friendships", "overcoming financial problems", "increased independence",
  "improved linguistic skills", "dealing with disappointment", "a renewed sense of adventure",
  "a more mature approach to studying", "a chance to consider future plans"
];

const letters = "ABCDEFGH".split("");

const questions = [
  { speaker: 1, taskOne: { id: 21, correct: "F" }, taskTwo: { id: 26, correct: "B" } },
  { speaker: 2, taskOne: { id: 22, correct: "D" }, taskTwo: { id: 27, correct: "D" } },
  { speaker: 3, taskOne: { id: 23, correct: "E" }, taskTwo: { id: 28, correct: "E" } },
  { speaker: 4, taskOne: { id: 24, correct: "C" }, taskTwo: { id: 29, correct: "F" } },
  { speaker: 5, taskOne: { id: 25, correct: "H" }, taskTwo: { id: 30, correct: "G" } }
];

export default function Part13() {
  const part = 'part-13';
  const { answers, updateAnswer } = useExam();
  const [userAnswers, setUserAnswers] = useState(() => answers?.[part]?.userAnswers || {});
  const [results, setResults] = useState(() => answers?.[part]?.results || {});

  useEffect(() => {
    updateAnswer(part, 'userAnswers', userAnswers);
    updateAnswer(part, 'results', results);
    updateAnswer(part, 'score', Object.values(results).filter(Boolean).length);
  }, [userAnswers, results]);

  const handleSelect = (questionId, letter, correctLetter) => {
    if (userAnswers[questionId]) return;
    const isCorrect = letter === correctLetter;
    setUserAnswers(prev => ({ ...prev, [questionId]: letter }));
    setResults(prev => ({ ...prev, [questionId]: isCorrect }));
  };

  const total = questions.length * 2;
  const score = Object.values(results).filter(Boolean).length;
  const required = 8;
  const passed = score >= required;

  const renderButtons = (questionId, correctLetter) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {letters.map((letter) => {
        const wasAnswered = !!userAnswers[questionId];
        const isSelected = userAnswers[questionId] === letter;
        const isCorrect = correctLetter === letter;

        let backgroundColor = "#fff";
        if (wasAnswered) {
          if (isSelected && isCorrect) backgroundColor = "#d4edda";
          else if (isSelected && !isCorrect) backgroundColor = "#f8d7da";
          else if (!isSelected && isCorrect) backgroundColor = "#d4edda";
        }

        return (
          <button
            key={letter}
            onClick={() => handleSelect(questionId, letter, correctLetter)}
            disabled={wasAnswered}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor,
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: wasAnswered ? "default" : "pointer"
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#e8f4ff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Part 13: Listening – Matching Tasks</h1>

      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#333" }}>
        You will hear five short extracts in which different people are talking about taking a gap year.
        <br />
        <strong>TASK ONE:</strong> For questions 21–25, choose from the list (A–H) what each speaker did during their gap year.
        <br />
        <strong>TASK TWO:</strong> For questions 26–30, choose from the list (A–H) which benefit of having a gap year each speaker mentions.
      </p>

      <section style={{ maxWidth: "800px", margin: "2rem auto" }}>
        <audio controls style={{ width: "100%" }}>
          <source src="/audio/extract6.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {questions.map(({ speaker, taskOne, taskTwo }) => (
          <div key={speaker} style={{ marginBottom: "2rem" }}>
            <h3>Speaker {speaker}</h3>

            <p><strong>{taskOne.id}. What did the speaker do during the gap year?</strong></p>
            {renderButtons(taskOne.id, taskOne.correct)}
            {userAnswers[taskOne.id] && (
              <p style={{ marginTop: "0.3rem" }}>
                {results[taskOne.id] ? (
                  <span style={{ color: "#155724" }}>✔ Correct</span>
                ) : (
                  <span style={{ color: "#721c24" }}>
                    ✘ Incorrect. Correct answer: {taskOne.correct}
                  </span>
                )}
              </p>
            )}

            <p style={{ marginTop: "1rem" }}><strong>{taskTwo.id}. What benefit does the speaker mention?</strong></p>
            {renderButtons(taskTwo.id, taskTwo.correct)}
            {userAnswers[taskTwo.id] && (
              <p style={{ marginTop: "0.3rem" }}>
                {results[taskTwo.id] ? (
                  <span style={{ color: "#155724" }}>✔ Correct</span>
                ) : (
                  <span style={{ color: "#721c24" }}>
                    ✘ Incorrect. Correct answer: {taskTwo.correct}
                  </span>
                )}
              </p>
            )}
          </div>
        ))}
      </section>

      <div style={{ marginTop: "2.5rem" }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {Object.keys(userAnswers).length === total && (
          passed ? (
            <p style={{ color: "green" }}>✅ You passed the test!</p>
          ) : (
            <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/c1/exam-1/part-12">⬅ Back to Part 12</Link>
        <Link href="/niveles/c1/exam-1/part-14">Next ➡️</Link>
      </div>
    </main>
  );
}
