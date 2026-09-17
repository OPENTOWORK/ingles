import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';
import { TASK_ESTADO_LABELS } from '@/lib/staffTasksConstants';

function previewMessage(body, max = 280) {
  const text = String(body || '').trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/**
 * Aviso a los involucrados cuando hay un mensaje pendiente en el chat de una tarea.
 */
export async function sendStaffTaskMessageEmail({
  task,
  recipient,
  sender = {},
  messageBody = '',
  taskUrl = '',
  adminClient = null,
}) {
  const to = String(recipient?.email || '').trim().toLowerCase();
  if (!to) {
    return { sent: false, skipped: true, error: 'Destinatario sin email.' };
  }

  const url = taskUrl || '';
  const result = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.STAFF_TASK_MESSAGE,
    to,
    variables: {
      email: to,
      nombre: formatNombreVariable(recipient?.nombre),
      sender_name: String(sender?.nombre || sender?.email || 'Un miembro del equipo').trim(),
      task_titulo: String(task?.titulo || '').trim() || 'Sin título',
      task_estado: TASK_ESTADO_LABELS[task?.estado] || task?.estado || '',
      message_preview: previewMessage(messageBody),
      task_url: url ? `Ver conversación: ${url}` : '',
    },
  });

  if (result.sent || result.queued) {
    return { sent: true, queued: result.queued, channel: result.results?.[0]?.channel };
  }

  return { sent: false, error: result.error || 'Correo de mensaje no configurado.' };
}
