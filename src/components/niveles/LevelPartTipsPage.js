'use client';

import { useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { getLevelPartNavLinks } from '@/data/levelExamPartMap';
import { useUserRole } from '@/context/UserRoleContext';
import { examTheoryBackHrefFromPartTipsPath } from '@/lib/nivelesPartTipsRoutes';

export default function LevelPartTipsPage({ slug, skillFolder, exercisesConfig, getExercise, partInfo }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { userRole } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const part = parseInt(params.part, 10);
  const [selected, setSelected] = useState(0);

  const numExercises = exercisesConfig[`part-${part}`] || 12;
  const exercise = getExercise(part, selected + 1);
  const info = partInfo[part] || partInfo[String(part)] || {};
  const nav = getLevelPartNavLinks(slug, skillFolder, part);
  const studentHomeLink = examTheoryBackHrefFromPartTipsPath(pathname);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{info.title || `Part ${part}`}</h1>

      {info.description && (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '500' }}>
            📋 <strong>What is this part?</strong> {info.description}
          </p>

          {info.tips && (
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
              }}
            >
              <p style={{ margin: 0 }}>
                💡 <strong>Tips:</strong> {info.tips}
              </p>
            </div>
          )}

          {info.commonErrors && (
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <p style={{ margin: 0 }}>
                ⚠️ <strong>Common Mistakes:</strong> {info.commonErrors}
              </p>
            </div>
          )}
        </div>
      )}

      {!isStudent ? (
        <>
          <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: '#555' }}>
            Practice exercises for this part below.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[...Array(numExercises)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selected === i ? '#38A169' : '#C6F6D5',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Ejercicio {i + 1}
              </button>
            ))}
          </div>

          <div
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h2>{exercise.title}</h2>
              <p>
                <strong>Question:</strong> {exercise.question}
              </p>
              <p>
                <strong>Answer:</strong> {exercise.answer}
              </p>
            </div>
          </div>
        </>
      ) : null}

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
        {nav.showPrev ? (
          <button
            type="button"
            onClick={() => router.push(nav.backLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ← Anterior
          </button>
        ) : (
          <span />
        )}

        {!isStudent ? (
          <button
            type="button"
            onClick={() => router.push(nav.practiceHref)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#bee3f8',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Práctica examen
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push(studentHomeLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#c6f6d5',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            📚 Exam theory
          </button>
        )}

        {!isStudent ? (
          <button
            type="button"
            onClick={() => router.push(nav.homeLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#c6f6d5',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            📚 Índice
          </button>
        ) : null}

        {nav.showNext ? (
          <button
            type="button"
            onClick={() => router.push(nav.nextLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
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
