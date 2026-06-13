'use client';

import { useEffect } from 'react';
import {
  applyReadingNightBodyClass,
  loadReadingSettings,
} from '@/lib/readingPracticeSettingsStorage';

/** Aplica el tema guardado al cargar cualquier página y al cambiar la preferencia. */
export default function SiteNightModeInit() {
  useEffect(() => {
    const syncTheme = () => {
      const { theme } = loadReadingSettings();
      applyReadingNightBodyClass(theme);
    };

    syncTheme();
    window.addEventListener('dralo-reading-settings-changed', syncTheme);
    return () => window.removeEventListener('dralo-reading-settings-changed', syncTheme);
  }, []);

  return null;
}
