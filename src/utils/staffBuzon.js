import { normalizeRoleName } from '@/utils/authRoles';

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
]);

export function isStaffBuzonRole(roleName = '') {
  return STAFF_BUZON_ROLE_NAMES.has(normalizeRoleName(roleName));
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
