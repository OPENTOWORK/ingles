'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-8';
const QUESTION_ID = 'essay';

export default function Part8WritingPage() {
  const { answers, updateAnswer } = useExam();
  const [essay, setEssay] = useState(() => {
    return answers?.[EXAM_ID]?.[PART_ID]?.[QUESTION_ID] || '';
  });

  const [feedback, setFeedback] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateAnswer(EXAM_ID, PART_ID, QUESTION_ID, essay);
  }, [essay]);

  const evaluateEssay = async () => {
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    const meetsWordRequirement = wordCount >= 240 && wordCount <= 280;

    setFeedback({ wordCount, meetsWordRequirement });
    setLoading(true);
    setAiFeedback('');

    try {
      const res = await fetch('/api/feedback/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay }),
      });

      const data = await res.json();

      if (res.ok) {
        setAiFeedback(data.feedback);
        setFeedback(prev => ({ ...prev, ...data.scores }));

        // ✅ Guardar puntuación en contexto para el cálculo global
        updateAnswer(EXAM_ID, PART_ID, 'writing', {
          score: data.scores.total,
          max: 20,
        });

      } else {
        setAiFeedback('⚠️ Error: ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      setAiFeedback('⚠️ Error connecting to AI.');
    }

    setLoading(false);
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Part 8: Writing - Essay</h1>

      <section style={{ marginBottom: '2rem', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.6' }}>
        <p>
          In this part, you will read two short texts. Then, you must write an essay summarising and evaluating the key points from both.
          Use your own words as much as possible and include your personal opinion.
        </p>
        <p>
          Your answer should be between <strong>240–280 words</strong>. Try to stay clear and organized, and support your ideas with examples where appropriate.
        </p>
      </section>

      <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '6px', maxWidth: '800px', margin: '0 auto' }}>
        <h3>Text 1: <em>The Excitement of Advertising</em></h3>
        <p>
          Outdoor advertising has to attract, engage and persuade potential customers; it is the most important way of grabbing customers’ attention...
        </p>
        <h3>Text 2: <em>Advertising: an undesirable business</em></h3>
        <p>
          Once upon a time outdoor advertising was straightforward. Posters were stuck up on anything from a bus shelter to a motorway hoarding...
        </p>
      </div>

      <h2 style={{ marginTop: '2rem', textAlign: 'center' }}>Your Essay</h2>

      <textarea
        rows={15}
        placeholder="Write your answer here..."
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '1rem auto',
          display: 'block',
          padding: '1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc'
        }}
      />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={evaluateEssay}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Sending to AI...' : 'Submit Essay'}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p><strong>Word Count:</strong> {wordCount}</p>
        {feedback?.meetsWordRequirement === false && (
          <p style={{ color: 'red' }}>❌ Your essay does not meet the minimum word requirement (240–280 words).</p>
        )}
      </div>

      {aiFeedback && (
        <div style={{ marginTop: '2rem', maxWidth: '800px', marginInline: 'auto', backgroundColor: '#eef7ff', padding: '1rem', borderRadius: '6px' }}>
          <h3>🧠 AI Feedback</h3>
          <div dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }} />
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/niveles/c1/exam-1/part-7">⬅ Back to Part 7</Link>
        <Link href="/niveles/c1/exam-1/part-9">Next ➡️</Link>
      </div>
    </main>
  );
}
