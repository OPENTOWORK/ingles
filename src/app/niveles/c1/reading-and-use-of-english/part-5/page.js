'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavigationButtons from '@/components/NavigationButtons';

const exerciseComponents = Array.from({ length: 12 }, (_, i) =>
  dynamic(() => import(`./exercises/ejercicio-${i + 1}.jsx`), { ssr: false })
);

export default function ReadingPart5() {
  const [selected, setSelected] = useState(0);
  const SelectedExercise = exerciseComponents[selected];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Reading – Part 5: Multiple choice</h1>
      <p>You read a long text and answer multiple-choice questions to test detailed understanding and opinion recognition.</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {exerciseComponents.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selected === i ? '#3182ce' : '#bee3f8',
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
          back="/niveles/c1/reading-and-use-of-english/part-4"
          next="/niveles/c1/reading-and-use-of-english/part-6"
          home="/niveles/c1"
        />
      </div>
    </div>
  );
}
