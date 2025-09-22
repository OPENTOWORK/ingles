'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const questions = [
  {
    id: 1,
    text: "What is the main objective of the project?",
    options: [
      "to raise environmental awareness",
      "to encourage tourism in the islands",
      "to follow the movements of tides"
    ],
    correct: "A"
  },
  {
    id: 2,
    text: "What is the speaker’s opinion of the new project?",
    options: [
      "The idea is over-ambitious.",
      "The approach is innovative.",
      "The experiment is unscientific."
    ],
    correct: "B"
  },
  {
    id: 3,
    text: "What is the art critic’s opinion of Fitzgerald’s latest work?",
    options: [
      "It demonstrates his lack of artistic range.",
      "It compares favourably with his previous work.",
      "It shows his poor understanding of relationships."
    ],
    correct: "B"
  },
  {
    id: 4,
    text: "The art critic says that Fitzgerald’s pictures in the current show...",
    options: [
      "are unsuitable for rounding off the exhibition.",
      "do not manage to engage the visitor’s interest.",
      "lack artistic originality."
    ],
    correct: "C"
  },
  {
    id: 5,
    text: "How does the speaker say she feels when listening to her favourite piece of music?",
    options: [
      "engrossed",
      "nostalgic",
      "inspired"
    ],
    correct: "A"
  },
  {
    id: 6,
    text: "The speaker believes that critics of her favourite music are wrong to...",
    options: [
      "doubt the level of its popularity.",
      "disregard the composer’s skills.",
      "underrate it for its wide appeal."
    ],
    correct: "B"
  }
];

export default function Part10() {
  const { answers, updateAnswer } = useExam();
  const part = 'part-10';

  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    return answers?.[part]?.selectedAnswers || {};
  });

  const [showResult, setShowResult] = useState(() => {
    return answers?.[part]?.showResult || {};
  });

  useEffect(() => {
    updateAnswer(part, 'selectedAnswers', selectedAnswers);
    updateAnswer(part, 'showResult', showResult);
  }, [selectedAnswers, showResult]);

  const handleSelect = (id, selectedOption) => {
    const question = questions.find(q => q.id === id);
    const letter = String.fromCharCode(65 + question.options.indexOf(selectedOption));
    const isCorrect = letter === question.correct;

    const updatedAnswers = { ...selectedAnswers, [id]: letter };
    const updatedResults = { ...showResult, [id]: isCorrect };

    setSelectedAnswers(updatedAnswers);
    setShowResult(updatedResults);

    // Save score
    const score = Object.values(updatedResults).filter(Boolean).length;
    updateAnswer(part, 'listeningScore', score);
  };

  const score = Object.values(showResult).filter(Boolean).length;
  const total = questions.length;
  const required = 5;
  const passed = score >= required;

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#e8f4ff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Part 10: Listening – Multiple Choice</h1>

      <p style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#333" }}>
        You will hear three different extracts. For questions <strong>1–6</strong>, choose the answer <strong>(A, B or C)</strong> which fits best according to what you hear.
        There are two questions for each extract.
      </p>

      {[1, 2, 3].map((extractNum) => (
        <section key={extractNum} style={{ maxWidth: "800px", margin: "2rem auto" }}>
          <h2>Extract {["One", "Two", "Three"][extractNum - 1]}</h2>
          <audio controls style={{ width: "100%" }}>
            <source src={`/audio/extract${extractNum}.mp3`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          {questions
            .filter(q => Math.ceil(q.id / 2) === extractNum)
            .map(q => {
              const selected = selectedAnswers[q.id];
              const correctLetter = q.correct;
              const correctIndex = correctLetter.charCodeAt(0) - 65;

              return (
                <div key={q.id} style={{ marginTop: "1.5rem" }}>
                  <p><strong>{q.id}. {q.text}</strong></p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {q.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = selected === letter;
                      const isCorrect = letter === correctLetter;
                      const wasAnswered = !!selected;

                      let backgroundColor = "#fff";
                      if (wasAnswered) {
                        if (isSelected && isCorrect) backgroundColor = "lightgreen";
                        else if (isSelected && !isCorrect) backgroundColor = "#f8d7da";
                        else if (!isSelected && isCorrect) backgroundColor = "lightgreen";
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
      ))}

      <div style={{ marginTop: "2.5rem" }}>
        <h3>Your score: {score} / {total}</h3>
        <p style={{ fontSize: "0.95rem", color: "#333" }}>
          🎯 You need <strong>{required}</strong> correct answers to pass.
        </p>
        {Object.keys(selectedAnswers).length === total && (
          passed ? (
            <p style={{ color: "green" }}>✅ You passed the test!</p>
          ) : (
            <p style={{ color: "red" }}>❌ You did not pass. Try again to improve your score.</p>
          )
        )}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/c1/exam-1/part-9">⬅ Back to Part 9</Link>
        <Link href="/niveles/c1/exam-1/part-11">Next ➡️</Link>
      </div>
    </main>
  );
}
