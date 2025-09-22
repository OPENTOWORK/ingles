'use client';
import Link from 'next/link';

export default function C1WritingExamsPage() {
  const buttonStyle = {
    backgroundColor: '#c1f2cd', // verde pastel
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#000',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
    textAlign: 'center',
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>C1 Writing Practice</h1>

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333', textAlign: 'center' }}>
        <p>
          Select from <strong>12 Writing sets</strong>, each including the <strong>Part 1 compulsory essay</strong> and a <strong>Part 2</strong> task with formats such as reviews, reports, or proposals.
        </p>
      </section>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          justifyItems: 'center',
        }}>
          {[...Array(12)].map((_, i) => (
            <Link
              key={i}
              href={`/niveles/c1/writing/exam-${i + 1}/part-1`}
              style={buttonStyle}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Exam {i + 1}
            </Link>
          ))}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/niveles/c1">
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f3',
              fontWeight: 'bold',
              display: 'inline-block',
              padding: '0.75rem 1.25rem',
              border: '2px solid #0070f3',
              borderRadius: '6px',
              marginTop: '2rem',
              transition: 'background 0.3s, color 0.3s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0070f3';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#0070f3';
            }}
          >
            ← Back to C1 Overview
          </div>
        </Link>
      </div>
    </main>
  );
}
