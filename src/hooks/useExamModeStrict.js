'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import {
  buildExamModePracticeHref,
  getExamModeSection,
  resolveExamModeSectionKey,
} from '@/utils/examModeSession';
import { getCambridgeSectionDurationSeconds } from '@/data/cambridgeExamTimings';

/**
 * Exam-mode rules for a practice section page.
 * Exam simulation only activates when:
 * - URL has examMode=1|review from the /exam-mode/ hub flow, AND
 * - A valid persisted exam-mode session exists for the section, AND
 * - URL does NOT include ?part= (part query always forces Practice Mode).
 *
 * @param {object} params
 * @param {string} params.slug - e.g. 'b2'
 * @param {number} params.partMin
 * @param {number} params.partMax
 * @param {string} [params.sectionTitle]
 */
export function useExamModeStrict({ slug, partMin, partMax, sectionTitle }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const examModeParam = searchParams.get('examMode');
  const forcePracticeByPart = Boolean(searchParams.get('part'));
  const examModeRequested = examModeParam === '1';
  const reviewModeRequested = examModeParam === 'review';
  const examSlot = Math.min(5, Math.max(1, Number(searchParams.get('examen') || searchParams.get('exam') || 1)));

  const sectionKey = useMemo(
    () => resolveExamModeSectionKey(slug, partMin, partMax),
    [slug, partMin, partMax],
  );

  const { session, ready, finishSection, touchSectionTimer, setSectionRemaining } =
    useExamModeSession(slug, examSlot);

  const section = useMemo(
    () => (session && sectionKey ? getExamModeSection(session, sectionKey) : null),
    [session, sectionKey],
  );

  const examSimulationFromHub = useMemo(() => {
    if (forcePracticeByPart || !ready || !session || !section) return false;
    if (reviewModeRequested) {
      return section.status === 'completed';
    }
    if (examModeRequested) {
      return section.status === 'active';
    }
    return false;
  }, [forcePracticeByPart, ready, session, section, reviewModeRequested, examModeRequested]);

  const reviewMode = examSimulationFromHub && reviewModeRequested;
  const examModeActive = examSimulationFromHub && examModeRequested;
  const hideFeedback = examModeActive;

  const hubHref = `/niveles/${slug}/exam-mode?examen=${examSlot}`;
  const resultsHref = `/niveles/${slug}/exam-mode/results?examen=${examSlot}`;

  const blockedRef = useRef(false);
  const strippedRef = useRef(false);

  /** Strip examMode from part-practice URLs so students never see a mixed state. */
  useEffect(() => {
    if (!forcePracticeByPart || !(examModeRequested || reviewModeRequested) || strippedRef.current) {
      return;
    }
    strippedRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('examMode');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [forcePracticeByPart, examModeRequested, reviewModeRequested, pathname, router, searchParams]);

  useEffect(() => {
    if (!examModeActive || !ready || !session || !sectionKey) return;

    const sec = getExamModeSection(session, sectionKey);
    if (!sec) return;

    if (sec.status === 'locked' && !blockedRef.current) {
      blockedRef.current = true;
      router.replace(hubHref);
      return;
    }

    if (sec.status === 'completed' && !reviewMode && !blockedRef.current) {
      blockedRef.current = true;
      router.replace(hubHref);
      return;
    }

    if (sec.status === 'active') {
      touchSectionTimer(sectionKey);
    }
  }, [
    examModeActive,
    ready,
    session,
    sectionKey,
    reviewMode,
    router,
    hubHref,
    touchSectionTimer,
  ]);

  const durationSeconds =
    section?.durationSeconds ?? getCambridgeSectionDurationSeconds(slug, sectionTitle || section?.title || '');

  const handleFinishSection = useCallback(
    (answersSnapshot, scores) => {
      if (!sectionKey) return;
      finishSection(sectionKey, answersSnapshot, scores);
      router.push(hubHref);
    },
    [sectionKey, finishSection, router, hubHref],
  );

  const getPracticeHref = useCallback(
    (baseHref) => buildExamModePracticeHref(baseHref, examSlot, { review: reviewMode }),
    [examSlot, reviewMode],
  );

  return {
    examModeActive,
    reviewMode,
    hideFeedback,
    examSlot,
    slug,
    sectionKey,
    section,
    session,
    ready,
    hubHref,
    resultsHref,
    durationSeconds,
    handleFinishSection,
    setSectionRemaining,
    getPracticeHref,
    forcePracticeByPart,
    examSimulationFromHub,
  };
}
