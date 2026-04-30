'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

export default function B2ReadingExamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadReadingData = async () => {
      setLoading(true);
      setError('');

      try {
        const { data: levelData, error: levelError } = await supabase
          .from('levels')
          .select('id, nombre')
          .ilike('nombre', 'b2')
          .limit(1)
          .single();

        if (levelError || !levelData) throw new Error('No se pudo obtener el nivel B2.');

        const { data: examData, error: examError } = await supabase
          .from('levels_examenes')
          .select('id, level_id')
          .eq('level_id', levelData.id)
          .limit(1)
          .single();

        if (examError || !examData) throw new Error('No se pudo obtener el examen de B2.');

        const { data: questionsData, error: questionsError } = await supabase
          .from('levels_preguntas')
          .select('id, examen_id, level_id, parte_id, enunciado')
          .eq('level_id', levelData.id)
          .eq('examen_id', examData.id);

        if (questionsError || !questionsData?.length) {
          throw new Error('No hay preguntas disponibles para B2 Reading.');
        }

        const partIds = [...new Set(questionsData.map((q) => q.parte_id).filter(Boolean))];
        const questionIds = questionsData.map((q) => q.id);

        const { data: partsTableData, error: partsError } = await supabase
          .from('levels_partes')
          .select('id, nombre_parte')
          .in('id', partIds);
        if (partsError) throw new Error('No se pudieron obtener las partes.');

        const { data: answersData, error: answersError } = await supabase
          .from('levels_respuestas')
          .select('id, pregunta_id, respuesta, correcta')
          .in('pregunta_id', questionIds);
        if (answersError) throw new Error('No se pudieron obtener las respuestas.');

        const answersByQuestion = answersData.reduce((acc, a) => {
          if (!acc[a.pregunta_id]) acc[a.pregunta_id] = [];
          acc[a.pregunta_id].push(a);
          return acc;
        }, {});

        const partsById = partsTableData.reduce((acc, part) => {
          acc[part.id] = part;
          return acc;
        }, {});

        const normalizedParts = questionsData
          .map((question) => {
            const tablePart = partsById[question.parte_id];
            return {
              id: question.parte_id,
              nombre: tablePart?.nombre_parte || 'Parte sin nombre',
              enunciado: question.enunciado || 'Pregunta sin enunciado',
              respuestas: answersByQuestion[question.id] || [],
            };
          })
          .filter((part) => {
            const partNumber = Number(part.nombre.match(/\d+/)?.[0] || 0);
            return partNumber >= 5 && partNumber <= 7;
          })
          .sort((a, b) => {
            const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
            const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
            return aNumber - bNumber;
          });

        if (isMounted) {
          setPartsData(normalizedParts);
          setSelectedPartId(normalizedParts[0]?.id || null);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Error cargando Reading.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReadingData();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPart = useMemo(
    () => partsData.find((part) => part.id === selectedPartId),
    [partsData, selectedPartId],
  );

  const getQuestionKey = (partId, questionNumber, fallbackKey = 'extra') =>
    `${partId}::${questionNumber ?? fallbackKey}`;

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
      if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
      groupsMap.get(questionNumber).push({ ...answer, formattedText: `${optionLetter}) ${optionText}` });
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
      <h1 style={{ textAlign: 'center' }}>B2 Reading Practice</h1>

      <section style={{ maxWidth: '700px', margin: '2rem auto' }}>
        {loading && <p style={{ textAlign: 'center' }}>Cargando partes de Reading...</p>}
        {!loading && error && <p style={{ textAlign: 'center', color: '#c53030', fontWeight: 600 }}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', justifyItems: 'center', marginBottom: '1.5rem' }}>
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
                  onClick={() => setSelectedPartId(part.id)}
                >
                  {part.nombre}
                </button>
              ))}
            </div>

            {selectedPart && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                <h2 style={{ marginTop: 0 }}>{selectedPart.nombre}</h2>
                <p style={{ color: '#2d3748', whiteSpace: 'pre-wrap' }}><strong>Pregunta:</strong> {selectedPart.enunciado}</p>

                <div style={{ marginTop: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.75rem', color: '#1a202c' }}>Preguntas</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {getGroupedAnswers(selectedPart.respuestas).map((group, groupIndex) => (
                      <div key={`group-${group.questionNumber ?? 'extra'}-${groupIndex}`} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', background: '#ffffff' }}>
                        <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: '#2d3748' }}>
                          {group.questionNumber ? `Pregunta ${group.questionNumber}` : 'Opciones'}
                        </p>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                          {group.options.map((option) => {
                            const questionKey = getQuestionKey(selectedPart.id, group.questionNumber, `extra-${groupIndex}`);
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
                                  border: showCorrect ? '2px solid #2f855a' : showIncorrect ? '2px solid #c53030' : isSelected ? '2px solid #3182ce' : '1px solid #e2e8f0',
                                  backgroundColor: showCorrect ? '#f0fff4' : showIncorrect ? '#fff5f5' : isSelected ? '#ebf8ff' : '#fff',
                                  cursor: 'pointer',
                                }}
                              >
                                {option.formattedText || option.respuesta}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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
