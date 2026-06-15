'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSkillPracticeThemeKey } from '@/utils/skillPartFirstProgress';
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

/**
 * Skill practice: open Part 1 + exam variant 1 immediately; part tabs switch sections in-page.
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
  examLabelsBySlot,
  examSlotPickerProps = {},
  onRefreshProgress,
  lang = 'en',
}) {
  const searchParams = useSearchParams();
  const [selectedPartNumber, setSelectedPartNumber] = useState(null);
  const bootstrapRef = useRef(false);

  const active = enabled && !searchParams.get('examMode');

  const sectionTitle = useMemo(
    () => (skillRoute ? getExamSkillSectionTitle(slug, skillRoute) : null),
    [slug, skillRoute],
  );

  const resolvedPartTopics = useMemo(
    () => buildPartTopicsFromHub(slug, partMin, partMax, [], sectionTitle),
    [slug, partMin, partMax, sectionTitle],
  );

  useEffect(() => {
    if (!active || bootstrapRef.current) return;

    const qPart = searchParams.get('part');
    let partNum = partMin;
    if (qPart) {
      const n = Number(qPart);
      if (Number.isFinite(n) && n >= partMin && n <= partMax) {
        partNum = n;
      }
    }
    setSelectedPartNumber(partNum);

    const qExam = searchParams.get('examen');
    const slot =
      qExam && Number.isFinite(Number(qExam)) && Number(qExam) > 0 ? Number(qExam) : 1;

    if (!examPracticeOpen) {
      onSelectExam(slot);
    }

    bootstrapRef.current = true;
  }, [active, searchParams, partMin, partMax, examPracticeOpen, onSelectExam]);

  useEffect(() => {
    if (!active || !selectedPartNumber || examPracticeOpen) return;
    onRefreshProgress?.();
  }, [active, selectedPartNumber, examPracticeOpen, onRefreshProgress]);

  const selectPartNumber = useCallback(
    (partNumber) => {
      const n = Number(partNumber);
      if (!Number.isFinite(n) || n < partMin || n > partMax) return;
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
