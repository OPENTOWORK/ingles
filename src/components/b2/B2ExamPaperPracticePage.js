'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useB2ExamPracticeSlot } from '@/hooks/useB2ExamPracticeSlot';
import { B2ExamSlotPicker } from '@/components/b2/B2ExamSlotPicker';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { extractTextoBloque } from '@/utils/b2ExamTextBlocks';
import {
  getFormattedEnunciado,
  getGroupedAnswers,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
  splitEnunciadoAndTextFallback,
  extractFirstAudioUrl,
  isStandaloneAudioLine,
} from '@/utils/b2ExamPaperShared';
import { getSessionUserId, mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import B2WritingLongFormAiPanel from '@/components/b2/B2WritingLongFormAiPanel';

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
}) {
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

  const mountedRef = useRef(true);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedOptions({});
    setCheckedQuestions({});
    setOpenInputs({});
    setOpenChecks({});
    setAiHintsByKey({});

    try {
      const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .select('id, nombre')
        .ilike('nombre', 'b2')
        .limit(1)
        .single();

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

      const { data: questionsData, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
        examenId,
        levelId: levelData.id,
      });

      if (questionsError || !questionsData?.length) {
        throw new Error(emptyErrorMessage);
      }

      const partIds = [...new Set(questionsData.map((q) => q.parte_id).filter(Boolean))];
      const questionIds = questionsData.map((q) => q.id);

      const { data: partsTableData, error: partsError } = await supabase
        .from('levels_partes')
        .select('*')
        .in('id', partIds);
      if (partsError) throw new Error('No se pudieron obtener las partes.');

      const { data: answersData, error: answersError } = await supabase
        .from('levels_respuestas')
        .select('id, pregunta_id, respuesta, correcta')
        .in('pregunta_id', questionIds);
      if (answersError) throw new Error('No se pudieron obtener las respuestas.');

      const { data: openAnswersData, error: openAnswersError } = await supabase
        .from('levels_respuestas_abiertas')
        .select('id, pregunta_id_abierta, respuesta_texto')
        .in('pregunta_id_abierta', questionIds);

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
          `No hay ejercicios para las partes ${partMin} a ${partMax}. Comprueba que existan preguntas enlazadas a esas partes.`,
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

  /** Partes 8+ suelen llevar pasajes largos (writing / listening / speaking). */
  const shouldStickEnunciado = partNumber >= 8 && partNumber <= 17;

  const selectedPartContent = useMemo(() => {
    const rawPregunta = selectedQuestion?.enunciado || '';
    const desc = (selectedPart?.descripcion || '').replace(/\r\n/g, '\n').trim();
    const fallback = splitEnunciadoAndTextFallback(rawPregunta);
    const textoExtracted = extractTextoBloque(rawPregunta, partNumber) || '';
    return {
      enunciado: desc || fallback.enunciado,
      texto: (textoExtracted || fallback.texto || '').trim(),
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumber]);

  const contextSnippetForAi = useMemo(() => {
    const pack = [selectedPartContent.enunciado, selectedPartContent.texto].filter(Boolean).join('\n\n');
    return pack.slice(0, 5500);
  }, [selectedPartContent.enunciado, selectedPartContent.texto]);

  const audioUrl = useMemo(() => {
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

  /** Rutas relativas al sitio: respeta `NEXT_PUBLIC_BASE_PATH` (next.config). */
  const resolvedAudioSrc = useMemo(() => {
    if (!audioUrl) return '';
    if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
    const bp = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
    const path = audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
    return `${bp}${path}`;
  }, [audioUrl]);

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

  /** Writing: inputs abiertos solo si hay claves comprobables y no es MCQ clásico. */
  const useOpenInputUi = Boolean(
    preferOpenInputs && !hasMcqStyle && openQuestionNumbers.length > 0,
  );

  const partScoreMetrics = useMemo(
    () =>
      computeLevelsPartScore({
        useOpenInputUi,
        openQuestionNumbers,
        openChecks,
        groupedAnswers,
        checkedQuestions,
        selectedOptions,
        getQuestionKey,
        partId: selectedPart?.id,
      }),
    [
      useOpenInputUi,
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

  const sectionMaxWidth = showLongWritingWithAi ? 'min(960px, 100%)' : '700px';

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <B2ExamSlotPicker value={examSlot} onSelect={selectExamSlot} />
      {subtitle ? (
        <p style={{ textAlign: 'center', margin: '0.35rem 0 0', color: '#4a5568', fontSize: '1rem' }}>
          {subtitle}
        </p>
      ) : null}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => loadData()}
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
          {loading ? 'Actualizando…' : refreshLabel}
        </button>
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#718096' }}>
          Vuelve a cargar partes, textos y respuestas desde el servidor y limpia tus selecciones.
        </p>
      </div>

      <LevelsCategoryTimer categoryLabel={`Sesión: ${title}`} timeLabel={timerLabel} />
      {!showLongWritingWithAi ? (
        <LevelsPartScorePanel
          correctCount={partScoreMetrics.correctCount}
          totalSlots={partScoreMetrics.totalSlots}
          passingCount={partScoreMetrics.passingCount}
        />
      ) : null}

      <section style={{ maxWidth: sectionMaxWidth, margin: '2rem auto' }}>
        {loading && <p style={{ textAlign: 'center' }}>{loadingLabel}</p>}
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
              {partsData.map((part) => (
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
                    if (part.questions.length > 1) {
                      const currentSelected = selectedQuestionByPart[part.id];
                      const available = part.questions.filter((q) => q.preguntaId !== currentSelected);
                      const pool = available.length > 0 ? available : part.questions;
                      const randomIndex = Math.floor(Math.random() * pool.length);
                      const nextQuestion = pool[randomIndex];
                      setSelectedQuestionByPart((prev) => ({
                        ...prev,
                        [part.id]: nextQuestion.preguntaId,
                      }));
                    } else if (part.questions.length === 1) {
                      setSelectedQuestionByPart((prev) => ({
                        ...prev,
                        [part.id]: part.questions[0].preguntaId,
                      }));
                    }
                  }}
                >
                  {part.nombre}
                </button>
              ))}
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
                    <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>Enunciado</p>
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
                </div>

                {audioUrl ? (
                  <div style={{ marginTop: '0.85rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1a365d' }}>Audio</p>
                    <audio key={resolvedAudioSrc} controls src={resolvedAudioSrc} style={{ width: '100%' }}>
                      <track kind="captions" />
                    </audio>
                  </div>
                ) : null}

                {textoLinesForDisplay.length > 0 ? (
                  <div
                    style={{
                      marginTop: '0.7rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.95rem 1rem',
                      position: shouldStickEnunciado ? 'sticky' : 'static',
                      top: shouldStickEnunciado ? '0.75rem' : 'auto',
                      zIndex: shouldStickEnunciado ? 30 : 'auto',
                      maxHeight: shouldStickEnunciado ? '40vh' : 'none',
                      overflowY: shouldStickEnunciado ? 'auto' : 'visible',
                      boxShadow: shouldStickEnunciado ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                    }}
                  >
                    <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#1a365d' }}>Texto</p>
                    {textoLinesForDisplay.map((line, idx) => (
                      <p key={`texto-${idx}`} style={{ margin: '0.45rem 0', lineHeight: 1.7 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div style={{ marginTop: '1.25rem' }}>
                  {showLongWritingWithAi ? (
                    <B2WritingLongFormAiPanel
                      storageKey={longWritingStorageKey}
                      wordMin={writingWordMin}
                      wordMax={writingWordMax}
                      heading={`Tu respuesta — ${selectedPart.nombre}`}
                      partLabel={selectedPart.nombre}
                      partDescription={selectedPart.descripcion || ''}
                      taskInstructions={selectedPartContent.enunciado || ''}
                      taskInputText={selectedPartContent.texto || ''}
                    />
                  ) : null}

                  {!showLongWritingWithAi ? (
                    <h3 style={{ margin: '0 0 0.75rem', color: '#1a202c' }}>Preguntas</h3>
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
                              Pregunta {questionNumber}
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
                                placeholder="Tu respuesta"
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
                                  setOpenChecks((prev) => ({ ...prev, [questionKey]: isCorrect }));
                                  if (typeof prevResult !== 'boolean') {
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
                                      if (error) console.warn('levels_estadisticas (eval):', error.message || error);
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
                                Comprobar
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
                  {!showLongWritingWithAi && !(useOpenInputUi && openQuestionNumbers.length > 0) ? (
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
                            {group.questionNumber ? `Pregunta ${group.questionNumber}` : 'Opciones'}
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
                                    setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
                                    setCheckedQuestions((prev) => ({ ...prev, [questionKey]: true }));
                                    if (!wasChecked) {
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
                                        answersFromDatabase:
                                          answersFromDatabase ||
                                          undefined,
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
                                        if (error) console.warn('levels_estadisticas (eval):', error.message || error);
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
            )}
          </>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
              marginTop: '2rem',
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
    </main>
  );
}

export default function B2ExamPaperPracticePage(props) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
          Cargando práctica…
        </main>
      }
    >
      <B2ExamPaperPracticePageInner {...props} />
    </Suspense>
  );
}
