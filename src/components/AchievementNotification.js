'use client';
import { useState, useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 100);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      hideNotification();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const hideNotification = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        maxWidth: '400px'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #f59e0b, #f97316, #ea580c)'
          }}
        />

        {/* Close button */}
        <button
          onClick={hideNotification}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
        >
          ×
        </button>

        {/* Achievement content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              fontSize: '3rem',
              animation: 'bounce 1s infinite'
            }}
          >
            {achievement.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '0.25rem'
              }}
            >
              🎉 Achievement Unlocked!
            </h3>
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              {achievement.title}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: '1.4'
              }}
            >
              {achievement.description}
            </p>
            {achievement.points && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#f59e0b',
                  fontWeight: 'bold'
                }}
              >
                +{achievement.points} points
              </div>
            )}
          </div>
        </div>

        {/* Progress bar animation */}
        <div
          style={{
            marginTop: '1rem',
            height: '3px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
              animation: 'progress 0.8s ease-out'
            }}
          />
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Multiple achievements notification
export const MultipleAchievementsNotification = ({ achievements, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
      
      // Auto-advance through achievements every 3 seconds
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= achievements.length) {
            setIsVisible(false);
            onClose?.();
            return prev;
          }
          return next;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [achievements, onClose]);

  if (!isVisible || achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px'
      }}
    >
      <AchievementNotification
        achievement={currentAchievement}
        onClose={achievements.length === 1 ? onClose : undefined}
      />
      
      {/* Achievement counter */}
      {achievements.length > 1 && (
        <div
          style={{
            marginTop: '0.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#6b7280',
            backgroundColor: '#f8fafc',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}
        >
          {currentIndex + 1} of {achievements.length} achievements
        </div>
      )}
    </div>
  );
};

export default AchievementNotification;






















