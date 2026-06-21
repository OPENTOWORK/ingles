'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { usePartPracticeTimer } from '@/hooks/usePartPracticeTimer';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import { supabase } from '@/utils/supabaseClient';
import SkillPartPracticeHeader from '@/components/exam/SkillPartPracticeHeader';
import { SkillPartInstructionsPanel } from '@/components/b2/B2ExamPracticeContent';
import { getFormattedEnunciado } from '@/utils/b2ExamPaperShared';
import { formatLevelsPartDisplayName, getSkillLocalPartNumber, getSkillPartTabLabel, getSkillPartPracticeTitle } from '@/utils/formatLevelsPartDisplayName';
import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';
import ReadingPracticeFeedbackToggle from '@/components/exam/ReadingPracticeFeedbackToggle';
import { withBasePath } from '@/lib/base-path';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { playExaminerAudio, stopExaminerAudio, pauseExaminerAudio, resumeExaminerAudio, isExaminerAudioPaused } from '@/utils/playExaminerAudio';
import ExaminerVoiceVisualizer from '@/components/b2/ExaminerVoiceVisualizer';
import SpeakingExerciseControls from '@/components/b2/SpeakingExerciseControls';
import { partInfo as b2SpeakingPartInfo } from '@/data/part-info/b2-speaking';
import {
  B2_SPEAKING_EXAM_PARTS,
  B2_SPEAKING_PART_MAX,
  B2_SPEAKING_PART_MIN,
  getB2SpeakingPartConfig,
} from '@/features/speaking/domain/b2-speaking-exam-parts';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import { getB2LongTurnPhotoUrls } from '@/data/b2-speaking-long-turn-photos';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import ExamPracticeProgressPanel from '@/components/exam/ExamPracticeProgressPanel';
import ExamPracticeSessionSideRail from '@/components/exam/ExamPracticeSessionSideRail';
import B2SpeakingStrategyPanel from '@/components/b2/B2SpeakingStrategyPanel';
import { getB2SpeakingStrategyPack } from '@/data/b2SpeakingPracticeStrategies';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import { ReadingPracticeSessionProvider, useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeSectionDraftControls } from '@/hooks/useExamModeSectionDraftControls';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import {
  buildExamModeSectionDraft,
  resolvePartIdByNumber,
  EXAM_MODE_SECTION_DRAFT_VERSION,
} from '@/utils/examModeSectionDraft';
import { useExamModeHubNav } from '@/hooks/useExamModeHubNav';
import {
  resolveExamPracticeMode,
  isExamSimulationMode,
  isPartPracticeMode,
  getExamChromeTitle,
  getExamChromeSubtitle,
} from '@/lib/examPracticeMode';
import { sitePublicPath } from '@/utils/sitePublicPath';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import {
  useLevelsExamAdminFlow,
  createAdminExamSelectHandler,
  buildExamSlotPickerProps,
  reloadExamNamesBySlot,
} from '@/hooks/useLevelsExamAdminFlow';
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
import {
  runKeepPracticingSkillFlow,
} from '@/utils/skillPracticeNavigation';
import { fetchAiUsageStatus } from '@/lib/ai/draloAiClient';
import { speakingLimitLabel, LIMIT_REACHED, resolveSpeakingUsageDisplay } from '@/lib/aiUsageLimitCopy';
import {
  loadSpeakingUsageLocal,
  mergeSpeakingUsageStatus,
  saveSpeakingUsageLocal,
} from '@/lib/speakingUsageStorage';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { buildExamModeContinueModuleHref } from '@/utils/buildExamModeContinueModuleHref';
import { buildExamModeSkillPartSnapshots } from '@/utils/buildExamModeSkillPartSnapshots';
import { finishExamModeSupabasePersistence } from '@/utils/finishExamModeSupabasePersistence';
import { LEVELS_SCORE_SOURCE, resolvePracticeScoreSourceFromExamModeParam } from '@/utils/levelsScoreSource';
import { persistLevelsPartProgress } from '@/utils/persistLevelsPartProgress';

const buttonStyle = {
  backgroundColor: '#c1f2cd',
  padding: '0.75rem 1.25rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  display: 'inline-block',
  textAlign: 'center',
};

function extractImageUrls(text = '') {
  const urls = [];
  const re = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp)|\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp))/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    urls.push(m[1]);
  }
  return urls.slice(0, 2).map((url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return sitePublicPath(url.startsWith('/') ? url : `/${url}`);
  });
}

function resolveLongTurnPhotos(taskContext, examSlot) {
  const fromDb = extractImageUrls(taskContext);
  if (fromDb.length >= 2) return fromDb;
  return getB2LongTurnPhotoUrls(examSlot);
}

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} props.loadingLabel
 * @param {string} props.refreshLabel
 */
