'use client';

import { useState, useEffect, useCallback } from 'react';
import '@/styles/exam-styles.css';
import { buildClientApiUrl, getStaticApiHint } from '@/utils/clientApiUrl';

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Cuadro de texto largo + corrección Dralo (mismo patrón visual que C1 exam-1 part-8: exam-styles.css).
 *
 * @param {object} props
 * @param {string} props.storageKey — clave localStorage por tarea (p. ej. pregunta_id)
 * @param {number} [props.wordMin]
 * @param {number} [props.wordMax]
 * @param {string} [props.heading] — título sobre el área de escritura
 * @param {string} [props.taskInstructions] — enunciado / consigna (desde Supabase)
 * @param {string} [props.taskInputText] — textos de apoyo, bullet points, etc.
 * @param {string} [props.partLabel] — nombre de la parte (p. ej. Part 8)
 * @param {string} [props.partDescription] — descripción fija de la parte si existe
 * @param {(scores: { content: number, communication: number, organisation: number, language: number, total: number, passed: boolean, required: number }) => void} [props.onScoresReady]
 */
export default function B2WritingLongFormAiPanel({
  storageKey,
  wordMin = 140,
  wordMax = 190,
  heading = 'Tu respuesta',
  taskInstructions = '',
  taskInputText = '',
  partLabel = '',
  partDescription = '',
  onScoresReady,
}) {
  const [essay, setEssay] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setEssay(raw || '');
    } catch {
      setEssay('');
    }
    setAiFeedback('');
    setLastError('');
  }, [storageKey]);

  const persist = useCallback(
    (value) => {
      if (typeof window === 'undefined' || !storageKey) return;
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        /* ignore quota */
      }
    },
    [storageKey],
  );

  useEffect(() => {
    const t = setTimeout(() => persist(essay), 350);
    return () => clearTimeout(t);
  }, [essay, persist]);

  const wordCount = countWords(essay);
  const meetsWordRange = wordCount >= wordMin && wordCount <= wordMax;

  const evaluateEssay = async () => {
    setLastError('');
    setLoading(true);
    setAiFeedback('');

    try {
      const externalBaseConfigured = Boolean(
        String(process.env.NEXT_PUBLIC_AI_API_BASE_URL || '').trim(),
      );
      const res = await fetch(buildClientApiUrl('/api/feedback/essay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay,
          level: 'b2',
          wordMin,
          wordMax,
          taskContext: {
            partLabel: partLabel || undefined,
            partDescription: partDescription || undefined,
            instructions: taskInstructions || undefined,
            inputText: taskInputText || undefined,
          },
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setAiFeedback(data.feedback || '');
        if (data.scores && typeof onScoresReady === 'function') {
          onScoresReady(data.scores);
        }
      } else {
        const hint =
          !externalBaseConfigured && (res.status === 404 || res.status === 405)
            ? ` ${getStaticApiHint()}`
            : '';
        setLastError((data.error || 'Error desconocido.') + hint);
      }
    } catch {
      setLastError('No se pudo conectar con Dralo para la corrección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="questions-container" style={{ maxWidth: '100%' }}>
      <div className="questions-section-header">
        <h2>{heading}</h2>
      </div>

      <div className="question">
        <div className="question-content">
          <div className="word-limit-info" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ margin: 0 }}>
              <strong>Extensión recomendada (B2 First):</strong> {wordMin}–{wordMax} palabras
            </p>
            <p style={{ margin: 0 }}>
              <strong>Palabras:</strong> {wordCount}
            </p>
            {wordCount > 0 && !meetsWordRange ? (
              <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>
                Aún no entra en el rango {wordMin}–{wordMax} palabras (sigue siendo útil enviar a Dralo).
              </p>
            ) : null}
            {wordCount > 0 && meetsWordRange ? (
              <p style={{ margin: 0, color: '#15803d', fontWeight: 600 }}>Rango de extensión alcanzado.</p>
            ) : null}
          </div>

          <textarea
            className="writing-textarea"
            rows={18}
            placeholder="Escribe aquí tu texto completo (ensayo, email, review, etc.)…"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            spellCheck
            aria-label="Área de escritura B2"
          />
        </div>

        {essay.trim().length > 0 ? (
          <div className="question-feedback">
            <div className="feedback-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void evaluateEssay()}
                disabled={loading}
              >
                {loading ? 'Enviando a Dralo para corrección…' : 'Enviar a Dralo para corrección'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {lastError ? (
        <div className="validation-warning" style={{ marginTop: '1rem' }}>
          {lastError}
        </div>
      ) : null}

      {aiFeedback ? (
        <div
          className="explanation"
          style={{ marginTop: '2rem', backgroundColor: '#eef7ff', border: '1px solid #3b82f6' }}
        >
          <div className="explanation-header">
            <h4>Corrección Dralo (B2 First)</h4>
          </div>
          <div className="explanation-content">
            <div dangerouslySetInnerHTML={{ __html: String(aiFeedback).replace(/\n/g, '<br />') }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
