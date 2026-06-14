'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import B2WritingFirstTaskCard from '@/components/b2/B2WritingFirstTaskCard';
import B2WritingPart2TaskPicker from '@/components/b2/B2WritingPart2TaskPicker';
import B2WritingStrategyPanel from '@/components/b2/B2WritingStrategyPanel';
import ExamPracticeProgressPanel from '@/components/exam/ExamPracticeProgressPanel';
import ExamPracticeSideRail from '@/components/exam/ExamPracticeSideRail';
import ExamPracticeToolsPanel from '@/components/exam/ExamPracticeToolsPanel';
import B2WritingDraftStatusPanel from '@/components/b2/B2WritingDraftStatusPanel';
import { getB2WritingStrategyPack } from '@/data/b2WritingPracticeStrategies';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { supabase } from '@/utils/supabaseClient';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug } from '@/utils/levelsLevelCache';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import {
  useLevelsExamAdminFlow,
  reloadExamNamesBySlot,
  createAdminExamSelectHandler,
  buildExamSlotPickerProps,
} from '@/hooks/useLevelsExamAdminFlow';
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
import {
  returnToSkillExercisePicker,
  runKeepPracticingSkillFlow,
} from '@/utils/skillPracticeNavigation';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import {
  resolveExamPracticeMode,
  isPartPracticeMode,
  isExamSimulationMode,
  getExamChromeTitle,
  getExamChromeSubtitle,
} from '@/lib/examPracticeMode';
import {
  parseB2WritingPart1Task,
  parseB2WritingPart2Task,
  buildB2WritingPart1ExamContext,
  buildB2WritingPart2ExamContext,
  getB2WritingPartTabLabel,
  B2_WRITING_WORD_MIN,
  B2_WRITING_WORD_MAX,
} from '@/data/b2WritingTasks';

const B2WritingLongFormAiPanel = dynamic(
  () => import('@/components/b2/B2WritingLongFormAiPanel'),
  { ssr: false, loading: () => <p className="loading">Loading feedback…</p> },
);

const PART_MIN = 8;
const PART_MAX = 9;

function getPartNumber(part) {
  return Number(part?.partNumber || String(part?.nombre || '').match(/\d+/)?.[0] || 0);
}

