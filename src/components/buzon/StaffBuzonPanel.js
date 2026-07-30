'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import {
  BUZON_STATUS_LABELS,
  BUZON_STATUS_VALUES,
  buildConversationSummaries,
  buildGroupConversationSummaries,
  filterGroupThreadMessages,
  filterThreadMessages,
  formatBuzonPresence,
  formatBuzonTime,
  getDirectContactPreview,
  getDisplayName,
  getStaffRoleLabel,
} from '@/utils/staffBuzon';
import {
  getMessagePreview,
  isAudioAttachment,
  isDocumentAttachment,
  isImageAttachment,
  validateBuzonAttachmentFile,
} from '@/lib/staffBuzonAttachments';
import { BUZON_REACTION_EMOJIS } from '@/lib/staffBuzonEmojis';
import { buzonApiRequest, buzonUploadRequest } from '@/lib/staffBuzonClient';
import { splitMessageWithLinks } from '@/lib/linkifyMessageText';
import StaffBuzonGroupSettings from '@/components/buzon/StaffBuzonGroupSettings';
import StaffBuzonComposer from '@/components/buzon/StaffBuzonComposer';
import styles from './StaffBuzonPanel.module.css';

const TABS = [
  { id: 'direct', label: 'Directos' },
  { id: 'groups', label: 'Grupos' },
  { id: 'starred', label: 'Destacados' },
];

function extractRoleName(userRow) {
  const embedded = userRow?.Usuarios_y_Perfil_roles;
  if (Array.isArray(embedded)) return embedded[0]?.nombre || '';
  return embedded?.nombre || '';
}

