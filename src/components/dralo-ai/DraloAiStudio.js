'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHero from '@/components/PageHero';
import Link from 'next/link';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import {
  getRecentFingerprints,
  getUoeExerciseFingerprint,
  normalizeRlCheckResult,
  normalizeUoeCheckResult,
  pickRandomTopic,
  rememberExerciseFingerprint,
} from '@/lib/draloAiExerciseVariety';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';

const ACCENT_SOLID = {
  indigo: '#6366f1',
  ocean: '#2563eb',
  amber: '#d97706',
  emerald: '#059669',
  rose: '#e11d48',
  violet: '#7c3aed',
};

async function callDraloAi(payload) {
  const res = await fetch('/api/dralo-ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function LoadingDralo() {
  return (
    <div className="dralo-ai-loading">
      <span>Dralo is thinking</span>
      <span className="dralo-ai-loading__dots" aria-hidden>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}

export default function DraloAiStudio({ config }) {
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const [activityId, setActivityId] = useState(config.activities[0]?.id || '');
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [feedbackByQ, setFeedbackByQ] = useState({});
  const [uoeAnswer, setUoeAnswer] = useState('');
  const [uoeFeedback, setUoeFeedback] = useState(null);
  const [essay, setEssay] = useState('');
  const [essayFeedback, setEssayFeedback] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);

  const activity = useMemo(
    () => config.activities.find((a) => a.id === activityId) || config.activities[0],
    [config.activities, activityId],
  );

  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.indigo;
  const isWriting = config.id === 'writing';
  const isListening = config.id === 'listening';
  const isUoe = config.id === 'use-of-english';

  const wordMin = exercise?.wordMin ?? 140;
  const wordMax = exercise?.wordMax ?? 190;
  const wordCount = countWords(essay);

  const resetState = useCallback(() => {
    setExercise(null);
    setAnswers({});
    setFeedbackByQ({});
    setUoeAnswer('');
    setUoeFeedback(null);
    setEssay('');
    setEssayFeedback('');
    setError('');
  }, []);

  useEffect(() => {
    resetState();
  }, [activityId, level, resetState]);

  const generateExercise = async () => {
    setLoading(true);
    setError('');
    resetState();
    try {
      const varietySeed = Date.now() + Math.floor(Math.random() * 1e6);
      const recentFingerprints = isUoe
        ? getRecentFingerprints(config.id, activityId, level)
        : [];
      const data = await callDraloAi({
        action: 'generate',
        mode: config.id,
        activity: activityId,
        level,
        varietySeed,
        recentFingerprints,
        topic: isUoe ? pickRandomTopic(varietySeed) : undefined,
      });
      setExercise(data.exercise);
      if (isUoe && data.exercise) {
        rememberExerciseFingerprint(
          config.id,
          activityId,
          level,
          getUoeExerciseFingerprint(data.exercise, activityId),
        );
      }
    } catch (e) {
      setError(e.message || 'Could not generate the exercise.');
    } finally {
      setLoading(false);
    }
  };

  const checkUoe = async () => {
    if (!exercise || !uoeAnswer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await callDraloAi({
        action: 'check',
        mode: config.id,
        activity: activityId,
        level,
        exercise,
        userAnswer: uoeAnswer,
      });
      setUoeFeedback(normalizeUoeCheckResult(data.result, exercise));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkQuestion = async (q) => {
    const ans = answers[q.id];
    if (!ans?.trim() || !exercise) return;
    setLoading(true);
    setError('');
    try {
      const data = await callDraloAi({
        action: 'check',
        mode: config.id,
        activity: activityId,
        level,
        exercise,
        userAnswer: ans,
        questionId: q.id,
      });
      setFeedbackByQ((prev) => ({
        ...prev,
        [q.id]: normalizeRlCheckResult(data.result, exercise, q.id),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEssay = async () => {
    if (!essay.trim() || !exercise) return;
    setLoading(true);
    setError('');
    setEssayFeedback('');
    try {
      const res = await fetch(buildClientApiUrl('/api/feedback/essay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay,
          level: level.toLowerCase(),
          wordMin: exercise.wordMin,
          wordMax: exercise.wordMax,
          taskContext: {
            partLabel: exercise.taskTitle,
            instructions: exercise.instructions,
            inputText: exercise.inputNotes || '',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not get feedback.');
      setEssayFeedback(data.feedback || data.text || JSON.stringify(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const listenButtonLabel = useMemo(() => {
    if (audioLoading) return 'Preparing audio…';
    if (['conversation', 'short-extracts', 'multiple-matching'].includes(activityId)) {
      return 'Play conversation';
    }
    return 'Play recording';
  }, [audioLoading, activityId]);

  const playListeningScript = async () => {
    if (!exercise?.script) return;
    setAudioLoading(true);
    setError('');
    let objectUrl;
    try {
      const res = await fetch('/api/dralo-ai/listening-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: exercise.script.slice(0, 4000),
          activity: activityId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Could not play audio.');
      }
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audio.onended = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
      await audio.play();
    } catch (e) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setError(e.message || 'Audio unavailable. Check OPENAI_API_KEY is set.');
    } finally {
      setAudioLoading(false);
    }
  };

  const renderUoe = () => {
    if (!exercise) return null;
    if (activityId === 'multiple-choice-cloze') {
      const opts = exercise.options || [];
      return (
        <div className="dralo-ai-exercise">
          <p className="dralo-ai-sentence">{exercise.instruction}</p>
          <p className="dralo-ai-sentence">
            {exercise.textBefore}
            <strong> ______ </strong>
            {exercise.textAfter}
          </p>
          <div className="dralo-ai-options">
            {opts.map((opt, i) => {
              const label = `${String.fromCharCode(65 + i)}) ${opt}`;
              const selected = uoeAnswer === opt;
              let cls = 'dralo-ai-option';
              if (selected) cls += ' is-selected';
              if (uoeFeedback) {
                if (uoeFeedback.correct && selected) cls += ' is-correct';
                if (!uoeFeedback.correct && selected) cls += ' is-wrong';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  className={cls}
                  disabled={!!uoeFeedback}
                  onClick={() => setUoeAnswer(opt)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    if (activityId === 'key-word') {
      return (
        <div className="dralo-ai-exercise">
          <p className="dralo-ai-sentence">{exercise.sentence1}</p>
          <p className="dralo-ai-sentence">
            {exercise.sentence2Start}
            <span className="dralo-ai-keyword">{exercise.keyword}</span>
            <span> ______</span>
          </p>
          <input
            className="dralo-ai-input"
            value={uoeAnswer}
            onChange={(e) => setUoeAnswer(e.target.value)}
            placeholder={`Up to ${exercise.maxWords || 5} words…`}
            disabled={!!uoeFeedback}
          />
        </div>
      );
    }
    return (
      <div className="dralo-ai-exercise">
        <p className="dralo-ai-sentence">{exercise.instruction}</p>
        <p className="dralo-ai-sentence">
          {exercise.textBefore}
          <strong> ______ </strong>
          {exercise.textAfter}
          {activityId === 'word-formation' && exercise.stem ? (
            <>
              {' '}
              (<span className="dralo-ai-keyword">{exercise.stem}</span>)
            </>
          ) : null}
        </p>
        <input
          className="dralo-ai-input"
          value={uoeAnswer}
          onChange={(e) => setUoeAnswer(e.target.value)}
          placeholder={activityId === 'word-formation' ? 'One word…' : 'Your answer…'}
          disabled={!!uoeFeedback}
        />
      </div>
    );
  };

  const renderReadingListening = () => {
    if (!exercise) return null;
    return (
      <div className="dralo-ai-exercise">
        {exercise.title ? <h3 style={{ margin: 0, fontWeight: 800 }}>{exercise.title}</h3> : null}
        {exercise.setting ? <p style={{ margin: 0, color: '#64748b' }}>{exercise.setting}</p> : null}
        {exercise.passage ? (
          <div className="dralo-ai-passage">{exercise.passage}</div>
        ) : null}
        {isListening && exercise.script ? (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--listen"
            onClick={playListeningScript}
            disabled={audioLoading}
          >
            <span aria-hidden="true">🔊 </span>
            {listenButtonLabel}
          </button>
        ) : null}
        {(exercise.questions || []).map((q) => {
          const fb = feedbackByQ[q.id];
          const opts = q.options || [];
          return (
            <div key={q.id} className="dralo-ai-question">
              <h3>{q.prompt}</h3>
              {opts.length > 0 ? (
                <div className="dralo-ai-options">
                  {opts.map((opt) => {
                    const selected = answers[q.id] === opt;
                    let cls = 'dralo-ai-option';
                    if (selected) cls += ' is-selected';
                    if (fb) {
                      if (fb.correct && selected) cls += ' is-correct';
                      if (!fb.correct && selected) cls += ' is-wrong';
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cls}
                        disabled={!!fb}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  className="dralo-ai-input"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  disabled={!!fb}
                />
              )}
              {!fb ? (
                <div className="dralo-ai-actions">
                  <button
                    type="button"
                    className="dralo-ai-btn dralo-ai-btn--primary"
                    disabled={!answers[q.id] || loading}
                    onClick={() => checkQuestion(q)}
                  >
                    Check answer
                  </button>
                </div>
              ) : (
                <div
                  className={`dralo-ai-feedback ${fb.correct ? 'dralo-ai-feedback--ok' : 'dralo-ai-feedback--bad'}`}
                >
                  {fb.feedback}
                  {!fb.correct && fb.correctAnswer ? (
                    <p style={{ margin: '8px 0 0', fontWeight: 700 }}>
                      Correct answer: {fb.correctAnswer}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWriting = () => {
    if (!exercise) return null;
    return (
      <div className="dralo-ai-exercise">
        <h3 style={{ margin: 0 }}>{exercise.taskTitle}</h3>
        <div className="dralo-ai-passage" style={{ whiteSpace: 'pre-wrap' }}>
          {exercise.instructions}
          {exercise.inputNotes ? `\n\n${exercise.inputNotes}` : ''}
        </div>
        {exercise.checklist?.length ? (
          <ul style={{ margin: 0, paddingLeft: '1.2em', color: '#475569' }}>
            {exercise.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : null}
        <textarea
          className="dralo-ai-input dralo-ai-textarea"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Write your text here…"
          disabled={loading && !essayFeedback}
        />
        <p
          className={`dralo-ai-word-count ${wordCount >= wordMin && wordCount <= wordMax ? 'is-ok' : 'is-warn'}`}
        >
          {wordCount} words (target: {wordMin}–{wordMax})
        </p>
        {essayFeedback ? (
          <div className="dralo-ai-markdown dralo-ai-passage">{essayFeedback}</div>
        ) : null}
      </div>
    );
  };

  return (
    <main
      className="dralo-ai-page"
      style={{ '--dralo-accent-solid': accentSolid }}
    >
      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <span>{config.title}</span>
        </nav>
      </div>

      <PageHero
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        accent={config.accent}
        mascotVariant={config.mascotVariant}
        stats={[
          { value: 'Dralo', label: 'AI coach' },
          { value: level, label: 'Level' },
          { value: String(config.activities.length), label: 'Modes' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-studio__toolbar">
          <span className="dralo-ai-studio__badge">✨ Dralo AI</span>
          <DraloAiLevelFilter
            levels={config.levels}
            selectedLevel={level}
            onChange={setLevel}
          />
        </div>

        <div className="dralo-ai-activities" role="tablist" aria-label="Activities">
          {config.activities.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={activityId === a.id}
              className={`dralo-ai-activity${activityId === a.id ? ' is-active' : ''}`}
              onClick={() => setActivityId(a.id)}
            >
              <span aria-hidden>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        <div className="dralo-ai-panel">
          <div className="dralo-ai-panel__head">
            <h2>{activity?.icon} {activity?.label}</h2>
            <p>{activity?.hint}</p>
          </div>
          <div className="dralo-ai-panel__body">
            {error ? (
              <div className="dralo-ai-feedback dralo-ai-feedback--bad" role="alert">
                {error}
              </div>
            ) : null}

            {loading && !exercise ? <LoadingDralo /> : null}

            {!exercise && !loading ? (
              <div className="dralo-ai-empty">
                <p>Click &quot;New exercise&quot; and Dralo will generate a fresh task instantly.</p>
                <button
                  type="button"
                  className="dralo-ai-btn dralo-ai-btn--primary"
                  onClick={generateExercise}
                >
                  ✨ New exercise
                </button>
              </div>
            ) : null}

            {exercise && isUoe ? renderUoe() : null}
            {exercise && (config.id === 'reading' || isListening) ? renderReadingListening() : null}
            {exercise && isWriting ? renderWriting() : null}

            {uoeFeedback ? (
              <div
                className={`dralo-ai-feedback ${uoeFeedback.correct ? 'dralo-ai-feedback--ok' : 'dralo-ai-feedback--bad'}`}
              >
                {uoeFeedback.feedback}
                {!uoeFeedback.correct ? (
                  <p style={{ margin: '8px 0 0', fontWeight: 700 }}>
                    Correct answer:{' '}
                    {uoeFeedback.modelAnswer || exercise?.modelAnswer || '—'}
                  </p>
                ) : null}
              </div>
            ) : null}

            {exercise ? (
              <div className="dralo-ai-actions">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-ai-btn--ghost"
                  onClick={generateExercise}
                  disabled={loading}
                >
                  🔄 Another exercise
                </button>
                {isUoe && !uoeFeedback ? (
                  <button
                    type="button"
                    className="dralo-ai-btn dralo-ai-btn--primary"
                    onClick={checkUoe}
                    disabled={loading || !uoeAnswer.trim()}
                  >
                    Check with Dralo
                  </button>
                ) : null}
                {isWriting && !essayFeedback ? (
                  <button
                    type="button"
                    className="dralo-ai-btn dralo-ai-btn--primary"
                    onClick={submitEssay}
                    disabled={loading || !essay.trim()}
                  >
                    Send to Dralo for feedback
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
