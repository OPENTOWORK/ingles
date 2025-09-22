'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useExam } from '@/context/ExamContext';
import exams from '@/data/exams';

export default function DynamicExamHomePage() {
  const params = useParams();
  const { answers } = useExam();
  const { level, exam } = params;
  
  const examData = exams[level]?.[exam];
  
  if (!examData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Exam not found</h1>
        <p>The requested exam could not be found.</p>
        <Link href="/niveles">
          <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Back to Levels
          </button>
        </Link>
      </div>
    );
  }

  const examParts = Object.keys(examData);
  const totalParts = examParts.length;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>
        Cambridge {level.toUpperCase()} Exam Practice - {exam.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h1>

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333' }}>
        <p>
          Welcome to the <strong>{level.toUpperCase()} Advanced (CAE)</strong> Cambridge English Exam Practice page.
          This platform is designed to help you prepare for the full Reading and Use of English paper, structured in the same format as the official exam.
        </p>
        <p>
          This exam consists of <strong>{totalParts} parts</strong>, testing your understanding of grammar, vocabulary, collocations, paraphrasing, and reading comprehension.
          You will receive immediate feedback and know exactly which answers you got right or wrong.
        </p>
        <p>
          Start from Part 1 and work your way through all parts. Each part has specific instructions and question formats.
        </p>
        <p>
          Practicing consistently is the key to success. Let's get started!
        </p>
      </section>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Exam Parts</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            justifyItems: 'center',
          }}
        >
          {examParts.map((partKey, index) => {
            const partData = examData[partKey];
            const partProgress = Object.keys(answers?.[exam]?.[partKey] || {}).length;
            const totalQuestions = partData.questions?.length || Object.keys(partData.correctAnswers || {}).length || 0;
            const finished = partProgress >= totalQuestions && totalQuestions > 0;
            const partNumber = index + 1;

            return (
              <Link
                key={partKey}
                href={`/niveles/${level}/${exam}/${partKey}`}
                style={{
                  backgroundColor: finished ? '#a7f3d0' : '#e0f2fe',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Part {partNumber}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'normal', marginBottom: '0.5rem' }}>
                  {partData.title?.replace('Reading and Use of English - ', '') || partData.type}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {finished ? '✅ Completed' : 
                   totalQuestions > 0 ? `Progress: ${partProgress}/${totalQuestions}` : 'Start'}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href={`/niveles/${level}`}
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
          ← Back to {level.toUpperCase()} Overview
        </Link>
      </div>
    </main>
  );
}