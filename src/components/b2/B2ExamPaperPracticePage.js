'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import {
  extractTextoBloque,
  extractListeningMatchingOptionPool,
  isB2ListeningItemLayoutPart,
  splitListeningMcqContextByQuestion,
  splitListeningOpenGapContextByQuestion,
  splitListeningSpeakerContextByQuestion,
  trimListeningPart10DuplicateCycles,
} from '@/utils/b2ExamTextBlocks';
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
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { getCachedB2Level } from '@/utils/b2LevelCache';

const B2WritingLongFormAiPanel = dynamic(
  () => import('@/components/b2/B2WritingLongFormAiPanel'),
  { ssr: false, loading: () => <p className="loading">Loading feedback…</p> },
);

/** @param {string} url */
function resolvePublicOrSiteAudioSrc(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const bp = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${bp}${path}`;
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
 */
function B2ExamPaperPracticePageInner({
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
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoring = useB2ExamScoringSession({ partMin, partMax });
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
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);

      if (levelError || !levelData) throw new Error('No se pudo obtener el nivel B2.');

      const partNames = Array.from(
        { length: Math.max(0, partMax - partMin + 1) },
        (_, i) => `Parte ${partMin + i} B2`,
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
            examResolveError?.message || examResolveError?.details || 'Examen de B2 no resuelto.',
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
      const initialQuestionSelection = normalizedParts.reduce((acc, part) => {
        if (part.questions.length === 0) return acc;
        const randomIndex = Math.floor(Math.random() * part.questions.length);
        acc[part.id] = part.questions[randomIndex].preguntaId;
        return acc;
      }, {});
      setSelectedQuestionByPart(initialQuestionSelection);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Error cargando datos.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [emptyErrorMessage, examSlot, partMax, partMin]);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const selectedPart = useMemo(
    () => partsData.find((part) => part.id === selectedPartId),
    [partsData, selectedPartId],
  );

  const selectedQuestion = useMemo(() => {
    if (!selectedPart) return null;
    const selectedQuestionId = selectedQuestionByPart[selectedPart.id];
    return (
      selectedPart.questions.find((q) => q.preguntaId === selectedQuestionId) ||
      selectedPart.questions[0] ||
      null
    );
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
    setOpenInputs({});
    setOpenChecks({});
    setSelectedOptions({});
    setCheckedQuestions({});
    setAiHintsByKey({});
  }, [selectedQuestion?.preguntaId, selectedPart?.id]);

  const partNumber = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

  const b2PartCfg = getB2PartScoring(partNumber);

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
    const textoExtracted = extractTextoBloque(rawPregunta, partNumber) || '';
    let texto = (textoExtracted || fallback.texto || '').trim();
    if (partNumber === 10) {
      texto = trimListeningPart10DuplicateCycles(texto);
    }
    return {
      enunciado: desc || fallback.enunciado,
      texto,
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumber]);

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
      src: resolvePublicOrSiteAudioSrc(c.url),
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

  const hasMcqStyle = useMemo(
    () => groupedAnswers.some((g) => g.questionNumber != null && g.options.length >= 2),
    [groupedAnswers],
  );

  const listeningContextBlocks = useMemo(() => {
    if (partNumber === 11) {
      return splitListeningOpenGapContextByQuestion(selectedQuestion?.enunciado || '');
    }
    if (partNumber === 12) {
      const blob = textoLinesForDisplay.length
        ? textoLinesForDisplay.join('\n')
        : selectedQuestion?.enunciado || '';
      return splitListeningSpeakerContextByQuestion(blob);
    }
    return splitListeningMcqContextByQuestion(textoLinesForDisplay);
  }, [partNumber, textoLinesForDisplay, selectedQuestion?.enunciado]);

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
      (preferOpenInputs || (showAudioFromEnunciado && partNumber === 11)),
  );

  const useListeningItemLayout = useMemo(() => {
    if (!showAudioFromEnunciado || !isB2ListeningItemLayoutPart(partNumber)) return false;

    if (partNumber === 11) {
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
    partNumber,
    openQuestionNumbers.length,
    hasMcqStyle,
    groupedAnswers,
    listeningReadyClips.length,
    showEnunciadoFallbackAudio,
    listeningContextBlocks.length,
  ]);

  const listeningQuestionNumbersOrdered = useMemo(() => {
    const s = new Set();
    if (partNumber === 11) {
      openQuestionNumbers.forEach((n) => s.add(n));
    }
    groupedAnswers.forEach((g) => {
      if (g.questionNumber != null) s.add(g.questionNumber);
    });
    listeningContextBlocks.forEach((b) => s.add(b.questionNumber));
    return [...s].sort((a, b) => a - b);
  }, [groupedAnswers, listeningContextBlocks, partNumber, openQuestionNumbers]);

  /** Parte 11 y 13: un único audio por pregunta de examen (monólogo / entrevista). */
  const listeningMonologueClip = useMemo(() => {
    if (listeningReadyClips.length === 0) return null;
    if (partNumber === 11) return listeningReadyClips[0];
    if (partNumber === 13 && listeningReadyClips.length === 1) return listeningReadyClips[0];
    return null;
  }, [partNumber, listeningReadyClips]);

  /** Writing: inputs abiertos; en Listening parte 11 van en el layout por ítems. */
  const useOpenInputUi = Boolean(hasOpenAnswerSlots && !useListeningItemLayout);

  const partScoreMetrics = useMemo(
    () =>
      computeLevelsPartScore({
        useOpenInputUi: hasOpenAnswerSlots,
        openQuestionNumbers,
        openChecks,
        groupedAnswers,
        checkedQuestions,
        selectedOptions,
        getQuestionKey,
        partId: selectedPart?.id,
      }),
    [
      hasOpenAnswerSlots,
      openQuestionNumbers,
      openChecks,
      groupedAnswers,
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
    ],
  );

  const showLongWritingWithAi = Boolean(
    longFormWritingWithAi && partNumber >= 8 && partNumber <= 9 && selectedQuestion?.preguntaId,
  );

  const longWritingStorageKey = showLongWritingWithAi
    ? `b2-exam-writing-${selectedQuestion.preguntaId}`
    : '';

  const sectionMaxWidth = showLongWritingWithAi ? 'min(960px, 100%)' : '100%';

  const getPartTitle = (part) => {
    const n = Number(part?.nombre.match(/\d+/)?.[0] || 0);
    return n ? `Part ${n}` : part?.nombre || '';
  };

  const trySavePartAfterAnswer = useCallback(
    (stateOverride = {}) => {
      if (!scoring.examPracticeOpen || !selectedPart?.id || !selectedQuestion?.preguntaId || showLongWritingWithAi) {
        return;
      }
      const progress = computeB2PartProgressFromState({
        partNumber,
        useOpenInputUi: hasOpenAnswerSlots,
        openQuestionNumbers,
        openChecks: stateOverride.openChecks ?? openChecks,
        groupedAnswers,
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
    ],
  );

  useEffect(() => {
    setWritingLiveCorrect(null);
  }, [selectedPart?.id, selectedQuestion?.preguntaId]);

  const savedPartScore = scoring.progressBySlot[examSlot]?.parts?.[partNumber];
  const scorePanelProps = showLongWritingWithAi
    ? {
        correctCount: writingLiveCorrect ?? savedPartScore?.correct ?? 0,
        totalSlots: b2PartCfg?.total ?? 20,
        passingCount: b2PartCfg?.passing ?? 12,
      }
    : {
        correctCount: partScoreMetrics.correctCount,
        totalSlots: b2PartCfg?.total ?? partScoreMetrics.totalSlots,
        passingCount: b2PartCfg?.passing ?? partScoreMetrics.passingCount,
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
        total: b2PartCfg?.total ?? 20,
        passed: Boolean(scores.passed),
      });
    },
    [
      scoring,
      examSlot,
      partNumber,
      selectedPart,
      selectedQuestion?.preguntaId,
      b2PartCfg,
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

  return (
    <B2ExamPracticeLayout examPracticeOpen={scoring.examPracticeOpen}>
      <B2ExamPracticeChrome
        examSlot={examSlot}
        onSelectExam={(n) => scoring.handleSelectExam(selectExamSlot, n)}
        progressBySlot={scoring.progressBySlot}
        partsInPaper={scoring.partsInPaper}
        examPracticeOpen={scoring.examPracticeOpen}
        title={title}
        subtitle={subtitle}
        timerLabel={timerLabel}
        refreshLabel={refreshLabel}
        loading={loading}
        onRefresh={() => loadData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={false}
        partFinishNotice={scoring.partFinishNotice}
        partsData={!loading && !error ? partsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
        lang={lang}
      >
      <section style={{ maxWidth: sectionMaxWidth, margin: '0 auto', width: '100%' }}>
        {loading && <p style={{ textAlign: 'center' }}>{loadingLabel}</p>}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {selectedPart && !selectedQuestion && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h2 style={{ marginTop: 0 }}>{selectedPart.nombre}</h2>

                {selectedPart.descripcion ? (
                  <div style={{ color: '#2d3748', marginTop: '0.6rem' }}>
                    <strong>Pregunta:</strong>
                    <div
                      style={{
                        marginTop: '0.6rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.95rem 1rem',
                      }}
                    >
                      <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>Enunciado</p>
                      {getFormattedEnunciado(selectedPart.descripcion).map((block, index) => {
                        if (block.type === 'label') {
                          return (
                            <p
                              key={`preview-${block.type}-${index}`}
                              style={{ margin: '0.7rem 0 0.45rem', fontWeight: 700, color: '#1a365d' }}
                            >
                              {block.text}
                            </p>
                          );
                        }
                        if (block.type === 'answer') {
                          return (
                            <p
                              key={`preview-${block.type}-${index}`}
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
                              key={`preview-${block.type}-${index}`}
                              style={{ margin: '0.35rem 0', fontWeight: 700, color: '#2d3748' }}
                            >
                              {block.text}
                            </p>
                          );
                        }
                        if (block.type === 'option') {
                          return (
                            <p
                              key={`preview-${block.type}-${index}`}
                              style={{ margin: '0.2rem 0', paddingLeft: '0.35rem', color: '#334155' }}
                            >
                              {block.text}
                            </p>
                          );
                        }
                        return (
                          <p
                            key={`preview-${block.type}-${index}`}
                            style={{ margin: '0.45rem 0', lineHeight: 1.7, color: '#1f2937' }}
                          >
                            {block.text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0.6rem 0 0', color: '#4a5568' }}>
                    Esta parte aún no tiene enunciado en la base de datos.
                  </p>
                )}

                <p
                  style={{
                    marginTop: '1.25rem',
                    margin: '1.25rem 0 0',
                    color: '#4a5568',
                    fontSize: '0.95rem',
                    fontStyle: 'italic',
                  }}
                >
                  Las preguntas para esta parte estarán disponibles próximamente.
                </p>
              </div>
            )}

            {selectedPart && selectedQuestion && (
              <div
                className={`levels-exam-practice-page${
                  useListeningItemLayout ? ' levels-exam-practice-page--narrow' : ''
                }`}
              >
              <div className="levels-exam-split-card">
                <h2>{getPartTitle(selectedPart)}</h2>

                <div className="levels-exam-split__body levels-exam-split__body--stacked">
                  {selectedPartContent.enunciado ? (
                    <div className="levels-exam-split__enunciado">
                      <p className="levels-exam-split__section-title">Directions</p>
                      {getFormattedEnunciado(selectedPartContent.enunciado).map((block, index) => {
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
                          src={resolvePublicOrSiteAudioSrc(String(listeningMonologueClip.url))}
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
                        const isOpenGapItem = partNumber === 11;
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
                            ? resolvePublicOrSiteAudioSrc(String(clip.url))
                            : '';
                        const clipLabel = String(clip?.titulo || '').trim();

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
                              </div>
                              {typeof checkResult === 'boolean' ? (
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
                                <audio controls src={clipSrc} style={{ width: '100%' }}>
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
                                const showCorrect = isChecked && isCorrect;
                                const showIncorrect = isChecked && isSelected && !isCorrect;

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
                              if (!hasChecked) return null;
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

                {!useListeningItemLayout &&
                (audioPlayersFromDb.length > 0 || showEnunciadoFallbackAudio) ? (
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

                {!useListeningItemLayout && textoLinesForDisplay.length > 0 ? (
                  <div className="levels-exam-split__passage-panel">
                    <p className="levels-exam-split__section-title">Text</p>
                    {textoLinesForDisplay.map((line, idx) => (
                      <p key={`texto-${idx}`} style={{ margin: '0.5rem 0', lineHeight: 1.78 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div className="levels-exam-split__questions levels-exam-split__questions--stacked">
                  {showLongWritingWithAi ? (
                    <B2WritingLongFormAiPanel
                      storageKey={longWritingStorageKey}
                      wordMin={writingWordMin}
                      wordMax={writingWordMax}
                      heading={`Your answer — ${getPartTitle(selectedPart)}`}
                      partLabel={selectedPart.nombre}
                      partDescription={selectedPart.descripcion || ''}
                      taskInstructions={selectedPartContent.enunciado || ''}
                      taskInputText={selectedPartContent.texto || ''}
                      onScoresReady={handleWritingScoresReady}
                    />
                  ) : null}

                  {!showLongWritingWithAi && !useListeningItemLayout ? (
                    <h3 className="levels-exam-split__section-title">Questions</h3>
                  ) : null}
                  {!showLongWritingWithAi && useOpenInputUi && openQuestionNumbers.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {openQuestionNumbers.map((questionNumber) => {
                        const questionKey = getQuestionKey(selectedPart.id, questionNumber, 'open');
                        const currentValue = openInputs[questionKey] || '';
                        const checkResult = openChecks[questionKey];
                        return (
                          <div
                            key={`open-${selectedQuestion.preguntaId}-${questionNumber}`}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.85rem',
                              background: '#ffffff',
                            }}
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
                            </div>
                            {typeof checkResult === 'boolean' && (
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
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  {!showLongWritingWithAi &&
                  !(useOpenInputUi && openQuestionNumbers.length > 0) &&
                  !useListeningItemLayout ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {groupedAnswers.length === 0 ? (
                        <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>
                          No hay opciones de respuesta en la base de datos para este ejercicio. Puedes practicar con el
                          enunciado y el texto; las preguntas en Supabase se añadirán después.
                        </p>
                      ) : null}
                      {groupedAnswers.map((group, groupIndex) => (
                        <div
                          key={`group-${selectedQuestion.preguntaId}-${group.questionNumber ?? 'extra'}-${groupIndex}`}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0.85rem',
                            background: '#ffffff',
                          }}
                        >
                          <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                            {group.questionNumber ? `Question ${group.questionNumber}` : 'Options'}
                          </p>
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
                              const showCorrect = isChecked && isCorrect;
                              const showIncorrect = isChecked && isSelected && !isCorrect;

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
                            if (!hasChecked) return null;
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
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                </div>
              </div>
              </div>
            )}
          </>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <Link
          href={`/niveles/b2/exam-1?examen=${examSlot}`}
          style={{
            textDecoration: 'none',
            color: '#047857',
            fontWeight: 'bold',
            display: 'inline-block',
            padding: '0.75rem 1.25rem',
            border: '2px solid #059669',
            borderRadius: '6px',
          }}
        >
          ← Full Exam
        </Link>
        <Link href="/niveles/b2">
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f3',
              fontWeight: 'bold',
              display: 'inline-block',
              padding: '0.75rem 1.25rem',
              border: '2px solid #0070f3',
              borderRadius: '6px',
              transition: 'background 0.3s, color 0.3s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0070f3';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#0070f3';
            }}
          >
            ← Back to B2 Overview
          </div>
        </Link>
      </div>
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
