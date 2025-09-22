'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavigationButtons from '@/components/NavigationButtons';

const exerciseComponents = Array.from({ length: 12 }, (_, i) =>
  dynamic(() => import(`./exercises/ejercicio-${i + 1}.jsx`), { ssr: false })
);

export default function SpeakingPart4() {
  const [selected, setSelected] = useState(0);
  const SelectedExercise = exerciseComponents[selected];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Speaking – Part 4: Discussion</h1>
      <p>You respond to questions related to the collaborative task and express your views on broader topics.</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {exerciseComponents.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selected === i ? '#ED64A6' : '#FBB6CE',
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
          back="/niveles/c1/speaking/part-3"
          next="/niveles/c1"
          home="/niveles/c1"
        />
      </div>
    </div>
  );
}
