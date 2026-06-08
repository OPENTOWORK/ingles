'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SkillPartFirstNavigation } from '@/components/b2/SkillPartFirstNavigation';
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

  // Hub entries often use skill-local Part 1…N (e.g. Writing Part 1 = global Part 8).
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
 * Flujo skill: Part 1…N → variantes (carrusel) → práctica.
 * Sin generación IA en el carrusel (eso queda en el picker de examen completo / admin).
 */
export function useSkillPartFirstNavigation({
  enabled = true,
  slug,
  skillRoute = null,
  partMin,
  partMax,
  partTopics = [],
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
  const autoPartRef = useRef(false);
  const autoExamRef = useRef(false);

  const active = enabled && !searchParams.get('examMode');

  const sectionTitle = useMemo(
    () => (skillRoute ? getExamSkillSectionTitle(slug, skillRoute) : null),
    [slug, skillRoute],
  );

  const resolvedPartTopics = useMemo(
    () => buildPartTopicsFromHub(slug, partMin, partMax, partTopics, sectionTitle),
    [slug, partMin, partMax, partTopics, sectionTitle],
  );

  const skillPickerProps = useMemo(() => {
    const { showNewExamButton: _n, onNewExam: _e, ...rest } = examSlotPickerProps;
    return rest;
  }, [examSlotPickerProps]);

  useEffect(() => {
    if (!active || autoPartRef.current) return;
    const qPart = searchParams.get('part');
    if (!qPart) return;
    const n = Number(qPart);
    if (!Number.isFinite(n) || n < partMin || n > partMax) return;
    autoPartRef.current = true;
    setSelectedPartNumber(n);
  }, [active, searchParams, partMin, partMax]);

  useEffect(() => {
    if (!active || !selectedPartNumber || autoExamRef.current || examPracticeOpen) return;
    const qExam = searchParams.get('examen');
    if (!qExam) return;
    autoExamRef.current = true;
    onSelectExam(Number(qExam));
  }, [active, selectedPartNumber, searchParams, examPracticeOpen, onSelectExam]);

  useEffect(() => {
    if (!active || !selectedPartNumber || examPracticeOpen) return;
    onRefreshProgress?.();
  }, [active, selectedPartNumber, examPracticeOpen, onRefreshProgress]);

  const handleSelectPart = useCallback((partNumber) => {
    setSelectedPartNumber(partNumber);
    autoExamRef.current = false;
  }, []);

  const handleBackToParts = useCallback(() => {
    setSelectedPartNumber(null);
    autoExamRef.current = false;
  }, []);

  const handleSelectExamForPart = useCallback(
    (slot) => {
      onSelectExam(slot);
    },
    [onSelectExam],
  );

  const navigation = useMemo(() => {
    if (!active) return null;
    return (
      <SkillPartFirstNavigation
        partMin={partMin}
        partMax={partMax}
        partTopics={resolvedPartTopics}
        selectedPartNumber={selectedPartNumber}
        onSelectPart={handleSelectPart}
        onBackToParts={handleBackToParts}
        examSlot={examSlot}
        onSelectExam={handleSelectExamForPart}
        progressBySlot={progressBySlot}
        examLabelsBySlot={examLabelsBySlot}
        skillRoute={skillRoute}
        lang={lang}
        {...skillPickerProps}
      />
    );
  }, [
    active,
    partMin,
    partMax,
    resolvedPartTopics,
    selectedPartNumber,
    handleSelectPart,
    handleBackToParts,
    examSlot,
    handleSelectExamForPart,
    progressBySlot,
    examLabelsBySlot,
    skillRoute,
    lang,
    skillPickerProps,
  ]);

  const practiceReady = active
    ? Boolean(selectedPartNumber && examPracticeOpen)
    : examPracticeOpen;

  return {
    active,
    selectedPartNumber,
    practiceReady,
    navigation,
    hidePartTabs: active && Boolean(selectedPartNumber),
    setSelectedPartNumber,
    skillTheme: active ? getSkillPracticeThemeKey(skillRoute) : null,
  };
}
