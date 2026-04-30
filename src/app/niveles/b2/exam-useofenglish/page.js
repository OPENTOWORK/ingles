'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

export default function UseOfEnglishExamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedQuestionByPart, setSelectedQuestionByPart] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadUseOfEnglishData = async () => {
      setLoading(true);
      setError('');

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

        const { data: examData, error: examError } = await supabase
          .from('levels_examenes')
          .select('id, level_id, nombre, tipo, modelo, Nivel')
          .eq('level_id', levelData.id)
          .limit(1)
          .single();

        if (examError || !examData) {
          throw new Error('No se pudo obtener el examen de B2.');
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from('levels_preguntas')
          .select('id, examen_id, level_id, parte_id, enunciado')
          .eq('level_id', levelData.id)
          .eq('examen_id', examData.id);

        if (questionsError || !questionsData?.length) {
          throw new Error('No hay preguntas disponibles para B2 Use of English.');
        }

        const partIds = [...new Set(questionsData.map((question) => question.parte_id).filter(Boolean))];
        const questionIds = questionsData.map((question) => question.id);

        const { data: partsTableData, error: partsError } = await supabase
          .from('levels_partes')
          .select('id, nombre_parte')
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

        const answersByQuestion = answersData.reduce((acc, answer) => {
          if (!acc[answer.pregunta_id]) acc[answer.pregunta_id] = [];
          acc[answer.pregunta_id].push(answer);
          return acc;
        }, {});

        const partsById = partsTableData.reduce((acc, part) => {
          acc[part.id] = part;
          return acc;
        }, {});

        const groupedByPart = questionsData.reduce((acc, question) => {
          const tablePart = partsById[question.parte_id];
          const partName = tablePart?.nombre_parte || 'Parte sin nombre';
          if (!acc[question.parte_id]) {
            acc[question.parte_id] = {
              id: question.parte_id,
              nombre: partName,
              questions: [],
            };
          }

          acc[question.parte_id].questions.push({
            preguntaId: question.id,
            enunciado: question.enunciado || 'Pregunta sin enunciado',
            respuestas: answersByQuestion[question.id] || [],
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

        if (isMounted) {
          setPartsData(normalizedParts);
          setSelectedPartId(normalizedParts[0]?.id || null);
          const initialQuestionSelection = normalizedParts.reduce((acc, part) => {
            if (part.questions.length === 0) return acc;
            const randomIndex = Math.floor(Math.random() * part.questions.length);
            acc[part.id] = part.questions[randomIndex].preguntaId;
            return acc;
          }, {});
          setSelectedQuestionByPart(initialQuestionSelection);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Error cargando datos de Use of English.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUseOfEnglishData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const getQuestionKey = (partId, questionNumber, fallbackKey = 'extra') =>
    `${partId}::${selectedQuestion?.preguntaId || 'sin-pregunta'}::${questionNumber ?? fallbackKey}`;
  const shouldStickEnunciado = selectedPart?.nombre === 'Parte 1';
  function splitEnunciadoAndText(rawText = '') {
    const normalized = rawText.replace(/\r\n/g, '\n').trim();
    if (!normalized) return { enunciado: '', texto: '' };

    const lines = normalized.split('\n');
    const textIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'text');
    if (textIndex === -1) return { enunciado: normalized, texto: '' };

    return {
      enunciado: lines.slice(0, textIndex).join('\n').trim(),
      texto: lines.slice(textIndex + 1).join('\n').trim(),
    };
  }
  const selectedPartContent = useMemo(
    () => splitEnunciadoAndText(selectedQuestion?.enunciado || ''),
    [selectedQuestion],
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
      const match = text.match(/^(\d+)\s+([A-D])\s+(.+)$/i);

      if (!match) {
        ungrouped.push(answer);
        return;
      }

      const questionNumber = Number(match[1]);
      const optionLetter = match[2].toUpperCase();
      const optionText = match[3];

      if (!groupsMap.has(questionNumber)) {
        groupsMap.set(questionNumber, []);
      }

      groupsMap.get(questionNumber).push({
        ...answer,
        formattedText: `${optionLetter}) ${optionText}`,
      });
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

      <section style={{ maxWidth: '800px', margin: '1.5rem auto', lineHeight: '1.6', color: '#333', textAlign: 'center' }}>
      </section>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        {loading && <p style={{ textAlign: 'center' }}>Cargando partes de Use of English...</p>}

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
                    {getGroupedAnswers(selectedQuestion.respuestas).map((group, groupIndex) => (
                      <div
                        key={`group-${group.questionNumber ?? 'extra'}-${groupIndex}`}
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
                                  setSelectedOptions((prev) => ({ ...prev, [questionKey]: option.id }));
                                  setCheckedQuestions((prev) => ({ ...prev, [questionKey]: true }));
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
                            <p style={{ margin: '0.7rem 0 0', fontWeight: 600, color: '#1f2937' }}>
                              Respuesta correcta:{' '}
                              {correct?.formattedText || correct?.respuesta || 'No disponible'}
                            </p>
                          );
                        })()}
                      </div>
                    ))}
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
