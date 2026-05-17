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

    const timer = setTimeout(() => {
      if (announcement.isConnected) {
        announcement.remove();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (announcement.isConnected) {
        announcement.remove();
      }
    };
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
          bottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
          left: 'max(16px, env(safe-area-inset-left, 0px))',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          fontSize: '22px',
          cursor: 'pointer',
          zIndex: 850,
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
            bottom: 'max(76px, calc(env(safe-area-inset-bottom, 0px) + 60px))',
            left: 'max(16px, env(safe-area-inset-left, 0px))',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 850,
            maxWidth: 'min(300px, calc(100vw - 32px))',
            maxHeight: 'min(80vh, calc(100dvh - 100px))',
            overflowY: 'auto',
            boxSizing: 'border-box',
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












