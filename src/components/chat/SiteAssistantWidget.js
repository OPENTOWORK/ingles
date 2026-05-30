'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import './site-assistant.css';

const WELCOME =
  'Hi! I\'m the Dralo assistant. Ask me how to use the site — where to practise, levels, theory, your account, or support. Pick a topic below or type your question.';

const DISMISS_STORAGE_KEY = 'dralo_assistant_dismissed';

function isAssistantDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markAssistantDismissed() {
  try {
    sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearAssistantDismissed() {
  try {
    sessionStorage.removeItem(DISMISS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const STARTER_TOPICS = [
  {
    id: 'practice',
    label: 'How do I start practising?',
    hint: 'Levels, skills and exam mode',
    question: 'How do I start practising on the site?',
  },
  {
    id: 'placement',
    label: 'Where is the placement test?',
    hint: 'Find your CEFR starting level',
    question: 'Where is the placement test?',
  },
  {
    id: 'support',
    label: 'How do I contact support?',
    hint: 'Help, account and technical issues',
    question: 'How do I contact support?',
  },
];

export default function SiteAssistantWidget({ defaultOpen = true } = {}) {
  const [open, setOpen] = useState(() =>
    defaultOpen ? !isAssistantDismissed() : false,
  );
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.filter(
        (m) => m.role === 'user' || m.role === 'assistant',
      );
      const res = await fetch('/api/site-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not get a response.');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Connection error.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleToggle = () => {
    setOpen((value) => {
      if (value) {
        markAssistantDismissed();
        return false;
      }
      return true;
    });
  };

  return (
    <>
      {open && (
        <div
          className="site-assistant-panel"
          role="dialog"
          aria-label="Dralo help assistant"
        >
          <div className="site-assistant-header">
            <SiteMascot variant={3} width={48} alt="" className="site-assistant-header__mascot" />
            <div>
              <h2>Dralo assistant</h2>
              <p>Help using the site</p>
            </div>
          </div>
          <div ref={listRef} className="site-assistant-messages">
            {messages.map((msg, i) => {
              const isIntro =
                i === 0 && msg.role === 'assistant' && !msg.isError && messages.length === 1;
              return (
                <div
                  key={`${i}-${msg.role}`}
                  className={`site-assistant-msg site-assistant-msg--${
                    msg.isError ? 'error' : msg.role === 'user' ? 'user' : 'bot'
                  }${isIntro ? ' site-assistant-msg--intro' : ''}`}
                >
                  {msg.content}
                </div>
              );
            })}
            {loading && <div className="site-assistant-typing">Typing…</div>}
            {messages.length === 1 && !loading && (
              <div className="site-assistant-starters">
                <p className="site-assistant-starters__title">Quick topics</p>
                <ul className="site-assistant-starters__list" role="list">
                  {STARTER_TOPICS.map((topic) => (
                    <li key={topic.id}>
                      <button
                        type="button"
                        className="site-assistant-starters__item"
                        onClick={() => sendMessage(topic.question)}
                      >
                        <span className="site-assistant-starters__label">{topic.label}</span>
                        <span className="site-assistant-starters__hint">{topic.hint}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <form className="site-assistant-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="site-assistant-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your question…"
              disabled={loading}
              maxLength={2000}
              aria-label="Message for the assistant"
            />
            <button
              type="submit"
              className="site-assistant-send"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 pb-2 px-2">
            Technical issue?{' '}
            <Link href="/contacto" className="text-indigo-600 hover:underline">
              Contact
            </Link>
          </p>
        </div>
      )}

      <button
        type="button"
        className={`site-assistant-fab${open ? ' is-open' : ''}`}
        onClick={handleToggle}
        aria-expanded={open}
        aria-label={open ? 'Close assistant' : 'Open help assistant'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <SiteMascot variant={3} width={44} alt="" className="site-assistant-fab__mascot" />
        )}
      </button>
    </>
  );
}
