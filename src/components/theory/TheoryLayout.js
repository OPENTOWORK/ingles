'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
// import { progressTracker } from '@/utils/progressTracker';

const TheoryLayout = ({ 
  title, 
  description, 
  level, 
  children, 
  theoryContent, 
  exercises = [], 
  prerequisites = [],
  estimatedTime = "30 min"
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('theory');
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [userProgress, setUserProgress] = useState(null);

  const handleExerciseComplete = async (exerciseId, score) => {
    try {
      // Simplified progress tracking without progressTracker
      setCompletedExercises(prev => new Set([...prev, exerciseId]));
      console.log('Exercise completed:', exerciseId, 'Score:', score);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const getProgressPercentage = () => {
    if (exercises.length === 0) return 100;
    return Math.round((completedExercises.size / exercises.length) * 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: '#666'
          }}>
            <Link href="/teoria" style={{ color: '#667eea', textDecoration: 'none' }}>
              📚 Teoría
            </Link>
            <span>›</span>
            <span>{title}</span>
          </nav>

          {/* Title and Meta */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2d3748',
              margin: '0 0 0.5rem 0',
              lineHeight: 1.2
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              margin: '0 0 1rem 0',
              lineHeight: 1.6
            }}>
              {description}
            </p>
            
            {/* Meta Info */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                background: '#667eea',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Nivel {level}
              </span>
              <span style={{
                background: '#f7fafc',
                color: '#4a5568',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0'
              }}>
                ⏱️ {estimatedTime}
              </span>
              {prerequisites.length > 0 && (
                <span style={{
                  background: '#fff5f5',
                  color: '#e53e3e',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: '1px solid #fed7d7'
                }}>
                  📋 Requiere: {prerequisites.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontWeight: '500', color: '#4a5568' }}>
                Progreso del Tema
              </span>
              <span style={{ fontSize: '0.9rem', color: '#667eea' }}>
                {getProgressPercentage()}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${getProgressPercentage()}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <button
              onClick={() => setActiveTab('theory')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === 'theory' ? '#667eea' : 'transparent',
                color: activeTab === 'theory' ? 'white' : '#4a5568',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📖 Teoría
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === 'exercises' ? '#667eea' : 'transparent',
                color: activeTab === 'exercises' ? 'white' : '#4a5568',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              🎯 Ejercicios
              {exercises.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#e53e3e',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {exercises.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          minHeight: '600px'
        }}>
          {activeTab === 'theory' && (
            <div>
              {theoryContent}
            </div>
          )}
          
          {activeTab === 'exercises' && (
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎯 Ejercicios Prácticos
              </h2>
              
              {exercises.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <p>No hay ejercicios disponibles para este tema aún.</p>
                  <p>¡Pronto agregaremos ejercicios interactivos!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {exercises.map((exercise, index) => (
                    <div key={exercise.key || index}>
                      {exercise}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          href="/teoria"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          ← Volver a Teoría
        </Link>
        
        {activeTab === 'theory' && exercises.length > 0 && (
          <button
            onClick={() => setActiveTab('exercises')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Ir a Ejercicios →
          </button>
        )}
      </div>
    </div>
  );
};

export default TheoryLayout;
