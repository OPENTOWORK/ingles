'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SiteMascot from '@/components/SiteMascot';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';
import { callDraloAi } from '@/lib/ai/draloAiClient';
import { SPEAKING_MISSIONS, getMissionBackground } from '@/data/speakingMissions';
import {
  getOverallSpeakingXp,
  loadSpeakingProgressForLevel,
  recordSpeakingMissionComplete,
  speakingCoachLevel,
} from '@/lib/speakingCoachProgress';
import { useSpeechRecognition } from '../../../dralo-speaking/lib/useSpeechRecognition';

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const STUDENT_ROLES = [
  'Customer',
  'Traveller / Passenger',
  'Hotel guest',
  'Patient',
  'Job candidate',
  'Team member',
  'New friend',
  'Tourist',
  'Student',
];

const CONVERSATION_TYPES = ['Informal', 'Formal', 'Neutral'];

const EMPTY_SCORES = { grammar: 0, vocabulary: 0, fluency: 0, confidence: 0 };

const SCORE_META = [
  { key: 'grammar', label: 'Grammar', color: '#6366f1' },
  { key: 'vocabulary', label: 'Vocabulary', color: '#0ea5e9' },
  { key: 'fluency', label: 'Fluency', color: '#10b981' },
  { key: 'confidence', label: 'Confidence', color: '#f59e0b' },
];

function hasQuickTip(tip) {
  if (!tip || typeof tip !== 'object') return false;
  return Boolean(
    String(tip.original || '').trim() ||
      String(tip.better || '').trim() ||
      String(tip.why || '').trim(),
  );
}

function buildApiConversation(messages) {
  return messages.map((m) => ({
    role: m.role === 'coach' ? 'assistant' : 'user',
    content: m.text,
  }));
}

function mergeObjectives(prev, incoming) {
  if (!Array.isArray(incoming) || incoming.length === 0) return prev;
  const set = new Set(prev);
  incoming.forEach((i) => {
    const n = Number(i);
    if (Number.isInteger(n)) set.add(n);
  });
  return Array.from(set).sort((a, b) => a - b);
}

