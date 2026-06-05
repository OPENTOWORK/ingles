'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import LevelsWritingCorrectionPanel from '@/components/niveles/LevelsWritingCorrectionPanel';
import { DRALO_AI_SITUATIONAL_EYEBROW } from '@/data/draloAiSituationalConfig';
import { formatWritingFeedbackDisplay } from '@/lib/formatWritingFeedback';
import { useDraloXp } from '@/context/DraloXpContext';

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

export default function DraloAiStudio({
  config,
  track = 'exam',
  activities: activitiesProp,
  backHref,
  backLabel = 'Dralo AI',
  pageTitle,
  pageDescription,
  pageEyebrow,
  breadcrumbTrail,
  defaultActivityId,
  writingCorrectionActivityId = 'writing-correction',
}) {
  const activities = activitiesProp || config.activities;
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const initialActivityId =
    defaultActivityId && activities.some((a) => a.id === defaultActivityId)
      ? defaultActivityId
      : activities[0]?.id || '';
  const [activityId, setActivityId] = useState(initialActivityId);
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
    () => activities.find((a) => a.id === activityId) || activities[0],
    [activities, activityId],
  );
  const isSituational = track === 'situational';

  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.indigo;
  const isWriting = config.id === 'writing';
  const isWritingCorrection =
    isWriting && activityId === writingCorrectionActivityId;
  const isListening = config.id === 'listening';
  const isUoe = config.id === 'use-of-english';

  const wordMin = exercise?.wordMin ?? 140;
  const wordMax = exercise?.wordMax ?? 190;
  const wordCount = countWords(essay);

  const generateRequestRef = useRef(0);
  const { awardForCorrectAnswer, clearAwardKeys } = useDraloXp();

  const clearExerciseState = useCallback(() => {
    setExercise(null);
    setAnswers({});
    setFeedbackByQ({});
    setUoeAnswer('');
    setUoeFeedback(null);
    setEssay('');
    setEssayFeedback('');
    setError('');
    clearAwardKeys();
  }, [clearAwardKeys]);

  const generateExercise = useCallback(async () => {
    if (!activityId || isWritingCorrection) return;

    const requestId = ++generateRequestRef.current;
    setLoading(true);
    setError('');
    clearExerciseState();

    try {
      const varietySeed = Date.now() + Math.floor(Math.random() * 1e6);
      const recentFingerprints = !isSituational
        ? getRecentFingerprints(config.id, activityId, level)
        : [];
      const data = await callDraloAi({
        action: 'generate',
        mode: config.id,
        activity: activityId,
        level,
        track: isSituational ? 'situational' : undefined,
        varietySeed,
        recentFingerprints: isSituational ? undefined : recentFingerprints,
        topic: !isSituational ? pickRandomTopic(varietySeed) : undefined,
      });

      if (requestId !== generateRequestRef.current) return;

      setExercise(data.exercise);
      if (!isSituational && data.exercise) {
        const fp = isUoe
          ? getUoeExerciseFingerprint(data.exercise, activityId)
          : `${data.exercise.title || ''}|${String(data.exercise.passage || data.exercise.script || '').slice(0, 100)}`;
        rememberExerciseFingerprint(config.id, activityId, level, fp);
      }
    } catch (e) {
      if (requestId !== generateRequestRef.current) return;
      setError(e.message || 'Could not generate the exercise.');
    } finally {
      if (requestId === generateRequestRef.current) {
        setLoading(false);
      }
    }
  }, [
    activityId,
    level,
    config.id,
    isSituational,
    isUoe,
    isWritingCorrection,
    clearExerciseState,
  ]);

  useEffect(() => {
    if (isWritingCorrection) {
      generateRequestRef.current += 1;
      clearExerciseState();
      setLoading(false);
      return;
    }
    void generateExercise();
  }, [generateExercise, isWritingCorrection, clearExerciseState]);

  const checkUoe = async (questionId, userAnswer) => {
    if (!exercise || !String(userAnswer || '').trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await callDraloAi({
        action: 'check',
        mode: config.id,
        activity: activityId,
        level,
        exercise,
        userAnswer,
        questionId,
      });
      const normalized = normalizeUoeCheckResult(data.result, exercise, questionId);
      if (questionId) {
        setFeedbackByQ((prev) => ({ ...prev, [questionId]: normalized }));
      } else {
        setUoeFeedback(normalized);
      }
      const qMeta = (exercise?.questions || []).find((item) => item.id === questionId);
      void awardForCorrectAnswer(`uoe-${activityId}-${questionId || 'legacy'}`, {
        correct: normalized.correct,
        activityId,
        hasOptions:
          activityId === 'multiple-choice-cloze' || (qMeta?.options?.length ?? 0) > 0,
        scorePercent: normalized.scorePercent,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkQuestion = async (q, userAnswerOverride) => {
    const ans = userAnswerOverride ?? answers[q.id];
    if (!String(ans || '').trim() || !exercise) return;
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
      const normalized = normalizeRlCheckResult(data.result, exercise, q.id);
      setFeedbackByQ((prev) => ({
        ...prev,
        [q.id]: normalized,
      }));
      void awardForCorrectAnswer(`rl-${activityId}-${q.id}`, {
        correct: normalized.correct,
        activityId,
        hasOptions: (q.options?.length ?? 0) > 0,
        scorePercent: normalized.scorePercent,
      });
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
            partLabel: exercise.taskTitle || exercise.title || activity?.label,
            instructions:
              exercise.instructions ||
              exercise.situation ||
              exercise.task ||
              exercise.prompt ||
              '',
            inputText: exercise.inputNotes || exercise.context || '',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not get feedback.');
      const raw = data.feedback || data.text || JSON.stringify(data);
      setEssayFeedback(formatWritingFeedbackDisplay(raw));
      const inRange = wordCount >= wordMin && wordCount <= wordMax;
      void awardForCorrectAnswer(`essay-${activityId}-${level}`, {
        correct: true,
        kind: 'text',
        scorePercent: inRange ? 85 : 60,
      });
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

  const renderExamDirections = () => {
    if (!exercise?.directions && !exercise?.partTitle) return null;
    return (
      <div className="dralo-ai-directions">
        {exercise.partTitle ? (
          <h3 className="dralo-ai-directions__title">{exercise.partTitle}</h3>
        ) : null}
        {exercise.directions ? (
          <p className="dralo-ai-directions__text">{exercise.directions}</p>
        ) : null}
      </div>
    );
  };

  const renderExamExample = () => {
    const ex = exercise?.example;
    if (!ex) return null;
    return (
      <div className="dralo-ai-example">
        <p className="dralo-ai-example__label">Example</p>
        {ex.sentence1 ? <p className="dralo-ai-sentence">{ex.sentence1}</p> : null}
        {ex.sentence2Start ? (
          <p className="dralo-ai-sentence">
            {ex.sentence2Start}
            {ex.keyword ? <span className="dralo-ai-keyword">{ex.keyword}</span> : null}
          </p>
        ) : null}
        {ex.text ? <p className="dralo-ai-sentence">{ex.text}</p> : null}
        {ex.answer != null ? (
          <p className="dralo-ai-example__answer">
            {ex.label || ex.number != null ? `${ex.label || ex.number} → ` : ''}
            <strong>{ex.answer}</strong>
          </p>
        ) : null}
        {ex.explanation ? (
          <p className="dralo-ai-example__hint">{ex.explanation}</p>
        ) : null}
      </div>
    );
  };

  const renderQuestionBlock = (q, checkFn) => {
    const fb = feedbackByQ[q.id] || (q.id === 'legacy' ? uoeFeedback : null);
    const opts = q.options || [];
    const numLabel = q.number != null ? `${q.number}. ` : '';
    return (
      <div key={q.id} className="dralo-ai-question">
        <h3>
          {numLabel}
          {q.prompt || q.sentence1 || `Question ${q.id}`}
        </h3>
        {q.sentence1 && activityId === 'key-word' ? (
          <>
            <p className="dralo-ai-sentence">{q.sentence1}</p>
            <p className="dralo-ai-sentence">
              {q.sentence2Start}
              <span className="dralo-ai-keyword">{q.keyword}</span>
              <span> ______</span>
            </p>
          </>
        ) : null}
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
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
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
            placeholder={
              q.type === 'word-formation' || activityId === 'word-formation'
                ? 'One word…'
                : activityId === 'key-word'
                  ? `Up to ${q.maxWords || 5} words…`
                  : 'Your answer…'
            }
            disabled={!!fb}
          />
        )}
        {!fb ? (
          <div className="dralo-ai-actions">
            <button
              type="button"
              className="dralo-ai-btn dralo-ai-btn--primary"
              disabled={!answers[q.id]?.trim() || loading}
              onClick={() => checkFn(q.id, answers[q.id])}
            >
              Check answer
            </button>
          </div>
        ) : (
          <div
            className={`dralo-ai-feedback ${fb.correct ? 'dralo-ai-feedback--ok' : 'dralo-ai-feedback--bad'}`}
          >
            {fb.feedback}
            {!fb.correct && (fb.correctAnswer || fb.modelAnswer) ? (
              <p style={{ margin: '8px 0 0', fontWeight: 700 }}>
                Correct answer: {fb.correctAnswer || fb.modelAnswer}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const hasFullExam = Boolean(
    exercise?.directions ||
      exercise?.passage ||
      (exercise?.questions?.length ?? 0) > 1,
  );

  const renderUoe = () => {
    if (!exercise) return null;

    if (hasFullExam || (exercise.questions?.length ?? 0) > 0) {
      return (
        <div className="dralo-ai-exercise">
          {renderExamDirections()}
          {renderExamExample()}
          {exercise.title ? (
            <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>{exercise.title}</h3>
          ) : null}
          {exercise.passage ? (
            <div className="dralo-ai-passage">{exercise.passage}</div>
          ) : null}
          {(exercise.questions || []).map((q) => renderQuestionBlock(q, checkUoe))}
        </div>
      );
    }

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
        {renderExamDirections()}
        {renderExamExample()}
        {exercise.title ? <h3 style={{ margin: 0, fontWeight: 800 }}>{exercise.title}</h3> : null}
        {exercise.setting ? <p style={{ margin: 0, color: '#64748b' }}>{exercise.setting}</p> : null}
        {exercise.passage ? (
          <div className="dralo-ai-passage">{exercise.passage}</div>
        ) : null}
        {exercise.sentencePool?.length ? (
          <div className="dralo-ai-passage dralo-ai-sentence-pool">
            <p style={{ fontWeight: 700, margin: '0 0 8px' }}>Sentences</p>
            {exercise.sentencePool.map((s) => (
              <p key={s} style={{ margin: '4px 0' }}>
                {s}
              </p>
            ))}
          </div>
        ) : null}
        {exercise.matchingIntro ? (
          <p className="dralo-ai-sentence" style={{ fontWeight: 700 }}>
            {exercise.matchingIntro}
          </p>
        ) : null}
        {exercise.sections?.map((sec) => (
          <div key={sec.letter} className="dralo-ai-passage" style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 800, margin: '0 0 4px' }}>
              {sec.letter} – {sec.name}
            </p>
            <p style={{ margin: 0 }}>{sec.text}</p>
          </div>
        ))}
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
        {(exercise.questions || []).map((q) =>
          renderQuestionBlock(q, (qId, ans) => checkQuestion({ id: qId, ...q }, ans)),
        )}
      </div>
    );
  };

  const renderWritingWhatsapp = () => {
    if (!exercise) return null;
    const thread = exercise.chatThread || [];
    return (
      <div className="dralo-ai-exercise dralo-ai-whatsapp">
        <h3 style={{ margin: 0 }}>{exercise.title || 'WhatsApp chat'}</h3>
        <p style={{ color: '#64748b', margin: '0 0 12px' }}>{exercise.context}</p>
        <div className="dralo-ai-whatsapp__screen">
          {thread.map((msg, i) => (
            <div
              key={i}
              className={`dralo-ai-whatsapp__bubble dralo-ai-whatsapp__bubble--${msg.from === 'them' ? 'them' : 'you'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <p className="dralo-ai-sentence" style={{ marginTop: 12 }}>
          <strong>Your task:</strong> {exercise.task}
        </p>
        {exercise.acronymHints?.length ? (
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Try natural acronyms if they fit: {exercise.acronymHints.join(', ')}
          </p>
        ) : null}
        <textarea
          className="dralo-ai-input dralo-ai-textarea dralo-ai-whatsapp__input"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Type your WhatsApp reply (OMG, BTW, FYI…)…"
          rows={4}
        />
        <p className="dralo-ai-word-count">
          {wordCount} words (target: {exercise.wordMin || 20}–{exercise.wordMax || 80})
        </p>
        {essayFeedback ? (
          <div className="dralo-ai-markdown dralo-ai-passage dralo-ai-writing-feedback">
            {formatWritingFeedbackDisplay(essayFeedback)}
          </div>
        ) : null}
      </div>
    );
  };

  const renderWriting = () => {
    if (!exercise) return null;
    if (exercise.format === 'whatsapp') return renderWritingWhatsapp();
    const title = exercise.taskTitle || exercise.title;
    const instructions = exercise.instructions || exercise.situation || exercise.prompt;
    const wordMinLocal = exercise.wordMin ?? wordMin;
    const wordMaxLocal = exercise.wordMax ?? wordMax;
    return (
      <div className="dralo-ai-exercise">
        {renderExamDirections()}
        {renderExamExample()}
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div className="dralo-ai-passage" style={{ whiteSpace: 'pre-wrap' }}>
          {instructions}
          {exercise.inputNotes ? `\n\n${exercise.inputNotes}` : ''}
          {exercise.bulletPoints?.length
            ? `\n\n${exercise.bulletPoints.map((b) => `• ${b}`).join('\n')}`
            : ''}
        </div>
        {(exercise.checklist || exercise.bulletPoints)?.length ? (
          <ul style={{ margin: 0, paddingLeft: '1.2em', color: '#475569' }}>
            {(exercise.checklist || exercise.bulletPoints).map((c) => (
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
          {wordCount} words (target: {wordMinLocal}–{wordMaxLocal})
        </p>
        {essayFeedback ? (
          <div className="dralo-ai-markdown dralo-ai-passage dralo-ai-writing-feedback">
            {formatWritingFeedbackDisplay(essayFeedback)}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <main
      className="dralo-ai-page"
      style={{ '--dralo-accent-solid': accentSolid }}
    >
      <div className="dralo-ai-studio__toolbar dralo-ai-studio__toolbar--under-xp">
        {backHref ? (
          <Link href={backHref} className="dralo-ai-back-link">
            ← {backLabel}
          </Link>
        ) : (
          <span className="dralo-ai-studio__badge">✨ Dralo AI</span>
        )}
        <DraloAiLevelFilter
          levels={config.levels}
          selectedLevel={level}
          onChange={setLevel}
        />
      </div>

      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <Link href={`/dralo-ai/${config.id}`}>{config.title}</Link>
          {breadcrumbTrail ? (
            <>
              <span aria-hidden> / </span>
              <span>{breadcrumbTrail}</span>
            </>
          ) : null}
        </nav>
      </div>

      <PageHero
        eyebrow={pageEyebrow || (isSituational ? DRALO_AI_SITUATIONAL_EYEBROW : config.eyebrow)}
        title={pageTitle || config.title}
        description={pageDescription || config.description}
        accent={config.accent}
        mascotVariant={config.mascotVariant}
        stats={[
          { value: 'Dralo', label: 'AI coach' },
          { value: level, label: 'Level' },
          { value: String(activities.length), label: isSituational ? 'Scenarios' : 'Modes' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-activities" role="tablist" aria-label="Activities">
          {activities.map((a) => (
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

            {loading && !exercise && !isWritingCorrection ? <LoadingDralo /> : null}

            {!exercise && !loading && !isWritingCorrection ? (
              <div className="dralo-ai-empty">
                <p>
                  {error
                    ? 'Could not generate the exercise.'
                    : isSituational
                      ? 'Select a scenario to generate a practice task instantly.'
                      : 'Select an exam part to generate a full exercise instantly.'}
                </p>
                {error ? (
                  <button
                    type="button"
                    className="dralo-ai-btn dralo-ai-btn--primary"
                    onClick={generateExercise}
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            ) : null}

            {isWritingCorrection ? (
              <LevelsWritingCorrectionPanel
                variant="dralo-ai"
                level={level}
                onLevelChange={setLevel}
                hideLevelSelector
              />
            ) : null}

            {exercise && isUoe ? renderUoe() : null}
            {exercise && (config.id === 'reading' || isListening) ? renderReadingListening() : null}
            {exercise && isWriting && !isWritingCorrection ? renderWriting() : null}

            {uoeFeedback && !hasFullExam ? (
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

            {exercise && !isWritingCorrection ? (
              <div className="dralo-ai-actions">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-ai-btn--ghost"
                  onClick={generateExercise}
                  disabled={loading}
                >
                  🔄 Another exercise
                </button>
                {isUoe && !hasFullExam && !uoeFeedback ? (
                  <button
                    type="button"
                    className="dralo-ai-btn dralo-ai-btn--primary"
                    onClick={() => checkUoe(undefined, uoeAnswer)}
                    disabled={loading || !uoeAnswer.trim()}
                  >
                    Check with Dralo
                  </button>
                ) : null}
                {isWriting && !isWritingCorrection && !essayFeedback ? (
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
