'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExamModeSessionSaveControls from '@/components/niveles/ExamModeSessionSaveControls';
import { revertLocalStorageSnapshots } from '@/utils/examModeSectionDraft';

/**
 * Save / exit-without-saving for an active exam-mode section.
 */
export function useExamModeSectionDraftControls({
  enabled,
  sectionKey,
  section,
  hubHref,
  saveSectionDraft,
  getDraftSnapshot,
  getScorePreview,
  applyDraftSnapshot,
  localStorageKeysForRevert = [],
  hydrateReady = true,
  lang = 'en',
}) {
  const router = useRouter();
  const hydratedRef = useRef(false);
  const [saveNotice, setSaveNotice] = useState('');
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !section?.sectionDraft || hydratedRef.current || !hydrateReady) return;
    hydratedRef.current = true;
    applyDraftSnapshot(section.sectionDraft);
  }, [enabled, section?.sectionDraft, hydrateReady, applyDraftSnapshot]);

  useEffect(
    () => () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    },
    [],
  );

  const showSaveNotice = useCallback((message) => {
    setSaveNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setSaveNotice(''), 2800);
  }, []);

  const handleSave = useCallback(() => {
    if (!sectionKey || typeof saveSectionDraft !== 'function') return;
    const scorePreview = typeof getScorePreview === 'function' ? getScorePreview() : null;
    const draft = getDraftSnapshot();
    if (scorePreview) draft.scorePreview = scorePreview;
    saveSectionDraft(sectionKey, draft);
    const isEn = lang === 'en';
    showSaveNotice(isEn ? 'Progress saved' : 'Progreso guardado');
  }, [sectionKey, saveSectionDraft, getDraftSnapshot, getScorePreview, showSaveNotice, lang]);

  const handleSaveAndExit = useCallback(() => {
    if (!sectionKey || typeof saveSectionDraft !== 'function') return;
    const scorePreview = typeof getScorePreview === 'function' ? getScorePreview() : null;
    const draft = getDraftSnapshot();
    if (scorePreview) draft.scorePreview = scorePreview;
    saveSectionDraft(sectionKey, draft);
    router.push(hubHref);
  }, [sectionKey, saveSectionDraft, getDraftSnapshot, getScorePreview, router, hubHref]);

  const handleExitWithoutSaving = useCallback(() => {
    const isEn = lang === 'en';
    const ok = window.confirm(
      isEn
        ? 'Leave this section without saving? Any changes since your last save will be lost.'
        : '¿Salir de esta sección sin guardar? Se perderán los cambios desde el último guardado.',
    );
    if (!ok) return;

    const savedSnapshots = section?.sectionDraft?.localStorageSnapshots;
    if (savedSnapshots || localStorageKeysForRevert.length > 0) {
      revertLocalStorageSnapshots(savedSnapshots || {}, localStorageKeysForRevert);
    }

    router.push(hubHref);
  }, [section?.sectionDraft?.localStorageSnapshots, localStorageKeysForRevert, router, hubHref, lang]);

  const examModeSaveControls =
    enabled && sectionKey ? (
      <ExamModeSessionSaveControls
        onSave={handleSave}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        saveNotice={saveNotice}
        lang={lang}
      />
    ) : null;

  return { examModeSaveControls, handleSave, handleSaveAndExit, handleExitWithoutSaving };
}
