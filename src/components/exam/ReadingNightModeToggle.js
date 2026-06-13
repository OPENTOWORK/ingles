'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyReadingNightBodyClass,
  loadReadingSettings,
  toggleReadingTheme,
} from '@/lib/readingPracticeSettingsStorage';

export default function ReadingNightModeToggle({ variant = 'desktop' }) {
  const [theme, setTheme] = useState('normal');

  useEffect(() => {
    setTheme(loadReadingSettings().theme || 'normal');

    const onChange = (event) => {
      setTheme(event.detail?.theme || loadReadingSettings().theme || 'normal');
    };
    window.addEventListener('dralo-reading-settings-changed', onChange);
    return () => window.removeEventListener('dralo-reading-settings-changed', onChange);
  }, []);

  const handleToggle = useCallback(() => {
    const next = toggleReadingTheme();
    setTheme(next.theme);
    applyReadingNightBodyClass(next.theme);
  }, []);

  const isNight = theme === 'night';

  return (
    <button
      type="button"
      className={`app-nav__night-mode app-nav__night-mode--${variant}${
        isNight ? ' app-nav__night-mode--active' : ''
      }`}
      onClick={handleToggle}
      aria-pressed={isNight}
      aria-label={isNight ? 'Switch to normal mode' : 'Switch to night mode'}
      title={isNight ? 'Normal mode' : 'Night mode'}
    >
      <span className="app-nav__night-mode-icon" aria-hidden>
        {isNight ? '☀' : '🌙'}
      </span>
      <span className="app-nav__night-mode-label">{isNight ? 'Normal' : 'Night'}</span>
    </button>
  );
}
