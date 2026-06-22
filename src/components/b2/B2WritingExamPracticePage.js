'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import B2WritingFirstTaskCard from '@/components/b2/B2WritingFirstTaskCard';
import B2WritingPart2TaskPicker from '@/components/b2/B2WritingPart2TaskPicker';
import B2WritingStrategyPanel from '@/components/b2/B2WritingStrategyPanel';
import ExamPracticeProgressPanel from '@/components/exam/ExamPracticeProgressPanel';
import ExamPracticeSessionSideRail from '@/components/exam/ExamPracticeSessionSideRail';
import ExamPracticeSideRailTop from '@/components/exam/ExamPracticeSideRailTop';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import SkillPartPracticeHeader from '@/components/exam/SkillPartPracticeHeader';
import { SkillPartInstructionsPanel } from '@/components/b2/B2ExamPracticeContent';
import { getFormattedEnunciado } from '@/utils/b2ExamPaperShared';
import { ReadingPracticeSessionProvider, useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import { getB2WritingStrategyPack } from '@/data/b2WritingPracticeStrategies';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { usePartPracticeTimer } from '@/hooks/usePartPracticeTimer';
import { supabase } from '@/utils/supabaseClient';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug } from '@/utils/levelsLevelCache';
import { formatLevelsPartDisplayName, getSkillPartPracticeTitle } from '@/utils/formatLevelsPartDisplayName';
import { SkillPartExerciseFavorite } from '@/components/exam/ExerciseFavoriteButton';
import { buildExerciseFavoriteMeta } from '@/lib/exerciseFavoriteMeta';
import { getExamSkillSectionTitle } from '@/data/levelExamPartMap';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import {
  useLevelsExamAdminFlow,
  reloadExamNamesBySlot,
  createAdminExamSelectHandler,
  buildExamSlotPickerProps,
} from '@/hooks/useLevelsExamAdminFlow';
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
import {
  runKeepPracticingSkillFlow,
} from '@/utils/skillPracticeNavigation';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeSectionDraftControls } from '@/hooks/useExamModeSectionDraftControls';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import {
  buildExamModeSectionDraft,
  collectLocalStorageSnapshots,
  applyLocalStorageSnapshots,
  resolvePartIdByNumber,
  EXAM_MODE_SECTION_DRAFT_VERSION,
} from '@/utils/examModeSectionDraft';
import { useExamModeHubNav } from '@/hooks/useExamModeHubNav';
import {
  resolveExamPracticeMode,
  isPartPracticeMode,
  isExamSimulationMode,
  getExamChromeTitle,
  getExamChromeSubtitle,
} from '@/lib/examPracticeMode';
import { buildExamModeContinueModuleHref } from '@/utils/buildExamModeContinueModuleHref';
import { clearExamModeWritingPartStorage } from '@/utils/examModePartRepeat';
import { buildExamModeSkillPartSnapshots } from '@/utils/buildExamModeSkillPartSnapshots';
import { finishExamModeSupabasePersistence } from '@/utils/finishExamModeSupabasePersistence';
import { scoreExamModeWritingParts, mergeWritingPartScoresWithSubmittedEssays } from '@/utils/examModeWritingScore';
import {
  parseB2WritingPart1Task,
  parseB2WritingPart2Task,
  buildB2WritingPart1ExamContext,
  buildB2WritingPart2ExamContext,
  getB2WritingPartTabLabel,
  B2_WRITING_WORD_MIN,
  B2_WRITING_WORD_MAX,
} from '@/data/b2WritingTasks';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { resolvePracticeScoreSourceFromExamModeParam } from '@/utils/levelsScoreSource';

const B2WritingLongFormAiPanel = dynamic(
  () => import('@/components/b2/B2WritingLongFormAiPanel'),
  { ssr: false, loading: () => <p className="loading">Loading feedback…</p> },
);

const PART_MIN = 8;
const PART_MAX = 9;

function getPartNumber(part) {
  return Number(part?.partNumber || String(part?.nombre || '').match(/\d+/)?.[0] || 0);
}

