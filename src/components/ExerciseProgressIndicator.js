'use client';
import { useState, useEffect } from 'react';

const ExerciseProgressIndicator = ({ 
  exerciseId, 
  userId, 
  onProgressLoaded,
  showDetailed = false 
}) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && exerciseId) {
      loadProgress();
    }
  }, [userId, exerciseId]);

  const loadProgress = async () => {
    try {
      // This would normally call the progressTracker
      // For now, we'll simulate it
      setLoading(false);
      onProgressLoaded?.(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#3b82f6'; // blue
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 70) return '🥇';
    if (score >= 50) return '🥈';
    return '🥉';
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div style={{
        padding: '0.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#64748b',
        textAlign: 'center'
      }}>
        Loading progress...
      </div>
    );
  }

  if (!progress) {
    return (
      <div style={{
        padding: '0.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#0369a1',
        textAlign: 'center',
        border: '1px solid #bae6fd'
      }}>
        🆕 New Exercise
      </div>
    );
  }

  return (
    <div style={{
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '0.9rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: showDetailed ? '0.5rem' : '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>
            {getScoreIcon(progress.score)}
          </span>
          <span style={{
            fontWeight: 'bold',
            color: getScoreColor(progress.score)
          }}>
            {progress.score}%
          </span>
        </div>
        
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          {progress.attempts} attempt{progress.attempts > 1 ? 's' : ''}
        </div>
      </div>

      {/* Detailed view */}
      {showDetailed && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.5rem',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Time
            </div>
            <div style={{
              fontWeight: 'bold',
              color: '#374151'
            }}>
              {formatTime(progress.time_spent)}
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Completed
            </div>
            <div style={{
              fontWeight: 'bold',
              color: '#374151'
            }}>
              {new Date(progress.completed_at).toLocaleDateString()}
            </div>
          </div>

          {progress.best_score && progress.best_score !== progress.score && (
            <div>
              <div style={{
                fontSize: '0.7rem',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Best Score
              </div>
              <div style={{
                fontWeight: 'bold',
                color: '#059669'
              }}>
                {progress.best_score}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        marginTop: '0.5rem',
        height: '4px',
        backgroundColor: '#e2e8f0',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress.score}%`,
          backgroundColor: getScoreColor(progress.score),
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

// Component for showing exercise list with progress
export const ExerciseListWithProgress = ({ 
  exercises, 
  userId, 
  onExerciseClick,
  showProgress = true 
}) => {
  const [progressData, setProgressData] = useState({});

  const handleProgressLoaded = (exerciseId, progress) => {
    setProgressData(prev => ({
      ...prev,
      [exerciseId]: progress
    }));
  };

  const getOverallProgress = () => {
    const totalExercises = exercises.length;
    const completedExercises = Object.values(progressData).filter(p => p && p.score > 0).length;
    const averageScore = Object.values(progressData).reduce((sum, p) => sum + (p?.score || 0), 0) / totalExercises;
    
    return {
      total: totalExercises,
      completed: completedExercises,
      averageScore: Math.round(averageScore || 0),
      completionRate: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
    };
  };

  const overallProgress = getOverallProgress();

  return (
    <div>
      {/* Overall progress header */}
      {showProgress && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              📊 Overall Progress
            </h3>
            <span style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: overallProgress.averageScore >= 70 ? '#10b981' : '#f59e0b'
            }}>
              {overallProgress.averageScore}% avg
            </span>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {overallProgress.completed}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>
                {overallProgress.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {overallProgress.completionRate}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completion</div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{
            marginTop: '0.75rem',
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${overallProgress.completionRate}%`,
              backgroundColor: overallProgress.completionRate >= 80 ? '#10b981' : 
                              overallProgress.completionRate >= 60 ? '#3b82f6' : '#f59e0b',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => onExerciseClick?.(exercise)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    #{exercise.id}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#64748b'
                  }}>
                    {exercise.difficulty && `Difficulty: ${exercise.difficulty}/5`}
                  </span>
                </div>
                
                <h4 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '0.25rem'
                }}>
                  {exercise.question}
                </h4>
                
                {exercise.tags && (
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem'
                  }}>
                    {exercise.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '3px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress indicator */}
              {showProgress && (
                <div style={{ minWidth: '200px' }}>
                  <ExerciseProgressIndicator
                    exerciseId={exercise.id}
                    userId={userId}
                    onProgressLoaded={(progress) => handleProgressLoaded(exercise.id, progress)}
                    showDetailed={false}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseProgressIndicator;



