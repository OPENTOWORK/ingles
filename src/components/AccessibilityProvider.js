'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Accessibility Context
const AccessibilityContext = createContext();

// Accessibility Provider Component
export const AccessibilityProvider = ({ children }) => {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    // Visual settings
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    darkMode: false,
    
    // Navigation settings
    keyboardNavigation: true,
    focusIndicators: true,
    skipLinks: true,
    
    // Audio settings
    audioDescriptions: false,
    screenReader: false,
    soundEffects: true,
    
    // Learning settings
    extendedTime: false,
    simplifiedUI: false,
    textToSpeech: false,
    language: 'en'
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
      applyAccessibilitySettings();
    }
  }, [accessibilitySettings, isLoaded]);

  // Apply accessibility settings to the DOM
  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // High contrast
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (accessibilitySettings.largeText) {
      root.classList.add('large-text');
      root.style.fontSize = '1.2rem';
    } else {
      root.classList.remove('large-text');
      root.style.fontSize = '';
    }
    
    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.classList.remove('reduced-motion');
      root.style.removeProperty('--animation-duration');
    }
    
    // Dark mode
    if (accessibilitySettings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Focus indicators
    if (accessibilitySettings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }
    
    // Simplified UI
    if (accessibilitySettings.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }
  };

  // Update specific setting
  const updateSetting = (key, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      darkMode: false,
      keyboardNavigation: true,
      focusIndicators: true,
      skipLinks: true,
      audioDescriptions: false,
      screenReader: false,
      soundEffects: true,
      extendedTime: false,
      simplifiedUI: false,
      textToSpeech: false,
      language: 'en'
    };
    setAccessibilitySettings(defaultSettings);
  };

  // Get current setting value
  const getSetting = (key) => {
    return accessibilitySettings[key];
  };

  // Check if accessibility feature is enabled
  const isEnabled = (feature) => {
    return accessibilitySettings[feature] === true;
  };

  // Announce message to screen readers
  const announce = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value = {
    accessibilitySettings,
    updateSetting,
    resetSettings,
    getSetting,
    isEnabled,
    announce,
    isLoaded
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityStyles />
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Styles Component
const AccessibilityStyles = () => {
  return (
    <style jsx global>{`
      /* High Contrast Mode - Disabled by default, no visual changes */
      .high-contrast {
        /* No changes applied - feature disabled */
      }
      
      /* Large Text Mode */
      .large-text {
        font-size: 1.2rem !important;
      }
      
      .large-text h1 { font-size: 2.5rem !important; }
      .large-text h2 { font-size: 2rem !important; }
      .large-text h3 { font-size: 1.75rem !important; }
      .large-text h4 { font-size: 1.5rem !important; }
      .large-text p { font-size: 1.2rem !important; }
      .large-text button { font-size: 1.1rem !important; padding: 1rem 1.5rem !important; }
      .large-text input { font-size: 1.1rem !important; padding: 0.75rem !important; }
      
      /* Reduced Motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Dark Mode */
      .dark-mode {
        --primary-color: #3b82f6;
        --secondary-color: #1f2937;
        --background-color: #111827;
        --text-color: #f9fafb;
        --border-color: #374151;
        --card-background: #1f2937;
      }
      
      .dark-mode body {
        background-color: var(--background-color);
        color: var(--text-color);
      }
      
      .dark-mode .card,
      .dark-mode .exercise-card,
      .dark-mode .dashboard-card {
        background-color: var(--card-background);
        border-color: var(--border-color);
      }
      
      /* Focus Indicators */
      .focus-indicators *:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .focus-indicators button:focus,
      .focus-indicators input:focus,
      .focus-indicators select:focus,
      .focus-indicators textarea:focus,
      .focus-indicators a:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
      }
      
      /* Simplified UI */
      .simplified-ui {
        --border-radius: 4px;
        --box-shadow: none;
        --gradient: none;
      }
      
      .simplified-ui * {
        border-radius: var(--border-radius) !important;
        box-shadow: var(--box-shadow) !important;
        background: var(--background-color) !important;
      }
      
      .simplified-ui .gradient-bg {
        background: var(--background-color) !important;
      }
      
      /* Screen Reader Only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Skip Links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* Keyboard Navigation */
      .keyboard-nav button,
      .keyboard-nav input,
      .keyboard-nav select,
      .keyboard-nav textarea,
      .keyboard-nav a {
        position: relative;
      }
      
      .keyboard-nav button:focus::after,
      .keyboard-nav input:focus::after,
      .keyboard-nav select:focus::after,
      .keyboard-nav textarea:focus::after,
      .keyboard-nav a:focus::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #3b82f6;
        border-radius: 4px;
        pointer-events: none;
      }
      
      /* Audio Descriptions */
      .audio-description {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      /* Extended Time Indicators */
      .extended-time {
        position: relative;
      }
      
      .extended-time::before {
        content: '⏰ Extended time available';
        position: absolute;
        top: -25px;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 10;
      }
      
      /* Text to Speech Controls */
      .tts-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
      }
      
      .tts-controls button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        margin: 0.25rem;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .tts-controls button:hover {
        background: #2563eb;
      }
      
      /* Responsive adjustments for accessibility */
      @media (max-width: 768px) {
        .large-text {
          font-size: 1.1rem !important;
        }
        
        .large-text h1 { font-size: 2rem !important; }
        .large-text h2 { font-size: 1.75rem !important; }
        .large-text button { 
          font-size: 1rem !important; 
          padding: 0.875rem 1.25rem !important; 
          min-height: 44px; /* Touch target size */
        }
      }
      
      /* Print styles */
      @media print {
        .high-contrast,
        .dark-mode {
          --background-color: #ffffff !important;
          --text-color: #000000 !important;
        }
        
        .skip-link,
        .tts-controls {
          display: none !important;
        }
      }
    `}</style>
  );
};

// Accessibility Panel Component
export const AccessibilityPanel = () => {
  const { accessibilitySettings, updateSetting, resetSettings, announce } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
  };

  const handleReset = () => {
    resetSettings();
    announce('Accessibility settings reset to default', 'polite');
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Open accessibility settings"
      >
        ♿
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '300px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              ♿ Accessibility
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
              aria-label="Close accessibility settings"
            >
              ×
            </button>
          </div>

          {/* Visual Settings */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Visual
            </h4>
            
            {[
              { key: 'highContrast', label: 'High Contrast' },
              { key: 'largeText', label: 'Large Text' },
              { key: 'reducedMotion', label: 'Reduce Motion' },
              { key: 'darkMode', label: 'Dark Mode' },
              { key: 'simplifiedUI', label: 'Simplified UI' }
            ].map(setting => (
              <label
                key={setting.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={accessibilitySettings[setting.key]}
                  onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  {setting.label}
                </span>
              </label>
            ))}
          </div>

          {/* Navigation Settings */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Navigation
            </h4>
            
            {[
              { key: 'keyboardNavigation', label: 'Keyboard Navigation' },
              { key: 'focusIndicators', label: 'Focus Indicators' },
              { key: 'skipLinks', label: 'Skip Links' }
            ].map(setting => (
              <label
                key={setting.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={accessibilitySettings[setting.key]}
                  onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  {setting.label}
                </span>
              </label>
            ))}
          </div>

          {/* Learning Settings */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Learning
            </h4>
            
            {[
              { key: 'extendedTime', label: 'Extended Time' },
              { key: 'textToSpeech', label: 'Text to Speech' },
              { key: 'soundEffects', label: 'Sound Effects' }
            ].map(setting => (
              <label
                key={setting.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={accessibilitySettings[setting.key]}
                  onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  {setting.label}
                </span>
              </label>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Reset Settings
          </button>
        </div>
      )}
    </>
  );
};

export default AccessibilityProvider;












