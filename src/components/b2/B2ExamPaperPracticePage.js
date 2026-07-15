'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useLevelExamPracticeSlot } from '@/hooks/useLevelExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { B2ExamPracticeContent, B2ExamQuestionItem, SkillPartInstructionsPanel } from '@/components/b2/B2ExamPracticeContent';
import SkillPartPracticeHeader from '@/components/exam/SkillPartPracticeHeader';
import B2ExamInlineMcqClozePassage from '@/components/b2/B2ExamInlineMcqClozePassage';
import SkillPartExplanationsPanel from '@/components/exam/SkillPartExplanationsPanel';
import {
  buildOpenClozeExplanationEntries,
  buildMcqGroupExplanationEntries,
} from '@/utils/buildOpenGapExplanationEntries';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { useLevelExamScoringSession } from '@/hooks/useLevelExamScoringSession';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getExamSkillSectionTitle } from '@/data/levelExamPartMap';
import { usePartPracticeTimer } from '@/hooks/usePartPracticeTimer';
import { computeB2PartScoreMetrics } from '@/utils/levelsPaperScoreMetrics';
import { getLevelsPartScoring } from '@/utils/levelsA2PartScoring';
import { isB2RuoeV2SessionPersistenceBlocked } from '@/lib/b2ScoringV2FeatureFlag';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import {
  buildLevelsJustificationPayload,
  resolveCorrectAnswerRowIds,
} from '@/utils/levelsJustifyPayload';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import {
  extractTextoBloque,
  extractListeningMatchingOptionPool,
  isA2ListeningItemLayoutPart,
  isB2ListeningItemLayoutPart,
  splitListeningMcqContextByQuestion,
  splitListeningOpenGapContextByQuestion,
  splitListeningSpeakerContextByQuestion,
  splitPart1TextoYPreguntas,
  parsePart1QuestionOptions,
  trimListeningPart10DuplicateCycles,
  buildListeningGapPassageLines,
  extractMcqOptionLetter,
} from '@/utils/b2ExamTextBlocks';
import B2ListeningPracticeBriefing from '@/components/b2/B2ListeningPracticeBriefing';
import B2ListeningStrategyPanel from '@/components/b2/B2ListeningStrategyPanel';
import ExamPracticeProgressPanel from '@/components/exam/ExamPracticeProgressPanel';
import ExamPracticeSessionSideRail from '@/components/exam/ExamPracticeSessionSideRail';
import ExamPracticeSideRailTop from '@/components/exam/ExamPracticeSideRailTop';
import ExamStudyNotesSidebar from '@/components/exam/ExamStudyNotesSidebar';
import ReadingPracticeChrome from '@/components/exam/ReadingPracticeChrome';
import AdminExamPartPromptBox from '@/components/admin/AdminExamPartPromptBox';
import { ReadingPracticeSessionProvider, useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import B2ListeningInlineGapPassage from '@/components/b2/B2ListeningInlineGapPassage';
import ExamListeningAudioPlayer from '@/components/b2/ExamListeningAudioPlayer';
import {
  B2_EXAM1_PART12_MATCHING_POOL,
  getB2Exam1ListeningPartUx,
  getB2Exam1Part10Situation,
} from '@/data/b2Exam1ListeningMeta';
import {
  buildMcqGroupsFromEnunciado,
  describeA2PartDataGap,
  mergeA2McqPrompts,
  parseA2QuestionsFromEnunciado,
  parseA2Part2Directions,
  parseA2Part2ProfileNames,
} from '@/utils/a2ExamMatching';
import {
  buildPart1GroupsFromPackItems,
  mergeA2Part1Groups,
  parseA2Part1Pack,
} from '@/utils/a2Part1Parser';
import {
  A2_OFFICIAL_PART1_DEMO,
  getA2OfficialPart1DemoRespuestas,
  isA2Part1DemoEmpty,
} from '@/data/a2OfficialPart1Demo';
import A2Part1ExamShell from '@/components/a2/A2Part1ExamShell';
import A2Part2ExamShell from '@/components/a2/A2Part2ExamShell';
import {
  A2_OFFICIAL_PART2_DEMO,
  buildA2Part2GroupsFromDemoItems,
  isA2Part2DemoEmpty,
} from '@/data/a2OfficialPart2Demo';
import A2Part3ExamShell from '@/components/a2/A2Part3ExamShell';
import {
  A2_OFFICIAL_PART3_DEMO,
  buildA2Part3GroupsFromDemoItems,
  isA2Part3DemoEmpty,
} from '@/data/a2OfficialPart3Demo';
import A2Part4ExamShell from '@/components/a2/A2Part4ExamShell';
import {
  A2_OFFICIAL_PART4_DEMO,
  buildA2Part4GroupsFromDemoItems,
  isA2Part4DemoEmpty,
} from '@/data/a2OfficialPart4Demo';
import A2Part5ExamShell from '@/components/a2/A2Part5ExamShell';
import { A2_OFFICIAL_PART5_DEMO } from '@/data/a2OfficialPart5Demo';
import A2Part8ExamShell from '@/components/a2/A2Part8ExamShell';
import {
  A2_OFFICIAL_PART8_DEMO,
  buildA2Part8GroupsFromDemoItems,
  isA2Part8DemoEmpty,
} from '@/data/a2OfficialPart8Demo';
import A2Part9ExamShell from '@/components/a2/A2Part9ExamShell';
import { A2_OFFICIAL_PART9_DEMO } from '@/data/a2OfficialPart9Demo';
import A2Part10ExamShell from '@/components/a2/A2Part10ExamShell';
import {
  A2_OFFICIAL_PART10_DEMO,
  buildA2Part10GroupsFromDemoItems,
  isA2Part10DemoEmpty,
} from '@/data/a2OfficialPart10Demo';
import A2Part11ExamShell from '@/components/a2/A2Part11ExamShell';
import {
  A2_OFFICIAL_PART11_DEMO,
  buildA2Part11GroupsFromDemoItems,
  isA2Part11DemoEmpty,
} from '@/data/a2OfficialPart11Demo';
import A2Part12ExamShell from '@/components/a2/A2Part12ExamShell';
import { A2_OFFICIAL_PART12_DEMO } from '@/data/a2OfficialPart12Demo';
import A2Part13ExamShell from '@/components/a2/A2Part13ExamShell';
import { A2_OFFICIAL_PART13_DEMO } from '@/data/a2OfficialPart13Demo';
import A2Part14ExamShell from '@/components/a2/A2Part14ExamShell';
import { A2_OFFICIAL_PART14_DEMO } from '@/data/a2OfficialPart14Demo';
import { A2WritingTaskCard } from '@/components/a2/A2WritingTaskCard';
import {
  getA2WritingDemoByPart,
  buildA2WritingInstructionsText,
} from '@/data/a2OfficialPart6Demo';
import { parseA2Part3Directions, parseA2Part3Passage } from '@/utils/a2Part3Parser';
import {
  A2McqFeedback,
  A2McqOptionButtons,
  A2ListeningPictureMcq,
} from '@/components/a2/A2ExamReadingUi';
import {
  getFormattedEnunciado,
  omitPartTitleBlocks,
  remapSectionPartNumbersInEnunciadoBlocks,
  remapSectionPartNumbersInText,
  getGroupedAnswers,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
  splitEnunciadoAndTextFallback,
  extractFirstAudioUrl,
  isStandaloneAudioLine,
  isUsableQuestionAudioUrl,
  composeMcqClozeDirections,
  buildPart1McqGroups,
  shouldUseSkillUoeExampleLayout,
  resolveMcqGap0DisplayWord,
  resolvePart1ExampleBlock,
} from '@/utils/b2ExamPaperShared';
import {
  getSessionUserId,
  mergeLevelsEstadisticas,
  recordLevelsAnswerEvaluation,
} from '@/utils/levelsEstadisticas';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { getCachedLevelBySlug } from '@/utils/levelsLevelCache';
import {
  useLevelsExamAdminFlow,
  reloadExamNamesBySlot,
  createAdminExamSelectHandler,
  buildExamSlotPickerProps,
} from '@/hooks/useLevelsExamAdminFlow';
import { useLevelsExamRegenerationListener } from '@/hooks/useLevelsExamRegenerationListener';
import { createLevelsExamCatalogUpdatedHandler } from '@/utils/levelsExamRegenerationSync';
import { invalidateLevelsPracticeCache } from '@/hooks/useLevelsPracticeData';
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
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
import { formatLevelsPartDisplayName, getExamSectionPartTitle, getSkillPartPracticeTitle, formatSkillPartPracticeTitle } from '@/utils/formatLevelsPartDisplayName';
import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';
import { SkillPartExerciseFavorite } from '@/components/exam/ExerciseFavoriteButton';
import { buildExerciseFavoriteMeta } from '@/lib/exerciseFavoriteMeta';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeSectionDraftControls } from '@/hooks/useExamModeSectionDraftControls';
import {
  applyReadingStyleSectionDraft,
  buildExamModeSectionDraft,
  buildSelectedQuestionByPartFromDrafts,
  cloneExamModeDraftByPart,
  EXAM_MODE_SECTION_DRAFT_VERSION,
  getExamModeDraftByPartFromSection,
  mergeExamModeDraftSources,
  resolveInitialExamPartSelection,
} from '@/utils/examModeSectionDraft';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import { scoreExamModeDrafts } from '@/utils/examModeGradeAnswers';
import { buildExamModeContinueModuleHref } from '@/utils/buildExamModeContinueModuleHref';
import { buildExamModeFinishPayload } from '@/utils/examModePartRepeat';
import { finishExamModeSupabasePersistence } from '@/utils/finishExamModeSupabasePersistence';
import {
  resolveExamPracticeMode,
  isExamSimulationMode,
  isPartPracticeMode,
  getExamChromeTitle,
  getExamChromeSubtitle,
} from '@/lib/examPracticeMode';
import {
  getB2ListeningCambridgePartLabel,
  getB2ListeningStrategyPack,
} from '@/data/b2ListeningPracticeStrategies';
import { resolvePracticeScoreSourceFromExamModeParam } from '@/utils/levelsScoreSource';

const B2WritingLongFormAiPanel = dynamic(
  () => import('@/components/b2/B2WritingLongFormAiPanel'),
  { ssr: false, loading: () => <p className="loading">Loading feedback…</p> },
);

/** @param {string} url */
function resolvePublicOrSiteAudioSrc(url, cacheKey = '') {
  const u = String(url || '').trim();
  if (!u) return '';
  let out = u;
  if (!/^https?:\/\//i.test(u)) {
    const bp = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    out = `${bp}${path}`;
  }
  if (cacheKey && /^https?:\/\//i.test(out)) {
    const sep = out.includes('?') ? '&' : '?';
    out = `${out}${sep}cb=${encodeURIComponent(String(cacheKey))}`;
  }
  return out;
}

/** @param {Array<{ orden?: unknown, url?: string, id?: string, titulo?: string }>} clips */
function pickListeningClipForQuestion(clips, questionNumber, partNumber = 0) {
  if (!Array.isArray(clips) || clips.length === 0 || !Number.isFinite(questionNumber)) return null;
  const lookupKeys = [questionNumber];
  if (partNumber === 12 && questionNumber >= 19 && questionNumber <= 23) {
    lookupKeys.unshift(questionNumber - 18);
  }
  if (partNumber === 13 && questionNumber >= 24 && questionNumber <= 30) {
    lookupKeys.unshift(questionNumber - 23);
  }
  for (const key of lookupKeys) {
    const byOrden = clips.find((c) => Number(c.orden) === key);
    if (byOrden) return byOrden;
  }
  // Parte 13 con varios clips: orden 1–7 ↔ preguntas 24–30 (un clip por ítem).
  // Si hay un solo clip, la UI usa listeningMonologueClip arriba (no por ítem).
  if (clips.length === 1 && partNumber !== 13) return clips[0];
  const idx =
    partNumber === 12 && questionNumber >= 19 && questionNumber <= 23
      ? questionNumber - 19
      : partNumber === 13 && questionNumber >= 24 && questionNumber <= 30
        ? questionNumber - 24
        : questionNumber - 1;
  return clips[idx] || null;
}

function getListeningMcqOptionClassName({ isSelected, showCorrect, showIncorrect }) {
  const parts = ['levels-listening-mcq-option'];
  if (showCorrect) parts.push('levels-listening-mcq-option--correct');
  else if (showIncorrect) parts.push('levels-listening-mcq-option--incorrect');
  else if (isSelected) parts.push('levels-listening-mcq-option--selected');
  return parts.join(' ');
}

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

/**
 * @param {object} props
 * @param {string} props.title
 * @param {number} props.partMin
 * @param {number} props.partMax
 * @param {string} props.subtitle
 * @param {string} props.emptyErrorMessage
 * @param {string} props.loadingLabel
 * @param {string} props.refreshLabel
 * @param {boolean} [props.preferOpenInputs]
 * @param {boolean} [props.showAudioFromEnunciado]
 * @param {boolean} [props.longFormWritingWithAi] — partes 8–9: cuadro largo + IA (estilo C1 exam writing)
 * @param {number} [props.writingWordMin]
 * @param {number} [props.writingWordMax]
 * @param {'en'|'es'} [props.lang]
 * @param {string} [props.slug] — a2, b2, …
 */
