'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavigationButtons from '@/components/NavigationButtons';

const exerciseComponents = Array.from({ length: 12 }, (_, i) =>
  dynamic(() => import(`./exercises/ejercicio-${i + 1}.jsx`), { ssr: false })
);

export default function WritingPart2() {
  const [selected, setSelected] = useState(0);
  const SelectedExercise = exerciseComponents[selected];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Writing – Part 2: Choose a Task</h1>
      <p>
        In this part, you choose one of several options: article, review, report, or letter. Each task requires between 220–260 words and must follow the appropriate format and register.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {exerciseComponents.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selected === i ? '#D69E2E' : '#FAF089',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Ejercicio {i + 1}
          </button>
        ))}
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <SelectedExercise />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NavigationButtons
          back="/niveles/c1/writing/part-1"
          next="/niveles/c1/listening/part-1"
          home="/niveles/c1"
        />
      </div>
    </div>
  );
}
