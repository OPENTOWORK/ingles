'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatWritingFeedbackHtml } from '@/lib/formatWritingFeedbackHtml';
import { buildClientApiUrl, getStaticApiHint } from '@/utils/clientApiUrl';

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const CRITERIA = [
  { key: 'content', label: 'Content' },
  { key: 'communication', label: 'Communicative Achievement' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'language', label: 'Language' },
];

/**
 * Long-form writing area + Cambridge B2 First AI correction.
 */
export default function B2WritingLongFormAiPanel({
  storageKey,
  wordMin = 140,
  wordMax = 190,
  heading = 'Your answer',
  taskInstructions = '',
  taskInputText = '',
  partLabel = '',
  partDescription = '',
  examContextBuilder,
  onScoresReady,
  lang = 'en',
}) {
  const isEn = lang === 'en';
  const [essay, setEssay] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState('');
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setEssay(raw || '');
    } catch {
      setEssay('');
    }
    setAiFeedback('');
    setScores(null);
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
    const text = essay.trim();
    if (!text) return;

    setLastError('');
    setLoading(true);
    setAiFeedback('');
    setScores(null);

    try {
      const externalBaseConfigured = Boolean(
        String(process.env.NEXT_PUBLIC_AI_API_BASE_URL || '').trim(),
      );
      const structuredExamContext =
        typeof examContextBuilder === 'function' ? examContextBuilder(text) : '';

      const res = await fetch(buildClientApiUrl('/api/feedback/essay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: text,
          level: 'b2',
          wordMin,
          wordMax,
          structuredExamContext: structuredExamContext || undefined,
          taskContext: structuredExamContext
            ? undefined
            : {
                partLabel: partLabel || undefined,
                partDescription: partDescription || undefined,
                instructions: taskInstructions || undefined,
                inputText: taskInputText || undefined,
              },
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          isEn
            ? 'Invalid response from the correction service.'
            : 'Respuesta inválida del servicio de corrección.',
        );
      }

      if (!res.ok) {
        const hint =
          !externalBaseConfigured && (res.status === 404 || res.status === 405)
            ? ` ${getStaticApiHint()}`
            : '';
        throw new Error((data.error || `Error ${res.status}`) + hint);
      }

      const feedbackText = String(data.feedback || '').trim();
      if (!feedbackText) {
        throw new Error(
          isEn
            ? 'The examiner returned no feedback. Please try again.'
            : 'El examinador no devolvió corrección. Inténtalo de nuevo.',
        );
      }

      setAiFeedback(feedbackText);
      if (data.scores && typeof data.scores === 'object') {
        setScores(data.scores);
        if (typeof onScoresReady === 'function') {
          onScoresReady(data.scores);
        }
      }

      requestAnimationFrame(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setLastError(
        err?.message ||
          (isEn ? 'Could not connect to Dralo for feedback.' : 'No se pudo conectar con Dralo para la corrección.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="levels-b2-writing-panel">
      <p className="levels-exam-split__section-title">{heading}</p>

      <div className="levels-b2-writing-panel__meta">
        <span>
          {isEn ? 'Cambridge B2 First length' : 'Extensión B2 First'}:{' '}
          <strong>
            {wordMin}–{wordMax} {isEn ? 'words' : 'palabras'}
          </strong>
        </span>
        <span>
          {isEn ? 'Words' : 'Palabras'}: <strong>{wordCount}</strong>
        </span>
        {wordCount > 0 && !meetsWordRange ? (
          <span className="levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--warn">
            {isEn
              ? `Outside ${wordMin}–${wordMax} words — you can still submit for Cambridge-style feedback.`
              : `Fuera de ${wordMin}–${wordMax} palabras — puedes enviar igualmente para corrección.`}
          </span>
        ) : null}
        {wordCount > 0 && meetsWordRange ? (
          <span className="levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--ok">
            {isEn ? 'Word count within range.' : 'Extensión dentro del rango.'}
          </span>
        ) : null}
      </div>

      <textarea
        className="levels-b2-writing-panel__textarea"
        rows={18}
        placeholder={
          isEn
            ? 'Write your full text here (essay, email, review, etc.)…'
            : 'Escribe aquí tu texto completo (essay, email, review, etc.)…'
        }
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        spellCheck
        aria-label="B2 writing area"
      />

      <div className="levels-b2-writing-panel__actions">
        <button
          type="button"
          className="levels-b2-writing-panel__submit"
          onClick={() => void evaluateEssay()}
          disabled={loading || !essay.trim()}
          aria-disabled={loading || !essay.trim()}
        >
          {loading
            ? isEn
              ? 'Checking with Cambridge criteria…'
              : 'Corrigiendo con criterios Cambridge…'
            : isEn
              ? 'Check with Dralo'
              : 'Corregir con Dralo'}
        </button>
      </div>

      {lastError ? (
        <p className="levels-b2-writing-panel__error" role="alert">
          {lastError}
        </p>
      ) : null}

      {scores ? (
        <div className="levels-b2-writing-panel__scores" ref={feedbackRef}>
          <p className="levels-exam-split__section-title">
            {isEn ? 'Cambridge B2 First — Scores' : 'Cambridge B2 First — Puntuación'}
          </p>
          <div className="levels-b2-writing-panel__scores-grid">
            {CRITERIA.map(({ key, label }) => (
              <div key={key} className="levels-b2-writing-panel__score-card">
                <span className="levels-b2-writing-panel__score-label">{label}</span>
                <strong className="levels-b2-writing-panel__score-value">
                  {scores[key] ?? 0}/5
                </strong>
              </div>
            ))}
          </div>
          <div
            className={`levels-b2-writing-panel__total ${
              scores.passed
                ? 'levels-b2-writing-panel__total--pass'
                : 'levels-b2-writing-panel__total--fail'
            }`}
          >
            <span>
              {isEn ? 'Total' : 'Total'}: <strong>{scores.total ?? 0}/20</strong>
              {' · '}
              {isEn ? 'Pass' : 'Aprobado'}: {scores.required ?? 12}/20
            </span>
            <span>{scores.passed ? (isEn ? '✅ Pass' : '✅ Aprobado') : (isEn ? '❌ Not yet' : '❌ Aún no')}</span>
          </div>
        </div>
      ) : null}

      {aiFeedback ? (
        <div className="levels-b2-writing-panel__feedback" ref={scores ? undefined : feedbackRef}>
          <p className="levels-exam-split__section-title">
            {isEn ? 'Cambridge examiner feedback' : 'Corrección del examinador Cambridge'}
          </p>
          <div
            className="levels-b2-writing-panel__feedback-body"
            dangerouslySetInnerHTML={{ __html: formatWritingFeedbackHtml(aiFeedback) }}
          />
        </div>
      ) : null}
    </div>
  );
}
