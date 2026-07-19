'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLevelsExamAdminFlow, createAdminExamSelectHandler, buildExamSlotPickerProps, reloadExamNamesBySlot } from '@/hooks/useLevelsExamAdminFlow';
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { usePathname, useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getActiveB2RuoePartScoring } from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled, isB2RuoeV2SessionPersistenceBlocked } from '@/lib/b2ScoringV2FeatureFlag';
import { parseB2KeyWordAnswerKeyRows } from '@/lib/parseB2KeyWordAnswerKey';
import { gradeB2Part4Gap } from '@/lib/b2Part4Grading';
import { usePartPracticeTimer } from '@/hooks/usePartPracticeTimer';
import { computeB2PartScoreMetrics } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import { supabase } from '@/utils/supabaseClient';
import {
  extractTextoBloque,
  extractPart7ProfilesBlock,
  extractPart7PromptStemBlob,
  extractReadingPart5QuestionsBlock,
  extractReadingPart6SentencesBlock,
  extractReadingPart6OptionLinesBlock,
  parsePart7NumberedStems,
  parsePart7PeopleProfiles,
  parseReadingAdMcqChunks,
  parseReadingPart6SentencePool,
  resolveReadingPart6SentencePool,
  formatReadingPart6SentencesDisplay,
  splitPart1TextoYPreguntas,
  parsePart1QuestionOptions,
} from '@/utils/b2ExamTextBlocks';
import {
  composeOpenClozeDirections,
  composeMcqClozeDirections,
  composeSkillUoeDirections,
  resolveSkillUoeEnunciado,
  extractMcqExampleSentenceLine,
  buildPart1McqGroups,
  shouldUseSkillUoeExampleLayout,
  resolveUoeInlineExample,
  ensureExampleGap0InPassage,
  parseExampleAnswerWord,
  resolveMcqGap0DisplayWord,
  resolvePart1ExampleBlock,
  resolveGap0ModelAnswer,
  extractLegacyPart2InlineExample,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
  resolveB2KeyWordPartContent,
  buildReadingSyntheticMcqGroups,
  buildPart6ReadingMcqGroups,
} from '@/utils/b2ExamPaperShared';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { getCachedB2Level } from '@/utils/b2LevelCache';
import { formatLevelsPartDisplayName, getSkillPartPracticeTitle, formatSkillPartPracticeTitle } from '@/utils/formatLevelsPartDisplayName';
import { formatSkillExerciseLabel, buildProgressBySlotWithLiveOverlay } from '@/utils/skillPartFirstProgress';
import { buildExerciseFavoriteMeta } from '@/lib/exerciseFavoriteMeta';
import { getExamSkillSectionTitle } from '@/data/levelExamPartMap';
import { B2ExamPracticeContent, B2ExamQuestionItem } from '@/components/b2/B2ExamPracticeContent';
import B2ExamInlineOpenClozePassage from '@/components/b2/B2ExamInlineOpenClozePassage';
import B2ExamInlineKeyWordPassage from '@/components/b2/B2ExamInlineKeyWordPassage';
import B2ExamInlineMcqClozePassage from '@/components/b2/B2ExamInlineMcqClozePassage';
import B2ExamInlinePart6Passage from '@/components/b2/B2ExamInlinePart6Passage';
import SkillPartExplanationsPanel from '@/components/exam/SkillPartExplanationsPanel';
import {
  buildMcqGroupExplanationEntries,
  buildOpenClozeExplanationEntries,
  buildKeyWordExplanationEntries,
} from '@/utils/buildOpenGapExplanationEntries';
import {
  getSessionUserId,
  mergeLevelsEstadisticas,
  recordLevelsAnswerEvaluation,
} from '@/utils/levelsEstadisticas';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import ReadingPracticeSideRail from '@/components/exam/ReadingPracticeSideRail';
import ExamPracticeSideRailTop from '@/components/exam/ExamPracticeSideRailTop';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import { buildPartFinishNoticeDisplay } from '@/utils/partFinishNoticeDisplay';
import { getB2ReadingStrategyPack } from '@/data/b2ReadingPracticeStrategies';
import { ReadingPracticeSessionProvider } from '@/context/ReadingPracticeSessionContext';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import AdminExamPartPromptBox from '@/components/admin/AdminExamPartPromptBox';
import {
  runKeepPracticingSkillFlow,
  resolvePartIdAfterExamReload,
  buildQuestionSelectionAfterExamReload,
} from '@/utils/skillPracticeNavigation';
import {
  buildBulkAnswerCheckUpdate,
  practiceHasCheckableAnswers,
  resolvePracticeHideFeedback,
  shouldShowCheckAnswersButton,
} from '@/utils/practiceCheckAnswers';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import ReadingQuestionFlagButton from '@/components/exam/ReadingQuestionFlagButton';
import ReadingConfidenceSelector from '@/components/exam/ReadingConfidenceSelector';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import { useExamModeSectionDraftControls } from '@/hooks/useExamModeSectionDraftControls';
import { scoreExamModeDrafts } from '@/utils/examModeGradeAnswers';
import {
  applyReadingStyleSectionDraft,
  buildExamModeSectionDraft,
  buildSelectedQuestionByPartFromDrafts,
  cloneExamModeDraftByPart,
  getExamModeDraftByPartFromSection,
} from '@/utils/examModeSectionDraft';
import { buildExamModeContinueModuleHref } from '@/utils/buildExamModeContinueModuleHref';
import { buildExamModeFinishPayload } from '@/utils/examModePartRepeat';
import {
  resolveExamPracticeMode,
  isPartPracticeMode,
  isExamSimulationMode,
  getExamChromeTitle,
  getExamChromeSubtitle,
} from '@/lib/examPracticeMode';
import { resolvePracticeScoreSourceFromExamModeParam } from '@/utils/levelsScoreSource';

function splitEnunciadoAndTextFallback(rawText = '') {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return { enunciado: '', texto: '' };
  const lines = normalized.split('\n');
  const textIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'text');
  if (textIndex === -1) return { enunciado: normalized, texto: '' };
  if (textIndex === 0) return { enunciado: normalized, texto: '' };
  return {
    enunciado: lines.slice(0, textIndex).join('\n').trim(),
    texto: lines.slice(textIndex + 1).join('\n').trim(),
  };
}

function getFormattedEnunciado(rawText = '') {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const lower = line.toLowerCase();
      if (/^(?:part|parte)\s+\d+\s*(?:[:–—-]|\s)/i.test(line)) {
        return { type: 'partTitle', text: line };
      }
      if (lower.startsWith('example:')) return { type: 'label', text: line };
      if (lower === 'text') return { type: 'label', text: line };
      if (/^(answer:)/i.test(line)) return { type: 'answer', text: line };
      if (/^\d+\s*$/.test(line)) return { type: 'number', text: line };
      if (/^[a-g]\)\s+/i.test(line)) return { type: 'option', text: line };
      return { type: 'paragraph', text: line };
    });
}

