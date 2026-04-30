'use client';
import { useState, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { supabase } from '@/utils/supabaseClient';

const UserOnboarding = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    currentLevel: 'A1',
    learningGoals: [],
    availableTime: 30,
    preferredSkills: [],
    accessibilityNeeds: []
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const { announce } = useAccessibility();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to English Practice!',
      description: 'Let\'s set up your personalized learning experience.',
      type: 'intro'
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      description: 'This helps us personalize your learning journey.',
      type: 'profile'
    },
    {
      id: 'level',
      title: 'What\'s your current level?',
      description: 'Choose the level that best matches your current English skills.',
      type: 'level'
    },
    {
      id: 'goals',
      title: 'What are your learning goals?',
      description: 'Select what you want to achieve with English.',
      type: 'goals'
    },
    {
      id: 'time',
      title: 'How much time can you practice?',
      description: 'This helps us create the perfect study plan for you.',
      type: 'time'
    },
    {
      id: 'skills',
      title: 'Which skills do you want to focus on?',
      description: 'Choose the areas you want to improve most.',
      type: 'skills'
    },
    {
      id: 'accessibility',
      title: 'Accessibility preferences',
      description: 'Let us know if you have any accessibility needs.',
      type: 'accessibility'
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Your personalized learning experience is ready.',
      type: 'complete'
    }
  ];

  const levels = [
    { id: 'A1', name: 'Beginner', description: 'Basic everyday expressions and simple phrases' },
    { id: 'A2', name: 'Elementary', description: 'Simple conversations about familiar topics' },
    { id: 'B1', name: 'Intermediate', description: 'Clear speech on familiar matters regularly encountered' },
    { id: 'B2', name: 'Upper Intermediate', description: 'Complex text on concrete and abstract topics' },
    { id: 'C1', name: 'Advanced', description: 'Long and complex texts with implicit meaning' },
    { id: 'C2', name: 'Proficiency', description: 'Native-like fluency and comprehension' }
  ];

  const goals = [
    { id: 'travel', name: 'Travel', icon: '✈️', description: 'Communicate while traveling' },
    { id: 'work', name: 'Work', icon: '💼', description: 'Professional communication' },
    { id: 'study', name: 'Study', icon: '🎓', description: 'Academic purposes' },
    { id: 'exam', name: 'Exam Preparation', icon: '📝', description: 'Prepare for English exams' },
    { id: 'conversation', name: 'Conversation', icon: '💬', description: 'Daily conversations' },
    { id: 'hobby', name: 'Hobby', icon: '🎨', description: 'Personal interest' }
  ];

  const timeOptions = [
    { id: 15, name: '15 minutes', description: 'Quick daily practice' },
    { id: 30, name: '30 minutes', description: 'Regular practice' },
    { id: 60, name: '1 hour', description: 'Intensive learning' },
    { id: 120, name: '2+ hours', description: 'Deep study sessions' }
  ];

  const skills = [
    { id: 'listening', name: 'Listening', icon: '🎧', description: 'Understanding spoken English' },
    { id: 'reading', name: 'Reading', icon: '📖', description: 'Reading comprehension' },
    { id: 'writing', name: 'Writing', icon: '✍️', description: 'Written communication' },
    { id: 'speaking', name: 'Speaking', icon: '🗣️', description: 'Verbal communication' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '🧠', description: 'Word knowledge' },
    { id: 'use_of_english', name: 'Grammar', icon: '📘', description: 'Grammar and structure' }
  ];

  const accessibilityOptions = [
    { id: 'high_contrast', name: 'High Contrast', description: 'Better visibility' },
    { id: 'large_text', name: 'Large Text', description: 'Easier reading' },
    { id: 'screen_reader', name: 'Screen Reader', description: 'Audio descriptions' },
    { id: 'keyboard_nav', name: 'Keyboard Navigation', description: 'Navigate with keyboard' },
    { id: 'extended_time', name: 'Extended Time', description: 'More time for exercises' }
  ];

  useEffect(() => {
    // Announce current step for screen readers
    announce(`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`, 'polite');
  }, [currentStep, announce]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Try to save user preferences to database
      const preferencesData = {
        user_id: userId,
        estilo_aprendizaje: userData.currentLevel || 'A1',
        notificaciones: true,
        recordatorios: true
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferencesData);

      if (error) {
        console.warn('Failed to save preferences to database:', error);
        // Continue anyway - we'll save to localStorage as backup
        localStorage.setItem('user_preferences', JSON.stringify(preferencesData));
      }

      // Always complete onboarding even if database save fails
      setIsCompleted(true);
      announce('Onboarding completed successfully!', 'polite');
      onComplete?.(userData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Save to localStorage as backup
      try {
        const preferencesData = {
          user_id: userId,
          estilo_aprendizaje: userData.currentLevel || 'A1',
          notificaciones: true,
          recordatorios: true,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('user_preferences', JSON.stringify(preferencesData));
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
      }
      
      // Complete onboarding anyway
      setIsCompleted(true);
      announce('Onboarding completed! (Preferences saved locally)', 'polite');
      onComplete?.(userData);
    }
  };

  const updateUserData = (key, value) => {
    setUserData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayValue = (key, value) => {
    setUserData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case 'intro':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6' }}>
              We'll ask you a few questions to create your personalized learning experience. 
              This will only take 2-3 minutes.
            </p>
          </div>
        );

      case 'profile':
        return (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                What's your name?
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => updateUserData('name', e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                autoFocus
              />
            </div>
          </div>
        );

      case 'level':
        return (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => updateUserData('currentLevel', level.id)}
                  style={{
                    padding: '1rem',
                    border: userData.currentLevel === level.id ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: userData.currentLevel === level.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <strong style={{ color: '#1e293b' }}>{level.name}</strong>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      backgroundColor: '#f1f5f9',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {level.id}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#64748b'
                  }}>
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ marginBottom: '1.5rem', color: '#64748b', textAlign: 'center' }}>
              Select all that apply (you can choose multiple)
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleArrayValue('learningGoals', goal.id)}
                  style={{
                    padding: '1rem',
                    border: userData.learningGoals.includes(goal.id) ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: userData.learningGoals.includes(goal.id) ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {goal.icon}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {goal.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {goal.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'time':
        return (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {timeOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => updateUserData('availableTime', option.id)}
                  style={{
                    padding: '1rem',
                    border: userData.availableTime === option.id ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: userData.availableTime === option.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {option.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ marginBottom: '1.5rem', color: '#64748b', textAlign: 'center' }}>
              Choose the skills you want to focus on (select multiple)
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              {skills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => toggleArrayValue('preferredSkills', skill.id)}
                  style={{
                    padding: '1rem',
                    border: userData.preferredSkills.includes(skill.id) ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: userData.preferredSkills.includes(skill.id) ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {skill.icon}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {skill.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <p style={{ marginBottom: '1.5rem', color: '#64748b', textAlign: 'center' }}>
              Select any accessibility features you need (optional)
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {accessibilityOptions.map(option => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: userData.accessibilityNeeds.includes(option.id) ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: userData.accessibilityNeeds.includes(option.id) ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={userData.accessibilityNeeds.includes(option.id)}
                    onChange={() => toggleArrayValue('accessibilityNeeds', option.id)}
                    style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {option.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>
              Welcome to your personalized learning journey!
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
              Based on your preferences, we've created a customized learning plan. 
              You can always adjust your settings later.
            </p>
            
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              padding: '1rem',
              margin: '2rem 0',
              border: '1px solid #bae6fd'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>
                Your Learning Profile
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'left' }}>
                <p><strong>Level:</strong> {levels.find(l => l.id === userData.currentLevel)?.name}</p>
                <p><strong>Time:</strong> {timeOptions.find(t => t.id === userData.availableTime)?.name} per session</p>
                <p><strong>Focus Areas:</strong> {userData.preferredSkills.map(s => skills.find(skill => skill.id === s)?.name).join(', ')}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case 'profile':
        return userData.name.trim().length > 0;
      case 'level':
        return userData.currentLevel !== '';
      case 'goals':
        return userData.learningGoals.length > 0;
      case 'time':
        return userData.availableTime > 0;
      case 'skills':
        return userData.preferredSkills.length > 0;
      default:
        return true;
    }
  };

  if (isCompleted) {
    return null; // Onboarding completed
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e2e8f0',
          borderRadius: '3px',
          marginBottom: '2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step Indicator */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <span style={{
            fontSize: '0.9rem',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px'
          }}>
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Step Title and Description */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            {steps[currentStep].title}
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '1rem'
          }}>
            {steps[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: '2rem' }}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: canProceed() ? '#3b82f6' : '#e2e8f0',
              color: canProceed() ? '#fff' : '#64748b',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