function B2SpeakingExamPracticeInner({ title, subtitle, loadingLabel, refreshLabel, lang = 'en' }) {
  const searchParams = useSearchParams();
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoreSource = resolvePracticeScoreSourceFromExamModeParam(searchParams.get('examMode'));
  const scoring = useB2ExamScoringSession({
    partMin: B2_SPEAKING_PART_MIN,
    partMax: B2_SPEAKING_PART_MAX,
    scoreSource,
  });
  const examMode = useExamModeStrict({
    slug: 'b2',
    partMin: B2_SPEAKING_PART_MIN,
    partMax: B2_SPEAKING_PART_MAX,
    sectionTitle: 'Speaking',
  });
  const {
    examModeActive,
    reviewMode,
    examSlot: examModeSlot,
    section: examSection,
    sectionKey: examSectionKey,
    handleFinishSection,
    setSectionRemaining,
    getSectionRemaining,
    saveSectionDraft,
    hubHref,
  } = examMode;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});
  const [speakingDraftEpoch, setSpeakingDraftEpoch] = useState(0);
  const examModePartScoresRef = useRef({});
  const examModePersistedPartsRef = useRef({});
  const speakingPartSnapshotsRef = useRef({});

  useEffect(() => {
    void reloadExamNamesBySlot('b2').then(({ names }) => setExamLabelsBySlot(names));
  }, [scoring.examenIdBySlot]);

  const loadParts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const partNames = Array.from(
        { length: B2_SPEAKING_PART_MAX - B2_SPEAKING_PART_MIN + 1 },
        (_, i) => `Parte ${B2_SPEAKING_PART_MIN + i} B2`,
      );
      const { data, error: partsError } = await supabase
        .from('levels_partes')
        .select('*')
        .in('nombre_parte', partNames);
      if (partsError) throw partsError;
      const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';
      const mapped = partNames
        .map((name) => (data || []).find((p) => p.nombre_parte === name))
        .filter(Boolean)
        .map((part) => {
          const num = Number(String(part.nombre_parte).match(/\d+/)?.[0] || 0);
          return {
            id: part.id,
            nombre: formatLevelsPartDisplayName(part.nombre_parte),
            descripcion: partDescription(part),
            partNumber: num,
          };
        });
      setPartsData(mapped);
      setSelectedPartId((prev) => {
        if (prev && mapped.some((p) => p.id === prev)) return prev;
        return mapped[0]?.id ?? null;
      });
    } catch (e) {
      setError(e?.message || 'Could not load Speaking parts.');
    } finally {
      setLoading(false);
    }
  }, []);

  const adminFlow = useLevelsExamAdminFlow({
    slug: 'b2',
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: () => {
      void scoring.reloadExamenCatalog?.();
      void loadParts();
    },
  });

  const handleSelectExamSlot = useMemo(
    () => createAdminExamSelectHandler(adminFlow, (slot) => scoring.handleSelectExam(selectExamSlot, slot)),
    [adminFlow, scoring, selectExamSlot],
  );
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => scoring.handleSelectExam(selectExamSlot, slot),
  });

  const skillNav = useSkillPartFirstNavigation({
    enabled: !examModeActive,
    slug: 'b2',
    skillRoute: 'exam-speaking',
    partMin: B2_SPEAKING_PART_MIN,
    partMax: B2_SPEAKING_PART_MAX,
    examPracticeOpen: scoring.examPracticeOpen,
    examSlot,
    onSelectExam: handleSelectExamSlot,
    progressBySlot: scoring.progressBySlot,
    examLabelsBySlot,
    examSlotPickerProps,
    onRefreshProgress: scoring.refreshPuntuacionesProgress,
    lang,
  });

  useB2AutoOpenExamFromUrl({
    examPracticeOpen: scoring.examPracticeOpen,
    handleSelectExam: scoring.handleSelectExam,
    selectExamSlot,
    disabled: skillNav.active,
  });

  const layoutPracticeOpen = skillNav.active ? skillNav.practiceReady : scoring.examPracticeOpen;
  const isSkillPracticeSession = skillNav.active && layoutPracticeOpen;
  const readingSession = useReadingPracticeSession();
  const PracticeChrome = isSkillPracticeSession ? ReadingPracticeChrome : B2ExamPracticeChrome;

  const handleKeepPracticing = useCallback(() => {
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      onSelectExamSlot: (slot) => {
        void scoring.refreshPuntuacionesProgress();
        handleSelectExamSlot(slot);
      },
      onAdvanceToNextPart: () => {
        void scoring.refreshPuntuacionesProgress();
        skillNav.advanceToNextPart();
      },
    });
  }, [examSlot, scoring, handleSelectExamSlot, skillNav]);

  const tabPartsData = useMemo(() => {
    if (!skillNav.active) return partsData;
    return partsData.filter(
      (p) => p.partNumber >= B2_SPEAKING_PART_MIN && p.partNumber <= B2_SPEAKING_PART_MAX,
    );
  }, [partsData, skillNav.active]);

  useEffect(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber || !tabPartsData.length) return;
    const target = tabPartsData.find((p) => p.partNumber === skillNav.selectedPartNumber);
    if (target?.id && target.id !== selectedPartId) setSelectedPartId(target.id);
  }, [skillNav.active, skillNav.selectedPartNumber, tabPartsData, selectedPartId]);

  useEffect(() => {
    void loadParts();
  }, [loadParts]);

  useEffect(() => {
    const qPart = searchParams.get('part');
    if (!qPart || !partsData.length) return;
    const targetNumber = Number(qPart);
    if (!Number.isFinite(targetNumber)) return;
    const target = partsData.find((p) => p.partNumber === targetNumber);
    if (target) setSelectedPartId(target.id);
  }, [searchParams, partsData]);

  useEffect(() => () => stopExaminerAudio(), []);

  const selectedPart = useMemo(
    () => tabPartsData.find((p) => p.id === selectedPartId),
    [tabPartsData, selectedPartId],
  );

  const partNumber = selectedPart?.partNumber ?? 0;

  const categoryTimer = usePartPracticeTimer({
    practiceReady: !loading && !error && scoring.examPracticeOpen && Boolean(selectedPart?.id),
    partKey: selectedPart?.id ? `${examSlot}:${partNumber}:${selectedPart.id}` : null,
    autoStart: (isSkillPracticeSession || (examModeActive && !reviewMode)) && scoring.examPracticeOpen,
  });

  const persistPartSessionTime = useCallback(
    async (progressOverride = null) => {
      if (!selectedPart?.id) return;
      const uid = await getSessionUserId();
      if (!uid || !partNumber) return;
      const preguntaId = progressOverride?.preguntaId || selectedPart.id;
      await categoryTimer.finalizeSession({
        userId: uid,
        preguntaId,
        parteId: selectedPart.id,
        partNumber,
        examSlot,
        levelSlug: 'b2',
        skillRoute: 'exam-speaking',
        scoreSource,
        progress: progressOverride,
        sectionTitle: 'Speaking',
      });
    },
    [categoryTimer, selectedPart?.id, partNumber, examSlot, scoreSource],
  );

  useEffect(() => {
    return () => {
      void persistPartSessionTime();
    };
  }, [selectedPart?.id, examSlot, partNumber, persistPartSessionTime]);

  const b2PartCfg = getB2PartScoring(partNumber);
  const savedPartScore = scoring.progressBySlot[examSlot]?.parts?.[partNumber];

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    const examenId = scoring.examenIdBySlot[examSlot];
    if (examenId) scoring.setExamenContext(examenId);
  }, [examSlot, scoring.examPracticeOpen, scoring.examenIdBySlot, scoring.setExamenContext]);

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    scoring.resetPartNoticeOnPartChange(examSlot, partNumber, scoring.progressBySlot);
  }, [examSlot, partNumber, selectedPart?.id, scoring.examPracticeOpen]);

  const scorePanelProps = {
    correctCount: savedPartScore?.correct ?? 0,
    totalSlots: b2PartCfg?.total ?? 5,
    passingCount: b2PartCfg?.passing ?? 3,
  };

  const persistSpeakingPartScore = useCallback(
    async ({ partNumber, preguntaId, parteId, correct, total, passed, scoreSource }) => {
      if (
        scoreSource === LEVELS_SCORE_SOURCE.EXAM_MODE &&
        examModePersistedPartsRef.current[partNumber]
      ) {
        return;
      }

      const uid = await getSessionUserId();
      const examenId = scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot];
      if (!uid || !examenId || !preguntaId || !partNumber) return;

      const result = await persistLevelsPartProgress({
        userId: uid,
        preguntaId,
        parteId,
        examenId,
        partNumber,
        progress: {
          complete: true,
          correct,
          total,
          evaluated: total,
          passed,
        },
        scoreSource,
        statsMode:
          scoreSource === LEVELS_SCORE_SOURCE.EXAM_MODE ? 'section-finish' : 'part-complete',
      });

      if (result.saved) {
        if (scoreSource === LEVELS_SCORE_SOURCE.EXAM_MODE) {
          examModePersistedPartsRef.current[partNumber] = true;
        }
        void scoring.refreshPuntuacionesProgress();
      }
    },
    [scoring, examSlot],
  );

  const handleSaveSpeakingPart = useCallback(
    ({ correct, total, passed }) => {
      if (!selectedPart?.id || !scoring.examPracticeOpen) return;

      const payload = {
        partNumber: selectedPart.partNumber,
        preguntaId: selectedPart.id,
        parteId: selectedPart.id,
        correct,
        total,
        passed,
      };
      const progress = {
        complete: true,
        correct,
        total,
        passed,
        preguntaId: selectedPart.id,
      };

      if (examModeActive && !reviewMode) {
        examModePartScoresRef.current[selectedPart.partNumber] = {
          correct,
          total,
          preguntaId: selectedPart.id,
        };
        void persistSpeakingPartScore({
          ...payload,
          scoreSource: LEVELS_SCORE_SOURCE.EXAM_MODE,
        });
        void persistPartSessionTime(progress);
        return;
      }

      void persistSpeakingPartScore({
        ...payload,
        scoreSource: LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
      });
      void persistPartSessionTime(progress);
    },
    [scoring, selectedPart, examModeActive, reviewMode, persistSpeakingPartScore, persistPartSessionTime],
  );

  const handleSpeakingPartSnapshot = useCallback((partNumber, snapshot) => {
    if (!partNumber || !snapshot?.sessionId) return;
    speakingPartSnapshotsRef.current[`${examSlot}:${partNumber}`] = snapshot;
  }, [examSlot]);

  const handleExamModeFinish = useCallback(
    (redirectTo) => {
      const { scores, partSnapshots } = buildExamModeSkillPartSnapshots({
        partMin: B2_SPEAKING_PART_MIN,
        partMax: B2_SPEAKING_PART_MAX,
        partsData: tabPartsData,
        examModePartScores: examModePartScoresRef.current,
      });
      const pendingSnapshots = Object.fromEntries(
        Object.entries(partSnapshots).filter(
          ([partKey]) => !examModePersistedPartsRef.current[Number(partKey)],
        ),
      );
      handleFinishSection({ speakingCompleted: true, partNumber }, scores, { redirectTo });
      void finishExamModeSupabasePersistence({
        partSnapshots: pendingSnapshots,
        examenId: scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot],
      });
    },
    [
      tabPartsData,
      scoring.currentExamenId,
      scoring.examenIdBySlot,
      examSlot,
      handleFinishSection,
      partNumber,
    ],
  );

  const handleContinueModuleInExamMode = useCallback(() => {
    handleExamModeFinish(
      buildExamModeContinueModuleHref({
        partNumber,
        pagePartMax: B2_SPEAKING_PART_MAX,
        examSlot,
        slug: 'b2',
      }),
    );
  }, [handleExamModeFinish, partNumber, examSlot]);

  const handleContinueInPage = useCallback(() => {
    const sorted = [...tabPartsData].sort((a, b) => a.partNumber - b.partNumber);
    const currentIdx = sorted.findIndex((p) => p.id === selectedPartId);
    if (currentIdx < 0 || currentIdx >= sorted.length - 1) return;
    const next = sorted[currentIdx + 1];
    setSelectedPartId(next.id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (next.partNumber) url.searchParams.set('part', String(next.partNumber));
      window.history.replaceState(null, '', url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabPartsData, selectedPartId]);

  const handlePreviousInPage = useCallback(() => {
    const sorted = [...tabPartsData].sort((a, b) => a.partNumber - b.partNumber);
    const currentIdx = sorted.findIndex((p) => p.id === selectedPartId);
    if (currentIdx <= 0) return;
    setSelectedPartId(sorted[currentIdx - 1].id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabPartsData, selectedPartId]);

  const chromeSubtitle = isSkillPracticeSession ? null : subtitle;

  const practiceMode = resolveExamPracticeMode({ examModeActive, reviewMode });

  const examModeHubNav = useExamModeHubNav({
    slug: 'b2',
    examSlot: examModeSlot ?? examSlot,
    examModeActive,
    reviewMode,
    lang: lang === 'es' ? 'es' : 'en',
  });

  const modeBadge = useMemo(() => {
    if (isExamSimulationMode(practiceMode)) {
      return lang === 'en' ? 'Exam Mode' : 'Modo examen';
    }
    if (isSkillPracticeSession && isPartPracticeMode(practiceMode)) {
      return lang === 'en' ? 'Practice Mode' : 'Modo práctica';
    }
    return null;
  }, [practiceMode, isSkillPracticeSession, lang]);

  const compactChromeHeader = isSkillPracticeSession || isExamSimulationMode(practiceMode);

  const showPracticeSideRail =
    isSkillPracticeSession && isPartPracticeMode(practiceMode) && scoring.examPracticeOpen;

  const isB2SpeakingPartPractice =
    isSkillPracticeSession &&
    isPartPracticeMode(practiceMode) &&
    partNumber >= B2_SPEAKING_PART_MIN &&
    partNumber <= B2_SPEAKING_PART_MAX;

  const speakingStrategyPack = useMemo(
    () => (isB2SpeakingPartPractice ? getB2SpeakingStrategyPack(partNumber) : null),
    [isB2SpeakingPartPractice, partNumber],
  );

  const chromeTitle = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeTitle({
        lang,
        examModeActive,
        reviewMode,
        sectionTitle: 'Speaking',
        defaultTitle: title,
      });
    }
    return title;
  }, [examModeActive, reviewMode, lang, title]);

  const chromeSubtitleResolved = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeSubtitle({ lang, examModeActive, reviewMode, defaultSubtitle: subtitle });
    }
    return chromeSubtitle;
  }, [examModeActive, reviewMode, lang, subtitle, chromeSubtitle]);

  const reportErrorContext = useMemo(() => {
    if (loading || error || !scoring.examPracticeOpen || !selectedPart) return null;
    const questionText = selectedPart?.descripcion
      ? String(selectedPart.descripcion).replace(/\s+/g, ' ').trim().slice(0, 300)
      : '';
    return {
      levelSlug: 'b2',
      skillRoute: 'exam-speaking',
      partNumber,
      examSlot,
      practiceMode,
      examModeActive,
      reviewMode,
      questionId: selectedPart?.id,
      questionText: questionText || undefined,
    };
  }, [
    loading,
    error,
    scoring.examPracticeOpen,
    selectedPart,
    partNumber,
    examSlot,
    practiceMode,
    examModeActive,
    reviewMode,
  ]);

  const getExamDraftSnapshot = useCallback(() => {
    const draftByPart = {};
    for (const part of tabPartsData) {
      const pn = part.partNumber;
      if (!pn) continue;
      const snapshot = speakingPartSnapshotsRef.current[`${examSlot}:${pn}`];
      if (snapshot) draftByPart[pn] = snapshot;
    }
    return buildExamModeSectionDraft({
      draftByPart,
      activePartNumber: partNumber || null,
      activePartId: selectedPart?.id ?? null,
      remainingSeconds: getSectionRemaining(examSectionKey) ?? examSection?.remainingSeconds ?? null,
    });
  }, [
    tabPartsData,
    examSlot,
    partNumber,
    selectedPart?.id,
    getSectionRemaining,
    examSectionKey,
    examSection?.remainingSeconds,
  ]);

  const applyExamDraftSnapshot = useCallback(
    (draft) => {
      if (!draft || draft.version !== EXAM_MODE_SECTION_DRAFT_VERSION) return;
      for (const [pn, snapshot] of Object.entries(draft.draftByPart || {})) {
        if (snapshot && typeof snapshot === 'object') {
          speakingPartSnapshotsRef.current[`${examSlot}:${Number(pn)}`] = snapshot;
        }
      }
      if (draft.activePartId) {
        setSelectedPartId(draft.activePartId);
      } else if (draft.activePartNumber) {
        const partId = resolvePartIdByNumber(tabPartsData, draft.activePartNumber);
        if (partId) setSelectedPartId(partId);
      }
      setSpeakingDraftEpoch((n) => n + 1);
    },
    [examSlot, tabPartsData],
  );

  const { examModeSaveControls } = useExamModeSectionDraftControls({
    enabled: examModeActive && !reviewMode && Boolean(examSectionKey),
    sectionKey: examSectionKey,
    section: examSection,
    hubHref,
    saveSectionDraft,
    getDraftSnapshot: getExamDraftSnapshot,
    applyDraftSnapshot: applyExamDraftSnapshot,
    hydrateReady: !loading && tabPartsData.length > 0,
    lang: lang === 'es' ? 'es' : 'en',
  });

  const selectedPartTitleParts = useMemo(
    () => getSkillPartPracticeTitle('b2', partNumber, lang === 'es' ? 'es' : 'en'),
    [partNumber, lang],
  );

  const speakingInstructionsBlocks = useMemo(() => {
    const raw = selectedPart?.descripcion || '';
    if (!raw.trim()) return [];
    return getFormattedEnunciado(raw);
  }, [selectedPart?.descripcion]);

  return (
    <B2ExamPracticeLayout examPracticeOpen={layoutPracticeOpen}>
      {adminFlow.canRegenerateExams ? (
        <A2ExamGenerationStatus
          generating={adminFlow.generating}
          genError={adminFlow.genError}
          genProgress={adminFlow.genProgress}
          genStep={adminFlow.genStep}
          genTotal={adminFlow.genTotal}
          genEtaSeconds={adminFlow.genEtaSeconds}
          genPartLabel={adminFlow.genPartLabel}
          onDismissError={adminFlow.clearGenError}
        />
      ) : null}
      <PracticeChrome
        examSlot={examSlot}
        onSelectExam={handleSelectExamSlot}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={scoring.partsInPaper}
        examLabelsBySlot={examLabelsBySlot}
        examPracticeOpen={scoring.examPracticeOpen}
        navigationOverride={skillNav.navigation}
        hidePartTabs={skillNav.hidePartTabs}
        suppressExamSlotPicker={skillNav.active}
        partTabsVariant={skillNav.active ? 'excel' : 'default'}
        practiceReady={layoutPracticeOpen}
        {...(skillNav.active ? {} : examSlotPickerProps)}
        title={chromeTitle}
        subtitle={chromeSubtitleResolved}
        hideMascot={compactChromeHeader}
        hideSubtitle={!chromeSubtitleResolved}
        compactSkillHeader={compactChromeHeader}
        showLevelPicker={isSkillPracticeSession}
        levelSlug="b2"
        skillRoute="exam-speaking"
        partMinForTabLabels={B2_SPEAKING_PART_MIN}
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        showStudyNotes={false}
        timerVariant={isSkillPracticeSession && !examModeActive ? 'session' : 'prominent'}
        modeBadge={modeBadge}
        showRefresh={!isExamSimulationMode(practiceMode)}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel={refreshLabel}
        loading={loading}
        onRefresh={() => loadParts()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={isExamSimulationMode(practiceMode) && !reviewMode}
        partFinishNotice={isExamSimulationMode(practiceMode) && !reviewMode ? null : scoring.partFinishNotice}
        partFinishNoticePlacement={showPracticeSideRail ? 'header' : 'main'}
        partsData={!loading && !error ? tabPartsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={(part) => {
          setSelectedPartId(part.id);
          if (skillNav.active && part.partNumber) {
            skillNav.selectPartNumber(part.partNumber);
          }
        }}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        lang={lang}
        reportErrorContext={reportErrorContext}
        examModeSaveControls={examModeSaveControls}
      >
      {examModeActive && examSection ? (
        <ExamModeSectionBanner
          sectionKey={examSection.key}
          sectionTitle={examSection.title || 'Speaking'}
          durationSeconds={examSection.durationSeconds}
          initialRemainingSeconds={examSection.remainingSeconds}
          active={!reviewMode}
          onTick={(sec) => setSectionRemaining(examSection.key, sec)}
          onFinish={handleExamModeFinish}
          lang={lang}
        />
      ) : null}
      <div
        className={`levels-listening-practice-layout${
          showPracticeSideRail ? ' levels-listening-practice-layout--with-strategy' : ''
        }${readingSession.focusMode ? ' levels-listening-practice-layout--focus' : ''}`}
      >
        <div
          className={`levels-listening-practice-main${isSkillPracticeSession ? ` ${readingSession.readingAreaClassName}` : ''}`}
          style={isSkillPracticeSession ? readingSession.readingAreaStyle : undefined}
        >
      <section style={{ margin: '0 auto', width: '100%' }}>
        {loading && <p style={{ textAlign: 'center' }}>{loadingLabel}</p>}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && selectedPart ? (
          <div className="levels-exam-practice-page levels-exam-practice-page--speaking">
            <div className="levels-exam-split-card">
              <SkillPartPracticeHeader
                title={selectedPartTitleParts.heading}
                subtitle={selectedPartTitleParts.subtitle}
                exerciseLabel={
                  isSkillPracticeSession && examSlot
                    ? formatSkillExerciseLabel(examSlot, lang === 'es' ? 'es' : 'en')
                    : null
                }
                titleActions={
                  isSkillPracticeSession ? (
                    <ReadingPracticeFeedbackToggle
                      variant="title-row"
                      lang={lang === 'es' ? 'es' : 'en'}
                    />
                  ) : null
                }
              />
              <div className="levels-exam-split__body levels-exam-split__body--stacked">
                {speakingInstructionsBlocks.length ? (
                  <SkillPartInstructionsPanel
                    label={lang === 'es' ? 'Instrucciones' : 'Instructions'}
                    blocks={speakingInstructionsBlocks}
                  />
                ) : null}
          <B2SpeakingPartSession
            key={`${selectedPart.id}-${examSlot}-${speakingDraftEpoch}`}
            part={selectedPart}
            examSlot={examSlot}
            initialSnapshot={
              speakingPartSnapshotsRef.current[`${examSlot}:${selectedPart.partNumber}`] ?? null
            }
            onSnapshotChange={(snapshot) =>
              handleSpeakingPartSnapshot(selectedPart.partNumber, snapshot)
            }
            onSavePartScore={handleSaveSpeakingPart}
            partScoring={b2PartCfg}
            lang={lang}
            examMode={examModeActive && !reviewMode}
            hideTaskIntro={speakingInstructionsBlocks.length > 0}
          />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <B2ExamPracticeModuleNav
        slug="b2"
        partNumber={partNumber}
        pagePartMax={B2_SPEAKING_PART_MAX}
        examSlot={examSlot}
        examenIdBySlot={isSkillPracticeSession ? scoring.examenIdBySlot : undefined}
        onSelectExamSlot={
          isSkillPracticeSession
            ? (slot) => {
                void scoring.refreshPuntuacionesProgress();
                handleSelectExamSlot(slot);
              }
            : undefined
        }
        overviewHref={examModeHubNav?.href}
        overviewLabel={examModeHubNav?.label}
        skillPracticeMode={isSkillPracticeSession}
        examMode={examModeActive && !reviewMode}
        skillPracticeTheme={skillNav.skillTheme}
        onContinueInPage={isSkillPracticeSession ? handleKeepPracticing : handleContinueInPage}
        onPreviousInPage={handlePreviousInPage}
        onContinueModule={
          examModeActive && !reviewMode ? handleContinueModuleInExamMode : undefined
        }
        partMinForTabLabels={B2_SPEAKING_PART_MIN}
        lang={lang}
      />
        </div>
        {showPracticeSideRail ? (
          <ExamPracticeSessionSideRail
            strategy={
              speakingStrategyPack ? <B2SpeakingStrategyPanel pack={speakingStrategyPack} /> : null
            }
            progress={
              <ExamPracticeProgressPanel
                slug="b2"
                examSlot={examSlot}
                partMin={B2_SPEAKING_PART_MIN}
                partMax={B2_SPEAKING_PART_MAX}
                progressSlot={scoring.progressBySlot[examSlot]}
                progressBySlot={scoring.progressBySlot}
                examLabelsBySlot={examLabelsBySlot}
                focusPartNumber={partNumber}
                passing={b2PartCfg?.passing}
                examLabel={examLabelsBySlot[examSlot]}
                lang={lang === 'es' ? 'es' : 'en'}
                enabled={scoring.examPracticeOpen}
              />
            }
            finishNotice={null}
            lang={lang === 'es' ? 'es' : 'en'}
          />
        ) : null}
      </div>
      </PracticeChrome>
    </B2ExamPracticeLayout>
  );
}

/** @param {{ part: { id: string, nombre: string, descripcion: string, partNumber: number }, examSlot: number, initialSnapshot?: object | null, onSnapshotChange?: (snapshot: object) => void, onSavePartScore?: (p: { correct: number, total: number, passed: boolean }) => void, partScoring?: { total: number, passing: number } | null, lang?: 'en'|'es', examMode?: boolean }} props */
function B2SpeakingPartSession({
  part,
  examSlot,
  initialSnapshot = null,
  onSnapshotChange,
  onSavePartScore,
  partScoring,
  lang = 'en',
  examMode = false,
  hideTaskIntro = false,
}) {
  const isEn = lang === 'en';
  const partConfig = getB2SpeakingPartConfig(part.partNumber);
  const cambridgeKey = String(part.partNumber - 13);
  const staticInfo = b2SpeakingPartInfo[cambridgeKey];
  const hasCompleteSnapshot =
    initialSnapshot?.sessionId &&
    initialSnapshot?.openingReady &&
    (initialSnapshot?.lastAssistant?.assistantText ||
      initialSnapshot?.lines?.some((line) => line.role === 'assistant'));
  const restoredSnapshot = hasCompleteSnapshot ? initialSnapshot : null;

  const [sessionId, setSessionId] = useState(() => restoredSnapshot?.sessionId ?? null);
  const [lines, setLines] = useState(() => restoredSnapshot?.lines ?? []);
  const [history, setHistory] = useState(() => restoredSnapshot?.history ?? []);
  const [loading, setLoading] = useState(() => !hasCompleteSnapshot);
  const [phase, setPhase] = useState(() => restoredSnapshot?.phase ?? 'intro');
  const [longTurnLeft, setLongTurnLeft] = useState(
    () => restoredSnapshot?.longTurnLeft ?? partConfig?.longTurnSeconds ?? 60,
  );
  const [typed, setTyped] = useState('');
  const [apiError, setApiError] = useState('');
  const [usageHint, setUsageHint] = useState('');
  const [usageLimit, setUsageLimit] = useState(3);
  const [usageRemaining, setUsageRemaining] = useState(null);
  const [usageUnlimited, setUsageUnlimited] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [exerciseStarted, setExerciseStarted] = useState(() => restoredSnapshot?.exerciseStarted ?? false);
  const [exercisePaused, setExercisePaused] = useState(() => restoredSnapshot?.exercisePaused ?? false);
  const [openingReady, setOpeningReady] = useState(() => restoredSnapshot?.openingReady ?? false);
  const [canRepeatExaminer, setCanRepeatExaminer] = useState(
    () => restoredSnapshot?.canRepeatExaminer ?? false,
  );
  const [partComplete, setPartComplete] = useState(() => restoredSnapshot?.partComplete ?? false);
  const partCompleteHandledRef = useRef(restoredSnapshot?.partCompleteHandled ?? false);
  const media = useMediaRecorder();
  /** false al desmontar o cambiar de parte: no actualizar estado ni reproducir audio. */
  const aliveRef = useRef(true);
  const abortRef = useRef(null);
  const lastAssistantRef = useRef(restoredSnapshot?.lastAssistant ?? null);
  const userIdRef = useRef(null);
  const liveSnapshotRef = useRef(null);

  liveSnapshotRef.current = {
    sessionId,
    lines,
    history,
    phase,
    longTurnLeft,
    exerciseStarted,
    exercisePaused,
    openingReady,
    canRepeatExaminer,
    partComplete,
    partCompleteHandled: partCompleteHandledRef.current,
    lastAssistant: lastAssistantRef.current,
  };

  const taskContext = part.descripcion || partConfig?.instructions || '';
  const taskContextRef = useRef(taskContext);
  taskContextRef.current = taskContext;
  const photoUrls = useMemo(
    () => resolveLongTurnPhotos(taskContext, examSlot),
    [taskContext, examSlot],
  );

  const isAlive = useCallback(() => aliveRef.current, []);

  const applySpeakingUsage = useCallback(
    (status) => {
      const resolved = resolveSpeakingUsageDisplay(status, { lang: isEn ? 'en' : 'es' });
      setUsageUnlimited(resolved.unlimited);
      if (resolved.unlimited) {
        setUsageHint('');
        setUsageRemaining(null);
        return;
      }
      setUsageLimit(resolved.limit);
      setUsageRemaining(resolved.remaining);
      setUsageHint(resolved.hint);
      if (userIdRef.current) {
        saveSpeakingUsageLocal(userIdRef.current, {
          used: resolved.used ?? 0,
          limit: resolved.limit ?? 3,
          atLimit: resolved.atLimit,
        });
      }
    },
    [isEn],
  );

  const refreshUsageHint = useCallback(async () => {
    const status = await fetchAiUsageStatus();
    const local = userIdRef.current ? loadSpeakingUsageLocal(userIdRef.current) : null;
    applySpeakingUsage(mergeSpeakingUsageStatus(status?.speaking, local));
  }, [applySpeakingUsage]);

  useEffect(() => {
    void getSessionUserId().then((id) => {
      userIdRef.current = id;
      if (!id) return;
      const local = loadSpeakingUsageLocal(id);
      if (local && (local.atLimit || (local.used ?? 0) >= (local.limit ?? 3))) {
        applySpeakingUsage(mergeSpeakingUsageStatus(null, local));
      }
      void refreshUsageHint();
    });
  }, [applySpeakingUsage, refreshUsageHint]);

  const storeAssistantTurn = useCallback((data) => {
    if (!data?.assistantText) return;
    lastAssistantRef.current = {
      assistantText: data.assistantText,
      assistantAudioBase64: data.assistantAudioBase64,
      assistantAudioMime: data.assistantAudioMime,
    };
    setCanRepeatExaminer(true);
  }, []);

  const applyOpeningTurn = useCallback(
    (data) => {
      if (!data?.assistantText || !isAlive()) return false;
      const assistantText = data.assistantText;
      storeAssistantTurn(data);
      setLines([{ role: 'assistant', content: assistantText }]);
      setHistory([{ role: 'assistant', content: assistantText }]);
      setPhase(partConfig?.uiMode === 'long_turn' ? 'await_long_turn' : 'dialogue');
      setOpeningReady(true);
      return true;
    },
    [isAlive, storeAssistantTurn, partConfig?.uiMode],
  );

  const fetchOpeningForSession = useCallback(
    async (sid, signal) => {
      const ctx = taskContextRef.current;
      const turnRes = await fetch(buildClientApiUrl('/api/speaking/turn'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          cefr: 'B2',
          mode: 'EXAM',
          prompt: ctx,
          history: [],
          text: '',
          examPartIndex: partConfig?.blueprintIndex ?? 0,
          b2PartNumber: part.partNumber,
          taskContext: ctx,
          isOpening: true,
        }),
        signal,
      });
      if (!turnRes.ok) {
        const err = await turnRes.json().catch(() => ({}));
        throw new Error(
          err.error ||
            (isEn ? 'Could not load the examiner question.' : 'Error al cargar la pregunta del examinador.'),
        );
      }
      return turnRes.json();
    },
    [part.partNumber, partConfig?.blueprintIndex, isEn],
  );

  const resolveAssistantPlayback = useCallback(() => {
    const fromRef = lastAssistantRef.current;
    if (fromRef?.assistantText) return fromRef;
    const assistantLine = lines.find((l) => l.role === 'assistant');
    if (assistantLine?.content) {
      return { assistantText: assistantLine.content };
    }
    return null;
  }, [lines]);

  const playLastAssistant = useCallback(async () => {
    const data = resolveAssistantPlayback();
    if (!data?.assistantText || !isAlive()) return false;
    setExercisePaused(false);
    setApiError('');
    const played = await playExaminerAudio({ text: data.assistantText });
    if (!played && isAlive()) {
      setApiError(
        isEn
          ? 'Audio is still loading or was blocked. Wait a few seconds and press Play again.'
          : 'El audio sigue cargando o fue bloqueado. Espera unos segundos y pulsa Play otra vez.',
      );
    }
    return Boolean(played);
  }, [isAlive, resolveAssistantPlayback, isEn]);

  const applyAssistantTurn = useCallback(
    async (data) => {
      if (!isAlive()) return;
      const assistantText = data.assistantText || '';
      storeAssistantTurn(data);
      setLines((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      setHistory((h) => [...h, { role: 'assistant', content: assistantText }]);
      if (!isAlive()) return;
      await playExaminerAudio({ text: assistantText });
    },
    [isAlive, storeAssistantTurn],
  );

  const callTurn = useCallback(
    async (payload, sid = sessionId, historySnapshot = history) => {
      if (!sid || !isAlive()) return null;
      const signal = abortRef.current?.signal;
      const ctx = taskContextRef.current;
      if (isAlive()) {
        setLoading(true);
        setApiError('');
      }
      try {
        let res;
        if (payload.audio) {
          const form = new FormData();
          form.set('sessionId', sid);
          form.set('cefr', 'B2');
          form.set('mode', 'EXAM');
          form.set('prompt', ctx);
          form.set('history', JSON.stringify(historySnapshot));
          form.set('examPartIndex', String(partConfig?.blueprintIndex ?? 0));
          form.set('b2PartNumber', String(part.partNumber));
          form.set('taskContext', ctx);
          if (payload.isOpening) form.set('isOpening', 'true');
          form.append('audio', payload.audio, 'capture.webm');
          res = await fetch(buildClientApiUrl('/api/speaking/turn'), {
            method: 'POST',
            body: form,
            signal,
          });
        } else {
          res = await fetch(buildClientApiUrl('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              cefr: 'B2',
              mode: 'EXAM',
              prompt: ctx,
              history: historySnapshot,
              text: payload.text ?? '',
              examPartIndex: partConfig?.blueprintIndex ?? 0,
              b2PartNumber: part.partNumber,
              taskContext: ctx,
              isOpening: Boolean(payload.isOpening),
            }),
            signal,
          });
        }
        if (!isAlive()) return null;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || (isEn ? 'Speaking turn failed.' : 'Error en el turno de speaking.'),
          );
        }
        return await res.json();
      } catch (e) {
        if (e?.name === 'AbortError') return null;
        if (isAlive()) {
          setApiError(e?.message || (isEn ? 'Connection error.' : 'Error de conexión.'));
        }
        return null;
      } finally {
        if (isAlive()) setLoading(false);
      }
    },
    [sessionId, history, part.partNumber, partConfig?.blueprintIndex, isAlive, isEn],
  );

  useEffect(() => {
    aliveRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    // No stopExaminerAudio aquí: cancelaría el audio al re-ejecutar el effect (p. ej. al pulsar Play).

    const persistSnapshot = () => {
      const snap = liveSnapshotRef.current;
      if (typeof onSnapshotChange !== 'function' || !snap?.sessionId) return;
      // Ignore partial inits (React Strict Mode) — they block reopening with Play disabled.
      if (!snap.openingReady && !snap.exerciseStarted) return;
      onSnapshotChange(snap);
    };

    if (restoredSnapshot?.sessionId && restoredSnapshot?.openingReady) {
      return () => {
        aliveRef.current = false;
        ac.abort();
        if (media.isActive) void media.stop();
        persistSnapshot();
      };
    }

    setSessionId(null);
    setLines([]);
    setHistory([]);
    setPhase('intro');
    setLongTurnLeft(partConfig?.longTurnSeconds ?? 60);
    setApiError('');
    setFeedbackReport(null);
    setFeedbackError('');
    setFeedbackLoading(false);
    setExerciseStarted(false);
    setExercisePaused(false);
    setOpeningReady(false);
    setCanRepeatExaminer(false);
    lastAssistantRef.current = null;
    setPartComplete(false);
    partCompleteHandledRef.current = false;
    setLoading(true);

    const run = async () => {
      try {
        const sessionRes = await fetch(buildClientApiUrl('/api/speaking/session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'EXAM', cefr: 'B2' }),
          signal: ac.signal,
        });
        if (!sessionRes.ok) {
          throw new Error(
            isEn ? 'Could not start the speaking session.' : 'No se pudo iniciar la sesión de speaking.',
          );
        }
        const { sessionId: newSid } = await sessionRes.json();
        if (!aliveRef.current) return;
        setSessionId(newSid);

        const data = await fetchOpeningForSession(newSid, ac.signal);
        if (!aliveRef.current || !data) return;

        applyOpeningTurn(data);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        if (aliveRef.current) setApiError(e?.message || 'Error');
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    };

    void run();

    return () => {
      aliveRef.current = false;
      ac.abort();
      if (media.isActive) void media.stop();
      persistSnapshot();
    };
  }, [
    part.id,
    examSlot,
    part.partNumber,
    partConfig?.blueprintIndex,
    partConfig?.longTurnSeconds,
    partConfig?.uiMode,
    applyOpeningTurn,
    fetchOpeningForSession,
    isEn,
    onSnapshotChange,
    restoredSnapshot?.sessionId,
  ]);

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft <= 0) return;
    const t = window.setTimeout(() => setLongTurnLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, longTurnLeft]);

  const speakingTotal = partScoring?.total ?? 5;
  const speakingPassing = partScoring?.passing ?? 3;
  const limitReached = !usageUnlimited && usageRemaining === 0;
  const localPartNumber = getSkillLocalPartNumber(part.partNumber, B2_SPEAKING_PART_MIN);
  const nextLocalPartNumber =
    localPartNumber != null && localPartNumber < B2_SPEAKING_PART_MAX - B2_SPEAKING_PART_MIN + 1
      ? localPartNumber + 1
      : null;
  const userLines = lines.filter((l) => l.role === 'user');

  const finishExamModePart = useCallback(
    (userCount) => {
      if (!examMode || partCompleteHandledRef.current) return;
      partCompleteHandledRef.current = true;
      const correct = Math.min(speakingTotal, userCount);
      onSavePartScore?.({
        correct,
        total: speakingTotal,
        passed: correct >= speakingPassing,
      });
      setPartComplete(true);
      stopExaminerAudio();
      if (media.isActive) void media.stop();

      if (nextLocalPartNumber != null) {
        const voiceText = isEn
          ? `Now let's move on to Part ${nextLocalPartNumber}.`
          : nextLocalPartNumber === 2
            ? 'Ahora pasemos a la segunda parte.'
            : `Ahora pasemos a la parte ${nextLocalPartNumber}.`;
        void playExaminerAudio({
          text: voiceText,
          speechLang: isEn ? 'en-GB' : 'es-ES',
        });
      }
    },
    [examMode, speakingTotal, speakingPassing, onSavePartScore, media, nextLocalPartNumber, isEn],
  );

  const partCompleteMessage = useMemo(() => {
    if (!partComplete || !examMode) return '';
    if (nextLocalPartNumber != null) {
      return isEn
        ? `Part ${localPartNumber} complete. Use “Continue — Part ${nextLocalPartNumber}” when you are ready.`
        : `Parte ${localPartNumber} completada. Pulsa «Continue — Part ${nextLocalPartNumber}» cuando quieras.`;
    }
    return isEn ? 'Part complete.' : 'Parte completada.';
  }, [partComplete, examMode, isEn, localPartNumber, nextLocalPartNumber]);

  const submitCandidateTurn = useCallback(
    async (audioOrText) => {
      if (!isAlive() || partCompleteHandledRef.current) return;
      if (examMode && history.filter((l) => l.role === 'user').length >= speakingTotal) return;

      let data;
      let nextHistory = history;

      if (audioOrText instanceof Blob) {
        data = await callTurn({ audio: audioOrText });
        if (!isAlive() || !data) return;
        if (data.transcript) {
          nextHistory = [...history, { role: 'user', content: data.transcript }];
          setLines((prev) => [...prev, { role: 'user', content: data.transcript }]);
          setHistory(nextHistory);
        }
      } else {
        const text = String(audioOrText || '').trim();
        if (!text) return;
        nextHistory = [...history, { role: 'user', content: text }];
        setLines((prev) => [...prev, { role: 'user', content: text }]);
        setHistory(nextHistory);
        data = await callTurn({ text }, sessionId, nextHistory);
        if (!isAlive() || !data) return;
      }

      const userCount = nextHistory.filter((l) => l.role === 'user').length;
      if (examMode && userCount >= speakingTotal) {
        finishExamModePart(userCount);
        return;
      }

      if (data.assistantText) await applyAssistantTurn(data);
    },
    [applyAssistantTurn, callTurn, isAlive, history, sessionId, examMode, speakingTotal, finishExamModePart],
  );

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft !== 0 || !media.isActive) return;
    void (async () => {
      if (!aliveRef.current) return;
      const blob = await media.stop();
      if (!aliveRef.current || !blob?.size) return;
      await submitCandidateTurn(blob);
      if (aliveRef.current) setPhase('dialogue');
    })();
  }, [phase, longTurnLeft, media.isActive, submitCandidateTurn]);

  const onMicClick = async () => {
    if (loading || !sessionId || partComplete) return;
    if (partConfig?.uiMode === 'long_turn' && phase === 'await_long_turn') return;
    if (media.isActive) {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
    } else {
      await media.start();
    }
  };

  const onPauseClick = () => {
    if (media.isPaused) media.resume();
    else media.pause();
  };

  const onRepeatClick = async () => {
    if (loading || !sessionId) return;
    await media.discard();
    await media.start();
  };

  const startLongTurn = () => {
    setPhase('long_turn');
    setLongTurnLeft(partConfig?.longTurnSeconds ?? 60);
    void media.start();
  };

  const finishLongTurn = async () => {
    if (media.isRecording) {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
    }
    setPhase('dialogue');
  };

  const handleExercisePlay = () => {
    if (loading || partComplete) return;
    if (exercisePaused) {
      if (media.isPaused) media.resume();
      if (isExaminerAudioPaused()) resumeExaminerAudio();
      setExercisePaused(false);
      return;
    }
    if (!exerciseStarted) setExerciseStarted(true);
    if (openingReady) {
      void playLastAssistant();
      return;
    }

    void (async () => {
      if (!isAlive()) return;
      setLoading(true);
      setApiError('');
      try {
        let sid = sessionId;
        if (!sid) {
          const sessionRes = await fetch(buildClientApiUrl('/api/speaking/session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'EXAM', cefr: 'B2' }),
          });
          if (!sessionRes.ok) {
            throw new Error(
              isEn ? 'Could not start the speaking session.' : 'No se pudo iniciar la sesión de speaking.',
            );
          }
          const sessionData = await sessionRes.json();
          sid = sessionData.sessionId;
          if (!sid || !isAlive()) return;
          setSessionId(sid);
        }

        const data = await fetchOpeningForSession(sid);
        if (!isAlive()) return;
        if (!applyOpeningTurn(data)) {
          setApiError(
            isEn ? 'Could not load examiner audio.' : 'No se pudo cargar el audio del examinador.',
          );
          return;
        }
        await playLastAssistant();
      } catch (e) {
        if (isAlive()) {
          setApiError(e?.message || (isEn ? 'Connection error.' : 'Error de conexión.'));
        }
      } finally {
        if (isAlive()) setLoading(false);
      }
    })();
  };

  const handleExercisePause = () => {
    if (!exerciseStarted || loading) return;
    let pausedSomething = false;
    if (media.isActive && !media.isPaused) {
      media.pause();
      pausedSomething = true;
    }
    if (pauseExaminerAudio()) pausedSomething = true;
    if (pausedSomething) setExercisePaused(true);
  };

  const handleExerciseRepeat = async () => {
    if (loading || !canRepeatExaminer) return;
    stopExaminerAudio();
    if (media.isActive) await media.discard();
    setExercisePaused(false);
    if (!exerciseStarted) setExerciseStarted(true);
    void playLastAssistant();
  };

  const handleNextStep = async () => {
    if (loading || !sessionId || !openingReady || !exerciseStarted || partComplete) return;
    if (examMode && history.filter((l) => l.role === 'user').length >= speakingTotal) return;
    stopExaminerAudio();
    if (media.isActive) await media.discard();
    setExercisePaused(false);

    if (partConfig?.uiMode === 'long_turn' && phase === 'await_long_turn') {
      startLongTurn();
      return;
    }

    if (partConfig?.uiMode === 'long_turn' && phase === 'long_turn') {
      await finishLongTurn();
      return;
    }

    const skipText = isEn
      ? "Let's move on to the next question, please."
      : 'Pasemos a la siguiente pregunta, por favor.';
    const nextHistory = [...history, { role: 'user', content: skipText }];
    setLines((prev) => [...prev, { role: 'user', content: skipText }]);
    setHistory(nextHistory);
    const data = await callTurn({ text: skipText }, sessionId, nextHistory);
    if (!isAlive()) return;

    const userCount = nextHistory.filter((l) => l.role === 'user').length;
    if (examMode && userCount >= speakingTotal) {
      finishExamModePart(userCount);
      return;
    }

    if (!data?.assistantText) return;
    await applyAssistantTurn(data);
  };

  const getFeedbackWithDralo = async () => {
    if (!sessionId || userLines.length === 0 || limitReached) return;
    setFeedbackError('');
    setFeedbackLoading(true);
    try {
      const res = await fetch(withBasePath('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          cefr: 'B2',
          mode: 'EXAM',
          combinedTranscript: userLines.map((l) => l.content).join('\n\n'),
          taskPrompt: taskContext,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error === true) {
        const limitHit =
          res.status === 429 ||
          data.code === 'DAILY_LIMIT_REACHED' ||
          data.code === 'LIMIT_CHECK_FAILED';
        if (limitHit) {
          if (data.usage) {
            applySpeakingUsage(data.usage);
          } else {
            const resolvedLimit = data.limit ?? usageLimit ?? 3;
            const resolvedUsed = data.used ?? resolvedLimit;
            applySpeakingUsage({
              unlimited: false,
              limit: resolvedLimit,
              used: resolvedUsed,
              remaining: 0,
              atLimit: true,
            });
          }
        }
        throw new Error(
          limitHit
            ? isEn
              ? LIMIT_REACHED.speaking.en
              : LIMIT_REACHED.speaking.es
            : data.message ||
                (typeof data.error === 'string' ? data.error : null) ||
                (isEn ? 'Could not generate feedback.' : 'No se pudo generar el feedback.'),
        );
      }
      if (!data.report) {
        throw new Error(isEn ? 'Could not generate feedback.' : 'No se pudo generar el feedback.');
      }
      setFeedbackReport(data.report);
      if (data.usage) {
        applySpeakingUsage(data.usage);
      } else {
        await refreshUsageHint();
      }
    } catch (e) {
      setFeedbackError(e?.message || (isEn ? 'Feedback failed.' : 'Error al obtener feedback.'));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const saveSpeakingScore = () => {
    if (!onSavePartScore || userLines.length === 0) return;
    const correct = Math.min(speakingTotal, userLines.length);
    onSavePartScore({
      correct,
      total: speakingTotal,
      passed: correct >= speakingPassing,
    });
  };

  return (
    <div className="levels-b2-speaking-session">
      {!hideTaskIntro ? (
        <p className="levels-b2-speaking-session__intro">
          {part.descripcion || partConfig?.instructions}
        </p>
      ) : null}
      {staticInfo?.tips ? (
        <p className="levels-b2-speaking-session__tip">
          <strong>Tip:</strong> {staticInfo.tips}
        </p>
      ) : null}

      {onSavePartScore && !usageUnlimited && !examMode ? (
        <p className="levels-b2-writing-panel__alpha-limit levels-b2-speaking-panel__usage">
          {usageHint || speakingLimitLabel(3, { lang: isEn ? 'en' : 'es' })}
        </p>
      ) : null}

      {partConfig?.uiMode === 'long_turn' ? (
        <div className="levels-b2-speaking-session__photos">
          {[0, 1].map((i) => (
            <div key={i} className="levels-b2-speaking-session__photo">
              {photoUrls[i] ? (
                <img
                  src={photoUrls[i]}
                  alt={i === 0 ? 'Photograph A' : 'Photograph B'}
                  className="levels-b2-speaking-session__photo-img"
                />
              ) : (
                <span className="levels-b2-speaking-session__photo-placeholder">
                  Photo {i === 0 ? 'A' : 'B'}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {partConfig?.uiMode === 'collaborative' ? (
        <div className="levels-b2-speaking-session__collab">
          {isEn
            ? 'Work with the examiner as your partner: exchange ideas and try to reach a decision.'
            : 'Trabaja con el examinador como si fuera tu compañero: intercambia ideas e intentad llegar a una decisión.'}
        </div>
      ) : null}

      <div className="levels-b2-speaking-session__workspace">
        <div className="levels-b2-speaking-session__stage">
      <SpeakingExerciseControls
        lang={lang}
        examMode={examMode}
        sessionReady={Boolean(sessionId && openingReady && !partComplete)}
        exerciseStarted={exerciseStarted}
        exercisePaused={exercisePaused}
        loading={loading}
        canRepeat={canRepeatExaminer}
        playDisabled={partComplete}
        onPlay={() => void handleExercisePlay()}
        onPause={handleExercisePause}
        onRepeat={() => void handleExerciseRepeat()}
        onNextStep={() => void handleNextStep()}
      />

      {partComplete && examMode && partCompleteMessage ? (
        <p className="levels-b2-speaking-session__part-complete" role="status">
          {partCompleteMessage}
        </p>
      ) : null}

      <ExaminerVoiceVisualizer
        isLoading={loading && !openingReady}
        waitingToStart={!exerciseStarted && !loading}
      />

      {phase === 'long_turn' ? (
        <p className="levels-b2-speaking-session__countdown">
          {isEn ? 'Time:' : 'Tiempo:'}{' '}
          {String(Math.floor(longTurnLeft / 60)).padStart(2, '0')}:
          {String(longTurnLeft % 60).padStart(2, '0')}
        </p>
      ) : null}

      <div className="levels-b2-speaking-session__mic-row">
        {partConfig?.uiMode === 'long_turn' && phase === 'await_long_turn' ? (
          <button
            type="button"
            className="levels-b2-speaking-session__phase-btn levels-b2-speaking-session__phase-btn--primary"
            onClick={startLongTurn}
            disabled={loading || !exerciseStarted}
          >
            Start my turn (1 min)
          </button>
        ) : null}
        {partConfig?.uiMode === 'long_turn' && phase === 'long_turn' ? (
          <button
            type="button"
            className="levels-b2-speaking-session__phase-btn"
            onClick={() => finishLongTurn()}
          >
            I&apos;m finished
          </button>
        ) : null}
        {(partConfig?.uiMode !== 'long_turn' || phase === 'dialogue') && (
          <>
            <button
              type="button"
              className={`levels-b2-speaking-session__mic-btn${
                media.isActive ? ' levels-b2-speaking-session__mic-btn--recording' : ''
              }`}
              onClick={onMicClick}
              disabled={loading || !sessionId || !exerciseStarted || partComplete}
            >
              {media.isActive
                ? isEn
                  ? '■ Stop and send'
                  : '■ Parar y enviar'
                : isEn
                  ? '🎤 Speak'
                  : '🎤 Hablar'}
            </button>
            {media.isActive ? (
              <>
                <button
                  type="button"
                  className="levels-b2-speaking-session__secondary-btn"
                  onClick={onPauseClick}
                  disabled={loading}
                >
                  {media.isPaused
                    ? isEn
                      ? '▶ Resume'
                      : '▶ Reanudar'
                    : isEn
                      ? '⏸ Pause'
                      : '⏸ Pausar'}
                </button>
                <button
                  type="button"
                  className="levels-b2-speaking-session__secondary-btn"
                  onClick={() => void onRepeatClick()}
                  disabled={loading}
                >
                  {isEn ? '↻ Repeat' : '↻ Repetir'}
                </button>
              </>
            ) : null}
          </>
        )}
        <span className="levels-b2-speaking-session__mic-hint">
          {loading
            ? isEn
              ? 'Processing…'
              : 'Procesando…'
            : media.isPaused
              ? isEn
                ? 'Paused — resume or repeat'
                : 'En pausa — reanuda o repite'
              : media.isRecording
                ? isEn
                  ? 'Recording…'
                  : 'Grabando…'
                : isEn
                  ? exerciseStarted
                    ? 'Press to respond'
                    : 'Press Play to start'
                  : exerciseStarted
                    ? 'Pulsa para responder'
                    : 'Pulsa Play para empezar'}
        </span>
      </div>

      {(partConfig?.uiMode !== 'long_turn' || phase === 'dialogue') && (
        <div className="levels-b2-speaking-session__text-row">
          <input
            type="text"
            className="levels-b2-speaking-session__text-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Or type your answer"
            disabled={!exerciseStarted || partComplete}
          />
          <button
            type="button"
            className="levels-b2-speaking-session__text-send"
            disabled={loading || !typed.trim() || !exerciseStarted || partComplete}
            onClick={async () => {
              const t = typed.trim();
              setTyped('');
              await submitCandidateTurn(t);
            }}
          >
            Send text
          </button>
        </div>
      )}

      {media.error ? (
        <p className="levels-b2-speaking-session__warn">{media.error}</p>
      ) : null}
      {apiError ? (
        <p className="levels-b2-speaking-session__error">{apiError}</p>
      ) : null}
        </div>

        <aside className="levels-b2-speaking-session__answers-panel" aria-label={isEn ? 'Your answers' : 'Tus respuestas'}>
          <div className="levels-b2-speaking-session__responses levels-b2-speaking-session__responses--panel">
            <p className="levels-b2-speaking-session__responses-title">
              {isEn ? 'Your answers' : 'Tus respuestas'}
              {examMode ? (
                <span className="levels-b2-speaking-session__responses-count">
                  {' '}
                  ({Math.min(speakingTotal, userLines.length)}/{speakingTotal})
                </span>
              ) : null}
            </p>
            {userLines.length > 0 ? (
              userLines.map((l, i) => (
                <p key={`${i}-user`} className="levels-b2-speaking-session__response-line">
                  {l.content}
                </p>
              ))
            ) : (
              <p className="levels-b2-speaking-session__responses-empty">
                {isEn
                  ? 'Your answers will appear here as you respond.'
                  : 'Tus respuestas aparecerán aquí conforme respondas.'}
              </p>
            )}
          </div>

          {onSavePartScore && userLines.length > 0 && !examMode ? (
            <>
              <div className="levels-b2-writing-panel__actions levels-b2-speaking-panel__actions">
                <button
                  type="button"
                  className="levels-b2-writing-panel__submit"
                  onClick={() => void getFeedbackWithDralo()}
                  disabled={feedbackLoading || limitReached || !sessionId}
                >
                  {feedbackLoading
                    ? isEn
                      ? 'Getting feedback…'
                      : 'Generando feedback…'
                    : limitReached
                      ? isEn
                        ? 'Daily limit reached'
                        : 'Límite diario alcanzado'
                      : isEn
                        ? 'Get feedback with Dralo'
                        : 'Feedback con Dralo'}
                </button>
              </div>

              {feedbackError ? (
                <p className="levels-b2-writing-panel__error" role="alert">
                  {feedbackError}
                </p>
              ) : null}

              {feedbackReport ? (
                <div className="levels-b2-speaking-session__feedback">
                  <FeedbackCards report={feedbackReport} />
                </div>
              ) : null}

              <div className="levels-b2-speaking-session__score-block">
                <button
                  type="button"
                  className="levels-b2-speaking-session__score-btn"
                  onClick={saveSpeakingScore}
                >
                  Save score for this part ({Math.min(speakingTotal, userLines.length)}/{speakingTotal})
                </button>
                <p className="levels-b2-speaking-session__score-hint">
                  You need at least {speakingPassing} completed interactions to pass (max. {speakingTotal}).
                </p>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default function B2SpeakingExamPractice(props) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Loading speaking practice…
        </main>
      }
    >
      <ReadingPracticeSessionProvider>
        <B2SpeakingExamPracticeInner {...props} />
      </ReadingPracticeSessionProvider>
    </Suspense>
  );
}
