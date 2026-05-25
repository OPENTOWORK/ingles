'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';

const ACCENT_SOLID = {
  lime: '#65a30d',
};

function welcomeMessage(level) {
  return `Hi! I'm your Grammar Coach at ${level} level. Ask about tenses, conditionals, passive voice, word order, or paste a sentence you want explained. I'll answer in clear English with examples.`;
}

function formatMessageContent(content) {
  const text = String(content || '');
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function DraloAiGrammarCoach({ config }) {
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const [topicId, setTopicId] = useState(config.activities[0]?.id || '');
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: welcomeMessage(config.defaultLevel || 'B2') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const activity = useMemo(
    () => config.activities.find((a) => a.id === topicId) || config.activities[0],
    [config.activities, topicId],
  );

  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.lime;

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const resetChat = useCallback(
    (newLevel) => {
      const L = newLevel || level;
      setMessages([{ role: 'assistant', content: welcomeMessage(L) }]);
      setInput('');
      setError('');
    },
    [level],
  );

  useEffect(() => {
    resetChat(level);
  }, [level, resetChat]);

  const sendMessage = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant');
      const res = await fetch('/api/dralo-ai/grammar-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, level }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setError(e.message || 'Could not get a response.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: e.message || 'Connection error. Please try again.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleTopicClick = (a) => {
    setTopicId(a.id);
    if (a.starterQuestion) sendMessage(a.starterQuestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <main className="dralo-ai-page" style={{ '--dralo-accent-solid': accentSolid }}>
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
          { value: String(config.activities.length), label: 'Topics' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-studio__toolbar">
          <span className="dralo-ai-studio__badge">✨ Dralo AI</span>
          <DraloAiLevelFilter levels={config.levels} selectedLevel={level} onChange={setLevel} />
        </div>

        <div className="dralo-ai-activities" role="tablist" aria-label="Grammar topics">
          {config.activities.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={topicId === a.id}
              className={`dralo-ai-activity${topicId === a.id ? ' is-active' : ''}`}
              onClick={() => handleTopicClick(a)}
              disabled={loading}
              title={a.hint}
            >
              <span aria-hidden>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        <div className="dralo-ai-panel">
          <div className="dralo-ai-panel__head">
            <h2>
              {activity?.icon} {activity?.label}
            </h2>
            <p>{activity?.hint}</p>
          </div>
          <div className="dralo-ai-panel__body dralo-ai-panel__body--coach">
            {error ? (
              <div className="dralo-ai-feedback dralo-ai-feedback--bad" role="alert">
                {error}
              </div>
            ) : null}

            <div className="dralo-ai-coach-chat" ref={listRef} role="log" aria-live="polite">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`dralo-ai-coach-bubble dralo-ai-coach-bubble--${m.role}${
                    m.isError ? ' dralo-ai-coach-bubble--error' : ''
                  }`}
                >
                  <span className="dralo-ai-coach-bubble__label">
                    {m.role === 'user' ? 'You' : 'Dralo'}
                  </span>
                  <div className="dralo-ai-coach-bubble__text">{formatMessageContent(m.content)}</div>
                </div>
              ))}
              {loading ? (
                <div className="dralo-ai-coach-bubble dralo-ai-coach-bubble--assistant">
                  <span className="dralo-ai-coach-bubble__label">Dralo</span>
                  <div className="dralo-ai-loading">
                    <span>Dralo is thinking</span>
                    <span className="dralo-ai-loading__dots" aria-hidden>
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <form className="dralo-ai-coach-form" onSubmit={handleSubmit}>
              <textarea
                ref={inputRef}
                className="dralo-ai-input dralo-ai-coach-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a grammar question or paste a sentence…"
                rows={2}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="dralo-ai-coach-form__actions">
                <button
                  type="button"
                  className="dralo-ai-btn dralo-ai-btn--ghost"
                  onClick={() => resetChat(level)}
                  disabled={loading}
                >
                  🔄 New chat
                </button>
                <button
                  type="submit"
                  className="dralo-ai-btn dralo-ai-btn--primary"
                  disabled={loading || !input.trim()}
                >
                  Ask Dralo
                </button>
              </div>
            </form>

            <p className="dralo-ai-coach-foot">
              For long writing correction use{' '}
              <Link href="/dralo-ai/writing">Writing</Link>. For rules and exercises see{' '}
              <Link href="/teoria">Theory</Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
