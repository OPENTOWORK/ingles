'use client';

import { useCallback, useEffect, useState } from 'react';
import { staffTasksFetch } from '@/lib/staffTasksClient';
import { formatStaffDateTimeLabel } from '@/lib/staffTaskHelpers';
import styles from './StaffTaskConversation.module.css';

export default function StaffTaskConversation({ taskId, taskEstado }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await staffTasksFetch(
        `/api/coordinator/tasks/${encodeURIComponent(taskId)}/messages?marcarLeido=1`,
        {},
        { soft: true },
      );
      if (data.error) {
        setError(data.error || 'No se pudo cargar la conversación.');
        return;
      }
      setOpen(Boolean(data.open));
      setMessages(data.messages || []);
      setUnreadCount(0);
      setError('');
    } catch {
      setError('No se pudo cargar la conversación.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load, taskEstado]);

  useEffect(() => {
    if (!taskId || !open) return undefined;
    const timer = setInterval(() => {
      void load();
    }, 30000);
    return () => clearInterval(timer);
  }, [taskId, open, load]);

  async function handleSend(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending || !open) return;

    setSending(true);
    setError('');
    try {
      const data = await staffTasksFetch(
        `/api/coordinator/tasks/${encodeURIComponent(taskId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body }),
        },
        { soft: true },
      );
      if (data.error) {
        setError(data.error || 'No se pudo enviar el mensaje.');
        return;
      }
      setDraft('');
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        await load();
      }
    } catch {
      setError('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h5 className={styles.title}>Conversación</h5>
        {unreadCount > 0 ? <span className={styles.badge}>{unreadCount} nuevo(s)</span> : null}
      </div>

      {loading ? <p className={styles.loading}>Cargando mensajes…</p> : null}

      {!loading && !open ? (
        <p className={styles.closed}>
          Esta conversación está cerrada porque la tarea está{' '}
          {taskEstado === 'cancelada' ? 'cancelada' : 'completada'}. Puedes leer el historial pero
          ya no se pueden enviar más mensajes.
        </p>
      ) : null}

      <div className={styles.thread} aria-live="polite">
        {!loading && messages.length === 0 ? (
          <p className={styles.empty}>
            Todavía no hay mensajes. Escribe aquí para hablar con el equipo sobre esta tarea.
          </p>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.bubble} ${message.isMine ? styles.bubbleMine : styles.bubbleOther}`}
          >
            <span className={styles.meta}>
              {message.isMine ? 'Tú' : message.sender?.nombre || 'Equipo'} ·{' '}
              {formatStaffDateTimeLabel(message.created_at)}
            </span>
            {message.body}
          </div>
        ))}
      </div>

      {open ? (
        <form className={styles.composer} onSubmit={handleSend}>
          <textarea
            className={styles.textarea}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe tu mensaje… Los involucrados recibirán un correo."
            maxLength={4000}
            disabled={sending}
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button type="submit" className={styles.sendBtn} disabled={sending || !draft.trim()}>
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
