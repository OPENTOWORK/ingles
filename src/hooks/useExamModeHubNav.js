'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getExamModeHubNav } from '@/utils/examModeSession';

/**
 * Footer "back" link when the user is inside exam mode (any section).
 * Falls back to URL ?examMode= so the hub link works even before session hydration.
 */
export function useExamModeHubNav({
  slug = 'b2',
  examSlot = 1,
  examModeActive = false,
  reviewMode = false,
  lang = 'en',
}) {
  const searchParams = useSearchParams();
  const examModeParam = searchParams.get('examMode');

  return useMemo(() => {
    const inExamFlow =
      examModeActive ||
      reviewMode ||
      examModeParam === '1' ||
      examModeParam === 'review';
    if (!inExamFlow) return null;
    return getExamModeHubNav(slug, examSlot, lang);
  }, [slug, examSlot, examModeActive, reviewMode, examModeParam, lang]);
}
