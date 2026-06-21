'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSkillPracticeThemeKey, resolveSkillPracticeExamSlot } from '@/utils/skillPartFirstProgress';
import { getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { getExamSkillSectionTitle } from '@/data/levelExamPartMap';

function buildPartTopicsFromHub(slug, partMin, partMax, partTopics = [], sectionTitle = null) {
  if (partTopics.length) return partTopics;
  const hub = getNivelesLevelHub(slug);
  if (!hub?.sections) return [];

  const sectionEntries = sectionTitle
    ? [[sectionTitle, hub.sections[sectionTitle]]]
    : Object.entries(hub.sections);

  const out = [];
  for (const [, topics] of sectionEntries) {
    if (!topics?.length) continue;
    for (const t of topics) {
      const m = String(t.text || '').match(/Part\s*(\d+)/i);
      if (!m) continue;
      const n = Number(m[1]);
      if (n < partMin || n > partMax) continue;
      const label = t.text.replace(/^Part\s*\d+:\s*/i, '').trim();
      out.push({ partNumber: n, displayName: label, shortLabel: label });
    }
  }
  if (out.length > 0) return out.sort((a, b) => a.partNumber - b.partNumber);

  if (sectionTitle && hub.sections[sectionTitle]?.length) {
    return hub.sections[sectionTitle]
      .map((t, i) => {
        const partNumber = partMin + i;
        if (partNumber > partMax) return null;
        const label = String(t.text || '').replace(/^Part\s*\d+:\s*/i, '').trim();
        return { partNumber, displayName: label, shortLabel: label };
      })
      .filter(Boolean);
  }

  return [];
}

function hasLoadedSkillProgress(progressBySlot = {}) {
  return Object.values(progressBySlot).some((slot) => Object.keys(slot?.parts || {}).length > 0);
}

/**
 * Skill practice: open the selected part and resume at the first exercise with zero stars.
 */
export function useSkillPartFirstNavigation({
  enabled = true,
  slug,
  skillRoute = null,
  partMin,
  partMax,
  examPracticeOpen,
  examSlot,
  onSelectExam,
  progressBySlot,
  examenIdBySlot = {},
  examLabelsBySlot,
  examSlotPickerProps = {},
  onRefreshProgress,
  lang = 'en',
}) {
  const searchParams = useSearchParams();
  const [selectedPartNumber, setSelectedPartNumber] = useState(null);
  const partBootstrapRef = useRef(false);
  const slotBootstrapRef = useRef(false);
  const [progressReadyForResume, setProgressReadyForResume] = useState(false);
  const [resumeProgressBySlot, setResumeProgressBySlot] = useState(null);
  const lastResolvedSlotRef = useRef(null);

  const active = enabled && !searchParams.get('examMode');
  const hasExplicitExamQuery = useMemo(() => {
    const qExam = searchParams.get('examen');
    return Boolean(qExam && Number.isFinite(Number(qExam)) && Number(qExam) > 0);
  }, [searchParams]);

  const examenCatalogKey = useMemo(
    () =>
      Object.keys(examenIdBySlot)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0 && examenIdBySlot[n])
        .sort((a, b) => a - b)
        .join(','),
    [examenIdBySlot],
  );

  const sectionTitle = useMemo(
    () => (skillRoute ? getExamSkillSectionTitle(slug, skillRoute) : null),
    [slug, skillRoute],
  );

  const resolvedPartTopics = useMemo(
    () => buildPartTopicsFromHub(slug, partMin, partMax, [], sectionTitle),
    [slug, partMin, partMax, sectionTitle],
  );

  useEffect(() => {
    if (!active || partBootstrapRef.current) return;

    const qPart = searchParams.get('part');
    let partNum = partMin;
    if (qPart) {
      const n = Number(qPart);
      if (Number.isFinite(n) && n >= partMin && n <= partMax) {
        partNum = n;
      }
    }
    setSelectedPartNumber(partNum);
    partBootstrapRef.current = true;
  }, [active, searchParams, partMin, partMax]);

  useEffect(() => {
    if (!active) {
      setProgressReadyForResume(false);
      setResumeProgressBySlot(null);
      slotBootstrapRef.current = false;
      lastResolvedSlotRef.current = null;
      return;
    }
    if (hasExplicitExamQuery) {
      setProgressReadyForResume(true);
      return;
    }
    if (!examenCatalogKey) return;

    if (hasLoadedSkillProgress(progressBySlot)) {
      setResumeProgressBySlot(progressBySlot);
      setProgressReadyForResume(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const bySlot = await onRefreshProgress?.();
        if (!cancelled) {
          setResumeProgressBySlot(bySlot && typeof bySlot === 'object' ? bySlot : {});
        }
      } finally {
        if (!cancelled) setProgressReadyForResume(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, hasExplicitExamQuery, examenCatalogKey, onRefreshProgress, progressBySlot]);

  useEffect(() => {
    if (!active || !selectedPartNumber || !progressReadyForResume) return;

    const qExam = searchParams.get('examen');
    const progressForResume = resumeProgressBySlot ?? progressBySlot;
    const requestedSlot = slotBootstrapRef.current
      ? examSlot
      : hasExplicitExamQuery
        ? Number(qExam)
        : null;
    const allowedSlot = resolveSkillPracticeExamSlot(
      progressForResume,
      selectedPartNumber,
      examenIdBySlot,
      requestedSlot,
    );

    const resolutionKey = `${selectedPartNumber}:${allowedSlot}`;
    if (lastResolvedSlotRef.current === resolutionKey && examSlot === allowedSlot && examPracticeOpen) {
      if (!slotBootstrapRef.current) slotBootstrapRef.current = true;
      return;
    }

    if (!slotBootstrapRef.current || examSlot !== allowedSlot || !examPracticeOpen) {
      if (lastResolvedSlotRef.current !== resolutionKey || examSlot !== allowedSlot) {
        lastResolvedSlotRef.current = resolutionKey;
        onSelectExam(allowedSlot);
      }
    }

    slotBootstrapRef.current = true;
  }, [
    active,
    selectedPartNumber,
    progressReadyForResume,
    hasExplicitExamQuery,
    searchParams,
    resumeProgressBySlot,
    progressBySlot,
    examenIdBySlot,
    examPracticeOpen,
    examSlot,
    onSelectExam,
  ]);

  const selectPartNumber = useCallback(
    (partNumber) => {
      const n = Number(partNumber);
      if (!Number.isFinite(n) || n < partMin || n > partMax) return;
      lastResolvedSlotRef.current = null;
      setSelectedPartNumber(n);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('part', String(n));
        window.history.replaceState(null, '', url.pathname + url.search);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [partMin, partMax],
  );

  const advanceToNextPart = useCallback(() => {
    const current = selectedPartNumber ?? partMin;
    const next = current >= partMax ? partMin : current + 1;
    selectPartNumber(next);
    onSelectExam(1);
    return true;
  }, [selectedPartNumber, partMin, partMax, selectPartNumber, onSelectExam]);

  const practiceReady = active
    ? Boolean(selectedPartNumber && examPracticeOpen)
    : examPracticeOpen;

  return {
    active,
    selectedPartNumber,
    practiceReady,
    navigation: null,
    hidePartTabs: false,
    selectPartNumber,
    advanceToNextPart,
    setSelectedPartNumber: selectPartNumber,
    backToParts: () => {},
    skillTheme: active ? getSkillPracticeThemeKey(skillRoute) : null,
    partTopics: resolvedPartTopics,
    progressBySlot,
    examLabelsBySlot,
    examSlotPickerProps,
    lang,
  };
}
