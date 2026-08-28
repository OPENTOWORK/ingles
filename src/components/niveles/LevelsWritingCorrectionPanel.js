'use client';

import { useState } from 'react';
import { useDraloXpOptional } from '@/context/DraloXpContext';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import WritingFeedbackBody from '@/components/writing/WritingFeedbackBody';
import DraloThinking from '@/components/dralo/DraloThinking';
import { trackWritingErrors } from '@/lib/errorTracker';

const WRITING_TYPES = [
  'essay',
  'email',
  'article',
  'review',
  'report',
  'formal letter',
  'SMS / WhatsApp',
  'social media',
];

const TARGET_LEVELS = ['B1', 'B1+', 'low B2', 'B2', 'B2+'];

/* Mismo mapa de readiness que el panel de Practice Mode (V2). */
const READINESS_UI = {
  'b2-ready': { icon: '✅', label: 'B2-ready', variant: 'pass' },
  borderline: { icon: '🟡', label: 'Borderline — close to B2', variant: 'warn' },
  'not-b2-ready': { icon: '🔵', label: 'Not B2-ready yet', variant: 'info' },
  'needs-improvement': { icon: '🔴', label: 'Needs improvement', variant: 'fail' },
  'score-pass-unverified': { icon: '✅', label: 'Pass (level not detected)', variant: 'pass' },
};

const CRITERIA = [
  { key: 'content', label: 'Content' },
  { key: 'communication', label: 'Communicative Achievement' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'language', label: 'Language' },
];

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Writing Correction sandbox — corrige writings reales con su task original
 * usando el MISMO motor server-side que Practice Mode (/api/feedback/essay,
 * Writing Correction V2 detrás de flags de entorno locales).
 *
 * No toca Supabase, no afecta a Exam Mode ni al contenido de los exámenes.
 */
export default function LevelsWritingCorrectionPanel({
  defaultLevel = 'B2',
  // Props legacy del studio; se aceptan para no romper, pero el motor usa targetLevel.
  level: _levelProp,
  onLevelChange: _onLevelChange,
  hideLevelSelector: _hideLevelSelector = false,
  variant = 'levels',
}) {
  const isDralo = variant === 'dralo-ai';
  const [writingType, setWritingType] = useState('essay');
  const [targetLevel, setTargetLevel] = useState(
    TARGET_LEVELS.includes(defaultLevel) ? defaultLevel : 'B2',
  );
  const [taskPrompt, setTaskPrompt] = useState('');
  const [studentWriting, setStudentWriting] = useState('');
  const [result, setResult] = useState('');
  const [scores, setScores] = useState(null);
  const [error, setError] = useState('');
  const [shortWarning, setShortWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const draloXp = useDraloXpOptional();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setShortWarning('');
    setResult('');
    setScores(null);

    const trimmed = studentWriting.trim();
    if (!trimmed) {
      setError('Please write or paste your text first.');
      return;
    }

    const words = countWords(trimmed);
    if (words < 10) {
      setShortWarning('This text is very short, so the level estimate may be limited.');
    }

    setLoading(true);
    try {
      const res = await fetch(buildClientApiUrl('/api/feedback/essay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: trimmed,
          level: 'b2',
          wordMin: 140,
          wordMax: 190,
          taskContext: {
            partLabel: `Dralo AI Writing sandbox — ${writingType}`,
            partDescription: `Task type: ${writingType}. The student's target level is ${targetLevel}.`,
            instructions: taskPrompt.trim() || undefined,
          },
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('Invalid response from the correction service.');
      }
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      const feedbackText = String(data.feedback || '').trim();
      if (!feedbackText) {
        throw new Error('The examiner returned no feedback. Please try again.');
      }

      setResult(feedbackText);
      if (data.scores && typeof data.scores === 'object') {
        setScores(data.scores);
      }

      if (isDralo && draloXp) {
        void draloXp.awardForCorrectAnswer(`writing-correction-${targetLevel}`, {
          correct: true,
          kind: 'text',
          scorePercent: words >= 140 ? 82 : words >= 60 ? 68 : 52,
        });
      }

      void trackWritingErrors({
        level: targetLevel,
        source: 'Writing',
        skill: 'Writing',
        userText: trimmed,
        correctedText: feedbackText,
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
  const feedbackTitleClass = isDralo
    ? 'dralo-ai-writing-correction__feedback-title'
    : 'levels-exam-split__section-title';

  const readinessUi = READINESS_UI[scores?.readiness?.key] || null;
  const totalVariant = readinessUi ? readinessUi.variant : scores?.passed ? 'pass' : 'fail';

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <div className={rowClass}>
        <label className={fieldClass}>
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

        <label className={fieldClass}>
          <span className={labelClass}>Target level</span>
          <select
            className={selectClass}
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            disabled={loading}
            aria-label="Target level"
          >
            {TARGET_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={`${fieldClass} ${isDralo ? '' : 'levels-writing-correction__field--full'}`}>
        <span className={labelClass}>Task / question</span>
        <textarea
          className={textareaClass}
          rows={4}
          placeholder="Paste the original task here, e.g. Fast food is always a bad thing to eat. Do you agree? Give reasons for your answer."
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
          disabled={loading}
          spellCheck
          aria-label="Task or question prompt"
        />
      </label>

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
        <button type="submit" className={submitClass} disabled={loading} aria-busy={loading}>
          {loading ? 'Correcting…' : 'Check with Dralo'}
        </button>
      </div>

      {loading ? <DraloThinking size={120} label="Dralo is marking your writing" /> : null}

      {result ? (
        <div className={feedbackWrapClass}>
          <p className={feedbackTitleClass}>Exam Coach feedback</p>
          <WritingFeedbackBody feedback={result} className={feedbackBodyClass} />
        </div>
      ) : null}

      {scores ? (
        <div className="levels-b2-writing-panel__scores">
          <p className={feedbackTitleClass}>Writing scores</p>
          <div className="levels-b2-writing-panel__scores-grid">
            {CRITERIA.map(({ key, label }) => (
              <div key={key} className="levels-b2-writing-panel__score-card">
                <span className="levels-b2-writing-panel__score-label">{label}</span>
                <strong className="levels-b2-writing-panel__score-value">{scores[key] ?? 0}/5</strong>
              </div>
            ))}
          </div>
          <div className={`levels-b2-writing-panel__total levels-b2-writing-panel__total--${totalVariant}`}>
            <span>
              Total: <strong>{scores.total ?? 0}/20</strong>
              {' · '}
              Pass mark: {scores.required ?? 12}/20
            </span>
            <span className="levels-b2-writing-panel__readiness">
              {readinessUi
                ? `${readinessUi.icon} ${readinessUi.label}`
                : scores.passed
                  ? '✅ Pass'
                  : '❌ Not yet'}
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
