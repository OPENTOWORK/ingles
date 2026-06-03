'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLevelsExamAdminFlow, createAdminExamSelectHandler, buildExamSlotPickerProps } from '@/hooks/useLevelsExamAdminFlow';
import A2ExamGenerationStatus from '@/components/niveles/A2ExamGenerationStatus';
import { usePathname, useSearchParams } from 'next/navigation';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { useB2AutoOpenExamFromUrl } from '@/hooks/useB2AutoOpenExamFromUrl';
import { B2ExamPracticeChrome, B2ExamPracticeLayout } from '@/components/b2/B2ExamPracticeChrome';
import { useB2ExamScoringSession } from '@/hooks/useB2ExamScoringSession';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import { supabase } from '@/utils/supabaseClient';
import {
  extractTextoBloque,
  extractPart7ProfilesBlock,
  extractPart7PromptStemBlob,
  extractReadingPart5QuestionsBlock,
  extractReadingPart6SentencesBlock,
  parsePart7NumberedStems,
  parsePart7PeopleProfiles,
  parseReadingAdMcqChunks,
  parseReadingPart6SentencePool,
  splitPart1TextoYPreguntas,
  parsePart1QuestionOptions,
} from '@/utils/b2ExamTextBlocks';
import {
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
} from '@/utils/b2ExamPaperShared';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { getCachedB2Level } from '@/utils/b2LevelCache';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { B2ExamPracticeContent, B2ExamQuestionItem } from '@/components/b2/B2ExamPracticeContent';
import B2ExamInlineOpenClozePassage from '@/components/b2/B2ExamInlineOpenClozePassage';
import B2ExamInlineKeyWordPassage from '@/components/b2/B2ExamInlineKeyWordPassage';
import B2ExamInlineMcqClozePassage from '@/components/b2/B2ExamInlineMcqClozePassage';
import {
  getSessionUserId,
  mergeLevelsEstadisticas,
  recordLevelsAnswerEvaluation,
} from '@/utils/levelsEstadisticas';
import B2ExamPracticeModuleNav from '@/components/b2/B2ExamPracticeModuleNav';
import ExamModeSectionBanner from '@/components/niveles/ExamModeSectionBanner';
import { useExamModeStrict } from '@/hooks/useExamModeStrict';
import { scoreExamModeDrafts } from '@/utils/examModeGradeAnswers';

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
  const partMin = isCombinedPaper ? 1 : 5;
  const partMax = isCombinedPaper ? 7 : 7;

  const { examSlot, selectExamSlot } = useB2ExamPracticeSlot();
  const scoring = useB2ExamScoringSession({ partMin, partMax });
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
  } = examMode;
  const examDraftRef = useRef({});
  const prevExamPartRef = useRef(null);
  useB2AutoOpenExamFromUrl({
    examPracticeOpen: scoring.examPracticeOpen,
    handleSelectExam: scoring.handleSelectExam,
    selectExamSlot,
  });
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

  const mountedRef = useRef(true);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadReadingData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setAiHintsByKey({});

    try {
      const { data: levelData, error: levelError } = await getCachedB2Level(supabase);

      if (levelError || !levelData) throw new Error('No se pudo obtener el nivel B2.');

      const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
        slot: examSlot,
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
          .select('id, pregunta_id_abierta, respuesta_texto')
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

  const handleSelectExamSlot = useMemo(
    () =>
      createAdminExamSelectHandler(adminFlow, (slot) => {
        scoring.handleSelectExam(selectExamSlot, slot);
        void loadReadingData();
      }),
    [adminFlow, scoring, selectExamSlot, loadReadingData],
  );
  const examSlotPickerProps = buildExamSlotPickerProps({
    examenIdBySlot: scoring.examenIdBySlot,
    adminFlow,
    onSelectSlot: (slot) => {
      scoring.handleSelectExam(selectExamSlot, slot);
      void loadReadingData();
    },
  });

  useEffect(() => {
    mountedRef.current = true;
    loadReadingData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadReadingData]);

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

  const partNumberReading = useMemo(
    () => Number(selectedPart?.nombre.match(/\d+/)?.[0] || 0),
    [selectedPart?.nombre],
  );

  useEffect(() => {
    if (examModeActive && !reviewMode) {
      const pn = partNumberReading;
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
  }, [selectedQuestion?.preguntaId, selectedPart?.id, examModeActive, reviewMode, partNumberReading]);

  const isUoePart = isCombinedPaper && partNumberReading >= 1 && partNumberReading <= 4;
  const isOpenClozePart = isCombinedPaper && partNumberReading >= 2 && partNumberReading <= 4;
  const isKeyWordPart = isCombinedPaper && partNumberReading === 4;
  const isInlinePassagePart = isOpenClozePart;
  const isUoePart1 = isCombinedPaper && partNumberReading === 1;

  /** Mismo formato de panel de texto que Parte 1 (Use of English) para partes 5–7. */
  const shouldStickEnunciado = partNumberReading >= 5 && partNumberReading <= 7;

  const selectedPartContent = useMemo(() => {
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const fallback = splitEnunciadoAndTextFallback(rawPregunta);
    const textoExtracted = extractTextoBloque(rawPregunta, partNumberReading, { levelSlug: 'b2' });
    let texto = (textoExtracted || fallback.texto || '').trim();
    let preguntasPart1Parse = [];
    if (isUoePart1 && texto) {
      const split = splitPart1TextoYPreguntas(texto);
      texto = split.texto.trim();
      preguntasPart1Parse = parsePart1QuestionOptions(split.preguntas);
    }
    return {
      enunciado: desc || fallback.enunciado,
      texto,
      preguntasPart1Parse,
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumberReading, isUoePart1]);

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
              id: `part1-${pid}-q${questionNumber}-${L}`,
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
    part1CorrectLetterByQuestion,
    isUoePart1,
    selectedPartContent.preguntasPart1Parse,
    selectedQuestion?.preguntaId,
  ]);

  const isPart1McqCloze = isUoePart1 && (part1McqGroups?.length ?? 0) > 0;

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
    if (fromPrompt.length > 0 && fromAnswers.length > 0) {
      const promptSet = new Set(fromPrompt);
      const intersection = fromAnswers.filter((n) => promptSet.has(n));
      return intersection.length > 0 ? intersection : fromPrompt;
    }
    if (fromAnswers.length > 0) return fromAnswers;
    return fromPrompt;
  }, [isOpenClozePart, inferredOpenQuestionNumbers, openAnswerMap]);

  /** Clave sólo número + letra (BD Reading 5–7).
   *  Sólo se consideran filas con `correcta === true`; en caso contrario, al iterar las 4
   *  opciones (A–D / A–G) el `map.set` quedaría sobrescrito por la última letra vista. */
  const readingCorrectLetterByQuestion = useMemo(() => {
    const map = new Map();
    for (const row of selectedQuestion?.respuestas || []) {
      if (row?.correcta !== true) continue;
      const t = String(row.respuesta || '').trim();
      const m = t.match(/^(\d{1,2})\s+([A-G])\s*$/i);
      if (m) map.set(Number(m[1]), m[2].toUpperCase());
    }
    return map;
  }, [selectedQuestion?.preguntaId, selectedQuestion?.respuestas]);

  /**
   * Reconstruye 4 opciones (5 y 7) o A–G (6) desde el enunciado; la BD suele tener sólo «31 B».
   */
  const readingSyntheticMcqGroups = useMemo(() => {
    const raw = selectedQuestion?.enunciado || '';
    const pid = selectedQuestion?.preguntaId;
    if (!raw || !pid || partNumberReading < 5 || partNumberReading > 7) return null;

    if (partNumberReading === 5) {
      const block = extractReadingPart5QuestionsBlock(raw);
      const chunks = parseReadingAdMcqChunks(block);
      if (!chunks.length) return null;
      const letters = ['A', 'B', 'C', 'D'];
      const groups = chunks
        .map(({ questionNumber, stem, options: byLetter }) => {
          const correctL = readingCorrectLetterByQuestion.get(questionNumber);
          const opts = letters
            .map((L) => {
              const text = byLetter[L];
              if (!text || !String(text).trim()) return null;
              return {
                id: `reading-${pid}-q${questionNumber}-${L}`,
                respuesta: `${questionNumber} ${L} ${text}`,
                formattedText: `${L}) ${text}`,
                correcta: correctL != null ? L === correctL : false,
              };
            })
            .filter(Boolean);
          if (!opts.length) return null;
          return { questionNumber, questionStem: stem || '', options: opts };
        })
        .filter(Boolean);
      return groups.length ? groups : null;
    }

    if (partNumberReading === 6) {
      const block = extractReadingPart6SentencesBlock(raw);
      const pool = parseReadingPart6SentencePool(block);
      const letters = [...'ABCDEFG'];
      if (!letters.every((L) => pool[L] != null && String(pool[L]).trim())) return null;
      const qnums = [...readingCorrectLetterByQuestion.keys()].sort((a, b) => a - b);
      if (!qnums.length) return null;
      const groups = qnums.map((questionNumber) => {
        const correctL = readingCorrectLetterByQuestion.get(questionNumber);
        const opts = letters.map((L) => {
          const text = pool[L];
          return {
            id: `reading-${pid}-q${questionNumber}-${L}`,
            respuesta: `${questionNumber} ${L} ${text}`,
            formattedText: `${L}) ${text}`,
            correcta: correctL != null ? L === correctL : false,
          };
        });
        return { questionNumber, questionStem: '', options: opts };
      });
      return groups;
    }

    if (partNumberReading === 7) {
      const stemBlob = extractPart7PromptStemBlob(raw);
      const stemsParsed = parsePart7NumberedStems(stemBlob);
      const stemByNum = new Map(stemsParsed.map((x) => [x.questionNumber, x.stem]));
      const people = parsePart7PeopleProfiles(extractPart7ProfilesBlock(raw));
      const letters = ['A', 'B', 'C', 'D'];
      if (!letters.every((L) => people[L]?.label)) return null;
      const qnums = [...readingCorrectLetterByQuestion.keys()].sort((a, b) => a - b);
      if (!qnums.length) return null;
      const groups = qnums.map((questionNumber) => {
        const stem = stemByNum.get(questionNumber) || '';
        const correctL = readingCorrectLetterByQuestion.get(questionNumber);
        const opts = letters.map((L) => {
          const { label = '' } = people[L];
          const formattedText = `${L}) ${label}`;
          return {
            id: `reading-${pid}-q${questionNumber}-${L}`,
            respuesta: `${questionNumber} ${L}`,
            formattedText,
            correcta: correctL != null ? L === correctL : false,
          };
        });
        return { questionNumber, questionStem: stem, options: opts };
      });
      return groups;
    }

    return null;
  }, [
    partNumberReading,
    readingCorrectLetterByQuestion,
    selectedQuestion?.enunciado,
    selectedQuestion?.preguntaId,
  ]);

  const groupedAnswersForUiAndScore =
    readingSyntheticMcqGroups || part1McqGroups || groupedAnswersSelected;

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

  const b2PartCfg = getB2PartScoring(partNumberReading);

  useEffect(() => {
    if (!scoring.examPracticeOpen) return;
    scoring.resetPartNoticeOnPartChange(examSlot, partNumberReading, scoring.progressBySlot);
  }, [examSlot, partNumberReading, selectedPart?.id, scoring.examPracticeOpen]);

  const handleExamModeFinish = useCallback(() => {
    if (partNumberReading && selectedPart) {
      examDraftRef.current[partNumberReading] = {
        preguntaId: selectedQuestion?.preguntaId,
        selectedOptions: { ...selectedOptions },
        openInputs: { ...openInputs },
        checkedQuestions: { ...checkedQuestions },
      };
    }
    const { scores } = scoreExamModeDrafts({
      partMin,
      partMax,
      partsData,
      draftByPart: examDraftRef.current,
    });
    handleFinishSection({ draftByPart: examDraftRef.current }, scores);
  }, [
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
  ]);

  const trySavePartAfterAnswer = useCallback(
    (stateOverride = {}) => {
      if (examModeActive && !reviewMode) return;
      if (!scoring.examPracticeOpen || !selectedPart?.id || !selectedQuestion?.preguntaId) return;
      const progress = computeB2PartProgressFromState({
        partNumber: partNumberReading,
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
      openQuestionNumbers,
      openChecks,
    ],
  );

  const handlePart1McqOptionSelect = useCallback(
    ({ group, option, questionKey }) => {
      const wasChecked = checkedQuestions[questionKey];
      const nextChecked = { ...checkedQuestions, [questionKey]: true };
      const nextSelected = { ...selectedOptions, [questionKey]: option.id };
      setSelectedOptions(nextSelected);
      setCheckedQuestions(nextChecked);
      trySavePartAfterAnswer({
        checkedQuestions: nextChecked,
        selectedOptions: nextSelected,
      });
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
      requestAiJustification,
      selectedPart?.id,
      selectedPart?.nombre,
      selectedQuestion?.preguntaId,
      trySavePartAfterAnswer,
    ],
  );

  const handleOpenGapCheck = useCallback(
    (questionNumber, questionKey, currentValue) => {
      if (typeof openChecks[questionKey] === 'boolean') return;
      const expectedAnswers = openAnswerMap.get(questionNumber) || new Set();
      const isCorrect = expectedAnswers.has(normalizeText(currentValue));
      const nextOpenChecks = { ...openChecks, [questionKey]: isCorrect };
      setOpenChecks(nextOpenChecks);
      const correctChoiceText =
        [...expectedAnswers].slice(0, 4).join(' · ') || 'model answer';
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
      openChecks,
      openAnswerMap,
      requestAiJustification,
      selectedQuestion?.preguntaId,
      selectedPart?.id,
      trySavePartAfterAnswer,
    ],
  );

  const scorePanelProps = {
    correctCount: partScoreMetrics.correctCount,
    totalSlots: b2PartCfg?.total ?? partScoreMetrics.totalSlots,
    passingCount: b2PartCfg?.passing ?? partScoreMetrics.passingCount,
  };

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
  }, [partsData, selectedPartId, selectedQuestionByPart]);

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
    return n ? `Part ${n}` : part?.nombre || '';
  };

  return (
    <B2ExamPracticeLayout examPracticeOpen={scoring.examPracticeOpen}>
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
        examPracticeOpen={scoring.examPracticeOpen}
        {...examSlotPickerProps}
        title={isCombinedPaper ? 'B2 Reading and Use of English Practice' : 'B2 Reading Practice'}
        subtitle={isCombinedPaper ? 'Parts 1 to 7' : 'Parts 5 to 7'}
        timerLabel={timerLabel}
        refreshLabel={
          isCombinedPaper ? 'Refresh Reading and Use of English (1–7)' : 'Refresh Reading (5–7)'
        }
        lang="en"
        loading={loading}
        onRefresh={() => loadReadingData()}
        partScoreMetrics={scorePanelProps}
        hideScorePanel={examModeActive && !reviewMode}
        partFinishNotice={examModeActive && !reviewMode ? null : scoring.partFinishNotice}
        partsData={!loading && !error ? partsData : []}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        getPartSavedScoreLabel={(part) => scoring.getPartSavedScoreLabel(part, examSlot)}
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
                title={getPartTitle(selectedPart)}
                directionsText={selectedPartContent.enunciado}
                directionsLabel={isUoePart1 ? 'Instructions' : 'Directions'}
                textLabel="Text"
                questionsLabel="Questions"
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
                      hideFeedback={hideFeedback}
                      aiHintsByKey={aiHintsByKey}
                    />
                  ) : isKeyWordPart ? (
                    <B2ExamInlineKeyWordPassage
                      text={selectedPartContent.texto || selectedQuestion?.enunciado || ''}
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
                      hideFeedback={hideFeedback}
                      aiHintsByKey={aiHintsByKey}
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
                      hideFeedback={hideFeedback}
                      inputPlaceholder="Write one word"
                      aiHintsByKey={aiHintsByKey}
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
                                      const { error } = await recordLevelsAnswerEvaluation({
                                        userId: uid,
                                        preguntaId: pid,
                                        parteId,
                                        isCorrect: !!option.correcta,
                                        slotLabel: group.questionNumber
                                          ? `Pregunta ${group.questionNumber}`
                                          : 'Ítem',
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
                          const correct = group.options.find((option) => option.correcta);
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
                }
              />
            )}
          </>
        )}
      </section>

      <B2ExamPracticeModuleNav
        slug="b2"
        partNumber={partNumberReading}
        pagePartMax={partMax}
        examSlot={examSlot}
        onContinueInPage={handleContinueInPage}
        lang="en"
      />
      </B2ExamPracticeChrome>
    </B2ExamPracticeLayout>
  );
}

export default function B2ReadingExamsPage() {
  return (
    <Suspense
      fallback={<main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>Loading practice…</main>}
    >
      <B2ReadingExamsPageInner />
    </Suspense>
  );
}
