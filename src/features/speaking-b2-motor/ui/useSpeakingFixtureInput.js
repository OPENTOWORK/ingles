'use client';

import { useMemo, useRef } from 'react';
import { createSpeakingFixtureInput } from './speakingFixtureInput';

export function useSpeakingFixtureInput({ enabled, fixtureIds = [] } = {}) {
  const queueRef = useRef([]);
  queueRef.current = [...fixtureIds];

  return useMemo(() => {
    if (!enabled) return null;
    return createSpeakingFixtureInput({
      getNextAudio: async () => {
        const id = queueRef.current.shift();
        if (!id) return null;
        const res = await fetch(`/api/speaking-b2/fixtures/${encodeURIComponent(id)}/`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.code || data.error || 'FIXTURE_UNAVAILABLE');
        }
        return res.blob();
      },
    });
  }, [enabled]);
}
