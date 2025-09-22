'use client';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

export default function C1ExamHomePage() {
  const { answers } = useExam();

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Cambridge C1 Exam Practice</h1>

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333' }}>
        <p>
          Welcome to the <strong>C1 Advanced (CAE)</strong> Cambridge English Exam Practice page.
          This platform is designed to help you prepare for the full Reading and Use of English paper, structured in the same format as the official exam.
        </p>
        <p>
          Each full exam consists of <strong>7 parts</strong>, testing your understanding of grammar, vocabulary, collocations, paraphrasing, and reading comprehension.
          You will receive immediate feedback and know exactly which answers you got right or wrong.
        </p>
        <p>
          Select any of the <strong>12 full exams</strong> below to begin your training. Each exam starts from Part 1 and guides you all the way through Part 7.
        </p>
        <p>
          Practicing consistently is the key to success. Let’s get started!
        </p>
      </section>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            justifyItems: 'center',
          }}
        >
          {[...Array(12)].map((_, i) => {
            const examKey = `exam-${i + 1}`;
            const progress = Object.keys(answers?.[examKey] || {}).length;
            const finished = progress >= 7;

            return (
              <Link
                key={i}
                href={`/niveles/c1/exam-${i + 1}/part-1`}
                style={{
                  backgroundColor: finished ? '#a7f3d0' : '#c1f2cd',
                  padding: '1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Exam {i + 1}
                <br />
                <span style={{ fontSize: '0.9rem' }}>
                  {finished ? '✅ Completed' : `Progress: ${progress}/7`}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href="/niveles/c1"
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
        </Link>
      </div>
    </main>
  );
}
