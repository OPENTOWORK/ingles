'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { extractTextoBloque, splitPart1TextoYPreguntas, parsePart1QuestionOptions } from '@/utils/b2ExamTextBlocks';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { useUserRole } from '@/context/UserRoleContext';
import { getSessionUserId, mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import {
  computeUoePartProgressFromState,
  saveUoePartPuntuacionIfComplete,
} from '@/utils/recordLevelsUoePartScore';
import { getUoePartScoring } from '@/utils/levelsUoePartScoring';
import { getOpenAnswerMap, inferOpenQuestionNumbersFromPrompt, normalizeText } from '@/utils/b2ExamPaperShared';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { fetchUseOfEnglishPuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedB2Level, getCachedB2ExamenIdsBySlot } from '@/utils/b2LevelCache';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';

function UseOfEnglishExamsPageInner() {
  const { userRole } = useUserRole();
  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
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
  const [canSeeRefreshControls, setCanSeeRefreshControls] = useState(false);
  const [b2LevelId, setB2LevelId] = useState(null);
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [progressBySlot, setProgressBySlot] = useState({});
  const [examPracticeOpen, setExamPracticeOpen] = useState(false);
  const [currentExamenId, setCurrentExamenId] = useState(null);
  const [partFinishNotice, setPartFinishNotice] = useState(null);

  const mountedRef = useRef(true);
  const lastSavedPartSigRef = useRef('');
  const currentExamenIdRef = useRef(null);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadUseOfEnglishData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setAiHintsByKey({});
    setPartFinishNotice(null);

    try {
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);

      if (levelError || !levelData) {
        throw new Error('No se pudo obtener el nivel B2 desde la base de datos.');
      }

      if (mountedRef.current) {
        setB2LevelId(levelData.id);
        const idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, levelData.id);
        setExamenIdBySlot(idsBySlot);
      }

      const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
        slot: examSlot,
      });
      if (examResolveError || !examenId) {
        const detail =
          typeof examResolveError?.message === 'string'
            ? examResolveError.message
            : examResolveError?.details || '';
        throw new Error(
          detail
            ? `No se pudo obtener el examen de B2. (${detail})`
            : 'No se pudo obtener el examen de B2.',
        );
      }

      if (mountedRef.current) {
        setCurrentExamenId(examenId);
        currentExamenIdRef.current = examenId;
      }

      const { data: questionsData, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
        examenId,
        levelId: levelData.id,
      });

      if (questionsError || !questionsData?.length) {
        throw new Error('No hay preguntas disponibles para B2 Use of English.');
      }

      const partIds = [...new Set(questionsData.map((question) => question.parte_id).filter(Boolean))];
      const questionIds = questionsData.map((question) => question.id);

      const [partsRes, answersRes, openAnswersRes] = await Promise.all([
        supabase.from('levels_partes').select('*').in('id', partIds),
        supabase
          .from('levels_respuestas')
          .select('id, pregunta_id, respuesta, correcta')
          .in('pregunta_id', questionIds),
        supabase
          .from('levels_respuestas_abiertas')
          .select('id, pregunta_id_abierta, respuesta_texto')
          .in('pregunta_id_abierta', questionIds),
      ]);

      const { data: partsTableData, error: partsError } = partsRes;
      const { data: answersData, error: answersError } = answersRes;
      const { data: openAnswersData, error: openAnswersError } = openAnswersRes;

      if (partsError) {
        throw new Error('No se pudieron obtener las partes del examen.');
      }

      if (answersError) {
        throw new Error('No se pudieron obtener las respuestas del examen.');
      }

      if (openAnswersError) {
        // Fallback no destructivo: mantener funcionamiento previo con levels_respuestas.
        // Así evitamos bloquear toda la pantalla si la tabla abierta no es accesible por RLS/API.
        console.warn('No se pudieron obtener respuestas abiertas. Se usará fallback cerrado:', openAnswersError);
      }

      const answersByQuestion = answersData.reduce((acc, answer) => {
        if (!acc[answer.pregunta_id]) acc[answer.pregunta_id] = [];
        acc[answer.pregunta_id].push(answer);
        return acc;
      }, {});

      const openAnswersByQuestion = (openAnswersData || []).reduce((acc, answer) => {
        if (!acc[answer.pregunta_id_abierta]) acc[answer.pregunta_id_abierta] = [];
        acc[answer.pregunta_id_abierta].push(answer);
        return acc;
      }, {});

      const partsById = partsTableData.reduce((acc, part) => {
        acc[part.id] = part;
        return acc;
      }, {});

      const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';

      const groupedByPart = questionsData.reduce((acc, question) => {
        const tablePart = partsById[question.parte_id];
        const partName = formatLevelsPartDisplayName(tablePart?.nombre_parte || 'Parte sin nombre');
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

      const normalizedParts = Object.values(groupedByPart)
        .sort((a, b) => {
          const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
          const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
          return aNumber - bNumber;
        })
        .filter((part) => {
          const partNumber = Number(part.nombre.match(/\d+/)?.[0] || 0);
          return partNumber >= 1 && partNumber <= 4;
        });

      if (!normalizedParts.length) {
        throw new Error(
          'No hay ejercicios de Use of English (Partes 1 a 4) para este examen.',
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
    } catch (loadError) {
      if (mountedRef.current) {
        setError(loadError.message || 'Error cargando datos de Use of English.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [examSlot]);

  useEffect(() => {
    mountedRef.current = true;
    loadUseOfEnglishData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadUseOfEnglishData]);

  useEffect(() => {
    setCanSeeRefreshControls(userRole === 'admin' || userRole === 'administrador');
  }, [userRole]);

  const refreshPuntuacionesProgress = useCallback(async () => {
    const uid = await getSessionUserId();
    if (!uid || !Object.keys(examenIdBySlot).length) return;
    const { bySlot } = await fetchUseOfEnglishPuntuacionesProgress(supabase, {
      userId: uid,
      examenIdBySlot,
    });
    if (mountedRef.current) setProgressBySlot(bySlot);
  }, [examenIdBySlot]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshPuntuacionesProgress();
    }, 450);
    return () => clearTimeout(timer);
  }, [refreshPuntuacionesProgress, checkedQuestions, openChecks]);

  const selectedPart = useMemo(
    () => partsData.find((part) => part.id === selectedPartId),
    [partsData, selectedPartId],
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

  const partNumberUoe = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

  /** Mismo formato de panel de texto que Parte 1 para todas las partes de esta página (1–4). */
  const shouldStickEnunciado = partNumberUoe >= 1 && partNumberUoe <= 4;

  const getQuestionKey = (partId, questionNumber, fallbackKey = 'extra') =>
    `${partId}::${selectedQuestion?.preguntaId || 'sin-pregunta'}::${questionNumber ?? fallbackKey}`;
  function splitEnunciadoAndText(rawText = '') {
    const normalized = rawText.replace(/\r\n/g, '\n').trim();
    if (!normalized) return { enunciado: '', texto: '' };

    const lines = normalized.split('\n');
    const textIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'text');
    if (textIndex === -1) return { enunciado: normalized, texto: '' };

    // Si la primera línea es solo "Text", no hay instrucciones encima: mostrar todo como enunciado
    // (p. ej. Word Formation Part 3: `Text` + `Part 3:...` sin bloque previo).
    if (textIndex === 0) {
      return { enunciado: normalized, texto: '' };
    }

    return {
      enunciado: lines.slice(0, textIndex).join('\n').trim(),
      texto: lines.slice(textIndex + 1).join('\n').trim(),
    };
  }

  const selectedPartContent = useMemo(() => {
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const fallback = splitEnunciadoAndText(rawPregunta);
    const textoExtracted = extractTextoBloque(rawPregunta, partNumberUoe);
    let texto = (textoExtracted || fallback.texto || '').trim();
    /** Parte 1: el pasaje y el bloque Questions suelen ir juntos tras `Text`; mostramos solo el pasaje arriba. */
    let preguntasPart1Parse = [];
    if (partNumberUoe === 1 && texto) {
      const split = splitPart1TextoYPreguntas(texto);
      texto = split.texto.trim();
      preguntasPart1Parse = parsePart1QuestionOptions(split.preguntas);
    }
    return {
      enunciado: desc || fallback.enunciado,
      texto,
      preguntasPart1Parse,
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumberUoe]);

  /** Mapa pregunta → letra correcta desde `levels_respuestas` (p. ej. `1 C`, `2 B follow`).
   *  Solo se consideran filas con `correcta === true`; en caso contrario, al iterar todas las
   *  opciones (A–D) el `map.set` quedaría sobrescrito por la última letra vista. */
  const part1CorrectLetterByQuestion = useMemo(() => {
    const map = new Map();
    if (partNumberUoe !== 1) return map;
    for (const row of selectedQuestion?.respuestas || []) {
      if (row?.correcta !== true) continue;
      const t = String(row.respuesta || '').trim();
      const m = t.match(/^(\d{1,2})\s+([A-D])\b/i);
      if (m) map.set(Number(m[1]), m[2].toUpperCase());
    }
    return map;
  }, [partNumberUoe, selectedQuestion?.preguntaId, selectedQuestion?.respuestas]);

  /** Parte 1: 4 opciones A–D por pregunta (texto del enunciado + una correcta según BD). */
  const part1McqGroups = useMemo(() => {
    if (partNumberUoe !== 1) return null;
    const parsed = selectedPartContent.preguntasPart1Parse || [];
    if (!parsed.length || !selectedQuestion?.preguntaId) return null;
    const pid = selectedQuestion.preguntaId;
    const letters = ['A', 'B', 'C', 'D'];
    return parsed.map(({ questionNumber, options: byLetter }) => {
      const correctL = part1CorrectLetterByQuestion.get(questionNumber);
      const opts = letters
        .map((L) => {
          const word = byLetter[L];
          if (!word || !String(word).trim()) return null;
          return {
            id: `part1-${pid}-q${questionNumber}-${L}`,
            respuesta: `${questionNumber} ${L} ${word}`,
            formattedText: `${L}) ${word}`,
            correcta: correctL != null ? L === correctL : false,
          };
        })
        .filter(Boolean);
      if (opts.length < 2) return null;
      return { questionNumber, options: opts };
    }).filter(Boolean);
  }, [
    part1CorrectLetterByQuestion,
    partNumberUoe,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
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

  const getFormattedEnunciado = (rawText = '') => {
    const normalized = rawText.replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    return normalized
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const lower = line.toLowerCase();
        if (lower.startsWith('example:')) return { type: 'label', text: line };
        if (lower === 'text') return { type: 'label', text: line };
        if (/^(answer:)/i.test(line)) return { type: 'answer', text: line };
        if (/^\d+\s*$/.test(line)) return { type: 'number', text: line };
        if (/^[a-d]\)\s+/i.test(line)) return { type: 'option', text: line };
        return { type: 'paragraph', text: line };
      });
  };
  const getGroupedAnswers = (answers = []) => {
    const groupsMap = new Map();
    const ungrouped = [];

    answers.forEach((answer) => {
      const text = answer.respuesta || '';
      // \b evita que "17 development" se interprete como MCQ (D + "evelopment").
      const matchMcq = text.match(/^(\d+)\s+([A-D])\b\s+(.+)$/i);

      if (matchMcq) {
        const questionNumber = Number(matchMcq[1]);
        const optionLetter = matchMcq[2].toUpperCase();
        const optionText = matchMcq[3];

        if (!groupsMap.has(questionNumber)) {
          groupsMap.set(questionNumber, []);
        }

        groupsMap.get(questionNumber).push({
          ...answer,
          formattedText: `${optionLetter}) ${optionText}`,
        });
        return;
      }

      // Open cloze / Word formation / Key word: "9 from", "17 development", "25 didn't have to"
      const matchGap = text.match(/^(\d+)\s+(.+)$/);
      if (matchGap) {
        const questionNumber = Number(matchGap[1]);
        const rest = matchGap[2].trim();
        if (!groupsMap.has(questionNumber)) {
          groupsMap.set(questionNumber, []);
        }
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

  const isOpenClozePart = partNumberUoe >= 2 && partNumberUoe <= 4;
  const inferredOpenQuestionNumbers = useMemo(
    () => inferOpenQuestionNumbersFromPrompt(selectedQuestion?.enunciado || '', partNumberUoe),
    [selectedQuestion?.enunciado, partNumberUoe],
  );
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
  /**
   * Los huecos a pintar deben coincidir con los marcadores presentes en el enunciado
   * (`(N) ___` o números al inicio de línea según parte). Si la BD tiene respuestas extra
   * para huecos que no aparecen en el texto, se ignoran para no mostrar inputs huérfanos.
   */
  const openQuestionNumbers = useMemo(() => {
    const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
    const fromPrompt = inferredOpenQuestionNumbers;
    if (fromPrompt.length > 0 && fromAnswers.length > 0) {
      const promptSet = new Set(fromPrompt);
      const intersection = fromAnswers.filter((n) => promptSet.has(n));
      return intersection.length > 0 ? intersection : fromPrompt;
    }
    if (fromAnswers.length > 0) return fromAnswers;
    return fromPrompt;
  }, [inferredOpenQuestionNumbers, openAnswerMap]);

  const groupedAnswersSelected = useMemo(
    () => getGroupedAnswers(selectedQuestion?.respuestas || []),
    [selectedQuestion?.respuestas],
  );

  const groupedAnswersForUiAndScore = part1McqGroups ?? groupedAnswersSelected;

  const partScoreMetrics = useMemo(
    () =>
      computeLevelsPartScore({
        useOpenInputUi: isOpenClozePart,
        openQuestionNumbers,
        openChecks,
        groupedAnswers: groupedAnswersForUiAndScore,
        checkedQuestions,
        selectedOptions,
        getQuestionKey,
        partId: selectedPart?.id,
      }),
    [
      isOpenClozePart,
      openQuestionNumbers,
      openChecks,
      groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
    ],
  );

  const uoePartScoring = getUoePartScoring(partNumberUoe);

  useEffect(() => {
    lastSavedPartSigRef.current = '';
    const saved = progressBySlot[examSlot]?.parts?.[partNumberUoe];
    const cfg = getUoePartScoring(partNumberUoe);
    if (saved?.total && cfg) {
      setPartFinishNotice({
        passed: saved.passed,
        correct: saved.correct,
        total: saved.total,
        passing: cfg.passing,
      });
    } else {
      setPartFinishNotice(null);
    }
  }, [examSlot, selectedPart?.id, partNumberUoe, progressBySlot]);

  const trySavePartAfterAnswer = useCallback(
    async (stateOverride = {}) => {
      if (!examPracticeOpen || !partNumberUoe || !selectedPart?.id || !selectedQuestion?.preguntaId) {
        return;
      }

      const examenId = currentExamenIdRef.current || currentExamenId || examenIdBySlot[examSlot];
      if (!examenId) {
        console.warn('levels parte/puntuacion: falta examen_id');
        return;
      }

      const progress = computeUoePartProgressFromState({
        partNumber: partNumberUoe,
        useOpenInputUi: isOpenClozePart,
        openQuestionNumbers,
        openChecks: stateOverride.openChecks ?? openChecks,
        groupedAnswers: groupedAnswersForUiAndScore,
        checkedQuestions: stateOverride.checkedQuestions ?? checkedQuestions,
        selectedOptions: stateOverride.selectedOptions ?? selectedOptions,
        getQuestionKey,
        partId: selectedPart.id,
      });

      if (!progress.complete) return;

      const sig = `${examSlot}:${partNumberUoe}:${progress.correct}`;
      if (lastSavedPartSigRef.current === sig) return;

      const uid = await getSessionUserId();
      if (!uid) {
        setPartFinishNotice({
          error: 'Inicia sesión para guardar tu puntuación.',
        });
        return;
      }

      const result = await saveUoePartPuntuacionIfComplete({
        userId: uid,
        preguntaId: selectedQuestion.preguntaId,
        parteId: selectedPart.id,
        examenId,
        partNumber: partNumberUoe,
        progress,
      });

      if (result.error) {
        const msg = result.error?.message || String(result.error);
        console.warn('levels parte/puntuacion:', msg);
        setPartFinishNotice({ error: msg });
        return;
      }

      if (result.saved) {
        lastSavedPartSigRef.current = sig;
        setPartFinishNotice({
          passed: progress.passed,
          correct: progress.correct,
          total: progress.total,
          passing: progress.passing,
        });
        void refreshPuntuacionesProgress();
      }
    },
    [
      examPracticeOpen,
      examSlot,
      currentExamenId,
      examenIdBySlot,
      partNumberUoe,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
      isOpenClozePart,
      openQuestionNumbers,
      openChecks,
      groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      refreshPuntuacionesProgress,
    ],
  );

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

  const currentExamProgress = progressBySlot[examSlot] || {};
  const getPartSavedScoreLabel = (part) => {
    const partNumber = Number(part.nombre.match(/\d+/)?.[0] || 0);
    const saved = currentExamProgress.parts?.[partNumber];
    if (!saved?.total) return null;
    const passed = saved.passed ? ' ✓' : '';
    return `${saved.correct}/${saved.total}${passed}`;
  };

  const handleSelectExam = (n) => {
    selectExamSlot(n);
    setExamPracticeOpen(true);
    void (async () => {
      await import('@/utils/ensureAppUserProfile').then((m) => m.ensureAppUserProfile());
    })();
  };

  useEffect(() => {
    if (!examPracticeOpen) return;
    void (async () => {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
      void refreshPuntuacionesProgress();
    })();
  }, [examPracticeOpen, refreshPuntuacionesProgress]);

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'Segoe UI, sans-serif',
        ...(!examPracticeOpen
          ? {
              minHeight: 'calc(100vh - 4rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }
          : {}),
      }}
    >
      <B2ExamSlotProgressPicker
        value={examSlot}
        onSelect={handleSelectExam}
        progressBySlot={progressBySlot}
      />
      {!examPracticeOpen ? null : (
        <>
      <h1 style={{ textAlign: 'center' }}>B2 Use of English Practice</h1>
      <p style={{ textAlign: 'center', margin: '0.35rem 0 0', color: '#4a5568', fontSize: '1rem' }}>
        Partes 1 a 4
      </p>
      {canSeeRefreshControls && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => loadUseOfEnglishData()}
            disabled={loading}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid #2f855a',
              background: loading ? '#e2e8f0' : '#f0fff4',
              color: '#1a202c',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Actualizando…' : 'Refrescar Use of English (1-4)'}
          </button>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#718096' }}>
            Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones (solo lectura).
          </p>
        </div>
      )}

      <LevelsCategoryTimer categoryLabel="Sesión: B2 Use of English (partes 1–4)" timeLabel={timerLabel} />
      <LevelsPartScorePanel
        correctCount={partScoreMetrics.correctCount}
        totalSlots={uoePartScoring?.total ?? partScoreMetrics.totalSlots}
        passingCount={uoePartScoring?.passing ?? partScoreMetrics.passingCount}
      />
      {partFinishNotice && !partFinishNotice.error && (
        <LevelsPartFinishBanner
          passed={partFinishNotice.passed}
          correct={partFinishNotice.correct}
          total={partFinishNotice.total}
          passing={partFinishNotice.passing}
        />
      )}
      {partFinishNotice?.error && (
        <LevelsPartFinishBanner
          passed={false}
          correct={0}
          total={0}
          passing={0}
          error={partFinishNotice.error}
        />
      )}

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333', textAlign: 'center' }}>
      </section>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        {loading && <p style={{ textAlign: 'center' }}>Cargando Use of English (Partes 1 a 4)...</p>}

        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                justifyItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              {partsData.map((part) => {
                const savedScore = getPartSavedScoreLabel(part);
                return (
                <button
                  key={part.id}
                  type="button"
                  style={{
                    ...buttonStyle,
                    border: selectedPartId === part.id ? '2px solid #1f6f43' : '2px solid transparent',
                    width: '100%',
                    cursor: 'pointer',
                    transform: selectedPartId === part.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => {
                    setSelectedPartId(part.id);
                    if (selectedQuestionByPart[part.id]) return;
                    if (part.questions.length === 0) return;
                    const randomIndex = Math.floor(Math.random() * part.questions.length);
                    const nextQuestion = part.questions[randomIndex];
                    setSelectedQuestionByPart((prev) => ({
                      ...prev,
                      [part.id]: nextQuestion.preguntaId,
                    }));
                  }}
                >
                  <span>{part.nombre}</span>
                  {savedScore ? (
                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.3rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#2f855a',
                      }}
                    >
                      Guardado: {savedScore}
                    </span>
                  ) : null}
                </button>
              );
              })}
            </div>

            {selectedPart && selectedQuestion && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h2 style={{ marginTop: 0 }}>{selectedPart.nombre}</h2>
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
                    <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>
                      Enunciado
                    </p>
                    {getFormattedEnunciado(selectedPartContent.enunciado).map((block, index) => {
                      if (block.type === 'label') {
                        return (
                          <p key={`enunciado-${block.type}-${index}`} style={{ margin: '0.7rem 0 0.45rem', fontWeight: 700, color: '#1a365d' }}>
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'answer') {
                        return (
                          <p key={`enunciado-${block.type}-${index}`} style={{ margin: '0.45rem 0', padding: '0.45rem 0.6rem', background: '#ebf8ff', borderRadius: '8px', fontWeight: 600 }}>
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'number') {
                        return (
                          <p key={`enunciado-${block.type}-${index}`} style={{ margin: '0.35rem 0', fontWeight: 700, color: '#2d3748' }}>
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === 'option') {
                        return (
                          <p key={`enunciado-${block.type}-${index}`} style={{ margin: '0.2rem 0', paddingLeft: '0.35rem', color: '#334155' }}>
                            {block.text}
                          </p>
                        );
                      }
                      return (
                        <p key={`enunciado-${block.type}-${index}`} style={{ margin: '0.45rem 0', lineHeight: 1.7, color: '#1f2937' }}>
                          {block.text}
                        </p>
                      );
                    })}
                  </div>

                  {selectedPartContent.texto ? (
                    <div
                      style={{
                        marginTop: '0.7rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.95rem 1rem',
                        position: shouldStickEnunciado ? 'sticky' : 'static',
                        top: shouldStickEnunciado ? '0.75rem' : 'auto',
                        zIndex: shouldStickEnunciado ? 20 : 'auto',
                        maxHeight: shouldStickEnunciado ? '34vh' : 'none',
                        overflowY: shouldStickEnunciado ? 'auto' : 'visible',
                      }}
                    >
                      <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>
                        Texto
                      </p>
                      {selectedPartContent.texto
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => (
                          <p key={`texto-${idx}`} style={{ margin: '0.45rem 0', lineHeight: 1.7 }}>
                            {line}
                          </p>
                        ))}
                    </div>
                  ) : null}
                <div style={{ marginTop: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.75rem', color: '#1a202c' }}>Preguntas</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {isOpenClozePart ? (
                      openQuestionNumbers.map((questionNumber) => {
                        const questionKey = getQuestionKey(selectedPart.id, questionNumber, 'open');
                        const currentValue = openInputs[questionKey] || '';
                        const checkResult = openChecks[questionKey];
                        const isAnswerLocked = typeof checkResult === 'boolean';
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
                              Pregunta {questionNumber}
                            </p>
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                value={currentValue}
                                readOnly={isAnswerLocked}
                                onChange={(e) => {
                                  if (isAnswerLocked) return;
                                  const value = e.target.value;
                                  setOpenInputs((prev) => ({ ...prev, [questionKey]: value }));
                                }}
                                placeholder="Escribe una palabra"
                                style={{
                                  minWidth: '240px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e0',
                                  padding: '0.65rem 0.75rem',
                                  background: isAnswerLocked ? '#f7fafc' : '#fff',
                                  cursor: isAnswerLocked ? 'not-allowed' : 'text',
                                }}
                              />
                              {!isAnswerLocked ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof openChecks[questionKey] === 'boolean') return;
                                  const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
                                  const isCorrect = expectedAnswers.has(normalizeText(currentValue));
                                  const nextOpenChecks = { ...openChecks, [questionKey]: isCorrect };
                                  setOpenChecks(nextOpenChecks);
                                  {
                                    const correctChoiceText =
                                      [...expectedAnswers].slice(0, 4).join(' · ') || 'respuesta modelo';
                                    const answersFromDatabase = [...expectedAnswers].join(' · ');
                                    requestAiJustification(questionKey, {
                                      partLabel: selectedPart?.nombre || '',
                                      questionLabel: `Pregunta ${questionNumber}`,
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
                                  }
                                  void trySavePartAfterAnswer({ openChecks: nextOpenChecks });
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
                                Comprobar
                              </button>
                              ) : null}
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
                      })
                    ) : (
                    groupedAnswersForUiAndScore.map((group, groupIndex) => (
                      <div
                        key={`group-${selectedQuestion.preguntaId}-${group.questionNumber ?? 'extra'}-${groupIndex}`}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          background: '#ffffff',
                        }}
                      >
                        {group.questionNumber ? (
                          <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                            Pregunta {group.questionNumber}
                          </p>
                        ) : (
                          <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                            Opciones
                          </p>
                        )}

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
                                disabled={isChecked}
                                onClick={() => {
                                  if (checkedQuestions[questionKey]) return;
                                  const nextChecked = { ...checkedQuestions, [questionKey]: true };
                                  const nextSelected = { ...selectedOptions, [questionKey]: option.id };
                                  setSelectedOptions(nextSelected);
                                  setCheckedQuestions(nextChecked);
                                  {
                                    const correctOpt = group.options.find((o) => o.correcta);
                                    const answersFromDatabase = group.options
                                      .map((o) => (o.formattedText || o.respuesta || '').trim())
                                      .filter(Boolean)
                                      .join('\n');
                                    requestAiJustification(questionKey, {
                                      partLabel: selectedPart?.nombre || '',
                                      questionLabel: group.questionNumber
                                        ? `Pregunta ${group.questionNumber}`
                                        : 'Ítem',
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
                                      const { error } = await mergeLevelsEstadisticas({
                                        userId: uid,
                                        preguntaId: pid,
                                        parteId,
                                        deltaEvaluadas: 1,
                                        deltaCorrectas: option.correcta ? 1 : 0,
                                        deltaIncorrectas: option.correcta ? 0 : 1,
                                      });
                                      if (error) {
                                        console.warn('levels_estadisticas (eval):', error.message || error);
                                      }
                                    })();
                                  }
                                  void trySavePartAfterAnswer({
                                    checkedQuestions: nextChecked,
                                    selectedOptions: nextSelected,
                                  });
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
                                  cursor: isChecked ? 'not-allowed' : 'pointer',
                                  opacity: isChecked && !isSelected ? 0.72 : 1,
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
                          const correct = group.options.find((option) => option.correcta);
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
                    ))
                    )}
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
        </>
      )}
    </main>
  );
}

export default function UseOfEnglishExamsPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Cargando práctica…
        </main>
      }
    >
      <UseOfEnglishExamsPageInner />
    </Suspense>
  );
}
