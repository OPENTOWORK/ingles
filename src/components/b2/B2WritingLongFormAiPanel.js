'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildClientApiUrl, getStaticApiHint } from '@/utils/clientApiUrl';

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Long-form writing area + Dralo AI feedback (B2 First style).
 *
 * @param {object} props
 * @param {string} props.storageKey — localStorage key per task (e.g. pregunta_id)
 * @param {number} [props.wordMin]
 * @param {number} [props.wordMax]
 * @param {string} [props.heading] — title above the writing area
 * @param {string} [props.taskInstructions] — task prompt (from Supabase)
 * @param {string} [props.taskInputText] — supporting text, bullet points, etc.
 * @param {string} [props.partLabel] — part name (e.g. Part 8)
 * @param {string} [props.partDescription] — fixed part description if any
 * @param {(scores: { content: number, communication: number, organisation: number, language: number, total: number, passed: boolean, required: number }) => void} [props.onScoresReady]
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
        setLastError((data.error || 'Unknown error.') + hint);
      }
    } catch {
      setLastError('Could not connect to Dralo for feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="levels-b2-writing-panel">
      <p className="levels-exam-split__section-title">{heading}</p>

      <div className="levels-b2-writing-panel__meta">
        <span>
          Recommended length (B2 First): <strong>{wordMin}–{wordMax} words</strong>
        </span>
        <span>
          Words: <strong>{wordCount}</strong>
        </span>
        {wordCount > 0 && !meetsWordRange ? (
          <span className="levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--warn">
            Not yet within {wordMin}–{wordMax} words (you can still submit for feedback).
          </span>
        ) : null}
        {wordCount > 0 && meetsWordRange ? (
          <span className="levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--ok">
            Word count within range.
          </span>
        ) : null}
      </div>

      <textarea
        className="levels-b2-writing-panel__textarea"
        rows={18}
        placeholder="Write your full text here (essay, email, review, etc.)…"
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        spellCheck
        aria-label="B2 writing area"
      />

      {essay.trim().length > 0 ? (
        <div className="levels-b2-writing-panel__actions">
          <button
            type="button"
            className="levels-b2-writing-panel__submit"
            onClick={() => void evaluateEssay()}
            disabled={loading}
          >
            {loading ? 'Submitting to Dralo…' : 'Submit to Dralo for feedback'}
          </button>
        </div>
      ) : null}

      {lastError ? (
        <p className="levels-b2-writing-panel__error" role="alert">
          {lastError}
        </p>
      ) : null}

      {aiFeedback ? (
        <div className="levels-b2-writing-panel__feedback">
          <p className="levels-exam-split__section-title">Dralo feedback (B2 First)</p>
          <div
            className="levels-b2-writing-panel__feedback-body"
            dangerouslySetInnerHTML={{ __html: String(aiFeedback).replace(/\n/g, '<br />') }}
          />
        </div>
      ) : null}
    </div>
  );
}
