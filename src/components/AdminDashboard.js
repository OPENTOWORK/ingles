'use client';
import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { supabase } from '@/utils/supabaseClient';

const AdminDashboard = ({ isAdmin = false }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get performance metrics
      const performanceData = performanceMonitor.getDashboardData();
      
      // Get database statistics
      const dbStats = await getDatabaseStats();
      
      // Get user statistics
      const userStats = await getUserStats();

      setDashboardData({
        performance: performanceData,
        database: dbStats,
        users: userStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDatabaseStats = async () => {
    try {
      const [exercisesResult, progressResult, achievementsResult, usersResult] = await Promise.all([
        supabase.from('exercises').select('id', { count: 'exact', head: true }),
        supabase.from('user_progress').select('id', { count: 'exact', head: true }),
        supabase.from('user_achievements').select('id', { count: 'exact', head: true }),
        supabase.from('user_stats').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalExercises: exercisesResult.count || 0,
        totalProgressRecords: progressResult.count || 0,
        totalAchievements: achievementsResult.count || 0,
        totalUsers: usersResult.count || 0
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalExercises: 0,
        totalProgressRecords: 0,
        totalAchievements: 0,
        totalUsers: 0
      };
    }
  };

  const getUserStats = async () => {
    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('total_exercises, total_score, total_time_spent, current_level')
        .order('total_exercises', { ascending: false })
        .limit(100);

      if (!stats) return { averageStats: {}, topUsers: [] };

      const totalUsers = stats.length;
      const averageStats = {
        exercises: stats.reduce((sum, s) => sum + s.total_exercises, 0) / totalUsers,
        score: stats.reduce((sum, s) => sum + s.total_score, 0) / totalUsers,
        timeSpent: stats.reduce((sum, s) => sum + s.total_time_spent, 0) / totalUsers
      };

      const topUsers = stats.slice(0, 10);

      return { averageStats, topUsers };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { averageStats: {}, topUsers: [] };
    }
  };

  const formatNumber = (num) => {
    return num ? Math.round(num * 100) / 100 : 0;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isAdmin) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#64748b'
      }}>
        <h3>🔒 Admin Access Required</h3>
        <p>This dashboard is only available to administrators.</p>
      </div>
    );
  }

  if (loading && !dashboardData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '1.1rem',
        color: '#64748b'
      }}>
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1e293b',
          margin: 0
        }}>
          📊 Admin Dashboard
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={loadDashboardData}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={() => {
              const data = performanceMonitor.exportMetrics();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `performance-data-${new Date().toISOString()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            📥 Export Data
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'performance', label: '⚡ Performance', icon: '⚡' },
          { id: 'users', label: '👥 Users', icon: '👥' },
          { id: 'database', label: '🗄️ Database', icon: '🗄️' },
          { id: 'errors', label: '❌ Errors', icon: '❌' }
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
      {activeTab === 'overview' && dashboardData && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            📊 System Overview
          </h3>
          
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '1.5rem' }}>
                {dashboardData.database.totalUsers}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Users</div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.5rem' }}>
                {dashboardData.database.totalExercises}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Exercises</div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 'bold', color: '#d97706', fontSize: '1.5rem' }}>
                {dashboardData.database.totalProgressRecords}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Progress Records</div>
            </div>

            <div style={{
              backgroundColor: '#f3e8ff',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #d8b4fe'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '1.5rem' }}>
                {dashboardData.database.totalAchievements}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Achievements</div>
            </div>
          </div>

          {/* Performance Summary */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              Performance Summary
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Page Load Time</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumber(dashboardData.performance.summary.averagePageLoadTime)}ms
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Error Rate</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumber(dashboardData.performance.summary.errorRate)}%
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Events</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {dashboardData.performance.summary.totalEvents}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && dashboardData && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            ⚡ Performance Metrics
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {dashboardData.performance.performanceMetrics.map((metric, index) => (
              <div
                key={index}
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
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}>
                    {metric.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <span style={{
                    fontSize: '0.8rem',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {metric.count} samples
                  </span>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Average</div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {formatNumber(metric.average)}
                      {metric.name.includes('time') || metric.name.includes('paint') ? 'ms' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Min</div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {formatNumber(metric.min)}
                      {metric.name.includes('time') || metric.name.includes('paint') ? 'ms' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Max</div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {formatNumber(metric.max)}
                      {metric.name.includes('time') || metric.name.includes('paint') ? 'ms' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && dashboardData && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            👥 User Statistics
          </h3>
          
          {/* Average Stats */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              Average User Performance
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Exercises</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumber(dashboardData.users.averageStats.exercises)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Average Score</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {formatNumber(dashboardData.users.averageStats.score)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Time Spent</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                  {formatTime(dashboardData.users.averageStats.timeSpent)}
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              Top Performers
            </h4>
            
            <div style={{
              display: 'grid',
              gap: '0.5rem'
            }}>
              {dashboardData.users.topUsers.map((user, index) => (
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
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{
                      fontSize: '0.8rem',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        User {user.user_id?.slice(0, 8)}...
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Level: {user.current_level || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Exercises</div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.total_exercises}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Score</div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.total_score}%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Time</div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{formatTime(user.total_time_spent)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && dashboardData && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            🗄️ Database Statistics
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '1.5rem' }}>
                {dashboardData.database.totalExercises}
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
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.5rem' }}>
                {dashboardData.database.totalProgressRecords}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Progress Records</div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontWeight: 'bold', color: '#d97706', fontSize: '1.5rem' }}>
                {dashboardData.database.totalAchievements}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Achievements</div>
            </div>

            <div style={{
              backgroundColor: '#f3e8ff',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #d8b4fe'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '1.5rem' }}>
                {dashboardData.database.totalUsers}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Users</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'errors' && dashboardData && (
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            ❌ Error Analysis
          </h3>
          
          {dashboardData.performance.topErrors.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {dashboardData.performance.topErrors.map((error, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#fef2f2',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {error.count} occurrences
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    fontFamily: 'monospace',
                    backgroundColor: '#fff',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {error.message}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p>No errors detected! Great job! 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        Last updated: {dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default AdminDashboard;



