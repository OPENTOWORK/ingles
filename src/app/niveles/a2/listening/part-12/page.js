'use client';

import { useRouter } from 'next/navigation';
import { partInfo } from '@/data/part-info/a2-listening';

/** Teoría — Cambridge A2 Key Listening Part 5 (numeración global: Part 12). */
export default function TheoryPage() {
  const router = useRouter();
  const part = 12;
  const info = partInfo[part] || partInfo['5'] || {};

  const backLink = '/niveles/a2/listening/11';
  const nextLink = '/niveles/a2/exam-listening';
  const homeLink = '/niveles/a2';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{info.title || `Part ${part}`}</h1>

      {info.description && (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>📋 What is this part?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {info.description}
          </p>

          {info.tips && (
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>💡 Tips for Success</h3>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>{info.tips}</p>
            </div>
          )}

          {info.commonErrors && (
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '1.5rem',
                borderRadius: '8px',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                ⚠️ Common Mistakes to Avoid
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>{info.commonErrors}</p>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #e9ecef',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>📚 Exam format (A2 Key)</h3>
        <ul style={{ margin: 0, color: '#6c757d', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
          <li>5 questions (usually 21–25) — match each to a letter A–H</li>
          <li>8 options on the right; 3 are not used</li>
          <li>One example is done for you at the start</li>
          <li>Recording played twice; ~15 seconds to read before listening</li>
        </ul>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => router.push(backLink)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ← Part 11
        </button>

        <button
          type="button"
          onClick={() => router.push(homeLink)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#c6f6d5',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          📚 Back to Index
        </button>

        <button
          type="button"
          onClick={() => router.push('/niveles/a2/listening/12')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#bee3f8',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Practice exercises →
        </button>
      </div>
    </div>
  );
}
