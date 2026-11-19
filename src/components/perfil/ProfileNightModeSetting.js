'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyReadingNightBodyClass,
  loadReadingSettings,
  toggleReadingTheme,
} from '@/lib/readingPracticeSettingsStorage';

export default function ProfileNightModeSetting() {
  const [theme, setTheme] = useState('normal');

  useEffect(() => {
    const current = loadReadingSettings().theme || 'normal';
    setTheme(current);
    applyReadingNightBodyClass(current);

    const onChange = (event) => {
      const next = event.detail?.theme || loadReadingSettings().theme || 'normal';
      setTheme(next);
      applyReadingNightBodyClass(next);
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
    <div className="perfil-student__row">
      <div>
        <strong>Night mode</strong>
        <p>Switch the whole site to a darker colour scheme. This applies immediately and stays on this browser.</p>
      </div>
      <button
        type="button"
        className={`perfil-student__switch${isNight ? ' is-on' : ''}`}
        role="switch"
        aria-checked={isNight}
        aria-label="Night mode"
        onClick={handleToggle}
      />
    </div>
  );
}