function B2ExamPaperPracticePageInner({
  slug = 'b2',
  skillRoute = null,
  title,
  partMin,
  partMax,
  subtitle,
  emptyErrorMessage,
  loadingLabel,
  refreshLabel,
  preferOpenInputs = false,
  showAudioFromEnunciado = false,
  longFormWritingWithAi = false,
  writingWordMin = 140,
  writingWordMax = 190,
  lang = 'en',
}) {
  const levelSlug = String(slug || 'b2').toLowerCase();
  const levelTag = levelSlug.toUpperCase();
  const searchParams = useSearchParams();
  const scoreSource = resolvePracticeScoreSourceFromExamModeParam(searchParams.get('examMode'));
  const b2Slot = useB2ExamPracticeSlot();
  const levelSlot = useLevelExamPracticeSlot(levelSlug);
  const examSlot = levelSlug === 'b2' ? b2Slot.examSlot : levelSlot.examSlot;
  const selectExamSlot = levelSlug === 'b2' ? b2Slot.selectExamSlot : levelSlot.selectExamSlot;
  const b2Scoring = useB2ExamScoringSession({ partMin, partMax, scoreSource });
  const levelScoring = useLevelExamScoringSession({ slug: levelSlug, partMin, partMax, scoreSource });
  const scoring = levelSlug === 'b2' ? b2Scoring : levelScoring;
  const reloadExamCatalog =
    levelSlug === 'b2' ? undefined : levelScoring.reloadExamCatalog;
  const examMode = useExamModeStrict({
    slug: levelSlug,
    partMin,
    partMax,
    sectionTitle: title,
  });
  const {
    examModeActive,
    reviewMode,
    hideFeedback,
    hidePracticeChecks,
    section: examSection,
    handleFinishSection,
    setSectionRemaining,
    getSectionRemaining,
    saveSectionDraft,
    applyExamContentSync,
    hubHref,
    resultsHref,
    sectionKey: examSectionKey,
  } = examMode;
  const examDraftRef = useRef({});
  const prevExamPartRef = useRef(null);
  const examPartMetaRef = useRef({});
  const reviewDraftHydratedRef = useRef(false);
  const examContextRef = useRef({ reviewMode: false, examModeActive: false, examSection: null });
  examContextRef.current = { reviewMode, examModeActive, examSection };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedQuestionByPart, setSelectedQuestionByPart] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [openInputs, setOpenInputs] = useState({});
  const [openChecks, setOpenChecks] = useState({});
  /** @type {Record<string, { loading?: boolean, error?: string | null, text?: string | null }>} */
  const [aiHintsByKey, setAiHintsByKey] = useState({});
  /** Mensaje si la consulta a `levels_preguntas_audios` falla (p. ej. RLS). */
  const [preguntaAudiosError, setPreguntaAudiosError] = useState('');
  const [writingLiveCorrect, setWritingLiveCorrect] = useState(null);
  const [examLabelsBySlot, setExamLabelsBySlot] = useState({});

  useEffect(() => {
    void reloadExamNamesBySlot(levelSlug).then(({ names }) => setExamLabelsBySlot(names));
  }, [levelSlug, scoring.examenIdBySlot]);

  const mountedRef = useRef(true);
  const partsDataRef = useRef([]);
  const selectedPartIdRef = useRef(null);
  const selectedQuestionByPartRef = useRef({});
  const loadedPartsRangeRef = useRef('');
  /** Estructura de partes (sin preguntas) para reutilizar al cambiar de examen. */
  const partsShellRef = useRef([]);

  const loadData = useCallback(async (slotOverride) => {
    const targetSlot = slotOverride ?? examSlot;
    setLoading(true);
    setError('');
    const { reviewMode: isReview, examModeActive: isExam } = examContextRef.current;
    if (!isReview && !isExam) {
      setSelectedOptions({});
      setCheckedQuestions({});
      setOpenInputs({});
      setOpenChecks({});
      setAiHintsByKey({});
    }
    setPreguntaAudiosError('');

    const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';
    const partsRangeKey = `${partMin}-${partMax}`;
    const reusePartsShell =
      loadedPartsRangeRef.current === partsRangeKey && partsShellRef.current.length > 0;

    try {
      const { data: levelData, error: levelError } = await getCachedLevelBySlug(supabase, levelSlug);

      if (levelError || !levelData) {
        throw new Error(`No se pudo obtener el nivel ${levelTag}.`);
      }

      const partNames = Array.from(
        { length: Math.max(0, partMax - partMin + 1) },
        (_, i) => `Parte ${partMin + i} ${levelTag}`,
      );

      /** @type {Record<string, object>} */
      let partsById = {};
      /** @type {Array<{ id: string, nombre: string, descripcion: string, questions: unknown[] }>} */
      let baseParts;

      if (reusePartsShell) {
        baseParts = partsShellRef.current.map((part) => ({
          id: part.id,
          nombre: part.nombre,
          descripcion: part.descripcion,
          questions: [],
        }));
        partsById = baseParts.reduce((acc, part) => {
          acc[part.id] = { id: part.id, nombre_parte: part.nombre };
          return acc;
        }, {});
      } else {
        const { data: partsTableData, error: partsError } = await supabase
          .from('levels_partes')
          .select('*')
          .in('nombre_parte', partNames);

        if (partsError) throw new Error('No se pudieron obtener las partes.');

        const partsByName = (partsTableData || []).reduce((acc, part) => {
          acc[part.nombre_parte] = part;
          return acc;
        }, {});

        partsById = (partsTableData || []).reduce((acc, part) => {
          acc[part.id] = part;
          return acc;
        }, {});

        baseParts = partNames
          .map((name) => partsByName[name])
          .filter(Boolean)
          .map((part) => ({
            id: part.id,
            nombre: formatLevelsPartDisplayName(part?.nombre_parte || 'Parte sin nombre'),
            descripcion: partDescription(part),
            questions: [],
          }));

        loadedPartsRangeRef.current = partsRangeKey;
        partsShellRef.current = baseParts.map(({ id, nombre, descripcion }) => ({
          id,
          nombre,
          descripcion,
        }));
      }

      // 2) Intentamos cargar preguntas + respuestas. Si falla, seguimos con
      //    las partes "vacías" para mostrar al menos los enunciados.
      let questionsData = [];
      let answersByQuestion = {};
      let openAnswersByQuestion = {};
      /** @type {Record<string, Array<{ id: string, url: string, titulo: string, orden: unknown }>>} */
      let audioClipsByPreguntaId = {};

      try {
        const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
          slot: targetSlot,
        });
        if (examResolveError || !examenId) {
          throw new Error(
            examResolveError?.message ||
              examResolveError?.details ||
              `Examen de ${levelTag} no resuelto. Si eres admin, genera el examen desde el selector.`,
          );
        }

        if (mountedRef.current) {
          scoring.setExamenContext(examenId);
        }

        const { data: rawQuestions, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
          examenId,
          levelId: levelData.id,
        });
        if (questionsError) throw questionsError;

        questionsData = rawQuestions || [];

        if (questionsData.length > 0) {
          const questionIds = questionsData.map((q) => q.id);

          const fetchAudiosWithRetry = async () => {
            const maxAudioAttempts = 3;
            for (let attempt = 1; attempt <= maxAudioAttempts; attempt += 1) {
              const res = await supabase
                .from('levels_preguntas_audios')
                .select('id, pregunta_id, audio_url, orden, titulo')
                .in('pregunta_id', questionIds);
              if (!res.error) return res;
              const errText = `${res.error.message || ''} ${res.error.details || ''}`;
              if (!/schema cache|pgrst205/i.test(errText) || attempt === maxAudioAttempts) {
                return res;
              }
              await new Promise((r) => setTimeout(r, 250 * attempt));
            }
            return { data: null, error: null };
          };

          const [audioRes, answersRes, openAnswersRes] = await Promise.all([
            fetchAudiosWithRetry(),
            supabase
              .from('levels_respuestas')
              .select('id, pregunta_id, respuesta, correcta')
              .in('pregunta_id', questionIds),
            supabase
              .from('levels_respuestas_abiertas')
              .select('id, pregunta_id_abierta, respuesta_texto, grading_metadata')
              .in('pregunta_id_abierta', questionIds),
          ]);

          if (audioRes.error) {
            const msg = audioRes.error.message || audioRes.error.details || String(audioRes.error);
            console.warn('No se pudieron obtener audios (levels_preguntas_audios):', audioRes.error);
            if (mountedRef.current) setPreguntaAudiosError(msg);
          } else if (mountedRef.current) {
            setPreguntaAudiosError('');
            const sorted = [...(audioRes.data || [])].sort((a, b) => {
              if (a.pregunta_id !== b.pregunta_id) {
                return String(a.pregunta_id).localeCompare(String(b.pregunta_id));
              }
              const ao = a.orden == null || a.orden === '' ? 9999 : Number(a.orden);
              const bo = b.orden == null || b.orden === '' ? 9999 : Number(b.orden);
              if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo;
              return Number(a.id) - Number(b.id);
            });
            audioClipsByPreguntaId = {};
            for (const row of sorted) {
              const pid = row.pregunta_id;
              const raw = String(row.audio_url || '').trim();
              if (!pid || !raw) continue;
              if (!audioClipsByPreguntaId[pid]) audioClipsByPreguntaId[pid] = [];
              audioClipsByPreguntaId[pid].push({
                id: String(row.id),
                url: raw,
                titulo: String(row.titulo || '').trim(),
                orden: row.orden,
              });
            }
          }

          if (answersRes.error) throw answersRes.error;

          if (openAnswersRes.error) {
            console.warn('No se pudieron obtener respuestas abiertas:', openAnswersRes.error);
          }

          answersByQuestion = (answersRes.data || []).reduce((acc, a) => {
            if (!acc[a.pregunta_id]) acc[a.pregunta_id] = [];
            acc[a.pregunta_id].push(a);
            return acc;
          }, {});

          openAnswersByQuestion = (openAnswersRes.data || []).reduce((acc, a) => {
            if (!acc[a.pregunta_id_abierta]) acc[a.pregunta_id_abierta] = [];
            acc[a.pregunta_id_abierta].push(a);
            return acc;
          }, {});
        }
      } catch (innerErr) {
        console.warn(
          'No se pudieron cargar preguntas (se mostrarán solo los enunciados):',
          innerErr?.message || innerErr,
        );
      }

      // 3) Inyectamos las preguntas en cada parte del rango.
      const partsIndex = baseParts.reduce((acc, part) => {
        acc[part.id] = part;
        return acc;
      }, {});

      questionsData.forEach((question) => {
        const tablePart = partsById[question.parte_id];
        if (!tablePart) return;
        const target = partsIndex[question.parte_id];
        if (!target) return;
        const clips = audioClipsByPreguntaId[question.id] || [];
        target.questions.push({
          preguntaId: question.id,
          enunciado: question.enunciado || 'Pregunta sin enunciado',
          respuestas: answersByQuestion[question.id] || [],
          respuestasAbiertas: openAnswersByQuestion[question.id] || [],
          audioClipsDb: clips,
          audioUrlDb: clips[0]?.url || '',
        });
      });

      const normalizedParts = baseParts.sort((a, b) => {
        const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
        const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
        return aNumber - bNumber;
      });

      if (!normalizedParts.length) {
        throw new Error(
          `No hay partes definidas en Supabase para el rango ${partMin}-${partMax}. ` +
            `Comprueba la tabla levels_partes.`,
        );
      }

      if (!mountedRef.current) return;

      const prevParts = partsDataRef.current;
      const prevPartId = selectedPartIdRef.current;
      const { examModeActive: isExam, reviewMode: isReview } = examContextRef.current;
      const preservedPartId = resolvePartIdAfterExamReload(normalizedParts, prevPartId, prevParts);
      const preservedQuestions =
        !isExam && !isReview
          ? buildQuestionSelectionAfterExamReload(
              normalizedParts,
              selectedQuestionByPartRef.current,
            )
          : {};

      if (typeof applyExamContentSync === 'function') {
        applyExamContentSync(normalizedParts, examDraftRef);
      }

      const { examSection: section } = examContextRef.current;
      const savedByPart = getExamModeDraftByPartFromSection(section);
      if (Object.keys(savedByPart).length > 0) {
        examDraftRef.current = { ...savedByPart };
      }

      setPartsData(normalizedParts);
      partsDataRef.current = normalizedParts;

      const urlPart = Number(searchParams.get('part'));
      const urlPartTarget =
        Number.isFinite(urlPart) && urlPart > 0
          ? normalizedParts.find(
              (p) => Number(p.nombre.match(/\d+/)?.[0] || 0) === urlPart,
            )
          : null;

      const draftQuestionSelection = buildSelectedQuestionByPartFromDrafts(
        savedByPart,
        normalizedParts,
      );
      const draftPartSelection = resolveInitialExamPartSelection(normalizedParts, {
        version: EXAM_MODE_SECTION_DRAFT_VERSION,
        draftByPart: savedByPart,
        selectedQuestionByPart: draftQuestionSelection,
        activePartNumber: urlPartTarget ? urlPart : null,
        activePartId: urlPartTarget?.id ?? null,
      });

      const nextPartId =
        urlPartTarget?.id ||
        draftPartSelection?.selectedPartId ||
        preservedPartId ||
        normalizedParts[0]?.id ||
        null;
      setSelectedPartId(nextPartId);
      selectedPartIdRef.current = nextPartId;
      prevExamPartRef.current = null;
      const pickBestQuestion = (questions) => {
        if (!questions?.length) return null;
        return questions.reduce((best, q) => {
          const score =
            (q.respuestas?.length || 0) +
            (q.respuestasAbiertas?.length || 0) +
            (String(q.enunciado || '').length > 80 ? 1 : 0);
          const bestScore =
            (best.respuestas?.length || 0) +
            (best.respuestasAbiertas?.length || 0) +
            (String(best.enunciado || '').length > 80 ? 1 : 0);
          return score >= bestScore ? q : best;
        });
      };

      const initialQuestionSelection = normalizedParts.reduce((acc, part) => {
        const best = pickBestQuestion(part.questions);
        if (!best) return acc;
        acc[part.id] = best.preguntaId;
        return acc;
      }, {});
      const nextQuestionByPart = {
        ...initialQuestionSelection,
        ...preservedQuestions,
        ...draftQuestionSelection,
        ...(draftPartSelection?.selectedQuestionByPart || {}),
      };
      setSelectedQuestionByPart(nextQuestionByPart);
      selectedQuestionByPartRef.current = nextQuestionByPart;
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Error cargando datos.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [emptyErrorMessage, examSlot, partMax, partMin, levelSlug, levelTag, applyExamContentSync, searchParams]);

  useLevelsExamRegenerationListener({
    slug: levelSlug,
    examSlot,
    onRegenerated: loadData,
  });

  const adminFlow = useLevelsExamAdminFlow({
    slug: levelSlug,
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: createLevelsExamCatalogUpdatedHandler([
      () => {
        if (levelSlug === 'a2') return scoring.reloadExamCatalog?.();
        if (levelSlug === 'b2') return scoring.reloadExamenCatalog?.();
        return reloadExamCatalog?.();
      },
      loadData,
      () => reloadExamNamesBySlot(levelSlug).then(({ names }) => setExamLabelsBySlot(names)),
      async () => {
        const uid = await getSessionUserId();
        if (uid) invalidateLevelsPracticeCache(uid);
      },
    ]),
  });

  const beginExamSlotChange = useCallback(
    (slot) => {
      setLoading(true);
      scoring.handleSelectExam(selectExamSlot, slot);
      void loadData(slot);
    },
    [scoring, selectExamSlot, loadData],
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
    enabled: Boolean(skillRoute) && !examModeActive,
    slug: levelSlug,
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
  const hideFeedbackResolved = resolvePracticeHideFeedback({
    hideFeedback,
    showFeedback: readingSession.readingSettings.showFeedback,
    answersRevealed: readingSession.answersRevealed,
    respectInstantFeedbackToggle: isSkillPracticeSession,
  });
  const examModeParam = searchParams.get('examMode');
  /** Strict listening audio only in full exam simulation / review — not skill practice. */
  const examListeningAudioStrict =
    showAudioFromEnunciado &&
    !isSkillPracticeSession &&
    (examModeParam === '1' || examModeParam === 'review');
  const PracticeChrome = isSkillPracticeSession ? ReadingPracticeChrome : B2ExamPracticeChrome;

  useEffect(() => {
    readingSession.resetAnswersRevealed();
  }, [examSlot, selectedPartId, readingSession.resetAnswersRevealed]);

  useEffect(() => {
    const onInstantFeedbackChanged = (event) => {
      if (event?.detail?.showFeedback !== false) return;
      setCheckedQuestions({});
      setOpenChecks({});
      setAiHintsByKey({});
    };
    window.addEventListener('dralo-reading-instant-feedback-changed', onInstantFeedbackChanged);
    return () =>
      window.removeEventListener('dralo-reading-instant-feedback-changed', onInstantFeedbackChanged);
  }, []);

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
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData, skillNav.active, skillNav.practiceReady]);

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
    () => tabPartsData.find((part) => part.id === selectedPartId),
    [tabPartsData, selectedPartId],
  );

  const selectedQuestion = useMemo(() => {
    if (!selectedPart?.questions?.length) return null;
    const selectedQuestionId = selectedQuestionByPart[selectedPart.id];
    const byId = selectedPart.questions.find((q) => q.preguntaId === selectedQuestionId);
    if (byId) return byId;
    return selectedPart.questions.reduce((best, q) => {
      const score = (q.respuestas?.length || 0) + (q.respuestasAbiertas?.length || 0);
      const bestScore = (best.respuestas?.length || 0) + (best.respuestasAbiertas?.length || 0);
      return score >= bestScore ? q : best;
    });
  }, [selectedPart, selectedQuestionByPart]);

  useEffect(() => {
    const preguntaId = selectedQuestion?.preguntaId;
    const parteId = selectedPart?.id;
    if (!preguntaId || !parteId) return undefined;

    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) return;
      if (levelSlug === 'b2' && isB2RuoeV2SessionPersistenceBlocked(partNumber)) return;
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

  useEffect(() => {
    if (examModeActive && !reviewMode && selectedPart) {
      const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
      if (pn) {
        examPartMetaRef.current[pn] = {
          preguntaId: selectedQuestion?.preguntaId,
          parteId: selectedPart?.id,
        };
      }
    }
  }, [examModeActive, reviewMode, selectedPart?.id, selectedPart?.nombre, selectedQuestion?.preguntaId]);

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

    const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
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
    selectedPart?.nombre,
    selectedQuestion?.preguntaId,
  ]);

  useEffect(() => {
    if (reviewMode) return;

    if (!examModeActive && !reviewMode) {
      setOpenInputs({});
      setOpenChecks({});
      setSelectedOptions({});
      setCheckedQuestions({});
      setAiHintsByKey({});
      prevExamPartRef.current = null;
      return;
    }

    const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
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
      setAiHintsByKey({});
      prevExamPartRef.current = pn;
    }
  }, [selectedPart?.id, selectedPart?.nombre, examModeActive, reviewMode]);

  useEffect(() => {
    if (!examModeActive || reviewMode) return;
    const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
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
    selectedPart?.id,
    selectedPart?.nombre,
    selectedQuestion?.preguntaId,
    selectedOptions,
    openInputs,
    checkedQuestions,
  ]);

  const partNumber = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

  const handleKeepPracticing = useCallback(() => {
    runKeepPracticingSkillFlow({
      examSlot,
      examenIdBySlot: scoring.examenIdBySlot,
      partNumber,
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
  }, [examSlot, partNumber, scoring, handleSelectExamSlot, skillNav]);

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
      if (levelSlug === 'b2' && isB2RuoeV2SessionPersistenceBlocked(partNumber)) return;
      if (!selectedQuestion?.preguntaId || !selectedPart?.id || !partNumber) return;
      await categoryTimer.finalizeSession({
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        partNumber,
        examSlot,
        levelSlug,
        skillRoute: skillRoute || null,
        scoreSource,
        progress: progressOverride,
        sectionTitle: skillRoute ? getExamSkillSectionTitle(levelSlug, skillRoute) : null,
      });
    },
    [
      categoryTimer,
      levelSlug,
      partNumber,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      examSlot,
      skillRoute,
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
        levelSlug,
        skillRoute: skillRoute || null,
        scoreSource,
        sectionTitle: skillRoute ? getExamSkillSectionTitle(levelSlug, skillRoute) : null,
      });
    })();
  }, [
    categoryTimer,
    selectedQuestion?.preguntaId,
    selectedPart?.id,
    partNumber,
    examSlot,
    levelSlug,
    skillRoute,
    scoreSource,
  ]);

  useEffect(() => {
    return () => {
      void persistPartSessionTime();
    };
  }, [selectedPart?.id, selectedQuestion?.preguntaId, examSlot, partNumber, persistPartSessionTime]);

  const useSkillUoeExampleLayout = shouldUseSkillUoeExampleLayout({
    skillPractice: isSkillPracticeSession,
    examMode: examModeActive,
    partNumber,
  });

  const partScoringCfg = getLevelsPartScoring(levelSlug, partNumber);

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    scoring.resetPartNoticeOnPartChange(examSlot, partNumber, scoring.progressBySlot);
  }, [examSlot, partNumber, selectedPart?.id, scoring.examPracticeOpen]);

  /** Partes 8+ suelen llevar pasajes largos (writing / listening / speaking). */
  const shouldStickEnunciado = partNumber >= 8 && partNumber <= 17;

  const selectedPartContent = useMemo(() => {
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const fallback = splitEnunciadoAndTextFallback(rawPregunta);
    const textoExtracted = extractTextoBloque(rawPregunta, partNumber, { levelSlug }) || '';
    let texto = (textoExtracted || fallback.texto || '').trim();
    // A2 Reading Part 1: el estímulo va en cada ítem (A2Part1ExamView), no en el panel "Text".
    if (levelSlug === 'a2' && partNumber === 1) {
      texto = '';
    }
    let preguntasPart1Parse = [];
    if (levelSlug === 'b2' && partNumber === 1 && texto) {
      const split = splitPart1TextoYPreguntas(texto);
      texto = split.texto.trim();
      preguntasPart1Parse = parsePart1QuestionOptions(split.preguntas);
    }
    if (partNumber === 10) {
      texto = trimListeningPart10DuplicateCycles(texto);
    }
    const enunciado =
      levelSlug === 'b2' && partNumber === 1 && useSkillUoeExampleLayout
        ? composeMcqClozeDirections(desc, rawPregunta) || fallback.enunciado
        : desc || fallback.enunciado;
    return {
      enunciado,
      texto,
      preguntasPart1Parse,
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumber, levelSlug, useSkillUoeExampleLayout]);

  const contextSnippetForAi = useMemo(() => {
    const pack = [selectedPartContent.enunciado, selectedPartContent.texto].filter(Boolean).join('\n\n');
    return pack.slice(0, 5500);
  }, [selectedPartContent.enunciado, selectedPartContent.texto]);

  /** Clips válidos y ordenados (`orden` o posición) para listening con varios audios por pregunta. */
  const listeningReadyClips = useMemo(() => {
    if (!showAudioFromEnunciado || !Array.isArray(selectedQuestion?.audioClipsDb)) return [];
    return [...selectedQuestion.audioClipsDb]
      .filter((c) => c?.url && isUsableQuestionAudioUrl(String(c.url).trim()))
      .sort((a, b) => {
        const ao = a.orden == null || a.orden === '' ? 9999 : Number(a.orden);
        const bo = b.orden == null || b.orden === '' ? 9999 : Number(b.orden);
        if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo;
        return String(a.id || '').localeCompare(String(b.id || ''));
      });
  }, [showAudioFromEnunciado, selectedQuestion?.audioClipsDb]);

  const audioPlayersFromDb = useMemo(() => {
    if (!showAudioFromEnunciado) return [];
    return listeningReadyClips.map((c, idx) => ({
      key: String(c.id ?? `idx-${idx}`),
      src: resolvePublicOrSiteAudioSrc(c.url, c.id || `clip-${idx}`),
      label: c.titulo || `Audio ${idx + 1}`,
    }));
  }, [showAudioFromEnunciado, listeningReadyClips]);

  const textEnunciadoAudioUrl = useMemo(() => {
    if (!showAudioFromEnunciado) return '';
    const blob = [
      selectedQuestion?.enunciado,
      selectedPart?.descripcion,
      selectedPartContent.texto,
      selectedPartContent.enunciado,
    ]
      .filter(Boolean)
      .join('\n');
    return extractFirstAudioUrl(blob);
  }, [
    showAudioFromEnunciado,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
    selectedPartContent.texto,
    selectedPartContent.enunciado,
  ]);

  const resolvedTextEnunciadoAudioSrc = useMemo(
    () => resolvePublicOrSiteAudioSrc(textEnunciadoAudioUrl),
    [textEnunciadoAudioUrl],
  );

  const showEnunciadoFallbackAudio =
    showAudioFromEnunciado &&
    audioPlayersFromDb.length === 0 &&
    Boolean(String(textEnunciadoAudioUrl || '').trim());

  const hasDbClipsWithNoValidUrl = useMemo(() => {
    const raw = selectedQuestion?.audioClipsDb;
    if (!showAudioFromEnunciado) return false;
    if (!Array.isArray(raw) || raw.length === 0) return false;
    if (audioPlayersFromDb.length > 0) return false;
    if (showEnunciadoFallbackAudio) return false;
    return true;
  }, [
    showAudioFromEnunciado,
    selectedQuestion?.audioClipsDb,
    audioPlayersFromDb.length,
    showEnunciadoFallbackAudio,
  ]);

  const textoLinesForDisplay = useMemo(() => {
    const raw = selectedPartContent.texto || '';
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !isStandaloneAudioLine(line));
  }, [selectedPartContent.texto]);

  const getQuestionKey = (partId, questionNumber, fallbackKey = 'extra') =>
    `${partId}::${selectedQuestion?.preguntaId || 'sin-pregunta'}::${questionNumber ?? fallbackKey}`;

  const requestAiJustification = useCallback(
    (storageKey, payload) => {
      setAiHintsByKey((prev) => ({ ...prev, [storageKey]: { loading: true, error: null, text: null } }));
      const enriched = buildLevelsJustificationPayload({
        ...payload,
        preguntaId: payload.preguntaId || selectedQuestion?.preguntaId,
        level: levelTag,
        partNumber,
        partLabel: payload.partLabel || selectedPart?.nombre || '',
        exerciseType:
          payload.exerciseType ||
          payload.style ||
          (skillRoute === 'listening' ? 'listening' : undefined),
        questionText: payload.questionText || contextSnippetForAi,
        contextSnippet: contextSnippetForAi,
      });
      void (async () => {
        try {
          const text = await postLevelsAnswerJustification(enriched);
          setAiHintsByKey((prev) => ({
            ...prev,
            [storageKey]: { loading: false, error: null, text: text || '—' },
          }));
        } catch (e) {
          const msg = e?.message || 'Explanation temporarily unavailable.';
          setAiHintsByKey((prev) => ({
            ...prev,
            [storageKey]: { loading: false, error: msg, text: null },
          }));
        }
      })();
    },
    [
      contextSnippetForAi,
      selectedQuestion?.preguntaId,
      selectedPart?.nombre,
      levelTag,
      partNumber,
      skillRoute,
    ],
  );

  const groupedAnswers = useMemo(
    () => getGroupedAnswers(selectedQuestion?.respuestas || []),
    [selectedQuestion?.respuestas],
  );

  const a2ParsedQuestions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber > 12) return [];
    return parseA2QuestionsFromEnunciado(selectedQuestion?.enunciado || '');
  }, [levelSlug, partNumber, selectedQuestion?.enunciado]);

  const part1CorrectLetterByQuestion = useMemo(() => {
    const map = new Map();
    if (levelSlug !== 'b2' || partNumber !== 1) return map;
    for (const row of selectedQuestion?.respuestas || []) {
      if (row?.correcta !== true) continue;
      const t = String(row.respuesta || '').trim();
      const m = t.match(/^(\d{1,2})\s+([A-D])\b/i);
      if (m) map.set(Number(m[1]), m[2].toUpperCase());
    }
    return map;
  }, [levelSlug, partNumber, selectedQuestion?.preguntaId, selectedQuestion?.respuestas]);

  const b2Part1McqGroups = useMemo(() => {
    if (levelSlug !== 'b2' || partNumber !== 1) return null;
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
    levelSlug,
    partNumber,
    part1CorrectLetterByQuestion,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas,
    selectedPart?.descripcion,
    useSkillUoeExampleLayout,
  ]);

  const isB2Part1InlineMcq =
    levelSlug === 'b2' && partNumber === 1 && (b2Part1McqGroups?.length ?? 0) > 0;

  const exampleGap0Word = useMemo(() => {
    if (!useSkillUoeExampleLayout || levelSlug !== 'b2' || partNumber !== 1) return '';
    const mcqGroup0 = b2Part1McqGroups?.find((g) => g.questionNumber === 0) || null;
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const rawPregunta = selectedQuestion?.enunciado || '';
    return resolveMcqGap0DisplayWord({
      respuestas: selectedQuestion?.respuestas || [],
      respuestasAbiertas: selectedQuestion?.respuestasAbiertas || [],
      correctLetterByQuestion: part1CorrectLetterByQuestion,
      exampleBlock: resolvePart1ExampleBlock({
        parsed: selectedPartContent.preguntasPart1Parse || [],
        rawPregunta,
        descripcion: desc,
        respuestas: selectedQuestion?.respuestas || [],
        correctLetterByQuestion: part1CorrectLetterByQuestion,
      }),
      mcqGroup0,
      rawPregunta,
      descripcion: desc,
      parsed: selectedPartContent.preguntasPart1Parse || [],
      texto: selectedPartContent.texto || '',
    });
  }, [
    useSkillUoeExampleLayout,
    levelSlug,
    partNumber,
    b2Part1McqGroups,
    part1CorrectLetterByQuestion,
    selectedQuestion?.respuestas,
    selectedQuestion?.respuestasAbiertas,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
    selectedPartContent.preguntasPart1Parse,
    selectedPartContent.texto,
  ]);

  const effectiveMcqGroups = useMemo(() => {
    if (b2Part1McqGroups?.length) return b2Part1McqGroups;

    const base = groupedAnswers.filter((g) => g.questionNumber != null && g.options?.length >= 2);
    if (levelSlug !== 'a2') return base.length ? base : groupedAnswers;

    if (base.length >= 1) {
      return a2ParsedQuestions.length
        ? mergeA2McqPrompts(base, a2ParsedQuestions)
        : base;
    }

    const fromEnunciado = buildMcqGroupsFromEnunciado(
      selectedQuestion?.enunciado || '',
      selectedQuestion?.respuestas || [],
    );
    if (fromEnunciado.length) return fromEnunciado;

    return groupedAnswers;
  }, [
    b2Part1McqGroups,
    groupedAnswers,
    levelSlug,
    a2ParsedQuestions,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas,
  ]);

  const hasMcqStyle = useMemo(
    () => effectiveMcqGroups.some((g) => g.questionNumber != null && g.options.length >= 2),
    [effectiveMcqGroups],
  );

  const isA2ListeningGapPart = levelSlug === 'a2' && partNumber === 9;
  const isListeningGapPart = partNumber === 11 || isA2ListeningGapPart;
  const isB2ListeningMatchingPart = levelSlug === 'b2' && partNumber === 12;
  const isB2ListeningInterviewPart = levelSlug === 'b2' && partNumber === 13;
  const isB2ListeningPart10 = levelSlug === 'b2' && partNumber === 10;

  const b2Exam1ListeningUx = useMemo(
    () => (levelSlug === 'b2' ? getB2Exam1ListeningPartUx(partNumber, examSlot) : null),
    [levelSlug, partNumber, examSlot],
  );

  const listeningContextBlocks = useMemo(() => {
    if (isListeningGapPart) {
      return splitListeningOpenGapContextByQuestion(selectedQuestion?.enunciado || '');
    }
    if (isB2ListeningMatchingPart) {
      const blob = textoLinesForDisplay.length
        ? textoLinesForDisplay.join('\n')
        : selectedQuestion?.enunciado || '';
      return splitListeningSpeakerContextByQuestion(blob);
    }
    if (isB2ListeningInterviewPart) {
      const blob = textoLinesForDisplay.length
        ? textoLinesForDisplay
        : String(selectedQuestion?.enunciado || '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
      return splitListeningMcqContextByQuestion(blob, { stripInlineOptions: true });
    }
    return splitListeningMcqContextByQuestion(textoLinesForDisplay);
  }, [
    isListeningGapPart,
    isB2ListeningMatchingPart,
    isB2ListeningInterviewPart,
    textoLinesForDisplay,
    selectedQuestion?.enunciado,
  ]);

  const listeningGapPassageLines = useMemo(() => {
    if (!isListeningGapPart) return [];
    return buildListeningGapPassageLines(selectedQuestion?.enunciado || '');
  }, [isListeningGapPart, selectedQuestion?.enunciado]);

  const listeningMatchingPool = useMemo(() => {
    if (!isB2ListeningMatchingPart) return [];
    const blob = textoLinesForDisplay.length
      ? textoLinesForDisplay
      : String(selectedQuestion?.enunciado || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
    return extractListeningMatchingOptionPool(blob);
  }, [isB2ListeningMatchingPart, textoLinesForDisplay, selectedQuestion?.enunciado]);

  const listeningMatchingSelectOptions = useMemo(() => {
    if (!isB2ListeningMatchingPart) return [];
    if (examSlot === 1 && levelSlug === 'b2') return B2_EXAM1_PART12_MATCHING_POOL;
    return listeningMatchingPool
      .map((line) => {
        const m = String(line).match(/^([A-H])\)\s*(.+)$/i);
        if (!m) return null;
        return { letter: m[1].toUpperCase(), text: m[2].trim() };
      })
      .filter(Boolean);
  }, [isB2ListeningMatchingPart, examSlot, levelSlug, listeningMatchingPool]);

  const inferredOpenQuestionNumbers = useMemo(
    () => inferOpenQuestionNumbersFromPrompt(selectedQuestion?.enunciado || '', partNumber),
    [selectedQuestion?.enunciado, partNumber],
  );

  const openAnswerMap = useMemo(
    () =>
      getOpenAnswerMap(
        selectedQuestion?.respuestasAbiertas || [],
        selectedQuestion?.respuestas || [],
        inferredOpenQuestionNumbers,
      ),
    [
      selectedQuestion?.respuestasAbiertas,
      selectedQuestion?.respuestas,
      inferredOpenQuestionNumbers,
    ],
  );

  const handleListeningGapCheck = useCallback(
    (qn, questionKey, currentValue) => {
      const expectedAnswers = openAnswerMap.get(qn) || new Set();
      const isCorrect = expectedAnswers.has(normalizeText(currentValue));
      const prevResult = openChecks[questionKey];
      setOpenChecks((prev) => ({ ...prev, [questionKey]: isCorrect }));
      if (typeof prevResult !== 'boolean') {
        const correctChoiceText = [...expectedAnswers].slice(0, 4).join(' · ') || 'respuesta modelo';
        const answersFromDatabase = [...expectedAnswers].join(' · ');
        requestAiJustification(questionKey, {
          partLabel: selectedPart?.nombre || '',
          questionLabel: `Question ${qn}`,
          questionNumber: qn,
          ...resolveCorrectAnswerRowIds(
            selectedQuestion?.respuestasAbiertas,
            selectedQuestion?.respuestas,
            qn,
          ),
          style: 'listening-gap',
          userChoiceText: currentValue,
          correctChoiceText,
          isCorrect,
          answersFromDatabase: answersFromDatabase || undefined,
        });
        void (async () => {
          const uid = await getSessionUserId();
          const pid = selectedQuestion?.preguntaId;
          const parteId = selectedPart?.id;
          if (!uid || !pid || !parteId) return;
          const { error } = await recordLevelsAnswerEvaluation({
            userId: uid,
            preguntaId: pid,
            parteId,
            isCorrect,
            slotLabel: `Question ${qn}`,
            userAnswerText: currentValue,
          });
          if (error) {
            console.warn('levels eval/puntuacion:', error.message || error);
          }
        })();
      }
    },
    [
      openAnswerMap,
      openChecks,
      requestAiJustification,
      selectedPart?.id,
      selectedPart?.nombre,
      selectedQuestion?.preguntaId,
      selectedQuestion?.respuestasAbiertas,
      selectedQuestion?.respuestas,
    ],
  );

  /**
   * Los huecos a pintar se derivan del enunciado (marcadores `(N) ___` o números a inicio
   * de línea). Si la BD tiene respuestas para huecos que no figuran en el texto, se
   * descartan para evitar inputs huérfanos.
   */
  const openQuestionNumbers = useMemo(() => {
    const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
    const fromPrompt = inferredOpenQuestionNumbers;
    if (fromPrompt.length > 0) return fromPrompt;
    if (fromAnswers.length > 0) return fromAnswers;
    if ((selectedQuestion?.respuestasAbiertas?.length ?? 0) > 0) {
      return fromPrompt;
    }
    return [];
  }, [
    inferredOpenQuestionNumbers,
    openAnswerMap,
    selectedQuestion?.respuestasAbiertas,
  ]);

  useEffect(() => {
    if (!reviewMode || !selectedPart?.id || !openQuestionNumbers.length) return;

    const preguntaId = selectedQuestion?.preguntaId || 'sin-pregunta';
    setOpenChecks((prev) => {
      let changed = false;
      const next = { ...prev };
      openQuestionNumbers.forEach((questionNumber) => {
        const questionKey = `${selectedPart.id}::${preguntaId}::${questionNumber}`;
        const value = openInputs[questionKey];
        if (!String(value ?? '').trim()) return;
        if (typeof next[questionKey] === 'boolean') return;
        const expected = openAnswerMap.get(questionNumber) || new Set();
        next[questionKey] = expected.has(normalizeText(value));
        changed = true;
      });
      return changed ? next : prev;
    });
  }, [
    reviewMode,
    selectedPart?.id,
    selectedQuestion?.preguntaId,
    openQuestionNumbers,
    openInputs,
    openAnswerMap,
  ]);

  const hasOpenAnswerSlots = Boolean(
    !hasMcqStyle &&
      openQuestionNumbers.length > 0 &&
      (preferOpenInputs ||
        (showAudioFromEnunciado && isListeningGapPart) ||
        (levelSlug === 'a2' && partNumber === 5)),
  );

  const useListeningItemLayout = useMemo(() => {
    if (!showAudioFromEnunciado) return false;
    const itemPart =
      levelSlug === 'a2' ? isA2ListeningItemLayoutPart(partNumber) : isB2ListeningItemLayoutPart(partNumber);
    if (!itemPart) return false;

    if (isListeningGapPart) {
      return openQuestionNumbers.length > 0;
    }

    if (!hasMcqStyle) return false;
    const canParseItems =
      listeningContextBlocks.length >= 1 || groupedAnswers.some((g) => g.questionNumber != null);
    if (canParseItems) return true;

    const hasAudio = listeningReadyClips.length > 0 || showEnunciadoFallbackAudio;
    if (!hasAudio) return false;
    if (listeningContextBlocks.length >= 1) return true;
    return groupedAnswers.some((g) => g.questionNumber != null);
  }, [
    showAudioFromEnunciado,
    levelSlug,
    partNumber,
    isListeningGapPart,
    openQuestionNumbers.length,
    hasMcqStyle,
    groupedAnswers,
    listeningReadyClips.length,
    showEnunciadoFallbackAudio,
    listeningContextBlocks.length,
  ]);

  const listeningQuestionNumbersOrdered = useMemo(() => {
    const s = new Set();
    if (isListeningGapPart) {
      openQuestionNumbers.forEach((n) => s.add(n));
    }
    groupedAnswers.forEach((g) => {
      if (g.questionNumber != null) s.add(g.questionNumber);
    });
    listeningContextBlocks.forEach((b) => s.add(b.questionNumber));
    return [...s].sort((a, b) => a - b);
  }, [groupedAnswers, listeningContextBlocks, isListeningGapPart, openQuestionNumbers]);

  const [listeningSequentialAudio, setListeningSequentialAudio] = useState({
    activeKey: null,
    completedKeys: new Set(),
  });

  useEffect(() => {
    setListeningSequentialAudio({ activeKey: null, completedKeys: new Set() });
  }, [selectedPartId, selectedQuestion?.preguntaId, examSlot, partNumber]);

  const getListeningSequentialClipKey = useCallback(
    (questionNumber) => `listen-seq-${partNumber}-${questionNumber}`,
    [partNumber],
  );

  const resolveListeningSequentialLock = useCallback(
    (clipKey, questionIndex) => {
      if (!examListeningAudioStrict) return { locked: false, reason: null };
      const { activeKey, completedKeys } = listeningSequentialAudio;
      if (activeKey && activeKey !== clipKey) {
        return { locked: true, reason: 'other' };
      }
      if (questionIndex > 0) {
        const prevQn = listeningQuestionNumbersOrdered[questionIndex - 1];
        const prevKey = getListeningSequentialClipKey(prevQn);
        if (!completedKeys.has(prevKey)) {
          return { locked: true, reason: 'sequence' };
        }
      }
      return { locked: false, reason: null };
    },
    [
      examListeningAudioStrict,
      getListeningSequentialClipKey,
      listeningQuestionNumbersOrdered,
      listeningSequentialAudio,
    ],
  );

  const handleListeningPlaybackStart = useCallback((clipKey) => {
    setListeningSequentialAudio((prev) => ({ ...prev, activeKey: clipKey }));
  }, []);

  const handleListeningPlaybackEnd = useCallback((clipKey) => {
    setListeningSequentialAudio((prev) => {
      const completedKeys = new Set(prev.completedKeys);
      completedKeys.add(clipKey);
      return {
        activeKey: prev.activeKey === clipKey ? null : prev.activeKey,
        completedKeys,
      };
    });
  }, []);

  /** Part 10 (extracts), Part 11 (gap-fill), Part 12 (matching), Part 13 (interview): one audio when a single clip is stored. */
  const listeningMonologueClip = useMemo(() => {
    if (listeningReadyClips.length === 0) return null;
    if (isListeningGapPart) return listeningReadyClips[0];
    if (isB2ListeningPart10 && listeningReadyClips.length === 1) return listeningReadyClips[0];
    if (isB2ListeningMatchingPart && listeningReadyClips.length === 1) return listeningReadyClips[0];
    if (isB2ListeningInterviewPart && listeningReadyClips.length === 1) return listeningReadyClips[0];
    return null;
  }, [
    isListeningGapPart,
    isB2ListeningPart10,
    isB2ListeningMatchingPart,
    isB2ListeningInterviewPart,
    listeningReadyClips,
  ]);

  const writingPartMin = levelSlug === 'a2' ? 6 : 8;
  const writingPartMax = levelSlug === 'a2' ? 7 : 9;

  /** Writing: long-form textarea + Dralo AI (A2 parts 6–7, B2 parts 8–9). */
  const isLongFormWritingPart = Boolean(
    longFormWritingWithAi &&
      partNumber >= writingPartMin &&
      partNumber <= writingPartMax &&
      selectedPart,
  );

  const showLongWritingWithAi = Boolean(
    isLongFormWritingPart && (selectedQuestion?.preguntaId || selectedPart?.id),
  );

  const longWritingStorageKey = showLongWritingWithAi
    ? `b2-exam-writing-${selectedQuestion?.preguntaId || selectedPart?.id || 'part'}`
    : '';

  const a2WritingDemo = useMemo(() => {
    if (levelSlug !== 'a2' || !isLongFormWritingPart) return null;
    const hasRealRowTask = String(selectedQuestion?.enunciado || '').trim().length > 20;
    if (hasRealRowTask) return null;
    return getA2WritingDemoByPart(partNumber);
  }, [levelSlug, isLongFormWritingPart, selectedQuestion?.enunciado, partNumber]);

  const a2WritingDemoInstructions = useMemo(
    () => (a2WritingDemo ? buildA2WritingInstructionsText(a2WritingDemo) : ''),
    [a2WritingDemo],
  );

  const isA2Part7Writing = levelSlug === 'a2' && partNumber === 7;
  const effectiveWritingWordMin =
    a2WritingDemo && Number.isFinite(a2WritingDemo.wordMin)
      ? a2WritingDemo.wordMin
      : isA2Part7Writing
        ? 35
        : writingWordMin;
  const effectiveWritingWordMax =
    a2WritingDemo && Number.isFinite(a2WritingDemo.wordMax)
      ? a2WritingDemo.wordMax
      : isA2Part7Writing
        ? 100
        : writingWordMax;

  /** Writing: inputs abiertos; en Listening parte 11 van en el layout por ítems. */
  const useOpenInputUi = Boolean(
    hasOpenAnswerSlots && !useListeningItemLayout && !isLongFormWritingPart,
  );

  const paperOpenSidePanelExplanationEntries = useMemo(
    () => {
      if (
        hideFeedbackResolved ||
        !useOpenInputUi ||
        isB2Part1InlineMcq ||
        isListeningGapPart ||
        !openQuestionNumbers.length
      ) {
        return [];
      }
      return buildOpenClozeExplanationEntries({
        activeQuestionNumbers: openQuestionNumbers,
        getQuestionKey: (questionNumber) =>
          getQuestionKey(selectedPart?.id, questionNumber, 'open'),
        openInputs,
        openChecks,
        openAnswerMap,
      });
    },
    [
      hideFeedbackResolved,
      useOpenInputUi,
      isB2Part1InlineMcq,
      isListeningGapPart,
      openQuestionNumbers,
      selectedPart?.id,
      openInputs,
      openChecks,
      openAnswerMap,
    ],
  );

  const paperMcqSidePanelExplanationEntries = useMemo(
    () => {
      if (hideFeedbackResolved || isB2Part1InlineMcq) return [];
      return buildMcqGroupExplanationEntries({
        mcqGroups: effectiveMcqGroups,
        getQuestionKey: (questionNumber, _group, groupIndex) =>
          getQuestionKey(selectedPart?.id, questionNumber, `extra-${groupIndex}`),
        selectedOptions,
        checkedQuestions,
      });
    },
    [
      hideFeedbackResolved,
      isB2Part1InlineMcq,
      effectiveMcqGroups,
      selectedPart?.id,
      selectedOptions,
      checkedQuestions,
    ],
  );

  const listeningPracticeExplanationEntries = useMemo(() => {
    if (!useListeningItemLayout || hideFeedbackResolved) return [];
    const entries = [];
    for (const qn of listeningQuestionNumbersOrdered) {
      if (isListeningGapPart) {
        const questionKey = getQuestionKey(selectedPart?.id, qn, 'open');
        const checkResult = openChecks[questionKey];
        if (typeof checkResult !== 'boolean') continue;
        const expected = openAnswerMap.get(qn);
        const expectedList = expected && expected.size > 0 ? [...expected] : [];
        entries.push({
          questionNumber: qn,
          questionKey,
          isCorrect: checkResult,
          userAnswer: String(openInputs[questionKey] || '').trim(),
          correctAnswer: expectedList.length > 0 ? expectedList.join(' · ') : undefined,
        });
        continue;
      }
      const group = groupedAnswers.find((g) => g.questionNumber === qn);
      if (!group?.options?.length) continue;
      const groupIndex = groupedAnswers.indexOf(group);
      const questionKey = getQuestionKey(selectedPart?.id, qn, `extra-${groupIndex}`);
      if (!checkedQuestions[questionKey]) continue;
      const rawMatchingSelection = selectedOptions[questionKey];
      const selectedLetter = /^[A-H]$/i.test(String(rawMatchingSelection || ''))
        ? String(rawMatchingSelection).toUpperCase()
        : extractMcqOptionLetter(
            group.options.find((o) => rawMatchingSelection === o.id) || {},
          ) || '';
      const correctOpt = group.options.find((o) => o.correcta) || group.options[0];
      const correctLetter = extractMcqOptionLetter(correctOpt || {});
      const selectedOpt = group.options.find((o) => selectedOptions[questionKey] === o.id);
      const isCorrectAnswer =
        isB2ListeningMatchingPart && /^[A-H]$/.test(selectedLetter)
          ? selectedLetter === correctLetter
          : !!selectedOpt?.correcta;
      const poolLine = listeningMatchingSelectOptions.find((o) => o.letter === selectedLetter);
      const correctPoolLine = listeningMatchingSelectOptions.find((o) => o.letter === correctLetter);
      const userAnswer =
        isB2ListeningMatchingPart && poolLine
          ? `${poolLine.letter} — ${poolLine.text}`
          : selectedOpt?.formattedText || selectedOpt?.respuesta || selectedLetter;
      const correctAnswer =
        isB2ListeningMatchingPart && correctPoolLine
          ? `${correctPoolLine.letter} — ${correctPoolLine.text}`
          : correctOpt?.formattedText || correctOpt?.respuesta || correctLetter;
      entries.push({
        questionNumber: qn,
        questionKey,
        group,
        isCorrect: isCorrectAnswer,
        userAnswer,
        correctAnswer: isCorrectAnswer ? undefined : correctAnswer,
      });
    }
    return entries;
  }, [
    useListeningItemLayout,
    hideFeedbackResolved,
    listeningQuestionNumbersOrdered,
    isListeningGapPart,
    selectedPart?.id,
    openChecks,
    openInputs,
    openAnswerMap,
    groupedAnswers,
    checkedQuestions,
    selectedOptions,
    isB2ListeningMatchingPart,
    listeningMatchingSelectOptions,
  ]);

  const partScoreMetrics = useMemo(
    () =>
      levelSlug === 'b2' && partNumber >= 1 && partNumber <= 7
        ? computeB2PartScoreMetrics({
            partNumber,
            useOpenInputUi: hasOpenAnswerSlots,
            openQuestionNumbers,
            openChecks,
            groupedAnswers: effectiveMcqGroups,
            checkedQuestions,
            selectedOptions,
            getQuestionKey,
            partId: selectedPart?.id,
          })
        : computeB2PartScoreMetrics({
            partNumber,
            scoringV2Enabled: false,
            useOpenInputUi: hasOpenAnswerSlots,
            openQuestionNumbers,
            openChecks,
            groupedAnswers: effectiveMcqGroups,
            checkedQuestions,
            selectedOptions,
            getQuestionKey,
            partId: selectedPart?.id,
          }),
    [
      levelSlug,
      partNumber,
      hasOpenAnswerSlots,
      openQuestionNumbers,
      openChecks,
      effectiveMcqGroups,
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
    ],
  );

  const sectionMaxWidth = showLongWritingWithAi
    ? 'min(960px, 100%)'
      : levelSlug === 'a2' &&
          ((partNumber >= 1 && partNumber <= 5) || (partNumber >= 8 && partNumber <= 14))
        ? 'min(920px, 100%)'
        : '100%';

  const a2EmbeddedReadingPart = levelSlug === 'a2' && partNumber >= 1 && partNumber <= 4;

  const passageTextForPanel = useMemo(() => {
    if (levelSlug === 'a2' && partNumber === 1) return '';
    if (!selectedPartContent.texto?.trim()) return '';
    return textoLinesForDisplay.join('\n');
  }, [levelSlug, partNumber, selectedPartContent.texto, textoLinesForDisplay]);

  const useLocalPartLabels =
    partMin != null && (isSkillPracticeSession || examModeActive || reviewMode);

  const getPartTitle = (part) => {
    const n = Number(part?.nombre?.match(/\d+/)?.[0] || partNumber || 0);
    if (levelSlug === 'b2' && n > 0) {
      return formatSkillPartPracticeTitle('b2', n, lang === 'es' ? 'es' : 'en');
    }
    if (useLocalPartLabels) {
      const localTitle = getExamSectionPartTitle(n, partMin, lang === 'es' ? 'es' : 'en');
      if (localTitle) return localTitle;
    }
    return n ? `Part ${n}` : part?.nombre || '';
  };

  const selectedPartTitleParts = useMemo(() => {
    if (a2EmbeddedReadingPart || a2WritingDemo || !selectedPart) {
      return { heading: '', subtitle: '' };
    }
    const n = Number(selectedPart?.nombre?.match(/\d+/)?.[0] || partNumber || 0);
    if (levelSlug === 'b2' && n > 0) {
      return getSkillPartPracticeTitle('b2', n, lang === 'es' ? 'es' : 'en', examSlot);
    }
    return { heading: getPartTitle(selectedPart), subtitle: '' };
  }, [
    a2EmbeddedReadingPart,
    a2WritingDemo,
    selectedPart,
    partNumber,
    levelSlug,
    lang,
    useLocalPartLabels,
    partMin,
    examSlot,
  ]);

  const trySavePartAfterAnswer = useCallback(
    (stateOverride = {}) => {
      if (examModeActive && !reviewMode) return;
      if (!scoring.examPracticeOpen || !selectedPart?.id || !selectedQuestion?.preguntaId || showLongWritingWithAi) {
        return;
      }
      const progress = computeB2PartProgressFromState({
        partNumber,
        useOpenInputUi: hasOpenAnswerSlots,
        openQuestionNumbers,
        openChecks: stateOverride.openChecks ?? openChecks,
        groupedAnswers: effectiveMcqGroups,
        checkedQuestions: stateOverride.checkedQuestions ?? checkedQuestions,
        selectedOptions: stateOverride.selectedOptions ?? selectedOptions,
        getQuestionKey,
        partId: selectedPart.id,
        treatSelectedMcqAsEvaluated: hideFeedbackResolved,
      });
      if (!progress.complete) return;
      void persistPartSessionTime(progress);
      void scoring.trySavePartProgress({
        examSlot,
        partNumber,
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        progress,
      });
    },
    [
      scoring,
      examSlot,
      partNumber,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
      showLongWritingWithAi,
      hasOpenAnswerSlots,
      openQuestionNumbers,
      openChecks,
      groupedAnswers,
      checkedQuestions,
      selectedOptions,
      examModeActive,
      reviewMode,
      hideFeedbackResolved,
      persistPartSessionTime,
    ],
  );

  const useA2OfficialReadingUi = levelSlug === 'a2' && partNumber >= 1 && partNumber <= 4;
  const useA2ListeningPictureUi = levelSlug === 'a2' && partNumber === 8;

  const a2McqPartsExpectOptions = partNumber >= 1 && partNumber <= 4;

  const useA2Part1OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 1) return false;
    if (!selectedQuestion) return true;
    return isA2Part1DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      groupsCount: effectiveMcqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    effectiveMcqGroups.length,
  ]);

  const a2Part1Pack = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 1) return null;
    const parsed = parseA2Part1Pack(selectedQuestion?.enunciado || '');
    if (useA2Part1OfficialDemo) {
      return {
        directions: A2_OFFICIAL_PART1_DEMO.directions,
        example: A2_OFFICIAL_PART1_DEMO.example,
        items: A2_OFFICIAL_PART1_DEMO.items,
      };
    }
    return parsed;
  }, [levelSlug, partNumber, selectedQuestion?.enunciado, useA2Part1OfficialDemo]);

  const a2Part1Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 1) return effectiveMcqGroups;
    const items = a2Part1Pack?.items || [];
    const respuestas = useA2Part1OfficialDemo
      ? getA2OfficialPart1DemoRespuestas()
      : selectedQuestion?.respuestas || [];
    if (effectiveMcqGroups.length) {
      return mergeA2Part1Groups(effectiveMcqGroups, items);
    }
    if (items.length) {
      return buildPart1GroupsFromPackItems(items, respuestas);
    }
    return effectiveMcqGroups;
  }, [
    levelSlug,
    partNumber,
    a2Part1Pack,
    effectiveMcqGroups,
    selectedQuestion?.respuestas,
    useA2Part1OfficialDemo,
  ]);

  const showA2Part1WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 1 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part1Groups.length > 0;

  const a2Part2McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 7 && g.questionNumber <= 13 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part2OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return false;
    if (!selectedQuestion) return true;
    return isA2Part2DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part2GroupCount: a2Part2McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part2McqGroups.length,
  ]);

  const a2Part2Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return a2Part2McqGroups;
    if (useA2Part2OfficialDemo) {
      return buildA2Part2GroupsFromDemoItems(A2_OFFICIAL_PART2_DEMO.items);
    }
    return a2Part2McqGroups;
  }, [levelSlug, partNumber, a2Part2McqGroups, useA2Part2OfficialDemo]);

  const a2Part2PassageText = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return passageTextForPanel;
    if (useA2Part2OfficialDemo) return A2_OFFICIAL_PART2_DEMO.passageText;
    return passageTextForPanel;
  }, [levelSlug, partNumber, passageTextForPanel, useA2Part2OfficialDemo]);

  const a2Part2Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return '';
    if (useA2Part2OfficialDemo) return A2_OFFICIAL_PART2_DEMO.directions;
    return (
      parseA2Part2Directions(selectedQuestion?.enunciado || '') ||
      selectedPart?.descripcion ||
      ''
    );
  }, [
    levelSlug,
    partNumber,
    useA2Part2OfficialDemo,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
  ]);

  const a2Part2ProfileNames = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 2) return [];
    return parseA2Part2ProfileNames(a2Part2PassageText);
  }, [levelSlug, partNumber, a2Part2PassageText]);

  const showA2Part2WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 2 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part2Groups.length > 0;

  const a2Part3McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 14 && g.questionNumber <= 18 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part3OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) return false;
    if (!selectedQuestion) return true;
    return isA2Part3DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part3GroupCount: a2Part3McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part3McqGroups.length,
  ]);

  const a2Part3Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) return a2Part3McqGroups;
    if (useA2Part3OfficialDemo) {
      return buildA2Part3GroupsFromDemoItems(A2_OFFICIAL_PART3_DEMO.items);
    }
    return a2Part3McqGroups;
  }, [levelSlug, partNumber, a2Part3McqGroups, useA2Part3OfficialDemo]);

  const a2Part3PassageText = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) return passageTextForPanel;
    if (useA2Part3OfficialDemo) return A2_OFFICIAL_PART3_DEMO.passageText;
    return passageTextForPanel;
  }, [levelSlug, partNumber, passageTextForPanel, useA2Part3OfficialDemo]);

  const a2Part3PassageMeta = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) {
      return { title: '', paragraphs: [] };
    }
    if (useA2Part3OfficialDemo) {
      return {
        title: A2_OFFICIAL_PART3_DEMO.passageTitle,
        paragraphs: A2_OFFICIAL_PART3_DEMO.passageParagraphs,
      };
    }
    return parseA2Part3Passage(a2Part3PassageText);
  }, [levelSlug, partNumber, useA2Part3OfficialDemo, a2Part3PassageText]);

  const a2Part3Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 3) return '';
    if (useA2Part3OfficialDemo) return A2_OFFICIAL_PART3_DEMO.directions;
    return (
      parseA2Part3Directions(selectedQuestion?.enunciado || '') ||
      selectedPart?.descripcion ||
      ''
    );
  }, [
    levelSlug,
    partNumber,
    useA2Part3OfficialDemo,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
  ]);

  const showA2Part3WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 3 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part3Groups.length > 0;

  const a2Part4McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 19 && g.questionNumber <= 24 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part4OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) return false;
    if (!selectedQuestion) return true;
    return isA2Part4DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part4GroupCount: a2Part4McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part4McqGroups.length,
  ]);

  const a2Part4Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) return a2Part4McqGroups;
    if (useA2Part4OfficialDemo) {
      return buildA2Part4GroupsFromDemoItems(A2_OFFICIAL_PART4_DEMO.items);
    }
    return a2Part4McqGroups;
  }, [levelSlug, partNumber, a2Part4McqGroups, useA2Part4OfficialDemo]);

  const a2Part4PassageText = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) return passageTextForPanel;
    if (useA2Part4OfficialDemo) return A2_OFFICIAL_PART4_DEMO.passageText;
    return passageTextForPanel;
  }, [levelSlug, partNumber, passageTextForPanel, useA2Part4OfficialDemo]);

  const a2Part4PassageMeta = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) {
      return { title: '', paragraphs: [] };
    }
    if (useA2Part4OfficialDemo) {
      return {
        title: A2_OFFICIAL_PART4_DEMO.passageTitle,
        paragraphs: A2_OFFICIAL_PART4_DEMO.passageParagraphs,
      };
    }
    return parseA2Part3Passage(a2Part4PassageText);
  }, [levelSlug, partNumber, useA2Part4OfficialDemo, a2Part4PassageText]);

  const a2Part4Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 4) return '';
    if (useA2Part4OfficialDemo) return A2_OFFICIAL_PART4_DEMO.directions;
    return (
      parseA2Part3Directions(selectedQuestion?.enunciado || '') ||
      selectedPart?.descripcion ||
      ''
    );
  }, [
    levelSlug,
    partNumber,
    useA2Part4OfficialDemo,
    selectedQuestion?.enunciado,
    selectedPart?.descripcion,
  ]);

  const showA2Part4WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 4 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part4Groups.length > 0;

  const a2Part8McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 8) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 1 && g.questionNumber <= 5 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part8OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 8) return false;
    if (!selectedQuestion) return true;
    return isA2Part8DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part8GroupCount: a2Part8McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part8McqGroups.length,
  ]);

  const a2Part8Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 8) return a2Part8McqGroups;
    if (useA2Part8OfficialDemo) {
      return buildA2Part8GroupsFromDemoItems(A2_OFFICIAL_PART8_DEMO.items);
    }
    return a2Part8McqGroups;
  }, [levelSlug, partNumber, a2Part8McqGroups, useA2Part8OfficialDemo]);

  const a2Part8Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 8) return '';
    if (useA2Part8OfficialDemo) return A2_OFFICIAL_PART8_DEMO.directions;
    return A2_OFFICIAL_PART8_DEMO.directions || selectedPart?.descripcion || '';
  }, [levelSlug, partNumber, useA2Part8OfficialDemo, selectedPart?.descripcion]);

  const showA2Part8WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 8 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part8Groups.length > 0;

  const showA2Part9WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 9 &&
    Boolean(selectedPart) &&
    !selectedQuestion;

  const a2Part10McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 10) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 11 && g.questionNumber <= 15 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part10OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 10) return false;
    if (!selectedQuestion) return true;
    return isA2Part10DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part10GroupCount: a2Part10McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part10McqGroups.length,
  ]);

  const a2Part10Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 10) return a2Part10McqGroups;
    if (useA2Part10OfficialDemo) {
      return buildA2Part10GroupsFromDemoItems(A2_OFFICIAL_PART10_DEMO.items);
    }
    return a2Part10McqGroups;
  }, [levelSlug, partNumber, a2Part10McqGroups, useA2Part10OfficialDemo]);

  const a2Part10Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 10) return '';
    if (useA2Part10OfficialDemo) return A2_OFFICIAL_PART10_DEMO.directions;
    return A2_OFFICIAL_PART10_DEMO.directions || selectedPart?.descripcion || '';
  }, [levelSlug, partNumber, useA2Part10OfficialDemo, selectedPart?.descripcion]);

  const showA2Part10WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 10 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part10Groups.length > 0;

  const a2Part11McqGroups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 11) return [];
    return effectiveMcqGroups.filter(
      (g) => g.questionNumber >= 16 && g.questionNumber <= 20 && g.options?.length >= 2,
    );
  }, [levelSlug, partNumber, effectiveMcqGroups]);

  const useA2Part11OfficialDemo = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 11) return false;
    if (!selectedQuestion) return true;
    return isA2Part11DemoEmpty({
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
      part11GroupCount: a2Part11McqGroups.length,
    });
  }, [
    levelSlug,
    partNumber,
    selectedQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
    a2Part11McqGroups.length,
  ]);

  const a2Part11Groups = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 11) return a2Part11McqGroups;
    if (useA2Part11OfficialDemo) {
      return buildA2Part11GroupsFromDemoItems(A2_OFFICIAL_PART11_DEMO.items);
    }
    return a2Part11McqGroups;
  }, [levelSlug, partNumber, a2Part11McqGroups, useA2Part11OfficialDemo]);

  const a2Part11Directions = useMemo(() => {
    if (levelSlug !== 'a2' || partNumber !== 11) return '';
    if (useA2Part11OfficialDemo) return A2_OFFICIAL_PART11_DEMO.directions;
    return A2_OFFICIAL_PART11_DEMO.directions || selectedPart?.descripcion || '';
  }, [levelSlug, partNumber, useA2Part11OfficialDemo, selectedPart?.descripcion]);

  const showA2Part11WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 11 &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    a2Part11Groups.length > 0;

  const showA2Part12WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 12 &&
    Boolean(selectedPart) &&
    !selectedQuestion;

  const showA2Part13WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 13 &&
    Boolean(selectedPart) &&
    !selectedQuestion;

  const showA2Part14WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 14 &&
    Boolean(selectedPart) &&
    !selectedQuestion;

  const showA2Part5WithoutSupabaseRow =
    levelSlug === 'a2' &&
    partNumber === 5 &&
    Boolean(selectedPart) &&
    !selectedQuestion;

  const showA2WritingDemoWithoutRow =
    levelSlug === 'a2' &&
    isLongFormWritingPart &&
    Boolean(selectedPart) &&
    !selectedQuestion &&
    Boolean(a2WritingDemo);

  const a2EmptyPartHint = useMemo(() => {
    if (levelSlug !== 'a2') return '';
    if (partNumber === 1 && a2Part1Groups.length > 0) return '';
    if (partNumber === 2 && a2Part2Groups.length > 0) return '';
    if (partNumber === 3 && a2Part3Groups.length > 0) return '';
    if (partNumber === 4 && a2Part4Groups.length > 0) return '';
    if (partNumber === 8 && a2Part8Groups.length > 0) return '';
    if (partNumber === 9 && showA2Part9WithoutSupabaseRow) return '';
    if (partNumber === 10 && a2Part10Groups.length > 0) return '';
    if (partNumber === 11 && a2Part11Groups.length > 0) return '';
    if (partNumber === 12 && showA2Part12WithoutSupabaseRow) return '';
    if (partNumber === 13 && showA2Part13WithoutSupabaseRow) return '';
    if (partNumber === 14 && showA2Part14WithoutSupabaseRow) return '';
    if (effectiveMcqGroups.length > 0) return '';
    return describeA2PartDataGap({
      partNumber,
      enunciado: selectedQuestion?.enunciado,
      respuestasCount: selectedQuestion?.respuestas?.length || 0,
    });
  }, [
    levelSlug,
    effectiveMcqGroups.length,
    a2Part1Groups.length,
    a2Part2Groups.length,
    a2Part3Groups.length,
    a2Part4Groups.length,
    a2Part8Groups.length,
    showA2Part9WithoutSupabaseRow,
    a2Part10Groups.length,
    a2Part11Groups.length,
    showA2Part12WithoutSupabaseRow,
    showA2Part13WithoutSupabaseRow,
    showA2Part14WithoutSupabaseRow,
    partNumber,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas?.length,
  ]);

  const handleA2McqOptionSelect = useCallback(
    ({ group, groupIndex, option, questionKey }) => {
      if (!hideFeedbackResolved && checkedQuestions[questionKey]) return;

      const nextSelected = { ...selectedOptions, [questionKey]: option.id };
      setSelectedOptions(nextSelected);

      if (hideFeedbackResolved) {
        trySavePartAfterAnswer({ selectedOptions: nextSelected });
        return;
      }

      const wasChecked = checkedQuestions[questionKey];
      const nextChecked = { ...checkedQuestions, [questionKey]: true };
      setCheckedQuestions(nextChecked);
      trySavePartAfterAnswer({ checkedQuestions: nextChecked, selectedOptions: nextSelected });
      if (!wasChecked && !hideFeedbackResolved) {
        const correctOpt = group.options.find((o) => o.correcta);
        const answersFromDatabase = group.options
          .map((o) => (o.formattedText || o.respuesta || '').trim())
          .filter(Boolean)
          .join('\n');
        requestAiJustification(questionKey, {
          partLabel: selectedPart?.nombre || '',
          questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
          questionNumber: group.questionNumber,
          respuestaId: correctOpt?.id,
          style: 'multiple-choice',
          userChoiceText: option.formattedText || option.respuesta || '',
          correctChoiceText: correctOpt?.formattedText || correctOpt?.respuesta || '',
          isCorrect: !!option.correcta,
          answersFromDatabase: answersFromDatabase || undefined,
        });
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
          if (error) console.warn('levels eval/puntuacion:', error.message || error);
        })();
      }
    },
    [
      checkedQuestions,
      selectedOptions,
      hideFeedbackResolved,
      requestAiJustification,
      selectedPart?.id,
      selectedPart?.nombre,
      selectedQuestion?.preguntaId,
      trySavePartAfterAnswer,
    ],
  );

  const handleSidePanelMcqExplanationRequest = useCallback(
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
      requestAiJustification(questionKey, {
        partLabel: selectedPart?.nombre || '',
        questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
        questionNumber: group.questionNumber,
        respuestaId: correctOpt?.id,
        style: 'multiple-choice',
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
    ],
  );

  const handleOpenGapSidePanelExplanationRequest = useCallback(
    ({ questionKey, questionNumber }) => {
      const existing = aiHintsByKey[questionKey];
      if (existing?.loading || existing?.text) return;
      const checkResult = openChecks[questionKey];
      if (typeof checkResult !== 'boolean') return;
      const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
      requestAiJustification(questionKey, {
        partLabel: selectedPart?.nombre || '',
        questionLabel: `Question ${questionNumber}`,
        questionNumber,
        ...resolveCorrectAnswerRowIds(
          selectedQuestion?.respuestasAbiertas,
          selectedQuestion?.respuestas,
          questionNumber,
        ),
        style: 'open-answer',
        userChoiceText: openInputs[questionKey] || '',
        correctChoiceText: [...expectedAnswers].slice(0, 4).join(' · ') || 'model answer',
        isCorrect: checkResult,
        answersFromDatabase: [...expectedAnswers].join(' · ') || undefined,
      });
    },
    [
      aiHintsByKey,
      openChecks,
      openInputs,
      openAnswerMap,
      requestAiJustification,
      selectedPart?.nombre,
    ],
  );

  const handleListeningExplanationRequest = useCallback(
    ({ questionKey, questionNumber, group }) => {
      if (group) {
        handleSidePanelMcqExplanationRequest({ questionKey, group });
        return;
      }
      handleOpenGapSidePanelExplanationRequest({ questionKey, questionNumber });
    },
    [handleSidePanelMcqExplanationRequest, handleOpenGapSidePanelExplanationRequest],
  );

  const skillPracticeExplanationFooter = useMemo(() => {
    if (hideFeedbackResolved) return null;

    if (isB2Part1InlineMcq) {
      const entries = buildMcqGroupExplanationEntries({
        mcqGroups: b2Part1McqGroups || [],
        getQuestionKey: (questionNumber) => {
          const groupIndex = (b2Part1McqGroups || []).findIndex(
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
          onRequestExplanation={handleSidePanelMcqExplanationRequest}
        />
      );
    }

    if (paperOpenSidePanelExplanationEntries.length > 0) {
      return (
        <SkillPartExplanationsPanel
          entries={paperOpenSidePanelExplanationEntries}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={handleOpenGapSidePanelExplanationRequest}
        />
      );
    }

    if (paperMcqSidePanelExplanationEntries.length > 0) {
      return (
        <SkillPartExplanationsPanel
          entries={paperMcqSidePanelExplanationEntries}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={handleSidePanelMcqExplanationRequest}
        />
      );
    }

    return null;
  }, [
    hideFeedbackResolved,
    isB2Part1InlineMcq,
    b2Part1McqGroups,
    selectedPart?.id,
    selectedOptions,
    checkedQuestions,
    paperOpenSidePanelExplanationEntries,
    paperMcqSidePanelExplanationEntries,
    aiHintsByKey,
    handleSidePanelMcqExplanationRequest,
    handleOpenGapSidePanelExplanationRequest,
  ]);

  const mcqGroupsForBulkCheck = useMemo(() => {
    const groups = isB2Part1InlineMcq ? b2Part1McqGroups : effectiveMcqGroups;
    return (groups || []).filter(
      (g) => g?.questionNumber != null && g.questionNumber !== 0 && g.options?.length,
    );
  }, [isB2Part1InlineMcq, b2Part1McqGroups, effectiveMcqGroups]);

  const resolveBulkMcqQuestionKey = useCallback(
    (group, groupIndex) => {
      if (isB2Part1InlineMcq) {
        const idx = b2Part1McqGroups.findIndex((g) => g.questionNumber === group.questionNumber);
        return getQuestionKey(
          selectedPart.id,
          group.questionNumber,
          `extra-${idx >= 0 ? idx : groupIndex}`,
        );
      }
      return getQuestionKey(selectedPart.id, group.questionNumber, `extra-${groupIndex}`);
    },
    [isB2Part1InlineMcq, b2Part1McqGroups, selectedPart?.id, getQuestionKey],
  );

  const hasCheckableAnswers = useMemo(
    () =>
      selectedPart?.id
        ? practiceHasCheckableAnswers({
            openQuestionNumbers,
            openInputs,
            getOpenQuestionKey: (questionNumber) =>
              getQuestionKey(selectedPart.id, questionNumber, 'open'),
            mcqGroups: mcqGroupsForBulkCheck,
            getMcqQuestionKey: resolveBulkMcqQuestionKey,
            selectedOptions,
          })
        : false,
    [
      selectedPart?.id,
      openQuestionNumbers,
      openInputs,
      mcqGroupsForBulkCheck,
      resolveBulkMcqQuestionKey,
      selectedOptions,
      getQuestionKey,
    ],
  );

  const handleCheckAllAnswers = useCallback(() => {
    if (!selectedPart?.id) return;

    const { nextOpenChecks, nextChecked, hasAnyAnswer } = buildBulkAnswerCheckUpdate({
      openQuestionNumbers,
      openInputs,
      openChecks,
      openAnswerMap,
      normalizeText,
      getOpenQuestionKey: (questionNumber) =>
        getQuestionKey(selectedPart.id, questionNumber, 'open'),
      mcqGroups: mcqGroupsForBulkCheck,
      getMcqQuestionKey: resolveBulkMcqQuestionKey,
      selectedOptions,
      checkedQuestions,
    });

    setOpenChecks(nextOpenChecks);
    setCheckedQuestions(nextChecked);
    trySavePartAfterAnswer({ openChecks: nextOpenChecks, checkedQuestions: nextChecked });
    readingSession.revealAnswers();
    if (hasAnyAnswer) readingSession.incrementCheckAttempts();
  }, [
    selectedPart?.id,
    openQuestionNumbers,
    openInputs,
    openChecks,
    openAnswerMap,
    mcqGroupsForBulkCheck,
    resolveBulkMcqQuestionKey,
    selectedOptions,
    checkedQuestions,
    trySavePartAfterAnswer,
    readingSession,
    getQuestionKey,
  ]);

  const renderA2McqBlock = useCallback(
    (group, groupIndex, layout) => {
      const questionKey = getQuestionKey(
        selectedPart.id,
        group.questionNumber,
        `extra-${groupIndex}`,
      );
      const isChecked = checkedQuestions[questionKey];
      const correct = group.options.find((o) => o.correcta);
      return (
        <A2McqOptionButtons
          group={group}
          groupIndex={groupIndex}
          layout={layout}
          getQuestionKey={getQuestionKey}
          selectedPart={selectedPart}
          selectedOptions={selectedOptions}
          checkedQuestions={checkedQuestions}
          hideFeedback={hideFeedbackResolved}
          onOptionSelect={handleA2McqOptionSelect}
          afterOptions={
            <A2McqFeedback
              show={!hideFeedbackResolved && isChecked}
              correctText={correct?.formattedText || correct?.respuesta}
              hint={aiHintsByKey[questionKey]}
            />
          }
        />
      );
    },
    [
      aiHintsByKey,
      checkedQuestions,
      getQuestionKey,
      handleA2McqOptionSelect,
      hideFeedbackResolved,
      selectedOptions,
      selectedPart,
    ],
  );

  const handleExamModeFinish = useCallback(
    (redirectTo) => {
      void persistPartSessionTime();
      const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
      if (pn && selectedPart) {
        examDraftRef.current[pn] = {
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
      const snapshots = finishPayload.persistPartNumbers
        ? Object.fromEntries(
            finishPayload.persistPartNumbers
              .filter((partKey) => partSnapshots[partKey])
              .map((partKey) => [partKey, partSnapshots[partKey]]),
          )
        : partSnapshots;
      void finishExamModeSupabasePersistence({
        partSnapshots: snapshots,
        examenId: scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot],
      });
    },
    [
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
      persistPartSessionTime,
    ],
  );

  const handleContinueModuleInExamMode = useCallback(() => {
    if (examSection?.redoPart != null) {
      handleExamModeFinish(resultsHref);
      return;
    }
    handleExamModeFinish(
      buildExamModeContinueModuleHref({
        partNumber,
        pagePartMax: partMax,
        examSlot,
        slug: levelSlug,
      }),
    );
  }, [handleExamModeFinish, examSection?.redoPart, resultsHref, partNumber, partMax, examSlot, levelSlug]);

  useEffect(() => {
    setWritingLiveCorrect(null);
  }, [selectedPart?.id, selectedQuestion?.preguntaId]);

  const savedPartScore = scoring.progressBySlot[examSlot]?.parts?.[partNumber];
  const scorePanelProps = showLongWritingWithAi
    ? {
        correctCount: writingLiveCorrect ?? savedPartScore?.correct ?? 0,
        totalSlots: partScoringCfg?.total ?? 20,
        passingCount: partScoringCfg?.passing ?? 12,
      }
    : {
        ...partScoreMetrics,
        passingCount: partScoringCfg?.passing ?? partScoreMetrics.passingCount,
      };

  const handleWritingScoresReady = useCallback(
    (scores) => {
      if (!scores || typeof scores.total !== 'number') return;
      setWritingLiveCorrect(scores.total);
      if (!scoring.examPracticeOpen || !selectedPart?.id) return;
      const preguntaId =
        selectedQuestion?.preguntaId ||
        selectedPart.questions?.[0]?.preguntaId ||
        selectedPart.id;
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
    [
      scoring,
      examSlot,
      partNumber,
      selectedPart,
      selectedQuestion?.preguntaId,
      partScoringCfg,
    ],
  );

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

  const formatDirectionsBlocks = useCallback(
    (rawText, omitPartTitle = false) => {
      let blocks = getFormattedEnunciado(rawText);
      if (useLocalPartLabels) {
        blocks = remapSectionPartNumbersInEnunciadoBlocks(blocks, partMin, partMax);
      }
      if (omitPartTitle) {
        blocks = omitPartTitleBlocks(blocks, true);
      }
      return blocks;
    },
    [useLocalPartLabels, partMin, partMax],
  );

  const displayDirectionsText = useMemo(() => {
    const raw = a2Part1Pack?.directions || selectedPartContent.enunciado || '';
    if (!raw) return '';
    return useLocalPartLabels
      ? remapSectionPartNumbersInText(raw, partMin, partMax)
      : raw;
  }, [
    a2Part1Pack?.directions,
    selectedPartContent.enunciado,
    useLocalPartLabels,
    partMin,
    partMax,
  ]);

  const isB2ListeningPartPractice =
    isPartPracticeMode(practiceMode) &&
    isSkillPracticeSession &&
    skillRoute === 'exam-listening' &&
    levelSlug === 'b2' &&
    partNumber >= 10 &&
    partNumber <= 13;

  const listeningStrategyPack = useMemo(
    () => (isB2ListeningPartPractice ? getB2ListeningStrategyPack(partNumber) : null),
    [isB2ListeningPartPractice, partNumber],
  );

  const showPracticeSideRail =
    isSkillPracticeSession && isPartPracticeMode(practiceMode) && scoring.examPracticeOpen;

  const showListeningBriefing =
    Boolean(b2Exam1ListeningUx) && useListeningItemLayout && isB2ListeningPartPractice;
  const hideListeningDirectionsDup = showListeningBriefing;

  const chromeTitle = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeTitle({
        lang,
        examModeActive,
        reviewMode,
        sectionTitle: title,
        defaultTitle: title,
      });
    }
    if (isSkillPracticeSession && skillRoute) {
      const skillTitle = getExamSkillSectionTitle(levelSlug, skillRoute);
      if (skillTitle) return skillTitle;
    }
    return title;
  }, [examModeActive, reviewMode, title, lang, isSkillPracticeSession, skillRoute, levelSlug]);

  const chromeSubtitleResolved = useMemo(() => {
    if (examModeActive || reviewMode) {
      return getExamChromeSubtitle({
        lang,
        examModeActive,
        reviewMode,
        defaultSubtitle: subtitle,
      });
    }
    if (isSkillPracticeSession) return null;
    return subtitle;
  }, [
    examModeActive,
    reviewMode,
    lang,
    subtitle,
    isSkillPracticeSession,
  ]);

  const modeBadge = useMemo(() => {
    if (isExamSimulationMode(practiceMode)) {
      return lang === 'en' ? 'Exam Mode' : 'Modo examen';
    }
    if (isSkillPracticeSession && isPartPracticeMode(practiceMode)) {
      return lang === 'en' ? 'Practice Mode' : 'Modo práctica';
    }
    return null;
  }, [practiceMode, isSkillPracticeSession, lang]);

  const chromeTimerVariant =
    isExamSimulationMode(practiceMode) ? 'prominent' : isSkillPracticeSession ? 'session' : 'prominent';
  const compactChromeHeader = isSkillPracticeSession || isExamSimulationMode(practiceMode);

  const showExerciseFavorite =
    isSkillPracticeSession &&
    !isExamSimulationMode(practiceMode) &&
    Boolean(selectedQuestion?.preguntaId);

  const hideStandaloneExerciseLabel =
    isSkillPracticeSession &&
    (skillRoute === 'exam-writing' ||
      skillRoute === 'exam-listening' ||
      skillRoute === 'exam-speaking' ||
      (levelSlug === 'b2' && partNumber >= 1 && partNumber <= 4));

  const exerciseFavoriteMeta = useMemo(() => {
    if (!showExerciseFavorite) return null;
    const n = Number(selectedPart?.nombre?.match(/\d+/)?.[0] || partNumber || 0);
    return buildExerciseFavoriteMeta({
      levelSlug,
      skillRoute,
      partNumber: n,
      examSlot,
      title:
        selectedPartTitleParts.subtitle ||
        selectedPartTitleParts.heading ||
        selectedPart?.displayName ||
        'Test',
      heading: selectedPartTitleParts.heading || null,
      sectionTitle: skillRoute ? getExamSkillSectionTitle(levelSlug, skillRoute) : null,
    });
  }, [
    showExerciseFavorite,
    levelSlug,
    skillRoute,
    partNumber,
    examSlot,
    selectedPart,
    selectedPartTitleParts,
  ]);

  const reportErrorContext = useMemo(() => {
    if (loading || error || !scoring.examPracticeOpen || !selectedPart) return null;
    const questionText = selectedQuestion?.enunciado
      ? String(selectedQuestion.enunciado).replace(/\s+/g, ' ').trim().slice(0, 300)
      : '';
    return {
      levelSlug,
      skillRoute,
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
    levelSlug,
    skillRoute,
    partNumber,
    examSlot,
    practiceMode,
    examModeActive,
    reviewMode,
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
  ]);

  const getExamDraftSnapshot = useCallback(() => {
    const pn = partNumber;
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
    partNumber,
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
    const pn = partNumber;
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
    partNumber,
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
    lang,
  });

  const moduleNavEl = (
    <B2ExamPracticeModuleNav
      slug={levelSlug}
      partNumber={partNumber}
      pagePartMax={partMax}
      pagePartMin={partMin}
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
      lang={lang}
      partMinForTabLabels={
        isSkillPracticeSession || isExamSimulationMode(practiceMode) ? partMin : null
      }
    />
  );

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
        levelSlug={slug}
        skillRoute={skillRoute}
        partMinForTabLabels={
          isSkillPracticeSession || isExamSimulationMode(practiceMode) ? partMin : null
        }
        skillPracticeTheme={skillNav.skillTheme}
        practiceMode={practiceMode}
        timerVariant={chromeTimerVariant}
        modeBadge={modeBadge}
        showRefresh={!isExamSimulationMode(practiceMode)}
        timerLabel={categoryTimer.label}
        timerControls={categoryTimer}
        refreshLabel={refreshLabel}
        loading={loading}
        onRefresh={() => loadData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={isExamSimulationMode(practiceMode) && !reviewMode}
        partFinishNotice={isExamSimulationMode(practiceMode) && !reviewMode ? null : scoring.partFinishNotice}
        partFinishNoticePlacement={showPracticeSideRail ? 'header' : 'main'}
        studyNotesPlacement={showPracticeSideRail ? 'sidebar-top' : 'header'}
        partsData={!loading && !error ? tabPartsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        lang={lang}
        workPanelClassName={
          levelSlug === 'a2' && partNumber >= 1 && partNumber <= 7
            ? 'levels-b2-practice__work-panel--a2-rw'
            : ''
        }
        studyNotesContext={{
          slug: levelSlug,
          skillRoute,
          examMode: examModeActive,
          partNumber,
          examSlot,
        }}
        studyNotesContextLabel={title}
        reportErrorContext={reportErrorContext}
        examModeSaveControls={examModeSaveControls}
      >
      {examModeActive && examSection ? (
        <ExamModeSectionBanner
          sectionKey={examSection.key}
          sectionTitle={examSection.title || title}
          durationSeconds={examSection.durationSeconds}
          initialRemainingSeconds={examSection.remainingSeconds}
          active={!reviewMode}
          onTick={(sec) => setSectionRemaining(examSection.key, sec)}
          onFinish={handleExamModeFinish}
          lang={lang}
        />
      ) : null}
      <section style={{ maxWidth: sectionMaxWidth, margin: '0 auto', width: '100%' }}>
        {loading && <p style={{ textAlign: 'center' }}>{loadingLabel}</p>}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {showA2WritingDemoWithoutRow ? (
              <div className="levels-exam-split-page levels-exam-a2-writing">
                <div className="a2-writing-frame">
                  <p className="a2-writing-frame__demo-note" role="status">
                    Official Cambridge sample task. An admin can save this to Supabase by
                    regenerating Exam {examSlot} with DRALO AI.
                  </p>
                  <A2WritingTaskCard
                    partTitle={a2WritingDemo.partTitle}
                    questionLabel={a2WritingDemo.questionLabel}
                    scenario={a2WritingDemo.scenario}
                    bulletsIntro={a2WritingDemo.bulletsIntro}
                    bullets={a2WritingDemo.bullets}
                    pictures={a2WritingDemo?.pictures || []}
                    wordCountNote={a2WritingDemo.wordCountNote}
                    answerSheetNote={a2WritingDemo.answerSheetNote}
                  />
                  <B2WritingLongFormAiPanel
                    storageKey={longWritingStorageKey}
                    wordMin={effectiveWritingWordMin}
                    wordMax={effectiveWritingWordMax}
                    heading={`Your answer — ${getPartTitle(selectedPart)}`}
                    partLabel={selectedPart.nombre}
                    partDescription={selectedPart.descripcion || ''}
                    taskInstructions={a2WritingDemoInstructions || ''}
                    taskInputText=""
                    onScoresReady={handleWritingScoresReady}
                    lang={lang}
                  />
                </div>
              </div>
            ) : null}

            {showA2Part5WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part5">
                <A2Part5ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={A2_OFFICIAL_PART5_DEMO.directions}
                  email={A2_OFFICIAL_PART5_DEMO.email}
                  example={A2_OFFICIAL_PART5_DEMO.example}
                  bodyParagraphs={A2_OFFICIAL_PART5_DEMO.bodyParagraphs}
                  answers={A2_OFFICIAL_PART5_DEMO.answers}
                  hideFeedback={hideFeedbackResolved}
                />
              </div>
            ) : null}

            {showA2Part4WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part4">
                <A2Part4ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={a2Part4Directions}
                  passageTitle={a2Part4PassageMeta.title}
                  passageParagraphs={a2Part4PassageMeta.paragraphs}
                  passageText={a2Part4PassageText}
                  groups={a2Part4Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part8WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part8">
                <A2Part8ExamShell
                  showDemoNote={useA2Part8OfficialDemo}
                  examSlot={examSlot}
                  directions={a2Part8Directions}
                  groups={a2Part8Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part9WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part9">
                <A2Part9ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={A2_OFFICIAL_PART9_DEMO.directions}
                  intro={A2_OFFICIAL_PART9_DEMO.intro}
                  noteTitle={A2_OFFICIAL_PART9_DEMO.noteTitle}
                  rows={A2_OFFICIAL_PART9_DEMO.rows}
                  answers={A2_OFFICIAL_PART9_DEMO.answers}
                  hideFeedback={hideFeedbackResolved}
                />
              </div>
            ) : null}

            {showA2Part10WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part10">
                <A2Part10ExamShell
                  showDemoNote={useA2Part10OfficialDemo}
                  examSlot={examSlot}
                  directions={a2Part10Directions}
                  intro={useA2Part10OfficialDemo ? A2_OFFICIAL_PART10_DEMO.intro : ''}
                  groups={a2Part10Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part11WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part11">
                <A2Part11ExamShell
                  showDemoNote={useA2Part11OfficialDemo}
                  examSlot={examSlot}
                  directions={a2Part11Directions}
                  groups={a2Part11Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part12WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part12">
                <A2Part12ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={A2_OFFICIAL_PART12_DEMO.directions}
                  introLines={A2_OFFICIAL_PART12_DEMO.introLines}
                  example={A2_OFFICIAL_PART12_DEMO.example}
                  people={A2_OFFICIAL_PART12_DEMO.people}
                  optionPool={A2_OFFICIAL_PART12_DEMO.optionPool}
                  answers={A2_OFFICIAL_PART12_DEMO.answers}
                  hideFeedback={hideFeedbackResolved}
                />
              </div>
            ) : null}

            {showA2Part13WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part13">
                <A2Part13ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={A2_OFFICIAL_PART13_DEMO.directions}
                  interviewIntro={A2_OFFICIAL_PART13_DEMO.interviewIntro}
                  interviewPrompts={A2_OFFICIAL_PART13_DEMO.interviewPrompts}
                  photoTitle={A2_OFFICIAL_PART13_DEMO.photoTitle}
                  photos={A2_OFFICIAL_PART13_DEMO.photos}
                />
              </div>
            ) : null}

            {showA2Part14WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part14">
                <A2Part14ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={A2_OFFICIAL_PART14_DEMO.directions}
                  taskInstruction={A2_OFFICIAL_PART14_DEMO.taskInstruction}
                  photoTitle={A2_OFFICIAL_PART14_DEMO.photoTitle}
                  photos={A2_OFFICIAL_PART14_DEMO.photos}
                  followUpIntro={A2_OFFICIAL_PART14_DEMO.followUpIntro}
                  followUpPrompts={A2_OFFICIAL_PART14_DEMO.followUpPrompts}
                />
              </div>
            ) : null}

            {showA2Part3WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part3">
                <A2Part3ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={a2Part3Directions}
                  passageTitle={a2Part3PassageMeta.title}
                  passageParagraphs={a2Part3PassageMeta.paragraphs}
                  passageText={a2Part3PassageText}
                  groups={a2Part3Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part2WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part2">
                <A2Part2ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={a2Part2Directions}
                  passageText={a2Part2PassageText}
                  profileNames={a2Part2ProfileNames}
                  groups={a2Part2Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {showA2Part1WithoutSupabaseRow ? (
              <div className="levels-exam-split-page levels-exam-a2-part1">
                <A2Part1ExamShell
                  showDemoNote
                  examSlot={examSlot}
                  directions={a2Part1Pack?.directions || selectedPart?.descripcion || ''}
                  example={a2Part1Pack?.example}
                  groups={a2Part1Groups}
                  getQuestionKey={getQuestionKey}
                  selectedPart={selectedPart}
                  selectedOptions={selectedOptions}
                  checkedQuestions={checkedQuestions}
                  hideFeedback={hideFeedbackResolved}
                  onOptionSelect={handleA2McqOptionSelect}
                  aiHintsByKey={aiHintsByKey}
                />
              </div>
            ) : null}

            {selectedPart &&
              !selectedQuestion &&
              !showA2Part1WithoutSupabaseRow &&
              !showA2Part2WithoutSupabaseRow &&
              !showA2Part3WithoutSupabaseRow &&
              !showA2Part4WithoutSupabaseRow &&
              !showA2Part5WithoutSupabaseRow &&
              !showA2Part8WithoutSupabaseRow &&
              !showA2Part9WithoutSupabaseRow &&
              !showA2Part10WithoutSupabaseRow &&
              !showA2Part11WithoutSupabaseRow &&
              !showA2Part12WithoutSupabaseRow &&
              !showA2Part13WithoutSupabaseRow &&
              !showA2Part14WithoutSupabaseRow &&
              !showA2WritingDemoWithoutRow && (
              <div className="levels-exam-split-page">
                <div className="levels-exam-split-card">
                  <h2>{getPartTitle(selectedPart)}</h2>
                  <div className="levels-exam-split__body levels-exam-split__body--stacked">
                    <p style={{ margin: '0 0 0.75rem', color: '#9b2c2c', fontWeight: 600 }}>
                      No hay ejercicio guardado en Supabase para esta parte del examen {examSlot}.
                    </p>
                    {levelSlug === 'a2' && adminFlow.isAdmin ? (
                      <p style={{ margin: '0 0 1rem', color: '#334155', lineHeight: 1.6 }}>
                        Vuelve a elegir <strong>Examen {examSlot}</strong> arriba y confirma{' '}
                        <strong>regenerar con DRALO AI</strong> (14 partes). Si ves «Sesión no válida»,
                        cierra sesión e inicia de nuevo como administrador.
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 1rem', color: '#4a5568', lineHeight: 1.6 }}>
                        Un administrador debe generar el contenido del examen antes de practicar.
                      </p>
                    )}
                    {selectedPart.descripcion ? (
                      <div className="levels-exam-split__enunciado">
                        <p className="levels-exam-split__section-title">About this part</p>
                        <p style={{ margin: 0, lineHeight: 1.65, color: '#1f2937' }}>
                          {selectedPart.descripcion}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {selectedPart && selectedQuestion &&
              (useListeningItemLayout ? (
              <div className={`levels-listening-practice-layout${showPracticeSideRail ? ' levels-listening-practice-layout--with-strategy' : ''}${readingSession.focusMode ? ' levels-listening-practice-layout--focus' : ''}`}>
              <div
                className={`levels-listening-practice-main${isSkillPracticeSession ? ` ${readingSession.readingAreaClassName}` : ''}`}
                style={isSkillPracticeSession ? readingSession.readingAreaStyle : undefined}
              >
              <div className="levels-exam-split-page levels-exam-practice-page--narrow">
              <div className="levels-exam-split-card">
                <SkillPartPracticeHeader
                  title={selectedPartTitleParts.heading}
                  subtitle={selectedPartTitleParts.subtitle}
                  exerciseLabel={
                    isSkillPracticeSession && examSlot && !hideStandaloneExerciseLabel
                      ? formatSkillExerciseLabel(examSlot, lang === 'es' ? 'es' : 'en')
                      : null
                  }
                  titleActions={
                    <SkillPartExerciseFavorite
                      show={showExerciseFavorite}
                      preguntaId={selectedQuestion?.preguntaId}
                      meta={exerciseFavoriteMeta}
                      lang={lang === 'es' ? 'es' : 'en'}
                    />
                  }
                />

                {showListeningBriefing && b2Exam1ListeningUx ? (
                  <B2ListeningPracticeBriefing
                    whatYouWillHear={b2Exam1ListeningUx.whatYouWillHear}
                    whatYouNeedToDo={b2Exam1ListeningUx.whatYouNeedToDo}
                    practiceNote={b2Exam1ListeningUx.practiceNote}
                    examSimulation={isExamSimulationMode(practiceMode)}
                  />
                ) : null}

                <div className="levels-exam-split__body levels-exam-split__body--stacked">
                  {selectedPartContent.enunciado && !hideListeningDirectionsDup ? (
                    <SkillPartInstructionsPanel
                      label={isSkillPracticeSession ? 'Instructions' : 'Directions'}
                      blocks={formatDirectionsBlocks(selectedPartContent.enunciado, true)}
                    />
                  ) : null}

                {showAudioFromEnunciado && preguntaAudiosError ? (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: '#fff5f5',
                      border: '1px solid #feb2b2',
                      borderRadius: '8px',
                      color: '#9b2c2c',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {/could not find the table|does not exist|schema cache/i.test(preguntaAudiosError) ? (
                      <>
                        En este proyecto Supabase{' '}
                        <strong>no existe la tabla</strong>{' '}
                        <code style={{ fontSize: '0.85em' }}>public.levels_preguntas_audios</code> (o la clave
                        pública de la app apunta a otro proyecto). En Supabase → SQL → pega y ejecuta{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/setup-levels-preguntas-audios.sql</code> (todo
                        en un solo archivo). Alternativa en dos pasos:{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/create-levels-preguntas-audios.sql</code> y luego{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/levels-preguntas-audios-rls.sql</code>.
                        <br />
                        <span style={{ opacity: 0.92 }}>Detalle: {preguntaAudiosError}</span>
                      </>
                    ) : (
                      <>
                        No se pudieron leer los audios desde{' '}
                        <code style={{ fontSize: '0.85em' }}>levels_preguntas_audios</code>: {preguntaAudiosError}.
                        Si es un problema de permisos, en Supabase añade una política RLS de SELECT para el rol{' '}
                        <code style={{ fontSize: '0.85em' }}>anon</code> (ver{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/levels-preguntas-audios-rls.sql</code>).
                      </>
                    )}
                  </p>
                ) : null}

                {showAudioFromEnunciado && hasDbClipsWithNoValidUrl ? (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: '#fffbeb',
                      border: '1px solid #fbd38d',
                      borderRadius: '8px',
                      color: '#744210',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Hay filas en <code style={{ fontSize: '0.85em' }}>levels_preguntas_audios</code> para esta
                    pregunta, pero ninguna <code style={{ fontSize: '0.85em' }}>audio_url</code> es válida (revisa
                    URL pública o firmada hasta el fichero .mp3). Puedes tener varias filas por la misma{' '}
                    <code style={{ fontSize: '0.85em' }}>pregunta_id</code> con distinto <code style={{ fontSize: '0.85em' }}>orden</code>.
                  </p>
                ) : null}

                {useListeningItemLayout ? (
                  <>
                    {listeningMonologueClip?.url ? (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '10px',
                        }}
                      >
                        <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#0c4a6e' }}>Audio</p>
                        {listeningMonologueClip.titulo ? (
                          <p
                            style={{
                              margin: '0 0 0.35rem',
                              fontSize: '0.9rem',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            {listeningMonologueClip.titulo}
                          </p>
                        ) : null}
                        <ExamListeningAudioPlayer
                          src={resolvePublicOrSiteAudioSrc(
                            String(listeningMonologueClip.url),
                            listeningMonologueClip.id || 'mono',
                          )}
                          examMode={examListeningAudioStrict}
                          clipKey={`mono-${listeningMonologueClip.id || partNumber}`}
                          lang={lang}
                        />
                      </div>
                    ) : showEnunciadoFallbackAudio ? (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '10px',
                        }}
                      >
                        <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#0c4a6e' }}>
                          Audio (instrucciones / enunciado)
                        </p>
                        <ExamListeningAudioPlayer
                          src={resolvedTextEnunciadoAudioSrc}
                          examMode={examListeningAudioStrict}
                          clipKey={`enunciado-${selectedQuestion?.preguntaId || partNumber}`}
                          lang={lang}
                        />
                      </div>
                    ) : null}
                    {listeningMatchingPool.length > 0 ? (
                      <div className="levels-listening-options-pool">
                        <p className="levels-listening-options-pool__title">
                          Options A–H
                        </p>
                        {listeningMatchingPool.map((line, pi) => (
                          <p key={`pool-${pi}`} className="levels-listening-options-pool__line">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {isListeningGapPart && listeningGapPassageLines.length > 0 ? (
                      <div style={{ marginTop: '1rem' }}>
                        <B2ListeningInlineGapPassage
                          lines={listeningGapPassageLines}
                          questionNumbers={listeningQuestionNumbersOrdered}
                          getQuestionKey={(questionNumber) =>
                            getQuestionKey(selectedPart.id, questionNumber, 'open')
                          }
                          openInputs={openInputs}
                          openChecks={openChecks}
                          hideFeedback={hideFeedbackResolved}
                          hideCheck={hidePracticeChecks}
                          onInputChange={(questionKey, value) => {
                            setOpenInputs((prev) => ({ ...prev, [questionKey]: value }));
                            setOpenChecks((prev) => ({ ...prev, [questionKey]: undefined }));
                          }}
                          onCheckGap={handleListeningGapCheck}
                        />
                      </div>
                    ) : (
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1.25rem' }}>
                      {listeningQuestionNumbersOrdered.map((qn, questionIndex) => {
                        if (isListeningGapPart) return null;
                        const group = groupedAnswers.find((g) => g.questionNumber === qn);
                        if (!group || !group.options?.length) return null;

                        const groupIndex = groupedAnswers.indexOf(group);
                        const ctx = listeningContextBlocks.find((b) => b.questionNumber === qn);
                        const hidePerItemAudio = Boolean(listeningMonologueClip);
                        const clip = hidePerItemAudio
                          ? null
                          : pickListeningClipForQuestion(listeningReadyClips, qn, partNumber);
                        const clipSrc =
                          !hidePerItemAudio && clip?.url
                            ? resolvePublicOrSiteAudioSrc(String(clip.url), clip.id || `p${partNumber}-q${qn}`)
                            : '';
                        const clipLabel = '';
                        const sequentialClipKey = getListeningSequentialClipKey(qn);
                        const sequentialLock = resolveListeningSequentialLock(
                          sequentialClipKey,
                          questionIndex,
                        );

                        const questionKey = getQuestionKey(
                          selectedPart.id,
                          group.questionNumber,
                          `extra-${groupIndex}`,
                        );
                        const part10Situation = isB2ListeningPart10
                          ? (() => {
                              const first = String(ctx?.contextLines?.[0] || '').trim();
                              if (/^you\s+hear\b/i.test(first)) return first;
                              return getB2Exam1Part10Situation(qn, examSlot);
                            })()
                          : null;
                        const part10Prompt = isB2ListeningPart10
                          ? (() => {
                              const lines = (ctx?.contextLines || []).map((l) => String(l || '').trim()).filter(Boolean);
                              if (lines.length >= 2 && /^you\s+hear\b/i.test(lines[0])) return lines[1];
                              if (lines.length === 1 && !/^you\s+hear\b/i.test(lines[0])) return lines[0];
                              const groupPrompt = group.options?.[0]?.pregunta || '';
                              return String(groupPrompt || '').trim();
                            })()
                          : '';
                        const rawMatchingSelection = selectedOptions[questionKey];
                        const selectedLetter = /^[A-H]$/i.test(String(rawMatchingSelection || ''))
                          ? String(rawMatchingSelection).toUpperCase()
                          : extractMcqOptionLetter(
                              group.options.find((o) => rawMatchingSelection === o.id) || {},
                            ) || '';

                        const applyListeningMcqOption = (option) => {
                          setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
                          if (hideFeedbackResolved) return;
                          const wasChecked = checkedQuestions[questionKey];
                          const nextChecked = { ...checkedQuestions, [questionKey]: true };
                          setCheckedQuestions(nextChecked);
                          trySavePartAfterAnswer({ checkedQuestions: nextChecked });
                          if (!wasChecked) {
                            const correctOpt = group.options.find((o) => o.correcta);
                            const answersFromDatabase = group.options
                              .map((o) => (o.formattedText || o.respuesta || '').trim())
                              .filter(Boolean)
                              .join('\n');
                            requestAiJustification(questionKey, {
                              partLabel: selectedPart?.nombre || '',
                              questionLabel: group.questionNumber
                                ? `Question ${group.questionNumber}`
                                : 'Question',
                              questionNumber: group.questionNumber,
                              respuestaId: correctOpt?.id,
                              style: 'listening-mcq',
                              userChoiceText: option.formattedText || option.respuesta || '',
                              correctChoiceText:
                                correctOpt?.formattedText || correctOpt?.respuesta || '',
                              isCorrect: !!option.correcta,
                              answersFromDatabase: answersFromDatabase || undefined,
                            });
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
                                slotLabel: group.questionNumber
                                  ? `Question ${group.questionNumber}`
                                  : 'Question',
                                userAnswerText: option.formattedText || option.respuesta || '',
                              });
                              if (error) {
                                console.warn('levels eval/puntuacion:', error.message || error);
                              }
                            })();
                          }
                        };

                        const applyListeningMatchingLetter = (letter) => {
                          const normalizedLetter = String(letter || '').toUpperCase();
                          const opt = group.options.find(
                            (o) => extractMcqOptionLetter(o) === normalizedLetter,
                          );
                          if (opt) {
                            applyListeningMcqOption(opt);
                            return;
                          }
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [questionKey]: normalizedLetter,
                          }));
                          if (hideFeedbackResolved) return;
                          const wasChecked = checkedQuestions[questionKey];
                          const nextChecked = { ...checkedQuestions, [questionKey]: true };
                          setCheckedQuestions(nextChecked);
                          trySavePartAfterAnswer({ checkedQuestions: nextChecked });
                          if (!wasChecked) {
                            const correctOpt = group.options.find((o) => o.correcta) || group.options[0];
                            const correctLetter = extractMcqOptionLetter(correctOpt || {});
                            const poolLine = listeningMatchingSelectOptions.find(
                              (o) => o.letter === normalizedLetter,
                            );
                            const correctPoolLine = listeningMatchingSelectOptions.find(
                              (o) => o.letter === correctLetter,
                            );
                            requestAiJustification(questionKey, {
                              partLabel: selectedPart?.nombre || '',
                              questionLabel: group.questionNumber
                                ? `Question ${group.questionNumber}`
                                : 'Question',
                              questionNumber: group.questionNumber,
                              respuestaId: correctOpt?.id,
                              style: 'listening-matching',
                              userChoiceText: poolLine
                                ? `${poolLine.letter} — ${poolLine.text}`
                                : normalizedLetter,
                              correctChoiceText: correctPoolLine
                                ? `${correctPoolLine.letter} — ${correctPoolLine.text}`
                                : correctLetter,
                              isCorrect: normalizedLetter === correctLetter,
                              answersFromDatabase: listeningMatchingSelectOptions
                                .map((o) => `${o.letter}) ${o.text}`)
                                .join('\n'),
                            });
                          }
                        };

                        return (
                          <div
                            key={`listen-item-${selectedQuestion.preguntaId}-${qn}`}
                            className="levels-listening-question-card"
                          >
                            {part10Situation ? (
                              <p className="levels-listening-situation">
                                Question {qn} - {part10Situation}
                              </p>
                            ) : (
                              <p className="levels-listening-question-card__title">
                                Question {qn}
                              </p>
                            )}
                            {isB2ListeningPart10 && part10Prompt ? (
                              <p className="levels-listening-context-line">{part10Prompt}</p>
                            ) : null}
                            {isB2ListeningPart10 ? (
                              <p className="levels-listening-mcq-hint">
                                Choose the best answer (A, B or C).
                              </p>
                            ) : null}
                            {clipSrc ? (
                              <div style={{ marginBottom: ctx?.contextLines?.length ? '0.85rem' : 0 }}>
                                {clipLabel ? (
                                  <p className="levels-listening-audio-label">
                                    {clipLabel}
                                  </p>
                                ) : null}
                                <ExamListeningAudioPlayer
                                  src={clipSrc}
                                  examMode={examListeningAudioStrict}
                                  clipKey={clipSrc}
                                  lang={lang}
                                  playLocked={sequentialLock.locked}
                                  lockReason={sequentialLock.reason}
                                  onPlaybackStart={() => handleListeningPlaybackStart(sequentialClipKey)}
                                  onPlaybackEnd={() => handleListeningPlaybackEnd(sequentialClipKey)}
                                />
                              </div>
                            ) : !listeningMonologueClip ? (
                              <p className="levels-listening-no-audio">
                                No hay audio enlazado para este ítem en la base de datos.
                              </p>
                            ) : null}
                            {ctx?.contextLines?.length && !isB2ListeningPart10 ? (
                              <div className="levels-listening-context-box">
                                {ctx.contextLines.map((line, li) => (
                                  <p key={`ctx-${qn}-${li}`}>
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                            {isB2ListeningMatchingPart && listeningMatchingSelectOptions.length > 0 ? (
                              <>
                                <label
                                  htmlFor={`matching-select-${questionKey}`}
                                  className="levels-listening-matching-select-label"
                                >
                                  Your answer (choose A–H)
                                </label>
                                <select
                                  id={`matching-select-${questionKey}`}
                                  className="levels-listening-matching-select"
                                  value={selectedLetter}
                                  onChange={(e) => {
                                    const letter = e.target.value;
                                    if (!letter) {
                                      setSelectedOptions((prev) => {
                                        const next = { ...prev };
                                        delete next[questionKey];
                                        return next;
                                      });
                                      if (!hideFeedbackResolved) {
                                        setCheckedQuestions((prev) => {
                                          const next = { ...prev };
                                          delete next[questionKey];
                                          return next;
                                        });
                                      }
                                      return;
                                    }
                                    applyListeningMatchingLetter(letter);
                                  }}
                                >
                                  <option value="">— Choose A–H —</option>
                                  {listeningMatchingSelectOptions.map(({ letter, text }) => (
                                    <option key={`${qn}-${letter}`} value={letter}>
                                      {letter} — {text}
                                    </option>
                                  ))}
                                </select>
                              </>
                            ) : (
                              <div className="levels-listening-mcq-options-grid">
                                  {group.options.map((option) => {
                                    const isSelected = selectedOptions[questionKey] === option.id;
                                    const isChecked = checkedQuestions[questionKey];
                                    const isCorrect = !!option.correcta;
                                    const showCorrect = !hideFeedbackResolved && isChecked && isCorrect;
                                    const showIncorrect =
                                      !hideFeedbackResolved && isChecked && isSelected && !isCorrect;

                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => applyListeningMcqOption(option)}
                                        className={getListeningMcqOptionClassName({
                                          isSelected,
                                          showCorrect,
                                          showIncorrect,
                                        })}
                                      >
                                        {option.formattedText || option.respuesta}
                                      </button>
                                    );
                                  })}
                                </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    )}
                    {!hideFeedbackResolved ? (
                      <SkillPartExplanationsPanel
                        entries={listeningPracticeExplanationEntries}
                        aiHintsByKey={aiHintsByKey}
                        onRequestExplanation={handleListeningExplanationRequest}
                      />
                    ) : null}
                  </>
                ) : null}
                </div>
              </div>
              </div>
              {moduleNavEl}
              </div>
              {showPracticeSideRail ? (
                <ExamPracticeSessionSideRail
                  topRail={
                    <ExamPracticeSideRailTop
                      studyNotes={
                        <ExamStudyNotesSidebar
                          context={{
                            slug: levelSlug,
                            skillRoute,
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
                    listeningStrategyPack ? (
                      <B2ListeningStrategyPanel
                        pack={listeningStrategyPack}
                        partLabel={getB2ListeningCambridgePartLabel(partNumber)}
                      />
                    ) : null
                  }
                  progress={
                    <ExamPracticeProgressPanel
                      slug={levelSlug}
                      examSlot={examSlot}
                      partMin={partMin}
                      partMax={partMax}
                      progressSlot={scoring.progressBySlot[examSlot]}
                      progressBySlot={scoring.progressBySlot}
                      examLabelsBySlot={examLabelsBySlot}
                      focusPartNumber={partNumber}
                      passing={partScoringCfg?.passing}
                      skillRoute={skillRoute}
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
              ) : (
              <B2ExamPracticeContent
                title={selectedPartTitleParts.heading}
                titleSubtitle={selectedPartTitleParts.subtitle}
                showExerciseFavorite={showExerciseFavorite}
                favoritePreguntaId={selectedQuestion?.preguntaId}
                favoriteMeta={exerciseFavoriteMeta}
                favoriteLang={lang === 'es' ? 'es' : 'en'}
                exerciseLabel={
                  isSkillPracticeSession && examSlot && !hideStandaloneExerciseLabel
                    ? formatSkillExerciseLabel(examSlot, lang === 'es' ? 'es' : 'en')
                    : null
                }
                directionsText={displayDirectionsText}
                directionsLabel={isSkillPracticeSession ? 'Instructions' : 'Directions'}
                textLabel="Text"
                questionsLabel="Questions"
                passageText={isB2Part1InlineMcq ? '' : passageTextForPanel}
                passage={
                  isB2Part1InlineMcq ? (
                    <B2ExamInlineMcqClozePassage
                      text={selectedPartContent.texto}
                      mcqGroups={b2Part1McqGroups}
                      getQuestionKey={(questionNumber) => {
                        const groupIndex = b2Part1McqGroups.findIndex(
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
                      onOptionSelect={handleA2McqOptionSelect}
                      hideFeedback={hideFeedbackResolved}
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handleSidePanelMcqExplanationRequest}
                      showInlineExample={useSkillUoeExampleLayout}
                      exampleGap0Word={exampleGap0Word}
                    />
                  ) : undefined
                }
                split={a2EmbeddedReadingPart || isB2Part1InlineMcq ? false : 'auto'}
                showDirections={!a2EmbeddedReadingPart}
                showPassagePanel={!a2EmbeddedReadingPart}
                showQuestionsHeading={
                  !showLongWritingWithAi && !a2EmbeddedReadingPart && !isB2Part1InlineMcq
                }
                contentClassName={
                  isB2Part1InlineMcq
                    ? 'levels-exam-mcq-cloze-inline'
                    : useA2OfficialReadingUi && partNumber === 1
                    ? 'levels-exam-a2-part1'
                    : useA2OfficialReadingUi && partNumber === 2
                      ? 'levels-exam-a2-part2'
                      : useA2OfficialReadingUi && partNumber === 3
                        ? 'levels-exam-a2-part3'
                        : useA2OfficialReadingUi && partNumber === 4
                          ? 'levels-exam-a2-part4'
                          : ''
                }
                footer={skillPracticeExplanationFooter}
                beforeQuestions={
                  <>
                {showAudioFromEnunciado && preguntaAudiosError ? (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: '#fff5f5',
                      border: '1px solid #feb2b2',
                      borderRadius: '8px',
                      color: '#9b2c2c',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {/could not find the table|does not exist|schema cache/i.test(preguntaAudiosError) ? (
                      <>
                        En este proyecto Supabase{' '}
                        <strong>no existe la tabla</strong>{' '}
                        <code style={{ fontSize: '0.85em' }}>public.levels_preguntas_audios</code> (o la clave
                        pública de la app apunta a otro proyecto). En Supabase → SQL → pega y ejecuta{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/setup-levels-preguntas-audios.sql</code> (todo
                        en un solo archivo). Alternativa en dos pasos:{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/create-levels-preguntas-audios.sql</code> y luego{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/levels-preguntas-audios-rls.sql</code>.
                        <br />
                        <span style={{ opacity: 0.92 }}>Detalle: {preguntaAudiosError}</span>
                      </>
                    ) : (
                      <>
                        No se pudieron leer los audios desde{' '}
                        <code style={{ fontSize: '0.85em' }}>levels_preguntas_audios</code>: {preguntaAudiosError}.
                        Si es un problema de permisos, en Supabase añade una política RLS de SELECT para el rol{' '}
                        <code style={{ fontSize: '0.85em' }}>anon</code> (ver{' '}
                        <code style={{ fontSize: '0.85em' }}>scripts/levels-preguntas-audios-rls.sql</code>).
                      </>
                    )}
                  </p>
                ) : null}

                {showAudioFromEnunciado && hasDbClipsWithNoValidUrl ? (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: '#fffbeb',
                      border: '1px solid #fbd38d',
                      borderRadius: '8px',
                      color: '#744210',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Hay filas en <code style={{ fontSize: '0.85em' }}>levels_preguntas_audios</code> para esta
                    pregunta, pero ninguna <code style={{ fontSize: '0.85em' }}>audio_url</code> es válida (revisa
                    URL pública o firmada hasta el fichero .mp3). Puedes tener varias filas por la misma{' '}
                    <code style={{ fontSize: '0.85em' }}>pregunta_id</code> con distinto <code style={{ fontSize: '0.85em' }}>orden</code>.
                  </p>
                ) : null}

                {(audioPlayersFromDb.length > 0 || showEnunciadoFallbackAudio) ? (
                  <div style={{ marginTop: '0.85rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1a365d' }}>Audio</p>
                    {audioPlayersFromDb.map((p) => (
                      <div key={p.key} style={{ marginBottom: '0.85rem' }}>
                        {audioPlayersFromDb.length > 1 ? (
                          <p
                            style={{
                              margin: '0 0 0.35rem',
                              fontSize: '0.9rem',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            {p.label}
                          </p>
                        ) : null}
                        <ExamListeningAudioPlayer
                          src={p.src}
                          examMode={examListeningAudioStrict}
                          clipKey={p.key}
                          lang={lang}
                        />
                      </div>
                    ))}
                    {showEnunciadoFallbackAudio ? (
                      <div style={{ marginTop: audioPlayersFromDb.length > 0 ? '0.75rem' : 0 }}>
                        {audioPlayersFromDb.length > 0 ? (
                          <p
                            style={{
                              margin: '0 0 0.35rem',
                              fontSize: '0.9rem',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            Audio (enunciado)
                          </p>
                        ) : null}
                        <ExamListeningAudioPlayer
                          src={resolvedTextEnunciadoAudioSrc}
                          examMode={examListeningAudioStrict}
                          clipKey={`enunciado-${selectedQuestion?.preguntaId || partNumber}`}
                          lang={lang}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                  </>
                }
                questions={
                  <>
                  {showLongWritingWithAi ? (
                    <>
                      {a2WritingDemo ? (
                        <A2WritingTaskCard
                          partTitle={a2WritingDemo.partTitle}
                          questionLabel={a2WritingDemo.questionLabel}
                          scenario={a2WritingDemo.scenario}
                          bulletsIntro={a2WritingDemo.bulletsIntro}
                          bullets={a2WritingDemo.bullets}
                          pictures={a2WritingDemo?.pictures || []}
                          wordCountNote={a2WritingDemo.wordCountNote}
                          answerSheetNote={a2WritingDemo.answerSheetNote}
                        />
                      ) : null}
                      <B2WritingLongFormAiPanel
                        storageKey={longWritingStorageKey}
                        wordMin={effectiveWritingWordMin}
                        wordMax={effectiveWritingWordMax}
                        heading={`Your answer — ${getPartTitle(selectedPart)}`}
                        partLabel={selectedPart.nombre}
                        partDescription={selectedPart.descripcion || ''}
                        taskInstructions={
                          selectedPartContent.enunciado || a2WritingDemoInstructions || ''
                        }
                        taskInputText={selectedPartContent.texto || ''}
                        onScoresReady={handleWritingScoresReady}
                        lang={lang}
                      />
                    </>
                  ) : null}

                  {!showLongWritingWithAi && useOpenInputUi && openQuestionNumbers.length > 0
                    ? openQuestionNumbers.map((questionNumber) => {
                        const questionKey = getQuestionKey(selectedPart.id, questionNumber, 'open');
                        const currentValue = openInputs[questionKey] || '';
                        const checkResult = openChecks[questionKey];
                        return (
                          <B2ExamQuestionItem
                            key={`open-${selectedQuestion.preguntaId}-${questionNumber}`}
                          >
                            <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                              Question {questionNumber}
                            </p>
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setOpenInputs((prev) => ({ ...prev, [questionKey]: value }));
                                  setOpenChecks((prev) => ({ ...prev, [questionKey]: undefined }));
                                }}
                                placeholder="Your answer"
                                style={{
                                  minWidth: '240px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e0',
                                  padding: '0.65rem 0.75rem',
                                }}
                              />
                              {!hideFeedbackResolved && !hidePracticeChecks ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
                                  const isCorrect = expectedAnswers.has(normalizeText(currentValue));
                                  const prevResult = openChecks[questionKey];
                                  const nextOpenChecks = { ...openChecks, [questionKey]: isCorrect };
                                  setOpenChecks(nextOpenChecks);
                                  trySavePartAfterAnswer({ openChecks: nextOpenChecks });
                                  if (typeof prevResult !== 'boolean') {
                                    const correctChoiceText =
                                      [...expectedAnswers].slice(0, 4).join(' · ') || 'respuesta modelo';
                                    const answersFromDatabase = [...expectedAnswers].join(' · ');
                                    requestAiJustification(questionKey, {
                                      partLabel: selectedPart?.nombre || '',
                                      questionLabel: `Question ${questionNumber}`,
                                      questionNumber,
                                      ...resolveCorrectAnswerRowIds(
                                        selectedQuestion?.respuestasAbiertas,
                                        selectedQuestion?.respuestas,
                                        questionNumber,
                                      ),
                                      style: 'open-answer',
                                      userChoiceText: currentValue,
                                      correctChoiceText,
                                      isCorrect,
                                      answersFromDatabase: answersFromDatabase || undefined,
                                    });
                                    void (async () => {
                                      const uid = await getSessionUserId();
                                      const pid = selectedQuestion?.preguntaId;
                                      const parteId = selectedPart?.id;
                                      if (!uid || !pid || !parteId) return;
                                      const { error } = await recordLevelsAnswerEvaluation({
                                        userId: uid,
                                        preguntaId: pid,
                                        parteId,
                                        isCorrect,
                                        slotLabel: `Question ${questionNumber}`,
                                        userAnswerText: currentValue,
                                      });
                                      if (error) {
                                        console.warn('levels eval/puntuacion:', error.message || error);
                                      }
                                    })();
                                  }
                                }}
                                style={{
                                  borderRadius: '8px',
                                  border: '1px solid #2b6cb0',
                                  background: '#ebf8ff',
                                  color: '#1a365d',
                                  padding: '0.6rem 0.9rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Check
                              </button>
                              ) : null}
                            </div>
                          </B2ExamQuestionItem>
                        );
                      })
                    : null}
                  {!showLongWritingWithAi && !(useOpenInputUi && openQuestionNumbers.length > 0) ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {effectiveMcqGroups.length === 0 &&
                      !(useOpenInputUi && openQuestionNumbers.length > 0) ? (
                        <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.55 }}>
                          {levelSlug === 'a2' && adminFlow.isAdmin && a2McqPartsExpectOptions ? (
                            <>
                              No se pueden mostrar las preguntas de esta parte: faltan opciones A/B/C en
                              Supabase o el enunciado no tiene el formato nuevo.
                              {a2EmptyPartHint ? (
                                <>
                                  <br />
                                  <span style={{ opacity: 0.9 }}>{a2EmptyPartHint}</span>
                                </>
                              ) : null}
                              <br />
                              Regenera el examen completo desde el selector (admin) y recarga la página.
                            </>
                          ) : (
                            'No hay opciones de respuesta para este ejercicio. Un administrador debe generar el examen con DRALO AI.'
                          )}
                        </p>
                      ) : null}
                      {useA2OfficialReadingUi && partNumber === 1 && a2Part1Groups.length > 0 ? (
                        <A2Part1ExamShell
                          showDemoNote={useA2Part1OfficialDemo}
                          examSlot={examSlot}
                          directions={
                            a2Part1Pack?.directions ||
                            selectedPart?.descripcion ||
                            ''
                          }
                          example={a2Part1Pack?.example}
                          groups={a2Part1Groups}
                          getQuestionKey={getQuestionKey}
                          selectedPart={selectedPart}
                          selectedOptions={selectedOptions}
                          checkedQuestions={checkedQuestions}
                          hideFeedback={hideFeedbackResolved}
                          onOptionSelect={handleA2McqOptionSelect}
                          aiHintsByKey={aiHintsByKey}
                        />
                      ) : null}
                      {useA2OfficialReadingUi && partNumber === 2 && a2Part2Groups.length > 0 ? (
                        <A2Part2ExamShell
                          showDemoNote={useA2Part2OfficialDemo}
                          examSlot={examSlot}
                          directions={a2Part2Directions}
                          passageText={a2Part2PassageText}
                          profileNames={a2Part2ProfileNames}
                          groups={a2Part2Groups}
                          getQuestionKey={getQuestionKey}
                          selectedPart={selectedPart}
                          selectedOptions={selectedOptions}
                          checkedQuestions={checkedQuestions}
                          hideFeedback={hideFeedbackResolved}
                          onOptionSelect={handleA2McqOptionSelect}
                          aiHintsByKey={aiHintsByKey}
                        />
                      ) : null}
                      {useA2OfficialReadingUi && partNumber === 3 && a2Part3Groups.length > 0 ? (
                        <A2Part3ExamShell
                          showDemoNote={useA2Part3OfficialDemo}
                          examSlot={examSlot}
                          directions={a2Part3Directions}
                          passageTitle={a2Part3PassageMeta.title}
                          passageParagraphs={a2Part3PassageMeta.paragraphs}
                          passageText={a2Part3PassageText}
                          groups={a2Part3Groups}
                          getQuestionKey={getQuestionKey}
                          selectedPart={selectedPart}
                          selectedOptions={selectedOptions}
                          checkedQuestions={checkedQuestions}
                          hideFeedback={hideFeedbackResolved}
                          onOptionSelect={handleA2McqOptionSelect}
                          aiHintsByKey={aiHintsByKey}
                        />
                      ) : null}
                      {useA2OfficialReadingUi && partNumber === 4 && a2Part4Groups.length > 0 ? (
                        <A2Part4ExamShell
                          showDemoNote={useA2Part4OfficialDemo}
                          examSlot={examSlot}
                          directions={a2Part4Directions}
                          passageTitle={a2Part4PassageMeta.title}
                          passageParagraphs={a2Part4PassageMeta.paragraphs}
                          passageText={a2Part4PassageText}
                          groups={a2Part4Groups}
                          getQuestionKey={getQuestionKey}
                          selectedPart={selectedPart}
                          selectedOptions={selectedOptions}
                          checkedQuestions={checkedQuestions}
                          hideFeedback={hideFeedbackResolved}
                          onOptionSelect={handleA2McqOptionSelect}
                          aiHintsByKey={aiHintsByKey}
                        />
                      ) : null}
                      {useA2ListeningPictureUi && a2Part8Groups.length > 0 ? (
                        <A2Part8ExamShell
                          showDemoNote={useA2Part8OfficialDemo}
                          examSlot={examSlot}
                          directions={a2Part8Directions}
                          groups={a2Part8Groups}
                          getQuestionKey={getQuestionKey}
                          selectedPart={selectedPart}
                          selectedOptions={selectedOptions}
                          checkedQuestions={checkedQuestions}
                          hideFeedback={hideFeedbackResolved}
                          onOptionSelect={handleA2McqOptionSelect}
                          aiHintsByKey={aiHintsByKey}
                        />
                      ) : useA2ListeningPictureUi ? (
                        <A2ListeningPictureMcq
                          groups={effectiveMcqGroups}
                          renderQuestionBlock={(group, groupIndex) =>
                            renderA2McqBlock(group, groupIndex, 'listening-pictures')
                          }
                        />
                      ) : null}
                      {!useA2OfficialReadingUi && !useA2ListeningPictureUi && !isB2Part1InlineMcq
                        ? effectiveMcqGroups.map((group, groupIndex) => (
                        <B2ExamQuestionItem
                          key={`group-${selectedQuestion.preguntaId}-${group.questionNumber ?? 'extra'}-${groupIndex}`}
                        >
                          <p className="levels-listening-mcq-question-label">
                            {group.questionNumber ? `Question ${group.questionNumber}` : 'Options'}
                          </p>
                          {group.prompt ? (
                            <p className="levels-listening-mcq-question-prompt">
                              {group.prompt}
                            </p>
                          ) : null}
                          <div className="levels-listening-mcq-options-grid">
                            {group.options.map((option) => {
                              const questionKey = getQuestionKey(
                                selectedPart.id,
                                group.questionNumber,
                                `extra-${groupIndex}`,
                              );
                              const isSelected = selectedOptions[questionKey] === option.id;
                              const isChecked = checkedQuestions[questionKey];
                              const isCorrect = !!option.correcta;
                              const showCorrect = !hideFeedbackResolved && isChecked && isCorrect;
                              const showIncorrect = !hideFeedbackResolved && isChecked && isSelected && !isCorrect;

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => {
                                    handleA2McqOptionSelect({
                                      group,
                                      groupIndex,
                                      option,
                                      questionKey,
                                    });
                                  }}
                                  className={getListeningMcqOptionClassName({
                                    isSelected,
                                    showCorrect,
                                    showIncorrect,
                                  })}
                                >
                                  {option.formattedText || option.respuesta}
                                </button>
                              );
                            })}
                          </div>
                        </B2ExamQuestionItem>
                      ))
                        : null}
                    </div>
                  ) : null}
                  </>
                }
              />
              ))}
          </>
        )}
      </section>

      <AdminExamPartPromptBox
        enabled={adminFlow.isAdmin}
        slug={levelSlug}
        partNumber={partNumber}
        examSlot={examSlot}
        lang={lang}
      />

      {!(selectedPart && selectedQuestion && useListeningItemLayout) ? moduleNavEl : null}
      </PracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function B2ExamPaperPracticePage(props) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Loading practice…
        </main>
      }
    >
      <ReadingPracticeSessionProvider>
        <B2ExamPaperPracticePageInner {...props} />
      </ReadingPracticeSessionProvider>
    </Suspense>
  );
}
