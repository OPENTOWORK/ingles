'use client';
import { useState, useEffect } from 'react';
import { initializeDatabase, checkDatabaseHealth } from '@/utils/databaseInitializer';
import { setupDatabaseAutomatically, checkAutomaticSetupStatus } from '@/utils/automaticDatabaseSetup';
import { setupDatabaseRobustly, checkRobustDatabaseHealth } from '@/utils/robustDatabaseSetup';
import { setupOfflineFirstDatabase, checkOfflineFirstHealth } from '@/utils/offlineFirstDatabase';

const DatabaseSetup = ({ onSetupComplete }) => {
  const [status, setStatus] = useState('checking'); // checking, initializing, completed, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [healthCheck, setHealthCheck] = useState(null);
  const [currentStep, setCurrentStep] = useState('');
  const [setupMethod, setSetupMethod] = useState('automatic'); // automatic or manual

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      setStatus('checking');
      setMessage('Checking database status...');
      
      // Try offline-first health check first (always works)
      const offlineHealth = await checkOfflineFirstHealth();
      
      if (offlineHealth.healthy) {
        setHealthCheck(offlineHealth);
        setStatus('completed');
        setMessage(offlineHealth.online ? 'Database is ready!' : 'Working offline - all features available!');
        setProgress(100);
        onSetupComplete?.(true);
      } else {
        setStatus('error');
        setMessage('System initialization failed');
        setProgress(0);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Error checking database: ${error.message}`);
      setProgress(0);
    }
  };

  const initializeDatabaseSetup = async () => {
    try {
      setStatus('initializing');
      setProgress(0);
      setMessage('Initializing database automatically...');

      // Try offline-first setup (always works)
      if (setupMethod === 'automatic') {
        const result = await setupOfflineFirstDatabase((progressData) => {
          setProgress(progressData.percentage);
          setCurrentStep(progressData.step);
          setMessage(`${progressData.step} (${progressData.percentage}%)`);
        });
        
        if (result.success) {
          setStatus('completed');
          setMessage(result.offline ? 'System ready (offline mode) - all features available!' : 'Database initialized successfully!');
          setProgress(100);
          setCurrentStep('');
          onSetupComplete?.(true);
        } else {
          // If offline-first setup fails, try robust setup
          console.log('Offline-first setup failed, trying robust setup...');
          const robustResult = await setupDatabaseRobustly((progressData) => {
            setProgress(progressData.percentage);
            setCurrentStep(progressData.step);
            setMessage(`${progressData.step} (${progressData.percentage}%)`);
          });
          
          if (robustResult.success) {
            setStatus('completed');
            setMessage('Database initialized successfully!');
            setProgress(100);
            setCurrentStep('');
            onSetupComplete?.(true);
          } else {
            // If robust fails, try automatic setup
            const autoResult = await setupDatabaseAutomatically((progressData) => {
              setProgress(progressData.percentage);
              setCurrentStep(progressData.step);
              setMessage(`${progressData.step} (${progressData.percentage}%)`);
            });
            
            if (autoResult.success) {
              setStatus('completed');
              setMessage('Database initialized automatically!');
              setProgress(100);
              setCurrentStep('');
              onSetupComplete?.(true);
            } else {
              // If automatic fails, try manual setup
              setSetupMethod('manual');
              await initializeManualSetup();
            }
          }
        }
      } else {
        await initializeManualSetup();
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Setup failed: ${error.message}`);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const initializeManualSetup = async () => {
    try {
      setMessage('Initializing database manually...');
      
      const progressSteps = [
        { step: 20, message: 'Creating tables...' },
        { step: 40, message: 'Inserting initial data...' },
        { step: 60, message: 'Creating indexes...' },
        { step: 80, message: 'Setting up triggers...' },
        { step: 100, message: 'Database setup complete!' }
      ];

      const result = await initializeDatabase();
      
      if (result.success) {
        setStatus('completed');
        setMessage('Database initialized successfully!');
        setProgress(100);
        setCurrentStep('');
        onSetupComplete?.(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Manual setup failed: ${error.message}`);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔍';
      case 'initializing': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return '#3b82f6';
      case 'initializing': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      maxWidth: '500px',
      margin: '2rem auto',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem'
      }}>
        {getStatusIcon()}
      </div>

      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem'
      }}>
        Database Setup
      </h2>

      <p style={{
        color: '#64748b',
        marginBottom: '2rem',
        lineHeight: '1.6'
      }}>
        {message}
      </p>

      {/* Progress Bar */}
      {status === 'initializing' && (
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e2e8f0',
          borderRadius: '4px',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: getStatusColor(),
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}

      {/* Health Check Results */}
      {healthCheck && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Database Health Check
          </h3>
          
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            {Object.entries(healthCheck.checks || {}).map(([check, status]) => (
              <div key={check} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: status ? '#10b981' : '#ef4444' }}>
                  {status ? '✅' : '❌'}
                </span>
                <span style={{ color: '#64748b', textTransform: 'capitalize' }}>
                  {check.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Method Selection */}
      {status === 'error' && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            Choose Setup Method
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setSetupMethod('automatic')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: setupMethod === 'automatic' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: setupMethod === 'automatic' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                🤖 Automatic Setup
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                No SQL required - Fully automated
              </div>
            </button>
            
            <button
              onClick={() => setSetupMethod('manual')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: setupMethod === 'manual' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: setupMethod === 'manual' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                📝 Manual Setup
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Copy SQL to Supabase editor
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Current Step Display */}
      {status === 'initializing' && currentStep && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #bae6fd',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.25rem' }}>
            Current Step
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {currentStep}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {status === 'error' && (
          <button
            onClick={initializeDatabaseSetup}
            style={{
              backgroundColor: setupMethod === 'automatic' ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = setupMethod === 'automatic' ? '#059669' : '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = setupMethod === 'automatic' ? '#10b981' : '#3b82f6'}
          >
            {setupMethod === 'automatic' ? '🤖 Setup Automatically' : '📝 Setup Manually'}
          </button>
        )}

        <button
          onClick={checkDatabaseStatus}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
        >
          Check Status
        </button>
      </div>

      {/* Setup Instructions */}
      {status === 'error' && setupMethod === 'manual' && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#92400e'
          }}>
            📝 Manual Setup Instructions
          </h4>
          <div style={{
            fontSize: '0.9rem',
            color: '#a16207',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              1. Go to your Supabase project dashboard
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              2. Navigate to <strong>SQL Editor</strong>
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              3. Copy the SQL from{' '}
              <code style={{
                backgroundColor: '#fbbf24',
                padding: '0.125rem 0.25rem',
                borderRadius: '3px',
                fontSize: '0.8rem'
              }}>
                SUPABASE_SETUP_GUIDE.md
              </code>
            </p>
            <p style={{ margin: 0 }}>
              4. Paste and run the SQL script
            </p>
          </div>
        </div>
      )}

      {status === 'error' && setupMethod === 'automatic' && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#059669'
          }}>
            🤖 Automatic Setup Benefits
          </h4>
          <div style={{
            fontSize: '0.9rem',
            color: '#047857',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 0.25rem 0' }}>
              ✅ No SQL knowledge required
            </p>
            <p style={{ margin: '0 0 0.25rem 0' }}>
              ✅ Creates all tables automatically
            </p>
            <p style={{ margin: '0 0 0.25rem 0' }}>
              ✅ Inserts sample data and achievements
            </p>
            <p style={{ margin: 0 }}>
              ✅ Configures security policies
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSetup;