function resolveWritingQuestionForPart(part, selectedQuestionByPart) {
  if (!part?.questions?.length) return null;
  const selectedQId = selectedQuestionByPart?.[part.id];
  return (
    part.questions.find((q) => q.preguntaId === selectedQId) ||
    part.questions[0] ||
    null
  );
}

function resolveWritingStorageKey(part, selectedQuestionByPart) {
  const question = resolveWritingQuestionForPart(part, selectedQuestionByPart);
  if (question?.preguntaId) return `b2-exam-writing-${question.preguntaId}`;
  if (part?.id) return `b2-exam-writing-${part.id}`;
  return null;
}

function resolveWritingPart2ChoiceKey(part, selectedQuestionByPart) {
  const question = resolveWritingQuestionForPart(part, selectedQuestionByPart);
  const id = question?.preguntaId || part?.id;
  return id ? `b2-writing-p2-choice-${id}` : null;
}

function B2WritingExamPracticePageInner() {
  const searchParams = useSearchParams();
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoreSource = resolvePracticeScoreSourceFromExamModeParam(searchParams.get('examMode'));
  const scoring = useB2ExamScoringSession({ partMin: PART_MIN, partMax: PART_MAX, scoreSource });
  const examMode = useExamModeStrict({
    slug: 'b2',
    partMin: PART_MIN,
    partMax: PART_MAX,
    sectionTitle: 'Writing',
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
    resultsHref,
  } = examMode;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedQuestionByPart, setSelectedQuestionByPart] = useState({});
  const [part2SelectedOptionByPart, setPart2SelectedOptionByPart] = useState({});
  const [writingLiveCorrect, setWritingLiveCorrect] = useState(null);
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});
  const mountedRef = useRef(true);
  const partsShellRef = useRef([]);
  const examModePartScoresRef = useRef({});
  const examDraftRef = useRef({});
  const [writingDraftEpoch, setWritingDraftEpoch] = useState(0);
  const setExamenContextRef = useRef(scoring.setExamenContext);
  setExamenContextRef.current = scoring.setExamenContext;

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
    examenIdBySlot: scoring.examenIdBySlot,
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
  const readingSession = useReadingPracticeSession();
  const PracticeChrome = isSkillPracticeSession ? ReadingPracticeChrome : B2ExamPracticeChrome;

  const handleKeepPracticing = useCallback(() => {
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      partNumber: skillNav.selectedPartNumber,
      progressBySlot: scoring.progressBySlot,
      onSelectExamSlot: (slot) => {
        void scoring.refreshPuntuacionesProgress();
        handleSelectExamSlot(slot);
      },
      onAdvanceToNextPart: () => {
        void scoring.refreshPuntuacionesProgress();
        skillNav.advanceToNextPart();
      },
    });
  }, [examSlot, skillNav, scoring, handleSelectExamSlot]);

  const tabPartsData = useMemo(() => {
    if (!skillNav.active) return partsData;
    return partsData.filter((p) => {
      const n = getPartNumber(p);
      return n >= PART_MIN && n <= PART_MAX;
    });
  }, [partsData, skillNav.active]);

  useEffect(() => {
    const qPart = searchParams.get('part');
    if (!qPart || !tabPartsData.length) return;
    const targetNumber = Number(qPart);
    if (!Number.isFinite(targetNumber)) return;
    const target = tabPartsData.find((p) => getPartNumber(p) === targetNumber);
    if (target) setSelectedPartId(target.id);
  }, [searchParams, tabPartsData]);

  useEffect(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber || !tabPartsData.length) return;
    const target = tabPartsData.find((p) => getPartNumber(p) === skillNav.selectedPartNumber);
    if (target?.id && target.id !== selectedPartId) setSelectedPartId(target.id);
  }, [skillNav.active, skillNav.selectedPartNumber, tabPartsData, selectedPartId]);

  useEffect(() => {
    mountedRef.current = true;
    void loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const selectedPart =
    tabPartsData.find((p) => p.id === selectedPartId) || tabPartsData[0] || null;
  const partNumber = getPartNumber(selectedPart);

  const part8Part = tabPartsData.find((p) => getPartNumber(p) === 8) || null;
  const part9Part = tabPartsData.find((p) => getPartNumber(p) === 9) || null;

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

  const categoryTimer = usePartPracticeTimer({
    practiceReady: !loading && !error && layoutPracticeOpen && Boolean(selectedPart?.id),
    partKey: selectedPart?.id
      ? `${examSlot}:${partNumber}:${selectedPart.id}:${selectedQuestion?.preguntaId || 'pending'}`
      : null,
    autoStart:
      layoutPracticeOpen && (isSkillPracticeSession || (examModeActive && !reviewMode)),
  });

  const persistPartSessionTime = useCallback(
    async (progressOverride = null) => {
      if (!selectedQuestion?.preguntaId || !selectedPart?.id || !partNumber) return;
      await categoryTimer.finalizeSession({
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        partNumber,
        examSlot,
        levelSlug: 'b2',
        skillRoute: 'exam-writing',
        scoreSource,
        progress: progressOverride,
        sectionTitle: 'Writing',
      });
    },
    [
      categoryTimer,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      partNumber,
      examSlot,
      scoreSource,
    ],
  );

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid || !selectedQuestion?.preguntaId || !selectedPart?.id || !partNumber) {
        categoryTimer.registerSaveParams(null);
        return;
      }
      categoryTimer.registerSaveParams({
        userId: uid,
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        partNumber,
        examSlot,
        levelSlug: 'b2',
        skillRoute: 'exam-writing',
        scoreSource,
        sectionTitle: 'Writing',
      });
    })();
  }, [
    categoryTimer,
    selectedQuestion?.preguntaId,
    selectedPart?.id,
    partNumber,
    examSlot,
    scoreSource,
  ]);

  useEffect(() => {
    return () => {
      void persistPartSessionTime();
    };
  }, [selectedPart?.id, selectedQuestion?.preguntaId, examSlot, partNumber, persistPartSessionTime]);

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

  const selectedPartTitleParts = useMemo(
    () =>
      getSkillPartPracticeTitle(
        'b2',
        partNumber,
        'en',
        isSkillPracticeSession ? examSlot : null,
      ),
    [partNumber, examSlot, isSkillPracticeSession],
  );

  const writingInstructionsBlocks = useMemo(() => {
    const raw =
      partNumber === 8
        ? part1Task.instructions
        : partNumber === 9
          ? part2Task.instructions
          : '';
    if (!raw?.trim()) return [];
    return getFormattedEnunciado(raw);
  }, [partNumber, part1Task.instructions, part2Task.instructions]);

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
    if (!reviewMode || !examSection) return;
    const writingByPart = examSection.answers?.writingByPart;
    if (writingByPart && Object.keys(writingByPart).length > 0) {
      examModePartScoresRef.current = { ...writingByPart };
    }
    const entry =
      writingByPart?.[partNumber] ?? examSection.scores?.byPart?.[partNumber];
    if (entry?.correct != null) {
      setWritingLiveCorrect(entry.correct);
    }
  }, [
    selectedPart?.id,
    selectedQuestion?.preguntaId,
    part2SelectedId,
    reviewMode,
    examSection,
    partNumber,
  ]);

  const handleWritingScoresReady = useCallback(
    (scores) => {
      if (!scores || typeof scores.total !== 'number') return;
      setWritingLiveCorrect(scores.total);
      if (!scoring.examPracticeOpen || !selectedPart?.id) return;
      const preguntaId =
        selectedQuestion?.preguntaId || selectedPart.questions?.[0]?.preguntaId || selectedPart.id;
      if (examModeActive && !reviewMode) {
        examModePartScoresRef.current[partNumber] = {
          correct: scores.total,
          total: partScoringCfg?.total ?? 20,
          preguntaId,
        };
        return;
      }
      void scoring.saveWritingOrSpeakingScore({
        examSlot,
        partNumber,
        preguntaId,
        parteId: selectedPart.id,
        correct: scores.total,
        total: partScoringCfg?.total ?? 20,
        passed: Boolean(scores.passed),
      });
      void persistPartSessionTime({
        complete: true,
        correct: scores.total,
        total: partScoringCfg?.total ?? 20,
        passed: Boolean(scores.passed),
      });
    },
    [
      scoring,
      examSlot,
      partNumber,
      selectedPart,
      selectedQuestion?.preguntaId,
      partScoringCfg,
      examModeActive,
      reviewMode,
      persistPartSessionTime,
    ],
  );

  const handleSelectPart = (part) => {
    setSelectedPartId(part.id);
    if (skillNav.active) {
      const n = getPartNumber(part);
      if (n) skillNav.selectPartNumber(n);
    }
    if (part.questions?.length === 1) {
      setSelectedQuestionByPart((prev) => ({ ...prev, [part.id]: part.questions[0].preguntaId }));
    }
  };

  const handleContinueInPage = useCallback(() => {
    const part9 = tabPartsData.find((p) => getPartNumber(p) === 9);
    if (part9) setSelectedPartId(part9.id);
  }, [tabPartsData]);

  const handlePreviousInPage = useCallback(() => {
    const part8 = tabPartsData.find((p) => getPartNumber(p) === 8);
    if (part8) setSelectedPartId(part8.id);
  }, [tabPartsData]);

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

  const examModeHubNav = useExamModeHubNav({
    slug: 'b2',
    examSlot: examModeSlot ?? examSlot,
    examModeActive,
    reviewMode,
    lang: 'en',
  });

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

  const showExerciseFavorite =
    isSkillPracticeSession &&
    !isExamSimulationMode(practiceMode) &&
    Boolean(selectedQuestion?.preguntaId);

  const exerciseFavoriteMeta = useMemo(() => {
    if (!showExerciseFavorite) return null;
    return buildExerciseFavoriteMeta({
      levelSlug: 'b2',
      skillRoute: 'exam-writing',
      partNumber,
      examSlot,
      title:
        selectedPartTitleParts.subtitle ||
        selectedPartTitleParts.heading ||
        'Exercise',
      heading: selectedPartTitleParts.heading || null,
      sectionTitle: getExamSkillSectionTitle('b2', 'exam-writing'),
    });
  }, [showExerciseFavorite, partNumber, examSlot, selectedPartTitleParts]);

  const writingExamMode = examModeActive && !reviewMode;

  const strategyPack = isPartPracticeMode(practiceMode)
    ? getB2WritingStrategyPack(partNumber, part2SelectedOption?.writingType)
    : null;

  // Part 1 always; Part 2 shows general tips before a task is chosen, then type-specific tips.
  const showStrategySidebar = Boolean(strategyPack);

  const showPracticeSideRail =
    isSkillPracticeSession && isPartPracticeMode(practiceMode) && scoring.examPracticeOpen;

  const writingRepeatClearedRef = useRef(false);
  useEffect(() => {
    if (!examSection?.redoPart || examSection.redoPart !== partNumber || writingRepeatClearedRef.current) {
      return;
    }
    writingRepeatClearedRef.current = true;
    clearExamModeWritingPartStorage(selectedQuestion?.preguntaId, selectedPart?.id);
  }, [examSection?.redoPart, partNumber, selectedQuestion?.preguntaId, selectedPart?.id]);

  const handleExamModeFinish = useCallback(
    async (redirectTo) => {
      const redoPn = examSection?.redoPart ?? null;
      const writingEntries = tabPartsData
        .map((part) => {
          const pn = getPartNumber(part);
          const question = getQuestionForPart(part);
          if (!pn || !question) return null;
          return {
            partNumber: pn,
            preguntaId: question.preguntaId,
            partId: part.id,
            enunciado: question.enunciado,
          };
        })
        .filter(Boolean)
        .filter((entry) => (redoPn != null ? entry.partNumber === redoPn : true));

      try {
        const scored = await scoreExamModeWritingParts(writingEntries);
        const mergedScored = mergeWritingPartScoresWithSubmittedEssays(scored, writingEntries);
        examModePartScoresRef.current = { ...examModePartScoresRef.current, ...mergedScored };
      } catch (err) {
        console.warn('exam mode writing finish score:', err);
        const fallback = mergeWritingPartScoresWithSubmittedEssays({}, writingEntries);
        examModePartScoresRef.current = { ...examModePartScoresRef.current, ...fallback };
      }

      const pn = partNumber;
      const preguntaId =
        selectedQuestion?.preguntaId || selectedPart?.questions?.[0]?.preguntaId || selectedPart?.id;
      if (pn && preguntaId && writingLiveCorrect != null && !examModePartScoresRef.current[pn]) {
        examModePartScoresRef.current[pn] = {
          correct: writingLiveCorrect,
          total: partScoringCfg?.total ?? 20,
          preguntaId,
        };
      }

      const mergedWritingByPart =
        redoPn != null
          ? { ...(examSection?.answers?.writingByPart || {}), ...examModePartScoresRef.current }
          : examModePartScoresRef.current;

      const scorePartMin = redoPn ?? PART_MIN;
      const scorePartMax = redoPn ?? PART_MAX;

      const { scores, partSnapshots } = buildExamModeSkillPartSnapshots({
        partMin: scorePartMin,
        partMax: scorePartMax,
        partsData: tabPartsData,
        examModePartScores: mergedWritingByPart,
        resolvePartNumber: getPartNumber,
      });
      handleFinishSection(
        {
          ...(examSection?.answers || {}),
          writingCompleted: true,
          writingByPart: mergedWritingByPart,
        },
        scores,
        { redirectTo: redirectTo || (redoPn != null ? resultsHref : undefined) },
      );
      const snapshots =
        redoPn != null
          ? Object.fromEntries(
              Object.entries(partSnapshots).filter(([key]) => Number(key) === redoPn),
            )
          : partSnapshots;
      void finishExamModeSupabasePersistence({
        partSnapshots: snapshots,
        examenId: scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot],
      });
    },
    [
      tabPartsData,
      getQuestionForPart,
      scoring.currentExamenId,
      scoring.examenIdBySlot,
      examSlot,
      handleFinishSection,
      partNumber,
      selectedPart,
      selectedQuestion?.preguntaId,
      writingLiveCorrect,
      partScoringCfg?.total,
      examSection,
      resultsHref,
    ],
  );

  const handleContinueModuleInExamMode = useCallback(() => {
    if (examSection?.redoPart != null) {
      void handleExamModeFinish(resultsHref);
      return;
    }
    void handleExamModeFinish(
      buildExamModeContinueModuleHref({
        partNumber,
        pagePartMax: PART_MAX,
        examSlot,
        slug: 'b2',
      }),
    );
  }, [handleExamModeFinish, examSection?.redoPart, resultsHref, partNumber, examSlot]);

  const writingDraftStorageKeys = useMemo(() => {
    const keys = new Set();
    for (const part of tabPartsData) {
      const essayKey = resolveWritingStorageKey(part, selectedQuestionByPart);
      const choiceKey = resolveWritingPart2ChoiceKey(part, selectedQuestionByPart);
      if (essayKey) keys.add(essayKey);
      if (choiceKey) keys.add(choiceKey);
    }
    return [...keys];
  }, [tabPartsData, selectedQuestionByPart]);

  const getExamDraftSnapshot = useCallback(() => {
    const draftByPart = { ...examDraftRef.current };
    for (const part of tabPartsData) {
      const pn = getPartNumber(part);
      if (!pn) continue;
      const question = resolveWritingQuestionForPart(part, selectedQuestionByPart);
      draftByPart[pn] = {
        ...(draftByPart[pn] || {}),
        preguntaId: question?.preguntaId ?? null,
        parteId: part.id,
        part2OptionId: part2SelectedOptionByPart[part.id] ?? null,
      };
    }
    return buildExamModeSectionDraft({
      draftByPart,
      selectedQuestionByPart,
      activePartNumber: partNumber || null,
      activePartId: selectedPart?.id ?? null,
      remainingSeconds: getSectionRemaining(examSectionKey) ?? examSection?.remainingSeconds ?? null,
      localStorageSnapshots: collectLocalStorageSnapshots(writingDraftStorageKeys),
    });
  }, [
    tabPartsData,
    selectedQuestionByPart,
    part2SelectedOptionByPart,
    partNumber,
    selectedPart?.id,
    getSectionRemaining,
    examSectionKey,
    examSection?.remainingSeconds,
    writingDraftStorageKeys,
  ]);

  const applyExamDraftSnapshot = useCallback(
    (draft) => {
      if (!draft || draft.version !== EXAM_MODE_SECTION_DRAFT_VERSION) return;
      examDraftRef.current = { ...(draft.draftByPart || {}) };

      if (draft.selectedQuestionByPart) {
        setSelectedQuestionByPart(draft.selectedQuestionByPart);
      }

      const nextPart2Choices = {};
      for (const part of tabPartsData) {
        const pn = getPartNumber(part);
        const partDraft = draft.draftByPart?.[pn];
        if (partDraft?.part2OptionId != null) {
          nextPart2Choices[part.id] = partDraft.part2OptionId;
        }
      }
      if (Object.keys(nextPart2Choices).length) {
        setPart2SelectedOptionByPart((prev) => ({ ...prev, ...nextPart2Choices }));
      }

      if (draft.activePartId) {
        setSelectedPartId(draft.activePartId);
      } else if (draft.activePartNumber) {
        const partId = resolvePartIdByNumber(tabPartsData, draft.activePartNumber);
        if (partId) setSelectedPartId(partId);
      }

      if (draft.localStorageSnapshots) {
        applyLocalStorageSnapshots(draft.localStorageSnapshots);
      }

      setWritingDraftEpoch((n) => n + 1);
    },
    [tabPartsData],
  );

  const { examModeSaveControls } = useExamModeSectionDraftControls({
    enabled: examModeActive && !reviewMode && Boolean(examSectionKey),
    sectionKey: examSectionKey,
    section: examSection,
    hubHref,
    saveSectionDraft,
    getDraftSnapshot: getExamDraftSnapshot,
    applyDraftSnapshot: applyExamDraftSnapshot,
    localStorageKeysForRevert: writingDraftStorageKeys,
    hydrateReady: !loading && tabPartsData.length > 0,
    lang: 'en',
  });

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
        subtitle={chromeSubtitle}
        hideMascot={compactChromeHeader}
        hideSubtitle={!chromeSubtitle}
        compactSkillHeader={compactChromeHeader}
        showLevelPicker={isSkillPracticeSession}
        levelSlug="b2"
        skillRoute="exam-writing"
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        timerVariant={isSkillPracticeSession && !examModeActive ? 'session' : 'prominent'}
        modeBadge={modeBadge}
        showRefresh={!isExamSimulationMode(practiceMode)}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel="Refresh Writing"
        loading={loading}
        onRefresh={() => void loadData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={isExamSimulationMode(practiceMode) && !reviewMode}
        partFinishNotice={isExamSimulationMode(practiceMode) && !reviewMode ? null : scoring.partFinishNotice}
        partFinishNoticePlacement={showPracticeSideRail ? 'header' : 'main'}
        studyNotesPlacement={showPracticeSideRail ? 'sidebar-top' : 'header'}
        partsData={!loading && !error ? tabPartsData : []}
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
        examModeSaveControls={examModeSaveControls}
      >
        {examModeActive && examSection ? (
          <ExamModeSectionBanner
            sectionKey={examSection.key}
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
              }${readingSession.focusMode ? ' levels-listening-practice-layout--focus' : ''}`}
            >
              <div
                className={`levels-listening-practice-main${isSkillPracticeSession ? ` ${readingSession.readingAreaClassName}` : ''}`}
                style={isSkillPracticeSession ? readingSession.readingAreaStyle : undefined}
              >
                <div className="b2-writing-practice__body levels-exam-practice-page">
                  <div className="levels-exam-split-card">
                    <SkillPartPracticeHeader
                      title={selectedPartTitleParts.heading}
                      subtitle={selectedPartTitleParts.subtitle}
                      titleActions={
                        <SkillPartExerciseFavorite
                          show={showExerciseFavorite}
                          preguntaId={selectedQuestion?.preguntaId}
                          meta={exerciseFavoriteMeta}
                          lang="en"
                        />
                      }
                    />
                    <div className="levels-exam-split__body levels-exam-split__body--stacked">
                      {writingInstructionsBlocks.length ? (
                        <SkillPartInstructionsPanel
                          label="Instructions"
                          blocks={writingInstructionsBlocks}
                        />
                      ) : null}

                  {partNumber === 8 ? (
                    <>
                      <B2WritingFirstTaskCard
                        instructions={part1Task.instructions}
                        question={part1Task.question}
                        points={part1Task.points}
                        wordMin={part1Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part1Task.wordMax || B2_WRITING_WORD_MAX}
                        hideHeader
                        hideInstructions
                      />
                      <B2WritingLongFormAiPanel
                        key={`writing-p1-${longWritingStorageKey}-${writingDraftEpoch}`}
                        storageKey={longWritingStorageKey}
                        wordMin={part1Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part1Task.wordMax || B2_WRITING_WORD_MAX}
                        heading="Your answer"
                        examContextBuilder={examContextBuilder}
                        onScoresReady={handleWritingScoresReady}
                        examMode={writingExamMode}
                        reviewExamCorrection={reviewMode}
                        lang="en"
                      />
                    </>
                  ) : null}

                  {partNumber === 9 ? (
                    <>
                      <B2WritingPart2TaskPicker
                        instructions={part2Task.instructions}
                        options={part2Task.options}
                        selectedId={part2SelectedId}
                        onSelect={handlePart2Select}
                        wordMin={part2Task.wordMin || B2_WRITING_WORD_MIN}
                        wordMax={part2Task.wordMax || B2_WRITING_WORD_MAX}
                        lang="en"
                        hideHeader
                        hideInstructions
                      />
                      {part2SelectedOption ? (
                        <B2WritingLongFormAiPanel
                          key={`writing-p2-${longWritingStorageKey}-${writingDraftEpoch}`}
                          storageKey={longWritingStorageKey}
                          wordMin={part2Task.wordMin || B2_WRITING_WORD_MIN}
                          wordMax={part2Task.wordMax || B2_WRITING_WORD_MAX}
                          heading="Your answer"
                          examContextBuilder={examContextBuilder}
                          onScoresReady={handleWritingScoresReady}
                          examMode={writingExamMode}
                          reviewExamCorrection={reviewMode}
                          lang="en"
                        />
                      ) : (
                        <p className="b2-writing-part2__hint" role="status">
                          Select one task above to open the writing area.
                        </p>
                      )}
                    </>
                  ) : null}
                    </div>
                  </div>

                  <B2ExamPracticeModuleNav
                    slug="b2"
                    partNumber={partNumber}
                    pagePartMax={PART_MAX}
                    pagePartMin={PART_MIN}
                    examSlot={examSlot}
                    examenIdBySlot={isSkillPracticeSession ? scoring.examenIdBySlot : undefined}
                    progressBySlot={isSkillPracticeSession ? scoring.progressBySlot : undefined}
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
                    nextPartLabel={continuePartLabel}
                    lang="en"
                  />
                </div>
              </div>
              {showPracticeSideRail ? (
                <ExamPracticeSessionSideRail
                  topRail={
                    <ExamPracticeSideRailTop
                      studyNotes={
                        <ExamStudyNotesSidebar
                          context={{
                            slug: 'b2',
                            skillRoute: 'exam-writing',
                            examMode: examModeActive,
                            partNumber,
                            examSlot,
                          }}
                          contextLabel="B2 Writing Practice"
                          lang="en"
                        />
                      }
                    />
                  }
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
                      progressBySlot={scoring.progressBySlot}
                      examLabelsBySlot={examLabelsBySlot}
                      focusPartNumber={partNumber}
                      passing={partScoringCfg?.passing}
                      skillRoute="exam-writing"
                      examLabel={examLabelsBySlot[examSlot]}
                      lang="en"
                      enabled={scoring.examPracticeOpen}
                    />
                  }
                  finishNotice={null}
                  lang="en"
                />
              ) : null}
            </div>
          ) : null}
        </section>
      </PracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function B2WritingExamPracticePage() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>}>
      <ReadingPracticeSessionProvider>
        <B2WritingExamPracticePageInner />
      </ReadingPracticeSessionProvider>
    </Suspense>
  );
}
