'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withBasePath } from '@/lib/base-path';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import { FeedbackCards } from '@/features/speaking/ui/components/FeedbackCards';
import { getB2SpeakingExamBySlot } from '@/data/b2-speaking-exams';
import {
  advanceEngineAfterCandidate,
  advanceEnginePastDisplayOnly,
  createB2ExamEngineState,
  formatB2ExamTranscript,
  getScriptLineAt,
  isExamFullyComplete,
  isPart1ToPart2Transition,
  resolveStepsFromEngine,
  B2_LONG_TURN_SECONDS,
  B2_PART1_QUESTION_COUNT,
} from '@/features/speaking/domain/b2-speaking-exam-engine';
import { B2_SPEAKING_MAX_CANDIDATE_TURNS } from '@/features/speaking/domain/b2-speaking-exam-bank.types';
import { fetchAiUsageStatus } from '@/lib/ai/draloAiClient';
import { LIMIT_REACHED, resolveSpeakingUsageDisplay, speakingLimitLabel } from '@/lib/aiUsageLimitCopy';
import {
  loadSpeakingUsageLocal,
  mergeSpeakingUsageStatus,
  saveSpeakingUsageLocal,
} from '@/lib/speakingUsageStorage';
import { getSessionUserId } from '@/utils/levelsEstadisticas';

const PART_LABELS = {
  1: 'Part 1: Interview',
  2: 'Part 2: Long turn',
  3: 'Part 3: Collaborative task',
  4: 'Part 4: Discussion',
};

const PART1_HEADER = {
  en: 'Part 1: Interview · About 2 minutes',
  es: 'Part 1: Entrevista · Unos 2 minutos',
};

const PART1_ANSWER_TIME = {
  en: 'Suggested answer time: 20–30 seconds',
  es: 'Tiempo recomendado por respuesta: 20–30 segundos',
};

const SAVE_WARNING = {
  en: 'We had a problem saving this answer, but you can continue. Your local transcript is still available for feedback.',
  es: 'Hubo un problema al guardar esta respuesta, pero puedes continuar. Tu transcript local sigue disponible para el feedback.',
};

/**
 * @param {{
 *   examSlot: number,
 *   lang?: 'en'|'es',
 *   onExamComplete?: (info: { sessionId: string, examId: string }) => void,
 *   autoStart?: boolean,
 * }} props
 */
