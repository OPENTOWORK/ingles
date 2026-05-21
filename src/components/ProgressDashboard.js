'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { progressTracker } from '@/utils/progressTracker';
import panel from '@/components/training/dashboard-panel.module.css';

const ProgressDashboard = ({ userId }) => {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId]);

  const loadProgress = async () => {
    try {
      const [overallProgress, userAchievements] = await Promise.all([
        progressTracker.getUserOverallProgress(userId),
        progressTracker.getUserAchievements(userId)
      ]);

      setProgress(overallProgress);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillStats = (skillData) => {
    if (!skillData || skillData.length === 0) {
      return {
        total: 0,
        completed: 0,
        averageScore: 0,
        completionRate: 0,
        masteryLevel: 'beginner'
      };
    }

    const total = skillData.length;
    const completed = skillData.filter(p => p.score > 0).length;
    const averageScore = skillData.reduce((sum, p) => sum + (p.score || 0), 0) / total;
    const completionRate = (completed / total) * 100;

    let masteryLevel = 'beginner';
    if (averageScore >= 90) masteryLevel = 'expert';
    else if (averageScore >= 75) masteryLevel = 'advanced';
    else if (averageScore >= 60) masteryLevel = 'intermediate';

    return {
      total,
      completed,
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate),
      masteryLevel
    };
  };

  const getMasteryColor = (level) => {
    switch (level) {
      case 'expert': return '#10b981';
      case 'advanced': return '#3b82f6';
      case 'intermediate': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getMasteryIcon = (level) => {
    switch (level) {
      case 'expert': return '🏆';
      case 'advanced': return '🥇';
      case 'intermediate': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return <div className={panel.loading}>Loading your progress…</div>;
  }

  if (!progress || progress.total === 0) {
    return (
      <section className={panel.panel}>
        <h2 className={panel.panelTitle}>Your progress</h2>
        <div className={panel.empty}>
          <p className={panel.emptyTitle}>No activity yet</p>
          <p className={panel.emptyText}>Complete training exercises to see scores, skills, and achievements here.</p>
        </div>
      </section>
    );
  }

  return (
    <div className={panel.panel}>
      <h2 className={panel.panelTitle}>Your progress</h2>

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
          <div style={{ fontWeight: 'bold', color: '#0369a1' }}>{progress.total}</div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Exercises Done</div>
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
            {Math.round(progress.total > 0 ? (Object.values(progress.bySkill).flat().filter(p => p.score > 0).length / Object.values(progress.bySkill).flat().length) * 100 : 0)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Completion Rate</div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
          <div style={{ fontWeight: 'bold', color: '#d97706' }}>{achievements.length}</div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Achievements</div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          🎯 Skills Progress
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {Object.entries(progress.bySkill).map(([skill, skillData]) => {
            const stats = getSkillStats(skillData);
            return (
              <div
                key={skill}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {skill === 'listening' ? '🎧' : 
                       skill === 'reading' ? '📖' :
                       skill === 'writing' ? '✍️' :
                       skill === 'speaking' ? '🗣️' :
                       skill === 'vocabulary' ? '🧠' :
                       skill === 'use_of_english' ? '📘' : '📚'}
                    </span>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#1e293b',
                      textTransform: 'capitalize'
                    }}>
                      {skill.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>
                        {getMasteryIcon(stats.masteryLevel)}
                      </span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: getMasteryColor(stats.masteryLevel),
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {stats.masteryLevel}
                      </span>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#e2e8f0',
                      borderRadius: '10px',
                      width: '100px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${stats.completionRate}%`,
                        height: '100%',
                        backgroundColor: getMasteryColor(stats.masteryLevel),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      minWidth: '40px'
                    }}>
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {selectedSkill === skill && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Average Score</div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.averageScore}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completion Rate</div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.completionRate}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Mastery Level</div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: getMasteryColor(stats.masteryLevel),
                          textTransform: 'capitalize'
                        }}>
                          {getMasteryIcon(stats.masteryLevel)} {stats.masteryLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            🏆 Recent Achievements
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '0.5rem'
          }}>
            {achievements.slice(0, 5).map((achievement, index) => (
              <div
                key={achievement.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '6px',
                  border: '1px solid #fde68a'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#92400e' }}>
                    {achievement.achievement_id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a16207' }}>
                    Earned {new Date(achievement.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;






















