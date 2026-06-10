'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { claritySet } from '@/lib/clarity';
import { getPageTitleForPath } from '@/lib/pageViewLabels';

/**
 * Etiquetas de ruta en Clarity para funnels, mapas de calor y grabaciones por sección.
 */
export function useClarityPageTags(enabled = true) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || !pathname) return;

    const pageTitle = getPageTitleForPath(pathname);
    claritySet('page_path', pathname);
    claritySet('page_title', pageTitle);

    const nivelesMatch = pathname.match(/^\/niveles\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/);
    if (nivelesMatch) {
      const [, level, skill, part] = nivelesMatch;
      if (level) claritySet('cefr_level', level);
      if (skill) claritySet('skill', skill);
      if (part) claritySet('exam_part', part);
    }
  }, [enabled, pathname]);
}
