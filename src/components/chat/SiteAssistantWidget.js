'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SiteMascot from '@/components/SiteMascot';
import './site-assistant.css';

const WELCOME =
  '¡Hola! Soy el asistente de Dralo. Pregúntame cómo usar la web: dónde practicar, niveles, teoría, tu cuenta o soporte.';

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

const SUGGESTIONS = [
  '¿Cómo empiezo a practicar?',
  '¿Dónde está el test de nivel?',
  '¿Cómo contacto con soporte?',
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
        throw new Error(data.error || 'No se pudo obtener respuesta.');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Error de conexión.',
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
          aria-label="Asistente de ayuda Dralo"
        >
          <div className="site-assistant-header">
            <SiteMascot variant={3} width={48} alt="" className="site-assistant-header__mascot" />
            <div>
              <h2>Asistente Dralo</h2>
              <p>Ayuda sobre la web</p>
            </div>
          </div>
          <div ref={listRef} className="site-assistant-messages">
            {messages.map((msg, i) => (
              <div
                key={`${i}-${msg.role}`}
                className={`site-assistant-msg site-assistant-msg--${
                  msg.isError ? 'error' : msg.role === 'user' ? 'user' : 'bot'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="site-assistant-typing">Escribiendo…</div>}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200"
                  >
                    {s}
                  </button>
                ))}
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
              placeholder="Escribe tu duda…"
              disabled={loading}
              maxLength={2000}
              aria-label="Mensaje para el asistente"
            />
            <button
              type="submit"
              className="site-assistant-send"
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 pb-2 px-2">
            ¿Problema técnico?{' '}
            <Link href="/contacto" className="text-indigo-600 hover:underline">
              Contacto
            </Link>
          </p>
        </div>
      )}

      <button
        type="button"
        className={`site-assistant-fab${open ? ' is-open' : ''}`}
        onClick={handleToggle}
        aria-expanded={open}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de ayuda'}
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
