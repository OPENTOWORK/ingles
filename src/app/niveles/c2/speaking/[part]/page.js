'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exercisesConfig, getExercise } from '@/data/exercises/c2-speaking';
import { partInfo } from '@/data/part-info/c2-speaking';

export default function DynamicPartPage() {
  const params = useParams();
  const router = useRouter();
  const part = parseInt(params.part);
  const [selected, setSelected] = useState(0);
  
  const numExercises = exercisesConfig[`part-${part}`] || 12;
  const exercise = getExercise(part, selected + 1);
  const info = partInfo[part] || {};
  
  const backLink = part === 1 ? '/niveles/c2' : `/niveles/c2/speaking/${part - 1}`;
  const nextLink = part === 4 ? '/niveles/c2' : `/niveles/c2/speaking/${part + 1}`;
  const homeLink = '/niveles/c2';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{info.title || `Part ${part}`}</h1>
      
      {/* Sección de información educativa */}
      {info.description && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '500' }}>
            📋 <strong>What is this part?</strong> {info.description}
          </p>
          
          {info.tips && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '0.75rem'
            }}>
              <p style={{ margin: 0 }}>
                💡 <strong>Tips:</strong> {info.tips}
              </p>
            </div>
          )}
          
          {info.commonErrors && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <p style={{ margin: 0 }}>
                ⚠️ <strong>Common Mistakes:</strong> {info.commonErrors}
              </p>
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: '#555' }}>
        Practice exercises for this part below.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[...Array(numExercises)].map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selected === i ? '#63B3ED' : '#BEE3F8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
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
        <div>
          <h2>{exercise.title}</h2>
          <p><strong>Question:</strong> {exercise.question}</p>
          <p><strong>Answer:</strong> {exercise.answer}</p>
        </div>
      </div>

      {/* Navegación personalizada */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        gap: '1rem'
      }}>
        {part > 1 ? (
          <button
            onClick={() => router.push(backLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            ← Anterior
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={() => router.push(homeLink)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#c6f6d5',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#9ae6b4'}
          onMouseOut={(e) => e.currentTarget.style.background = '#c6f6d5'}
        >
          📚 Índice
        </button>

        {part < 4 ? (
          <button
            onClick={() => router.push(nextLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            Siguiente →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
