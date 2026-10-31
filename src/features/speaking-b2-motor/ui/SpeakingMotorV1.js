'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useConfirmedUserRole } from '@/context/UserRoleContext';
import { SPEAKING_B2_EX001_EXAM, SPEAKING_B2_INTRODUCTION } from '../domain/question-bank/sp-ex001-part1';
import { speakingB2MeasuredAnswerMs } from '../services/coordinator';
import { canStartSpeakingB2Interview } from '../services/interview-access';
import { SPEAKING_B2_ERROR_CODES } from '../domain/error-taxonomy';
import { speakingB2AuthHeaders, speakingB2Json } from './speakingB2Client';
import { prefetchSpeakingB2Line, playSpeakingB2Line, primeSpeakingB2Line } from './speakingTtsClient';
import { useSpeakingMic } from './useSpeakingMic';
import {
  createSpeakingStartLock,
  describeSpeakingMotorLifecycle,
  SPEAKING_MOTOR_START_MODE,
} from './speakingMotorParentApi';
import {
  pauseExaminerAudio,
  resumeExaminerAudio,
  stopExaminerAudio,
} from '@/utils/playExaminerAudio';
import ExaminerVoiceVisualizer from '@/components/b2/ExaminerVoiceVisualizer';
import SpeakingExerciseControls from '@/components/b2/SpeakingExerciseControls';
import styles from './speaking-motor-v1.module.css';

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
  const { userRole, roleConfirmed, session: authSession } = useConfirmedUserRole();
  const signedIn = Boolean(authSession?.user?.id);
  const accessReady = !signedIn || roleConfirmed;
  const canStartInterview = accessReady && canStartSpeakingB2Interview(signedIn ? userRole : '');
  const canStartRef = useRef(false);
  canStartRef.current = canStartInterview;
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
  const [typedMode, setTypedMode] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState('');
  const answerLocked = turnLabel === 'Examiner' || (turnLabel === 'Checking' && !error);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [exercisePaused, setExercisePaused] = useState(false);
  const [examiner, setExaminer] = useState(null);
  const examinerIdRef = useRef('');
  const introTextRef = useRef('');
  const clockRef = useRef({ running: false, accumulated: 0, mark: 0 });
  const timerRef = useRef(0);
  const speechStartedAt = useRef(0);
  const noResponseTimer = useRef(0);
  const noteSpeechStartedRef = useRef(() => {});
  const vadStop = useRef(() => {});
  const answeringRef = useRef(false);
  const completingRef = useRef(false);
  const tokenRef = useRef('');
  const sessionIdRef = useRef('');
  const screenRef = useRef('select');
  const typedModeRef = useRef(false);
  const pendingLineRef = useRef('');
  const startLock = useRef(createSpeakingStartLock());
  const examStartLock = useRef(createSpeakingStartLock());

  const shellClass = embedded ? styles.embedded : styles.page;
  const parentControlled = startMode === SPEAKING_MOTOR_START_MODE.parent;
  const ttsSession = useCallback(
    () => ({ sessionId: sessionIdRef.current, accessToken: tokenRef.current }),
    [],
  );

  const publishLifecycle = useCallback((nextScreen, nextBusy) => {
    onLifecycleChange?.(describeSpeakingMotorLifecycle({
      screen: nextScreen,
      busy: nextBusy,
      allowed: canStartRef.current,
    }));
  }, [onLifecycleChange]);

  useEffect(() => {
    screenRef.current = screen;
    publishLifecycle(screen, busy);
  }, [screen, busy, canStartInterview, publishLifecycle]);

  noteSpeechStartedRef.current = () => {
    if (speechStartedAt.current) return;
    speechStartedAt.current = Date.now();
    clearTimeout(noResponseTimer.current);
  };

  const readClock = () => {
    const clock = clockRef.current;
    const live = clock.running ? Date.now() - clock.mark : 0;
    return Math.round((clock.accumulated + live) / 1000);
  };

  const setClockRunning = (running) => {
    const clock = clockRef.current;
    if (running === clock.running) return;
    if (clock.running) clock.accumulated += Date.now() - clock.mark;
    clock.running = running;
    if (running) clock.mark = Date.now();
  };

  useEffect(() => {
    if (!error || turnLabel !== 'Checking') return;
    setTurnLabel(typedMode ? 'Your turn — type your answer' : 'Your turn — speak now');
  }, [error, turnLabel, typedMode]);

  const startClock = () => {
    clockRef.current = { running: true, accumulated: 0, mark: Date.now() };
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(readClock()), 250);
  };

  useEffect(() => {
    if (screen !== 'exam') {
      setClockRunning(false);
      return undefined;
    }
    const technical = turnLabel === 'Checking' || ttsLoading || exercisePaused;
    setClockRunning(!technical);
    return undefined;
  }, [screen, turnLabel, ttsLoading, exercisePaused]);

  const createSession = async () => {
    setError('');
    const data = await speakingB2Json('/api/speaking-b2/session/', {
      body: {
        examCode: exam.code,
        fixtureMode: Boolean(audioInput?.fixtureMode),
        localHour: new Date().getHours(),
      },
    });
    tokenRef.current = data.accessToken || '';
    sessionIdRef.current = data.sessionId;
    examinerIdRef.current = data.examiner?.id || '';
    introTextRef.current = data.introText || '';
    setExaminer(data.examiner || null);
    setAccessToken(data.accessToken || '');
    setSessionId(data.sessionId);
    setState(data.state);
    return { id: data.sessionId, accessToken: data.accessToken || '' };
  };

  const beginAudioCheck = useCallback(async () => {
    if (!canStartRef.current) {
      return { started: false, reason: 'CLOSED' };
    }
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
      prefetchSpeakingB2Line(
        introTextRef.current || SPEAKING_B2_INTRODUCTION.spokenText,
        exam.code,
        examinerIdRef.current,
        ttsSession(),
      ).catch(() => {});
      try {
        await mic.startPreview();
      } catch {
        // The microphone message stays on screen. Anyone can continue by typing.
      }
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
      headers: await speakingB2AuthHeaders(token, isForm ? {} : { 'Content-Type': 'application/json' }),
      body: isForm ? payload : JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Turn failed');
    setState(data.state);
    if (data.examinerText) setExaminerText(data.examinerText);
    return data;
  };

  const prepareExaminerLine = useCallback((text) => {
    const line = String(text || '').trim();
    pendingLineRef.current = line;
    setExaminerText(line);
    setTurnLabel('Examiner');
    setAudioReady(false);
    setTtsLoading(Boolean(line));
    if (!line) {
      setTtsLoading(false);
      return Promise.resolve();
    }
    return prefetchSpeakingB2Line(line, exam.code, examinerIdRef.current, ttsSession())
      .then(() => {
        if (pendingLineRef.current !== line) return;
        setAudioReady(true);
        setTtsLoading(false);
      })
      .catch((err) => {
        if (pendingLineRef.current !== line) return;
        setTtsLoading(false);
        setError(err.message || 'No se pudo preparar el audio. (TTS_FAILED)');
      });
  }, [exam.code, ttsSession]);

  const openCandidateTurn = useCallback(async (id) => {
    const listened = await postTurn({ sessionId: id, action: 'listen' }).catch(() => null);
    for (const line of listened?.upcoming || []) {
      prefetchSpeakingB2Line(line, exam.code, examinerIdRef.current, ttsSession()).catch(() => {});
    }
    setState('LISTENING');
    speechStartedAt.current = 0;
    answeringRef.current = false;
    clearTimeout(noResponseTimer.current);
    noResponseTimer.current = setTimeout(() => {
      if (speechStartedAt.current || answeringRef.current) return;
      void finishAnswer(id, '', { forceSilence: true });
    }, 15000);
    if (typedModeRef.current) {
      setTurnLabel('Your turn — type your answer');
      return;
    }
    setTurnLabel('Your turn — speak now');
    try {
      const stream = await mic.startRecording();
      if (!stream) return;
      vadStop.current = mic.attachVad(
        () => {
          void finishAnswer(id);
        },
        () => noteSpeechStartedRef.current(),
      );
    } catch (recordError) {
      typedModeRef.current = true;
      setTypedMode(true);
      setTurnLabel('Your turn — type your answer');
      setError(recordError?.message || 'No se pudo usar el micrófono. Puedes escribir la respuesta.');
    }
  }, [mic, exam.code, ttsSession]);

  const playPendingLine = useCallback(async (id, { afterPlay = true } = {}) => {
    const line = pendingLineRef.current;
    if (!line) return;
    setError('');
    setTurnLabel('Examiner');
    setExercisePaused(false);
    setExerciseStarted(true);
    try {
      await playSpeakingB2Line(line, exam.code, examinerIdRef.current, ttsSession());
      if (afterPlay) await openCandidateTurn(id);
    } catch (err) {
      setError(err.message || 'No se pudo reproducir la pregunta. (TTS_FAILED)');
      setState('PAUSED_TECHNICAL');
    }
  }, [exam.code, openCandidateTurn, ttsSession]);

  const finishAnswer = async (id, typedText, { forceSilence = false } = {}) => {
    if (answeringRef.current) return;
    answeringRef.current = true;
    clearTimeout(noResponseTimer.current);
    vadStop.current?.();
    const speakingMs = forceSilence ? 0 : speakingB2MeasuredAnswerMs(speechStartedAt.current);
    const typed = typedModeRef.current;
    const transcript = forceSilence ? '' : String(typedText ?? draftAnswer).trim();
    let payload;
    if (typed || forceSilence) {
      if (!typed) mic.stopRecording().catch(() => {});
      payload = {
        sessionId: id,
        action: 'answer',
        transcript,
        speakingMs,
        silence: forceSilence || !transcript,
      };
    } else {
      const blob = await mic.stopRecording();
      const form = new FormData();
      form.set('sessionId', id);
      form.set('action', 'answer');
      form.set('speakingMs', String(speakingMs));
      form.set('silence', speechStartedAt.current ? 'false' : 'true');
      if (blob) form.set('audio', blob, 'answer.webm');
      payload = form;
    }
    setTurnLabel('Checking');
    setDraftAnswer('');
    let data;
    try {
      data = await postTurn(payload);
    } catch (err) {
      answeringRef.current = false;
      setError(err.message);
      setDraftAnswer(transcript);
      setTurnLabel(typed ? 'Your turn — type your answer' : 'Your turn — speak now');
      return;
    }
    primeSpeakingB2Line(data.examinerText, examinerIdRef.current, data.examinerAudio);
    if (data.done || data.state === 'FINISHING') {
      setExaminerText(data.examinerText || 'Thank you. That is the end of Part 1.');
      if (data.examinerText) {
        pendingLineRef.current = data.examinerText;
        await playSpeakingB2Line(data.examinerText, exam.code, examinerIdRef.current, ttsSession()).catch(() => {});
      }
      setScreen('processing');
      setState('PROCESSING');
      await completeExam(id);
      return;
    }
    answeringRef.current = false;
    if (data.examinerText) {
      await prepareExaminerLine(data.examinerText);
      await playPendingLine(id);
    }
  };

  const startExam = async ({ typed = false } = {}) => {
    if (examStartLock.current.isLocked() && !busy) {
      examStartLock.current.release();
    }
    if (!examStartLock.current.acquire()) return;
    setBusy(true);
    setError('');
    const id = sessionIdRef.current || sessionId;
    try {
      if (!id) {
        throw new Error('No hay sesión de entrevista. Pulsa Cancel y vuelve a empezar.');
      }
      const useTyped = Boolean(typed);
      typedModeRef.current = useTyped;
      setTypedMode(useTyped);
      mic.release();
      const data = await postTurn({ sessionId: id, action: 'start' });
      if (data.examinerId && !examinerIdRef.current) examinerIdRef.current = data.examinerId;
      screenRef.current = 'exam';
      setScreen('exam');
      startClock();
      setExerciseStarted(false);
      await prepareExaminerLine(data.examinerText);
    } catch (err) {
      examStartLock.current.release();
      setError(err.message || 'No se pudo empezar la entrevista.');
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
        headers: await speakingB2AuthHeaders(tokenRef.current || accessToken, {
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
    stopExaminerAudio();
    mic.release();
    clearInterval(timerRef.current);
    clearTimeout(noResponseTimer.current);
    speechStartedAt.current = 0;
    clockRef.current = { running: false, accumulated: 0, mark: 0 };
    answeringRef.current = false;
    completingRef.current = false;
    tokenRef.current = '';
    sessionIdRef.current = '';
    examinerIdRef.current = '';
    introTextRef.current = '';
    typedModeRef.current = false;
    pendingLineRef.current = '';
    startLock.current.release();
    examStartLock.current.release();
    setAccessToken('');
    setSessionId('');
    setExaminer(null);
    setReport(null);
    setExaminerText('');
    setElapsed(0);
    setError('');
    setDraftAnswer('');
    setTypedMode(false);
    setTtsLoading(false);
    setAudioReady(false);
    setExerciseStarted(false);
    setExercisePaused(false);
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
    getLifecycle: () => describeSpeakingMotorLifecycle({
      screen: screenRef.current,
      busy,
      allowed: canStartRef.current,
    }),
    reset: resetLocal,
  }), [beginAudioCheck, busy]);

  if (screen === 'select') {
    if (parentControlled) {
      if (!accessReady) {
        return (
          <section className={shellClass}>
            <p className={styles.note}>Comprobando el acceso…</p>
          </section>
        );
      }
      if (!canStartInterview) {
        return (
          <section className={shellClass}>
            <p className={styles.note}>Esta entrevista está en prueba interna. Solo puede iniciarla el equipo docente.</p>
          </section>
        );
      }
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
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            {!accessReady ? (
              <p className={styles.note}>Comprobando el acceso…</p>
            ) : canStartInterview ? (
              <button type="button" className={styles.button} onClick={() => void beginAudioCheck()} disabled={busy}>
                Start the interview
              </button>
            ) : (
              <p className={styles.note}>Esta entrevista está en prueba interna. Solo puede iniciarla el equipo docente.</p>
            )}
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
          {mic.error ? <p className={styles.error}>{mic.error}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => void startExam()}
              disabled={busy || Boolean(mic.error)}
            >
              {busy ? 'Starting…' : 'Start the interview'}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => void startExam({ typed: true })}
              disabled={busy}
            >
              Continue without microphone
            </button>
            <button type="button" className={styles.ghost} onClick={abortExam} disabled={busy}>
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
          <span>Examiner: {examiner?.name || '…'}</span>
          <span>Mic: {typedMode ? 'typed' : mic.status === 'recording' ? 'listening' : 'idle'}</span>
          <span>Turn: {turnLabel}</span>
          <span>Time: {elapsed}s</span>
        </div>
        <SpeakingExerciseControls
          sessionReady={Boolean(sessionId && examinerText)}
          exerciseStarted={exerciseStarted}
          exercisePaused={exercisePaused}
          loading={ttsLoading}
          canRepeat={audioReady || exerciseStarted}
          playDisabled={!audioReady && !ttsLoading}
          onPlay={() => {
            if (exercisePaused) {
              resumeExaminerAudio();
              setExercisePaused(false);
              return;
            }
            void playPendingLine(sessionId, { afterPlay: !exerciseStarted || turnLabel === 'Examiner' });
          }}
          onPause={() => {
            pauseExaminerAudio();
            setExercisePaused(true);
          }}
          onRepeat={() => void playPendingLine(sessionId, { afterPlay: false })}
          onNextStep={() => void playPendingLine(sessionId)}
        />
        <ExaminerVoiceVisualizer
          isLoading={ttsLoading}
          waitingToStart={!exerciseStarted && !ttsLoading}
        />
        {typedMode ? (
          <>
            <p className={styles.note}>Type your answer in English. Pronunciation cannot be scored without audio.</p>
            <textarea
              className={styles.typedAnswer}
              value={draftAnswer}
              onChange={(event) => {
                setDraftAnswer(event.target.value);
                if (event.target.value.trim()) noteSpeechStartedRef.current();
              }}
              placeholder="Type your answer here…"
              disabled={busy || answerLocked}
              rows={5}
            />
          </>
        ) : (
          <p className={styles.note}>Look at the examiner. Answer in English. Do not read notes.</p>
        )}
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={typedMode ? styles.button : styles.ghost}
            onClick={() => finishAnswer(sessionId, draftAnswer)}
            disabled={busy || answerLocked || (typedMode && !draftAnswer.trim())}
          >
            {typedMode ? 'Send answer' : 'I’ve finished'}
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
