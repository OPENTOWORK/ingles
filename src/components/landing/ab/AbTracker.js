'use client';

import { useEffect } from 'react';
import { AB_EVENTS } from '@/lib/abExperiment';
import { rememberAbAttribution, trackAbEvent } from '@/lib/abExperimentTrack';

export default function AbTracker({ pageType, variant, source = 'direct' }) {
  useEffect(() => {
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = 'es';
    const attribution = { pageType, variant, source };
    rememberAbAttribution(attribution);
    trackAbEvent(AB_EVENTS.pageView, attribution);
    return () => {
      document.documentElement.lang = previousLang || 'en';
    };
  }, [pageType, variant, source]);

  return null;
}
