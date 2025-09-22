'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavigationButtons from '@/components/NavigationButtons';

const exerciseComponents = Array.from({ length: 12 }, (_, i) =>
  dynamic(() => import(`./exercises/ejercicio-${i + 1}.jsx`), { ssr: false })
);

export default function SpeakingPart2() {
  const [selected, setSelected] = useState(0);
  const SelectedExercise = exerciseComponents[selected];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Speaking – Part 2: Long Turn</h1>
      <p>Describe and compare two photos, answering a question in about one minute.</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {exerciseComponents.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selected === i ? '#68D391' : '#C6F6D5',
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

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <SelectedExercise />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NavigationButtons
          back="/niveles/c1/speaking/part-1"
          next="/niveles/c1/speaking/part-3"
          home="/niveles/c1"
        />
      </div>
    </div>
  );
}