function MessageAttachmentContent({ message, mine }) {
  if (isImageAttachment(message)) {
    return (
      <a
        href={message.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.messageImageLink}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={message.attachment_url} alt={message.attachment_name || 'Imagen'} />
      </a>
    );
  }
  if (isDocumentAttachment(message)) {
    return (
      <a
        href={message.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.messageDocLink}${mine ? ` ${styles.messageDocLinkMine}` : ''}`}
      >
        📎 {message.attachment_name || 'Documento'}
      </a>
    );
  }
  if (isAudioAttachment(message)) {
    return (
      <div className={styles.messageAudioWrap}>
        <audio
          key={message.id}
          controls
          preload="metadata"
          src={message.attachment_url}
          className={styles.messageAudio}
        />
        {message.attachment_name ? (
          <span className={styles.messageAudioName}>{message.attachment_name}</span>
        ) : null}
      </div>
    );
  }
  return null;
}

function MessageBodyText({ text, mine }) {
  const parts = splitMessageWithLinks(text);

  return (
    <p>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <a
            key={`link-${index}-${part.value}`}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className={mine ? styles.messageLinkMine : styles.messageLink}
          >
            {part.value}
          </a>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
}

function isAutoAttachmentBody(message) {
  if (!message.body?.trim()) return true;
  if (message.body === 'Imagen' || message.body === 'Documento' || message.body === 'Audio') {
    return true;
  }
  return message.body === message.attachment_name;
}

function statusClass(status) {
  if (status === 'reunion') return styles.statusReunion;
  if (status === 'ocupado') return styles.statusOcupado;
  return styles.statusDisponible;
}

function presenceDotClass(online) {
  return online ? styles.presenceDotOnline : styles.presenceDotOffline;
}

function sameReaction(left, right) {
  return (
    left?.message_id === right?.message_id &&
    left?.user_id === right?.user_id &&
    left?.emoji === right?.emoji
  );
}

function summarizeMessageReactions(reactions, messageId, currentUserId) {
  return BUZON_REACTION_EMOJIS.map((emoji) => {
    const rows = reactions.filter(
      (reaction) => reaction.message_id === messageId && reaction.emoji === emoji,
    );
    return {
      emoji,
      count: rows.length,
      mine: rows.some((reaction) => reaction.user_id === currentUserId),
    };
  }).filter((reaction) => reaction.count > 0);
}

export default function StaffBuzonPanel({ currentUserId }) {
  const [staffUsers, setStaffUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [presenceMap, setPresenceMap] = useState(new Map());
  const [starredIds, setStarredIds] = useState(new Set());
  const [reactions, setReactions] = useState([]);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null);
  const [activeTab, setActiveTab] = useState('direct');
  const [selection, setSelection] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [myStatus, setMyStatus] = useState('disponible');
  const [myActivity, setMyActivity] = useState('');
  const [savingPresence, setSavingPresence] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [settingsToken, setSettingsToken] = useState(null);
  const messageListRef = useRef(null);

  const staffById = useMemo(() => {
    const map = new Map();
    staffUsers.forEach((user) => map.set(user.id, user));
    return map;
  }, [staffUsers]);

  const dmConversations = useMemo(
    () => buildConversationSummaries(messages, currentUserId),
    [messages, currentUserId],
  );

  const selectedPartner =
    selection?.type === 'direct' ? staffById.get(selection.id) : null;
  const selectedGroup =
    selection?.type === 'group' ? groups.find((g) => g.id === selection.id) : null;

  const threadMessages = useMemo(() => {
    if (!selection) return [];
    if (selection.type === 'direct') {
      return filterThreadMessages(messages, currentUserId, selection.id);
    }
    return filterGroupThreadMessages(messages, selection.id);
  }, [messages, currentUserId, selection]);

  const starredMessages = useMemo(() => {
    return messages
      .filter((message) => starredIds.has(message.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [messages, starredIds]);

  const visibleContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staffUsers
      .filter((user) => user.id !== currentUserId)
      .filter((user) => {
        if (!query) return true;
        const name = getDisplayName(user).toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const role = getStaffRoleLabel(extractRoleName(user)).toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query);
      })
      .sort((a, b) => {
        const convA = dmConversations.find((item) => item.partnerId === a.id);
        const convB = dmConversations.find((item) => item.partnerId === b.id);
        if (convA && convB) {
          return new Date(convB.lastMessage.created_at) - new Date(convA.lastMessage.created_at);
        }
        if (convA) return -1;
        if (convB) return 1;
        return getDisplayName(a).localeCompare(getDisplayName(b), 'es');
      });
  }, [staffUsers, currentUserId, search, dmConversations]);

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups
      .filter((group) => !query || group.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const lastA = buildGroupConversationSummaries(messages, a.id);
        const lastB = buildGroupConversationSummaries(messages, b.id);
        if (lastA && lastB) return new Date(lastB.created_at) - new Date(lastA.created_at);
        if (lastA) return -1;
        if (lastB) return 1;
        return a.name.localeCompare(b.name, 'es');
      });
  }, [groups, messages, search]);

  const getAccessToken = useCallback(async () => {
    const { session } = await getClientAuth();
    if (!session?.access_token) throw new Error('Sesión no válida.');
    return session.access_token;
  }, []);

  const loadStaffUsers = useCallback(async () => {
    const token = await getAccessToken();
    const payload = await buzonApiRequest('/api/buzon/contacts', { token });
    setStaffUsers(payload.contacts || []);
  }, [getAccessToken]);

  const loadMessages = useCallback(async () => {
    const token = await getAccessToken();
    const payload = await buzonApiRequest('/api/buzon/messages', { token });
    setMessages(payload.messages || []);
    setStarredIds(new Set(payload.starred_ids || []));
    setReactions(payload.reactions || []);
  }, [getAccessToken]);

  const loadGroups = useCallback(async () => {
    const token = await getAccessToken();
    const payload = await buzonApiRequest('/api/buzon/groups', { token });
    setGroups(payload.groups || []);
  }, [getAccessToken]);

  const loadPresence = useCallback(async () => {
    const token = await getAccessToken();
    const payload = await buzonApiRequest('/api/buzon/presence', { token });
    const map = new Map();
    for (const row of payload.presence || []) {
      map.set(row.user_id, row);
    }
    setPresenceMap(map);
    const mine = map.get(currentUserId);
    if (mine) {
      setMyStatus(mine.status || 'disponible');
      setMyActivity(mine.activity || '');
    }
  }, [getAccessToken, currentUserId]);

  const markThreadAsRead = useCallback(
    async (partnerId) => {
      if (!partnerId) return;
      try {
        const token = await getAccessToken();
        const payload = await buzonApiRequest('/api/buzon/messages', {
          method: 'PATCH',
          token,
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
    },
    [getAccessToken],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([loadStaffUsers(), loadMessages(), loadGroups(), loadPresence()]);
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
  }, [loadGroups, loadMessages, loadPresence, loadStaffUsers]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadPresence();
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [loadPresence]);

  useEffect(() => {
    const channel = supabase
      .channel(`staff_buzon_${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_buzon_mensajes' },
        (payload) => {
          const message = payload.new;
          if (!message) return;
          const isMine = message.sender_id === currentUserId;
          const isDm =
            !message.group_id &&
            (message.sender_id === currentUserId || message.recipient_id === currentUserId);
          const isGroup =
            message.group_id &&
            groups.some((g) => g.id === message.group_id);
          if (!isDm && !isGroup) return;

          setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) return prev;
            return [...prev, message];
          });

          if (!isMine) {
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_buzon_mensaje_reacciones' },
        (payload) => {
          const reaction = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (!reaction?.message_id || !reaction?.user_id || !reaction?.emoji) return;

          setReactions((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((item) => !sameReaction(item, reaction));
            }
            if (prev.some((item) => sameReaction(item, reaction))) return prev;
            return [...prev, reaction];
          });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_buzon_presencia' },
        (payload) => {
          const row = payload.new;
          if (!row?.user_id) return;
          setPresenceMap((prev) => {
            const next = new Map(prev);
            const existing = next.get(row.user_id);
            next.set(row.user_id, {
              ...existing,
              ...row,
              online: existing?.online ?? false,
            });
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, groups]);

  useEffect(() => {
    if (selection?.type !== 'direct') return;
    void markThreadAsRead(selection.id);
  }, [selection, threadMessages.length, markThreadAsRead]);

  useLayoutEffect(() => {
    if (!selection) return;
    const list = messageListRef.current;
    if (!list?.isConnected) return;
    list.scrollTop = list.scrollHeight;
  }, [threadMessages.length, selection?.id, selection?.type]);

  const uploadAttachmentFile = useCallback(async (file) => {
    const validation = validateBuzonAttachmentFile(file);
    if (!validation.ok) {
      toast.error(validation.error);
      throw new Error(validation.error);
    }

    const token = await getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    const payload = await buzonUploadRequest('/api/buzon/attachments', { token, formData });
    setPendingAttachment({
      attachment_url: payload.attachment_url,
      attachment_name: payload.attachment_name,
      attachment_mime: payload.attachment_mime,
      attachment_kind: payload.attachment_kind,
    });
  }, [getAccessToken]);

  const handleSend = useCallback(async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if ((!body && !pendingAttachment) || !selection || sending) return;

    setSending(true);
    try {
      const token = await getAccessToken();
      const payload = await buzonApiRequest('/api/buzon/messages', {
        method: 'POST',
        token,
        body: {
          ...(selection.type === 'group'
            ? { group_id: selection.id }
            : { recipient_id: selection.id }),
          body,
          ...(pendingAttachment || {}),
        },
      });

      setDraft('');
      setPendingAttachment(null);
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
  }, [
    draft,
    pendingAttachment,
    selection,
    sending,
    getAccessToken,
  ]);

  const handleSavePresence = async () => {
    setSavingPresence(true);
    try {
      const token = await getAccessToken();
      const payload = await buzonApiRequest('/api/buzon/presence', {
        method: 'PUT',
        token,
        body: { status: myStatus, activity: myActivity.trim() || null },
      });
      if (payload.presence) {
        setPresenceMap((prev) =>
          new Map(prev).set(currentUserId, { ...payload.presence, online: true }),
        );
      }
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el estado.');
    } finally {
      setSavingPresence(false);
    }
  };

  const openGroupSettings = async () => {
    try {
      const token = await getAccessToken();
      setSettingsToken(token);
      setShowGroupSettings(true);
    } catch (error) {
      toast.error(error.message || 'No se pudo abrir la configuración.');
    }
  };

  const handleToggleStar = async (messageId) => {
    const wasStarred = starredIds.has(messageId);
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (wasStarred) next.delete(messageId);
      else next.add(messageId);
      return next;
    });

    try {
      const token = await getAccessToken();
      const payload = await buzonApiRequest('/api/buzon/stars', {
        method: 'POST',
        token,
        body: { message_id: messageId },
      });
      setStarredIds((prev) => {
        const next = new Set(prev);
        if (payload.starred) next.add(messageId);
        else next.delete(messageId);
        return next;
      });
    } catch (error) {
      setStarredIds((prev) => {
        const next = new Set(prev);
        if (wasStarred) next.add(messageId);
        else next.delete(messageId);
        return next;
      });
      toast.error(error.message || 'No se pudo destacar el mensaje.');
    }
  };

  const handleToggleReaction = async (messageId, emoji) => {
    const reaction = { message_id: messageId, user_id: currentUserId, emoji };
    const alreadyReacted = reactions.some((item) => sameReaction(item, reaction));

    setReactions((prev) =>
      alreadyReacted
        ? prev.filter((item) => !sameReaction(item, reaction))
        : [...prev, reaction],
    );

    try {
      const token = await getAccessToken();
      const payload = await buzonApiRequest('/api/buzon/reactions', {
        method: 'POST',
        token,
        body: { message_id: messageId, emoji },
      });
      setReactions((prev) => {
        const withoutMine = prev.filter((item) => !sameReaction(item, reaction));
        return payload.reacted ? [...withoutMine, payload.reaction || reaction] : withoutMine;
      });
    } catch (error) {
      setReactions((prev) => {
        const withoutMine = prev.filter((item) => !sameReaction(item, reaction));
        return alreadyReacted ? [...withoutMine, reaction] : withoutMine;
      });
      toast.error(error.message || 'No se pudo actualizar la reacción.');
    }
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    const name = groupName.trim();
    if (!name || creatingGroup) return;

    setCreatingGroup(true);
    try {
      const token = await getAccessToken();
      const payload = await buzonApiRequest('/api/buzon/groups', {
        method: 'POST',
        token,
        body: {
          name,
          description: groupDescription.trim() || null,
          member_ids: groupMemberIds,
        },
      });
      const group = payload.group;
      if (group) {
        setGroups((prev) => [group, ...prev.filter((item) => item.id !== group.id)]);
        setSelection({ type: 'group', id: group.id });
        setActiveTab('groups');
      }
      setShowCreateGroup(false);
      setGroupName('');
      setGroupDescription('');
      setGroupMemberIds([]);
      toast.success('Grupo creado');
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el grupo.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const getUnreadForPartner = (partnerId) => {
    const summary = dmConversations.find((item) => item.partnerId === partnerId);
    return summary?.unreadCount || 0;
  };

  const openStarredThread = (message) => {
    if (message.group_id) {
      setSelection({ type: 'group', id: message.group_id });
      setActiveTab('groups');
      return;
    }
    const partnerId =
      message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
    if (partnerId) {
      setSelection({ type: 'direct', id: partnerId });
      setActiveTab('direct');
    }
  };

  const renderPresenceBadge = (userId) => {
    const presence = presenceMap.get(userId);
    const status = presence?.status || 'disponible';
    return (
      <span className={`${styles.presenceBadge} ${statusClass(status)}`}>
        {formatBuzonPresence(presence)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <span className={styles.loadingSpinner} aria-hidden />
        Cargando conversaciones…
      </div>
    );
  }

  return (
    <div
      className={`staff-buzon-panel ${styles.layout}`}
      data-has-selection={selection ? 'true' : 'false'}
    >
      <aside className={`staff-buzon-sidebar ${styles.sidebar}`}>
        <div className={`staff-buzon-sidebar-header ${styles.sidebarHeader}`}>
          <h2>Conversaciones</h2>
          <p>Mensajería interna entre el equipo.</p>

          <div className={styles.myPresence}>
            <label className={styles.presenceLabel} htmlFor="buzon-my-status">
              Mi estado
            </label>
            <div className={styles.presenceRow}>
              <select
                id="buzon-my-status"
                value={myStatus}
                onChange={(event) => setMyStatus(event.target.value)}
                className={styles.presenceSelect}
              >
                {BUZON_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {BUZON_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.presenceSave}
                onClick={() => void handleSavePresence()}
                disabled={savingPresence}
              >
                {savingPresence ? '…' : 'Guardar'}
              </button>
            </div>
            <input
              type="text"
              className={styles.presenceActivity}
              placeholder="En qué estás trabajando… (ej. corrigiendo exámenes)"
              value={myActivity}
              onChange={(event) => setMyActivity(event.target.value)}
              maxLength={200}
            />
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Secciones del buzón">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.tab}${activeTab === tab.id ? ` ${styles.tabActive}` : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'groups' ? (
            <button
              type="button"
              className={styles.createGroupBtn}
              onClick={() => setShowCreateGroup(true)}
            >
              + Crear grupo
            </button>
          ) : null}

          {activeTab !== 'starred' ? (
            <input
              type="search"
              className={styles.search}
              placeholder={
                activeTab === 'groups' ? 'Buscar grupo…' : 'Buscar persona o rol…'
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar"
            />
          ) : null}
        </div>

        {activeTab === 'direct' ? (
          <ul className={`staff-buzon-contacts ${styles.contactList}`} aria-label="Contactos del equipo">
            {visibleContacts.length === 0 ? (
              <li className={styles.emptyListHint}>
                No hay compañeros del equipo todavía. Si acabas de entrar, recarga en unos segundos.
              </li>
            ) : null}
            {visibleContacts.map((user) => {
              const active = selection?.type === 'direct' && selection.id === user.id;
              const unread = getUnreadForPartner(user.id);
              const presence = presenceMap.get(user.id);
              const conversation = dmConversations.find((item) => item.partnerId === user.id);
              const preview = getDirectContactPreview(conversation, presence, getMessagePreview);
              const isOnline = presence?.online === true;

              return (
                <li key={user.id}>
                  <button
                    type="button"
                    className={`${styles.contactButton}${active ? ` ${styles.contactButtonActive}` : ''}`}
                    onClick={() => setSelection({ type: 'direct', id: user.id })}
                  >
                    <span className={styles.avatarWrap}>
                      <span className={styles.avatar} aria-hidden>
                        {getDisplayName(user).slice(0, 1).toUpperCase()}
                      </span>
                      <span
                        className={`${styles.presenceDot} ${presenceDotClass(isOnline)}`}
                        title={isOnline ? 'Conectado' : 'Desconectado'}
                        aria-hidden
                      />
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
        ) : null}

        {activeTab === 'groups' ? (
          <ul className={`staff-buzon-contacts ${styles.contactList}`} aria-label="Grupos">
            {visibleGroups.length === 0 ? (
              <li className={styles.emptyListHint}>Aún no hay grupos. Crea uno arriba.</li>
            ) : (
              visibleGroups.map((group) => {
                const active = selection?.type === 'group' && selection.id === group.id;
                const lastMessage = buildGroupConversationSummaries(messages, group.id);
                const preview = lastMessage ? getMessagePreview(lastMessage) : 'Sin mensajes todavía';

                return (
                  <li key={group.id}>
                    <button
                      type="button"
                      className={`${styles.contactButton}${active ? ` ${styles.contactButtonActive}` : ''}`}
                      onClick={() => setSelection({ type: 'group', id: group.id })}
                    >
                      <span className={`${styles.avatar} ${styles.groupAvatar}`} aria-hidden>
                        G
                      </span>
                      <span className={styles.contactBody}>
                        <span className={styles.contactTop}>
                          <strong>{group.name}</strong>
                          {lastMessage ? (
                            <time dateTime={lastMessage.created_at}>
                              {formatBuzonTime(lastMessage.created_at)}
                            </time>
                          ) : null}
                        </span>
                        <span className={styles.contactMeta}>
                          {group.member_ids?.length || 0} miembros
                        </span>
                        <span className={styles.contactPreview}>{preview}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}

        {activeTab === 'starred' ? (
          <ul className={`staff-buzon-contacts ${styles.contactList}`} aria-label="Mensajes destacados">
            {starredMessages.length === 0 ? (
              <li className={styles.emptyListHint}>
                Marca mensajes con la estrella para encontrarlos aquí.
              </li>
            ) : (
              starredMessages.map((message) => {
                const isGroup = Boolean(message.group_id);
                const partnerId =
                  message.sender_id === currentUserId
                    ? message.recipient_id
                    : message.sender_id;
                const title = isGroup
                  ? groups.find((g) => g.id === message.group_id)?.name || 'Grupo'
                  : getDisplayName(staffById.get(partnerId) || {});

                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      className={styles.contactButton}
                      onClick={() => openStarredThread(message)}
                    >
                      <span className={styles.starListIcon} aria-hidden>
                        ★
                      </span>
                      <span className={styles.contactBody}>
                        <span className={styles.contactTop}>
                          <strong>{title}</strong>
                          <time dateTime={message.created_at}>
                            {formatBuzonTime(message.created_at)}
                          </time>
                        </span>
                        <span className={styles.contactPreview}>{getMessagePreview(message)}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}
      </aside>

      <section className={`staff-buzon-thread ${styles.thread}`} aria-label="Hilo de conversación">
        {!selection ? (
          <div className={styles.emptyThread}>
            <div className={styles.emptyThreadIcon} aria-hidden>
              💬
            </div>
            <strong>Selecciona una conversación</strong>
            <p>Elige un contacto, un grupo o un mensaje destacado para empezar a chatear.</p>
          </div>
        ) : (
          <>
            <header className={`staff-buzon-thread-header ${styles.threadHeader}`}>
              <button
                type="button"
                className={`staff-buzon-mobile-back ${styles.mobileBack}`}
                onClick={() => setSelection(null)}
              >
                ← Conversaciones
              </button>
              <div className={styles.threadHeaderMain}>
                {selection.type === 'direct' && selectedPartner ? (
                  <>
                    <span className={styles.threadHeaderAvatar} aria-hidden>
                      {getDisplayName(selectedPartner).slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3>{getDisplayName(selectedPartner)}</h3>
                      <p>{getStaffRoleLabel(extractRoleName(selectedPartner))}</p>
                    </div>
                  </>
                ) : null}
                {selection.type === 'group' && selectedGroup ? (
                  <>
                    <span
                      className={`${styles.threadHeaderAvatar} ${styles.threadHeaderAvatarGroup}`}
                      aria-hidden
                    >
                      G
                    </span>
                    <div>
                      <h3>{selectedGroup.name}</h3>
                      <p>
                        {selectedGroup.member_ids?.length || 0} miembros
                        {selectedGroup.description ? ` · ${selectedGroup.description}` : ''}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
              <div className={styles.threadHeaderActions}>
                {selection.type === 'group' && selectedGroup ? (
                  <button
                    type="button"
                    className={styles.groupSettingsBtn}
                    onClick={() => void openGroupSettings()}
                  >
                    Configuración
                  </button>
                ) : null}
                {selection.type === 'direct' && selectedPartner
                  ? renderPresenceBadge(selectedPartner.id)
                  : null}
              </div>
            </header>

            <div ref={messageListRef} className={styles.messageList}>
              {threadMessages.length === 0 ? (
                <p className={styles.threadHint}>Aún no hay mensajes. Escribe el primero.</p>
              ) : (
                threadMessages.map((message) => {
                  const mine = message.sender_id === currentUserId;
                  const starred = starredIds.has(message.id);
                  const sender =
                    selection.type === 'group'
                      ? staffById.get(message.sender_id)
                      : null;
                  const autoBody = isAutoAttachmentBody(message);
                  const showBody =
                    message.body?.trim() && !(message.attachment_url && autoBody);
                  const messageReactions = summarizeMessageReactions(
                    reactions,
                    message.id,
                    currentUserId,
                  );

                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageRow}${mine ? ` ${styles.messageRowMine}` : ''}`}
                    >
                      <div className={styles.messageBubble}>
                        {sender ? (
                          <span className={styles.messageSender}>
                            {getDisplayName(sender)}
                          </span>
                        ) : null}
                        <MessageAttachmentContent message={message} mine={mine} />
                        {showBody ? <MessageBodyText text={message.body} mine={mine} /> : null}
                        {messageReactions.length ? (
                          <div className={styles.reactionArea}>
                            {messageReactions.map((reaction) => (
                              <button
                                key={reaction.emoji}
                                type="button"
                                className={`${styles.reactionChip}${reaction.mine ? ` ${styles.reactionChipActive}` : ''}`}
                                onClick={() =>
                                  void handleToggleReaction(message.id, reaction.emoji)
                                }
                                aria-pressed={reaction.mine}
                                title={
                                  reaction.mine
                                    ? `Quitar reacción ${reaction.emoji}`
                                    : `Reaccionar con ${reaction.emoji}`
                                }
                              >
                                <span>{reaction.emoji}</span>
                                <strong>{reaction.count}</strong>
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <footer>
                          <time dateTime={message.created_at}>
                            {formatBuzonTime(message.created_at)}
                          </time>
                          {mine && selection.type === 'direct' ? (
                            <span>{message.read_at ? 'Leído' : 'Enviado'}</span>
                          ) : null}
                          <div className={styles.reactionPickerWrap}>
                            <button
                              type="button"
                              className={styles.addReactionBtn}
                              onClick={() =>
                                setReactionPickerMessageId((current) =>
                                  current === message.id ? null : message.id,
                                )
                              }
                              aria-label="Añadir reacción"
                              aria-expanded={reactionPickerMessageId === message.id}
                              title="Añadir reacción"
                            >
                              😊
                            </button>
                            {reactionPickerMessageId === message.id ? (
                              <div
                                className={styles.reactionPicker}
                                role="dialog"
                                aria-label="Seleccionar reacción"
                              >
                                {BUZON_REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setReactionPickerMessageId(null);
                                      void handleToggleReaction(message.id, emoji);
                                    }}
                                    aria-label={`Reaccionar con ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className={`${styles.starBtn}${starred ? ` ${styles.starBtnActive}` : ''}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleToggleStar(message.id);
                            }}
                            aria-label={starred ? 'Quitar destacado' : 'Destacar mensaje'}
                            title={starred ? 'Quitar destacado' : 'Destacar'}
                          >
                            {starred ? '★' : '☆'}
                          </button>
                        </footer>
                      </div>
                    </div>
                  );
                })
              )}

            </div>

            <StaffBuzonComposer
              draft={draft}
              setDraft={setDraft}
              pendingAttachment={pendingAttachment}
              setPendingAttachment={setPendingAttachment}
              uploadingAttachment={uploadingAttachment}
              setUploadingAttachment={setUploadingAttachment}
              sending={sending}
              onSend={handleSend}
              onUploadFile={uploadAttachmentFile}
            />
          </>
        )}
      </section>

      {showCreateGroup ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setShowCreateGroup(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="create-group-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="create-group-title">Crear grupo</h3>
            <form onSubmit={handleCreateGroup}>
              <label className={styles.modalLabel} htmlFor="group-name">
                Nombre del grupo
              </label>
              <input
                id="group-name"
                type="text"
                className={styles.modalInput}
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Ej. Profesores B2"
                maxLength={80}
                required
              />

              <label className={styles.modalLabel} htmlFor="group-description">
                Descripción (opcional)
              </label>
              <textarea
                id="group-description"
                className={styles.modalTextarea}
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
                placeholder="Para qué sirve este grupo…"
                maxLength={500}
                rows={2}
              />

              <p className={styles.modalLabel}>Miembros</p>
              <ul className={styles.memberPicker}>
                {visibleContacts.map((user) => {
                  const checked = groupMemberIds.includes(user.id);
                  return (
                    <li key={user.id}>
                      <label className={styles.memberOption}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setGroupMemberIds((prev) =>
                              checked
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id],
                            );
                          }}
                        />
                        <span>{getDisplayName(user)}</span>
                        <span className={styles.contactMeta}>
                          {getStaffRoleLabel(extractRoleName(user))}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateGroup(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={creatingGroup || !groupName.trim()}>
                  {creatingGroup ? 'Creando…' : 'Crear grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showGroupSettings && selectedGroup && settingsToken ? (
        <StaffBuzonGroupSettings
          group={selectedGroup}
          staffUsers={staffUsers}
          currentUserId={currentUserId}
          token={settingsToken}
          onClose={() => setShowGroupSettings(false)}
          onUpdated={(group) => {
            setGroups((prev) => prev.map((item) => (item.id === group.id ? group : item)));
          }}
          onDeleted={(groupId) => {
            setGroups((prev) => prev.filter((item) => item.id !== groupId));
            setMessages((prev) => prev.filter((item) => item.group_id !== groupId));
            if (selection?.type === 'group' && selection.id === groupId) {
              setSelection(null);
            }
            setShowGroupSettings(false);
          }}
          onLeft={() => {
            const groupId = selectedGroup.id;
            setGroups((prev) => prev.filter((item) => item.id !== groupId));
            setMessages((prev) => prev.filter((item) => item.group_id !== groupId));
            setSelection(null);
            setShowGroupSettings(false);
          }}
        />
      ) : null}
    </div>
  );
}
