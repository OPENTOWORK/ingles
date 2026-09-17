import { ADMIN_EMAIL, normalizeEmail } from '@/utils/authRoles';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import { enrichTasksList, loadProfilesByIds } from '@/lib/staffTasksServer';
import {
  canAccessTaskConversation,
  countUnreadTaskMessages,
  isTaskConversationAdminRole,
  isTaskConversationOpen,
  normalizeTaskMessageBody,
} from '@/lib/staffTaskConversation.rules';
import { sendStaffTaskMessageEmail } from '@/lib/sendStaffTaskMessageEmail';

const TASKS_TABLE = 'staff_tareas';
const MESSAGES_TABLE = 'staff_tarea_mensajes';
const READS_TABLE = 'staff_tarea_lecturas';
const PROFILES_TABLE = 'Usuarios_y_Perfil_users';
const ROLES_TABLE = 'Usuarios_y_Perfil_roles';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function buildTaskPanelUrl(taskId) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  const root = `${base.replace(/\/$/, '')}/tareas/`;
  return taskId ? `${root}?abierta=${encodeURIComponent(taskId)}` : root;
}

export async function loadStaffTaskById(db, taskId) {
  const { data, error } = await db.from(TASKS_TABLE).select('*').eq('id', taskId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [enriched] = await enrichTasksList(db, [data]);
  return enriched || data;
}

async function loadTaskReadState(db, taskId, userId) {
  const { data, error } = await db
    .from(READS_TABLE)
    .select('last_read_at')
    .eq('tarea_id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error && !isMissingTableError(error)) throw error;
  return data?.last_read_at || null;
}

async function markTaskConversationRead(db, taskId, userId) {
  const now = new Date().toISOString();
  const { error } = await db.from(READS_TABLE).upsert(
    { tarea_id: taskId, user_id: userId, last_read_at: now },
    { onConflict: 'tarea_id,user_id' },
  );
  if (error && !isMissingTableError(error)) throw error;
  return now;
}

async function loadAdminCoordinatorEmails(db, excludeUserId, excludeEmail = '') {
  const emails = new Map();
  const skipEmail = normalizeEmail(excludeEmail);

  const adminEmail = normalizeEmail(ADMIN_EMAIL);
  if (adminEmail && adminEmail !== skipEmail) {
    emails.set(adminEmail, { id: null, email: adminEmail, nombre: 'Administración' });
  }

  const { data: roles } = await db
    .from(ROLES_TABLE)
    .select('id, nombre')
    .in('nombre', ['admin', 'administrador', 'coordinador', 'coordinator', 'soporte', 'support']);

  const roleIds = (roles || []).map((r) => r.id).filter(Boolean);
  if (!roleIds.length) return [...emails.values()];

  const { data: users } = await db
    .from(PROFILES_TABLE)
    .select('id, email, nombre, rol_id')
    .in('rol_id', roleIds);

  for (const user of users || []) {
    const email = String(user.email || '').trim().toLowerCase();
    if (!email || String(user.id) === String(excludeUserId)) continue;
    emails.set(email, { id: user.id, email, nombre: user.nombre || email });
  }

  return [...emails.values()];
}

/**
 * A quién avisar por correo cuando hay un mensaje nuevo.
 * - Si escribe el responsable → admin/coordinación (+ creador si no es admin).
 * - Si escribe admin/coordinación → responsable (+ creador si no es el remitente).
 */
export async function resolveTaskMessageRecipients(db, task, sender) {
  const senderId = String(sender?.id || '');
  const recipients = new Map();

  const profiles = await loadProfilesByIds(
    db,
    [task?.asignado_id, task?.created_by].filter(Boolean),
  );

  const assignee = task?.asignado_id ? profiles[task.asignado_id] : null;
  const creator = task?.created_by ? profiles[task.created_by] : null;
  const senderIsAssignee = senderId && String(task?.asignado_id || '') === senderId;
  const senderIsAdminSide = isTaskConversationAdminRole(sender?.roleName);

  if (assignee?.email && String(assignee.id) !== senderId) {
    recipients.set(assignee.email, assignee);
  }

  if (creator?.email && String(creator.id) !== senderId) {
    recipients.set(creator.email, creator);
  }

  if (senderIsAssignee || !senderIsAdminSide) {
    const admins = await loadAdminCoordinatorEmails(db, senderId, sender?.email);
    for (const admin of admins) {
      if (admin.email) recipients.set(admin.email, admin);
    }
  }

  return [...recipients.values()];
}

export async function getTaskConversation(db, { taskId, userId, roleName, markRead = false }) {
  const task = await loadStaffTaskById(db, taskId);
  if (!task) return { error: 'Tarea no encontrada.', status: 404 };

  if (!canAccessTaskConversation({ userId, roleName, task })) {
    return { error: 'No tienes acceso a esta conversación.', status: 403 };
  }

  const { data: messages, error: messagesError } = await db
    .from(MESSAGES_TABLE)
    .select('id, tarea_id, sender_id, body, created_at')
    .eq('tarea_id', taskId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    if (isMissingTableError(messagesError)) {
      return {
        task: { id: task.id, titulo: task.titulo, estado: task.estado },
        open: isTaskConversationOpen(task),
        messages: [],
        unreadCount: 0,
        tablesReady: false,
      };
    }
    throw messagesError;
  }

  const senderIds = [...new Set((messages || []).map((m) => m.sender_id).filter(Boolean))];
  const profilesById = await loadProfilesByIds(db, senderIds);

  const lastReadAt = await loadTaskReadState(db, taskId, userId);
  const unreadCount = countUnreadTaskMessages(messages, lastReadAt, userId);

  if (markRead) {
    await markTaskConversationRead(db, taskId, userId);
  }

  return {
    task: {
      id: task.id,
      titulo: task.titulo,
      estado: task.estado,
      asignado: task.asignado || null,
    },
    open: isTaskConversationOpen(task),
    messages: (messages || []).map((message) => ({
      ...message,
      sender: profilesById[message.sender_id] || null,
      isMine: String(message.sender_id) === String(userId),
    })),
    unreadCount: markRead ? 0 : unreadCount,
    tablesReady: true,
    taskUrl: buildTaskPanelUrl(task.id),
  };
}

export async function postTaskConversationMessage(db, { taskId, userId, roleName, body }) {
  const normalized = normalizeTaskMessageBody(body);
  if (!normalized.ok) return { error: normalized.error, status: 400 };

  const task = await loadStaffTaskById(db, taskId);
  if (!task) return { error: 'Tarea no encontrada.', status: 404 };

  if (!canAccessTaskConversation({ userId, roleName, task })) {
    return { error: 'No tienes acceso a esta conversación.', status: 403 };
  }

  if (!isTaskConversationOpen(task)) {
    return {
      error: 'La conversación está cerrada porque la tarea ya está finalizada.',
      status: 409,
    };
  }

  const { data: inserted, error: insertError } = await db
    .from(MESSAGES_TABLE)
    .insert({
      tarea_id: taskId,
      sender_id: userId,
      body: normalized.body,
    })
    .select('id, tarea_id, sender_id, body, created_at')
    .maybeSingle();

  if (insertError) {
    if (isMissingTableError(insertError)) {
      return { error: 'El chat de tareas no está configurado en la base de datos.', status: 503 };
    }
    throw insertError;
  }

  await markTaskConversationRead(db, taskId, userId);

  const senderProfile = (await loadProfilesByIds(db, [userId]))[userId];
  const sender = {
    id: userId,
    roleName,
    nombre: senderProfile?.nombre || '',
    email: senderProfile?.email || '',
  };

  const recipients = await resolveTaskMessageRecipients(db, task, sender);
  const emailResults = [];

  for (const recipient of recipients) {
    try {
      const mail = await sendStaffTaskMessageEmail({
        adminClient: db,
        task,
        recipient,
        sender,
        messageBody: normalized.body,
        taskUrl: buildTaskPanelUrl(task.id),
      });
      emailResults.push({ email: recipient.email, sent: Boolean(mail?.sent || mail?.queued) });
    } catch (err) {
      console.error('[staffTaskConversation] email:', err);
      emailResults.push({ email: recipient.email, sent: false });
    }
  }

  return {
    ok: true,
    message: {
      ...inserted,
      sender: senderProfile || null,
      isMine: true,
    },
    emails: emailResults,
  };
}

export async function assertTaskConversationAccess(db, { taskId, userId, email }) {
  const task = await loadStaffTaskById(db, taskId);
  if (!task) return { error: 'Tarea no encontrada.', status: 404 };

  const roleName =
    normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL)
      ? 'admin'
      : await getUserRoleNameServer(userId, db);

  if (!canAccessTaskConversation({ userId, roleName, task })) {
    return { error: 'No tienes acceso a esta conversación.', status: 403 };
  }

  return { task, roleName };
}
