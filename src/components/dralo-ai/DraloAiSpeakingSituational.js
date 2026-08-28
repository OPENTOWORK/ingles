'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';
import { DRALO_AI_SITUATIONAL } from '@/data/draloAiSituationalConfig';
import { sendToGemini, speakText, stopSpeaking } from '../../../dralo-speaking/lib/gemini-coach';
import { useSpeechRecognition } from '../../../dralo-speaking/lib/useSpeechRecognition';

const config = DRALO_AI_MODES.speaking;
const situational = DRALO_AI_SITUATIONAL.speaking;

function withBase(path) {
  const b =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
      ? String(process.env.NEXT_PUBLIC_BASE_PATH).replace(/\/$/, '')
      : '';
  return b ? `${b}${path}` : path;
}

export default function DraloAiSpeakingSituational() {
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const [scenarioId, setScenarioId] = useState(situational.scenarios[0]?.id || '');
  const [customSituation, setCustomSituation] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const scenario = useMemo(
    () => situational.scenarios.find((s) => s.id === scenarioId) || situational.scenarios[0],
    [scenarioId],
  );

  const resetChat = useCallback(() => {
    stopSpeaking();
    setMessages([]);
    setError('');
    startedRef.current = false;
  }, []);

  useEffect(() => {
    resetChat();
  }, [scenarioId, level, resetChat]);

  const startScenario = useCallback(async () => {
    resetChat();
    if (scenarioId === 'custom' && !customSituation.trim()) {
      setError('Describe the situation you want to practise.');
      return;
    }
    const starter =
      scenarioId === 'custom'
        ? 'Hi! Tell me more about the situation you want to practise, and I will start the role play.'
        : scenario?.starter || 'Hello! Let us begin.';
    const first = { role: 'ai', text: starter };
    setMessages([first]);
    startedRef.current = true;
    setIsSpeaking(true);
    try {
      await speakText(starter, { onEnd: () => setIsSpeaking(false) });
    } catch {
      setIsSpeaking(false);
    }
  }, [scenario, scenarioId, customSituation, resetChat]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || busy) return;

      setBusy(true);
      setError('');
      const userMsg = { role: 'user', text: trimmed };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role === 'ai' ? 'ai' : 'user',
          text: m.text,
        }));

        const res = await sendToGemini({
          userMessage: trimmed,
          level,
          mode: 'roleplay',
          conversationHistory: history.slice(0, -1),
          scenarioPrompt: scenarioId !== 'custom' ? scenario?.prompt : undefined,
          customSituation: scenarioId === 'custom' ? customSituation : undefined,
        });

        const reply = res?.text || 'Could you say that again?';
        const aiMsg = { role: 'ai', text: reply };
        setMessages((prev) => [...prev, aiMsg]);
        setIsSpeaking(true);
        await speakText(reply, { onEnd: () => setIsSpeaking(false) });
      } catch (e) {
        setError(e.message || 'Could not connect to the coach.');
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, level, scenario, scenarioId, customSituation],
  );

  const { isListening, startListening, stopListening, isSupported: sttSupported } =
    useSpeechRecognition({
      onResult: (transcript) => {
        if (transcript?.trim()) sendMessage(transcript);
      },
    });

  return (
    <main className="dralo-ai-page" style={{ '--dralo-accent-solid': '#e11d48' }}>
      <div className="dralo-ai-studio__toolbar dralo-ai-studio__toolbar--under-xp">
        <Link href="/dralo-ai" className="dralo-ai-back-link">
          ← Dralo AI
        </Link>
        <DraloAiLevelFilter levels={config.levels} selectedLevel={level} onChange={setLevel} />
      </div>

      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <span>Speaking</span>
        </nav>
      </div>

      <PageHero
        eyebrow="Dralo AI · Role play"
        title={situational.title}
        description={situational.description}
        accent="rose"
        mascotVariant={5}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-activities" role="tablist" aria-label="Scenarios">
          {situational.scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={scenarioId === s.id}
              className={`dralo-ai-activity${scenarioId === s.id ? ' is-active' : ''}`}
              onClick={() => setScenarioId(s.id)}
            >
              <span aria-hidden>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {scenarioId === 'custom' && (
          <div className="dralo-ai-panel" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="custom-situation">
              Describe your situation
            </label>
            <textarea
              id="custom-situation"
              className="form-input"
              rows={3}
              value={customSituation}
              onChange={(e) => setCustomSituation(e.target.value)}
              placeholder="e.g. I am travelling to Canada. Help me practise a day at the airport, including passport control…"
            />
          </div>
        )}

        <div className="dralo-ai-roleplay">
          <div className="dralo-ai-roleplay__coach">
            <div
              className={`dralo-ai-roleplay__avatar${isSpeaking ? ' is-speaking' : ''}${
                busy ? ' is-thinking' : ''
              }`}
            >
              <img
                src={withBase(busy ? '/dralo-thinking.png' : '/dralo-coach.png')}
                alt={busy ? 'Dralo thinking' : 'Dralo coach'}
                width={120}
                height={120}
              />
            </div>
            <p className="dralo-ai-roleplay__status">
              {busy ? 'Thinking…' : isSpeaking ? 'Speaking…' : isListening ? 'Listening…' : 'Ready'}
            </p>
            {!startedRef.current && (
              <button type="button" className="btn btn-primary" onClick={startScenario}>
                Start role play
              </button>
            )}
          </div>

          <div className="dralo-ai-roleplay__chat">
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`dralo-ai-roleplay__bubble dralo-ai-roleplay__bubble--${m.role}`}
              >
                {m.text}
              </div>
            ))}
            {error && <p className="dralo-ai-error">{error}</p>}
          </div>

          {startedRef.current && (
            <div className="dralo-ai-roleplay__controls">
              <input
                type="text"
                className="form-input"
                placeholder="Type in English or use the microphone…"
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              {sttSupported && (
                <button
                  type="button"
                  className={`btn${isListening ? ' btn-primary' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={busy}
                >
                  {isListening ? '⏹ Stop' : '🎤 Speak'}
                </button>
              )}
              <button type="button" className="btn" onClick={resetChat}>
                Restart
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
