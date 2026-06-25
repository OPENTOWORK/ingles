'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import {
  buildConversationSummaries,
  filterThreadMessages,
  formatBuzonTime,
  getDisplayName,
  getStaffRoleLabel,
  isStaffBuzonRole,
} from '@/utils/staffBuzon';
import styles from './StaffBuzonPanel.module.css';

function extractRoleName(userRow) {
  const embedded = userRow?.Usuarios_y_Perfil_roles;
  if (Array.isArray(embedded)) return embedded[0]?.nombre || '';
  return embedded?.nombre || '';
}

async function buzonApiRequest(path, { method = 'GET', body, token }) {
  const response = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo completar la operación.');
  }
  return payload;
}

export default function StaffBuzonPanel({ currentUserId }) {
  const [staffUsers, setStaffUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const threadEndRef = useRef(null);

  const staffById = useMemo(() => {
    const map = new Map();
    staffUsers.forEach((user) => map.set(user.id, user));
    return map;
  }, [staffUsers]);

  const conversations = useMemo(
    () => buildConversationSummaries(messages, currentUserId),
    [messages, currentUserId],
  );

  const threadMessages = useMemo(
    () => filterThreadMessages(messages, currentUserId, selectedPartnerId),
    [messages, currentUserId, selectedPartnerId],
  );

  const selectedPartner = selectedPartnerId ? staffById.get(selectedPartnerId) : null;

  const visibleContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = staffUsers
      .filter((user) => user.id !== currentUserId)
      .filter((user) => {
        if (!query) return true;
        const name = getDisplayName(user).toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const role = getStaffRoleLabel(extractRoleName(user)).toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query);
      });

    return filtered.sort((a, b) => {
      const convA = conversations.find((item) => item.partnerId === a.id);
      const convB = conversations.find((item) => item.partnerId === b.id);
      if (convA && convB) {
        return new Date(convB.lastMessage.created_at) - new Date(convA.lastMessage.created_at);
      }
      if (convA) return -1;
      if (convB) return 1;
      return getDisplayName(a).localeCompare(getDisplayName(b), 'es');
    });
  }, [staffUsers, currentUserId, search, conversations]);

  const loadStaffUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('Usuarios_y_Perfil_users')
      .select('id, nombre, email, activo, Usuarios_y_Perfil_roles ( nombre )')
      .eq('activo', true);

    if (error) throw error;

    const filtered = (data || []).filter((row) => isStaffBuzonRole(extractRoleName(row)));
    setStaffUsers(filtered);
  }, []);

  const loadMessages = useCallback(async () => {
    const { session } = await getClientAuth();
    if (!session?.access_token) {
      throw new Error('Sesión no válida.');
    }

    const payload = await buzonApiRequest('/api/buzon/messages', {
      token: session.access_token,
    });
    setMessages(payload.messages || []);
  }, []);

  const markThreadAsRead = useCallback(async (partnerId) => {
    if (!partnerId) return;

    try {
      const { session } = await getClientAuth();
      if (!session?.access_token) return;

      const payload = await buzonApiRequest('/api/buzon/messages', {
        method: 'PATCH',
        token: session.access_token,
        body: { partner_id: partnerId },
      });

      const ids = new Set(payload.ids || []);
      const readAt = payload.read_at;
      if (!ids.size || !readAt) return;

      setMessages((prev) =>
        prev.map((message) =>
          ids.has(message.id) ? { ...message, read_at: readAt } : message,
        ),
      );
    } catch (error) {
      console.error('Could not mark messages as read:', error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await Promise.all([loadStaffUsers(), loadMessages()]);
      } catch (error) {
        console.error(error);
        if (!cancelled) toast.error('No se pudo cargar el buzón.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadMessages, loadStaffUsers]);

  useEffect(() => {
    const channel = supabase
      .channel(`staff_buzon_${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_buzon_mensajes' },
        (payload) => {
          const message = payload.new;
          if (!message) return;
          if (message.sender_id !== currentUserId && message.recipient_id !== currentUserId) {
            return;
          }

          setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) return prev;
            return [...prev, message];
          });

          if (message.sender_id !== currentUserId) {
            toast.success('Nuevo mensaje en el Buzón', { id: `buzon-${message.id}` });
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'staff_buzon_mensajes' },
        (payload) => {
          const message = payload.new;
          if (!message) return;
          setMessages((prev) =>
            prev.map((item) => (item.id === message.id ? { ...item, ...message } : item)),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedPartnerId) return;
    void markThreadAsRead(selectedPartnerId);
  }, [selectedPartnerId, threadMessages.length, markThreadAsRead]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, selectedPartnerId]);

  const handleSelectPartner = (partnerId) => {
    setSelectedPartnerId(partnerId);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedPartnerId || sending) return;

    setSending(true);

    try {
      const { session } = await getClientAuth();
      if (!session?.access_token) {
        toast.error('Tu sesión ha expirado. Vuelve a iniciar sesión.');
        return;
      }

      const payload = await buzonApiRequest('/api/buzon/messages', {
        method: 'POST',
        token: session.access_token,
        body: {
          recipient_id: selectedPartnerId,
          body,
        },
      });

      setDraft('');
      const data = payload.message;
      if (data) {
        setMessages((prev) => (prev.some((item) => item.id === data.id) ? prev : [...prev, data]));
      }
    } catch (error) {
      console.error('Could not send buzón message:', error);
      toast.error(error.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const getUnreadForPartner = (partnerId) => {
    const summary = conversations.find((item) => item.partnerId === partnerId);
    return summary?.unreadCount || 0;
  };

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        Cargando conversaciones…
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Conversaciones</h2>
          <p>Mensajería interna entre el equipo.</p>
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar persona o rol…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar contacto"
          />
        </div>

        <ul className={styles.contactList} aria-label="Contactos del equipo">
          {visibleContacts.map((user) => {
            const active = selectedPartnerId === user.id;
            const unread = getUnreadForPartner(user.id);
            const conversation = conversations.find((item) => item.partnerId === user.id);
            const preview = conversation?.lastMessage?.body || 'Sin mensajes todavía';

            return (
              <li key={user.id}>
                <button
                  type="button"
                  className={`${styles.contactButton}${active ? ` ${styles.contactButtonActive}` : ''}`}
                  onClick={() => handleSelectPartner(user.id)}
                >
                  <span className={styles.avatar} aria-hidden>
                    {getDisplayName(user).slice(0, 1).toUpperCase()}
                  </span>
                  <span className={styles.contactBody}>
                    <span className={styles.contactTop}>
                      <strong>{getDisplayName(user)}</strong>
                      {conversation ? (
                        <time dateTime={conversation.lastMessage.created_at}>
                          {formatBuzonTime(conversation.lastMessage.created_at)}
                        </time>
                      ) : null}
                    </span>
                    <span className={styles.contactMeta}>
                      {getStaffRoleLabel(extractRoleName(user))}
                    </span>
                    <span className={styles.contactPreview}>{preview}</span>
                  </span>
                  {unread > 0 ? <span className={styles.unreadBadge}>{unread}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className={styles.thread} aria-label="Hilo de conversación">
        {!selectedPartner ? (
          <div className={styles.emptyThread}>
            <strong>Selecciona un contacto</strong>
            <p>Elige a alguien del equipo para empezar a chatear en tiempo real.</p>
          </div>
        ) : (
          <>
            <header className={styles.threadHeader}>
              <div>
                <h3>{getDisplayName(selectedPartner)}</h3>
                <p>{getStaffRoleLabel(extractRoleName(selectedPartner))}</p>
              </div>
              <span className={styles.liveBadge}>En vivo</span>
            </header>

            <div className={styles.messageList}>
              {threadMessages.length === 0 ? (
                <p className={styles.threadHint}>Aún no hay mensajes. Escribe el primero.</p>
              ) : (
                threadMessages.map((message) => {
                  const mine = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageRow}${mine ? ` ${styles.messageRowMine}` : ''}`}
                    >
                      <div className={styles.messageBubble}>
                        <p>{message.body}</p>
                        <footer>
                          <time dateTime={message.created_at}>
                            {formatBuzonTime(message.created_at)}
                          </time>
                          {mine ? (
                            <span>{message.read_at ? 'Leído' : 'Enviado'}</span>
                          ) : null}
                        </footer>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            <form className={styles.composer} onSubmit={handleSend}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribe un mensaje…"
                rows={2}
                aria-label="Mensaje"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend(event);
                  }
                }}
              />
              <button type="submit" disabled={sending || !draft.trim()}>
                {sending ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
