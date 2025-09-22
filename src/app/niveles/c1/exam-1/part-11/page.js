'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const partsData = {
  11: {
    title: 'Part 11: Listening – Sentence Completion',
    audio: '/audio/extract4.mp3',
    instructions: 'You will hear a nutritionist talking about the production and uses of mastic. Complete the sentences with a word or short phrase.',
    questions: [
      { id: 7, text: "Mastic is collected from a tree which looks like a smaller form of the...", correct: "oak" },
      { id: 8, text: "Mastic resin will ________ only in the region around the Mediterranean.", correct: "grow" },
      { id: 9, text: "Basic tools like ________ are employed to remove impurities from the mastic.", correct: "knives" },
      { id: 10, text: "Crystals of mastic have been referred to as ________ in literature.", correct: "tears" },
      { id: 11, text: "The sale of mastic crystals is handled by a ________ to ensure that the growers get a fair deal.", correct: "cooperative" },
      { id: 12, text: "It is thought that mastic was first used as ________ by ancient peoples.", correct: "medicine" },
      { id: 13, text: "When mastic is added to ________ it slows down the melting process.", correct: "chocolate" },
      { id: 14, text: "Flavoured drinks are made in ________ which have had mastic burned under them.", correct: "jugs" },
      { id: 15, text: "Some people believe that mastic can help in the treatment of health problems, especially some ________ conditions.", correct: "stomach" }
    ],
    back: '/niveles/c1/exam-1/part-10',
    next: '/niveles/c1/exam-1/part-12',
    required: 7
  }
};

export default function ListeningPart11() {
  const part = 11;
  const { answers, updateAnswer } = useExam();
  const data = partsData[part];

  const [userAnswers, setUserAnswers] = useState(() => answers?.[`part-${part}`]?.userAnswers || {});
  const [results, setResults] = useState(() => answers?.[`part-${part}`]?.results || {});

  useEffect(() => {
    updateAnswer(`part-${part}`, 'userAnswers', userAnswers);
    updateAnswer(`part-${part}`, 'results', results);
    const score = Object.values(results).filter(Boolean).length;
    updateAnswer(`part-${part}`, 'score', score);
  }, [userAnswers, results]);

  const handleChange = (id, value) => {
    const q = data.questions.find(q => q.id === id);
    const correct = q.correct.toLowerCase().trim();
    const isCorrect = value.trim().toLowerCase() === correct;

    setUserAnswers(prev => ({ ...prev, [id]: value }));
    setResults(prev => ({ ...prev, [id]: isCorrect }));
  };

  const score = Object.values(results).filter(Boolean).length;
  const total = data.questions.length;
  const passed = score >= data.required;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#e8f4ff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{data.title}</h1>

      <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1rem', color: '#333' }}>{data.instructions}</p>

      <section style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <audio controls style={{ width: '100%', marginBottom: '1.5rem' }}>
          <source src={data.audio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {data.questions.map((q) => (
          <div key={q.id} style={{ marginBottom: '1.5rem' }}>
            <p><strong>{q.id}. {q.text}</strong></p>
            <input
              type="text"
              value={userAnswers[q.id] || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={userAnswers[q.id]}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: userAnswers[q.id] ? (results[q.id] ? '#d4edda' : '#f8d7da') : 'white'
              }}
            />
            {userAnswers[q.id] && (
              <p style={{ marginTop: '0.3rem', color: results[q.id] ? '#155724' : '#721c24' }}>
                {results[q.id] ? '✔ Correct' : `✘ Incorrect. Correct answer: ${q.correct}`}
              </p>
            )}
          </div>
        ))}
      </section>

      <div style={{ marginTop: '2rem' }}>
        <h3>Your score: {score} / {total}</h3>
        <p>🎯 You need {data.required} correct answers to pass.</p>
        {Object.keys(userAnswers).length === total && (
          passed
            ? <p style={{ color: 'green' }}>✅ You passed!</p>
            : <p style={{ color: 'red' }}>❌ Not enough correct answers.</p>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href={data.back}>⬅ Back</Link>
        <Link href={data.next}>Next ➡️</Link>
      </div>
    </main>
  );
}
