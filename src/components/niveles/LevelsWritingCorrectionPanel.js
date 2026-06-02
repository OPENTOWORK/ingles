'use client';

import { useState } from 'react';
import { callDraloAi } from '@/lib/ai/draloAiClient';
import { formatWritingFeedbackHtml } from '@/lib/formatWritingFeedbackHtml';
import { trackWritingErrors } from '@/lib/errorTracker';

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const WRITING_TYPES = [
  'essay',
  'email',
  'article',
  'review',
  'report',
  'proposal',
  'story',
  'message',
];

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Exam Coach — writing correction via POST /api/dralo-ai/ (no OpenAI en cliente).
 */
export default function LevelsWritingCorrectionPanel({
  defaultLevel = 'B2',
  level: levelProp,
  onLevelChange,
  hideLevelSelector = false,
  variant = 'levels',
}) {
  const initialLevel = LEVELS.includes(String(defaultLevel || '').toUpperCase())
    ? String(defaultLevel).toUpperCase()
    : 'B2';

  const [internalLevel, setInternalLevel] = useState(initialLevel);
  const level = levelProp ?? internalLevel;
  const setLevel = onLevelChange ?? setInternalLevel;
  const isDralo = variant === 'dralo-ai';
  const [writingType, setWritingType] = useState('essay');
  const [studentWriting, setStudentWriting] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [shortWarning, setShortWarning] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setShortWarning('');
    setResult('');

    const trimmed = studentWriting.trim();
    if (!trimmed) {
      setError('Please write or paste your text first.');
      return;
    }

    const words = countWords(trimmed);
    if (words < 10) {
      setShortWarning(
        'This text is very short, so the level estimate may be limited.',
      );
    }

    const userInput = `Writing type: ${writingType}\n\nStudent writing:\n${trimmed}`;

    setLoading(true);
    try {
      const text = await callDraloAi({
        assistantType: 'exam',
        taskType: 'writing_correction',
        level,
        userInput,
      });
      setResult(text);

      void trackWritingErrors({
        level,
        source: 'Writing',
        skill: 'Writing',
        userText: trimmed,
        correctedText: text,
      }).catch(() => {});
    } catch (err) {
      setError(err?.message || 'Correction request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formClass = isDralo
    ? 'dralo-ai-writing-correction'
    : 'levels-b2-writing-panel levels-writing-correction';
  const fieldClass = isDralo ? 'dralo-ai-writing-correction__field' : 'levels-writing-correction__field';
  const labelClass = isDralo ? 'dralo-ai-writing-correction__label' : 'levels-writing-correction__label';
  const rowClass = isDralo ? 'dralo-ai-writing-correction__row' : 'levels-writing-correction__row';
  const selectClass = isDralo ? 'dralo-ai-input' : undefined;
  const textareaClass = isDralo
    ? 'dralo-ai-input dralo-ai-textarea'
    : 'levels-b2-writing-panel__textarea';
  const warnClass = isDralo
    ? 'dralo-ai-feedback dralo-ai-feedback--warn'
    : 'levels-b2-writing-panel__meta-note levels-b2-writing-panel__meta-note--warn';
  const errorClass = isDralo
    ? 'dralo-ai-feedback dralo-ai-feedback--bad'
    : 'levels-b2-writing-panel__error';
  const actionsClass = isDralo ? 'dralo-ai-actions' : 'levels-b2-writing-panel__actions';
  const submitClass = isDralo
    ? 'dralo-ai-btn dralo-ai-btn--primary'
    : 'levels-b2-writing-panel__submit';
  const feedbackWrapClass = isDralo
    ? 'dralo-ai-writing-feedback-wrap'
    : 'levels-b2-writing-panel__feedback';
  const feedbackBodyClass = isDralo
    ? 'dralo-ai-markdown dralo-ai-passage dralo-ai-writing-feedback levels-b2-writing-panel__feedback-body'
    : 'levels-b2-writing-panel__feedback-body';
  const feedbackTitleClass = isDralo ? 'dralo-ai-writing-correction__feedback-title' : 'levels-exam-split__section-title';

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <div className={rowClass}>
        {!hideLevelSelector ? (
          <label className={fieldClass}>
            <span className={labelClass}>Level</span>
            <select
              className={selectClass}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={loading}
              aria-label="CEFR level"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className={`${fieldClass}${hideLevelSelector ? ` ${fieldClass}--full` : ''}`}>
          <span className={labelClass}>Writing type</span>
          <select
            className={selectClass}
            value={writingType}
            onChange={(e) => setWritingType(e.target.value)}
            disabled={loading}
            aria-label="Writing type"
          >
            {WRITING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={`${fieldClass} ${isDralo ? '' : 'levels-writing-correction__field--full'}`}>
        <span className={labelClass}>Your writing</span>
        <textarea
          className={textareaClass}
          rows={16}
          placeholder="Paste or write your text here…"
          value={studentWriting}
          onChange={(e) => setStudentWriting(e.target.value)}
          disabled={loading}
          spellCheck
          aria-label="Student writing"
        />
      </label>

      {shortWarning ? (
        <p className={warnClass} role="status">
          {shortWarning}
        </p>
      ) : null}

      {error ? (
        <p className={errorClass} role="alert">
          {error}
        </p>
      ) : null}

      <div className={actionsClass}>
        <button
          type="submit"
          className={submitClass}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Correcting…' : 'Correct writing'}
        </button>
      </div>

      {result ? (
        <div className={feedbackWrapClass}>
          <p className={feedbackTitleClass}>Exam Coach feedback</p>
          <div
            className={feedbackBodyClass}
            dangerouslySetInnerHTML={{ __html: formatWritingFeedbackHtml(result) }}
          />
        </div>
      ) : null}
    </form>
  );
}