function SpeakingExperienceBar({ missions, progress, level, sessionXp }) {
  const overall = getOverallSpeakingXp(missions, progress);
  const coach = speakingCoachLevel(overall.earned);

  return (
    <section className="dralo-ai-speaking-progress" aria-label="Speaking Coach experience">
      <div className="dralo-ai-speaking-progress__head">
        <div>
          <h2 className="dralo-ai-speaking-progress__head-title">Your experience</h2>
          <p className="dralo-ai-speaking-progress__head-meta">
            Level {level} · {overall.earned} / {overall.cap} XP across topics
            {sessionXp > 0 ? ` · +${sessionXp} XP this session` : ''}
          </p>
        </div>
        <div className="dralo-ai-speaking-progress__level">
          <div className="dralo-ai-speaking-progress__level-row">
            <span className="dralo-ai-speaking-progress__level-label">
              Coach level {coach.level}
            </span>
            <span className="dralo-ai-speaking-progress__level-xp">
              {coach.inLevel} / 200 XP
              {coach.nextAt < 200 ? ` · ${coach.nextAt} to next` : ''}
            </span>
          </div>
          <div
            className="dralo-ai-speaking-progress__bar"
            role="progressbar"
            aria-valuenow={coach.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Coach level progress"
          >
            <span
              className="dralo-ai-speaking-progress__bar-fill"
              style={{ width: `${coach.pct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Dralo AI Speaking Coach — real-life roleplay missions in the Dralo AI studio
 * layout (hero + toolbar + mission setup + single chat panel), like Grammar Coach.
 */
export default function LevelsSpeakingAiPanel({ defaultLevel = 'B2' }) {
  const initialLevel = LEVELS.includes(String(defaultLevel || '').toUpperCase())
    ? String(defaultLevel).toUpperCase()
    : 'B2';

  const [level, setLevel] = useState(initialLevel);
  const [view, setView] = useState('idle'); // idle | conversation | complete

  // Selectors (always visible)
  const [missionId, setMissionId] = useState(SPEAKING_MISSIONS[0]?.id || '');
  const [studentRole, setStudentRole] = useState(STUDENT_ROLES[0]);
  const [conversationType, setConversationType] = useState(CONVERSATION_TYPES[0]);

  // Active (started) mission
  const [mission, setMission] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [scores, setScores] = useState(EMPTY_SCORES);
  const [xp, setXp] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [report, setReport] = useState(null);

  const [avatarState, setAvatarState] = useState('idle');
  const [xpToast, setXpToast] = useState(null);
  const [missionProgress, setMissionProgress] = useState({});

  const chatRef = useRef(null);
  const sendAnswerRef = useRef(null);
  const happyTimerRef = useRef(null);
  const xpTimerRef = useRef(null);

  const selectedMission = useMemo(
    () => SPEAKING_MISSIONS.find((m) => m.id === missionId) || SPEAKING_MISSIONS[0],
    [missionId],
  );

  const running = view !== 'idle';
  const objectives = mission?.objectives || [];
  const totalObjectives = objectives.length;
  const progress = totalObjectives
    ? Math.round((completedObjectives.length / totalObjectives) * 100)
    : 0;
  const hasConversation = messages.some((m) => m.role === 'user');

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(
    () => () => {
      if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    setMissionProgress(loadSpeakingProgressForLevel(level));
  }, [level]);

  const refreshMissionProgress = useCallback(() => {
    setMissionProgress(loadSpeakingProgressForLevel(level));
  }, [level]);

  const flashHappy = useCallback(() => {
    setAvatarState('happy');
    if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
    happyTimerRef.current = setTimeout(() => setAvatarState('speaking'), 1800);
  }, []);

  const showXpToast = useCallback((amount, reason) => {
    if (!amount || amount <= 0) return;
    setXpToast({ amount, reason: reason || 'Nice work!' });
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    xpTimerRef.current = setTimeout(() => setXpToast(null), 2200);
  }, []);

  function resetSessionState() {
    setMessages([]);
    setInput('');
    setStarted(false);
    setScores(EMPTY_SCORES);
    setXp(0);
    setCompletedObjectives([]);
    setReport(null);
    setError('');
    setNotice('');
    setXpToast(null);
    setAvatarState('idle');
  }

  function applyTurnResult(result) {
    if (result.scores) setScores(result.scores);
    if (Array.isArray(result.completedObjectives)) {
      setCompletedObjectives((prev) => {
        const merged = mergeObjectives(prev, result.completedObjectives);
        if (merged.length > prev.length) flashHappy();
        return merged;
      });
    }
    const earned = Number(result.xpEarned) || 0;
    if (earned > 0) {
      setXp((prev) => prev + earned);
      showXpToast(earned, result.xpReason);
    }
    if (result.avatarState) setAvatarState(result.avatarState);
  }

  function buildScenario(m) {
    const parts = [m.scenario];
    if (m.studentRole) {
      parts.push(`The student is playing the role of: ${m.studentRole}.`);
    }
    if (m.conversationType) {
      parts.push(`Use a ${String(m.conversationType).toLowerCase()} register.`);
    }
    return parts.join('\n\n');
  }

  async function startMission(target) {
    const activeMission = target || mission;
    if (!activeMission) return;
    setMission(activeMission);
    setView('conversation');
    resetSessionState();
    setLoading(true);
    setLoadingAction('start');
    setAvatarState('thinking');

    try {
      const result = await callDraloAi({
        action: 'speaking_ai',
        level,
        mission: activeMission.title,
        missionTitle: activeMission.title,
        scenario: buildScenario(activeMission),
        objectives: activeMission.objectives,
        character: activeMission.character,
        conversation: [],
        userMessage: '',
        finish: false,
      });

      setMessages([{ role: 'coach', text: result.reply, quickTip: result.quickTip }]);
      applyTurnResult(result);
      setStarted(true);
      playAiVoice(result.reply);
    } catch (err) {
      setError(
        err?.message ||
          'Dralo could not start the mission right now. Please try again in a moment.',
      );
      setAvatarState('idle');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  }

  function handleStart() {
    if (!selectedMission) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    startMission({ ...selectedMission, studentRole, conversationType });
  }

  async function handleSendAnswer(textOverride) {
    if (!started || !mission) {
      setNotice('Start a mission before sending your answer.');
      return;
    }
    const trimmed = String(textOverride ?? input).trim();
    if (!trimmed) {
      setNotice('Write something in English to continue the mission.');
      return;
    }
    setError('');
    setNotice('');

    const userMsg = { role: 'user', text: trimmed };
    const conversationForApi = buildApiConversation(messages);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLoadingAction('send');
    setAvatarState('thinking');

    try {
      const result = await callDraloAi({
        action: 'speaking_ai',
        level,
        mission: mission.title,
        missionTitle: mission.title,
        scenario: buildScenario(mission),
        objectives: mission.objectives,
        character: mission.character,
        conversation: conversationForApi,
        userMessage: trimmed,
        finish: false,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: result.reply, quickTip: result.quickTip },
      ]);
      applyTurnResult(result);
      playAiVoice(result.reply);
    } catch (err) {
      setError(
        err?.message ||
          'Dralo could not reply right now. Please try sending your answer again.',
      );
      setAvatarState('idle');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  }

  sendAnswerRef.current = handleSendAnswer;

  const onSpeechResult = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed) return;
      if (started && !loading) {
        sendAnswerRef.current?.(trimmed);
      } else {
        setInput(trimmed);
      }
    },
    [started, loading],
  );

  const {
    isListening,
    transcript,
    interimTranscript,
    error: sttError,
    isSupported: sttSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({ onResult: onSpeechResult });

  useEffect(() => {
    if (!isListening) return;
    const display = [transcript, interimTranscript].filter(Boolean).join(' ').trim();
    if (display) setInput(display);
  }, [isListening, transcript, interimTranscript]);

  useEffect(() => {
    if (sttError) {
      setError(sttError);
      setNotice('');
    }
  }, [sttError]);

  async function handleFinish() {
    if (!mission) return;
    if (!hasConversation) {
      setNotice('Have a short conversation first, then finish the mission.');
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);
    setLoadingAction('finish');
    setAvatarState('thinking');

    try {
      const result = await callDraloAi({
        action: 'speaking_ai',
        level,
        mission: mission.title,
        missionTitle: mission.title,
        scenario: buildScenario(mission),
        objectives: mission.objectives,
        character: mission.character,
        conversation: buildApiConversation(messages),
        userMessage: '',
        finish: true,
      });

      if (result.scores) setScores(result.scores);
      if (Array.isArray(result.completedObjectives)) {
        setCompletedObjectives((prev) => mergeObjectives(prev, result.completedObjectives));
      }
      const bonus = Number(result.xpEarned) || 0;
      const finalXp = xp + bonus;
      if (bonus > 0) setXp(finalXp);
      setReport({ ...result, totalXp: finalXp });
      recordSpeakingMissionComplete(level, mission.id, {
        xpEarned: finalXp,
        stars: result.stars,
      });
      refreshMissionProgress();
      setView('complete');
      setAvatarState('happy');
    } catch (err) {
      setError(
        err?.message ||
          'Dralo could not build your mission report. Please try again.',
      );
      setAvatarState('idle');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendAnswer();
    }
  }

  function playAiVoice(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  async function startRecording() {
    if (!started) {
      setNotice('Start a mission before using the microphone.');
      return;
    }
    if (loading || isListening) return;
    setNotice('Allow microphone access when your browser asks…');
    setError('');
    setAvatarState('listening');
    await startListening();
    setNotice('');
  }

  function stopRecording() {
    stopListening();
  }

  function resetToIdle() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isListening) stopListening();
    resetSessionState();
    setMission(null);
    setView('idle');
  }

  function practiseAgain() {
    if (mission) startMission(mission);
  }

  const displayAvatarState = useMemo(() => {
    if (loading) return 'thinking';
    if (isListening) return 'listening';
    if (started && input.trim()) return 'listening';
    return avatarState;
  }, [loading, isListening, started, input, avatarState]);

  const headMission = mission && running ? mission : selectedMission;

  return (
    <main
      className="dralo-ai-page"
      style={{ '--dralo-accent-solid': '#db2777' }}
    >
      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <span>Speaking Coach</span>
        </nav>
      </div>

      <PageHero
        eyebrow="🎙️ Dralo AI · Speaking"
        title="Speaking Coach"
        description="Practise real English conversations with Dralo in realistic roleplays. Pick a topic, your role and the register, then speak or type your answers."
        accent="rose"
        showMascot
        mascotVariant={3}
        stats={[
          { value: 'Dralo', label: 'AI coach' },
          { value: level, label: 'Level' },
          { value: String(SPEAKING_MISSIONS.length), label: 'Topics' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-studio__toolbar">
          <span className="dralo-ai-studio__badge">🎙️ Dralo AI</span>
          <DraloAiLevelFilter levels={LEVELS} selectedLevel={level} onChange={setLevel} />
        </div>

        <section className="dralo-ai-speaking-setup" aria-label="Mission setup">
          <div className="dralo-ai-speaking-controls">
            <label className="dralo-ai-speaking-controls__field dralo-ai-speaking-controls__field--scenario">
              <span className="dralo-ai-speaking-controls__label">Scenario</span>
              <select
                className="dralo-ai-speaking-controls__select"
                value={missionId}
                onChange={(e) => setMissionId(e.target.value)}
                aria-describedby="speaking-scenario-hint"
              >
                {SPEAKING_MISSIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.title}
                  </option>
                ))}
              </select>
              <span id="speaking-scenario-hint" className="dralo-ai-speaking-controls__hint">
                {selectedMission?.description}
              </span>
            </label>

            <div className="dralo-ai-speaking-controls__options">
              <label className="dralo-ai-speaking-controls__field">
                <span className="dralo-ai-speaking-controls__label">Your role</span>
                <select
                  className="dralo-ai-speaking-controls__select"
                  value={studentRole}
                  onChange={(e) => setStudentRole(e.target.value)}
                >
                  {STUDENT_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="dralo-ai-speaking-controls__field">
                <span className="dralo-ai-speaking-controls__label">Conversation type</span>
                <select
                  className="dralo-ai-speaking-controls__select"
                  value={conversationType}
                  onChange={(e) => setConversationType(e.target.value)}
                >
                  {CONVERSATION_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="dralo-ai-speaking-controls__actions">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-ai-btn--primary dralo-ai-speaking-controls__start"
                  onClick={handleStart}
                  disabled={loading && loadingAction === 'start'}
                >
                  {loading && loadingAction === 'start'
                    ? 'Starting…'
                    : running
                      ? 'Restart mission'
                      : 'Start mission →'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <SpeakingExperienceBar
          missions={SPEAKING_MISSIONS}
          progress={missionProgress}
          level={level}
          sessionXp={running && started ? xp : 0}
        />

        <div className="dralo-ai-panel">
          <div
            className="dralo-ai-panel__head dralo-ai-speaking-head"
            style={{ '--mission-bg': getMissionBackground(headMission?.backgroundStyle) }}
          >
            <span className="dralo-ai-speaking-head__icon" aria-hidden>{headMission?.icon}</span>
            <div className="dralo-ai-speaking-head__text">
              <h2>{headMission?.title}</h2>
              <p>
                {headMission?.scenario}
                {running ? ` 
 · with ${headMission?.character}` : ''}
              </p>
            </div>
          </div>

          <div className="dralo-ai-panel__body dralo-ai-panel__body--coach">
            {view === 'complete' && mission ? (
              <MissionComplete
                mission={mission}
                report={report}
                objectives={objectives}
                completedObjectives={completedObjectives}
                onPractiseAgain={practiseAgain}
                onChooseAnother={resetToIdle}
              />
            ) : (
              <ConversationBody
                started={started}
                running={running}
                mission={mission}
                messages={messages}
                input={input}
                setInput={setInput}
                loading={loading}
                loadingAction={loadingAction}
                error={error}
                notice={notice}
                scores={scores}
                xp={xp}
                objectives={objectives}
                completedObjectives={completedObjectives}
                progress={progress}
                avatarState={displayAvatarState}
                xpToast={xpToast}
                chatRef={chatRef}
                isListening={isListening}
                sttSupported={sttSupported}
                onSend={handleSendAnswer}
                onFinish={handleFinish}
                onReset={resetToIdle}
                onKeyDown={handleKeyDown}
                onMic={isListening ? stopRecording : startRecording}
              />
            )}
          </div>
        </div>

        <p className="dralo-ai-coach-foot">
          For written feedback use <Link href="/dralo-ai/writing">Writing</Link>. For grammar
          questions try the <Link href="/dralo-ai/grammar-coach">Grammar Coach</Link>.
        </p>
      </div>
    </main>
  );
}

function ConversationBody({
  started,
  running,
  mission,
  messages,
  input,
  setInput,
  loading,
  loadingAction,
  error,
  notice,
  scores,
  xp,
  objectives,
  completedObjectives,
  progress,
  avatarState,
  xpToast,
  chatRef,
  isListening,
  sttSupported,
  onSend,
  onFinish,
  onReset,
  onKeyDown,
  onMic,
}) {
  const statusLabel =
    avatarState === 'listening'
      ? 'Listening…'
      : avatarState === 'thinking'
        ? 'Thinking…'
        : avatarState === 'happy'
          ? 'Great!'
          : 'Ready';

  return (
    <>
      {running && started ? (
        <div className="dralo-ai-speaking-hud">
          <div className="dralo-ai-speaking-hud__mascot-wrap">
            <SiteMascot
              variant={3}
              width={72}
              className="dralo-ai-speaking-hud__mascot"
              alt="Dralo"
            />
            {xpToast ? (
              <div className="dralo-ai-speaking-xp-toast" role="status">
                +{xpToast.amount} XP 
 · {xpToast.reason}
              </div>
            ) : null}
            <span className="dralo-ai-speaking-empty__title" style={{ fontSize: '0.72rem', marginTop: 4 }}>
              {statusLabel}
            </span>
          </div>

          <div className="dralo-ai-speaking-hud__main">
            <div>
              <div className="dralo-ai-speaking-hud__row">
                <span className="dralo-ai-speaking-section-label" style={{ margin: 0 }}>
                  Mission progress
                </span>
                <span className="dralo-ai-speaking-hud__pct">{progress}%</span>
              </div>
              <div className="dralo-ai-speaking-hud__bar">
                <span
                  className="dralo-ai-speaking-hud__bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="dralo-ai-speaking-hud__xp">
                <span>XP earned</span>
                <span className="dralo-ai-speaking-hud__xp-val">{xp}</span>
              </div>
            </div>

            <ul className="dralo-ai-speaking-chips">
              {objectives.map((o, i) => {
                const done = completedObjectives.includes(i);
                return (
                  <li
                    key={i}
                    className={`dralo-ai-speaking-chip${done ? ' is-done' : ''}`}
                  >
                    <span aria-hidden>{done ? '☑' : '☐'}</span> {o}
                  </li>
                );
              })}
            </ul>

            <div className="dralo-ai-speaking-mini-scores">
              {SCORE_META.map((s) => (
                <div key={s.key}>
                  <div className="dralo-ai-speaking-mini-score__top">
                    <span>{s.label}</span>
                    <span>{scores[s.key]}</span>
                  </div>
                  <div className="dralo-ai-speaking-mini-score__bar">
                    <span
                      className="dralo-ai-speaking-mini-score__fill"
                      style={{ width: `${scores[s.key]}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="dralo-ai-coach-chat" ref={chatRef} role="log" aria-live="polite">
        {!started && !loading ? (
          <div className="dralo-ai-speaking-empty">
            <SiteMascot
              variant={3}
              width={96}
              className="dralo-ai-speaking-empty__mascot"
              alt="Dralo coach"
            />
            <p className="dralo-ai-speaking-empty__title">Ready when you are!</p>
            <p className="dralo-ai-speaking-empty__text">
              Choose a topic above, set your role and the conversation type, then press{' '}
              <strong>Start mission</strong>. You can type or use the microphone to speak.
            </p>
          </div>
        ) : null}

        {messages.map((m, i) =>
          m.role === 'coach' ? (
            <div key={i}>
              <div className="dralo-ai-coach-bubble dralo-ai-coach-bubble--assistant">
                <span className="dralo-ai-coach-bubble__label">
                  {mission?.character || 'Dralo'}
                </span>
                <div className="dralo-ai-coach-bubble__text">{m.text}</div>
              </div>
              {hasQuickTip(m.quickTip) ? <QuickTip tip={m.quickTip} /> : null}
            </div>
          ) : (
            <div key={i} className="dralo-ai-coach-bubble dralo-ai-coach-bubble--user">
              <span className="dralo-ai-coach-bubble__label">You</span>
              <div className="dralo-ai-coach-bubble__text">{m.text}</div>
            </div>
          ),
        )}

        {loading && loadingAction !== 'finish' ? (
          <div className="dralo-ai-loading">
            <span>Dralo is thinking</span>
            <span className="dralo-ai-loading__dots" aria-hidden>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : null}
      </div>

      {notice ? (
        <div className="dralo-ai-feedback" role="status">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="dralo-ai-feedback dralo-ai-feedback--bad" role="alert">
          {error}
        </div>
      ) : null}

      <form
        className="dralo-ai-coach-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <textarea
          className="dralo-ai-input dralo-ai-coach-input"
          rows={2}
          placeholder={
            !started
              ? 'Press "Start mission" to begin…'
              : isListening
                ? 'Listening… speak now'
                : 'Type your answer in English…'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading || !started}
          aria-label="Your answer"
        />
        <div className="dralo-ai-coach-form__actions">
          <button
            type="button"
            className={`dralo-ai-btn dralo-ai-btn--listen${isListening ? ' dralo-ai-btn--mic-active' : ''}`}
            title={
              !sttSupported
                ? 'Speech recognition needs Chrome or Edge'
                : isListening
                  ? 'Stop recording'
                  : 'Speak your answer'
            }
            onClick={onMic}
            disabled={loading || !sttSupported || !started}
            aria-pressed={isListening}
          >
            {isListening ? '⏹ Stop' : '🎤 Speak'}
          </button>
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--primary"
            onClick={() => onSend()}
            disabled={loading || !started}
            aria-busy={loading && loadingAction === 'send'}
          >
            {loading && loadingAction === 'send' ? 'Sending…' : 'Send answer'}
          </button>
          <button
            type="button"
            className="dralo-ai-btn dralo-ai-btn--accent"
            onClick={onFinish}
            disabled={loading || !started}
            aria-busy={loading && loadingAction === 'finish'}
          >
            {loading && loadingAction === 'finish' ? 'Scoring…' : 'Finish mission'}
          </button>
          {running ? (
            <button
              type="button"
              className="dralo-ai-btn dralo-ai-btn--ghost"
              onClick={onReset}
              disabled={loading}
            >
              Reset
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}

function QuickTip({ tip }) {
  return (
    <div className="dralo-ai-speaking-tip">
      <span className="dralo-ai-speaking-tip__head">💡 Quick Tip</span>
      {tip.original ? (
        <div className="dralo-ai-speaking-tip__row">
          <dt>Original</dt>
          <dd className="dralo-ai-speaking-tip__original">{tip.original}</dd>
        </div>
      ) : null}
      {tip.better ? (
        <div className="dralo-ai-speaking-tip__row">
          <dt>Better</dt>
          <dd className="dralo-ai-speaking-tip__better">{tip.better}</dd>
        </div>
      ) : null}
      {tip.why ? (
        <div className="dralo-ai-speaking-tip__row">
          <dt>Why</dt>
          <dd>{tip.why}</dd>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Mission complete                                                 */
/* ---------------------------------------------------------------- */

function MissionComplete({
  mission,
  report,
  objectives,
  completedObjectives,
  onPractiseAgain,
  onChooseAnother,
}) {
  const r = report || {};
  const stars = Math.max(1, Math.min(3, Number(r.stars) || 1));
  const totalXp = Number(r.totalXp) || Number(r.xpEarned) || 0;
  const completed = Array.isArray(r.completedObjectives) && r.completedObjectives.length
    ? r.completedObjectives
    : completedObjectives;

  return (
    <div className="dralo-ai-speaking-complete">
      <div
        className="dralo-ai-speaking-complete__hero"
        style={{ '--mission-bg': getMissionBackground(mission.backgroundStyle) }}
      >
        <span aria-hidden="true" style={{ fontSize: '2.5rem' }}>{mission.icon}</span>
        <p style={{ margin: '8px 0 0', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.9 }}>
          Mission complete
        </p>
        <h1 className="dralo-ai-speaking-complete__title">MISSION COMPLETE</h1>
        <div aria-label={`${stars} out of 3 stars`} style={{ margin: '12px 0', fontSize: '2rem' }}>
          {[1, 2, 3].map((n) => (
            <span key={n} style={{ color: n <= stars ? '#fde047' : 'rgba(255,255,255,0.35)' }} aria-hidden>
              ★
            </span>
          ))}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>+{totalXp} XP</div>
        {r.overallFeedback ? (
          <p style={{ margin: '14px auto 0', maxWidth: '520px', lineHeight: 1.5 }}>{r.overallFeedback}</p>
        ) : null}
      </div>

      <div className="dralo-ai-speaking-complete__grid">
        <div className="dralo-ai-speaking-complete__card">
          <h3 className="dralo-ai-speaking-section-label">Your scores</h3>
          <div className="dralo-ai-speaking-complete__scores">
            {SCORE_META.map((s) => (
              <div key={s.key} className="dralo-ai-speaking-complete__score">
                <span className="dralo-ai-speaking-complete__score-num" style={{ color: s.color }}>
                  {r.scores?.[s.key] ?? 0}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dralo-ai-speaking-complete__card">
          <h3 className="dralo-ai-speaking-section-label">Objectives completed</h3>
          <ul className="dralo-ai-speaking-goals">
            {objectives.map((o, i) => {
              const done = completed.includes(i);
              return (
                <li key={i} className={`dralo-ai-speaking-goal${done ? ' is-done' : ''}`}>
                  <span aria-hidden>{done ? '☑' : '☐'}</span> {o}
                </li>
              );
            })}
          </ul>
        </div>

        {Array.isArray(r.usefulExpressions) && r.usefulExpressions.length ? (
          <div className="dralo-ai-speaking-complete__card">
            <h3 className="dralo-ai-speaking-section-label">New useful expressions</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
              {r.usefulExpressions.map((e, i) => (
                <li key={i}>&ldquo;{e}&rdquo;</li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasQuickTip(r.mainCorrection) ? (
          <div className="dralo-ai-speaking-complete__card">
            <h3 className="dralo-ai-speaking-section-label">Main correction</h3>
            <QuickTip tip={r.mainCorrection} />
          </div>
        ) : null}
      </div>

      {r.nextMissionRecommendation ? (
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 14,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #eef2ff, #fae8ff)',
          }}
        >
          <span aria-hidden>🚀</span>
          <div>
            <span className="dralo-ai-speaking-section-label" style={{ color: '#7c3aed' }}>
              Next recommended mission
            </span>
            <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{r.nextMissionRecommendation}</p>
          </div>
        </div>
      ) : null}

      <div className="dralo-ai-speaking-complete__actions">
        <button type="button" className="dralo-ai-btn dralo-ai-btn--primary" onClick={onPractiseAgain}>
          Practise again
        </button>
        <button type="button" className="dralo-ai-btn dralo-ai-btn--ghost" onClick={onChooseAnother}>
          Choose another mission
        </button>
      </div>
    </div>
  );
}

