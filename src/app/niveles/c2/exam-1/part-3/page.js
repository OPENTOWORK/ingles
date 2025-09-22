'use client';
import { useState } from 'react';
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

export default function Part3() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleChange = (e, index) => {
    setAnswers({ ...answers, [index]: e.target.value });
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const userInput = answers[index]?.trim().toLowerCase();
      const correct = correctAnswers[index];
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

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Part 3: Word Formation</h1>
      <h2 style={{ marginTop: "1rem", fontWeight: "normal" }}>An Incredible Vegetable</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
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

      <h2 style={{ marginTop: "2rem" }}>Your Answers</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {inputs.map((n) => (
          <div key={n}>
            <label htmlFor={`gap-${n}`}>({n}) {baseWords[n]}</label>
            <input
              type="text"
              id={`gap-${n}`}
              placeholder="Your answer"
              value={answers[n] || ""}
              onChange={(e) => handleChange(e, n)}
              onKeyDown={(e) => handleKeyPress(e, n)}
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
              <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                {feedback[n].correct ? (
                  <span style={{ color: "green" }}>✔ Correct</span>
                ) : (
                  <span style={{ color: "red" }}>
                    ✘ Incorrect. Answer: <strong>{feedback[n].answer}</strong>
                  </span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/b2/exam-1/part-2">⬅ Back to Part 2</Link>
        <Link href="/niveles/b2/exam-1/part-4">Next ➡️</Link>
      </div>
    </main>
  );
}
