import { isStudentRole, normalizeRoleName } from '@/utils/authRoles';

/** @deprecated Lista histórica; usar isStaffBuzonRole (todos los roles excepto alumno). */
export const STAFF_BUZON_ROLE_NAMES = new Set([
  'admin',
  'administrador',
  'coordinador',
  'coordinator',
  'informatico',
  'it',
  'soporte',
  'support',
  'teacher',
  'profesor',
  'centro_empresa',
  'centro/empresa',
  'clases_grupos',
  'clases/grupos',
]);

export function isStaffBuzonRole(roleName = '') {
  const role = normalizeRoleName(roleName);
  return Boolean(role) && !isStudentRole(role);
}

export function getStaffRoleLabel(roleName = '') {
  const role = normalizeRoleName(roleName);
  const labels = {
    admin: 'Admin',
    administrador: 'Admin',
    coordinador: 'Coordinador',
    coordinator: 'Coordinador',
    informatico: 'Informático',
    it: 'Informático',
    soporte: 'Soporte',
    support: 'Soporte',
    teacher: 'Profesor',
    profesor: 'Profesor',
    centro_empresa: 'Centro / empresa',
    'centro/empresa': 'Centro / empresa',
    clases_grupos: 'Clases / grupos',
    'clases/grupos': 'Clases / grupos',
    'resp.marketing': 'Resp. marketing',
    resp_marketing: 'Resp. marketing',
    responsable_marketing: 'Resp. marketing',
    marketing: 'Resp. marketing',
  };
  return labels[role] || roleName || 'Staff';
}

export function getConversationPartnerId(message, currentUserId) {
  if (!message || !currentUserId) return null;
  if (message.sender_id === currentUserId) return message.recipient_id;
  if (message.recipient_id === currentUserId) return message.sender_id;
  return null;
}

export function buildConversationSummaries(messages, currentUserId) {
  const byPartner = new Map();

  for (const message of messages) {
    const partnerId = getConversationPartnerId(message, currentUserId);
    if (!partnerId) continue;

    if (!byPartner.has(partnerId)) {
      byPartner.set(partnerId, { partnerId, lastMessage: message, unreadCount: 0 });
    }

    const entry = byPartner.get(partnerId);
    if (new Date(message.created_at) >= new Date(entry.lastMessage.created_at)) {
      entry.lastMessage = message;
    }
    if (message.recipient_id === currentUserId && !message.read_at) {
      entry.unreadCount += 1;
    }
  }

  return [...byPartner.values()].sort(
    (a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at),
  );
}

export function filterThreadMessages(messages, currentUserId, partnerId) {
  return messages
    .filter(
      (message) =>
        (message.sender_id === currentUserId && message.recipient_id === partnerId) ||
        (message.sender_id === partnerId && message.recipient_id === currentUserId),
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export function formatBuzonTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDisplayName(user) {
  const name = String(user?.nombre || '').trim();
  if (name) return name;
  const email = String(user?.email || '').trim();
  if (email) return email.split('@')[0];
  return 'Usuario';
}

export const BUZON_STATUS_VALUES = ['disponible', 'reunion', 'ocupado'];

export const BUZON_STATUS_LABELS = {
  disponible: 'Disponible',
  reunion: 'En reunión',
  ocupado: 'Ocupado',
};

export function getBuzonStatusLabel(status = 'disponible') {
  return BUZON_STATUS_LABELS[status] || BUZON_STATUS_LABELS.disponible;
}

export function formatBuzonPresence(presence) {
  if (!presence) return getBuzonStatusLabel('disponible');
  const label = getBuzonStatusLabel(presence.status);
  const activity = String(presence.activity || '').trim();
  if (activity) return `${label} · ${activity}`;
  return label;
}

export function getDirectContactPreview(conversation, presence, messagePreviewFn) {
  if (conversation?.lastMessage && typeof messagePreviewFn === 'function') {
    return messagePreviewFn(conversation.lastMessage);
  }
  return formatBuzonPresence(presence);
}

export function buildGroupConversationSummaries(messages, groupId) {
  const groupMessages = messages
    .filter((message) => message.group_id === groupId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (!groupMessages.length) return null;
  return groupMessages[groupMessages.length - 1];
}

export function filterGroupThreadMessages(messages, groupId) {
  return messages
    .filter((message) => message.group_id === groupId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export function getThreadKey(selection) {
  if (!selection) return null;
  return `${selection.type}:${selection.id}`;
}
