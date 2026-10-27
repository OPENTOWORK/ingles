'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SPEAKING_B2_EX001_EXAM } from '../domain/question-bank/sp-ex001-part1';
import { SPEAKING_B2_ERROR_CODES } from '../domain/error-taxonomy';
import { speakingB2Headers, speakingB2Json } from './speakingB2Client';
import { useSpeakingMic } from './useSpeakingMic';
import {
  createSpeakingStartLock,
  describeSpeakingMotorLifecycle,
  SPEAKING_MOTOR_START_MODE,
} from './speakingMotorParentApi';
import styles from './speaking-motor-v1.module.css';

async function playExaminerLine(text, examCode) {
  const res = await fetch('/api/speaking-b2/tts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, examCode }),
  });
  if (!res.ok) throw new Error('No se pudo reproducir la pregunta. (TTS_FAILED)');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  await new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}

function formatScore(value) {
  if (value == null) return 'Evidencia insuficiente';
  return `${value}/5`;
}

const SpeakingMotorV1 = forwardRef(function SpeakingMotorV1(
  {
    embedded = false,
    startMode = SPEAKING_MOTOR_START_MODE.self,
    onLifecycleChange,
    audioInput = null,
  } = {},
  ref,
) {
  const exam = SPEAKING_B2_EX001_EXAM;
  const liveMic = useSpeakingMic();
  const mic = audioInput || liveMic;
  const [screen, setScreen] = useState('select');
  const [sessionId, setSessionId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [state, setState] = useState('READY');
  const [examinerText, setExaminerText] = useState('');
  const [turnLabel, setTurnLabel] = useState('Ready');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const startedAt = useRef(0);
  const turnStartedAt = useRef(0);
  const timerRef = useRef(0);
  const vadStop = useRef(() => {});
  const answeringRef = useRef(false);
  const completingRef = useRef(false);
  const tokenRef = useRef('');
  const sessionIdRef = useRef('');
  const screenRef = useRef('select');
  const startLock = useRef(createSpeakingStartLock());
  const examStartLock = useRef(createSpeakingStartLock());

  const shellClass = embedded ? styles.embedded : styles.page;
  const parentControlled = startMode === SPEAKING_MOTOR_START_MODE.parent;

  const publishLifecycle = useCallback((nextScreen, nextBusy) => {
    onLifecycleChange?.(describeSpeakingMotorLifecycle({ screen: nextScreen, busy: nextBusy }));
  }, [onLifecycleChange]);

  useEffect(() => {
    screenRef.current = screen;
    publishLifecycle(screen, busy);
  }, [screen, busy, publishLifecycle]);

  const startClock = () => {
    startedAt.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
    }, 250);
  };

  const createSession = async () => {
    setError('');
    const data = await speakingB2Json('/api/speaking-b2/session/', {
      body: { examCode: exam.code, fixtureMode: Boolean(audioInput?.fixtureMode) },
    });
    tokenRef.current = data.accessToken || '';
    sessionIdRef.current = data.sessionId;
    setAccessToken(data.accessToken || '');
    setSessionId(data.sessionId);
    setState(data.state);
    return { id: data.sessionId, accessToken: data.accessToken || '' };
  };

  const beginAudioCheck = useCallback(async () => {
    if (screenRef.current !== 'select') {
      return { started: false, reason: 'ALREADY_STARTED' };
    }
    if (!startLock.current.acquire()) {
      return { started: false, reason: 'IN_FLIGHT' };
    }
    setBusy(true);
    publishLifecycle('select', true);
    try {
      const existingId = sessionIdRef.current;
      const created = existingId
        ? { id: existingId, accessToken: tokenRef.current }
        : await createSession();
      await speakingB2Json('/api/speaking-b2/session/', {
        method: 'PATCH',
        accessToken: created.accessToken,
        body: { sessionId: created.id, action: 'audio-check' },
      });
      screenRef.current = 'audio-check';
      setScreen('audio-check');
      setState('AUDIO_CHECK');
      setBusy(false);
      publishLifecycle('audio-check', false);
      await mic.startPreview();
      return { started: true };
    } catch (err) {
      startLock.current.release();
      setError(err.message || 'No se pudo preparar la entrevista. (SESSION_FAILED)');
      setBusy(false);
      publishLifecycle(screenRef.current, false);
      return { started: false, reason: 'FAILED' };
    }
  }, [mic, publishLifecycle, audioInput]);

  const postTurn = async (payload) => {
    const token = tokenRef.current || accessToken;
    const isForm = payload instanceof FormData;
    if (isForm && token) payload.set('accessToken', token);
    const res = await fetch('/api/speaking-b2/turn/', {
      method: 'POST',
      headers: speakingB2Headers(token, isForm ? {} : { 'Content-Type': 'application/json' }),
      body: isForm ? payload : JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Turn failed');
    setState(data.state);
    if (data.examinerText) setExaminerText(data.examinerText);
    return data;
  };

  const askAndListen = useCallback(async (text, id) => {
    setTurnLabel('Examiner');
    await playExaminerLine(text, exam.code);
    await postTurn({ sessionId: id, action: 'listen' }).catch(() => {});
    setTurnLabel('Your turn — speak now');
    setState('LISTENING');
    turnStartedAt.current = Date.now();
    answeringRef.current = false;
    const stream = await mic.startRecording();
    if (!stream) return;
    vadStop.current = mic.attachVad(() => {
      void finishAnswer(id);
    });
  }, [exam.code, mic]);

  const finishAnswer = async (id) => {
    if (answeringRef.current) return;
    answeringRef.current = true;
    vadStop.current?.();
    const blob = await mic.stopRecording();
    const speakingMs = Math.min(25000, Math.max(0, Date.now() - (turnStartedAt.current || Date.now())));
    const form = new FormData();
    form.set('sessionId', id);
    form.set('action', 'answer');
    form.set('speakingMs', String(speakingMs));
    form.set('silence', blob && blob.size > 800 ? 'false' : 'true');
    if (blob) form.set('audio', blob, 'answer.webm');
    setTurnLabel('Checking');
    let data;
    try {
      data = await postTurn(form);
    } catch (err) {
      answeringRef.current = false;
      setError(err.message);
      return;
    }
    if (data.done || data.state === 'FINISHING') {
      setExaminerText(data.examinerText || 'Thank you. That is the end of Part 1.');
      if (data.examinerText) {
        await playExaminerLine(data.examinerText, exam.code).catch(() => {});
      }
      setScreen('processing');
      setState('PROCESSING');
      await completeExam(id);
      return;
    }
    answeringRef.current = false;
    if (data.examinerText) {
      try {
        await askAndListen(data.examinerText, id);
      } catch (err) {
        setError(err.message || 'No se pudo reproducir la pregunta. (TTS_FAILED)');
        setState('PAUSED_TECHNICAL');
      }
    }
  };

  const startExam = async () => {
    if (!examStartLock.current.acquire()) return;
    setBusy(true);
    setError('');
    try {
      mic.release();
      const data = await postTurn({ sessionId, action: 'start' });
      setScreen('exam');
      startClock();
      await askAndListen(data.examinerText, sessionId);
    } catch (err) {
      examStartLock.current.release();
      setError(err.message || 'No se pudo reproducir la pregunta. (TTS_FAILED)');
      setState('PAUSED_TECHNICAL');
    } finally {
      setBusy(false);
    }
  };

  const completeExam = async (id) => {
    if (completingRef.current) return;
    completingRef.current = true;
    try {
      const res = await fetch('/api/speaking-b2/complete/', {
        method: 'POST',
        headers: speakingB2Headers(tokenRef.current || accessToken, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ sessionId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        completingRef.current = false;
        setError(data.message || data.error || 'No se pudo generar el informe.');
        setScreen('results');
        return;
      }
      setReport(data.report);
      setState(data.state);
      setScreen('results');
    } catch (err) {
      completingRef.current = false;
      setError(err.message);
      setScreen('results');
    }
  };

  const resetLocal = () => {
    vadStop.current?.();
    mic.release();
    clearInterval(timerRef.current);
    answeringRef.current = false;
    completingRef.current = false;
    tokenRef.current = '';
    sessionIdRef.current = '';
    startLock.current.release();
    examStartLock.current.release();
    setAccessToken('');
    setSessionId('');
    setReport(null);
    setExaminerText('');
    setElapsed(0);
    setError('');
    setTurnLabel('Ready');
    setState('READY');
    screenRef.current = 'select';
    setScreen('select');
  };

  const abortExam = async () => {
    if (sessionId) {
      await postTurn({ sessionId, action: 'abort' }).catch(() => {});
    }
    resetLocal();
    setState('ABORTED');
    setScreen('select');
  };

  useImperativeHandle(ref, () => ({
    beginAudioCheck,
    getLifecycle: () => describeSpeakingMotorLifecycle({ screen: screenRef.current, busy }),
    reset: resetLocal,
  }), [beginAudioCheck, busy]);

  if (screen === 'select') {
    if (parentControlled) {
      if (!error) return null;
      return (
        <section className={shellClass}>
          <p className={styles.error}>{error}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={() => void beginAudioCheck()} disabled={busy}>
              Try again
            </button>
          </div>
        </section>
      );
    }
    return (
      <section className={shellClass}>
        {embedded ? null : (
          <>
            <p className={styles.eyebrow}>B2 First · Speaking</p>
            <h2 className={styles.title}>{exam.title}</h2>
            <p className={styles.lead}>
              Individual Part 1 interview, about two minutes. The examiner will not correct you during
              the test. This is a solo adaptation of the official paired format.
            </p>
          </>
        )}
        <div className={embedded ? undefined : styles.card}>
          <p>The examiner will ask a few personal questions. Speak for about two minutes.</p>
          <p className={styles.note}>British English examiner. Speak naturally. No notes on screen.</p>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={() => void beginAudioCheck()} disabled={busy}>
              Start the interview
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (screen === 'audio-check') {
    return (
      <section className={shellClass}>
        {embedded ? null : <p className={styles.eyebrow}>Microphone check</p>}
        <h2 className={styles.title}>Can we hear you?</h2>
        <div className={embedded ? undefined : styles.card}>
          <p>Allow the microphone and speak for a moment. The bar should move.</p>
          <div className={styles.meter} aria-hidden>
            <span style={{ width: `${Math.round(mic.level * 100)}%` }} />
          </div>
          {mic.error || error ? <p className={styles.error}>{mic.error || error}</p> : null}
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={startExam} disabled={busy || Boolean(mic.error)}>
              Start the interview
            </button>
            <button type="button" className={styles.ghost} onClick={abortExam}>
              Cancel
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (screen === 'exam') {
    return (
      <section className={shellClass}>
        {embedded ? null : <p className={styles.eyebrow}>Part 1 · Interview</p>}
        <div className={styles.status}>
          <span>Examiner: Emma</span>
          <span>Mic: {mic.status === 'recording' ? 'listening' : 'idle'}</span>
          <span>Turn: {turnLabel}</span>
          <span>Time: {elapsed}s</span>
        </div>
        <p className={styles.examiner}>{examinerText || '…'}</p>
        <p className={styles.note}>Look at the examiner. Answer in English. Do not read notes.</p>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button type="button" className={styles.ghost} onClick={() => finishAnswer(sessionId)}>
            I’ve finished
          </button>
          <button type="button" className={styles.ghost} onClick={abortExam}>
            End test
          </button>
        </div>
      </section>
    );
  }

  if (screen === 'processing') {
    return (
      <section className={shellClass}>
        <h2 className={styles.title}>Processing your interview</h2>
        <p className={styles.lead}>Transcribing, rating with evidence, then writing the report.</p>
      </section>
    );
  }

  return (
    <section className={shellClass}>
      {embedded ? null : <p className={styles.eyebrow}>Results · {exam.code}</p>}
      <h2 className={styles.title}>Informe de la Part 1</h2>
      <p className={styles.disclaimer}>{report?.disclaimer || 'Puntuación orientativa. No es una nota oficial de Cambridge.'}</p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {report ? (
        <div className={embedded ? undefined : styles.card}>
          <h3>Resumen</h3>
          <p>{report.summaryEs}</p>
          <h3>Criterios</h3>
          <div className={styles.grid}>
            <div className={styles.score}><span>Grammar and Vocabulary</span><strong>{formatScore(report.scores?.grammarVocabulary)}</strong></div>
            <div className={styles.score}><span>Discourse Management</span><strong>{formatScore(report.scores?.discourseManagement)}</strong></div>
            <div className={styles.score}><span>Pronunciation</span><strong>{formatScore(report.scores?.pronunciation)}</strong></div>
            <div className={styles.score}><span>Interactive Communication</span><strong>{formatScore(report.scores?.interactiveCommunication)}</strong></div>
            <div className={styles.score}><span>Global Achievement</span><strong>{formatScore(report.scores?.globalAchievement)}</strong></div>
          </div>
          {report.strengths?.length ? (
            <>
              <h3>Fortalezas</h3>
              <ul>{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          <h3>Errores detectados</h3>
          {report.issues?.length ? report.issues.map((issue) => (
            <article key={issue.id} className={styles.issue}>
              <p><strong>{issue.id}</strong> · {SPEAKING_B2_ERROR_CODES[issue.code]?.label || issue.code}</p>
              <p>Dijiste: <em>{issue.excerpt || issue.originalText}</em></p>
              <p>{issue.explanation}</p>
              <p>Mejor: <em>{issue.suggestion}</em></p>
            </article>
          )) : <p>No hay incidencias con evidencia suficiente.</p>}
          {report.modelAnswers?.length ? (
            <>
              <h3>Respuestas mejoradas (ejemplos B2)</h3>
              <ul>
                {report.modelAnswers.map((item) => (
                  <li key={item.questionId}>{item.answer}</li>
                ))}
              </ul>
            </>
          ) : null}
          {report.recommendations?.length ? (
            <>
              <h3>Recomendaciones</h3>
              <ul>
                {report.recommendations.map((item) => (
                  <li key={item.title}><strong>{item.title}.</strong> {item.body}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : (
        <p>Inicia sesión si quieres guardar y ver el informe completo.</p>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={resetLocal}>
          New attempt
        </button>
      </div>
    </section>
  );
});

export default SpeakingMotorV1;