function B2ReadingExamsPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCombinedPaper = pathname?.includes('/exam-reading-and-use-of-english');
  const skillRoute = isCombinedPaper ? 'exam-reading-and-use-of-english' : 'exam-reading';
  const partMin = isCombinedPaper ? 1 : 5;
  const partMax = isCombinedPaper ? 7 : 7;

  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoreSource = resolvePracticeScoreSourceFromExamModeParam(searchParams.get('examMode'));
  const scoring = useB2ExamScoringSession({ partMin, partMax, scoreSource });
  const examMode = useExamModeStrict({
    slug: 'b2',
    partMin,
    partMax,
    sectionTitle: isCombinedPaper ? 'Reading and Use of English' : 'Reading',
  });
  const {
    examModeActive,
    reviewMode,
    hideFeedback,
    section: examSection,
    handleFinishSection,
    setSectionRemaining,
    getSectionRemaining,
    saveSectionDraft,
    hubHref,
    resultsHref,
    sectionKey: examSectionKey,
  } = examMode;
  const examDraftRef = useRef({});
  const prevExamPartRef = useRef(null);
  const examPartMetaRef = useRef({});
  const reviewDraftHydratedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedQuestionByPart, setSelectedQuestionByPart] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [openInputs, setOpenInputs] = useState({});
  const [openChecks, setOpenChecks] = useState({});
  /** @type {Record<string, import('@/lib/b2Part4Grading').B2Part4OpenGrade>} */
  const [openGrades, setOpenGrades] = useState({});
  /** @type {Record<string, { loading?: boolean, error?: string | null, text?: string | null }>} */
  const [aiHintsByKey, setAiHintsByKey] = useState({});

  const mountedRef = useRef(true);
  const partsDataRef = useRef([]);
  const selectedPartIdRef = useRef(null);
  const selectedQuestionByPartRef = useRef({});
  const readingSession = useReadingPracticeSession();

  useEffect(() => {
    readingSession.resetAnswersRevealed();
  }, [examSlot, selectedPartId, readingSession.resetAnswersRevealed]);

  useEffect(() => {
    const onInstantFeedbackChanged = (event) => {
      if (event?.detail?.showFeedback !== false) return;
      setCheckedQuestions({});
      setOpenChecks({});
      setOpenGrades({});
      setAiHintsByKey({});
    };
    window.addEventListener('dralo-reading-instant-feedback-changed', onInstantFeedbackChanged);
    return () =>
      window.removeEventListener('dralo-reading-instant-feedback-changed', onInstantFeedbackChanged);
  }, []);

  const loadReadingData = useCallback(async (slotOverride) => {
    const targetSlot = slotOverride ?? examSlot;
    readingSession.resetAnswersRevealed();
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setOpenGrades({});
    setAiHintsByKey({});

    try {
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);

      if (levelError || !levelData) throw new Error('No se pudo obtener el nivel B2.');

      const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
        slot: targetSlot,
      });
      if (examResolveError || !examenId) {
        const detail =
          typeof examResolveError?.message === 'string'
            ? examResolveError.message
            : examResolveError?.details || '';
        throw new Error(
          detail ? `No se pudo obtener el examen de B2. (${detail})` : 'No se pudo obtener el examen de B2.',
        );
      }

      if (mountedRef.current) {
        scoring.setExamenContext(examenId);
      }

      const { data: questionsData, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
        examenId,
        levelId: levelData.id,
      });

      if (questionsError || !questionsData?.length) {
        throw new Error('No hay preguntas disponibles para B2 Reading.');
      }

      const partIds = [...new Set(questionsData.map((q) => q.parte_id).filter(Boolean))];
      const questionIds = questionsData.map((q) => q.id);

      const [partsRes, answersRes, openAnswersRes] = await Promise.all([
        supabase.from('levels_partes').select('*').in('id', partIds),
        supabase
          .from('levels_respuestas')
          .select('id, pregunta_id, respuesta, correcta')
          .in('pregunta_id', questionIds),
        supabase
          .from('levels_respuestas_abiertas')
          .select('id, pregunta_id_abierta, respuesta_texto, grading_metadata')
          .in('pregunta_id_abierta', questionIds),
      ]);

      const { data: partsTableData, error: partsError } = partsRes;
      const { data: answersData, error: answersError } = answersRes;
      const { data: openAnswersData, error: openAnswersError } = openAnswersRes;

      if (partsError) throw new Error('No se pudieron obtener las partes.');
      if (answersError) throw new Error('No se pudieron obtener las respuestas.');
      if (openAnswersError) {
        console.warn('No se pudieron obtener respuestas abiertas:', openAnswersError);
      }

      const answersByQuestion = (answersData || []).reduce((acc, a) => {
        if (!acc[a.pregunta_id]) acc[a.pregunta_id] = [];
        acc[a.pregunta_id].push(a);
        return acc;
      }, {});

      const openAnswersByQuestion = (openAnswersData || []).reduce((acc, a) => {
        if (!acc[a.pregunta_id_abierta]) acc[a.pregunta_id_abierta] = [];
        acc[a.pregunta_id_abierta].push(a);
        return acc;
      }, {});

      const partsById = (partsTableData || []).reduce((acc, part) => {
        acc[part.id] = part;
        return acc;
      }, {});

      const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';

      const groupedByPart = questionsData.reduce((acc, question) => {
        const tablePart = partsById[question.parte_id];
        const partName = formatLevelsPartDisplayName(tablePart?.nombre_parte || 'Parte sin nombre');
        const partNumber = Number(partName.match(/\d+/)?.[0] || 0);
        if (partNumber < partMin || partNumber > partMax) return acc;

        if (!acc[question.parte_id]) {
          acc[question.parte_id] = {
            id: question.parte_id,
            nombre: partName,
            descripcion: partDescription(tablePart),
            questions: [],
          };
        }

        acc[question.parte_id].questions.push({
          preguntaId: question.id,
          enunciado: question.enunciado || 'Pregunta sin enunciado',
          respuestas: answersByQuestion[question.id] || [],
          respuestasAbiertas: openAnswersByQuestion[question.id] || [],
        });

        return acc;
      }, {});

      const normalizedParts = Object.values(groupedByPart).sort((a, b) => {
        const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
        const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
        return aNumber - bNumber;
      });

      if (!normalizedParts.length) {
        throw new Error(
          isCombinedPaper
            ? 'No Reading and Use of English exercises (Parts 1 to 7) for this exam.'
            : 'No Reading exercises (Parts 5 to 7) for this exam. Check that questions are linked to those parts.',
        );
      }

      if (!mountedRef.current) return;

      const prevParts = partsDataRef.current;
      const prevPartId = selectedPartIdRef.current;
      const prevQuestionByPart = selectedQuestionByPartRef.current;

      setPartsData(normalizedParts);
      partsDataRef.current = normalizedParts;
      const nextPartId = resolvePartIdAfterExamReload(normalizedParts, prevPartId, prevParts);
      setSelectedPartId(nextPartId);
      selectedPartIdRef.current = nextPartId;
      const nextQuestionSelection = buildQuestionSelectionAfterExamReload(
        normalizedParts,
        prevQuestionByPart,
      );
      setSelectedQuestionByPart(nextQuestionSelection);
      selectedQuestionByPartRef.current = nextQuestionSelection;
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Error cargando Reading.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [examSlot, isCombinedPaper, partMin, partMax]);

  const adminFlow = useLevelsExamAdminFlow({
    slug: 'b2',
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: () => {
      void scoring.reloadExamenCatalog?.();
      void loadReadingData();
    },
  });

  const beginExamSlotChange = useCallback(
    (slot) => {
      setLoading(true);
      scoring.handleSelectExam(selectExamSlot, slot);
      void loadReadingData(slot);
    },
    [scoring, selectExamSlot, loadReadingData],
  );

  const handleSelectExamSlot = useMemo(
    () => createAdminExamSelectHandler(adminFlow, beginExamSlotChange),
    [adminFlow, beginExamSlotChange],
  );
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: beginExamSlotChange,
  });

  const skillNav = useSkillPartFirstNavigation({
    enabled: !examModeActive,
    slug: 'b2',
    skillRoute,
    partMin,
    partMax,
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

  useEffect(() => {
    void reloadExamNamesBySlot('b2').then(({ names }) => setExamLabelsBySlot(names));
  }, [scoring.examenIdBySlot]);

  const layoutPracticeOpen = skillNav.active ? skillNav.practiceReady : scoring.examPracticeOpen;
  const isSkillPracticeSession = skillNav.active && layoutPracticeOpen;

  const hideInstantFeedback = resolvePracticeHideFeedback({
    hideFeedback,
    showFeedback: readingSession.readingSettings.showFeedback,
    answersRevealed: readingSession.answersRevealed,
    respectInstantFeedbackToggle: isSkillPracticeSession,
  });

  const tabPartsData = useMemo(() => {
    if (!skillNav.active) return partsData;
    return partsData.filter((p) => {
      const n = Number(p.nombre?.match(/\d+/)?.[0] || 0);
      return n >= partMin && n <= partMax;
    });
  }, [partsData, skillNav.active, partMin, partMax]);

  useEffect(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber || !tabPartsData.length) return;
    const target = tabPartsData.find(
      (p) => Number(p.nombre?.match(/\d+/)?.[0] || 0) === skillNav.selectedPartNumber,
    );
    if (target?.id && target.id !== selectedPartId) setSelectedPartId(target.id);
  }, [skillNav.active, skillNav.selectedPartNumber, tabPartsData, selectedPartId]);

  useEffect(() => {
    partsDataRef.current = partsData;
    selectedPartIdRef.current = selectedPartId;
    selectedQuestionByPartRef.current = selectedQuestionByPart;
  }, [partsData, selectedPartId, selectedQuestionByPart]);

  useEffect(() => {
    mountedRef.current = true;
    if (skillNav.active && !skillNav.practiceReady) {
      return () => {
        mountedRef.current = false;
      };
    }
    loadReadingData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadReadingData, skillNav.active, skillNav.practiceReady]);

  useEffect(() => {
    const qPart = searchParams.get('part');
    if (!qPart || !partsData.length) return;
    const targetNumber = Number(qPart);
    if (!Number.isFinite(targetNumber)) return;
    const target = partsData.find(
      (p) => Number(p.nombre.match(/\d+/)?.[0] || 0) === targetNumber,
    );
    if (target) setSelectedPartId(target.id);
  }, [searchParams, partsData]);

  const selectedPart = useMemo(
    () =>
      tabPartsData.find((part) => part.id === selectedPartId) ??
      partsData.find((part) => part.id === selectedPartId),
    [tabPartsData, partsData, selectedPartId],
  );

  const selectedQuestion = useMemo(() => {
    if (!selectedPart) return null;
    const selectedQuestionId = selectedQuestionByPart[selectedPart.id];
    const chosen =
      selectedPart.questions.find((question) => question.preguntaId === selectedQuestionId) ||
      selectedPart.questions[0] ||
      null;
    return chosen;
  }, [selectedPart, selectedQuestionByPart]);

  useEffect(() => {
    const preguntaId = selectedQuestion?.preguntaId;
    const parteId = selectedPart?.id;
    if (!preguntaId || !parteId) return undefined;

    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) return;
      const pn = Number(selectedPart?.nombre?.match(/\d+/)?.[0] || 0);
      if (isB2RuoeV2SessionPersistenceBlocked(pn)) return;
      const { error } = await mergeLevelsEstadisticas({
        userId: uid,
        preguntaId,
        parteId,
        deltaAccesos: 1,
      });
      if (error) console.warn('levels_estadisticas (acceso):', error.message || error);
    })();

    return undefined;
  }, [selectedQuestion?.preguntaId, selectedPart?.id]);

  const partNumberReading = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

  const categoryTimer = usePartPracticeTimer({
    practiceReady: !loading && !error && layoutPracticeOpen && Boolean(selectedPart?.id),
    partKey: selectedPart?.id
      ? `${examSlot}:${partNumberReading}:${selectedPart.id}:${selectedQuestion?.preguntaId || 'pending'}`
      : null,
    autoStart:
      layoutPracticeOpen && (isSkillPracticeSession || (examModeActive && !reviewMode)),
  });

  const persistPartSessionTime = useCallback(
    async (progressOverride = null) => {
      if (!selectedQuestion?.preguntaId || !selectedPart?.id || !partNumberReading) return;
      await categoryTimer.finalizeSession({
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        partNumber: partNumberReading,
        examSlot,
        levelSlug: 'b2',
        skillRoute,
        scoreSource,
        progress: progressOverride,
        sectionTitle: 'Reading and Use of English',
      });
    },
    [
      categoryTimer,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      partNumberReading,
      examSlot,
      skillRoute,
      scoreSource,
    ],
  );

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid || !selectedQuestion?.preguntaId || !selectedPart?.id || !partNumberReading) {
        categoryTimer.registerSaveParams(null);
        return;
      }
      categoryTimer.registerSaveParams({
        userId: uid,
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        partNumber: partNumberReading,
        examSlot,
        levelSlug: 'b2',
        skillRoute,
        scoreSource,
        sectionTitle: 'Reading and Use of English',
      });
    })();
  }, [
    categoryTimer,
    selectedQuestion?.preguntaId,
    selectedPart?.id,
    partNumberReading,
    examSlot,
    skillRoute,
    scoreSource,
  ]);

  useEffect(() => {
    return () => {
      void persistPartSessionTime();
    };
  }, [selectedPart?.id, selectedQuestion?.preguntaId, examSlot, partNumberReading, persistPartSessionTime]);

  useEffect(() => {
    if (examModeActive && !reviewMode && partNumberReading && selectedPart) {
      examPartMetaRef.current[partNumberReading] = {
        preguntaId: selectedQuestion?.preguntaId,
        parteId: selectedPart?.id,
      };
    }
  }, [examModeActive, reviewMode, partNumberReading, selectedPart?.id, selectedQuestion?.preguntaId]);

  const answerStateRef = useRef({ selectedOptions, openInputs, checkedQuestions });
  useEffect(() => {
    answerStateRef.current = { selectedOptions, openInputs, checkedQuestions };
  }, [selectedOptions, openInputs, checkedQuestions]);

  useEffect(() => {
    if (!reviewMode) {
      reviewDraftHydratedRef.current = false;
    }
  }, [reviewMode]);

  useEffect(() => {
    if (!reviewMode || !partsData.length || !examSection) return;

    const savedByPart = cloneExamModeDraftByPart(getExamModeDraftByPartFromSection(examSection));
    if (Object.keys(savedByPart).length === 0) return;

    examDraftRef.current = { ...savedByPart };

    if (!reviewDraftHydratedRef.current) {
      const questionByPart = buildSelectedQuestionByPartFromDrafts(savedByPart, partsData);
      if (Object.keys(questionByPart).length > 0) {
        setSelectedQuestionByPart((prev) => ({ ...prev, ...questionByPart }));
      }
      reviewDraftHydratedRef.current = true;
    }

    const pn = partNumberReading;
    if (!pn || !selectedPart) return;

    const draft = savedByPart[pn];
    if (!draft) return;

    if (draft.preguntaId && selectedQuestion?.preguntaId !== draft.preguntaId) {
      setSelectedQuestionByPart((prev) =>
        prev[selectedPart.id] === draft.preguntaId
          ? prev
          : { ...prev, [selectedPart.id]: draft.preguntaId },
      );
      return;
    }

    setSelectedOptions({ ...(draft.selectedOptions || {}) });
    setOpenInputs({ ...(draft.openInputs || {}) });
    setCheckedQuestions({ ...(draft.checkedQuestions || {}) });
    prevExamPartRef.current = pn;
  }, [
    reviewMode,
    partsData,
    examSection,
    selectedPart?.id,
    partNumberReading,
    selectedQuestion?.preguntaId,
  ]);

  useEffect(() => {
    if (reviewMode) return;

    if (!examModeActive && !reviewMode) {
      setOpenInputs({});
      setOpenChecks({});
      setOpenGrades({});
      setSelectedOptions({});
      setCheckedQuestions({});
      setAiHintsByKey({});
      prevExamPartRef.current = null;
      return;
    }

    const pn = partNumberReading;
    if (!pn || !selectedPart) return;

    const previousPn = prevExamPartRef.current;
    const partChanged = previousPn != null && previousPn !== pn;

    if (examModeActive && !reviewMode && partChanged) {
      const meta = examPartMetaRef.current[previousPn] || {};
      const { selectedOptions: so, openInputs: oi, checkedQuestions: cq } = answerStateRef.current;
      examDraftRef.current[previousPn] = {
        preguntaId: meta.preguntaId,
        parteId: meta.parteId,
        selectedOptions: { ...so },
        openInputs: { ...oi },
        checkedQuestions: { ...cq },
      };
    }

    if (previousPn !== pn) {
      const draft = examDraftRef.current[pn];
      if (draft) {
        setSelectedOptions(draft.selectedOptions || {});
        setOpenInputs(draft.openInputs || {});
        setCheckedQuestions(draft.checkedQuestions || {});
        if (draft.preguntaId && selectedPart?.id) {
          setSelectedQuestionByPart((prev) =>
            prev[selectedPart.id] === draft.preguntaId
              ? prev
              : { ...prev, [selectedPart.id]: draft.preguntaId },
          );
        }
      } else if (partChanged) {
        setOpenInputs({});
        setSelectedOptions({});
        setCheckedQuestions({});
      }
      setOpenChecks({});
      setOpenGrades({});
      setAiHintsByKey({});
      prevExamPartRef.current = pn;
    }
  }, [selectedPart?.id, examModeActive, reviewMode, partNumberReading]);

  useEffect(() => {
    if (!examModeActive || reviewMode) return;
    const pn = partNumberReading;
    if (!pn || !selectedPart) return;
    examDraftRef.current[pn] = {
      preguntaId: selectedQuestion?.preguntaId,
      parteId: selectedPart.id,
      selectedOptions: { ...selectedOptions },
      openInputs: { ...openInputs },
      checkedQuestions: { ...checkedQuestions },
    };
  }, [
    examModeActive,
    reviewMode,
    partNumberReading,
    selectedPart?.id,
    selectedQuestion?.preguntaId,
    selectedOptions,
    openInputs,
    checkedQuestions,
  ]);

  const isUoePart = isCombinedPaper && partNumberReading >= 1 && partNumberReading <= 4;
  const isOpenClozePart = isCombinedPaper && partNumberReading >= 2 && partNumberReading <= 4;
  const isKeyWordPart = isCombinedPaper && partNumberReading === 4;
  const scoringV2Part4 = isB2ScoringV2Enabled() && isKeyWordPart;
  const part4ParsedKeys = useMemo(
    () =>
      scoringV2Part4
        ? parseB2KeyWordAnswerKeyRows(selectedQuestion?.respuestasAbiertas || [])
        : new Map(),
    [scoringV2Part4, selectedQuestion?.respuestasAbiertas, selectedQuestion?.preguntaId],
  );
  const isInlinePassagePart = isOpenClozePart;
  const isUoePart1 = isCombinedPaper && partNumberReading === 1;
  const useSkillUoeExampleLayout = shouldUseSkillUoeExampleLayout({
    skillPractice: isSkillPracticeSession,
    examMode: examModeActive,
    partNumber: partNumberReading,
  });

  /** Mismo formato de panel de texto que Parte 1 (Use of English) para partes 5–7. */
  const shouldStickEnunciado = partNumberReading >= 5 && partNumberReading <= 7;

  const selectedPartContent = useMemo(() => {
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const fallback = splitEnunciadoAndTextFallback(rawPregunta);
    if (isKeyWordPart) {
      const kwt = resolveB2KeyWordPartContent({
        rawPregunta,
        descripcion: desc,
        fallbackEnunciado: fallback.enunciado,
      });
      return { ...kwt, preguntasPart1Parse: [] };
    }
    const textoExtracted = extractTextoBloque(rawPregunta, partNumberReading, { levelSlug: 'b2' });
    let texto = (textoExtracted || fallback.texto || '').trim();
    let preguntasPart1Parse = [];
    if (isUoePart1 && texto) {
      const split = splitPart1TextoYPreguntas(texto);
      texto = split.texto.trim();
      preguntasPart1Parse = parsePart1QuestionOptions(split.preguntas);
    }
    // Part 1–4: en exam/skill practice el Example va en el pasaje, no en Directions.
    let enunciado =
      useSkillUoeExampleLayout && partNumberReading >= 1 && partNumberReading <= 4
        ? resolveSkillUoeEnunciado(desc, rawPregunta, partNumberReading, fallback.enunciado)
        : partNumberReading === 2
          ? composeOpenClozeDirections(desc, rawPregunta) || fallback.enunciado
          : desc || fallback.enunciado;

    let uoeInlineExample = null;
    if (useSkillUoeExampleLayout && partNumberReading === 1 && !/\(0\)/.test(texto)) {
      const sentenceLine =
        extractMcqExampleSentenceLine(rawPregunta) || extractMcqExampleSentenceLine(desc);
      if (sentenceLine) {
        uoeInlineExample = { bodyLines: [sentenceLine], answerLine: '' };
        texto = ensureExampleGap0InPassage(texto, uoeInlineExample);
      }
    }
    if (useSkillUoeExampleLayout && (partNumberReading === 2 || partNumberReading === 3)) {
      const resolved = resolveUoeInlineExample({
        partNumber: partNumberReading,
        descripcion: desc,
        rawPregunta,
        texto,
        respuestas: selectedQuestion?.respuestas || [],
        respuestasAbiertas: selectedQuestion?.respuestasAbiertas || [],
      });
      if (resolved?.cleanedTexto) texto = resolved.cleanedTexto;
      if (resolved) {
        uoeInlineExample = {
          bodyLines: resolved.bodyLines,
          answerLine: resolved.answerLine,
        };
        texto = ensureExampleGap0InPassage(texto, uoeInlineExample);
      }
    } else if (partNumberReading === 2) {
      // Legacy exam mode: gap (0) incrustado → Example en Directions.
      const legacy = extractLegacyPart2InlineExample(texto);
      if (legacy) {
        texto = legacy.cleanedTexto;
        if (!/^example\s*:/im.test(enunciado)) {
          enunciado = `${enunciado}\nExample:\n${legacy.exampleSentence}`.trim();
        }
      }
    }
    return {
      enunciado,
      texto,
      preguntasPart1Parse,
      uoeInlineExample,
    };
  }, [
    selectedPart?.descripcion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas,
    selectedQuestion?.respuestasAbiertas,
    partNumberReading,
    isUoePart1,
    isKeyWordPart,
    useSkillUoeExampleLayout,
  ]);

  const contextSnippetForAi = useMemo(() => {
    const pack = [selectedPartContent.enunciado, selectedPartContent.texto].filter(Boolean).join('\n\n');
    return pack.slice(0, 5500);
  }, [selectedPartContent.enunciado, selectedPartContent.texto]);

  const requestAiJustification = useCallback(
    (storageKey, payload) => {
      setAiHintsByKey((prev) => ({ ...prev, [storageKey]: { loading: true, error: null, text: null } }));
      void (async () => {
        try {
          const text = await postLevelsAnswerJustification({
            ...payload,
            contextSnippet: contextSnippetForAi,
          });
          setAiHintsByKey((prev) => ({
            ...prev,
            [storageKey]: { loading: false, error: null, text: text || '—' },
          }));
        } catch (e) {
          const msg = e?.message || 'No se pudo obtener la explicación.';
          setAiHintsByKey((prev) => ({
            ...prev,
            [storageKey]: { loading: false, error: msg, text: null },
          }));
        }
      })();
    },
    [contextSnippetForAi],
  );

  const getQuestionKey = (partId, questionNumber, fallbackKey = 'extra') =>
    `${partId}::${selectedQuestion?.preguntaId || 'sin-pregunta'}::${questionNumber ?? fallbackKey}`;

  const getGroupedAnswers = (answers = []) => {
    const groupsMap = new Map();
    const ungrouped = [];

    answers.forEach((answer) => {
      const text = answer.respuesta || '';
      const matchMcq = text.match(/^(\d+)\s+([A-G])\b\s*\)?\s+(.+)$/i);

      if (matchMcq) {
        const questionNumber = Number(matchMcq[1]);
        const optionLetter = matchMcq[2].toUpperCase();
        const optionText = matchMcq[3];
        if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
        groupsMap.get(questionNumber).push({
          ...answer,
          formattedText: `${optionLetter}) ${optionText}`,
        });
        return;
      }

      const matchLetterOnly = text.match(/^(\d+)\s+([A-G])$/i);
      if (matchLetterOnly) {
        const questionNumber = Number(matchLetterOnly[1]);
        const optionLetter = matchLetterOnly[2].toUpperCase();
        if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
        groupsMap.get(questionNumber).push({
          ...answer,
          formattedText: `${optionLetter}`,
        });
        return;
      }

      const matchGap = text.match(/^(\d+)\s+(.+)$/);
      if (matchGap) {
        const questionNumber = Number(matchGap[1]);
        const rest = matchGap[2].trim();
        if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
        groupsMap.get(questionNumber).push({
          ...answer,
          formattedText: rest,
        });
        return;
      }

      ungrouped.push(answer);
    });

    const grouped = [...groupsMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([questionNumber, options]) => ({ questionNumber, options }));

    if (ungrouped.length > 0) {
      grouped.push({
        questionNumber: null,
        options: ungrouped.map((answer) => ({ ...answer, formattedText: answer.respuesta })),
      });
    }
    return grouped;
  };

  const groupedAnswersSelected = useMemo(
    () => getGroupedAnswers(selectedQuestion?.respuestas || []),
    [selectedQuestion?.respuestas],
  );

  const part1CorrectLetterByQuestion = useMemo(() => {
    const map = new Map();
    if (!isUoePart1) return map;
    for (const row of selectedQuestion?.respuestas || []) {
      if (row?.correcta !== true) continue;
      const t = String(row.respuesta || '').trim();
      const m = t.match(/^(\d{1,2})\s+([A-D])\b/i);
      if (m) map.set(Number(m[1]), m[2].toUpperCase());
    }
    return map;
  }, [isUoePart1, selectedQuestion?.preguntaId, selectedQuestion?.respuestas]);

  const part1McqGroups = useMemo(() => {
    if (!isUoePart1) return null;
    const parsed = selectedPartContent.preguntasPart1Parse || [];
    if (!selectedQuestion?.preguntaId) return null;
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    if (!parsed.length) return null;
    return buildPart1McqGroups({
      parsed,
      correctLetterByQuestion: part1CorrectLetterByQuestion,
      preguntaId: selectedQuestion.preguntaId,
      rawPregunta,
      descripcion: desc,
      respuestas: selectedQuestion?.respuestas || [],
      includeExample: useSkillUoeExampleLayout,
    });
  }, [
    part1CorrectLetterByQuestion,
    isUoePart1,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas,
    selectedPart?.descripcion,
    useSkillUoeExampleLayout,
  ]);

  const isPart1McqCloze = isUoePart1 && (part1McqGroups?.length ?? 0) > 0;

  const isUoeExamInlinePart =
    useSkillUoeExampleLayout &&
    isCombinedPaper &&
    partNumberReading >= 1 &&
    partNumberReading <= 3 &&
    (isPart1McqCloze || (partNumberReading >= 2 && partNumberReading <= 3));

  const exampleGap0Word = useMemo(() => {
    if (!useSkillUoeExampleLayout) return '';
    if (isUoePart1) {
      const mcqGroup0 = part1McqGroups?.find((g) => g.questionNumber === 0) || null;
      return resolveMcqGap0DisplayWord({
        respuestas: selectedQuestion?.respuestas || [],
        respuestasAbiertas: selectedQuestion?.respuestasAbiertas || [],
        correctLetterByQuestion: part1CorrectLetterByQuestion,
        inlineExample: selectedPartContent.uoeInlineExample,
        exampleBlock: resolvePart1ExampleBlock({
          parsed: selectedPartContent.preguntasPart1Parse || [],
          rawPregunta: selectedQuestion?.enunciado || '',
          descripcion: (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim(),
          respuestas: selectedQuestion?.respuestas || [],
          correctLetterByQuestion: part1CorrectLetterByQuestion,
        }),
        mcqGroup0,
        rawPregunta: selectedQuestion?.enunciado || '',
        descripcion: (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim(),
        parsed: selectedPartContent.preguntasPart1Parse || [],
        texto: selectedPartContent.texto || '',
      });
    }
    if (partNumberReading >= 2 && partNumberReading <= 3) {
      return (
        parseExampleAnswerWord(selectedPartContent.uoeInlineExample?.answerLine) ||
        resolveGap0ModelAnswer(
          selectedQuestion?.respuestas || [],
          selectedQuestion?.respuestasAbiertas || [],
        )
      );
    }
    return '';
  }, [
    useSkillUoeExampleLayout,
    isUoePart1,
    partNumberReading,
    part1McqGroups,
    part1CorrectLetterByQuestion,
    selectedQuestion?.respuestas,
    selectedQuestion?.respuestasAbiertas,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
    selectedPartContent.preguntasPart1Parse,
    selectedPartContent.texto,
    selectedPartContent.uoeInlineExample,
  ]);

  const inferredOpenQuestionNumbers = useMemo(() => {
    const promptBlob = [selectedQuestion?.enunciado, selectedPartContent.texto]
      .filter(Boolean)
      .join('\n');
    return inferOpenQuestionNumbersFromPrompt(promptBlob, partNumberReading);
  }, [selectedQuestion?.enunciado, selectedPartContent.texto, partNumberReading]);

  const openAnswerMap = useMemo(
    () =>
      getOpenAnswerMap(
        selectedQuestion?.respuestasAbiertas || [],
        selectedQuestion?.respuestas || [],
        inferredOpenQuestionNumbers,
      ),
    [
      inferredOpenQuestionNumbers,
      selectedQuestion?.respuestasAbiertas,
      selectedQuestion?.respuestas,
    ],
  );

  const openQuestionNumbers = useMemo(() => {
    if (!isOpenClozePart) return [];
    const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
    const fromPrompt = inferredOpenQuestionNumbers;
    if (fromPrompt.length > 0) return fromPrompt;
    if (fromAnswers.length > 0) return fromAnswers;
    return [];
  }, [isOpenClozePart, inferredOpenQuestionNumbers, openAnswerMap]);

  /**
   * Reconstruye 4 opciones (5 y 7) o A–G (6) desde el enunciado; la BD suele tener sólo «31 B».
   */
  const readingSyntheticMcqGroups = useMemo(
    () =>
      partNumberReading === 6
        ? null
        : buildReadingSyntheticMcqGroups(
            partNumberReading,
            selectedQuestion?.enunciado || '',
            selectedQuestion?.preguntaId,
            selectedQuestion?.respuestas || [],
            selectedPartContent.texto || '',
          ),
    [
      partNumberReading,
      selectedQuestion?.enunciado,
      selectedQuestion?.preguntaId,
      selectedQuestion?.respuestas,
      selectedPartContent.texto,
    ],
  );

  const part6ContextRaw = useMemo(
    () =>
      [selectedQuestion?.enunciado, selectedPart?.descripcion].filter(Boolean).join('\n\n'),
    [selectedQuestion?.enunciado, selectedPart?.descripcion],
  );

  const part6McqGroups = useMemo(() => {
    if (partNumberReading !== 6) return null;
    return buildPart6ReadingMcqGroups({
      enunciado: part6ContextRaw,
      passageText: selectedPartContent.texto || '',
      preguntaId: selectedQuestion?.preguntaId,
      respuestas: selectedQuestion?.respuestas || [],
      groupedAnswers: groupedAnswersSelected,
    });
  }, [
    partNumberReading,
    part6ContextRaw,
    selectedPartContent.texto,
    selectedQuestion?.preguntaId,
    selectedQuestion?.respuestas,
    groupedAnswersSelected,
  ]);

  const groupedAnswersForUiAndScore =
    part6McqGroups || readingSyntheticMcqGroups || part1McqGroups || groupedAnswersSelected;

  const part6SentencePool = useMemo(() => {
    if (partNumberReading !== 6) return {};
    return resolveReadingPart6SentencePool(
      part6ContextRaw,
      selectedPartContent.texto,
      part6McqGroups || [],
    );
  }, [
    partNumberReading,
    part6ContextRaw,
    selectedPartContent.texto,
    part6McqGroups,
  ]);

  const part6SentencesDisplay = useMemo(() => {
    if (partNumberReading !== 6) return '';
    return (
      formatReadingPart6SentencesDisplay(part6ContextRaw, part6SentencePool, part6McqGroups || []) ||
      extractReadingPart6SentencesBlock(part6ContextRaw) ||
      extractReadingPart6OptionLinesBlock(part6ContextRaw)
    );
  }, [partNumberReading, part6ContextRaw, part6SentencePool, part6McqGroups]);

  const isPart6GappedText = partNumberReading === 6 && (part6McqGroups?.length ?? 0) > 0;

  const readingSidePanelExplanationEntries = useMemo(
    () => {
      if (isInlinePassagePart || isPart1McqCloze || isPart6GappedText || hideInstantFeedback) return [];
      return buildMcqGroupExplanationEntries({
        mcqGroups: groupedAnswersForUiAndScore || [],
        getQuestionKey: (questionNumber, _group, groupIndex) =>
          getQuestionKey(selectedPart?.id, questionNumber, `extra-${groupIndex}`),
        selectedOptions,
        checkedQuestions,
      });
    },
    [
      isInlinePassagePart,
      isPart1McqCloze,
      isPart6GappedText,
      hideInstantFeedback,
      groupedAnswersForUiAndScore,
      selectedPart?.id,
      selectedOptions,
      checkedQuestions,
    ],
  );

  const partScoreMetrics = useMemo(
    () =>
      computeB2PartScoreMetrics({
        partNumber: partNumberReading,
        useOpenInputUi: isOpenClozePart,
        openQuestionNumbers,
        openChecks,
        openGrades,
        usePart4V2Grading: scoringV2Part4,
        groupedAnswers: groupedAnswersForUiAndScore,
        checkedQuestions,
        selectedOptions,
        getQuestionKey,
        partId: selectedPart?.id,
      }),
    [
      partNumberReading,
      isOpenClozePart,
      scoringV2Part4,
      openQuestionNumbers,
      openChecks,
      openGrades,
      groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
    ],
  );

  const b2PartCfg = getActiveB2RuoePartScoring(partNumberReading);

  const livePartProgressForNav = useMemo(() => {
    if (!isSkillPracticeSession || !selectedPart?.id || !partNumberReading) return null;
    const progress = computeB2PartProgressFromState({
      partNumber: partNumberReading,
      useOpenInputUi: isOpenClozePart,
      openQuestionNumbers,
      openChecks,
      openGrades,
      usePart4V2Grading: scoringV2Part4,
      groupedAnswers: groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      getQuestionKey,
      partId: selectedPart.id,
      treatSelectedMcqAsEvaluated: hideInstantFeedback,
    });
    return progress.complete ? progress : null;
  }, [
    isSkillPracticeSession,
    selectedPart?.id,
    partNumberReading,
    isOpenClozePart,
    openQuestionNumbers,
    openChecks,
    openGrades,
    scoringV2Part4,
    groupedAnswersForUiAndScore,
    checkedQuestions,
    selectedOptions,
    hideInstantFeedback,
  ]);

  const skillProgressForNav = useMemo(
    () =>
      buildProgressBySlotWithLiveOverlay(
        scoring.progressBySlot,
        examSlot,
        partNumberReading,
        livePartProgressForNav,
      ),
    [scoring.progressBySlot, examSlot, partNumberReading, livePartProgressForNav],
  );

  const handleKeepPracticing = useCallback(() => {
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      partNumber: partNumberReading,
      progressBySlot: skillProgressForNav,
      onSelectExamSlot: (slot) => {
        void scoring.refreshPuntuacionesProgress();
        handleSelectExamSlot(slot);
      },
      onAdvanceToNextPart: () => {
        void scoring.refreshPuntuacionesProgress();
        skillNav.advanceToNextPart();
      },
    });
  }, [examSlot, partNumberReading, skillProgressForNav, skillNav, scoring, handleSelectExamSlot]);

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    scoring.resetPartNoticeOnPartChange(examSlot, partNumberReading, scoring.progressBySlot);
  }, [examSlot, partNumberReading, selectedPart?.id, scoring.examPracticeOpen, scoring.progressBySlot]);

  const handleExamModeFinish = useCallback(
    (redirectTo) => {
      if (partNumberReading && selectedPart) {
        examDraftRef.current[partNumberReading] = {
          preguntaId: selectedQuestion?.preguntaId,
          parteId: selectedPart?.id,
          selectedOptions: { ...selectedOptions },
          openInputs: { ...openInputs },
          checkedQuestions: { ...checkedQuestions },
        };
      }
      const finishPayload = buildExamModeFinishPayload({
        examSection,
        partMin,
        partMax,
        examDraftRef,
      });
      const { scores, partSnapshots } = scoreExamModeDrafts({
        partMin: finishPayload.scorePartMin,
        partMax: finishPayload.scorePartMax,
        partsData,
        draftByPart: finishPayload.draftByPartForScore,
      });
      handleFinishSection(finishPayload.answersSnapshot, scores, {
        redirectTo: redirectTo || (finishPayload.isPartRepeat ? resultsHref : undefined),
      });
      void (async () => {
        const uid = await getSessionUserId();
        const examenId = scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot];
        if (!uid || !examenId) return;
        const { persistExamModeSectionScores } = await import('@/utils/persistExamModeSectionScores');
        const snapshots = finishPayload.persistPartNumbers
          ? Object.fromEntries(
              finishPayload.persistPartNumbers
                .filter((pn) => partSnapshots[pn])
                .map((pn) => [pn, partSnapshots[pn]]),
            )
          : partSnapshots;
        await persistExamModeSectionScores({ userId: uid, examenId, partSnapshots: snapshots });
      })();
    },
    [
      partNumberReading,
      selectedPart,
      selectedQuestion,
      selectedOptions,
      openInputs,
      checkedQuestions,
      partMin,
      partMax,
      partsData,
      handleFinishSection,
      scoring.currentExamenId,
      scoring.examenIdBySlot,
      examSlot,
      examSection,
      resultsHref,
    ],
  );

  const getExamDraftSnapshot = useCallback(() => {
    const pn = partNumberReading;
    const draftByPart = { ...examDraftRef.current };
    if (pn && selectedPart) {
      draftByPart[pn] = {
        preguntaId: selectedQuestion?.preguntaId,
        parteId: selectedPart?.id,
        selectedOptions: { ...selectedOptions },
        openInputs: { ...openInputs },
        checkedQuestions: { ...checkedQuestions },
      };
    }
    return buildExamModeSectionDraft({
      draftByPart,
      selectedQuestionByPart,
      activePartNumber: pn || null,
      activePartId: selectedPart?.id ?? null,
      remainingSeconds: getSectionRemaining(examSectionKey) ?? examSection?.remainingSeconds ?? null,
    });
  }, [
    partNumberReading,
    selectedPart,
    selectedQuestion?.preguntaId,
    selectedOptions,
    openInputs,
    checkedQuestions,
    selectedQuestionByPart,
    examSection?.remainingSeconds,
    getSectionRemaining,
    examSectionKey,
  ]);

  const getExamScorePreview = useCallback(() => {
    const draftByPart = { ...examDraftRef.current };
    const pn = partNumberReading;
    if (pn && selectedPart) {
      draftByPart[pn] = {
        preguntaId: selectedQuestion?.preguntaId,
        parteId: selectedPart?.id,
        selectedOptions: { ...selectedOptions },
        openInputs: { ...openInputs },
        checkedQuestions: { ...checkedQuestions },
      };
    }
    return scoreExamModeDrafts({
      partMin,
      partMax,
      partsData,
      draftByPart,
    }).scores;
  }, [
    partNumberReading,
    selectedPart,
    selectedQuestion?.preguntaId,
    selectedOptions,
    openInputs,
    checkedQuestions,
    partMin,
    partMax,
    partsData,
  ]);

  const applyExamDraftSnapshot = useCallback(
    (draft) => {
      const { activePartNumber } = applyReadingStyleSectionDraft(draft, {
        examDraftRef,
        setSelectedQuestionByPart,
        setSelectedPartId,
        partsData,
        setAnswerState: ({ selectedOptions: nextSelected, openInputs: nextOpen, checkedQuestions: nextChecked }) => {
          setSelectedOptions(nextSelected);
          setOpenInputs(nextOpen);
          setCheckedQuestions(nextChecked);
          setOpenChecks({});
          setAiHintsByKey({});
        },
      });
      prevExamPartRef.current = activePartNumber;
    },
    [partsData],
  );

  const { examModeSaveControls } = useExamModeSectionDraftControls({
    enabled: examModeActive && !reviewMode && Boolean(examSectionKey),
    sectionKey: examSectionKey,
    section: examSection,
    hubHref,
    saveSectionDraft,
    getDraftSnapshot: getExamDraftSnapshot,
    getScorePreview: getExamScorePreview,
    applyDraftSnapshot: applyExamDraftSnapshot,
    hydrateReady: !loading && partsData.length > 0,
    lang: 'en',
  });

  const handleContinueModuleInExamMode = useCallback(() => {
    if (examSection?.redoPart != null) {
      handleExamModeFinish(resultsHref);
      return;
    }
    handleExamModeFinish(
      buildExamModeContinueModuleHref({
        partNumber: partNumberReading,
        pagePartMax: partMax,
        examSlot,
        slug: 'b2',
      }),
    );
  }, [handleExamModeFinish, examSection?.redoPart, resultsHref, partNumberReading, partMax, examSlot]);

  const trySavePartAfterAnswer = useCallback(
    (stateOverride = {}) => {
      if (examModeActive && !reviewMode) return;
      if (!scoring.examPracticeOpen || !selectedPart?.id || !selectedQuestion?.preguntaId) return;
      const progress = computeB2PartProgressFromState({
        partNumber: partNumberReading,
        useOpenInputUi: isOpenClozePart,
        openQuestionNumbers,
        openChecks: stateOverride.openChecks ?? openChecks,
        openGrades: stateOverride.openGrades ?? openGrades,
        usePart4V2Grading: scoringV2Part4,
        groupedAnswers: groupedAnswersForUiAndScore,
        checkedQuestions: stateOverride.checkedQuestions ?? checkedQuestions,
        selectedOptions: stateOverride.selectedOptions ?? selectedOptions,
        getQuestionKey,
        partId: selectedPart.id,
        treatSelectedMcqAsEvaluated: hideInstantFeedback,
      });
      if (!progress.complete) return;
      void persistPartSessionTime(progress);
      void scoring.trySavePartProgress({
        examSlot,
        partNumber: partNumberReading,
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        progress,
      });
    },
    [
      scoring,
      examSlot,
      partNumberReading,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
      groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      isOpenClozePart,
      scoringV2Part4,
      openQuestionNumbers,
      openChecks,
      openGrades,
      hideInstantFeedback,
      persistPartSessionTime,
    ],
  );

  const handlePart1McqOptionSelect = useCallback(
    ({ group, option, questionKey }) => {
      if (!hideInstantFeedback && checkedQuestions[questionKey]) return;

      const nextSelected = { ...selectedOptions, [questionKey]: option.id };
      setSelectedOptions(nextSelected);

      if (hideInstantFeedback) {
        trySavePartAfterAnswer({ selectedOptions: nextSelected });
        return;
      }

      const wasChecked = checkedQuestions[questionKey];
      const nextChecked = { ...checkedQuestions, [questionKey]: true };
      setCheckedQuestions(nextChecked);
      readingSession.incrementCheckAttempts();
      trySavePartAfterAnswer({
        checkedQuestions: nextChecked,
        selectedOptions: nextSelected,
      });
      if (!wasChecked && !hideFeedback) {
        void (async () => {
          const uid = await getSessionUserId();
          const pid = selectedQuestion?.preguntaId;
          const parteId = selectedPart?.id;
          if (!uid || !pid || !parteId) return;
          const { error } = await recordLevelsAnswerEvaluation({
            userId: uid,
            preguntaId: pid,
            parteId,
            isCorrect: !!option.correcta,
            slotLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
            userAnswerText: option.formattedText || option.respuesta || '',
          });
          if (error) {
            console.warn('levels eval/puntuacion:', error.message || error);
          }
        })();
      }
    },
    [
      checkedQuestions,
      selectedOptions,
      hideFeedback,
      hideInstantFeedback,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
      trySavePartAfterAnswer,
      readingSession,
    ],
  );

  /** Part 1 cloze: la explicación solo se pide cuando el alumno pulsa 💡 Explanation. */
  const handlePart1ExplanationRequest = useCallback(
    ({ questionKey, group }) => {
      const existing = aiHintsByKey[questionKey];
      if (existing?.loading || existing?.text) return;
      const selectedId = selectedOptions[questionKey];
      const option = group?.options?.find((o) => o.id === selectedId);
      if (!option) return;
      const correctOpt = group.options.find((o) => o.correcta);
      const answersFromDatabase = group.options
        .map((o) => (o.formattedText || o.respuesta || '').trim())
        .filter(Boolean)
        .join('\n');
      requestAiJustification(questionKey, {
        style: 'cloze',
        partLabel: selectedPart?.nombre || '',
        questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
        userChoiceText: option.formattedText || option.respuesta || '',
        correctChoiceText: correctOpt?.formattedText || correctOpt?.respuesta || '',
        isCorrect: !!option.correcta,
        answersFromDatabase: answersFromDatabase || undefined,
      });
    },
    [aiHintsByKey, selectedOptions, requestAiJustification, selectedPart?.nombre],
  );

  const handleOpenGapCheck = useCallback(
    (questionNumber, questionKey, currentValue) => {
      if (scoringV2Part4) {
        if (openGrades[questionKey] && typeof openGrades[questionKey].score === 'number') return;
        const grade = gradeB2Part4Gap(currentValue, part4ParsedKeys, questionNumber);
        const nextOpenGrades = { ...openGrades, [questionKey]: grade };
        setOpenGrades(nextOpenGrades);
        readingSession.incrementCheckAttempts();
        void (async () => {
          const uid = await getSessionUserId();
          const pid = selectedQuestion?.preguntaId;
          const parteId = selectedPart?.id;
          if (!uid || !pid || !parteId) return;
          if (isB2RuoeV2SessionPersistenceBlocked(partNumberReading)) return;
          const isFullyCorrect = grade.score === 2;
          const { error } = await mergeLevelsEstadisticas({
            userId: uid,
            preguntaId: pid,
            parteId,
            deltaEvaluadas: 1,
            deltaCorrectas: isFullyCorrect ? 1 : 0,
            deltaIncorrectas: isFullyCorrect ? 0 : 1,
          });
          if (error) {
            console.warn('levels_estadisticas (eval):', error.message || error);
          }
        })();
        trySavePartAfterAnswer({ openGrades: nextOpenGrades });
        return;
      }

      if (typeof openChecks[questionKey] === 'boolean') return;
      const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
      const isCorrect = expectedAnswers.has(normalizeText(currentValue));
      const nextOpenChecks = { ...openChecks, [questionKey]: isCorrect };
      setOpenChecks(nextOpenChecks);
      readingSession.incrementCheckAttempts();
      void (async () => {
        const uid = await getSessionUserId();
        const pid = selectedQuestion?.preguntaId;
        const parteId = selectedPart?.id;
        if (!uid || !pid || !parteId) return;
        if (isB2RuoeV2SessionPersistenceBlocked(partNumberReading)) return;
        const { error } = await mergeLevelsEstadisticas({
          userId: uid,
          preguntaId: pid,
          parteId,
          deltaEvaluadas: 1,
          deltaCorrectas: isCorrect ? 1 : 0,
          deltaIncorrectas: isCorrect ? 0 : 1,
        });
        if (error) {
          console.warn('levels_estadisticas (eval):', error.message || error);
        }
      })();
      trySavePartAfterAnswer({ openChecks: nextOpenChecks });
    },
    [
      scoringV2Part4,
      openGrades,
      part4ParsedKeys,
      openChecks,
      openAnswerMap,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      partNumberReading,
      trySavePartAfterAnswer,
      readingSession,
    ],
  );

  const sessionQuestions = useMemo(() => {
    if (!selectedPart?.id) return [];

    if (isOpenClozePart) {
      return openQuestionNumbers.map((qn) => ({
        questionKey: getQuestionKey(selectedPart.id, qn, 'open'),
        questionNumber: qn,
      }));
    }

    return (groupedAnswersForUiAndScore || [])
      .filter((g) => g.questionNumber != null)
      .map((g, groupIndex) => ({
        questionKey: getQuestionKey(selectedPart.id, g.questionNumber, `extra-${groupIndex}`),
        questionNumber: g.questionNumber,
      }));
  }, [
    selectedPart?.id,
    isOpenClozePart,
    openQuestionNumbers,
    groupedAnswersForUiAndScore,
    selectedQuestion?.preguntaId,
  ]);

  const mcqGroupsForCheck = useMemo(() => {
    if (isPart1McqCloze) return part1McqGroups;
    return readingSyntheticMcqGroups || groupedAnswersForUiAndScore || [];
  }, [isPart1McqCloze, part1McqGroups, readingSyntheticMcqGroups, groupedAnswersForUiAndScore]);

  const resolveMcqQuestionKey = useCallback(
    (group, groupIndex) => {
      if (isPart1McqCloze) {
        const idx = part1McqGroups.findIndex((g) => g.questionNumber === group.questionNumber);
        return getQuestionKey(
          selectedPart.id,
          group.questionNumber,
          `extra-${idx >= 0 ? idx : groupIndex}`,
        );
      }
      return getQuestionKey(selectedPart.id, group.questionNumber, `extra-${groupIndex}`);
    },
    [isPart1McqCloze, part1McqGroups, selectedPart?.id, getQuestionKey],
  );

  const hasCheckableAnswers = useMemo(
    () =>
      selectedPart?.id
        ? practiceHasCheckableAnswers({
            openQuestionNumbers: isOpenClozePart || isKeyWordPart ? openQuestionNumbers : [],
            openInputs,
            getOpenQuestionKey: (questionNumber) =>
              getQuestionKey(selectedPart.id, questionNumber, 'open'),
            mcqGroups: mcqGroupsForCheck,
            getMcqQuestionKey: resolveMcqQuestionKey,
            selectedOptions,
          })
        : false,
    [
      selectedPart?.id,
      isOpenClozePart,
      isKeyWordPart,
      openQuestionNumbers,
      openInputs,
      mcqGroupsForCheck,
      resolveMcqQuestionKey,
      selectedOptions,
    ],
  );

  const handleCheckAllAnswers = useCallback(() => {
    if (!selectedPart?.id) return;

    const bulkUpdate = buildBulkAnswerCheckUpdate({
      openQuestionNumbers: isOpenClozePart || isKeyWordPart ? openQuestionNumbers : [],
      openInputs,
      openChecks,
      openGrades,
      usePart4V2Grading: scoringV2Part4,
      part4ParsedKeys: scoringV2Part4 ? part4ParsedKeys : null,
      openAnswerMap,
      normalizeText,
      getOpenQuestionKey: (questionNumber) =>
        getQuestionKey(selectedPart.id, questionNumber, 'open'),
      mcqGroups: mcqGroupsForCheck,
      getMcqQuestionKey: resolveMcqQuestionKey,
      selectedOptions,
      checkedQuestions,
    });

    const { nextOpenChecks, nextOpenGrades, nextChecked, hasAnyAnswer } = bulkUpdate;

    if (scoringV2Part4) {
      setOpenGrades(nextOpenGrades);
    } else {
      setOpenChecks(nextOpenChecks);
    }
    setCheckedQuestions(nextChecked);
    const progressAfterCheck = computeB2PartProgressFromState({
      partNumber: partNumberReading,
      useOpenInputUi: isOpenClozePart,
      openQuestionNumbers,
      openChecks: scoringV2Part4 ? openChecks : nextOpenChecks,
      openGrades: scoringV2Part4 ? nextOpenGrades : openGrades,
      usePart4V2Grading: scoringV2Part4,
      groupedAnswers: groupedAnswersForUiAndScore,
      checkedQuestions: nextChecked,
      selectedOptions,
      getQuestionKey,
      partId: selectedPart.id,
    });
    if (progressAfterCheck.evaluated > 0) {
      scoring.setPartFinishNotice(
        buildPartFinishNoticeDisplay(progressAfterCheck, partNumberReading, { saved: false }),
      );
    }
    trySavePartAfterAnswer(
      scoringV2Part4
        ? { openGrades: nextOpenGrades, checkedQuestions: nextChecked }
        : { openChecks: nextOpenChecks, checkedQuestions: nextChecked },
    );
    readingSession.revealAnswers();
    if (hasAnyAnswer) readingSession.incrementCheckAttempts();
  }, [
    selectedPart?.id,
    isOpenClozePart,
    isKeyWordPart,
    scoringV2Part4,
    part4ParsedKeys,
    openQuestionNumbers,
    openInputs,
    openChecks,
    openGrades,
    openAnswerMap,
    mcqGroupsForCheck,
    resolveMcqQuestionKey,
    selectedOptions,
    checkedQuestions,
    trySavePartAfterAnswer,
    scoring.setPartFinishNotice,
    partNumberReading,
    groupedAnswersForUiAndScore,
    getQuestionKey,
    readingSession,
  ]);

  /** Explicación lazy para huecos open cloze / word formation / key word. */
  const handleOpenGapExplanationRequest = useCallback(
    ({ questionKey, questionNumber }) => {
      const existing = aiHintsByKey[questionKey];
      if (existing?.loading || existing?.text) return;

      let isCorrect = false;
      if (scoringV2Part4) {
        const grade = openGrades[questionKey];
        if (!grade || typeof grade.score !== 'number') return;
        isCorrect = grade.score === 2;
      } else {
        const checkResult = openChecks[questionKey];
        if (typeof checkResult !== 'boolean') return;
        isCorrect = checkResult;
      }

      const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
      const style =
        partNumberReading === 3
          ? 'word-formation'
          : partNumberReading === 4
            ? 'key-word'
            : 'open-cloze';
      requestAiJustification(questionKey, {
        style,
        partLabel: selectedPart?.nombre || '',
        questionLabel: `Question ${questionNumber}`,
        userChoiceText: openInputs[questionKey] || '',
        correctChoiceText: [...expectedAnswers].slice(0, 4).join(' · ') || 'model answer',
        isCorrect,
        answersFromDatabase: [...expectedAnswers].join(' · ') || undefined,
      });
    },
    [
      aiHintsByKey,
      scoringV2Part4,
      openGrades,
      openChecks,
      openInputs,
      openAnswerMap,
      requestAiJustification,
      selectedPart?.nombre,
      partNumberReading,
    ],
  );

  /** Explicación lazy para MCQ Reading (Parts 5–7). */
  const handleReadingMcqExplanationRequest = useCallback(
    ({ questionKey, group }) => {
      const existing = aiHintsByKey[questionKey];
      if (existing?.loading || existing?.text) return;
      if (!checkedQuestions[questionKey]) return;
      const selectedId = selectedOptions[questionKey];
      const option = group?.options?.find((o) => o.id === selectedId);
      if (!option) return;
      const correctOpt = group.options.find((o) => o.correcta);
      const answersFromDatabase = group.options
        .map((o) => (o.formattedText || o.respuesta || '').trim())
        .filter(Boolean)
        .join('\n');
      const style =
        partNumberReading === 5
          ? 'reading-mcq'
          : partNumberReading === 6
            ? 'gapped-text'
            : partNumberReading === 7
              ? 'reading-matching'
              : '';
      requestAiJustification(questionKey, {
        style,
        partLabel: selectedPart?.nombre || '',
        questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
        userChoiceText: option.formattedText || option.respuesta || '',
        correctChoiceText: correctOpt?.formattedText || correctOpt?.respuesta || '',
        isCorrect: !!option.correcta,
        answersFromDatabase: answersFromDatabase || undefined,
      });
    },
    [
      aiHintsByKey,
      checkedQuestions,
      selectedOptions,
      requestAiJustification,
      selectedPart?.nombre,
      partNumberReading,
    ],
  );

  const uoeInlineExplanationFooter = useMemo(() => {
    if (hideInstantFeedback) return null;

    if (isPart1McqCloze) {
      const entries = buildMcqGroupExplanationEntries({
        mcqGroups: part1McqGroups || [],
        getQuestionKey: (questionNumber) => {
          const groupIndex = (part1McqGroups || []).findIndex(
            (g) => g.questionNumber === questionNumber,
          );
          return getQuestionKey(
            selectedPart?.id,
            questionNumber,
            `extra-${groupIndex >= 0 ? groupIndex : 'mcq'}`,
          );
        },
        selectedOptions,
        checkedQuestions,
      });
      if (!entries.length) return null;
      return (
        <SkillPartExplanationsPanel
          entries={entries}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={handlePart1ExplanationRequest}
        />
      );
    }

    if (isKeyWordPart) {
      const entries = buildKeyWordExplanationEntries({
        activeQuestionNumbers: openQuestionNumbers,
        getQuestionKey: (questionNumber) =>
          getQuestionKey(selectedPart?.id, questionNumber, 'open'),
        openInputs,
        openChecks,
        openGrades,
        scoringV2Part4,
        openAnswerMap,
      });
      if (!entries.length) return null;
      return (
        <SkillPartExplanationsPanel
          entries={entries}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={handleOpenGapExplanationRequest}
        />
      );
    }

    if (isInlinePassagePart) {
      const entries = buildOpenClozeExplanationEntries({
        activeQuestionNumbers: openQuestionNumbers,
        getQuestionKey: (questionNumber) =>
          getQuestionKey(selectedPart?.id, questionNumber, 'open'),
        openInputs,
        openChecks,
        openAnswerMap,
      });
      if (!entries.length) return null;
      return (
        <SkillPartExplanationsPanel
          entries={entries}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={handleOpenGapExplanationRequest}
        />
      );
    }

    return null;
  }, [
    hideInstantFeedback,
    isPart1McqCloze,
    isKeyWordPart,
    isInlinePassagePart,
    part1McqGroups,
    selectedPart?.id,
    selectedOptions,
    checkedQuestions,
    openQuestionNumbers,
    openInputs,
    openChecks,
    openGrades,
    scoringV2Part4,
    openAnswerMap,
    aiHintsByKey,
    handlePart1ExplanationRequest,
    handleOpenGapExplanationRequest,
  ]);

  const practiceExplanationFooter = useMemo(() => {
    if (uoeInlineExplanationFooter) return uoeInlineExplanationFooter;
    if (hideInstantFeedback || !readingSidePanelExplanationEntries.length) return null;
    return (
      <SkillPartExplanationsPanel
        entries={readingSidePanelExplanationEntries}
        aiHintsByKey={aiHintsByKey}
        onRequestExplanation={handleReadingMcqExplanationRequest}
      />
    );
  }, [
    uoeInlineExplanationFooter,
    hideInstantFeedback,
    readingSidePanelExplanationEntries,
    aiHintsByKey,
    handleReadingMcqExplanationRequest,
  ]);

  const scorePanelProps = {
    ...partScoreMetrics,
    passingCount: b2PartCfg?.passing ?? partScoreMetrics.passingCount,
  };

  const handleSelectPart = (part) => {
    setSelectedPartId(part.id);
    if (skillNav.active) {
      const n = Number(part.nombre?.match(/\d+/)?.[0] || 0);
      if (n) skillNav.selectPartNumber(n);
    }
    if (part.questions.length > 1) {
      const currentSelected = selectedQuestionByPart[part.id];
      const available = part.questions.filter((q) => q.preguntaId !== currentSelected);
      const pool = available.length > 0 ? available : part.questions;
      const nextQuestion = pool[Math.floor(Math.random() * pool.length)];
      setSelectedQuestionByPart((prev) => ({ ...prev, [part.id]: nextQuestion.preguntaId }));
    } else if (part.questions.length === 1) {
      setSelectedQuestionByPart((prev) => ({ ...prev, [part.id]: part.questions[0].preguntaId }));
    }
  };

  const handleContinueInPage = useCallback(() => {
    const sorted = [...partsData].sort((a, b) => {
      const an = Number(a.nombre.match(/\d+/)?.[0] || 0);
      const bn = Number(b.nombre.match(/\d+/)?.[0] || 0);
      return an - bn;
    });
    const currentIdx = sorted.findIndex((p) => p.id === selectedPartId);
    if (currentIdx < 0 || currentIdx >= sorted.length - 1) return;
    handleSelectPart(sorted[currentIdx + 1]);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [partsData, selectedPartId, handleSelectPart]);

  const handlePreviousInPage = useCallback(() => {
    const sorted = [...partsData].sort((a, b) => {
      const an = Number(a.nombre.match(/\d+/)?.[0] || 0);
      const bn = Number(b.nombre.match(/\d+/)?.[0] || 0);
      return an - bn;
    });
    const currentIdx = sorted.findIndex((p) => p.id === selectedPartId);
    if (currentIdx <= 0) return;
    handleSelectPart(sorted[currentIdx - 1]);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [partsData, selectedPartId, handleSelectPart]);

  const practiceMode = resolveExamPracticeMode({ examModeActive, reviewMode });

  const modeBadge = useMemo(() => {
    if (isExamSimulationMode(practiceMode)) return 'Exam Mode';
    if (isSkillPracticeSession && isPartPracticeMode(practiceMode)) {
      return 'Practice Mode';
    }
    return null;
  }, [practiceMode, isSkillPracticeSession]);

  const compactChromeHeader = isSkillPracticeSession || isExamSimulationMode(practiceMode);

  const readingStrategyPack =
    isSkillPracticeSession && isPartPracticeMode(practiceMode)
      ? getB2ReadingStrategyPack(partNumberReading)
      : null;

  const showPracticeSideRail =
    (isSkillPracticeSession && isPartPracticeMode(practiceMode) && scoring.examPracticeOpen) ||
    (examModeActive && !reviewMode && scoring.examPracticeOpen);


  const chromeTitle = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeTitle({
        lang: 'en',
        examModeActive,
        reviewMode,
        sectionTitle: isCombinedPaper ? 'Reading and Use of English' : 'Reading',
        defaultTitle: isCombinedPaper ? 'B2 Reading and Use of English Practice' : 'B2 Reading Practice',
      });
    }
    if (isSkillPracticeSession && skillRoute) {
      const skillTitle = getExamSkillSectionTitle('b2', skillRoute);
      if (skillTitle) return skillTitle;
    }
    return isCombinedPaper ? 'B2 Reading and Use of English Practice' : 'B2 Reading Practice';
  }, [examModeActive, reviewMode, isCombinedPaper, isSkillPracticeSession, skillRoute]);

  const chromeSubtitleResolved = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeSubtitle({
        lang: 'en',
        examModeActive,
        reviewMode,
        defaultSubtitle: isCombinedPaper ? 'Parts 1 to 7' : 'Parts 5 to 7',
      });
    }
    if (isSkillPracticeSession) return null;
    return isCombinedPaper ? 'Parts 1 to 7' : 'Parts 5 to 7';
  }, [examModeActive, reviewMode, isCombinedPaper, isSkillPracticeSession]);

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

  const getPartTitle = (part) => {
    const n = Number(part?.nombre.match(/\d+/)?.[0] || 0);
    return formatSkillPartPracticeTitle('b2', n, 'en');
  };

  const getPartTitleParts = (part) => {
    const n = Number(part?.nombre.match(/\d+/)?.[0] || partNumberReading || 0);
    return getSkillPartPracticeTitle('b2', n, 'en', examSlot);
  };

  const part6SentencePoolBlock = useMemo(() => {
    if (partNumberReading !== 6) return '';
    return extractReadingPart6SentencesBlock(selectedQuestion?.enunciado || '');
  }, [partNumberReading, selectedQuestion?.enunciado]);

  const selectedPartTitleParts = useMemo(() => {
    if (!selectedPart) return { heading: '', subtitle: '' };
    return getPartTitleParts(selectedPart);
  }, [selectedPart, partNumberReading, examSlot]);

  const showExerciseFavorite =
    isSkillPracticeSession &&
    !isExamSimulationMode(practiceMode) &&
    Boolean(selectedQuestion?.preguntaId);

  const exerciseFavoriteMeta = useMemo(() => {
    if (!showExerciseFavorite) return null;
    return buildExerciseFavoriteMeta({
      levelSlug: 'b2',
      skillRoute,
      partNumber: partNumberReading,
      examSlot,
      title:
        selectedPartTitleParts.subtitle ||
        selectedPartTitleParts.heading ||
        'Test',
      heading: selectedPartTitleParts.heading || null,
      sectionTitle: getExamSkillSectionTitle('b2', skillRoute),
    });
  }, [
    showExerciseFavorite,
    skillRoute,
    partNumberReading,
    examSlot,
    selectedPartTitleParts,
  ]);

  const reportErrorContext = useMemo(() => {
    if (loading || error || !scoring.examPracticeOpen || !selectedPart) return null;
    const questionText = selectedQuestion?.enunciado
      ? String(selectedQuestion.enunciado).replace(/\s+/g, ' ').trim().slice(0, 300)
      : '';
    return {
      levelSlug: 'b2',
      skillRoute,
      partNumber: partNumberReading,
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
    skillRoute,
    partNumberReading,
    examSlot,
    practiceMode,
    examModeActive,
    reviewMode,
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
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
      <ReadingPracticeChrome
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
        skillRoute={skillRoute}
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        timerVariant={isSkillPracticeSession && !examModeActive ? 'session' : 'prominent'}
        modeBadge={modeBadge}
        showRefresh={!isExamSimulationMode(practiceMode)}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel={
          isCombinedPaper ? 'Refresh Reading and Use of English (1–7)' : 'Refresh Reading (5–7)'
        }
        lang="en"
        loading={loading}
        onRefresh={() => loadReadingData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={isExamSimulationMode(practiceMode) && !reviewMode}
        partFinishNotice={isExamSimulationMode(practiceMode) && !reviewMode ? null : scoring.partFinishNotice}
        partFinishNoticePlacement={showPracticeSideRail ? 'header' : 'main'}
        studyNotesPlacement={showPracticeSideRail ? 'sidebar-top' : 'header'}
        partsData={!loading && !error ? tabPartsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        studyNotesContext={{
          slug: 'b2',
          skillRoute,
          examMode: examModeActive,
          partNumber: partNumberReading,
          examSlot,
        }}
        studyNotesContextLabel={
          isCombinedPaper ? 'B2 Reading and Use of English' : 'B2 Reading'
        }
        reportErrorContext={reportErrorContext}
        examModeSaveControls={examModeSaveControls}
      >
      {examModeActive && examSection ? (
        <ExamModeSectionBanner
          sectionTitle={examSection.title || (isCombinedPaper ? 'Reading and Use of English' : 'Reading')}
          durationSeconds={examSection.durationSeconds}
          initialRemainingSeconds={examSection.remainingSeconds}
          active={!reviewMode}
          onTick={(sec) => setSectionRemaining(examSection.key, sec)}
          onFinish={handleExamModeFinish}
          lang="en"
        />
      ) : null}
      <div
        className={`levels-listening-practice-layout${
          showPracticeSideRail ? ' levels-listening-practice-layout--with-strategy' : ''
        }${readingSession.focusMode ? ' levels-listening-practice-layout--focus' : ''}`}
      >
      <div
        className={`levels-listening-practice-main ${readingSession.readingAreaClassName}`}
        style={readingSession.readingAreaStyle}
      >
      <section style={{ margin: '0 auto', width: '100%' }}>
        {loading && (
          <p style={{ textAlign: 'center' }}>
            {isCombinedPaper
              ? 'Loading Reading and Use of English (Parts 1 to 7)…'
              : 'Loading Reading (Parts 5 to 7)…'}
          </p>
        )}
        {!loading && error && <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>}

        {!loading && !error && (
          <>
            {selectedPart && selectedQuestion && (
              <B2ExamPracticeContent
                title={selectedPartTitleParts.heading}
                titleSubtitle={selectedPartTitleParts.subtitle}
                showExerciseFavorite={showExerciseFavorite}
                favoritePreguntaId={selectedQuestion?.preguntaId}
                favoriteMeta={exerciseFavoriteMeta}
                favoriteLang="en"
                exerciseLabel={
                  isSkillPracticeSession && examSlot && !isUoePart
                    ? formatSkillExerciseLabel(examSlot, 'en')
                    : null
                }
                directionsText={selectedPartContent.enunciado}
                directionsLabel={isUoeExamInlinePart || isUoePart1 ? 'Instructions' : 'Directions'}
                textLabel={isUoeExamInlinePart || isPart6GappedText ? null : 'Text'}
                questionsLabel="Questions"
                stripExampleFromDirections={isUoeExamInlinePart}
                passageText={
                  isInlinePassagePart || isPart1McqCloze || isPart6GappedText
                    ? ''
                    : selectedPartContent.texto
                }
                passage={
                  isPart6GappedText ? (
                    <B2ExamInlinePart6Passage
                      key={`part6-${examSlot}-${selectedQuestion.preguntaId}`}
                      text={selectedPartContent.texto}
                      mcqGroups={part6McqGroups}
                      sentencePool={part6SentencePool}
                      sentencesDisplay={part6SentencesDisplay}
                      getQuestionKey={(questionNumber) => {
                        const groupIndex = part6McqGroups.findIndex(
                          (g) => g.questionNumber === questionNumber,
                        );
                        return getQuestionKey(
                          selectedPart.id,
                          questionNumber,
                          `extra-${groupIndex >= 0 ? groupIndex : 'part6'}`,
                        );
                      }}
                      selectedOptions={selectedOptions}
                      checkedQuestions={checkedQuestions}
                      onOptionSelect={handlePart1McqOptionSelect}
                      hideFeedback={hideInstantFeedback}
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handleReadingMcqExplanationRequest}
                    />
                  ) : isPart1McqCloze ? (
                    <B2ExamInlineMcqClozePassage
                      key={`mcq-${examSlot}-${selectedQuestion.preguntaId}`}
                      text={selectedPartContent.texto}
                      mcqGroups={part1McqGroups}
                      getQuestionKey={(questionNumber) => {
                        const groupIndex = part1McqGroups.findIndex(
                          (g) => g.questionNumber === questionNumber,
                        );
                        return getQuestionKey(
                          selectedPart.id,
                          questionNumber,
                          `extra-${groupIndex >= 0 ? groupIndex : 'mcq'}`,
                        );
                      }}
                      selectedOptions={selectedOptions}
                      checkedQuestions={checkedQuestions}
                      onOptionSelect={handlePart1McqOptionSelect}
                      hideFeedback={hideInstantFeedback}
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handlePart1ExplanationRequest}
                      showInlineExample={useSkillUoeExampleLayout}
                      exampleGap0Word={exampleGap0Word}
                    />
                  ) : isKeyWordPart ? (
                    <B2ExamInlineKeyWordPassage
                      text={selectedPartContent.texto}
                      activeQuestionNumbers={openQuestionNumbers}
                      getQuestionKey={(questionNumber) =>
                        getQuestionKey(selectedPart.id, questionNumber, 'open')
                      }
                      openInputs={openInputs}
                      onInputChange={(questionKey, value) => {
                        setOpenInputs((prev) => ({ ...prev, [questionKey]: value }));
                      }}
                      openChecks={openChecks}
                      openGrades={openGrades}
                      scoringV2Part4={scoringV2Part4}
                      onCheckGap={handleOpenGapCheck}
                      openAnswerMap={openAnswerMap}
                      hideFeedback={hideInstantFeedback}
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handleOpenGapExplanationRequest}
                    />
                  ) : isInlinePassagePart ? (
                    <B2ExamInlineOpenClozePassage
                      text={selectedPartContent.texto}
                      activeQuestionNumbers={openQuestionNumbers}
                      getQuestionKey={(questionNumber) =>
                        getQuestionKey(selectedPart.id, questionNumber, 'open')
                      }
                      openInputs={openInputs}
                      onInputChange={(questionKey, value) => {
                        setOpenInputs((prev) => ({ ...prev, [questionKey]: value }));
                      }}
                      openChecks={openChecks}
                      onCheckGap={handleOpenGapCheck}
                      openAnswerMap={openAnswerMap}
                      hideFeedback={hideInstantFeedback}
                      inputPlaceholder="Write one word"
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handleOpenGapExplanationRequest}
                      showInlineExample={useSkillUoeExampleLayout}
                      exampleGap0Word={exampleGap0Word}
                    />
                  ) : null
                }
                split={isInlinePassagePart || isPart1McqCloze || isPart6GappedText ? true : 'auto'}
                contentClassName={
                  isUoeExamInlinePart
                    ? 'levels-exam-uoe-inline'
                    : isPart6GappedText
                      ? 'levels-exam-part6-inline'
                      : isPart1McqCloze
                        ? 'levels-exam-mcq-cloze-inline'
                        : isInlinePassagePart
                          ? 'levels-exam-open-cloze-inline'
                          : partNumberReading === 6 && part6SentencePoolBlock
                            ? 'levels-exam-part6-split'
                            : ''
                }
                showQuestionsHeading={!isInlinePassagePart && !isPart1McqCloze && !isPart6GappedText}
                footer={practiceExplanationFooter}
                questions={
                  isInlinePassagePart || isPart1McqCloze || isPart6GappedText
                    ? null
                    : (
                      <>
                        {partNumberReading === 6 && part6SentencePoolBlock ? (
                          <div className="levels-exam-part6-pool-sticky">
                            <p style={{ margin: '0 0 0.55rem', fontWeight: 700, color: '#1e293b' }}>
                              Sentences A–G (choose one per gap)
                            </p>
                            <pre
                              style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'inherit',
                                lineHeight: 1.6,
                                color: '#334155',
                              }}
                            >
                              {part6SentencePoolBlock}
                            </pre>
                          </div>
                        ) : null}
                        <div
                          className={
                            partNumberReading === 6 && part6SentencePoolBlock
                              ? 'levels-exam-part6-answers-scroll'
                              : undefined
                          }
                        >
                        {groupedAnswersForUiAndScore.map((group, groupIndex) => {
                          const questionKey = getQuestionKey(
                            selectedPart.id,
                            group.questionNumber,
                            `extra-${groupIndex}`,
                          );
                          const isFlagged = hideInstantFeedback && !!readingSession.flaggedQuestions[questionKey];
                          return (
                      <div
                        key={`group-${selectedQuestion.preguntaId}-${group.questionNumber ?? 'extra'}-${groupIndex}`}
                        id={group.questionNumber ? `question-${group.questionNumber}` : undefined}
                        data-question-number={group.questionNumber ?? undefined}
                      >
                      <B2ExamQuestionItem>
                        <div className={`reading-question-header${isFlagged ? ' question-flagged' : ''}`}>
                        <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                          {!group.questionNumber
                            ? 'Options'
                            : group.questionStem
                              ? (
                                  <>
                                    <span>{group.questionNumber}.</span>{' '}
                                    <span style={{ fontWeight: 600 }}>{group.questionStem}</span>
                                  </>
                                )
                              : `Question ${group.questionNumber}`}
                        </p>
                        {group.questionNumber && hideInstantFeedback && selectedOptions[questionKey] ? (
                          <ReadingQuestionFlagButton
                            questionKey={questionKey}
                            questionNumber={group.questionNumber}
                          />
                        ) : null}
                        </div>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                          {group.options.map((option) => {
                            const isSelected = selectedOptions[questionKey] === option.id;
                            const isChecked = checkedQuestions[questionKey];
                            const isCorrect = !!option.correcta;
                            const isEliminated = readingSession.isOptionEliminated(questionKey, option.id);
                            const showCorrect = !hideInstantFeedback && isChecked && isCorrect;
                            const showIncorrect = !hideInstantFeedback && isChecked && isSelected && !isCorrect;

                            const isLocked = !hideInstantFeedback && isChecked;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                className={`question-option tool-button${isEliminated ? ' eliminated' : ''}`}
                                disabled={isLocked}
                                onClick={() => {
                                  if (isLocked) return;
                                  if (readingSession.answerEliminatorEnabled) {
                                    readingSession.toggleEliminatedAnswer(questionKey, option.id);
                                    return;
                                  }
                                  handlePart1McqOptionSelect({
                                    group,
                                    groupIndex,
                                    option,
                                    questionKey,
                                  });
                                }}
                                style={{
                                  textAlign: 'left',
                                  whiteSpace: 'pre-line',
                                  borderRadius: '8px',
                                  padding: '0.75rem 1rem',
                                  border: showCorrect
                                    ? '2px solid #2f855a'
                                    : showIncorrect
                                      ? '2px solid #c53030'
                                      : isSelected
                                        ? '2px solid #3182ce'
                                        : '1px solid #e2e8f0',
                                  backgroundColor: showCorrect
                                    ? '#f0fff4'
                                    : showIncorrect
                                      ? '#fff5f5'
                                      : isSelected
                                        ? '#ebf8ff'
                                        : '#fff',
                                  cursor: isLocked ? 'not-allowed' : 'pointer',
                                  opacity: isLocked && !isSelected ? 0.65 : 1,
                                }}
                              >
                                {option.formattedText || option.respuesta}
                              </button>
                            );
                          })}
                        </div>

                        {hideInstantFeedback && selectedOptions[questionKey] ? (
                          <ReadingConfidenceSelector questionKey={questionKey} />
                        ) : null}

                        {partNumberReading === 6 && part6SentencePoolBlock ? (
                          <details className="levels-exam-part6-pool-inline" style={{ marginTop: '0.75rem' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                              Show sentences A–G
                            </summary>
                            <pre
                              style={{
                                margin: '0.5rem 0 0',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'inherit',
                                lineHeight: 1.55,
                                fontSize: '0.92rem',
                                color: '#475569',
                              }}
                            >
                              {part6SentencePoolBlock}
                            </pre>
                          </details>
                        ) : null}
                      </B2ExamQuestionItem>
                      </div>
                          );
                        })}
                        </div>
                      </>
                    )
                }
              />
            )}
          </>
        )}
      </section>

      <AdminExamPartPromptBox
        enabled
        slug="b2"
        partNumber={partNumberReading}
        examSlot={examSlot}
        lang="en"
      />

      <B2ExamPracticeModuleNav
        slug="b2"
        partNumber={partNumberReading}
        pagePartMax={partMax}
        pagePartMin={partMin}
        examSlot={examSlot}
        examenIdBySlot={isSkillPracticeSession ? scoring.examenIdBySlot : undefined}
        progressBySlot={isSkillPracticeSession ? skillProgressForNav : undefined}
        livePartProgress={isSkillPracticeSession ? livePartProgressForNav : undefined}
        onSelectExamSlot={
          isSkillPracticeSession
            ? (slot) => {
                void scoring.refreshPuntuacionesProgress();
                handleSelectExamSlot(slot);
              }
            : undefined
        }
        skillPracticeMode={isSkillPracticeSession}
        examMode={examModeActive && !reviewMode}
        skillPracticeTheme={skillNav.skillTheme}
        onContinueInPage={isSkillPracticeSession ? handleKeepPracticing : handleContinueInPage}
        onPreviousInPage={handlePreviousInPage}
        onContinueModule={
          examModeActive && !reviewMode ? handleContinueModuleInExamMode : undefined
        }
        showCheckAnswersButton={shouldShowCheckAnswersButton({
          skillPracticeMode: isSkillPracticeSession,
          hideFeedback,
          showFeedback: readingSession.readingSettings.showFeedback,
          answersRevealed: readingSession.answersRevealed,
        })}
        onCheckAnswers={handleCheckAllAnswers}
        checkAnswersDisabled={!hasCheckableAnswers}
        lang="en"
      />
      </div>
      {showPracticeSideRail ? (
        <ReadingPracticeSideRail
          strategyPack={examModeActive && !reviewMode ? null : readingStrategyPack}
          partNumber={partNumberReading}
          topRail={
            <ExamPracticeSideRailTop
              studyNotes={
                <ExamStudyNotesSidebar
                  context={{
                    slug: 'b2',
                    skillRoute,
                    examMode: examModeActive,
                    partNumber: partNumberReading,
                    examSlot,
                  }}
                  contextLabel={
                    isCombinedPaper ? 'B2 Reading and Use of English' : 'B2 Reading'
                  }
                  lang="en"
                />
              }
            />
          }
          questions={sessionQuestions}
          checkedQuestions={checkedQuestions}
          selectedOptions={selectedOptions}
          groupedAnswers={groupedAnswersForUiAndScore || []}
          openChecks={openChecks}
          {...partScoreMetrics}
          hideFeedback={hideInstantFeedback}
          hideTools={examModeActive && !reviewMode}
          examSlot={examSlot}
          progressBySlot={scoring.progressBySlot}
          examLabelsBySlot={examLabelsBySlot}
          slug="b2"
          skillRoute={skillRoute}
          passing={b2PartCfg?.passing ?? partScoreMetrics.passingCount}
          finishNotice={null}
          lang="en"
        />
      ) : null}
      </div>
      </ReadingPracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function B2ReadingExamsPage() {
  return (
    <Suspense
      fallback={<main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>Loading practice…</main>}
    >
      <ReadingPracticeSessionProvider>
        <B2ReadingExamsPageInner />
      </ReadingPracticeSessionProvider>
    </Suspense>
  );
}
