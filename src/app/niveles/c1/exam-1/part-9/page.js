'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

export default function Part9WritingPage() {
  const { answers, updateAnswer } = useExam();
  const part = 'part-9';
  const questionId = 'essay';

  const [essay, setEssay] = useState(() => {
    const saved = answers?.[part]?.[questionId];
    return typeof saved === 'string' ? saved : '';
  });

  const [feedback, setFeedback] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    updateAnswer(part, questionId, essay);
  }, [essay]);

  const evaluateEssay = async () => {
    const meetsWordRequirement = wordCount >= 280 && wordCount <= 320;
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
        updateAnswer(part, 'essayScore', data.scores.total || 0);
      } else {
        setAiFeedback('⚠️ Error: ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      setAiFeedback('⚠️ Error connecting to AI.');
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Part 9: Writing - Extended Response</h1>

      <section style={{ marginBottom: '2rem', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.6' }}>
        <p>
          Write an answer to <strong>one</strong> of the questions <strong>2–4</strong> in this part.
          Write your answer in <strong>280–320 words</strong> in an appropriate style.
        </p>
        <hr />
        <p><strong>2</strong>. A travel magazine has asked readers to send in articles on their favourite public building...</p>
        <p><strong>3</strong>. You belong to an English-language reading group which recently read a book in cartoon format...</p>
        <p><strong>4</strong>. A popular English-language magazine has invited readers to share an important decision...</p>
      </section>

      <h2 style={{ marginTop: '2rem', textAlign: 'center' }}>Your Answer</h2>

      <textarea
        placeholder="Write your answer here..."
        rows={15}
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '1rem auto',
          display: 'block',
          padding: '1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontFamily: 'inherit',
        }}
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />

      {feedback && (
        <div style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}>
          <p><strong>Word Count:</strong> {feedback.wordCount}</p>
          {!feedback.meetsWordRequirement && (
            <p style={{ color: 'red' }}>
              ❌ Your answer does not meet the required word count (280–320 words).
            </p>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={evaluateEssay}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Sending to AI...' : 'Submit Answer'}
        </button>
      </div>

      {aiFeedback && (
        <div style={{
          marginTop: '2rem',
          maxWidth: '800px',
          marginInline: 'auto',
          backgroundColor: '#eef7ff',
          padding: '1rem',
          borderRadius: '6px'
        }}>
          <h3>🧠 AI Feedback</h3>
          <div dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />') }} />
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/niveles/c1/exam-1/part-8">⬅ Back to Part 8</Link>
        <Link href="/niveles/c1/exam-1/part-10">Next ➡️</Link>
      </div>
    </main>
  );
}