export default function B2SpeakingFullExamSimulation({
  examSlot = 1,
  lang = 'en',
  onExamComplete,
  autoStart = false,
}) {
  const isEn = lang === 'en';
  const exam = useMemo(() => getB2SpeakingExamBySlot(examSlot), [examSlot]);

  const [phase, setPhase] = useState(autoStart ? 'starting' : 'intro');
  const [sessionId, setSessionId] = useState(null);
  const [engineState, setEngineState] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentLines, setCurrentLines] = useState([]);
  const [photos, setPhotos] = useState(null);
  const [awaitingCandidate, setAwaitingCandidate] = useState(false);
  const [longTurnLeft, setLongTurnLeft] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [startingExam, setStartingExam] = useState(false);
  /** @type {['ready'|'transcribing'|'saving'|'recording', Function]} */
  const [interactionStatus, setInteractionStatus] = useState('ready');
  const [pendingSaveCount, setPendingSaveCount] = useState(0);
  const [saveWarning, setSaveWarning] = useState('');
  const [error, setError] = useState('');
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [usageHint, setUsageHint] = useState('');
  const [usageRemaining, setUsageRemaining] = useState(null);
  const [usageUnlimited, setUsageUnlimited] = useState(false);
  const [showTranscriptReview, setShowTranscriptReview] = useState(false);
  const [part1QuestionProgress, setPart1QuestionProgress] = useState(null);

  const media = useMediaRecorder();
  const userIdRef = useRef(null);
  const scriptBootstrappedRef = useRef(false);
  const turnIndexRef = useRef(0);
  const examStartedAtRef = useRef(null);
  const turnTimestampsRef = useRef([]);
  const answerStartedAtRef = useRef(null);

  const beginBackgroundSave = useCallback(() => {
    setPendingSaveCount((n) => n + 1);
    setInteractionStatus((prev) => (prev === 'transcribing' || prev === 'recording' ? prev : 'saving'));
  }, []);

  const endBackgroundSave = useCallback(() => {
    setPendingSaveCount((n) => {
      const next = Math.max(0, n - 1);
      if (next === 0) {
        setInteractionStatus((prev) => (prev === 'saving' ? 'ready' : prev));
      }
      return next;
    });
  }, []);

  const onPersistFailure = useCallback(
    (err) => {
      const code = err?.code;
      if (code === 'SPEAKING_SESSION_TURN_LIMIT_REACHED') {
        setError(err.message || 'Turn limit reached');
        return;
      }
      setSaveWarning(isEn ? SAVE_WARNING.en : SAVE_WARNING.es);
    },
    [isEn],
  );

  const applyUsage = useCallback(
    (status) => {
      const resolved = resolveSpeakingUsageDisplay(status, { lang: isEn ? 'en' : 'es' });
      setUsageUnlimited(resolved.unlimited);
      if (resolved.unlimited) {
        setUsageHint('');
        setUsageRemaining(null);
        return;
      }
      setUsageRemaining(resolved.remaining);
      setUsageHint(
        resolved.hint ||
          speakingLimitLabel(resolved.limit ?? 3, { lang: isEn ? 'en' : 'es' }),
      );
      if (userIdRef.current) {
        saveSpeakingUsageLocal(userIdRef.current, {
          used: resolved.used ?? 0,
          limit: resolved.limit ?? 3,
          atLimit: resolved.atLimit,
        });
      }
    },
    [isEn],
  );

  useEffect(() => {
    void getSessionUserId().then((id) => {
      userIdRef.current = id;
      void fetchAiUsageStatus().then((status) => {
        const local = id ? loadSpeakingUsageLocal(id) : null;
        applyUsage(mergeSpeakingUsageStatus(status?.speaking, local));
      });
    });
  }, [applyUsage]);

  const persistTurn = useCallback(
    async ({ speakerRole, text, partNumber, transcriptSource, nextEngineState, turnIndex: explicitIndex }) => {
      if (!sessionId) return null;
      const idx = explicitIndex ?? turnIndexRef.current;
      const res = await fetch(buildClientApiUrl('/api/speaking/b2-exam/turn'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          examId: exam.id,
          partNumber,
          turnIndex: idx,
          speakerRole,
          text,
          transcriptSource,
          examState: nextEngineState ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || data.message || 'Failed to save turn');
        err.code = data.code;
        throw err;
      }
      return data;
    },
    [sessionId, exam.id],
  );

  const persistTurnBackground = useCallback(
    (params) => {
      beginBackgroundSave();
      void persistTurn(params)
        .catch(onPersistFailure)
        .finally(endBackgroundSave);
    },
    [beginBackgroundSave, endBackgroundSave, onPersistFailure, persistTurn],
  );

  const allocateTurnIndex = useCallback(() => {
    const idx = turnIndexRef.current;
    turnIndexRef.current += 1;
    setTurnIndex(turnIndexRef.current);
    return idx;
  }, []);

  const pushTranscriptLine = useCallback((line) => {
    setTranscript((prev) => [...prev, line]);
  }, []);

  const playCurrentScriptStep = useCallback(
    (state) => {
      const steps = resolveStepsFromEngine(exam, state);
      const displayLines = [];
      let photosStep = null;
      let longTurn = null;
      let awaitCandidate = false;
      let part1Progress = null;

      for (const step of steps) {
        if (step.kind === 'photos') {
          photosStep = { imageA: step.imageA, imageB: step.imageB, prompt: step.prompt };
        } else if (step.kind === 'display') {
          displayLines.push({
            partNumber: step.partNumber,
            speakerRole: step.speakerRole,
            text: step.text,
          });
        } else if (step.kind === 'long_turn_start') {
          longTurn = step.seconds;
        } else if (step.kind === 'await_candidate') {
          awaitCandidate = true;
          if (step.partNumber === 1 && step.questionNumber && step.totalQuestions) {
            part1Progress = {
              current: step.questionNumber,
              total: step.totalQuestions,
            };
          }
        } else if (step.kind === 'exam_finished') {
          setPhase('summary');
          onExamComplete?.({ sessionId, examId: exam.id });
          return;
        }
      }

      setPhotos(photosStep);
      setCurrentLines(displayLines);
      setAwaitingCandidate(awaitCandidate);
      if (awaitCandidate) {
        answerStartedAtRef.current = Date.now();
      }
      setLongTurnLeft(longTurn);
      setPart1QuestionProgress(part1Progress);
      setInteractionStatus('ready');

      for (const line of displayLines) {
        pushTranscriptLine({ ...line, transcriptSource: 'SCRIPT' });
        const idx = allocateTurnIndex();
        persistTurnBackground({
          speakerRole: line.speakerRole,
          text: line.text,
          partNumber: line.partNumber,
          transcriptSource: 'SCRIPT',
          nextEngineState: state,
          turnIndex: idx,
        });
      }

      if (longTurn != null) {
        setPhase('long_turn');
        void media.start().then(() => setInteractionStatus('recording'));
      } else if (awaitCandidate) {
        setPhase('awaiting');
      } else {
        const advanced = advanceEnginePastDisplayOnly(exam, state);
        setEngineState(advanced);
        if (getScriptLineAt(exam, advanced.stepIndex)) {
          playCurrentScriptStep(advanced);
        }
      }
    },
    [
      exam,
      media,
      onExamComplete,
      persistTurnBackground,
      pushTranscriptLine,
      allocateTurnIndex,
      sessionId,
      exam.id,
    ],
  );

  const startExam = useCallback(async () => {
    setStartingExam(true);
    setError('');
    setSaveWarning('');
    setFeedbackReport(null);
    setFeedbackError('');
    setTranscript([]);
    turnIndexRef.current = 0;
    setTurnIndex(0);
    setPart1QuestionProgress(null);
    setInteractionStatus('ready');
    scriptBootstrappedRef.current = false;
    examStartedAtRef.current = new Date().toISOString();
    turnTimestampsRef.current = [];
    answerStartedAtRef.current = null;

    try {
      const res = await fetch(buildClientApiUrl('/api/speaking/b2-exam/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ examId: exam.id, examSlot }),
      });
      if (!res.ok) throw new Error(isEn ? 'Could not start exam session.' : 'No se pudo iniciar la sesión.');
      const data = await res.json();
      const initialState = createB2ExamEngineState(exam.id);
      setSessionId(data.sessionId);
      setEngineState(initialState);
      setPhase('active');
      scriptBootstrappedRef.current = true;
      playCurrentScriptStep(initialState);
    } catch (e) {
      setError(e?.message || 'Error');
      setPhase('intro');
    } finally {
      setStartingExam(false);
    }
  }, [exam, examSlot, isEn, playCurrentScriptStep]);

  useEffect(() => {
    if (autoStart && phase === 'starting') {
      void startExam();
    }
  }, [autoStart, phase, startExam]);

  useEffect(() => {
    if (longTurnLeft == null || longTurnLeft <= 0) return;
    const t = window.setTimeout(() => setLongTurnLeft((s) => (s != null ? s - 1 : s)), 1000);
    return () => window.clearTimeout(t);
  }, [longTurnLeft]);

  useEffect(() => {
    if (phase !== 'long_turn' || longTurnLeft !== 0 || !media.isActive) return;
    void (async () => {
      const blob = await media.stop();
      if (blob?.size) await submitCandidateResponse(blob);
      else setPhase('awaiting');
    })();
  }, [phase, longTurnLeft, media.isActive]);

  const submitCandidateResponse = async (audioOrText) => {
    if (!engineState || !sessionId) return;
    if (interactionStatus === 'transcribing') return;

    setError('');
    setSaveWarning('');

    let text = '';
    let transcriptSource = 'TYPED';

    try {
      if (audioOrText instanceof Blob) {
        setInteractionStatus('transcribing');
        const form = new FormData();
        form.append('audio', audioOrText, 'capture.webm');
        form.set('sessionId', sessionId);
        form.set('partNumber', String(engineState.partNumber ?? 1));
        const tr = await fetch(buildClientApiUrl('/api/speaking/b2-exam/transcribe'), {
          method: 'POST',
          credentials: 'include',
          body: form,
        });
        const trData = await tr.json().catch(() => ({}));
        if (!tr.ok) throw new Error(trData.error || 'Transcription failed');
        text = trData.transcript || '';
        transcriptSource = trData.transcriptSource || 'STT';
      } else {
        text = String(audioOrText || '').trim();
        transcriptSource = 'TYPED';
      }

      if (!text) {
        setError(isEn ? 'Please say or type an answer.' : 'Di o escribe una respuesta.');
        setInteractionStatus('ready');
        return;
      }

      const partNumber = engineState.partNumber;
      const responseDurationSec = answerStartedAtRef.current
        ? Math.max(1, Math.round((Date.now() - answerStartedAtRef.current) / 1000))
        : undefined;
      turnTimestampsRef.current.push({
        partNumber,
        at: new Date().toISOString(),
        responseDurationSec,
      });
      answerStartedAtRef.current = null;

      const prevState = engineState;
      const nextState = advanceEngineAfterCandidate(exam, engineState);

      pushTranscriptLine({
        partNumber,
        speakerRole: 'candidate',
        text,
        transcriptSource,
      });
      setEditableTranscript(text);
      setDraftText('');
      setLongTurnLeft(null);
      setPart1QuestionProgress(null);
      setEngineState(nextState);
      setInteractionStatus('ready');

      const turnIdx = allocateTurnIndex();
      persistTurnBackground({
        speakerRole: 'candidate',
        text,
        partNumber,
        transcriptSource,
        nextEngineState: nextState,
        turnIndex: turnIdx,
      });

      if (isPart1ToPart2Transition(prevState, nextState)) {
        setPhase('part1_complete');
        return;
      }

      if (isExamFullyComplete(nextState)) {
        setPhase('summary');
        onExamComplete?.({ sessionId, examId: exam.id });
        return;
      }

      const nextLine = getScriptLineAt(exam, nextState.stepIndex);
      if (!nextLine) {
        setPhase('summary');
        return;
      }

      playCurrentScriptStep(nextState);
    } catch (e) {
      setError(e?.message || 'Error');
      setInteractionStatus('ready');
    }
  };

  const requestFeedback = async () => {
    if (!sessionId || !usageUnlimited && usageRemaining === 0) return;
    setFeedbackLoading(true);
    setFeedbackError('');

    const partsCompleted = engineState?.partsCompleted ?? [];
    const formatted = formatB2ExamTranscript(transcript, exam, partsCompleted);
    const isPartial = !isExamFullyComplete(engineState ?? createB2ExamEngineState(exam.id));

    try {
      const res = await fetch(withBasePath('/api/speaking/evaluate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          cefr: 'B2',
          mode: 'EXAM',
          combinedTranscript: formatted,
          examId: exam.id,
          isPartialEvaluation: isPartial,
          evidenceMetadata: {
            partsCompleted,
            startedAt: examStartedAtRef.current,
            endedAt: new Date().toISOString(),
            responseDurationsSec: turnTimestampsRef.current
              .map((entry) => entry.responseDurationSec)
              .filter((value) => typeof value === 'number' && value > 0),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const limitHit =
          res.status === 429 ||
          data.code === 'DAILY_LIMIT_REACHED' ||
          data.code === 'LIMIT_CHECK_FAILED';
        if (limitHit) {
          applyUsage(data.usage ?? { atLimit: true, remaining: 0, limit: 3, used: 3 });
          throw new Error(
            isEn ? LIMIT_REACHED.speaking.en : LIMIT_REACHED.speaking.es,
          );
        }
        throw new Error(data.message || data.error || 'Feedback failed');
      }
      setFeedbackReport(data.report);
      if (data.usage) applyUsage(data.usage);
      setPhase('feedback');
    } catch (e) {
      setFeedbackError(e?.message || 'Feedback failed');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const limitReached = !usageUnlimited && usageRemaining === 0;
  const candidateCount = engineState?.candidateTurnCount ?? 0;
  const inputBlocked = interactionStatus === 'transcribing' || startingExam;

  if (phase === 'intro' || phase === 'starting') {
    return (
      <div className="levels-b2-speaking-full-exam levels-b2-speaking-full-exam--intro">
        <h2 className="levels-b2-speaking-full-exam__title">
          {isEn ? 'B2 Speaking Exam Simulation' : 'Simulación B2 Speaking Exam'}
        </h2>
        <p className="levels-b2-speaking-full-exam__meta">
          {exam.title} · {exam.theme} · ~{exam.estimatedDurationMinutes}{' '}
          {isEn ? 'min' : 'min'}
        </p>
        <ul className="levels-b2-speaking-full-exam__parts-list">
          <li>
            {isEn
              ? `Part 1: Interview · ${B2_PART1_QUESTION_COUNT} questions · ~2 minutes`
              : `Part 1: Entrevista · ${B2_PART1_QUESTION_COUNT} preguntas · ~2 minutos`}
          </li>
          {[2, 3, 4].map((n) => (
            <li key={n}>{PART_LABELS[n]}</li>
          ))}
        </ul>
        <p className="levels-b2-speaking-panel__usage levels-b2-writing-panel__alpha-limit">
          {isEn
            ? 'Free beta: 3 speaking exam feedbacks per day.'
            : 'Beta gratuita: 3 feedbacks de speaking exam al día.'}
        </p>
        {error ? <p className="levels-b2-speaking-session__error">{error}</p> : null}
        <button
          type="button"
          className="levels-b2-speaking-session__phase-btn levels-b2-speaking-session__phase-btn--primary"
          onClick={() => void startExam()}
          disabled={startingExam}
        >
          {startingExam
            ? isEn
              ? 'Starting…'
              : 'Iniciando…'
            : isEn
              ? 'Start exam'
              : 'Empezar examen'}
        </button>
      </div>
    );
  }

  if (phase === 'part1_complete') {
    return (
      <div className="levels-b2-speaking-full-exam levels-b2-speaking-full-exam--part1-complete">
        <h2 className="levels-b2-speaking-full-exam__title">
          {isEn ? 'Part 1 complete' : 'Part 1 completada'}
        </h2>
        <p className="levels-b2-speaking-full-exam__meta">
          {isEn
            ? `You answered all ${B2_PART1_QUESTION_COUNT} interview questions.`
            : `Has respondido las ${B2_PART1_QUESTION_COUNT} preguntas de la entrevista.`}
        </p>
        <p className="levels-b2-speaking-full-exam__meta">
          {isEn ? 'Next: Part 2 — Long turn (~1 minute).' : 'Siguiente: Part 2 — Turno largo (~1 minuto).'}
        </p>
        <button
          type="button"
          className="levels-b2-speaking-session__phase-btn levels-b2-speaking-session__phase-btn--primary"
          disabled={inputBlocked}
          onClick={() => {
            setPhase('active');
            playCurrentScriptStep(engineState);
          }}
        >
          {isEn ? 'Continue to Part 2' : 'Continuar a Part 2'}
        </button>
      </div>
    );
  }

  if (phase === 'summary' || phase === 'feedback') {
    const partsDone = engineState?.partsCompleted ?? [];
    return (
      <div className="levels-b2-speaking-full-exam levels-b2-speaking-full-exam--summary">
        <h2 className="levels-b2-speaking-full-exam__title">
          {isEn ? 'Exam complete' : 'Examen completado'}
        </h2>
        <p>
          {isEn ? 'Parts completed:' : 'Partes completadas:'}{' '}
          {[1, 2, 3, 4]
            .map((p) => (partsDone.includes(p) ? `Part ${p} ✓` : `Part ${p} —`))
            .join(' · ')}
        </p>
        <p className="levels-b2-speaking-panel__usage">
          {usageHint ||
            (isEn
              ? 'Free beta: 3 speaking exam feedbacks per day.'
              : 'Beta gratuita: 3 feedbacks de speaking exam al día.')}
        </p>
        {phase === 'summary' ? (
          <>
            <button
              type="button"
              className="levels-b2-writing-panel__submit"
              onClick={() => void requestFeedback()}
              disabled={feedbackLoading || limitReached || transcript.length === 0}
            >
              {feedbackLoading
                ? isEn
                  ? 'Getting feedback…'
                  : 'Generando feedback…'
                : limitReached
                  ? isEn
                    ? 'Daily limit reached'
                    : 'Límite diario alcanzado'
                  : isEn
                    ? 'Get exam feedback'
                    : 'Obtener feedback del examen'}
            </button>
            {feedbackError ? (
              <p className="levels-b2-writing-panel__error" role="alert">
                {feedbackError}
              </p>
            ) : null}
            <button
              type="button"
              className="levels-b2-speaking-session__secondary-btn"
              onClick={() => setShowTranscriptReview((v) => !v)}
            >
              {showTranscriptReview
                ? isEn
                  ? 'Hide transcript'
                  : 'Ocultar transcript'
                : isEn
                  ? 'Review transcript'
                  : 'Revisar transcript'}
            </button>
          </>
        ) : null}
        {showTranscriptReview || phase === 'feedback' ? (
          <pre className="levels-b2-speaking-full-exam__transcript">
            {formatB2ExamTranscript(transcript, exam, partsDone)}
          </pre>
        ) : null}
        {feedbackReport ? <FeedbackCards report={feedbackReport} /> : null}
      </div>
    );
  }

  const activePartNumber = engineState?.partNumber ?? 1;
  const partHeaderLabel =
    activePartNumber === 1 ? (isEn ? PART1_HEADER.en : PART1_HEADER.es) : PART_LABELS[activePartNumber];

  return (
    <div className="levels-b2-speaking-full-exam levels-b2-speaking-full-exam--active">
      <div className="levels-b2-speaking-full-exam__header">
        <span className="levels-b2-speaking-full-exam__part-badge">{partHeaderLabel}</span>
        <span className="levels-b2-speaking-full-exam__turn-count">
          {isEn ? 'Your answers:' : 'Tus respuestas:'} {candidateCount}/{B2_SPEAKING_MAX_CANDIDATE_TURNS}
        </span>
      </div>

      {interactionStatus === 'transcribing' ? (
        <p className="levels-b2-speaking-full-exam__status" role="status">
          {isEn ? 'Transcribing your answer…' : 'Transcribiendo tu respuesta…'}
        </p>
      ) : null}
      {interactionStatus === 'recording' ? (
        <p className="levels-b2-speaking-full-exam__status" role="status">
          {isEn ? 'Recording…' : 'Grabando…'}
        </p>
      ) : null}
      {pendingSaveCount > 0 ? (
        <p className="levels-b2-speaking-full-exam__status levels-b2-speaking-full-exam__status--muted">
          {isEn ? 'Saving…' : 'Guardando…'}
        </p>
      ) : null}

      {part1QuestionProgress ? (
        <div className="levels-b2-speaking-full-exam__part1-progress" aria-live="polite">
          <p className="levels-b2-speaking-full-exam__part1-question">
            {isEn
              ? `Question ${part1QuestionProgress.current} of ${part1QuestionProgress.total}`
              : `Pregunta ${part1QuestionProgress.current} de ${part1QuestionProgress.total}`}
          </p>
          <p className="levels-b2-speaking-full-exam__part1-time">
            {isEn ? PART1_ANSWER_TIME.en : PART1_ANSWER_TIME.es}
          </p>
          <p className="levels-b2-speaking-full-exam__part1-progress-bar" role="status">
            {isEn ? 'Interview progress:' : 'Progreso de la entrevista:'}{' '}
            {part1QuestionProgress.current}/{part1QuestionProgress.total}
          </p>
        </div>
      ) : null}

      {currentLines.map((line, i) => (
        <div
          key={`${line.speakerRole}-${i}`}
          className={`levels-b2-speaking-full-exam__line levels-b2-speaking-full-exam__line--${line.speakerRole}`}
        >
          <strong>
            {line.speakerRole === 'examiner'
              ? isEn
                ? 'Examiner'
                : 'Examinador'
              : line.speakerRole === 'partner'
                ? isEn
                  ? 'Partner'
                  : 'Compañero'
                : isEn
                  ? 'You'
                  : 'Tú'}
            :
          </strong>{' '}
          {line.text}
        </div>
      ))}

      {photos ? (
        <div className="levels-b2-speaking-session__photos">
          <div className="levels-b2-speaking-session__photo">
            <img src={photos.imageA} alt="Photograph A" className="levels-b2-speaking-session__photo-img" />
          </div>
          <div className="levels-b2-speaking-session__photo">
            <img src={photos.imageB} alt="Photograph B" className="levels-b2-speaking-session__photo-img" />
          </div>
          <p className="levels-b2-speaking-full-exam__photo-prompt">{photos.prompt}</p>
        </div>
      ) : null}

      {longTurnLeft != null ? (
        <p className="levels-b2-speaking-session__countdown">
          {isEn ? 'Time:' : 'Tiempo:'}{' '}
          {String(Math.floor(longTurnLeft / 60)).padStart(2, '0')}:
          {String(longTurnLeft % 60).padStart(2, '0')} / {B2_LONG_TURN_SECONDS}s
        </p>
      ) : null}

      {awaitingCandidate || phase === 'long_turn' ? (
        <div className="levels-b2-speaking-session__mic-row">
          <button
            type="button"
            className={`levels-b2-speaking-session__mic-btn${
              media.isActive ? ' levels-b2-speaking-session__mic-btn--recording' : ''
            }`}
            disabled={inputBlocked || interactionStatus === 'recording'}
            onClick={async () => {
              if (media.isActive) {
                const blob = await media.stop();
                if (blob?.size) await submitCandidateResponse(blob);
                else setInteractionStatus('ready');
              } else {
                await media.start();
                setInteractionStatus('recording');
              }
            }}
          >
            {media.isActive
              ? isEn
                ? '■ Stop and send'
                : '■ Parar y enviar'
              : isEn
                ? '🎤 Record answer'
                : '🎤 Grabar respuesta'}
          </button>
        </div>
      ) : null}

      {(awaitingCandidate || phase === 'long_turn') && (
        <div className="levels-b2-speaking-session__text-row">
          <input
            type="text"
            className="levels-b2-speaking-session__text-input"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={isEn ? 'Or type your answer' : 'O escribe tu respuesta'}
            disabled={inputBlocked}
          />
          <button
            type="button"
            className="levels-b2-speaking-session__text-send"
            disabled={inputBlocked || !draftText.trim()}
            onClick={() => void submitCandidateResponse(draftText)}
          >
            {isEn ? 'Send' : 'Enviar'}
          </button>
        </div>
      )}

      {editableTranscript && awaitingCandidate ? (
        <p className="levels-b2-speaking-full-exam__last-transcript">
          <strong>{isEn ? 'Last transcript (editable on send):' : 'Última transcripción:'}</strong>{' '}
          {editableTranscript}
        </p>
      ) : null}

      {saveWarning ? (
        <p className="levels-b2-speaking-session__warn" role="status">
          {saveWarning}
        </p>
      ) : null}
      {error ? <p className="levels-b2-speaking-session__error">{error}</p> : null}
      {media.error ? <p className="levels-b2-speaking-session__warn">{media.error}</p> : null}
    </div>
  );
}
