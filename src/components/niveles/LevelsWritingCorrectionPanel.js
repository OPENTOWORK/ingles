'use client';

import { useEffect, useRef, useState } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { useDraloAiPremiumGate, useDraloAiPreview } from '@/components/dralo-ai/DraloAiPreviewContext';
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

const SAMPLE_TASKS = {
  essay:
    'Some people believe that fast food is always a bad thing to eat. Do you agree? Write an essay giving reasons for your answer.',
  email:
    'You work in an office. Write an email to your manager asking to move tomorrow’s meeting and explaining why.',
  article: 'Write an article for a school magazine about a place in your town that visitors should see.',
  review: 'Write a review of a film or series you have seen recently for a website.',
  report:
    'Your college asked you to write a report on how students travel to class and to suggest one improvement.',
  'formal letter': 'Write a formal letter to a company complaining about a product you bought online.',
  'SMS / WhatsApp':
    'A friend is visiting your city this weekend. Write WhatsApp messages arranging where and when to meet.',
  'social media': 'Write a short social media post recommending a book, course or event to people your age.',
};

const TASK_SOURCE = {
  essay: { activity: 'essay' },
  email: { activity: 'work-email', track: 'situational' },
  article: { activity: 'article', track: 'situational' },
  review: { activity: 'article', track: 'situational' },
  report: { activity: 'part-2' },
  'formal letter': { activity: 'formal-letter', track: 'situational' },
  'SMS / WhatsApp': { activity: 'sms-whatsapp', track: 'situational' },
  'social media': { activity: 'social-post', track: 'situational' },
};

function cefrForTarget(level) {
  const value = String(level || '').toLowerCase();
  if (value.startsWith('c2')) return 'C2';
  if (value.startsWith('c1')) return 'C1';
  if (value.startsWith('a2')) return 'A2';
  if (value.startsWith('b1')) return 'B1';
  return 'B2';
}

function exerciseToTask(exercise) {
  if (!exercise || typeof exercise !== 'object') return '';
  const lines = [];
  const title = exercise.taskTitle || exercise.title;
  if (title) lines.push(title);
  const body =
    exercise.instructions ||
    exercise.situation ||
    exercise.prompt ||
    exercise.task ||
    exercise.context;
  if (body && body !== title) lines.push(body);
  if (exercise.recipient) lines.push(`To: ${exercise.recipient}`);
  if (exercise.subject) lines.push(`Subject: ${exercise.subject}`);
  if (exercise.audience) lines.push(`Audience: ${exercise.audience}`);
  if (exercise.angle && exercise.angle !== body) lines.push(exercise.angle);
  if (Array.isArray(exercise.bulletPoints) && exercise.bulletPoints.length) {
    lines.push(exercise.bulletPoints.map((item) => `• ${item}`).join('\n'));
  }
  if (Array.isArray(exercise.chatThread) && exercise.chatThread.length) {
    lines.push(
      exercise.chatThread
        .map((message) => `${message.from === 'them' ? 'Them' : 'You'}: ${message.text}`)
        .join('\n'),
    );
  }
  return lines.filter(Boolean).join('\n\n');
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
  const preview = useDraloAiPreview();
  const requirePremium = useDraloAiPremiumGate();
  const taskRequestRef = useRef(0);
  const [taskSpin, setTaskSpin] = useState(0);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
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

  useEffect(() => {
    if (!isDralo) return undefined;
    if (preview) {
      setTaskPrompt(SAMPLE_TASKS[writingType] || SAMPLE_TASKS.essay);
      setTaskLoading(false);
      setTaskError('');
      return undefined;
    }

    const requestId = ++taskRequestRef.current;
    const source = TASK_SOURCE[writingType] || TASK_SOURCE.essay;
    setTaskLoading(true);
    setTaskError('');

    void (async () => {
      try {
        const res = await fetch(buildClientApiUrl('/api/dralo-ai/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            mode: 'writing',
            activity: source.activity,
            level: cefrForTarget(targetLevel),
            track: source.track,
            varietySeed: Date.now() + taskSpin,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Could not prepare the task.');
        if (requestId !== taskRequestRef.current) return;
        setTaskPrompt(exerciseToTask(data.exercise) || SAMPLE_TASKS[writingType] || SAMPLE_TASKS.essay);
      } catch (err) {
        if (requestId !== taskRequestRef.current) return;
        setTaskError(err?.message || 'Could not prepare the task.');
      } finally {
        if (requestId === taskRequestRef.current) setTaskLoading(false);
      }
    })();

    return undefined;
  }, [isDralo, preview, writingType, targetLevel, taskSpin]);

  function requestNewTask() {
    if (requirePremium()) return;
    setTaskSpin((value) => value + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (requirePremium()) return;
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

      {isDralo ? (
        <div className={fieldClass}>
          <span className={labelClass}>Task / question</span>
          <div className="dralo-ai-writing-correction__task" aria-live="polite">
            {taskLoading ? (
              <DraloThinking variant="inline" size={44} label="Dralo is writing the task" />
            ) : (
              taskPrompt
            )}
          </div>
          {taskError ? <p className={errorClass}>{taskError}</p> : null}
          <div className={actionsClass}>
            <button
              type="button"
              className="dralo-ai-btn dralo-ai-btn--ghost"
              onClick={requestNewTask}
              disabled={taskLoading || loading}
            >
              New task
            </button>
          </div>
        </div>
      ) : (
        <label className={`${fieldClass} levels-writing-correction__field--full`}>
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
      )}

      <label className={`${fieldClass} ${isDralo ? '' : 'levels-writing-correction__field--full'}`}>
        <span className={labelClass}>Your writing</span>
        <textarea
          className={textareaClass}
          rows={16}
          placeholder={isDralo ? undefined : 'Paste or write your text here…'}
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
