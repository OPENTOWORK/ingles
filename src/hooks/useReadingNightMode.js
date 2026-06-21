'use client';

import { useEffect, useState } from 'react';
import { loadReadingSettings } from '@/lib/readingPracticeSettingsStorage';

export function useReadingNightMode() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const sync = () => {
      const fromStorage = loadReadingSettings().theme === 'night';
      const fromBody = document.body.classList.contains('reading-night-mode');
      setIsNight(fromStorage || fromBody);
    };

    sync();
    window.addEventListener('dralo-reading-settings-changed', sync);
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('dralo-reading-settings-changed', sync);
      obs.disconnect();
    };
  }, []);

  return isNight;
}
