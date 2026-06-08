'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useLevelExamPracticeSlot } from '@/hooks/useLevelExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { B2ExamPracticeContent, B2ExamQuestionItem } from '@/components/b2/B2ExamPracticeContent';
import B2ExamInlineMcqClozePassage from '@/components/b2/B2ExamInlineMcqClozePassage';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { useLevelExamScoringSession } from '@/hooks/useLevelExamScoringSession';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getLevelsPartScoring } from '@/utils/levelsA2PartScoring';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
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
} from '@/utils/b2ExamTextBlocks';
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
  getGroupedAnswers,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
  splitEnunciadoAndTextFallback,
  extractFirstAudioUrl,
  isStandaloneAudioLine,
  isUsableQuestionAudioUrl,
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
import { useSkillPartFirstNavigation } from '@/hooks/useSkillPartFirstNavigation';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import { scoreExamModeDrafts } from '@/utils/examModeGradeAnswers';

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
  const b2Slot = useB2ExamPracticeSlot();
  const levelSlot = useLevelExamPracticeSlot(levelSlug);
  const examSlot = levelSlug === 'b2' ? b2Slot.examSlot : levelSlot.examSlot;
  const selectExamSlot = levelSlug === 'b2' ? b2Slot.selectExamSlot : levelSlot.selectExamSlot;
  const b2Scoring = useB2ExamScoringSession({ partMin, partMax });
  const levelScoring = useLevelExamScoringSession({ slug: levelSlug, partMin, partMax });
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
    section: examSection,
    handleFinishSection,
    setSectionRemaining,
  } = examMode;
  const examDraftRef = useRef({});
  const prevExamPartRef = useRef(null);
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
  const loadedPartsRangeRef = useRef('');
  /** Estructura de partes (sin preguntas) para reutilizar al cambiar de examen. */
  const partsShellRef = useRef([]);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setAiHintsByKey({});
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
          slot: examSlot,
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
              .select('id, pregunta_id_abierta, respuesta_texto')
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

      setPartsData(normalizedParts);
      setSelectedPartId(normalizedParts[0]?.id || null);
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
      setSelectedQuestionByPart(initialQuestionSelection);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Error cargando datos.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [emptyErrorMessage, examSlot, partMax, partMin, levelSlug, levelTag]);

  const adminFlow = useLevelsExamAdminFlow({
    slug: levelSlug,
    examenIdBySlot: scoring.examenIdBySlot,
    onCatalogUpdated: () => {
      if (levelSlug === 'a2') {
        void scoring.reloadExamCatalog?.();
      } else if (levelSlug === 'b2') {
        void scoring.reloadExamenCatalog?.();
      } else {
        void reloadExamCatalog?.();
      }
      void loadData();
      void reloadExamNamesBySlot(levelSlug).then(({ names }) => setExamLabelsBySlot(names));
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
    enabled: Boolean(skillRoute) && !examModeActive,
    slug: levelSlug,
    skillRoute,
    partMin,
    partMax,
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

  const handleKeepPracticing = useCallback(() => {
    scoring.setExamPracticeOpen(false);
    void scoring.refreshPuntuacionesProgress();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scoring]);

  const displayPartsData = useMemo(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber) return partsData;
    return partsData.filter(
      (p) => Number(p.nombre?.match(/\d+/)?.[0] || 0) === skillNav.selectedPartNumber,
    );
  }, [partsData, skillNav.active, skillNav.selectedPartNumber]);

  useEffect(() => {
    if (!skillNav.active || !skillNav.selectedPartNumber || !displayPartsData.length) return;
    const target = displayPartsData[0];
    if (target?.id && target.id !== selectedPartId) setSelectedPartId(target.id);
  }, [skillNav.active, skillNav.selectedPartNumber, displayPartsData, selectedPartId]);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

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
    () => displayPartsData.find((part) => part.id === selectedPartId),
    [displayPartsData, selectedPartId],
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
    if (examModeActive && !reviewMode) {
      const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
      if (prevExamPartRef.current != null && prevExamPartRef.current !== pn && selectedPart) {
        examDraftRef.current[prevExamPartRef.current] = {
          preguntaId: selectedQuestion?.preguntaId,
          selectedOptions: { ...selectedOptions },
          openInputs: { ...openInputs },
          checkedQuestions: { ...checkedQuestions },
        };
      }
      const draft = examDraftRef.current[pn];
      if (draft) {
        setSelectedOptions(draft.selectedOptions || {});
        setOpenInputs(draft.openInputs || {});
        setCheckedQuestions(draft.checkedQuestions || {});
      } else {
        setOpenInputs({});
        setSelectedOptions({});
        setCheckedQuestions({});
      }
      setOpenChecks({});
      setAiHintsByKey({});
      prevExamPartRef.current = pn;
      return;
    }
    setOpenInputs({});
    setOpenChecks({});
    setSelectedOptions({});
    setCheckedQuestions({});
    setAiHintsByKey({});
  }, [
    selectedQuestion?.preguntaId,
    selectedPart?.id,
    selectedPart?.nombre,
    examModeActive,
    reviewMode,
  ]);

  const partNumber = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

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
    return {
      enunciado: desc || fallback.enunciado,
      texto,
      preguntasPart1Parse,
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumber, levelSlug]);

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
    if (!parsed.length || !selectedQuestion?.preguntaId) return null;
    const pid = selectedQuestion.preguntaId;
    const letters = ['A', 'B', 'C', 'D'];
    return parsed
      .map(({ questionNumber, options: byLetter }) => {
        const correctL = part1CorrectLetterByQuestion.get(questionNumber);
        const opts = letters
          .map((L) => {
            const word = byLetter[L];
            if (!word || !String(word).trim()) return null;
            return {
              id: `b2-p1-${pid}-q${questionNumber}-${L}`,
              respuesta: `${questionNumber} ${L} ${word}`,
              formattedText: `${L}) ${word}`,
              correcta: correctL != null ? L === correctL : false,
            };
          })
          .filter(Boolean);
        if (opts.length < 2) return null;
        return { questionNumber, options: opts };
      })
      .filter(Boolean);
  }, [
    levelSlug,
    partNumber,
    part1CorrectLetterByQuestion,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
  ]);

  const isB2Part1InlineMcq =
    levelSlug === 'b2' && partNumber === 1 && (b2Part1McqGroups?.length ?? 0) > 0;

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

  const listeningContextBlocks = useMemo(() => {
    if (isListeningGapPart) {
      return splitListeningOpenGapContextByQuestion(selectedQuestion?.enunciado || '');
    }
    if (partNumber === 12) {
      const blob = textoLinesForDisplay.length
        ? textoLinesForDisplay.join('\n')
        : selectedQuestion?.enunciado || '';
      return splitListeningSpeakerContextByQuestion(blob);
    }
    return splitListeningMcqContextByQuestion(textoLinesForDisplay);
  }, [isListeningGapPart, partNumber, textoLinesForDisplay, selectedQuestion?.enunciado]);

  const listeningMatchingPool = useMemo(() => {
    if (partNumber !== 12) return [];
    const blob = textoLinesForDisplay.length
      ? textoLinesForDisplay
      : String(selectedQuestion?.enunciado || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
    return extractListeningMatchingOptionPool(blob);
  }, [partNumber, textoLinesForDisplay, selectedQuestion?.enunciado]);

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

  /**
   * Los huecos a pintar se derivan del enunciado (marcadores `(N) ___` o números a inicio
   * de línea). Si la BD tiene respuestas para huecos que no figuran en el texto, se
   * descartan para evitar inputs huérfanos.
   */
  const openQuestionNumbers = useMemo(() => {
    const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
    const fromPrompt = inferredOpenQuestionNumbers;
    if (fromPrompt.length > 0 && fromAnswers.length > 0) {
      const promptSet = new Set(fromPrompt);
      const intersection = fromAnswers.filter((n) => promptSet.has(n));
      if (intersection.length > 0) return intersection;
      return fromPrompt;
    }
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

  /** Parte 11 y 13: un único audio por pregunta de examen (monólogo / entrevista). */
  const listeningMonologueClip = useMemo(() => {
    if (listeningReadyClips.length === 0) return null;
    if (isListeningGapPart) return listeningReadyClips[0];
    if (partNumber === 13 && listeningReadyClips.length === 1) return listeningReadyClips[0];
    return null;
  }, [isListeningGapPart, partNumber, listeningReadyClips]);

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

  const partScoreMetrics = useMemo(
    () =>
      computeLevelsPartScore({
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

  const getPartTitle = (part) => {
    const n = Number(part?.nombre.match(/\d+/)?.[0] || 0);
    return n ? `Part ${n}` : part?.nombre || '';
  };

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
      });
      if (!progress.complete) return;
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
      const wasChecked = checkedQuestions[questionKey];
      const nextChecked = { ...checkedQuestions, [questionKey]: true };
      setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
      setCheckedQuestions(nextChecked);
      trySavePartAfterAnswer({ checkedQuestions: nextChecked });
      if (!wasChecked && !hideFeedback) {
        const correctOpt = group.options.find((o) => o.correcta);
        const answersFromDatabase = group.options
          .map((o) => (o.formattedText || o.respuesta || '').trim())
          .filter(Boolean)
          .join('\n');
        requestAiJustification(questionKey, {
          partLabel: selectedPart?.nombre || '',
          questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
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
      hideFeedback,
      requestAiJustification,
      selectedPart?.id,
      selectedPart?.nombre,
      selectedQuestion?.preguntaId,
      trySavePartAfterAnswer,
    ],
  );

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
          hideFeedback={hideFeedback}
          onOptionSelect={handleA2McqOptionSelect}
          afterOptions={
            <A2McqFeedback
              show={!hideFeedback && isChecked}
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
      hideFeedback,
      selectedOptions,
      selectedPart,
    ],
  );

  const handleExamModeFinish = useCallback(() => {
    const pn = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
    if (pn && selectedPart) {
      examDraftRef.current[pn] = {
        preguntaId: selectedQuestion?.preguntaId,
        selectedOptions: { ...selectedOptions },
        openInputs: { ...openInputs },
        checkedQuestions: { ...checkedQuestions },
      };
    }
    const { scores, partSnapshots } = scoreExamModeDrafts({
      partMin,
      partMax,
      partsData,
      draftByPart: examDraftRef.current,
    });
    handleFinishSection({ draftByPart: examDraftRef.current }, scores);
    void (async () => {
      const uid = await getSessionUserId();
      const examenId = scoring.currentExamenId || scoring.examenIdBySlot?.[examSlot];
      if (!uid || !examenId) return;
      const { persistExamModeSectionScores } = await import('@/utils/persistExamModeSectionScores');
      await persistExamModeSectionScores({ userId: uid, examenId, partSnapshots });
    })();
  }, [
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
  ]);

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
        correctCount: partScoreMetrics.correctCount,
        totalSlots: partScoringCfg?.total ?? partScoreMetrics.totalSlots,
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
  }, [partsData, selectedPartId]);

  const chromeSubtitle = isSkillPracticeSession ? null : subtitle;

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
        title={title}
        subtitle={chromeSubtitle}
        hideMascot={isSkillPracticeSession}
        hideSubtitle={isSkillPracticeSession}
        compactSkillHeader={isSkillPracticeSession}
        skillPracticeTheme={skillNav.skillTheme}
        timerLabel={timerLabel}
        refreshLabel={refreshLabel}
        loading={loading}
        onRefresh={() => loadData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={examModeActive && !reviewMode}
        partFinishNotice={examModeActive && !reviewMode ? null : scoring.partFinishNotice}
        partsData={!loading && !error ? displayPartsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        lang={lang}
        workPanelClassName={
          levelSlug === 'a2' && partNumber >= 1 && partNumber <= 7
            ? 'levels-b2-practice__work-panel--a2-rw'
            : ''
        }
      >
      {examModeActive && examSection ? (
        <ExamModeSectionBanner
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
                  hideFeedback={hideFeedback}
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
              <div className="levels-exam-split-page levels-exam-practice-page--narrow">
              <div className="levels-exam-split-card">
                <h2>{getPartTitle(selectedPart)}</h2>

                <div className="levels-exam-split__body levels-exam-split__body--stacked">
                  {selectedPartContent.enunciado ? (
                    <div className="levels-exam-split__enunciado">
                      <p className="levels-exam-split__section-title">Directions</p>
                      {getFormattedEnunciado(selectedPartContent.enunciado).map((block, index) => {
                      if (block.type === 'partTitle') {
                        return (
                          <p
                            key={`enunciado-${block.type}-${index}`}
                            className="levels-exam-enunciado__part-title"
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'label') {
                        return (
                          <p
                            key={`enunciado-${block.type}-${index}`}
                            style={{ margin: '0.7rem 0 0.45rem', fontWeight: 700, color: '#1a365d' }}
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'answer') {
                        return (
                          <p
                            key={`enunciado-${block.type}-${index}`}
                            style={{
                              margin: '0.45rem 0',
                              padding: '0.45rem 0.6rem',
                              background: '#ebf8ff',
                              borderRadius: '8px',
                              fontWeight: 600,
                            }}
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'number') {
                        return (
                          <p
                            key={`enunciado-${block.type}-${index}`}
                            style={{ margin: '0.35rem 0', fontWeight: 700, color: '#2d3748' }}
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'option') {
                        return (
                          <p
                            key={`enunciado-${block.type}-${index}`}
                            style={{ margin: '0.2rem 0', paddingLeft: '0.35rem', color: '#334155' }}
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'image' && block.url) {
                        return (
                          <img
                            key={`enunciado-image-${index}`}
                            src={block.url}
                            alt=""
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              margin: '0.5rem 0',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        );
                      }
                      return (
                        <p
                          key={`enunciado-${block.type}-${index}`}
                          style={{ margin: '0.45rem 0', lineHeight: 1.7, color: '#1f2937' }}
                        >
                          {block.text}
                        </p>
                      );
                    })}
                    </div>
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
                        <audio
                          controls
                          src={resolvePublicOrSiteAudioSrc(
                            String(listeningMonologueClip.url),
                            listeningMonologueClip.id || 'mono',
                          )}
                          style={{ width: '100%' }}
                        >
                          <track kind="captions" />
                        </audio>
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
                        <audio
                          key={resolvedTextEnunciadoAudioSrc}
                          controls
                          src={resolvedTextEnunciadoAudioSrc}
                          style={{ width: '100%' }}
                        >
                          <track kind="captions" />
                        </audio>
                      </div>
                    ) : null}
                    {listeningMatchingPool.length > 0 ? (
                      <div
                        style={{
                          marginTop: '1rem',
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                        }}
                      >
                        <p style={{ margin: '0 0 0.55rem', fontWeight: 700, color: '#1e293b' }}>
                          Options A–H
                        </p>
                        {listeningMatchingPool.map((line, pi) => (
                          <p key={`pool-${pi}`} style={{ margin: '0.35rem 0', lineHeight: 1.6, color: '#334155' }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1.25rem' }}>
                      {listeningQuestionNumbersOrdered.map((qn) => {
                        const isOpenGapItem = isListeningGapPart;
                        const group = isOpenGapItem
                          ? null
                          : groupedAnswers.find((g) => g.questionNumber === qn);
                        if (!isOpenGapItem && (!group || !group.options?.length)) return null;

                        const groupIndex = group ? groupedAnswers.indexOf(group) : -1;
                        const ctx = listeningContextBlocks.find((b) => b.questionNumber === qn);
                        const hidePerItemAudio = Boolean(listeningMonologueClip);
                        const clip = isOpenGapItem || hidePerItemAudio
                          ? null
                          : pickListeningClipForQuestion(listeningReadyClips, qn, partNumber);
                        const clipSrc =
                          !hidePerItemAudio && clip?.url
                            ? resolvePublicOrSiteAudioSrc(String(clip.url), clip.id || `p${partNumber}-q${qn}`)
                            : '';
                        const clipLabel = '';

                        if (isOpenGapItem) {
                          const questionKey = getQuestionKey(selectedPart.id, qn, 'open');
                          const currentValue = openInputs[questionKey] || '';
                          const checkResult = openChecks[questionKey];
                          return (
                            <div
                              key={`listen-item-${selectedQuestion.preguntaId}-${qn}`}
                              style={{
                                border: '1px solid #cbd5e1',
                                borderRadius: '12px',
                                padding: '1rem 1.1rem',
                                background: '#ffffff',
                                boxShadow: '0 1px 5px rgba(15, 23, 42, 0.07)',
                              }}
                            >
                              <p
                                style={{
                                  margin: '0 0 0.75rem',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  fontSize: '1.05rem',
                                }}
                              >
                                Item {qn}
                              </p>
                              {ctx?.contextLines?.length ? (
                                <div
                                  style={{
                                    marginBottom: '0.85rem',
                                    padding: '0.75rem 0.85rem',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                  }}
                                >
                                  {ctx.contextLines.map((line, li) => (
                                    <p
                                      key={`ctx-${qn}-${li}`}
                                      style={{ margin: li === 0 ? '0 0 0.4rem' : '0.4rem 0', lineHeight: 1.65 }}
                                    >
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              ) : null}
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
                                    flex: '1 1 240px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e0',
                                    padding: '0.65rem 0.75rem',
                                  }}
                                />
                                {!hideFeedback ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const expectedAnswers = openAnswerMap.get(qn) || new Set();
                                    const isCorrect = expectedAnswers.has(normalizeText(currentValue));
                                    const prevResult = openChecks[questionKey];
                                    setOpenChecks((prev) => ({ ...prev, [questionKey]: isCorrect }));
                                    if (typeof prevResult !== 'boolean') {
                                      const correctChoiceText =
                                        [...expectedAnswers].slice(0, 4).join(' · ') || 'respuesta modelo';
                                      const answersFromDatabase = [...expectedAnswers].join(' · ');
                                      requestAiJustification(questionKey, {
                                        partLabel: selectedPart?.nombre || '',
                                        questionLabel: `Question ${qn}`,
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
                              {!hideFeedback && typeof checkResult === 'boolean' ? (
                                <>
                                  <p
                                    style={{
                                      margin: '0.7rem 0 0',
                                      fontWeight: 700,
                                      color: checkResult ? '#2f855a' : '#c53030',
                                    }}
                                  >
                                    {checkResult ? 'Correcta' : 'Incorrecta'}
                                  </p>
                                  {(() => {
                                    const expected = openAnswerMap.get(qn);
                                    const list = expected && expected.size > 0 ? [...expected] : [];
                                    return (
                                      <p style={{ margin: '0.4rem 0 0', fontWeight: 600, color: '#1f2937' }}>
                                        Correct answer: {list.length > 0 ? list.join(' · ') : 'Not available'}
                                      </p>
                                    );
                                  })()}
                                  <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
                                </>
                              ) : null}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`listen-item-${selectedQuestion.preguntaId}-${qn}`}
                            style={{
                              border: '1px solid #cbd5e1',
                              borderRadius: '12px',
                              padding: '1rem 1.1rem',
                              background: '#ffffff',
                              boxShadow: '0 1px 5px rgba(15, 23, 42, 0.07)',
                            }}
                          >
                            <p
                              style={{
                                margin: '0 0 0.75rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                fontSize: '1.05rem',
                              }}
                            >
                              Item {qn}
                            </p>
                            {clipSrc ? (
                              <div style={{ marginBottom: ctx?.contextLines?.length ? '0.85rem' : 0 }}>
                                {clipLabel ? (
                                  <p
                                    style={{
                                      margin: '0 0 0.35rem',
                                      fontSize: '0.9rem',
                                      color: '#334155',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {clipLabel}
                                  </p>
                                ) : null}
                                <audio controls src={clipSrc} key={clipSrc} style={{ width: '100%' }}>
                                  <track kind="captions" />
                                </audio>
                              </div>
                            ) : !listeningMonologueClip ? (
                              <p
                                style={{
                                  margin: '0 0 0.75rem',
                                  fontSize: '0.88rem',
                                  color: '#64748b',
                                  fontStyle: 'italic',
                                }}
                              >
                                No hay audio enlazado para este ítem en la base de datos.
                              </p>
                            ) : null}
                            {ctx?.contextLines?.length ? (
                              <div
                                style={{
                                  marginBottom: '0.85rem',
                                  padding: '0.75rem 0.85rem',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                }}
                              >
                                {ctx.contextLines.map((line, li) => (
                                  <p
                                    key={`ctx-${qn}-${li}`}
                                    style={{ margin: li === 0 ? '0 0 0.4rem' : '0.4rem 0', lineHeight: 1.65 }}
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                            <p style={{ margin: '0 0 0.55rem', fontWeight: 700, color: '#1e293b' }}>Options</p>
                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                              {group.options.map((option) => {
                                const questionKey = getQuestionKey(
                                  selectedPart.id,
                                  group.questionNumber,
                                  `extra-${groupIndex}`,
                                );
                                const isSelected = selectedOptions[questionKey] === option.id;
                                const isChecked = checkedQuestions[questionKey];
                                const isCorrect = !!option.correcta;
                                const showCorrect = !hideFeedback && isChecked && isCorrect;
                                const showIncorrect = !hideFeedback && isChecked && isSelected && !isCorrect;

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      const wasChecked = checkedQuestions[questionKey];
                                      const nextChecked = { ...checkedQuestions, [questionKey]: true };
                                      setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
                                      setCheckedQuestions(nextChecked);
                                      trySavePartAfterAnswer({ checkedQuestions: nextChecked });
                                      if (!wasChecked && !hideFeedback) {
                                        const correctOpt = group.options.find((o) => o.correcta);
                                        const answersFromDatabase = group.options
                                          .map((o) => (o.formattedText || o.respuesta || '').trim())
                                          .filter(Boolean)
                                          .join('\n');
                                        requestAiJustification(questionKey, {
                                          partLabel: selectedPart?.nombre || '',
                                          questionLabel: group.questionNumber
                                            ? `Question ${group.questionNumber}`
                                            : 'Item',
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
                                              : 'Item',
                                            userAnswerText: option.formattedText || option.respuesta || '',
                                          });
                                          if (error) {
                                            console.warn('levels eval/puntuacion:', error.message || error);
                                          }
                                        })();
                                      }
                                    }}
                                    style={{
                                      textAlign: 'left',
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
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {option.formattedText || option.respuesta}
                                  </button>
                                );
                              })}
                            </div>
                            {(() => {
                              const questionKey = getQuestionKey(
                                selectedPart.id,
                                group.questionNumber,
                                `extra-${groupIndex}`,
                              );
                              const hasChecked = checkedQuestions[questionKey];
                              if (!hasChecked || hideFeedback) return null;
                              const correct = group.options.find((o) => o.correcta);
                              return (
                                <>
                                  <p style={{ margin: '0.7rem 0 0', fontWeight: 600, color: '#1f2937' }}>
                                    Correct answer:{' '}
                                    {correct?.formattedText || correct?.respuesta || 'Not available'}
                                  </p>
                                  <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
                                </>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                </div>
              </div>
              </div>
              ) : (
              <B2ExamPracticeContent
                title={a2EmbeddedReadingPart || a2WritingDemo ? '' : getPartTitle(selectedPart)}
                directionsText={
                  a2Part1Pack?.directions || selectedPartContent.enunciado
                }
                directionsLabel="Directions"
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
                      hideFeedback={hideFeedback}
                      aiHintsByKey={aiHintsByKey}
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
                        <audio controls src={p.src} style={{ width: '100%' }}>
                          <track kind="captions" />
                        </audio>
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
                        <audio
                          key={resolvedTextEnunciadoAudioSrc}
                          controls
                          src={resolvedTextEnunciadoAudioSrc}
                          style={{ width: '100%' }}
                        >
                          <track kind="captions" />
                        </audio>
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
                              {!hideFeedback ? (
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
                            {!hideFeedback && typeof checkResult === 'boolean' && (
                              <>
                                <p
                                  style={{
                                    margin: '0.7rem 0 0',
                                    fontWeight: 700,
                                    color: checkResult ? '#2f855a' : '#c53030',
                                  }}
                                >
                                  {checkResult ? 'Correcta' : 'Incorrecta'}
                                </p>
                                {(() => {
                                  const expected = openAnswerMap.get(questionNumber);
                                  const list =
                                    expected && expected.size > 0 ? [...expected] : [];
                                  return (
                                    <p style={{ margin: '0.4rem 0 0', fontWeight: 600, color: '#1f2937' }}>
                                      Correct answer:{' '}
                                      {list.length > 0 ? list.join(' · ') : 'Not available'}
                                    </p>
                                  );
                                })()}
                              </>
                            )}
                            <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
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
                          hideFeedback={hideFeedback}
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
                          hideFeedback={hideFeedback}
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
                          hideFeedback={hideFeedback}
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
                          hideFeedback={hideFeedback}
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
                          hideFeedback={hideFeedback}
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
                          <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: '#2d3748' }}>
                            {group.questionNumber ? `Question ${group.questionNumber}` : 'Options'}
                          </p>
                          {group.prompt ? (
                            <p style={{ margin: '0 0 0.65rem', lineHeight: 1.6, color: '#334155' }}>
                              {group.prompt}
                            </p>
                          ) : null}
                          <div style={{ display: 'grid', gap: '0.6rem' }}>
                            {group.options.map((option) => {
                              const questionKey = getQuestionKey(
                                selectedPart.id,
                                group.questionNumber,
                                `extra-${groupIndex}`,
                              );
                              const isSelected = selectedOptions[questionKey] === option.id;
                              const isChecked = checkedQuestions[questionKey];
                              const isCorrect = !!option.correcta;
                              const showCorrect = !hideFeedback && isChecked && isCorrect;
                              const showIncorrect = !hideFeedback && isChecked && isSelected && !isCorrect;

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => {
                                    const wasChecked = checkedQuestions[questionKey];
                                    const nextChecked = { ...checkedQuestions, [questionKey]: true };
                                    setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
                                    setCheckedQuestions(nextChecked);
                                    trySavePartAfterAnswer({ checkedQuestions: nextChecked });
                                    if (!wasChecked && !hideFeedback) {
                                      const correctOpt = group.options.find((o) => o.correcta);
                                      const answersFromDatabase = group.options
                                        .map((o) => (o.formattedText || o.respuesta || '').trim())
                                        .filter(Boolean)
                                        .join('\n');
                                      requestAiJustification(questionKey, {
                                        partLabel: selectedPart?.nombre || '',
                                        questionLabel: group.questionNumber
                                          ? `Question ${group.questionNumber}`
                                          : 'Item',
                                        userChoiceText: option.formattedText || option.respuesta || '',
                                        correctChoiceText:
                                          correctOpt?.formattedText || correctOpt?.respuesta || '',
                                        isCorrect: !!option.correcta,
                                        answersFromDatabase:
                                          answersFromDatabase ||
                                          undefined,
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
                                            : 'Item',
                                          userAnswerText: option.formattedText || option.respuesta || '',
                                        });
                                        if (error) {
                                          console.warn('levels eval/puntuacion:', error.message || error);
                                        }
                                      })();
                                    }
                                  }}
                                  style={{
                                    textAlign: 'left',
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
                                    cursor: 'pointer',
                                  }}
                                >
                                  {option.formattedText || option.respuesta}
                                </button>
                              );
                            })}
                          </div>

                          {(() => {
                            const questionKey = getQuestionKey(
                              selectedPart.id,
                              group.questionNumber,
                              `extra-${groupIndex}`,
                            );
                            const hasChecked = checkedQuestions[questionKey];
                            if (!hasChecked || hideFeedback) return null;
                            const correct = group.options.find((o) => o.correcta);
                            return (
                              <>
                                <p style={{ margin: '0.7rem 0 0', fontWeight: 600, color: '#1f2937' }}>
                                  Correct answer: {correct?.formattedText || correct?.respuesta || 'Not available'}
                                </p>
                                <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
                              </>
                            );
                          })()}
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

      <B2ExamPracticeModuleNav
        slug={levelSlug}
        partNumber={partNumber}
        pagePartMax={partMax}
        examSlot={examSlot}
        skillPracticeMode={isSkillPracticeSession}
        skillPracticeTheme={skillNav.skillTheme}
        onContinueInPage={isSkillPracticeSession ? handleKeepPracticing : handleContinueInPage}
        lang={lang}
      />
      </B2ExamPracticeChrome>
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
      <B2ExamPaperPracticePageInner {...props} />
    </Suspense>
  );
}
