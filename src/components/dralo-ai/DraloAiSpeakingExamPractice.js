'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import {
  getB2SpeakingPartConfig,
} from '@/features/speaking/domain/b2-speaking-exam-parts';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import ExaminerVoiceVisualizer from '@/components/b2/ExaminerVoiceVisualizer';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import { playExaminerAudio, stopExaminerAudio } from '@/utils/playExaminerAudio';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

function withBase(path) {
  const b =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
      ? String(process.env.NEXT_PUBLIC_BASE_PATH).replace(/\/$/, '')
      : '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return b ? `${b}${p}` : p;
}

function b2GlobalPartNumber(localPart) {
  const n = Number(localPart);
  if (!Number.isFinite(n) || n < 1) return 0;
  return 13 + n;
}

/**
 * Práctica de una parte Speaking (Dralo AI) — audio real del examinador, sin scripts visibles.
 */
export default function DraloAiSpeakingExamPractice({ level = 'B2', activity }) {
  const blueprint = useMemo(() => getExamBlueprint(level), [level]);
  const partDef = useMemo(
    () => blueprint.parts[activity?.blueprintIndex ?? 0] ?? blueprint.parts[0],
    [blueprint, activity?.blueprintIndex],
  );
  const b2Cfg =
    level === 'B2' && activity?.partNumber
      ? getB2SpeakingPartConfig(b2GlobalPartNumber(activity.partNumber))
      : null;
  const uiMode = b2Cfg?.uiMode ?? 'interview';
  const [photoSetKey, setPhotoSetKey] = useState(0);
  const [photoSet, setPhotoSet] = useState(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const excludeThemeRef = useRef('');
  const photoUrls = photoSet?.urls ?? [];

  useEffect(() => {
    if (uiMode !== 'long_turn') {
      setPhotoSet(null);
      setPhotosError('');
      return undefined;
    }

    let cancelled = false;
    setPhotosLoading(true);
    setPhotosError('');
    setPhotoSet(null);

    const run = async () => {
      try {
        const res = await fetch(
          buildClientApiUrl('/api/dralo-ai/speaking/long-turn-photos'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level,
              excludeTheme: excludeThemeRef.current,
            }),
          },
        );
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'Could not generate photographs');
        if (cancelled) return;
        const urls = Array.isArray(payload.urls) ? payload.urls.filter(Boolean) : [];
        if (urls.length < 2) throw new Error('Incomplete photograph set');
        excludeThemeRef.current = payload.meta?.theme || '';
        setPhotoSet({ urls: urls.slice(0, 2), meta: payload.meta || {} });
      } catch (e) {
        if (!cancelled) setPhotosError(e?.message || 'Could not generate photographs');
      } finally {
        if (!cancelled) setPhotosLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [uiMode, photoSetKey, level]);

  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [userLines, setUserLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro');
  const [longTurnLeft, setLongTurnLeft] = useState(b2Cfg?.longTurnSeconds ?? 60);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const [lastAudio, setLastAudio] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [assistantLines, setAssistantLines] = useState([]);

  const media = useMediaRecorder();
  const aliveRef = useRef(true);
  const abortRef = useRef(null);

  const taskContext = useMemo(() => {
    const base = activity?.directions || partDef.instructions || '';
    if (uiMode === 'long_turn' && photoSet?.meta) {
      return `${base}\n\nPhotographs (${photoSet.meta.theme}): Photo A — ${photoSet.meta.photoA}. Photo B — ${photoSet.meta.photoB}.\nCompare task: ${photoSet.meta.comparePrompt}`;
    }
    return base;
  }, [activity?.directions, partDef.instructions, uiMode, photoSet]);
  const examPartIndex = activity?.blueprintIndex ?? 0;
  const b2PartNumber =
    level === 'B2' && activity?.partNumber ? b2GlobalPartNumber(activity.partNumber) : 0;

  const isAlive = useCallback(() => aliveRef.current, []);

  const applyAssistantTurn = useCallback(
    async (data) => {
      if (!isAlive() || !data?.assistantText) return;
      const text = data.assistantText;
      setAssistantLines((prev) => [...prev, text]);
      setHistory((h) => [...h, { role: 'assistant', content: text }]);
      const audioPayload = {
        base64: data.assistantAudioBase64,
        mime: data.assistantAudioMime,
        text,
      };
      setLastAudio(audioPayload);
      await playExaminerAudio(audioPayload);
    },
    [isAlive],
  );

  const callTurn = useCallback(
    async (payload, sid, historySnapshot) => {
      if (!sid || !isAlive()) return null;
      const signal = abortRef.current?.signal;
      setLoading(true);
      setError('');
      try {
        const base = {
          sessionId: sid,
          cefr: level,
          mode: 'EXAM',
          prompt: taskContext,
          history: historySnapshot,
          examPartIndex,
          b2PartNumber,
          taskContext,
        };
        let res;
        if (payload.audio) {
          const form = new FormData();
          Object.entries(base).forEach(([k, v]) => form.set(k, String(v)));
          if (payload.isOpening) form.set('isOpening', 'true');
          form.append('audio', payload.audio, 'capture.webm');
          res = await fetch(withBase('/api/speaking/turn'), { method: 'POST', body: form, signal });
        } else {
          res = await fetch(withBase('/api/speaking/turn'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...base,
              text: payload.text ?? '',
              isOpening: Boolean(payload.isOpening),
            }),
            signal,
          });
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Turn failed');
        }
        return await res.json();
      } catch (e) {
        if (e?.name !== 'AbortError' && isAlive()) {
          setError(e?.message || 'Connection error');
        }
        return null;
      } finally {
        if (isAlive()) setLoading(false);
      }
    },
    [level, taskContext, examPartIndex, b2PartNumber, isAlive],
  );

  useEffect(() => {
    aliveRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    stopExaminerAudio();
    setSessionId(null);
    setHistory([]);
    setUserLines([]);
    setAssistantLines([]);
    setPhase('intro');
    setFinished(false);
    setReport(null);
    setLastAudio(null);
    setError('');
    setLoading(true);

    const run = async () => {
      try {
        const sessionRes = await fetch(withBase('/api/speaking/session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'EXAM', cefr: level }),
          signal: ac.signal,
        });
        if (!sessionRes.ok) throw new Error('Could not start session');
        const { sessionId: sid } = await sessionRes.json();
        if (!aliveRef.current) return;
        setSessionId(sid);

        const data = await callTurn({ isOpening: true, text: '' }, sid, []);
        if (!aliveRef.current || !data) return;
        await applyAssistantTurn(data);
        if (!aliveRef.current) return;
        setPhase(uiMode === 'long_turn' ? 'await_long_turn' : 'dialogue');
      } catch (e) {
        if (e?.name !== 'AbortError' && aliveRef.current) {
          setError(e?.message || 'Could not load examiner audio');
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    };

    void run();

    return () => {
      aliveRef.current = false;
      ac.abort();
      stopExaminerAudio();
      if (media.isRecording) void media.stop();
    };
  }, [
    activity?.id,
    level,
    taskContext,
    examPartIndex,
    b2PartNumber,
    uiMode,
    photoSet,
    photosLoading,
    callTurn,
    applyAssistantTurn,
  ]);

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft <= 0) return;
    const t = window.setTimeout(() => setLongTurnLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, longTurnLeft]);

  const submitCandidateTurn = useCallback(
    async (audioOrText) => {
      if (!sessionId || !isAlive()) return;
      let data;
      if (audioOrText instanceof Blob) {
        data = await callTurn({ audio: audioOrText }, sessionId, history);
      } else {
        const text = String(audioOrText || '').trim();
        if (!text) return;
        setUserLines((prev) => [...prev, text]);
        const nextHistory = [...history, { role: 'user', content: text }];
        setHistory(nextHistory);
        data = await callTurn({ text }, sessionId, nextHistory);
      }
      if (!isAlive() || !data) return;
      if (data.transcript && audioOrText instanceof Blob) {
        setUserLines((prev) => [...prev, data.transcript]);
        setHistory((h) => {
          const copy = [...h];
          if (copy[copy.length - 1]?.role === 'user') {
            copy[copy.length - 1] = { role: 'user', content: data.transcript };
          }
          return copy;
        });
      }
      if (data.assistantText) await applyAssistantTurn(data);
    },
    [sessionId, history, callTurn, applyAssistantTurn, isAlive],
  );

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft !== 0 || !media.isRecording) return;
    void (async () => {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
      if (aliveRef.current) setPhase('dialogue');
    })();
  }, [phase, longTurnLeft, media.isRecording, submitCandidateTurn]);

  const onMicClick = async () => {
    if (loading || !sessionId || finished) return;
    if (uiMode === 'long_turn' && phase === 'await_long_turn') return;
    if (media.isRecording) {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateTurn(blob);
    } else {
      await media.start();
    }
  };

  const finalizePart = async () => {
    if (!sessionId || userLines.length === 0) return;
    stopExaminerAudio();
    setLoading(true);
    setError('');
    try {
      const combined = userLines.join('\n\n');
      const res = await fetch(buildClientApiUrl('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cefr: level,
          mode: 'EXAM',
          combinedTranscript: combined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Could not generate feedback');
      setReport(payload.report);
      setFinished(true);
    } catch (e) {
      setError(e?.message || 'Feedback failed');
    } finally {
      setLoading(false);
    }
  };

  const timerSec = partDef.suggestedTimeSec ?? activity?.durationSec ?? 120;

  return (
    <div className="dralo-ai-speaking-practice">
      {uiMode === 'long_turn' ? (
        <div className="dralo-ai-speaking-practice__photos-wrap">
          {photoSet?.meta?.theme ? (
            <p className="dralo-ai-speaking-practice__photos-theme">
              📷 {photoSet.meta.theme} — compare Photo A and Photo B
            </p>
          ) : photosLoading ? (
            <p className="dralo-ai-speaking-practice__photos-theme">
              ✨ Creating new AI photographs for this task…
            </p>
          ) : null}
          <div className="dralo-ai-speaking-practice__photos">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`dralo-ai-speaking-practice__photo${photosLoading ? ' is-loading' : ''}`}
              >
                {photoUrls[i] ? (
                  <img
                    src={photoUrls[i]}
                    alt={i === 0 ? photoSet?.meta?.photoA || 'Photo A' : photoSet?.meta?.photoB || 'Photo B'}
                  />
                ) : (
                  <span>{photosLoading ? 'Generating…' : `Photo ${i === 0 ? 'A' : 'B'}`}</span>
                )}
              </div>
            ))}
          </div>
          {photosError ? (
            <div className="dralo-ai-feedback dralo-ai-feedback--bad" role="alert">
              {photosError}
              <button
                type="button"
                className="dralo-ai-btn dralo-ai-btn--ghost dralo-ai-speaking-practice__shuffle-photos"
                onClick={() => setPhotoSetKey((k) => k + 1)}
              >
                Try again
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="dralo-ai-btn dralo-ai-btn--ghost dralo-ai-speaking-practice__shuffle-photos"
              onClick={() => setPhotoSetKey((k) => k + 1)}
              disabled={loading || photosLoading || phase !== 'await_long_turn'}
              title={
                phase !== 'await_long_turn'
                  ? 'Available before you start your long turn'
                  : undefined
              }
            >
              {photosLoading ? '⏳ Generating…' : '🔀 New AI photos'}
            </button>
          )}
        </div>
      ) : null}

      <div className="dralo-ai-speaking-practice__toolbar">
        <span className="dralo-ai-speaking-practice__timer" aria-live="polite">
          ⏱️ {Math.floor(timerSec / 60)}:{String(timerSec % 60).padStart(2, '0')} suggested
        </span>
        {lastAudio ? (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--ghost"
            onClick={() => void playExaminerAudio(lastAudio)}
            disabled={loading}
          >
            🔊 Replay examiner
          </button>
        ) : null}
        <button
          type="button"
          className="dralo-ai-btn dralo-ai-btn--ghost"
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? 'Hide transcript' : 'Show transcript'}
        </button>
      </div>

      <ExaminerVoiceVisualizer isLoading={loading && !lastAudio} />

      {showTranscript && assistantLines.length > 0 ? (
        <div className="dralo-ai-speaking-practice__transcript dralo-ai-speaking-practice__transcript--examiner">
          <p className="dralo-ai-speaking-practice__transcript-label">Examiner (audio transcript)</p>
          {assistantLines.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      ) : null}

      {userLines.length > 0 ? (
        <div className="dralo-ai-speaking-practice__transcript dralo-ai-speaking-practice__transcript--you">
          <p className="dralo-ai-speaking-practice__transcript-label">Your answers</p>
          {userLines.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      ) : null}

      {phase === 'long_turn' ? (
        <p className="dralo-ai-speaking-practice__countdown">
          Time: {String(Math.floor(longTurnLeft / 60)).padStart(2, '0')}:
          {String(longTurnLeft % 60).padStart(2, '0')}
        </p>
      ) : null}

      {error ? (
        <div className="dralo-ai-feedback dralo-ai-feedback--bad" role="alert">
          {error}
        </div>
      ) : null}

      <div className="dralo-ai-speaking-practice__controls">
        {uiMode === 'long_turn' && phase === 'await_long_turn' ? (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--primary"
            disabled={loading || photosLoading || !photoSet}
            onClick={() => {
              setPhase('long_turn');
              setLongTurnLeft(b2Cfg?.longTurnSeconds ?? 60);
              void media.start();
            }}
          >
            Start my turn (1 min)
          </button>
        ) : null}
        {uiMode === 'long_turn' && phase === 'long_turn' ? (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--ghost"
            onClick={async () => {
              if (media.isRecording) {
                const blob = await media.stop();
                if (blob?.size) await submitCandidateTurn(blob);
              }
              setPhase('dialogue');
            }}
          >
            Finish long turn
          </button>
        ) : null}
        {phase === 'dialogue' || phase === 'long_turn' ? (
          <button
            type="button"
            className={`dralo-ai-speaking-practice__mic${media.isRecording ? ' is-recording' : ''}`}
            onClick={onMicClick}
            disabled={loading || !sessionId || finished}
          >
            <span aria-hidden>{media.isRecording ? '⏹' : '🎤'}</span>
            {media.isRecording ? 'Stop & send' : 'Speak'}
          </button>
        ) : null}
        <span className="dralo-ai-speaking-practice__status">
          {photosLoading
            ? 'Creating photographs…'
            : loading
              ? 'Dralo is thinking…'
              : media.isRecording
                ? 'Listening…'
                : 'Ready'}
        </span>
      </div>

      <div className="dralo-ai-speaking-practice__type-row">
        <input
          className="dralo-ai-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Or type your answer…"
          disabled={finished || loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && typed.trim()) {
              e.preventDefault();
              const t = typed.trim();
              setTyped('');
              void submitCandidateTurn(t);
            }
          }}
        />
        <button
          type="button"
          className="dralo-ai-btn dralo-ai-btn--primary"
          disabled={loading || !typed.trim() || finished}
          onClick={() => {
            const t = typed.trim();
            setTyped('');
            void submitCandidateTurn(t);
          }}
        >
          Send
        </button>
      </div>

      <div className="dralo-ai-actions">
        {!finished ? (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--primary"
            disabled={loading || userLines.length === 0}
            onClick={() => void finalizePart()}
          >
            Finish part & get feedback
          </button>
        ) : (
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--ghost"
            onClick={() => window.location.reload()}
          >
            Practise this part again
          </button>
        )}
      </div>

      {finished && report ? (
        <div className="dralo-ai-speaking-practice__report">
          <FeedbackCards report={report} />
        </div>
      ) : null}
    </div>
  );
}