function B2WritingExamPracticePageInner() {
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoring = useB2ExamScoringSession({ partMin: PART_MIN, partMax: PART_MAX });
  const examMode = useExamModeStrict({
    slug: 'b2',
    partMin: PART_MIN,
    partMax: PART_MAX,
    sectionTitle: 'Writing',
  });
  const {
    examModeActive,
    reviewMode,
    section: examSection,
    handleFinishSection,
    setSectionRemaining,
  } = examMode;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedQuestionByPart, setSelectedQuestionByPart] = useState({});
  const [part2SelectedOptionByPart, setPart2SelectedOptionByPart] = useState({});
  const [writingLiveCorrect, setWritingLiveCorrect] = useState(null);
  const [draftStats, setDraftStats] = useState({ wordCount: 0, submitted: false, loading: false });
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});
  const mountedRef = useRef(true);
  const partsShellRef = useRef([]);
  const setExamenContextRef = useRef(scoring.setExamenContext);
  setExamenContextRef.current = scoring.setExamenContext;
  const categoryTimer = useLevelsCategoryTimer();

  useEffect(() => {
    void reloadExamNamesBySlot('b2').then(({ names }) => setExamLabelsBySlot(names));
  }, [scoring.examenIdBySlot]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';

    try {
      const { data: levelData, error: levelError } = await getCachedLevelBySlug(supabase, 'b2');
      if (levelError || !levelData) throw new Error('Could not load B2 level.');

      const partNames = ['Parte 8 B2', 'Parte 9 B2'];
      let baseParts = partsShellRef.current;

      if (!baseParts.length) {
        const { data: partsTableData, error: partsError } = await supabase
          .from('levels_partes')
          .select('*')
          .in('nombre_parte', partNames);

        if (partsError) throw new Error('Could not load writing parts.');

        const partsByName = (partsTableData || []).reduce((acc, part) => {
          acc[part.nombre_parte] = part;
          return acc;
        }, {});

        baseParts = partNames
          .map((name) => partsByName[name])
          .filter(Boolean)
          .map((part) => {
            const partNumber = Number(String(part.nombre_parte).match(/\d+/)?.[0] || 0);
            return {
              id: part.id,
              partNumber,
              nombre: formatLevelsPartDisplayName(part?.nombre_parte || 'Parte sin nombre'),
              descripcion: partDescription(part),
              questions: [],
            };
          });

        partsShellRef.current = baseParts.map(({ id, partNumber, nombre, descripcion }) => ({
          id,
          partNumber,
          nombre,
          descripcion,
        }));
      } else {
        baseParts = partsShellRef.current.map((part) => ({
          ...part,
          questions: [],
        }));
      }

      const partsById = baseParts.reduce((acc, part) => {
        acc[part.id] = part;
        return acc;
      }, {});

      try {
        const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
          slot: examSlot,
        });
        if (examResolveError || !examenId) {
          throw new Error(
            examResolveError?.message ||
              'B2 exam not found. If you are an admin, generate the exam from the selector.',
          );
        }

        if (mountedRef.current) setExamenContextRef.current(examenId);

        const { data: rawQuestions, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
          examenId,
          levelId: levelData.id,
        });
        if (questionsError) throw questionsError;

        (rawQuestions || []).forEach((question) => {
          const target = partsById[question.parte_id];
          if (!target) return;
          target.questions.push({
            preguntaId: question.id,
            enunciado: question.enunciado || '',
            respuestas: [],
            respuestasAbiertas: [],
          });
        });
      } catch (innerErr) {
        console.warn('Could not load writing questions:', innerErr?.message || innerErr);
      }

      const normalizedParts = baseParts.sort((a, b) => a.partNumber - b.partNumber);

      if (!normalizedParts.length) {
        throw new Error('No B2 Writing parts defined in Supabase (parts 8–9).');
      }

      if (!mountedRef.current) return;

      setPartsData(normalizedParts);
      setSelectedPartId((prev) => prev || normalizedParts[0]?.id || null);

      const initialQuestionSelection = normalizedParts.reduce((acc, part) => {
        const q = part.questions?.[0];
        if (q) acc[part.id] = q.preguntaId;
        return acc;
      }, {});
      setSelectedQuestionByPart((prev) => ({ ...initialQuestionSelection, ...prev }));
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Error loading data.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [examSlot]);

  const adminFlow = useLevelsExamAdminFlow({
    slug: 'b2',
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: () => {
      void scoring.reloadExamenCatalog?.();
      void loadData();
      void reloadExamNamesBySlot('b2').then(({ names }) => setExamLabelsBySlot(names));
    },
  });

  const handleSelectExamSlot = useMemo(
    () =>
      createAdminExamSelectHandler(adminFlow, (slot) => {
        scoring.handleSelectExam(selectExamSlot, slot);
        void loadData();
      }),
    [adminFlow, scoring, selectExamSlot, loadData],
  );

  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => {
      scoring.handleSelectExam(selectExamSlot, slot);
      void loadData();
    },
  });

  const skillNav = useSkillPartFirstNavigation({
    enabled: !examModeActive,
    slug: 'b2',
    skillRoute: 'exam-writing',
    partMin: PART_MIN,
    partMax: PART_MAX,
    examPracticeOpen: scoring.examPracticeOpen,
    examSlot,
    onSelectExam: handleSelectExamSlot,
    progressBySlot: scoring.progressBySlot,
    examLabelsBySlot,
    examSlotPickerProps,
    onRefreshProgress: scoring.refreshPuntuacionesProgress,
    lang: 'en',
  });

  useB2AutoOpenExamFromUrl({
    examPracticeOpen: scoring.examPracticeOpen,
    handleSelectExam: scoring.handleSelectExam,
    selectExamSlot,
    disabled: skillNav.active,
  });

  const layoutPracticeOpen = skillNav.active ? skillNav.practiceReady : scoring.examPracticeOpen;
  const isSkillPracticeSession = skillNav.active && layoutPracticeOpen;

  const handleKeepPracticing = useCallback(() => {
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      onSelectExamSlot: (slot) => {
        void scoring.refreshPuntuacionesProgress();
        handleSelectExamSlot(slot);
      },
      onReturnToExercisePicker: () =>
        returnToSkillExercisePicker({
          setExamPracticeOpen: scoring.setExamPracticeOpen,
          refreshProgress: scoring.refreshPuntuacionesProgress,
        }),
    });
  }, [examSlot, scoring, handleSelectExamSlot]);

  const handleBackToParts = useCallback(() => {
    scoring.setExamPracticeOpen(false);
    skillNav.backToParts();
    void scoring.refreshPuntuacionesProgress();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scoring, skillNav]);

  const displayPartsData = useMemo(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber) return partsData;
    return partsData.filter((p) => getPartNumber(p) === skillNav.selectedPartNumber);
  }, [partsData, skillNav.active, skillNav.selectedPartNumber]);

  useEffect(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber || !displayPartsData.length) return;
    const target = displayPartsData[0];
    if (target?.id && target.id !== selectedPartId) setSelectedPartId(target.id);
  }, [skillNav.active, skillNav.selectedPartNumber, displayPartsData, selectedPartId]);

  useEffect(() => {
    mountedRef.current = true;
    void loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const selectedPart =
    displayPartsData.find((p) => p.id === selectedPartId) || displayPartsData[0] || null;
  const partNumber = getPartNumber(selectedPart);

  const part8Part = displayPartsData.find((p) => getPartNumber(p) === 8) || null;
  const part9Part = displayPartsData.find((p) => getPartNumber(p) === 9) || null;

  const getQuestionForPart = useCallback(
    (part) => {
      if (!part?.questions?.length) return null;
      const qid = selectedQuestionByPart[part.id];
      return part.questions.find((q) => q.preguntaId === qid) || part.questions[0];
    },
    [selectedQuestionByPart],
  );

  const part8Question = getQuestionForPart(part8Part);
  const part9Question = getQuestionForPart(part9Part);
  const selectedQuestion = partNumber === 9 ? part9Question : part8Question;

  const part1Task = useMemo(
    () => parseB2WritingPart1Task(part8Question?.enunciado || ''),
    [part8Question?.enunciado],
  );

  const part2Task = useMemo(
    () => parseB2WritingPart2Task(part9Question?.enunciado || ''),
    [part9Question?.enunciado],
  );

  const part2SelectedId =
    partNumber === 9 && selectedPart?.id
      ? part2SelectedOptionByPart[selectedPart.id] ?? null
      : null;

  const part2SelectedOption = part2Task.options.find((o) => o.id === part2SelectedId) || null;

  useEffect(() => {
    if (partNumber !== 9 || !selectedPart?.id || typeof window === 'undefined') return;
    const key = `b2-writing-p2-choice-${selectedQuestion?.preguntaId || selectedPart.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const id = Number(raw);
        if (part2Task.options.some((o) => o.id === id)) {
          setPart2SelectedOptionByPart((prev) => ({ ...prev, [selectedPart.id]: id }));
        }
      }
    } catch {
      /* ignore */
    }
  }, [partNumber, selectedPart?.id, selectedQuestion?.preguntaId, part2Task.options]);

  const handlePart2Select = useCallback(
    (optionId) => {
      if (!selectedPart?.id) return;
      setPart2SelectedOptionByPart((prev) => ({ ...prev, [selectedPart.id]: optionId }));
      if (typeof window === 'undefined') return;
      const key = `b2-writing-p2-choice-${selectedQuestion?.preguntaId || selectedPart.id}`;
      try {
        if (optionId == null) localStorage.removeItem(key);
        else localStorage.setItem(key, String(optionId));
      } catch {
        /* ignore */
      }
    },
    [selectedPart?.id, selectedQuestion?.preguntaId],
  );

  const partScoringCfg = getB2PartScoring(partNumber);
  const savedPartScore = scoring.progressBySlot[examSlot]?.parts?.[partNumber];

  const scorePanelProps = {
    correctCount: writingLiveCorrect ?? savedPartScore?.correct ?? 0,
    totalSlots: partScoringCfg?.total ?? 20,
    passingCount: partScoringCfg?.passing ?? 12,
  };

  useEffect(() => {
    setWritingLiveCorrect(null);
  }, [selectedPart?.id, selectedQuestion?.preguntaId, part2SelectedId]);

  const handleDraftStats = useCallback((stats) => {
    setDraftStats((prev) => {
      if (
        prev.wordCount === stats.wordCount &&
        prev.submitted === stats.submitted &&
        prev.loading === stats.loading
      ) {
        return prev;
      }
      return stats;
    });
  }, []);

  const handleWritingScoresReady = useCallback(
    (scores) => {
      if (!scores || typeof scores.total !== 'number') return;
      setWritingLiveCorrect(scores.total);
      if (!scoring.examPracticeOpen || !selectedPart?.id) return;
      const preguntaId =
        selectedQuestion?.preguntaId || selectedPart.questions?.[0]?.preguntaId || selectedPart.id;
      void scoring.saveWritingOrSpeakingScore({
        examSlot,
        partNumber,
        preguntaId,
        parteId: selectedPart.id,
        correct: scores.total,
        total: partScoringCfg?.total ?? 20,
        passed: Boolean(scores.passed),
      });
    },
    [scoring, examSlot, partNumber, selectedPart, selectedQuestion?.preguntaId, partScoringCfg],
  );

  const handleSelectPart = (part) => {
    setSelectedPartId(part.id);
    if (part.questions?.length === 1) {
      setSelectedQuestionByPart((prev) => ({ ...prev, [part.id]: part.questions[0].preguntaId }));
    }
  };

  const handleContinueInPage = useCallback(() => {
    const part9 = displayPartsData.find((p) => getPartNumber(p) === 9);
    if (part9) setSelectedPartId(part9.id);
  }, [displayPartsData]);

  const longWritingStorageKey = selectedQuestion?.preguntaId
    ? `b2-exam-writing-${selectedQuestion.preguntaId}`
    : selectedPart?.id
      ? `b2-exam-writing-${selectedPart.id}`
      : 'b2-exam-writing';

  const examContextBuilder = useCallback(
    (essayText) => {
      if (partNumber === 8) {
        return buildB2WritingPart1ExamContext(part1Task, essayText);
      }
      if (partNumber === 9 && part2SelectedOption) {
        return buildB2WritingPart2ExamContext(part2SelectedOption, part2Task, essayText);
      }
      return '';
    },
    [partNumber, part1Task, part2Task, part2SelectedOption],
  );

  const getPartTabLabel = useCallback((part) => getB2WritingPartTabLabel(part), []);

  const continuePartLabel =
    partNumber === 8 ? 'Writing Part 2' : null;

  const practiceMode = resolveExamPracticeMode({ examModeActive, reviewMode });

  const chromeTitle = getExamChromeTitle({
    lang: 'en',
    examModeActive,
    reviewMode,
    sectionTitle: 'Writing',
    defaultTitle: 'B2 Writing Practice',
  });

  const chromeSubtitle =
    examModeActive || reviewMode
      ? getExamChromeSubtitle({
          lang: 'en',
          examModeActive,
          reviewMode,
          defaultSubtitle: 'B2 Writing — Parts 1 & 2',
        })
      : isSkillPracticeSession
        ? null
        : 'B2 Writing — Parts 1 & 2';

  const modeBadge = isExamSimulationMode(practiceMode)
    ? 'Exam Mode'
    : isSkillPracticeSession && isPartPracticeMode(practiceMode)
      ? 'Practice Mode'
      : null;

  const compactChromeHeader = isSkillPracticeSession || isExamSimulationMode(practiceMode);

  const writingExamMode = examModeActive && !reviewMode;

  const strategyPack = isPartPracticeMode(practiceMode)
    ? getB2WritingStrategyPack(partNumber, part2SelectedOption?.writingType)
    : null;

  // Part 1 always; Part 2 only once a task is chosen (the pack depends on the task type).
  const showStrategySidebar = Boolean(
    strategyPack && (partNumber === 8 || part2SelectedOption),
  );

  const showPracticeSideRail =
    isSkillPracticeSession && isPartPracticeMode(practiceMode) && scoring.examPracticeOpen;

  const writingScorePanelOverride = isPartPracticeMode(practiceMode) ? (
    <B2WritingDraftStatusPanel
      wordCount={draftStats.wordCount}
      submitted={draftStats.submitted}
      checking={draftStats.loading}
      lastScoreTotal={writingLiveCorrect}
      lang="en"
    />
  ) : null;

  const handleExamModeFinish = useCallback(() => {
    const total =
      (getB2PartScoring(8)?.total ?? 20) + (getB2PartScoring(9)?.total ?? 20);
    handleFinishSection(
      { writingCompleted: true, storageKey: longWritingStorageKey },
      { correct: writingLiveCorrect ?? 0, total, byPart: {} },
    );
  }, [handleFinishSection, longWritingStorageKey, writingLiveCorrect]);

  const reportErrorContext = useMemo(() => {
    if (loading || error || !scoring.examPracticeOpen || !selectedPart) return null;
    const questionText = selectedQuestion?.enunciado
      ? String(selectedQuestion.enunciado).replace(/\s+/g, ' ').trim().slice(0, 300)
      : selectedPart?.descripcion
        ? String(selectedPart.descripcion).replace(/\s+/g, ' ').trim().slice(0, 300)
        : '';
    return {
      levelSlug: 'b2',
      skillRoute: 'exam-writing',
      partNumber,
      examSlot,
      practiceMode,
      examModeActive,
      reviewMode,
      questionId: selectedQuestion?.preguntaId,
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
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
  ]);

  return (
    <B2ExamPracticeLayout examPracticeOpen={layoutPracticeOpen}>
      {adminFlow.showGenerationStatus ? (
        <A2ExamGenerationStatus
          status={adminFlow.generationStatus}
          error={adminFlow.genError}
          onDismissError={adminFlow.clearGenError}
        />
      ) : null}

      <B2ExamPracticeChrome
        examSlot={examSlot}
        onSelectExam={handleSelectExamSlot}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={scoring.partsInPaper}
        examLabelsBySlot={examLabelsBySlot}
        examPracticeOpen={scoring.examPracticeOpen}
        navigationOverride={skillNav.navigation}
        hidePartTabs={skillNav.hidePartTabs}
        practiceReady={layoutPracticeOpen}
        {...(skillNav.active ? {} : examSlotPickerProps)}
        title={chromeTitle}
        subtitle={chromeSubtitle}
        hideMascot={compactChromeHeader}
        hideSubtitle={!chromeSubtitle}
        compactSkillHeader={compactChromeHeader}
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        timerVariant={isSkillPracticeSession && !examModeActive ? 'discrete' : 'prominent'}
        modeBadge={modeBadge}
        showRefresh={!isExamSimulationMode(practiceMode)}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel="Refresh Writing"
        loading={loading}
        onRefresh={() => void loadData()}
        partScoreMetrics={scorePanelProps}
        scorePanelOverride={writingScorePanelOverride}
        hideScorePanel={isExamSimulationMode(practiceMode) && !reviewMode}
        partFinishNotice={isExamSimulationMode(practiceMode) && !reviewMode ? null : scoring.partFinishNotice}
        partsData={!loading && !error ? displayPartsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        getPartTabLabel={getPartTabLabel}
        lang="en"
        workPanelClassName="levels-b2-practice__work-panel--b2-writing"
        studyNotesContext={{
          slug: 'b2',
          skillRoute: 'exam-writing',
          examMode: examModeActive,
          partNumber,
          examSlot,
        }}
        studyNotesContextLabel="B2 Writing Practice"
        reportErrorContext={reportErrorContext}
      >
        {examModeActive && examSection ? (
          <ExamModeSectionBanner
            sectionTitle={examSection.title || 'Writing'}
            durationSeconds={examSection.durationSeconds}
            initialRemainingSeconds={examSection.remainingSeconds}
            active={!reviewMode}
            onTick={(sec) => setSectionRemaining(examSection.key, sec)}
            onFinish={handleExamModeFinish}
            lang="en"
          />
        ) : null}
        <section className="b2-writing-practice">
          {loading && <p style={{ textAlign: 'center' }}>Loading B2 Writing…</p>}
          {!loading && error && (
            <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
          )}

          {!loading && !error && selectedPart ? (
            <div
              className={`levels-listening-practice-layout${
                showPracticeSideRail ? ' levels-listening-practice-layout--with-strategy' : ''
              }`}
            >
              <div className="levels-listening-practice-main">
                <div className="b2-writing-practice__body">
                  {partNumber === 8 ? (
                    <>
                      <B2WritingFirstTaskCard
                        title={part1Task.title}
                        instructions={part1Task.instructions}
                        question={part1Task.question}
                        points={part1Task.points}
                        wordMin={part1Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part1Task.wordMax || B2_WRITING_WORD_MAX}
                      />
                      <B2WritingLongFormAiPanel
                        storageKey={longWritingStorageKey}
                        wordMin={part1Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part1Task.wordMax || B2_WRITING_WORD_MAX}
                        heading="Your answer"
                        examContextBuilder={examContextBuilder}
                        onScoresReady={handleWritingScoresReady}
                        onDraftStats={handleDraftStats}
                        examMode={writingExamMode}
                        lang="en"
                      />
                    </>
                  ) : null}

                  {partNumber === 9 ? (
                    <>
                      <B2WritingPart2TaskPicker
                        title={part2Task.title}
                        instructions={part2Task.instructions}
                        options={part2Task.options}
                        selectedId={part2SelectedId}
                        onSelect={handlePart2Select}
                        wordMin={part2Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part2Task.wordMax || B2_WRITING_WORD_MAX}
                        lang="en"
                      />
                      {part2SelectedOption ? (
                        <B2WritingLongFormAiPanel
                          storageKey={longWritingStorageKey}
                          wordMin={part2Task.wordMin || B2_WRITING_WORD_MIN}
                          wordMax={part2Task.wordMax || B2_WRITING_WORD_MAX}
                          heading="Your answer"
                          examContextBuilder={examContextBuilder}
                          onScoresReady={handleWritingScoresReady}
                          onDraftStats={handleDraftStats}
                          examMode={writingExamMode}
                          lang="en"
                        />
                      ) : (
                        <p className="b2-writing-part2__hint" role="status">
                          Select one task above to open the writing area.
                        </p>
                      )}
                    </>
                  ) : null}

                  <B2ExamPracticeModuleNav
                    slug="b2"
                    partNumber={partNumber}
                    pagePartMax={PART_MAX}
                    examSlot={examSlot}
                    skillPracticeMode={isSkillPracticeSession}
                    skillPracticeTheme={skillNav.skillTheme}
                    onContinueInPage={isSkillPracticeSession ? handleKeepPracticing : handleContinueInPage}
                    onBackClick={isSkillPracticeSession ? handleBackToParts : undefined}
                    nextPartLabel={continuePartLabel}
                    lang="en"
                  />
                </div>
              </div>
              {showPracticeSideRail ? (
                <ExamPracticeSideRail
                  strategy={
                    showStrategySidebar ? <B2WritingStrategyPanel pack={strategyPack} /> : null
                  }
                  progress={
                    <ExamPracticeProgressPanel
                      slug="b2"
                      examSlot={examSlot}
                      partMin={PART_MIN}
                      partMax={PART_MAX}
                      progressSlot={scoring.progressBySlot[examSlot]}
                      examLabel={examLabelsBySlot[examSlot]}
                      lang="en"
                      enabled={scoring.examPracticeOpen}
                    />
                  }
                  tools={<ExamPracticeToolsPanel lang="en" />}
                />
              ) : null}
            </div>
          ) : null}
        </section>
      </B2ExamPracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function B2WritingExamPracticePage() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>}>
      <B2WritingExamPracticePageInner />
    </Suspense>
  );
}
