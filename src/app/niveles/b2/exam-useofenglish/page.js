'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LevelsCategoryTimer from '@/components/levels/LevelsCategoryTimer';
import LevelsPartScorePanel from '@/components/levels/LevelsPartScorePanel';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { computeLevelsPartScore } from '@/utils/levelsPaperScoreMetrics';
import { postLevelsAnswerJustification } from '@/utils/levelsJustifyClient';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { extractTextoBloque } from '@/utils/b2ExamTextBlocks';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { useUserRole } from '@/context/UserRoleContext';
import { getSessionUserId, mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';

export default function UseOfEnglishExamsPage() {
  const { userRole } = useUserRole();
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

  const mountedRef = useRef(true);
  const { label: timerLabel } = useLevelsCategoryTimer();

  const loadUseOfEnglishData = useCallback(async () => {
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

      if (levelError || !levelData) {
        throw new Error('No se pudo obtener el nivel B2 desde la base de datos.');
      }

      const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id);
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

      const { data: questionsData, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
        examenId,
        levelId: levelData.id,
      });

      if (questionsError || !questionsData?.length) {
        throw new Error('No hay preguntas disponibles para B2 Use of English.');
      }

      const partIds = [...new Set(questionsData.map((question) => question.parte_id).filter(Boolean))];
      const questionIds = questionsData.map((question) => question.id);

      const { data: partsTableData, error: partsError } = await supabase
        .from('levels_partes')
        .select('*')
        .in('id', partIds);

      if (partsError) {
        throw new Error('No se pudieron obtener las partes del examen.');
      }

      const { data: answersData, error: answersError } = await supabase
        .from('levels_respuestas')
        .select('id, pregunta_id, respuesta, correcta')
        .in('pregunta_id', questionIds);

      if (answersError) {
        throw new Error('No se pudieron obtener las respuestas del examen.');
      }

      const { data: openAnswersData, error: openAnswersError } = await supabase
        .from('levels_respuestas_abiertas')
        .select('id, pregunta_id_abierta, respuesta_texto')
        .in('pregunta_id_abierta', questionIds);

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
        const partName = tablePart?.nombre_parte || 'Parte sin nombre';
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
  }, []);

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

  /** Huecos abiertos / test: al cambiar de parte o de ejercicio, el estado local debe reiniciarse (no es un fallo de Supabase). */
  useEffect(() => {
    setOpenInputs({});
    setOpenChecks({});
    setSelectedOptions({});
    setCheckedQuestions({});
    setAiHintsByKey({});
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
    return {
      enunciado: desc || fallback.enunciado,
      texto: (textoExtracted || fallback.texto || '').trim(),
    };
  }, [selectedPart?.descripcion, selectedQuestion?.enunciado, partNumberUoe]);

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

  const normalizeText = (value = '') =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const getOpenAnswerMap = (answers = [], fallbackClosedAnswers = []) => {
    const map = new Map();
    const source = answers.length > 0
      ? answers.map((item) => item.respuesta_texto || '')
      : fallbackClosedAnswers.map((item) => item.respuesta || '');

    source.forEach((raw) => {
      const text = String(raw || '').trim();
      // Parser tolerante: acepta basura inicial/BOM y distintos espacios.
      const match = text.match(/(?:^|[^\d])(\d+)\s+(.+)$/);
      if (!match) return;
      const number = Number(match[1]);
      const answer = normalizeText(match[2]);
      if (!map.has(number)) map.set(number, new Set());
      map.get(number).add(answer);
    });

    return map;
  };

  const inferOpenQuestionNumbersFromPrompt = (rawText = '', partNumber = 0) => {
    const matches = [...String(rawText || '').matchAll(/(?:^|\n)\s*(\d{1,2})\b/gm)];
    const numbers = [...new Set(matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);
    if (numbers.length > 0) return numbers;
    if (partNumber === 2) return [9, 10, 11, 12, 13, 14, 15, 16];
    if (partNumber === 3) return [17, 18, 19, 20, 21, 22, 23, 24];
    if (partNumber === 4) return [25, 26, 27, 28, 29, 30];
    return [];
  };
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
  const openAnswerMap = useMemo(
    () => getOpenAnswerMap(selectedQuestion?.respuestasAbiertas || [], selectedQuestion?.respuestas || []),
    [selectedQuestion?.respuestasAbiertas, selectedQuestion?.respuestas],
  );
  const openQuestionNumbers = useMemo(
    () => {
      const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
      if (fromAnswers.length > 0) return fromAnswers;
      return inferOpenQuestionNumbersFromPrompt(selectedQuestion?.enunciado || '', partNumberUoe);
    },
    [openAnswerMap, selectedQuestion?.enunciado, partNumberUoe],
  );

  const groupedAnswersSelected = useMemo(
    () => getGroupedAnswers(selectedQuestion?.respuestas || []),
    [selectedQuestion?.respuestas],
  );

  const partScoreMetrics = useMemo(
    () =>
      computeLevelsPartScore({
        useOpenInputUi: isOpenClozePart,
        openQuestionNumbers,
        openChecks,
        groupedAnswers: groupedAnswersSelected,
        checkedQuestions,
        selectedOptions,
        getQuestionKey,
        partId: selectedPart?.id,
      }),
    [
      isOpenClozePart,
      openQuestionNumbers,
      openChecks,
      groupedAnswersSelected,
      checkedQuestions,
      selectedOptions,
      selectedPart?.id,
      selectedQuestion?.preguntaId,
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

  return (
    <main style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
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
        totalSlots={partScoreMetrics.totalSlots}
        passingCount={partScoreMetrics.passingCount}
      />

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
                                placeholder="Escribe una palabra"
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
                              <p
                                style={{
                                  margin: '0.7rem 0 0',
                                  fontWeight: 700,
                                  color: checkResult ? '#2f855a' : '#c53030',
                                }}
                              >
                                {checkResult ? 'Correcta' : 'Incorrecta'}
                              </p>
                            )}
                            <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
                          </div>
                        );
                      })
                    ) : (
                    groupedAnswersSelected.map((group, groupIndex) => (
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
