'use client';
import { useState } from 'react';
import Link from 'next/link';

const correctAnswers = {
  37: 'G',
  38: 'B',
  39: 'F',
  40: 'A',
  41: 'E',
  42: 'D'
};

const options = {
  A: "Through endless tries at the usual exercises and frequent failures, ballet dancers develop the neural pathways in the brain necessary to control accurate, fast and smooth movement.",
  B: "The ballet shoe offers some support, but the real strength is in the muscles, built up through training.",
  C: "As technology takes away activity from the lives of many, perhaps the ballet dancer’s physicality is ever more difficult for most people to imagine.",
  D: "Ballet technique is certainly extreme but it is not, in itself, dangerous.",
  E: "The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result.",
  F: "No one avoids this: it is ballet’s great democratiser, the well established members of the company working alongside the newest recruits.",
  G: "It takes at least a decade of high-quality, regular practice to become an expert in any physical discipline."
};

export default function Part6Page() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleCheck = (number) => {
    const userAnswer = answers[number]?.trim().toUpperCase();
    const correct = correctAnswers[number];
    setFeedback({ ...feedback, [number]: userAnswer === correct });
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Part 6: Gapped Text</h1>

      <div style={{ backgroundColor: "#f9f9f9", padding: "1.5rem", borderRadius: "8px", lineHeight: 1.6 }}>
        <p><em>A former classical ballet dancer explains what ballet training actually involves.</em></p>
        <p>What we ballet dancers do is instinctive, but instinct learnt through a decade of training. A dancer’s life is hard to understand, and easy to misinterpret. Many a poet and novelist has tried to do so, but even they have chosen to interpret all the hard work and physical discipline as obsessive. And so the idea persists that dancers spend every waking hour in pain, bodies at breaking point, their smiles a pretence.</p>
        <p>As a former dancer in the Royal Ballet Company here in Britain, I would beg to question this. <strong>(37)</strong> With expert teaching and daily practice, its various demands are easily within the capacity of the healthy human body. Contrary to popular belief, there is no need to break bones or tear muscles to achieve ballet positions. It is simply a question of sufficient conditioning of the muscular system.</p>
        <p>Over the course of my dancing life I worked my way through at least 10,000 ballet classes. I took my first at a school of dance at the age of seven and my last 36 years later at the Royal Opera House in London. In the years between, ballet class was the first thing I did every day. It starts at an early age, this daily ritual, because it has to. <strong>(38)</strong> But for a ballet dancer in particular, this lengthy period has to come before the effects of adolescence set in, while maximum flexibility can still be achieved.</p>
        <p>Those first classes I took were remarkably similar to the last. In fact, taking into account the occasional new idea, ballet classes have changed little since 1820, when the details of ballet technique were first written down, and are easily recognised in any country. Starting with the left hand on the barre, the routine unrolls over some 75 minutes. <strong>(39)</strong> Even the leading dancers have to do it.</p>
        <p>These classes serve two distinct purposes: they are the way we warm our bodies and the mechanism by which we improve basic technique. In class after class, we prove the old saying that ‘practice makes perfect’. <strong>(40)</strong> And it is also this daily repetition which enables us to strengthen the muscles required in jumping, spinning or lifting our legs to angles impossible to the average person.</p>
        <p>The human body is designed to adapt to the demands we make of it, provided we make them carefully and over time. <strong>(41)</strong> In the same way, all those years of classes add up to a fit-for-purpose dancing machine. This level of physical fluency doesn’t hurt; it feels good.</p>
        <p><strong>(42)</strong> But they should not be misled: there is a difference between hard work and hardship. Dancers have an everyday familiarity with the former. Hardship it isn’t.</p>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Select the correct option (A–G):</h2>

      {[37, 38, 39, 40, 41, 42].map((num) => (
        <div key={num} style={{ marginTop: "1.5rem", background: "#f0f0f0", padding: "1rem", borderRadius: "6px" }}>
          <label htmlFor={`select-${num}`}><strong>({num})</strong></label>
          <select
            id={`select-${num}`}
            value={answers[num] || ''}
            onChange={(e) => setAnswers({ ...answers, [num]: e.target.value })}
            onBlur={() => handleCheck(num)}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              marginTop: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor:
                feedback[num] === true ? "#d4edda" :
                feedback[num] === false ? "#f8d7da" : "white"
            }}
          >
            <option value="">-- Select an option --</option>
            {Object.entries(options).map(([key, text]) => (
              <option key={key} value={key}>{key}. {text.slice(0, 60)}...</option>
            ))}
          </select>
          {feedback[num] !== undefined && (
            <p style={{ marginTop: "0.5rem", color: feedback[num] ? "green" : "red" }}>
              {feedback[num] ? "✔ Correct" : `✘ Incorrect. Correct answer: ${correctAnswers[num]}`}
            </p>
          )}
        </div>
      ))}

      <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/niveles/b2/exam-1/part-5">⬅ Back to Part 5</Link>
        <Link href="/niveles/b2/exam-1/part-7">Next ➡️</Link>
      </div>
    </main>
  );
}
