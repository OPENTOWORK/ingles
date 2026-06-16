'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLevelsExamAdminFlow, createAdminExamSelectHandler, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { useSearchParams } from 'next/navigation';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeB2PartScoreMetrics } from '@/utils/levelsPaperScoreMetrics';
import { getActiveB2RuoePartScoring } from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled, isB2RuoeV2SessionPersistenceBlocked } from '@/lib/b2ScoringV2FeatureFlag';
import { parseB2KeyWordAnswerKeyRows } from '@/lib/parseB2KeyWordAnswerKey';
import { gradeB2Part4Gap } from '@/lib/b2Part4Grading';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import { supabase } from '@/utils/supabaseClient';
import { extractTextoBloque, splitPart1TextoYPreguntas, parsePart1QuestionOptions } from '@/utils/b2ExamTextBlocks';
import { fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { useUserRole } from '@/context/UserRoleContext';
import { getSessionUserId, mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import {
  computeUoePartProgressFromState,
  saveUoePartPuntuacionIfComplete,
} from '@/utils/recordLevelsUoePartScore';
import {
  composeOpenClozeDirections,
  composeMcqClozeDirections,
  composeSkillUoeDirections,
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
} from '@/utils/b2ExamPaperShared';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { fetchUseOfEnglishPuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedB2Level, getCachedB2ExamenIdsBySlot } from '@/utils/b2LevelCache';
import SiteMascot from '@/components/SiteMascot';
import { B2ExamSlotProgressPicker } from '@/components/b2/B2ExamSlotProgressPicker';
import { B2ExamPracticeContent, B2ExamQuestionItem } from '@/components/b2/B2ExamPracticeContent';
import B2ExamInlineOpenClozePassage from '@/components/b2/B2ExamInlineOpenClozePassage';
import B2ExamInlineKeyWordPassage from '@/components/b2/B2ExamInlineKeyWordPassage';
import B2ExamInlineMcqClozePassage from '@/components/b2/B2ExamInlineMcqClozePassage';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';

const UOE_PAGE_PART_MAX = 4;

function UseOfEnglishExamsPageInner() {
  const searchParams = useSearchParams();
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
  /** @type {Record<string, import('@/lib/b2Part4Grading').B2Part4OpenGrade>} */
  const [openGrades, setOpenGrades] = useState({});
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
  const categoryTimer = useLevelsCategoryTimer();

  const loadUseOfEnglishData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setOpenGrades({});
    setAiHintsByKey({});
    setPartFinishNotice(null);

    try {
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);

      if (levelError || !levelData) {
        throw new Error('No se pudo obtener el nivel B2 desde la base de datos.');
      }

      let idsBySlot = {};
      if (mountedRef.current) {
        setB2LevelId(levelData.id);
        idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, levelData.id);
        setExamenIdBySlot(idsBySlot);
      } else {
        idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, levelData.id);
      }

      const examenId = idsBySlot[examSlot];
      if (!examenId) {
        throw new Error(`No se pudo obtener el examen ${examSlot} de B2.`);
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

  const reloadExamenIds = useCallback(async () => {
    if (!b2LevelId) return;
    invalidateLevelExamCache(b2LevelId);
    const idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, b2LevelId);
    setExamenIdBySlot(idsBySlot);
  }, [b2LevelId]);

  const adminFlow = useLevelsExamAdminFlow({
    slug: 'b2',
    examenIdBySlot,
    onCatalogUpdated: () => {
      void reloadExamenIds();
      void loadUseOfEnglishData();
    },
  });

  const openExamSlot = useCallback(
    (slot) => {
      selectExamSlot(slot);
      setExamPracticeOpen(true);
    },
    [selectExamSlot],
  );

  const handleSelectExam = useMemo(
    () => createAdminExamSelectHandler(adminFlow, openExamSlot),
    [adminFlow, openExamSlot],
  );
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot,
    adminFlow,
    onSelectSlot: openExamSlot,
  });

  useEffect(() => {
    mountedRef.current = true;
    loadUseOfEnglishData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadUseOfEnglishData]);

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

  const partNumberUoe = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );
  /** Página dedicada Use of English (partes 1–4) = skill practice. */
  const useSkillUoeExampleLayout = shouldUseSkillUoeExampleLayout({
    skillPractice: true,
    partNumber: partNumberUoe,
  });

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
    if (partNumberUoe === 4) {
      const kwt = resolveB2KeyWordPartContent({
        rawPregunta,
        descripcion: desc,
        fallbackEnunciado: fallback.enunciado,
      });
      return { ...kwt, preguntasPart1Parse: [] };
    }
    const textoExtracted = extractTextoBloque(rawPregunta, partNumberUoe, { levelSlug: 'b2' });
    let texto = (textoExtracted || fallback.texto || '').trim();
    /** Parte 1: el pasaje y el bloque Questions suelen ir juntos tras `Text`; mostramos solo el pasaje arriba. */
    let preguntasPart1Parse = [];
    if (partNumberUoe === 1 && texto) {
      const split = splitPart1TextoYPreguntas(texto);
      texto = split.texto.trim();
      preguntasPart1Parse = parsePart1QuestionOptions(split.preguntas);
    }
    // Part 2 (open cloze): ejemplo (0) coherente — usa el de la pregunta generada
    // y descarta el ejemplo sin gap de la Descripción fija.
    let enunciado =
      useSkillUoeExampleLayout
        ? composeSkillUoeDirections(desc, rawPregunta, partNumberUoe) || fallback.enunciado
        : partNumberUoe === 2
          ? composeOpenClozeDirections(desc, rawPregunta) || fallback.enunciado
          : desc || fallback.enunciado;

    let uoeInlineExample = null;
    if (useSkillUoeExampleLayout && (partNumberUoe === 2 || partNumberUoe === 3)) {
      const resolved = resolveUoeInlineExample({
        partNumber: partNumberUoe,
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
    } else if (partNumberUoe === 2) {
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
    partNumberUoe,
    useSkillUoeExampleLayout,
  ]);

  const isUoePart1 = partNumberUoe === 1;
  const uoeUiLang = 'en';

  const getPartTabLabel = (part) => {
    const n = Number(part.nombre.match(/\d+/)?.[0] || 0);
    if (n) return `Part ${n}`;
    return part.nombre;
  };

  const getSelectedPartTitle = () => {
    const n = Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0);
    if (n) return `Part ${n}`;
    return selectedPart?.nombre || '';
  };


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
    partNumberUoe,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
    selectedQuestion?.enunciado,
    selectedQuestion?.respuestas,
    selectedPart?.descripcion,
    useSkillUoeExampleLayout,
  ]);

  const isPart1McqCloze = partNumberUoe === 1 && (part1McqGroups?.length ?? 0) > 0;

  const exampleGap0Word = useMemo(() => {
    if (!useSkillUoeExampleLayout) return '';
    if (partNumberUoe === 1) {
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
    if (partNumberUoe === 2 || partNumberUoe === 3) {
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
    partNumberUoe,
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
          const msg = e?.message || 'Could not load the explanation.';
          setAiHintsByKey((prev) => ({
            ...prev,
            [storageKey]: { loading: false, error: msg, text: null },
          }));
        }
      })();
    },
    [contextSnippetForAi],
  );

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
  const isKeyWordPart = partNumberUoe === 4;
  const scoringV2Part4 = isB2ScoringV2Enabled() && isKeyWordPart;
  const part4ParsedKeys = useMemo(
    () =>
      scoringV2Part4
        ? parseB2KeyWordAnswerKeyRows(selectedQuestion?.respuestasAbiertas || [])
        : new Map(),
    [scoringV2Part4, selectedQuestion?.respuestasAbiertas, selectedQuestion?.preguntaId],
  );
  const isInlinePassagePart = isOpenClozePart;
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
      computeB2PartScoreMetrics({
        partNumber: partNumberUoe,
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
      partNumberUoe,
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

  const uoePartScoring = getActiveB2RuoePartScoring(partNumberUoe);

  useEffect(() => {
    lastSavedPartSigRef.current = '';
    const saved = progressBySlot[examSlot]?.parts?.[partNumberUoe];
    const cfg = getActiveB2RuoePartScoring(partNumberUoe);
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
        openGrades: stateOverride.openGrades ?? openGrades,
        usePart4V2Grading: scoringV2Part4,
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
          passed: isB2ScoringV2Enabled() ? false : progress.passed,
          correct: progress.v2Metrics?.pointsEarned ?? progress.correct,
          total: progress.v2Metrics?.maxPoints ?? progress.total,
          passing: progress.passing,
          scoringVersion: progress.scoringVersion ?? 1,
          v2LocalOnly: isB2ScoringV2Enabled(),
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
          passed: isB2ScoringV2Enabled() ? false : progress.passed,
          correct: progress.v2Metrics?.pointsEarned ?? progress.correct,
          total: progress.v2Metrics?.maxPoints ?? progress.total,
          passing: progress.passing,
          scoringVersion: progress.scoringVersion ?? 1,
          v2LocalOnly: isB2ScoringV2Enabled(),
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
      scoringV2Part4,
      openQuestionNumbers,
      openChecks,
      openGrades,
      groupedAnswersForUiAndScore,
      checkedQuestions,
      selectedOptions,
      refreshPuntuacionesProgress,
    ],
  );

  const handlePart1McqOptionSelect = useCallback(
    ({ group, option, questionKey }) => {
      const wasChecked = checkedQuestions[questionKey];
      const nextChecked = { ...checkedQuestions, [questionKey]: true };
      const nextSelected = { ...selectedOptions, [questionKey]: option.id };
      setSelectedOptions(nextSelected);
      setCheckedQuestions(nextChecked);
      if (!wasChecked) {
        void (async () => {
          const uid = await getSessionUserId();
          const pid = selectedQuestion?.preguntaId;
          const parteId = selectedPart?.id;
          if (!uid || !pid || !parteId) return;
          if (isB2RuoeV2SessionPersistenceBlocked(partNumberUoe)) return;
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
    },
    [
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
      trySavePartAfterAnswer,
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
        partLabel: getSelectedPartTitle(),
        questionLabel: group.questionNumber ? `Question ${group.questionNumber}` : 'Item',
        userChoiceText: option.formattedText || option.respuesta || '',
        correctChoiceText: correctOpt?.formattedText || correctOpt?.respuesta || '',
        isCorrect: !!option.correcta,
        answersFromDatabase: answersFromDatabase || undefined,
      });
    },
    [aiHintsByKey, selectedOptions, requestAiJustification],
  );

  const handleOpenGapCheck = useCallback(
    (questionNumber, questionKey, currentValue) => {
      if (scoringV2Part4) {
        if (openGrades[questionKey] && typeof openGrades[questionKey].score === 'number') return;
        const grade = gradeB2Part4Gap(currentValue, part4ParsedKeys, questionNumber);
        const nextOpenGrades = { ...openGrades, [questionKey]: grade };
        setOpenGrades(nextOpenGrades);
        void (async () => {
          const uid = await getSessionUserId();
          const pid = selectedQuestion?.preguntaId;
          const parteId = selectedPart?.id;
          if (!uid || !pid || !parteId) return;
          if (isB2RuoeV2SessionPersistenceBlocked(partNumberUoe)) return;
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
        void trySavePartAfterAnswer({ openGrades: nextOpenGrades });
        return;
      }

      if (typeof openChecks[questionKey] === 'boolean') return;
      const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
      const isCorrect = expectedAnswers.has(normalizeText(currentValue));
      const nextOpenChecks = { ...openChecks, [questionKey]: isCorrect };
      setOpenChecks(nextOpenChecks);
      void (async () => {
        const uid = await getSessionUserId();
        const pid = selectedQuestion?.preguntaId;
        const parteId = selectedPart?.id;
        if (!uid || !pid || !parteId) return;
        if (isB2RuoeV2SessionPersistenceBlocked(partNumberUoe)) return;
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
      void trySavePartAfterAnswer({ openChecks: nextOpenChecks });
    },
    [
      scoringV2Part4,
      openGrades,
      part4ParsedKeys,
      openChecks,
      openAnswerMap,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      partNumberUoe,
      trySavePartAfterAnswer,
    ],
  );

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
        partNumberUoe === 3
          ? 'word-formation'
          : partNumberUoe === 4
            ? 'key-word'
            : 'open-cloze';
      requestAiJustification(questionKey, {
        style,
        partLabel: getSelectedPartTitle(),
        questionLabel: `Question ${questionNumber}`,
        userChoiceText: openInputs[questionKey] || '',
        correctChoiceText: [...expectedAnswers].slice(0, 4).join(' · ') || 'model answer',
        isCorrect,
        answersFromDatabase: [...expectedAnswers].join(' · ') || undefined,
      });
    },
    [aiHintsByKey, scoringV2Part4, openGrades, openChecks, openInputs, openAnswerMap, requestAiJustification, partNumberUoe],
  );

  const currentExamProgress = progressBySlot[examSlot] || {};
  const getPartSavedScoreLabel = (part) => {
    const partNumber = Number(part.nombre.match(/\d+/)?.[0] || 0);
    const saved = currentExamProgress.parts?.[partNumber];
    if (!saved?.total) return null;
    const passed = saved.passed ? ' ✓' : '';
    return `${saved.correct}/${saved.total}${passed}`;
  };

  useB2AutoOpenExamFromUrl({
    examPracticeOpen,
    handleSelectExam: (_selectExamSlot, n) => handleSelectExam(n),
    selectExamSlot,
  });

  useEffect(() => {
    if (!examPracticeOpen) return;
    void refreshPuntuacionesProgress();
  }, [examPracticeOpen, refreshPuntuacionesProgress]);

  const handleContinueInPage = useCallback(() => {
    const sorted = [...partsData].sort((a, b) => {
      const an = Number(a.nombre.match(/\d+/)?.[0] || 0);
      const bn = Number(b.nombre.match(/\d+/)?.[0] || 0);
      return an - bn;
    });
    const currentIdx = sorted.findIndex((p) => p.id === selectedPartId);
    if (currentIdx < 0 || currentIdx >= sorted.length - 1) return;
    setSelectedPartId(sorted[currentIdx + 1].id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [partsData, selectedPartId]);

  return (
    <main
      className="levels-exam-practice-root"
      style={{
        padding: '2rem',
        fontFamily: 'Arial, Helvetica, sans-serif',
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
      <B2ExamSlotProgressPicker
        value={examSlot}
        onSelect={handleSelectExam}
        progressBySlot={progressBySlot}
        lang="en"
        {...examSlotPickerProps}
      />
      {!examPracticeOpen ? null : (
        <div className="levels-b2-practice">
      <header className="levels-b2-practice__header">
        <h1 className="levels-b2-practice__title">B2 Use of English Practice</h1>
        <div className="levels-b2-practice__mascot" aria-hidden>
          <SiteMascot variant={10} width={128} alt="" />
        </div>
        <p className="levels-b2-practice__subtitle">Parts 1 to 4</p>
      {canSeeRefreshControls && (
        <div className="levels-b2-practice__refresh">
          <button
            type="button"
            onClick={() => loadUseOfEnglishData()}
            disabled={loading}
            className="levels-b2-practice__refresh-btn"
          >
            {loading ? 'Updating…' : 'Refresh Use of English (1–4)'}
          </button>
          <p className="levels-b2-practice__refresh-hint">
            Reload parts, texts and answers from the server and clear your selections (read-only).
          </p>
        </div>
      )}
      </header>

      <div className="levels-b2-practice__status">
      <LevelsCategoryTimer
        categoryLabel="Session: B2 Use of English (parts 1–4)"
        timeLabel={categoryTimer.label}
        isRunning={categoryTimer.isRunning}
        isPaused={categoryTimer.isPaused}
        isIdle={categoryTimer.isIdle}
        onStart={categoryTimer.start}
        onPause={categoryTimer.pause}
        onResume={categoryTimer.resume}
        lang="en"
      />
      <LevelsPartScorePanel
        {...partScoreMetrics}
        passingCount={uoePartScoring?.passing ?? partScoreMetrics.passingCount}
        lang="en"
      />
      </div>
      {partFinishNotice && !partFinishNotice.error && (
        <LevelsPartFinishBanner
          passed={partFinishNotice.passed}
          correct={partFinishNotice.correct}
          total={partFinishNotice.total}
          passing={partFinishNotice.passing}
          lang={uoeUiLang}
        />
      )}
      {partFinishNotice?.error && (
        <LevelsPartFinishBanner
          passed={false}
          correct={0}
          total={0}
          passing={0}
          error={partFinishNotice.error}
          lang={uoeUiLang}
        />
      )}

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333', textAlign: 'center' }}>
      </section>

      <section style={{ margin: '0 auto', width: '100%' }}>
        {loading && <p style={{ textAlign: 'center' }}>Loading Use of English (Parts 1 to 4)…</p>}

        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="levels-b2-part-tabs" role="tablist">
              {partsData.map((part) => {
                const savedScore = getPartSavedScoreLabel(part);
                const active = selectedPartId === part.id;
                return (
                <button
                  key={part.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`levels-b2-part-tab${active ? ' levels-b2-part-tab--active' : ''}`}
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
                  <span>{getPartTabLabel(part)}</span>
                  {savedScore ? (
                    <span className="levels-b2-part-tab__score">
                      Saved: {savedScore}
                    </span>
                  ) : null}
                </button>
              );
              })}
            </div>

            {selectedPart && selectedQuestion && (
              <B2ExamPracticeContent
                title={getSelectedPartTitle()}
                directionsText={selectedPartContent.enunciado}
                directionsLabel={isUoePart1 ? 'Instructions' : 'Directions'}
                passageText={isInlinePassagePart || isPart1McqCloze ? '' : selectedPartContent.texto}
                passage={
                  isPart1McqCloze ? (
                    <B2ExamInlineMcqClozePassage
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
                      aiHintsByKey={aiHintsByKey}
                      onRequestExplanation={handleOpenGapExplanationRequest}
                      showInlineExample={useSkillUoeExampleLayout}
                      exampleGap0Word={exampleGap0Word}
                    />
                  ) : null
                }
                split={isInlinePassagePart || isPart1McqCloze ? true : 'auto'}
                contentClassName={
                  isPart1McqCloze
                    ? 'levels-exam-mcq-cloze-inline'
                    : isInlinePassagePart
                      ? 'levels-exam-open-cloze-inline'
                      : ''
                }
                showQuestionsHeading={!isInlinePassagePart && !isPart1McqCloze}
                questions={
                  isInlinePassagePart || isPart1McqCloze
                    ? null
                    : groupedAnswersForUiAndScore.map((group, groupIndex) => (
                      <B2ExamQuestionItem
                        key={`group-${selectedQuestion.preguntaId}-${group.questionNumber ?? 'extra'}-${groupIndex}`}
                      >
                        {group.questionNumber ? (
                          <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                            Question {group.questionNumber}
                          </p>
                        ) : (
                          <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                            Options
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
                                      partLabel: getSelectedPartTitle(),
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
                                      if (isB2RuoeV2SessionPersistenceBlocked(partNumberUoe)) return;
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
                      </B2ExamQuestionItem>
                    ))
                }
              />
            )}
          </>
        )}
      </section>

      <B2ExamPracticeModuleNav
        slug="b2"
        partNumber={partNumberUoe}
        pagePartMax={UOE_PAGE_PART_MAX}
        examSlot={examSlot}
        onContinueInPage={handleContinueInPage}
        lang="en"
      />
        </div>
      )}
    </main>
  );
}

export default function UseOfEnglishExamsPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Loading practice…
        </main>
      }
    >
      <UseOfEnglishExamsPageInner />
    </Suspense>
  );
}
