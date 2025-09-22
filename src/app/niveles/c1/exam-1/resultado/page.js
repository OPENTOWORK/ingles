'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useExam } from '@/context/ExamContext';

const EXAM_ID = 'exam-1';

export default function ResultPage() {
  const { answers } = useExam();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!answers?.[EXAM_ID]) return;

    const exam = answers[EXAM_ID];
    const resultArray = [];

    const scoring = {
      'part-1': { total: 6, correct: ['B', 'A', 'C', 'C', 'B', 'C'] },
      'part-2': { total: 8, correct: ['INTO', 'OUT', 'TO', 'AT', 'FROM', 'OF', 'FOR', 'WITH'] },
      'part-3': {
        total: 8,
        correct: ['producer', 'illness', 'effective', 'scientists', 'addition', 'pressure', 'disadvantage', 'spicy']
      },
      'part-4': {
        total: 6,
        correct: [
          'A GOOD IDEA TO GO',
          'TALENTED THAT HE',
          'IF SHE KNEW WHAT',
          'KNOCKED FOR A LONG TIME',
          'IS SAID TO BE',
          'NOT CALL OFF'
        ]
      },
      'part-5': { total: 6, correct: ['C', 'A', 'D', 'C', 'B', 'B'] },
      'part-6': { total: 6, correct: ['B', 'B', 'C', 'A', 'C', 'D'] },
      'part-7': { total: 6, correct: ['B', 'D', 'C', 'B', 'A', 'C'] },
      'part-8': { total: 20 }, // essay evaluado por score
      'part-9': { total: 6, correct: ['D', 'B', 'C', 'A', 'C', 'B'] },
      'part-10': { total: 6, correct: ['C', 'B', 'A', 'D', 'C', 'A'] },
      'part-11': { total: 6, correct: ['B', 'C', 'A', 'C', 'D', 'B'] },
      'part-12': { total: 6, correct: ['B', 'A', 'C', 'D', 'A', 'C'] },
      'part-13': { total: 1 }, // libre, se considera completado si hay contenido
      'part-14': { total: 1 }, // speaking
      'part-15': { total: 1 },
      'part-16': { total: 1 },
      'part-17': { total: 1 }
    };

    for (const partId in scoring) {
      const config = scoring[partId];
      const partAnswers = exam[partId] || {};
      let score = 0;

      // Múltiple opción
      if (Array.isArray(config.correct)) {
        score = config.correct.reduce((acc, correct, idx) => {
          const userAnswer = partAnswers[idx + 1]?.trim().toUpperCase() || '';
          return acc + (userAnswer === correct.toUpperCase() ? 1 : 0);
        }, 0);
      }

      // Essay (part-8)
      else if (partId === 'part-8') {
        const essay = partAnswers['essay'];
        if (essay && typeof essay === 'object' && typeof essay.score === 'number') {
          score = essay.score;
        }
      }

      // Part 13: se considera hecho si hay texto
      else if (partId === 'part-13') {
        score = partAnswers?.response?.trim() ? 1 : 0;
      }

      // Partes 14–17: speaking, se evalúa si hay `response` (o al menos scored)
      else if (['part-14', 'part-15', 'part-16', 'part-17'].includes(partId)) {
        score = partAnswers?.response?.trim() || partAnswers?.scored ? 1 : 0;
      }

      resultArray.push({
        part: partId,
        score,
        total: config.total,
        passed: score >= Math.ceil(config.total * 0.6)
      });
    }

    setResults(resultArray);
  }, [answers]);

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#e8f4ff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>C1 Exam Results</h1>
      <table style={{ width: '100%', maxWidth: '800px', margin: '2rem auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Part</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Result</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white' }}>
              <td style={tdStyle}>{r.part.replace('-', ' ').toUpperCase()}</td>
              <td style={tdStyle}>{r.score} / {r.total}</td>
              <td style={tdStyle}>{r.passed ? '✅ Passed' : '❌ Not passed'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/niveles/c1/exam-1">⬅ Back to Exam Menu</Link>
      </div>
    </main>
  );
}

const thStyle = {
  borderBottom: '2px solid #ccc',
  padding: '0.75rem',
  textAlign: 'left'
};

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee'
};
