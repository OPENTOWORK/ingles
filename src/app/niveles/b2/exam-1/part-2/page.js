'use client';
import { useState } from 'react';
import Link from 'next/link';

const correctAnswers = {
  1: 'as',
  9: 'where',
  10: 'so',
  11: 'myself',
  12: 'in',
  13: 'that',
  14: 'on',
  15: 'from',
  16: 'any'
};

export default function Part2() {
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

  const inputs = Object.keys(correctAnswers).map((n) => parseInt(n));

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Part 2: Open Cloze</h1>
      <h2 style={{ marginTop: "1rem", fontWeight: "normal" }}>Motorbike stunt rider</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
        <p>
          I work <strong>(0)</strong> <em>as</em> a motorbike stunt rider – that is, I do tricks on my motorbike at shows.
          The Le Mans race track in France was <strong>(9)</strong> ........ I first saw some guys doing motorbike stunts.
          I’d never seen anyone riding a motorbike using just the back wheel before and I was <strong>(10)</strong> ........ impressed
          I went straight home and taught <strong>(11)</strong> ........ to do the same. It wasn’t very long before I began to earn
          my living at shows performing my own motorbike stunts.
        </p>

        <p>
          I have a degree <strong>(12)</strong> ........ mechanical engineering; this helps me to look at the physics <strong>(13)</strong> ........
          lies behind each stunt. In addition to being responsible for design changes to the motorbike, I have to work <strong>(14)</strong> ........
          every stunt I do. People often think that my work is very dangerous, but, apart <strong>(15)</strong> ........ some minor
          mechanical problem happening occasionally during a stunt, nothing ever goes wrong.
          I never feel in <strong>(16)</strong> ........ kind of danger because I’m very experienced.
        </p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Your Answers (press Enter to check)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {inputs.map((n) => (
          <div key={n}>
            <label htmlFor={`gap-${n}`}>({n})</label>
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
        <Link href="/niveles/b2/exam-1">⬅ Back to Part 1</Link>
        <Link href="/niveles/b2/exam-1/part-3">Next ➡️</Link>
      </div>
    </main>
  );
}
