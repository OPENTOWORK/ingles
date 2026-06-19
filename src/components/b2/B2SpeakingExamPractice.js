'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import { supabase } from '@/utils/supabaseClient';
import { formatLevelsPartDisplayName, getSkillPartTabLabel } from '@/utils/formatLevelsPartDisplayName';
import { withBasePath } from '@/lib/base-path';
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
import ExamPracticeSideRailTop from '@/components/exam/ExamPracticeSideRailTop';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import B2SpeakingStrategyPanel from '@/components/b2/B2SpeakingStrategyPanel';
import { getB2SpeakingStrategyPack } from '@/data/b2SpeakingPracticeStrategies';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import { ReadingPracticeSessionProvider, useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
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
  const scoring = useB2ExamScoringSession({
    partMin: B2_SPEAKING_PART_MIN,
    partMax: B2_SPEAKING_PART_MAX,
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
    handleFinishSection,
    setSectionRemaining,
  } = examMode;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});
  const examModePartScoresRef = useRef({});
  const categoryTimer = useLevelsCategoryTimer();

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

  const handleSaveSpeakingPart = useCallback(
    ({ correct, total, passed }) => {
      if (!selectedPart?.id || !scoring.examPracticeOpen) return;
      if (examModeActive && !reviewMode) {
        examModePartScoresRef.current[selectedPart.partNumber] = {
          correct,
          total,
          preguntaId: selectedPart.id,
        };
        return;
      }
      void scoring.saveWritingOrSpeakingScore({
        examSlot,
        partNumber: selectedPart.partNumber,
        preguntaId: selectedPart.id,
        parteId: selectedPart.id,
        correct,
        total,
        passed,
      });
    },
    [scoring, examSlot, selectedPart, examModeActive, reviewMode],
  );

  const handleExamModeFinish = useCallback(
    (redirectTo) => {
      const { scores, partSnapshots } = buildExamModeSkillPartSnapshots({
        partMin: B2_SPEAKING_PART_MIN,
        partMax: B2_SPEAKING_PART_MAX,
        partsData: tabPartsData,
        examModePartScores: examModePartScoresRef.current,
      });
      handleFinishSection({ speakingCompleted: true, partNumber }, scores, { redirectTo });
      void finishExamModeSupabasePersistence({
        partSnapshots,
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
    setSelectedPartId(sorted[currentIdx + 1].id);
    if (typeof window !== 'undefined') {
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
        partMinForTabLabels={isSkillPracticeSession ? B2_SPEAKING_PART_MIN : null}
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        timerVariant={isSkillPracticeSession && !examModeActive ? 'discrete' : 'prominent'}
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
        studyNotesPlacement={showPracticeSideRail ? 'sidebar-top' : 'header'}
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
        studyNotesContext={{
          slug: 'b2',
          skillRoute: 'exam-speaking',
          examMode: examModeActive,
          partNumber,
          examSlot,
        }}
        studyNotesContextLabel={title}
        reportErrorContext={reportErrorContext}
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
          <div className="levels-exam-practice-page levels-exam-practice-page--narrow">
            <div className="levels-exam-split-card">
              <h2>
                {getB2SpeakingPartConfig(selectedPart.partNumber)?.title
                  || getSkillPartTabLabel(selectedPart, B2_SPEAKING_PART_MIN, lang)
                  || selectedPart.nombre}
              </h2>
              <div className="levels-exam-split__body levels-exam-split__body--stacked">
          <B2SpeakingPartSession
            key={`${selectedPart.id}-${examSlot}`}
            part={selectedPart}
            examSlot={examSlot}
            onSavePartScore={handleSaveSpeakingPart}
            partScoring={b2PartCfg}
            lang={lang}
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
        lang={lang}
      />
        </div>
        {showPracticeSideRail ? (
          <ExamPracticeSessionSideRail
            topRail={
              <ExamPracticeSideRailTop
                studyNotes={
                  <ExamStudyNotesSidebar
                    context={{
                      slug: 'b2',
                      skillRoute: 'exam-speaking',
                      examMode: examModeActive,
                      partNumber,
                      examSlot,
                    }}
                    contextLabel={title}
                    lang={lang === 'es' ? 'es' : 'en'}
                  />
                }
              />
            }
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

/** @param {{ part: { id: string, nombre: string, descripcion: string, partNumber: number }, examSlot: number, onSavePartScore?: (p: { correct: number, total: number, passed: boolean }) => void, partScoring?: { total: number, passing: number } | null, lang?: 'en'|'es' }} props */
function B2SpeakingPartSession({ part, examSlot, onSavePartScore, partScoring, lang = 'en' }) {
  const isEn = lang === 'en';
  const partConfig = getB2SpeakingPartConfig(part.partNumber);
  const cambridgeKey = String(part.partNumber - 13);
  const staticInfo = b2SpeakingPartInfo[cambridgeKey];

  const [sessionId, setSessionId] = useState(null);
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('intro');
  const [longTurnLeft, setLongTurnLeft] = useState(partConfig?.longTurnSeconds ?? 60);
  const [typed, setTyped] = useState('');
  const [apiError, setApiError] = useState('');
  const [usageHint, setUsageHint] = useState('');
  const [usageLimit, setUsageLimit] = useState(3);
  const [usageRemaining, setUsageRemaining] = useState(null);
  const [usageUnlimited, setUsageUnlimited] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [exercisePaused, setExercisePaused] = useState(false);
  const [openingReady, setOpeningReady] = useState(false);
  const [canRepeatExaminer, setCanRepeatExaminer] = useState(false);
  const media = useMediaRecorder();
  /** false al desmontar o cambiar de parte: no actualizar estado ni reproducir audio. */
  const aliveRef = useRef(true);
  const abortRef = useRef(null);
  const lastAssistantRef = useRef(null);
  const userIdRef = useRef(null);

  const taskContext = part.descripcion || partConfig?.instructions || '';
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

  const playLastAssistant = useCallback(async () => {
    const data = lastAssistantRef.current;
    if (!data?.assistantText || !isAlive()) return;
    setExercisePaused(false);
    await playExaminerAudio({
      base64: data.assistantAudioBase64,
      mime: data.assistantAudioMime,
      text: data.assistantText,
    });
  }, [isAlive]);

  const applyAssistantTurn = useCallback(
    async (data) => {
      if (!isAlive()) return;
      const assistantText = data.assistantText || '';
      storeAssistantTurn(data);
      setLines((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      setHistory((h) => [...h, { role: 'assistant', content: assistantText }]);
      if (!isAlive()) return;
      await playExaminerAudio({
        base64: data.assistantAudioBase64,
        mime: data.assistantAudioMime,
        text: assistantText,
      });
    },
    [isAlive, storeAssistantTurn],
  );

  const callTurn = useCallback(
    async (payload, sid = sessionId, historySnapshot = history) => {
      if (!sid || !isAlive()) return null;
      const signal = abortRef.current?.signal;
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
          form.set('prompt', taskContext);
          form.set('history', JSON.stringify(historySnapshot));
          form.set('examPartIndex', String(partConfig?.blueprintIndex ?? 0));
          form.set('b2PartNumber', String(part.partNumber));
          form.set('taskContext', taskContext);
          if (payload.isOpening) form.set('isOpening', 'true');
          form.append('audio', payload.audio, 'capture.webm');
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            body: form,
            signal,
          });
        } else {
          res = await fetch(withBasePath('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              cefr: 'B2',
              mode: 'EXAM',
              prompt: taskContext,
              history: historySnapshot,
              text: payload.text ?? '',
              examPartIndex: partConfig?.blueprintIndex ?? 0,
              b2PartNumber: part.partNumber,
              taskContext,
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
    [sessionId, history, taskContext, part.partNumber, partConfig?.blueprintIndex, isAlive, isEn],
  );

  useEffect(() => {
    aliveRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    stopExaminerAudio();

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
    setLoading(true);

    const run = async () => {
      try {
        const sessionRes = await fetch(withBasePath('/api/speaking/session'), {
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

        const turnRes = await fetch(withBasePath('/api/speaking/turn'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: newSid,
            cefr: 'B2',
            mode: 'EXAM',
            prompt: taskContext,
            history: [],
            text: '',
            examPartIndex: partConfig?.blueprintIndex ?? 0,
            b2PartNumber: part.partNumber,
            taskContext,
            isOpening: true,
          }),
          signal: ac.signal,
        });
        if (!turnRes.ok) {
          const err = await turnRes.json().catch(() => ({}));
          throw new Error(
            err.error ||
              (isEn ? 'Could not load the examiner question.' : 'Error al cargar la pregunta del examinador.'),
          );
        }
        const data = await turnRes.json();
        if (!aliveRef.current || !data) return;

        if (data.assistantText) {
          const assistantText = data.assistantText;
          storeAssistantTurn(data);
          setLines([{ role: 'assistant', content: assistantText }]);
          setHistory([{ role: 'assistant', content: assistantText }]);
          if (!aliveRef.current) return;
          setPhase(partConfig?.uiMode === 'long_turn' ? 'await_long_turn' : 'dialogue');
          setOpeningReady(true);
        }
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
      stopExaminerAudio();
      if (media.isActive) void media.stop();
    };
  }, [
    part.id,
    examSlot,
    taskContext,
    part.partNumber,
    partConfig?.blueprintIndex,
    partConfig?.longTurnSeconds,
    partConfig?.uiMode,
    storeAssistantTurn,
    isEn,
  ]);

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft <= 0) return;
    const t = window.setTimeout(() => setLongTurnLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, longTurnLeft]);

  const submitCandidateTurn = useCallback(
    async (audioOrText) => {
      if (!isAlive()) return;
      let data;
      if (audioOrText instanceof Blob) {
        data = await callTurn({ audio: audioOrText });
      } else {
        const text = String(audioOrText || '').trim();
        if (!text) return;
        setLines((prev) => [...prev, { role: 'user', content: text }]);
        setHistory((h) => [...h, { role: 'user', content: text }]);
        data = await callTurn({ text });
      }
      if (!isAlive() || !data) return;
      if (data.transcript && audioOrText instanceof Blob) {
        setLines((prev) => [...prev, { role: 'user', content: data.transcript }]);
        setHistory((h) => [...h, { role: 'user', content: data.transcript }]);
      }
      if (data.assistantText) await applyAssistantTurn(data);
    },
    [applyAssistantTurn, callTurn, isAlive],
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
    if (loading || !sessionId) return;
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

  const handleExercisePlay = async () => {
    if (loading || !sessionId || !openingReady) return;
    if (exercisePaused) {
      if (media.isPaused) media.resume();
      if (isExaminerAudioPaused()) resumeExaminerAudio();
      setExercisePaused(false);
      return;
    }
    if (!exerciseStarted) setExerciseStarted(true);
    await playLastAssistant();
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
    await playLastAssistant();
  };

  const handleNextStep = async () => {
    if (loading || !sessionId || !openingReady || !exerciseStarted) return;
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
    if (!isAlive() || !data?.assistantText) return;
    await applyAssistantTurn(data);
  };

  const userLines = lines.filter((l) => l.role === 'user');
  const speakingTotal = partScoring?.total ?? 5;
  const speakingPassing = partScoring?.passing ?? 3;
  const limitReached = !usageUnlimited && usageRemaining === 0;

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
      <p className="levels-b2-speaking-session__intro">
        {part.descripcion || partConfig?.instructions}
      </p>
      {staticInfo?.tips ? (
        <p className="levels-b2-speaking-session__tip">
          <strong>Tip:</strong> {staticInfo.tips}
        </p>
      ) : null}

      {onSavePartScore && !usageUnlimited ? (
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

      <SpeakingExerciseControls
        lang={lang}
        sessionReady={Boolean(sessionId && openingReady)}
        exerciseStarted={exerciseStarted}
        exercisePaused={exercisePaused}
        loading={loading}
        canRepeat={canRepeatExaminer}
        onPlay={() => void handleExercisePlay()}
        onPause={handleExercisePause}
        onRepeat={() => void handleExerciseRepeat()}
        onNextStep={() => void handleNextStep()}
      />

      <ExaminerVoiceVisualizer
        isLoading={loading && !openingReady}
        waitingToStart={openingReady && !exerciseStarted}
      />

      {userLines.length > 0 ? (
        <div className="levels-b2-speaking-session__responses">
          <p className="levels-b2-speaking-session__responses-title">
            {isEn ? 'Your answers' : 'Tus respuestas'}
          </p>
          {userLines.map((l, i) => (
            <p key={`${i}-user`} className="levels-b2-speaking-session__response-line">
              {l.content}
            </p>
          ))}
        </div>
      ) : null}

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
              disabled={loading || !sessionId || !exerciseStarted}
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
            disabled={!exerciseStarted}
          />
          <button
            type="button"
            className="levels-b2-speaking-session__text-send"
            disabled={loading || !typed.trim() || !exerciseStarted}
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

      {onSavePartScore && userLines.length > 0 ? (
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
