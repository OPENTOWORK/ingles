'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { formatActiveDuration, formatTicketDateTime } from '@/lib/supportTicketParse';
import { TICKET_STATUS } from '@/utils/contactModuleConfig';

async function apiFetch(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sesión expirada');

  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la petición');
  return data;
}

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: TICKET_STATUS.UNANSWERED, label: 'Pendientes' },
  { id: TICKET_STATUS.ANSWERED, label: 'Respondidos' },
  { id: TICKET_STATUS.CLOSED, label: 'Resueltos' },
];

export default function SupportTicketsPanel() {
  const [tickets, setTickets] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      const q = filter === 'todos' ? '' : `?estado=${encodeURIComponent(filter)}`;
      const data = await apiFetch(`/api/support/tickets${q}`);
      setTickets(data.tickets || []);
      setPendingCount(data.pendingCount ?? 0);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const data = await apiFetch(`/api/support/tickets/${id}`);
      setDetail(data.ticket);
      setMessages(data.messages || []);
    } catch (e) {
      toast.error(e.message);
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTickets();
      if (selectedId) loadDetail(selectedId);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadTickets, loadDetail, selectedId]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else {
      setDetail(null);
      setMessages([]);
    }
  }, [selectedId, loadDetail]);

  const selectTicket = (id) => {
    setSelectedId(id);
    setReply('');
  };

  const patchStatus = async (estado) => {
    if (!selectedId) return;
    try {
      await apiFetch(`/api/support/tickets/${selectedId}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      toast.success('Estado actualizado');
      await loadTickets();
      await loadDetail(selectedId);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteTicket = async () => {
    if (!selectedId) return;
    if (!window.confirm('¿Borrar este ticket y sus mensajes?')) return;
    try {
      await apiFetch(`/api/support/tickets/${selectedId}`, { method: 'DELETE' });
      toast.success('Ticket eliminado');
      setSelectedId(null);
      await loadTickets();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const sendReply = async (markResolved = false) => {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      const data = await apiFetch(`/api/support/tickets/${selectedId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: reply.trim(), markResolved }),
      });
      if (data.emailSent) {
        toast.success(data.message);
      } else {
        toast.success('Guardado en la plataforma');
        toast.error(data.emailError || 'No se envió el correo al usuario');
      }
      setReply('');
      await loadTickets();
      await loadDetail(selectedId);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="support-panel">
      <header className="support-panel__header">
        <div>
          <h1 className="support-panel__title">Panel de Soporte</h1>
          <p className="support-panel__subtitle">
            Gestiona tickets de la plataforma. Responde desde aquí para que el usuario reciba el
            correo.
          </p>
        </div>
        {pendingCount > 0 ? (
          <span className="support-panel__badge" title="Tickets pendientes">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        ) : null}
      </header>

      <div className="support-panel__filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`support-filter${filter === f.id ? ' support-filter--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <button type="button" className="support-filter support-filter--ghost" onClick={loadTickets}>
          Actualizar
        </button>
      </div>

      <div className="support-panel__grid">
        <section className="support-list">
          {loading ? (
            <p className="support-muted">Cargando tickets…</p>
          ) : tickets.length === 0 ? (
            <p className="support-muted">No hay tickets con este filtro.</p>
          ) : (
            <ul className="support-list__items">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`support-ticket-row${selectedId === t.id ? ' is-selected' : ''}${
                      t.estado === TICKET_STATUS.UNANSWERED || t.estado === TICKET_STATUS.OPEN
                        ? ' is-pending'
                        : ''
                    }`}
                    onClick={() => selectTicket(t.id)}
                  >
                    <span className="support-ticket-row__subject">{t.asunto}</span>
                    <span className="support-ticket-row__meta">
                      {t.solicitante_nombre || 'Usuario'} · {t.solicitante_email}
                    </span>
                    <span className="support-ticket-row__footer">
                      <span className={`support-status support-status--${statusClass(t.estado)}`}>
                        {t.estado}
                      </span>
                      <span>{formatActiveDuration(t.creado_en, t.cerrado_en)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="support-detail">
          {!selectedId ? (
            <p className="support-muted support-detail__empty">
              Selecciona un ticket para ver el detalle y responder.
            </p>
          ) : detailLoading || !detail ? (
            <p className="support-muted">Cargando detalle…</p>
          ) : (
            <>
              <div className="support-detail__head">
                <h2>{detail.asunto}</h2>
                <p>
                  <strong>{detail.solicitante_nombre}</strong> ·{' '}
                  <a href={`mailto:${detail.solicitante_email}`}>{detail.solicitante_email}</a>
                </p>
                <p className="support-muted">
                  Creado: {formatTicketDateTime(detail.creado_en)}{' '}
                  · Activo: {formatActiveDuration(detail.creado_en, detail.cerrado_en)}
                </p>
              </div>

              <div className="support-detail__actions">
                <button type="button" onClick={() => patchStatus('pendiente')}>
                  Pendiente
                </button>
                <button type="button" onClick={() => patchStatus('respondido')}>
                  Respondido
                </button>
                <button type="button" onClick={() => patchStatus('resuelto')}>
                  Resuelto
                </button>
                <button type="button" className="danger" onClick={deleteTicket}>
                  Borrar
                </button>
              </div>

              <div className="support-thread">
                <div className="support-msg support-msg--user">
                  <strong>Mensaje inicial</strong>
                  <p>{detail.mensaje_inicial || detail.descripcion}</p>
                </div>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`support-msg ${
                      m.tipo_mensaje === 'respuesta_soporte'
                        ? 'support-msg--staff'
                        : 'support-msg--user'
                    }`}
                  >
                    <strong>
                      {m.tipo_mensaje === 'respuesta_soporte' ? 'Soporte' : 'Usuario'}
                      {m.enviado_en
                        ? ` · ${formatTicketDateTime(m.enviado_en)}`
                        : ''}
                    </strong>
                    <p>{m.mensaje}</p>
                  </div>
                ))}
              </div>

              <div className="support-reply">
                <label htmlFor="support-reply-text">Responder por email al usuario</label>
                <textarea
                  id="support-reply-text"
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escribe tu respuesta…"
                />
                <div className="support-reply__buttons">
                  <button
                    type="button"
                    className="primary"
                    disabled={sending || !reply.trim()}
                    onClick={() => sendReply(false)}
                  >
                    {sending ? 'Enviando…' : 'Enviar respuesta'}
                  </button>
                  <button
                    type="button"
                    disabled={sending || !reply.trim()}
                    onClick={() => sendReply(true)}
                  >
                    Enviar y marcar resuelto
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .support-panel__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .support-panel__title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.35rem;
        }
        .support-panel__subtitle {
          margin: 0;
          color: #555;
          max-width: 42rem;
          line-height: 1.5;
        }
        .support-panel__badge {
          background: #dc2626;
          color: #fff;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          white-space: nowrap;
        }
        .support-panel__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .support-filter {
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .support-filter--active {
          background: #0070f3;
          color: #fff;
          border-color: #0070f3;
        }
        .support-filter--ghost {
          margin-left: auto;
        }
        .support-panel__grid {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .support-panel__grid {
            grid-template-columns: 1fr;
          }
        }
        .support-list,
        .support-detail {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          min-height: 420px;
        }
        .support-list__items {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .support-ticket-row {
          width: 100%;
          text-align: left;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: #fafafa;
          cursor: pointer;
        }
        .support-ticket-row.is-selected {
          border-color: #0070f3;
          background: #eff6ff;
        }
        .support-ticket-row.is-pending {
          border-left: 3px solid #f59e0b;
        }
        .support-ticket-row__subject {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .support-ticket-row__meta,
        .support-ticket-row__footer {
          display: block;
          font-size: 0.8rem;
          color: #666;
        }
        .support-ticket-row__footer {
          margin-top: 0.35rem;
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .support-status {
          font-weight: 600;
        }
        .support-status--sin-responder,
        .support-status--abierto {
          color: #b45309;
        }
        .support-status--respondido {
          color: #0070f3;
        }
        .support-status--cerrado {
          color: #15803d;
        }
        .support-muted {
          color: #888;
        }
        .support-detail__empty {
          margin-top: 2rem;
          text-align: center;
        }
        .support-detail__head h2 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }
        .support-detail__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .support-detail__actions button {
          border: 1px solid #ccc;
          background: #f9fafb;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .support-detail__actions button.danger {
          color: #b91c1c;
          border-color: #fecaca;
          background: #fef2f2;
        }
        .support-thread {
          max-height: 220px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }
        .support-msg {
          padding: 0.65rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .support-msg--user {
          background: #f3f4f6;
        }
        .support-msg--staff {
          background: #dbeafe;
        }
        .support-msg p {
          margin: 0.35rem 0 0;
          white-space: pre-wrap;
        }
        .support-reply label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.35rem;
        }
        .support-reply textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.65rem;
          font-family: inherit;
          resize: vertical;
        }
        .support-reply__buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.65rem;
        }
        .support-reply__buttons .primary {
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .support-reply__buttons button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function statusClass(estado) {
  return String(estado || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
