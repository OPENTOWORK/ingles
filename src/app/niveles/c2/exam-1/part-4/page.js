"use client";
import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    id: 25,
    text: "Joan was in favour of visiting the museum.",
    keyword: "IDEA",
    secondSentence: "Joan thought it would be .................................................. to the museum.",
    answer: "A GOOD IDEA TO GO"
  },
  {
    id: 26,
    text: "Arthur has the talent to become a concert pianist.",
    keyword: "THAT",
    secondSentence: "Arthur is so .................................................. could become a concert pianist.",
    answer: "TALENTED THAT HE"
  },
  {
    id: 27,
    text: "‘Do you know when the match starts, Sally?’ asked Mary.",
    keyword: "IF",
    secondSentence: "Mary asked Sally .................................................. time the match started.",
    answer: "IF SHE KNEW WHAT"
  },
  {
    id: 28,
    text: "I knocked for ages at Ruth’s door but I got no reply.",
    keyword: "LONG",
    secondSentence: "I .................................................. knocking at Ruth’s door but I got no reply.",
    answer: "KNOCKED FOR A LONG TIME"
  },
  {
    id: 29,
    text: "Everyone says that the band is planning to go on a world tour next year.",
    keyword: "SAID",
    secondSentence: "The band .................................................. planning to go on a world tour next year.",
    answer: "IS SAID TO BE"
  },
  {
    id: 30,
    text: "I’d prefer not to cancel the meeting.",
    keyword: "CALL",
    secondSentence: "I’d rather .................................................. the meeting.",
    answer: "NOT CALL OFF"
  }
];

export default function Part4Page() {
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleKeyPress = (e, id, correctAnswer) => {
    if (e.key === "Enter") {
      const userInput = userAnswers[id]?.trim().toUpperCase();
      const isCorrect = userInput === correctAnswer.toUpperCase();
      setFeedback({ ...feedback, [id]: isCorrect });
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Part 4: Key Word Transformations</h1>
      <p style={{ marginBottom: "2rem", textAlign: "center" }}>
        Complete the second sentence so that it has a similar meaning to the first one.
        Use <strong>between 2 and 5 words</strong> including the word given.
      </p>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
          <p><strong>{q.id}.</strong> {q.text}</p>
          <p style={{ fontWeight: "bold" }}>{q.keyword}</p>
          <p>{q.secondSentence}</p>
          <input
            type="text"
            placeholder="Type your answer here"
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.5rem"
            }}
            value={userAnswers[q.id] || ""}
            onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
            onKeyDown={(e) => handleKeyPress(e, q.id, q.answer)}
          />
          {feedback[q.id] !== undefined && (
            <p style={{ marginTop: "0.5rem", color: feedback[q.id] ? "green" : "red" }}>
              {feedback[q.id] ? "✔ Correct!" : `✘ Incorrect. Correct answer: ${q.answer}`}
            </p>
          )}
        </div>
      ))}

      {/* Navigation Buttons */}
      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/b2/exam-1/part-3">⬅ Back to Part 3</Link>
        <Link href="/niveles/b2/exam-1/part-5">Next ➡️</Link>
      </div>
    </main>
  );
}
