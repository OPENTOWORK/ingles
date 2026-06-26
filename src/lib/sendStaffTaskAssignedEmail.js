import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { formatStaffDateLabel } from '@/lib/staffTaskHelpers';
import {
  TASK_ESTADO_LABELS,
  TASK_PRIORIDAD_LABELS,
} from '@/lib/staffTasksConstants';

function buildTasksPanelUrl() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  return `${base.replace(/\/$/, '')}/tareas/`;
}

function buildTaskAssignedVariables(task, creatorName = '') {
  const faseNombre = task?.fase?.nombre || '';
  const subfaseNombre = task?.subfase?.nombre || '';
  const descripcion = String(task?.descripcion || '').trim();
  const fechaLimite = formatStaffDateLabel(task?.fecha_limite);

  return {
    name: task?.asignado?.nombre || '',
    email: task?.asignado?.email || '',
    creator_name: String(creatorName || '').trim() || 'Un miembro del equipo',
    task_titulo: String(task?.titulo || '').trim() || 'Sin título',
    task_prioridad: TASK_PRIORIDAD_LABELS[task?.prioridad] || task?.prioridad || '',
    task_estado: TASK_ESTADO_LABELS[task?.estado] || task?.estado || '',
    task_fase: faseNombre,
    task_subfase: subfaseNombre,
    task_fecha_limite: fechaLimite,
    task_fase_line: faseNombre ? `Fase: ${faseNombre}` : '',
    task_subfase_line: subfaseNombre ? `Subfase: ${subfaseNombre}` : '',
    task_fecha_line: fechaLimite ? `Fecha límite: ${fechaLimite}` : '',
    task_descripcion_line: descripcion ? `Descripción: ${descripcion}` : '',
    task_enlace: String(task?.enlace || '').trim(),
    tasks_url: `Panel de tareas: ${buildTasksPanelUrl()}`,
  };
}

/**
 * Aviso al responsable cuando se le asigna una tarea nueva.
 */
export async function sendStaffTaskAssignedEmail({
  task,
  creatorName = '',
  adminClient = null,
}) {
  const to = String(task?.asignado?.email || '').trim().toLowerCase();
  if (!to) {
    return { sent: false, skipped: true, error: 'La tarea no tiene persona asignada con email.' };
  }

  const result = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.STAFF_TASK_ASSIGNED,
    to,
    variables: buildTaskAssignedVariables(task, creatorName),
  });

  if (result.sent || result.queued) {
    return {
      sent: true,
      queued: result.queued,
      channel: result.results?.[0]?.channel,
    };
  }

  return {
    sent: false,
    error: result.error || 'Correo de asignación no configurado.',
  };
}
