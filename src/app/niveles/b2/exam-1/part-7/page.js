'use client';
import { useState } from 'react';
import Link from 'next/link';

const correctAnswers = {
  43: 'A',
  44: 'C',
  45: 'B',
  46: 'D',
  47: 'C',
  48: 'B',
  49: 'C',
  50: 'B',
  51: 'D',
  52: 'D',
};

export default function Part7Page() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      const value = answers[index]?.trim().toUpperCase();
      const isCorrect = value === correctAnswers[index];
      setFeedback({
        ...feedback,
        [index]: isCorrect,
      });
    }
  };

  const handleChange = (e, index) => {
    setAnswers({ ...answers, [index]: e.target.value });
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Part 7: Multiple Matching</h1>
      <p style={{ maxWidth: '800px', margin: '1rem auto', lineHeight: '1.6' }}>
        You are going to read a newspaper article about a young professional footballer. For questions 43 – 52, choose from the sections (A – D). The sections may be chosen more than once.
      </p>

      <h2 style={{ marginTop: '2rem' }}>Text</h2>
      <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', lineHeight: '1.6' }}>
        <p><strong>A</strong> It’s my first time driving to Chelsea’s training ground and I turn off slightly too early... career was nearly all over before it began.</p>
        <p><strong>B</strong> Gavin, himself a fine footballer – a member of the national team in his time – and now a professional coach... and got much stronger as well.</p>
        <p><strong>C</strong> Duncan takes up the story: ‘The first half of that season I played in the youth team... you have to use your brain a lot more.’</p>
        <p><strong>D</strong> Not every kid gets advice from an ex-England player over dinner, nor their own private training sessions... That’s for somebody else to decide.’</p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Questions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {Object.entries(correctAnswers).map(([num, correct]) => (
          <div key={num}>
            <label htmlFor={`q${num}`} style={{ display: 'block', fontWeight: 'bold' }}>
              {num}.&nbsp;
              <span style={{ fontWeight: 'normal' }}>
                {
                  {
                    43: 'states how surprised the writer was at Duncan’s early difficulties?',
                    44: 'says that Duncan sometimes seems much more mature than he really is?',
                    45: 'describes the frustration felt by Duncan’s father?',
                    46: 'says that Duncan is on course to reach a high point in his profession?',
                    47: 'suggests that Duncan caught up with his team-mates in terms of physical development?',
                    48: 'explains how Duncan was a good all-round sportsperson?',
                    49: 'gives an example of how Gavin reassured his son?',
                    50: 'mentions Duncan’s current club’s low opinion of him at one time?',
                    51: 'mentions a personal success despite a failure for the team?',
                    52: 'explains how Duncan and his father are fulfilling a similar role?',
                  }[num]
                }
              </span>
            </label>
            <input
              id={`q${num}`}
              value={answers[num] || ''}
              onChange={(e) => handleChange(e, num)}
              onKeyDown={(e) => handleKeyPress(e, num)}
              placeholder="A, B, C or D"
              maxLength={1}
              style={{
                padding: '0.5rem',
                fontSize: '1rem',
                width: '4rem',
                textAlign: 'center',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor:
                  feedback[num] === true ? '#d4edda' :
                  feedback[num] === false ? '#f8d7da' : 'white'
              }}
            />
            {feedback[num] !== undefined && (
              <p style={{ marginTop: '0.25rem', color: feedback[num] ? 'green' : 'red' }}>
                {feedback[num] ? '✔ Correct' : `✘ Incorrect. Answer: ${correct}`}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/niveles/b2/exam-1/part-6">⬅ Back to Part 6</Link>
        <Link href="/niveles/b2">🏁 Finish Exam</Link>
      </div>
    </main>
  );
}
