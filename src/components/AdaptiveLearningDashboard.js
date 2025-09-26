'use client';
import { useState, useEffect } from 'react';
import { analyzeUserPerformance, generateStudyPlan } from '@/utils/adaptiveLearning';

const AdaptiveLearningDashboard = ({ userId, onStudyPlanGenerated }) => {
  const [analysis, setAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDuration, setSelectedDuration] = useState(7);

  useEffect(() => {
    if (userId) {
      loadAnalysis();
    }
  }, [userId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const [performanceAnalysis, personalizedStudyPlan] = await Promise.all([
        analyzeUserPerformance(userId),
        generateStudyPlan(userId, selectedDuration)
      ]);
      
      setAnalysis(performanceAnalysis);
      setStudyPlan(personalizedStudyPlan);
    } catch (error) {
      console.error('Error loading adaptive learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewStudyPlan = async (duration) => {
    try {
      const newStudyPlan = await generateStudyPlan(userId, duration);
      setStudyPlan(newStudyPlan);
      onStudyPlanGenerated?.(newStudyPlan);
    } catch (error) {
      console.error('Error generating study plan:', error);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        fontSize: '1.1rem',
        color: '#64748b'
      }}>
        Analyzing your learning patterns...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ color: '#64748b', marginBottom: '1rem' }}>🧠 Adaptive Learning</h3>
        <p style={{ color: '#64748b' }}>Complete some exercises to see personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        🧠 Your Personal Learning Assistant
      </h2>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'recommendations', label: '💡 Recommendations', icon: '💡' },
          { id: 'study-plan', label: '📅 Study Plan', icon: '📅' },
          { id: 'progress', label: '📈 Progress', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#64748b',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            📊 Learning Overview
          </h3>
          
          {/* Overall Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold', color: '#0369a1' }}>
                {analysis.overallStats.totalExercises}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Exercises</div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontWeight: 'bold', color: '#059669' }}>
                {Math.round(analysis.overallStats.averageScore)}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Average Score</div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: 'bold', color: '#d97706' }}>
                {analysis.overallStats.learningVelocity}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Exercises/Session</div>
            </div>

            <div style={{
              backgroundColor: '#f3e8ff',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #d8b4fe'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
              <div style={{ fontWeight: 'bold', color: '#7c3aed' }}>
                {analysis.overallStats.retentionRate}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Retention Rate</div>
            </div>
          </div>

          {/* Next Level Status */}
          <div style={{
            backgroundColor: analysis.nextLevel.ready ? '#f0fdf4' : '#fef3c7',
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${analysis.nextLevel.ready ? '#bbf7d0' : '#fde68a'}`,
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {analysis.nextLevel.ready ? '🚀' : '📚'}
              </span>
              <h4 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#1e293b'
              }}>
                {analysis.nextLevel.ready ? 'Ready for Next Level!' : 'Keep Practicing'}
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#64748b'
            }}>
              Current Level: <strong>{analysis.nextLevel.currentLevel}</strong>
              {analysis.nextLevel.ready && (
                <> → Next: <strong>{analysis.nextLevel.nextLevel}</strong></>
              )}
            </p>
            <div style={{
              marginTop: '0.5rem',
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${analysis.nextLevel.readinessScore}%`,
                height: '100%',
                backgroundColor: analysis.nextLevel.ready ? '#10b981' : '#f59e0b',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            💡 Personalized Recommendations
          </h3>
          
          {analysis.recommendations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <p>Great job! You're on track. Keep practicing to get more personalized recommendations.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span>{getPriorityIcon(rec.priority)}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      backgroundColor: getPriorityColor(rec.priority),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {rec.priority} Priority
                    </span>
                    {rec.skill && (
                      <span style={{
                        fontSize: '0.8rem',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {rec.skill}
                      </span>
                    )}
                  </div>
                  
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}>
                    {rec.message}
                  </h4>
                  
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.9rem',
                    color: '#64748b'
                  }}>
                    {rec.action}
                  </p>
                  
                  {rec.exercises && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      Recommended: {rec.exercises.exerciseTypes?.join(', ') || 'Various exercises'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'study-plan' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0
            }}>
              📅 Personalized Study Plan
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Duration:</label>
              <select
                value={selectedDuration}
                onChange={(e) => {
                  setSelectedDuration(parseInt(e.target.value));
                  generateNewStudyPlan(parseInt(e.target.value));
                }}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem'
                }}
              >
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>
          </div>

          {studyPlan ? (
            <div>
              {/* Weekly Goals */}
              <div style={{
                backgroundColor: '#f0f9ff',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#0369a1'
                }}>
                  🎯 Weekly Goals
                </h4>
                {studyPlan.weeklyGoals.map((goal, index) => (
                  <div key={index} style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>
                    <strong>Week {goal.week}:</strong> {goal.target} - {goal.focus}
                  </div>
                ))}
              </div>

              {/* Daily Goals */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}>
                  📅 Daily Goals
                </h4>
                <div style={{
                  display: 'grid',
                  gap: '0.5rem'
                }}>
                  {studyPlan.dailyGoals.map((goal, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                          Day {goal.day}
                        </span>
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.9rem',
                          color: '#64748b'
                        }}>
                          {goal.exercises} exercises • {goal.estimatedTime} min
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.8rem',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {goal.focusSkill}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          backgroundColor: getPriorityColor(goal.priority),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {goal.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#059669'
                }}>
                  🏆 Milestones
                </h4>
                {studyPlan.milestones.map((milestone, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Day {milestone.day}: {milestone.target}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {milestone.reward}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <p>Generating your personalized study plan...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            📈 Skill Analysis
          </h3>
          
          {Object.keys(analysis.skillAnalysis).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>Complete exercises in different skills to see detailed analysis.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(analysis.skillAnalysis).map(([skill, stats]) => (
                <div
                  key={skill}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      textTransform: 'capitalize'
                    }}>
                      {skill.replace('_', ' ')}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        color: getTrendColor(stats.trend)
                      }}>
                        {getTrendIcon(stats.trend)}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        textTransform: 'capitalize'
                      }}>
                        {stats.trend}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Score
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {stats.averageScore}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Consistency
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {stats.consistency}%
                      </div>
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Efficiency
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {stats.timeEfficiency}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Mastery
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#1e293b',
                        textTransform: 'capitalize'
                      }}>
                        {stats.masteryLevel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptiveLearningDashboard;



