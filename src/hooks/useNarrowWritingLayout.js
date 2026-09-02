'use client';

import { useEffect, useState } from 'react';

const NARROW_WRITING_LAYOUT_MQ = '(max-width: 960px)';

/**
 * Mobile/tablet writing practice: stack prompt + sidebar instead of 2-col grid.
 * Defaults to true (stacked) until the client measures the viewport.
 */
export function useNarrowWritingLayout() {
  const [narrow, setNarrow] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(NARROW_WRITING_LAYOUT_MQ);
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return narrow;
}

export default useNarrowWritingLayout;
