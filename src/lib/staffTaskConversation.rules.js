import { isTaskTerminal } from '@/lib/staffTaskHelpers';

export const TASK_MESSAGE_MAX_LENGTH = 4000;

/** Roles del lado «admin» que pueden intervenir en cualquier conversación de tarea. */
export const TASK_CONVERSATION_ADMIN_ROLES = new Set([
  'admin',
  'administrador',
  'coordinador',
  'coordinator',
  'soporte',
  'support',
]);

export function normalizeTaskMessageBody(value) {
  const text = String(value || '').trim();
  if (!text) return { ok: false, error: 'Escribe un mensaje.' };
  if (text.length > TASK_MESSAGE_MAX_LENGTH) {
    return { ok: false, error: `Máximo ${TASK_MESSAGE_MAX_LENGTH} caracteres.` };
  }
  return { ok: true, body: text };
}

export function isTaskConversationOpen(task) {
  if (!task) return false;
  return !isTaskTerminal(task.estado);
}

export function isTaskConversationAdminRole(roleName = '') {
  const role = String(roleName || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  return TASK_CONVERSATION_ADMIN_ROLES.has(role);
}

/**
 * ¿Puede ver y escribir en el chat de esta tarea?
 * - El responsable asignado
 * - Quien creó la tarea
 * - Admin / coordinación / soporte
 */
export function canAccessTaskConversation({ userId, roleName, task }) {
  if (!userId || !task) return false;
  if (String(task.asignado_id || '') === String(userId)) return true;
  if (String(task.created_by || '') === String(userId)) return true;
  return isTaskConversationAdminRole(roleName);
}

/** Mensajes de otros posteriores a la última lectura del usuario. */
export function countUnreadTaskMessages(messages = [], lastReadAt, userId) {
  if (!userId) return 0;
  const cutoff = lastReadAt ? new Date(lastReadAt).getTime() : 0;
  let count = 0;
  for (const message of messages || []) {
    if (String(message.sender_id) === String(userId)) continue;
    const at = new Date(message.created_at).getTime();
    if (!Number.isNaN(at) && at > cutoff) count += 1;
  }
  return count;
}
