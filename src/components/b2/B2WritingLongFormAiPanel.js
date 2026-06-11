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

/* Mensaje principal por readiness (V2). El binario ✅/❌ queda solo como fallback legacy. */
const READINESS_UI = {
  'b2-ready': { icon: '✅', label: 'B2-ready', variant: 'pass' },
  borderline: { icon: '🟡', label: 'Borderline — close to B2', variant: 'warn' },
  'not-b2-ready': { icon: '🔵', label: 'Not B2-ready yet', variant: 'info' },
  'needs-improvement': { icon: '🔴', label: 'Needs improvement', variant: 'fail' },
  'score-pass-unverified': { icon: '✅', label: 'Pass (level not detected)', variant: 'pass' },
};

/**
 * Long-form writing area + B2 exam-style AI correction (Dralo).
 * In `examMode` the panel only offers textarea + word count + autosave:
 * no Check button, no scores, no feedback until the section is finished.
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
  onDraftStats,
  examMode = false,
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
  const hasSubmitted = Boolean(aiFeedback || scores);

  useEffect(() => {
    if (typeof onDraftStats === 'function') {
      onDraftStats({ wordCount, submitted: hasSubmitted, loading });
    }
  }, [wordCount, hasSubmitted, loading, onDraftStats]);

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
          {isEn ? 'B2 exam-style length' : 'Extensión estilo examen B2'}:{' '}
          <strong>
            {wordMin}–{wordMax} {isEn ? 'words' : 'palabras'}
          </strong>
        </span>
        <span>
          {isEn ? 'Words' : 'Palabras'}: <strong>{wordCount}</strong>
        </span>
        {wordCount > 0 && !meetsWordRange ? (
          <span className="levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--warn">
            {examMode
              ? isEn
                ? `Outside ${wordMin}–${wordMax} words.`
                : `Fuera de ${wordMin}–${wordMax} palabras.`
              : isEn
                ? `Outside ${wordMin}–${wordMax} words — you can still submit for feedback.`
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

      {examMode ? (
        <p className="levels-b2-writing-panel__exam-note">
          {isEn
            ? 'Your text is saved automatically. Feedback will be available after you finish the section.'
            : 'Tu texto se guarda automáticamente. La corrección estará disponible al terminar la sección.'}
        </p>
      ) : (
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
                ? 'Checking with Dralo…'
                : 'Corrigiendo con Dralo…'
              : isEn
                ? 'Check with Dralo'
                : 'Corregir con Dralo'}
          </button>
        </div>
      )}

      {!examMode && lastError ? (
        <p className="levels-b2-writing-panel__error" role="alert">
          {lastError}
        </p>
      ) : null}

      {!examMode && scores ? (
        <div className="levels-b2-writing-panel__scores" ref={feedbackRef}>
          <p className="levels-exam-split__section-title">
            {isEn ? 'Writing scores' : 'Puntuación del writing'}
          </p>
          {scores.cefr ? (
            <p className="levels-b2-writing-panel__cefr">
              {isEn ? 'Estimated CEFR level' : 'Nivel CEFR estimado'}:{' '}
              <strong>{scores.cefr}</strong>
            </p>
          ) : null}
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
          {(() => {
            const readinessUi = READINESS_UI[scores.readiness?.key] || null;
            const variant = readinessUi ? readinessUi.variant : scores.passed ? 'pass' : 'fail';
            return (
              <div className={`levels-b2-writing-panel__total levels-b2-writing-panel__total--${variant}`}>
                <span>
                  {isEn ? 'Total' : 'Total'}: <strong>{scores.total ?? 0}/20</strong>
                  {' · '}
                  {isEn ? 'Pass mark' : 'Nota de corte'}: {scores.required ?? 12}/20
                </span>
                <span className="levels-b2-writing-panel__readiness">
                  {readinessUi
                    ? `${readinessUi.icon} ${readinessUi.label}`
                    : scores.passed
                      ? isEn
                        ? '✅ Pass'
                        : '✅ Aprobado'
                      : isEn
                        ? '❌ Not yet'
                        : '❌ Aún no'}
                </span>
              </div>
            );
          })()}
        </div>
      ) : null}

      {!examMode && aiFeedback ? (
        <div className="levels-b2-writing-panel__feedback" ref={scores ? undefined : feedbackRef}>
          <p className="levels-exam-split__section-title">
            {isEn ? 'Dralo writing feedback' : 'Corrección de Dralo'}
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
