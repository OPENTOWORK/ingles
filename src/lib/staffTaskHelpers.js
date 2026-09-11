import { TASK_ESTADOS } from '@/lib/staffTasksConstants';

const TERMINAL_ESTADOS = new Set(['completada', 'cancelada']);
const PANEL_HIDDEN_TASK_ESTADOS = new Set(['completada', 'cancelada']);

/** Fecha corta en español: 01/12/2026 */
export function formatStaffDateLabel(value) {
  if (!value) return '';
  const str = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return str;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Fecha y hora en español: 01/12/2026, 14:30 */
export function formatStaffDateTimeLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isTaskTerminal(estado = '') {
  return TERMINAL_ESTADOS.has(estado);
}

export function isPanelPhaseComplete(estado = '') {
  return estado === 'completada';
}

export function isPanelTaskHidden(estado = '') {
  return PANEL_HIDDEN_TASK_ESTADOS.has(estado);
}

/** Tarea completada explícitamente o heredada de una fase/subfase completada. */
export function isTaskCompleteForPanel(task) {
  if (!task) return false;
  if (task.estado === 'completada') return true;
  if (isPanelPhaseComplete(task.subfase?.estado)) return true;
  if (isPanelPhaseComplete(task.fase?.estado)) return true;
  return false;
}

export function isTaskVisibleInMainPanel(task) {
  if (!task) return false;
  if (task.estado === 'cancelada') return false;
  return !isTaskCompleteForPanel(task);
}

function isPanelItemOverdue(item, now = new Date()) {
  if (isPanelPhaseComplete(item?.estado)) return false;
  if (!item?.fecha_limite) return false;
  return new Date(item.fecha_limite) < now;
}

function phaseEstadoForTaskFilter(estadoFilter = '') {
  if (estadoFilter === 'pendiente') return 'no_iniciada';
  return estadoFilter;
}

function matchesPanelPhaseFilter(
  item,
  { estadoFilter = '', cumplimientoFilter = '', tasks = [], kind = 'phase' } = {},
) {
  if (cumplimientoFilter === 'a_tiempo') {
    return isPanelPhaseComplete(item.estado);
  }

  if (!estadoFilter) {
    return !isPanelPhaseComplete(item.estado);
  }

  if (estadoFilter === 'completada') {
    return isPanelPhaseComplete(item.estado);
  }

  if (estadoFilter === 'vencida') {
    if (isPanelItemOverdue(item)) return true;
    const childTasks = (tasks || []).filter((task) =>
      kind === 'subphase' ? task.subfase_id === item.id : task.fase_id === item.id,
    );
    return childTasks.some((task) => isTaskOverdue(task));
  }

  const mappedEstado = phaseEstadoForTaskFilter(estadoFilter);
  if (['no_iniciada', 'en_progreso', 'en_revision', 'bloqueada'].includes(mappedEstado)) {
    return item.estado === mappedEstado;
  }

  return !isPanelPhaseComplete(item.estado);
}

/** Tareas visibles en el panel principal (oculta completadas/canceladas salvo filtro explícito). */
export function filterPanelTasks(tasks = [], estadoFilter = '', cumplimientoFilter = '') {
  if (cumplimientoFilter === 'a_tiempo') {
    return (tasks || []).filter((task) => getCumplimientoLabel(task) === 'completada_a_tiempo');
  }

  if (estadoFilter === 'vencida') {
    return (tasks || []).filter((task) => isTaskOverdue(task));
  }

  if (estadoFilter === 'completada') {
    return (tasks || []).filter((task) => isTaskCompleteForPanel(task));
  }

  if (estadoFilter === 'cancelada') {
    return (tasks || []).filter((task) => task.estado === 'cancelada');
  }

  if (estadoFilter) {
    return (tasks || []).filter(
      (task) => task.estado === estadoFilter && isTaskVisibleInMainPanel(task),
    );
  }

  return (tasks || []).filter((task) => isTaskVisibleInMainPanel(task));
}

export function filterPanelPhases(phases = [], estadoFilter = '', tasks = [], cumplimientoFilter = '') {
  return (phases || []).filter((phase) =>
    matchesPanelPhaseFilter(phase, { estadoFilter, cumplimientoFilter, tasks, kind: 'phase' }),
  );
}

/** Items para tableros Kanban (incluye completadas; respeta filtro de estado si está activo). */
export function filterKanbanTasks(tasks = [], estadoFilter = '') {
  if (estadoFilter === 'vencida') {
    return (tasks || []).filter((task) => isTaskOverdue(task));
  }
  if (estadoFilter === 'completada' || estadoFilter === 'cancelada') {
    return (tasks || []).filter((task) => task.estado === estadoFilter);
  }
  if (estadoFilter) {
    return (tasks || []).filter((task) => task.estado === estadoFilter);
  }
  return (tasks || []).filter((task) => task.estado !== 'cancelada');
}

export function filterKanbanSubphases(subphases = [], faseId = '') {
  if (!faseId) return subphases || [];
  return (subphases || []).filter((subphase) => subphase.fase_id === faseId);
}

export function filterPanelSubphases(
  subphases = [],
  faseId = '',
  estadoFilter = '',
  tasks = [],
  cumplimientoFilter = '',
) {
  return (subphases || []).filter((subphase) => {
    if (faseId && subphase.fase_id !== faseId) return false;
    return matchesPanelPhaseFilter(subphase, {
      estadoFilter,
      cumplimientoFilter,
      tasks,
      kind: 'subphase',
    });
  });
}

/** Métricas del panel: tareas activas + contador de completadas (tareas, subfases y fases). */
export function computePanelSummary(tasks = [], phases = [], subphases = []) {
  const activeTasks = tasks.filter((task) => isTaskVisibleInMainPanel(task));
  const metrics = computeTaskMetrics(activeTasks);
  const completedTasks = tasks.filter((task) => isTaskCompleteForPanel(task)).length;
  const completedSubphases = subphases.filter((subphase) =>
    isPanelPhaseComplete(subphase.estado),
  ).length;
  const completedPhases = phases.filter((phase) => isPanelPhaseComplete(phase.estado)).length;

  return {
    ...metrics,
    completed: completedTasks + completedSubphases + completedPhases,
    completedTasks,
    completedSubphases,
    completedPhases,
  };
}

export function isTaskOverdue(task, now = new Date()) {
  if (!task?.fecha_limite || isTaskTerminal(task.estado)) return false;
  return new Date(task.fecha_limite) < now;
}

export function getDisplayEstado(task, now = new Date()) {
  if (isTaskOverdue(task, now)) return 'vencida';
  return task?.estado || 'pendiente';
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function getTimeRemainingLabel(task, now = new Date()) {
  if (!task?.fecha_limite) return 'Sin fecha límite';
  if (isTaskTerminal(task.estado)) return '—';

  const due = new Date(task.fecha_limite);
  const today = startOfDay(now);
  const dueDay = startOfDay(due);
  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return abs === 1 ? 'Vencida hace 1 día' : `Vencida hace ${abs} días`;
  }
  if (diffDays === 0) return 'Vence hoy';
  if (diffDays === 1) return 'Mañana';
  return `En ${diffDays} días`;
}

export function getCumplimientoLabel(task, now = new Date()) {
  if (!task?.fecha_limite) return 'sin_fecha';
  const due = new Date(task.fecha_limite);

  if (task.estado === 'completada') {
    const completedAt = task.completada_at ? new Date(task.completada_at) : null;
    if (!completedAt) return 'completada_a_tiempo';
    return completedAt > due ? 'completada_tarde' : 'completada_a_tiempo';
  }

  if (isTaskTerminal(task.estado)) return 'sin_fecha';
  if (due < now) return 'vencida';
  return 'a_tiempo';
}

export function computeTaskMetrics(tasks = [], now = new Date()) {
  const list = tasks || [];
  const total = list.length;
  const completed = list.filter((t) => t.estado === 'completada').length;
  const pending = list.filter((t) => t.estado === 'pendiente').length;
  const inProgress = list.filter((t) => t.estado === 'en_progreso').length;
  const inReview = list.filter((t) => t.estado === 'en_revision').length;
  const blocked = list.filter((t) => t.estado === 'bloqueada').length;
  const cancelled = list.filter((t) => t.estado === 'cancelada').length;
  const overdue = list.filter((t) => isTaskOverdue(t, now)).length;
  const onTimeCompleted = list.filter(
    (t) => getCumplimientoLabel(t, now) === 'completada_a_tiempo',
  ).length;
  const compliancePct = total ? Math.round((onTimeCompleted / total) * 100) : 0;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    pending,
    inProgress,
    inReview,
    completed,
    overdue,
    blocked,
    cancelled,
    compliancePct,
    completionPct,
  };
}

export function computePhaseProgress(phaseId, tasks = []) {
  const phaseTasks = (tasks || []).filter((t) => t.fase_id === phaseId);
  if (!phaseTasks.length) {
    return { total: 0, completed: 0, pct: 0, label: 'Sin tareas' };
  }
  const completed = phaseTasks.filter((t) => t.estado === 'completada').length;
  const pct = Math.round((completed / phaseTasks.length) * 100);
  return {
    total: phaseTasks.length,
    completed,
    pct,
    label: `${pct}%`,
  };
}

export function computeSubphaseProgress(subphaseId, tasks = []) {
  const subTasks = (tasks || []).filter((t) => t.subfase_id === subphaseId);
  if (!subTasks.length) {
    return { total: 0, completed: 0, pct: 0, label: 'Sin tareas' };
  }
  const completed = subTasks.filter((t) => t.estado === 'completada').length;
  const pct = Math.round((completed / subTasks.length) * 100);
  return {
    total: subTasks.length,
    completed,
    pct,
    label: `${pct}%`,
  };
}

export function matchesFechaLimiteFilter(task, filter, now = new Date()) {
  if (!filter) return true;
  if (!task?.fecha_limite) return filter === 'sin_fecha';

  const due = new Date(task.fecha_limite);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfDay(addDays(now, 7 - now.getDay()));
  const prox7 = endOfDay(addDays(now, 7));

  switch (filter) {
    case 'hoy':
      return due >= todayStart && due <= todayEnd;
    case 'semana':
      return due >= todayStart && due <= weekEnd;
    case 'prox7':
      return due >= todayStart && due <= prox7;
    case 'vencidas':
      return isTaskOverdue(task, now);
    default:
      return true;
  }
}

export function filterTasksClientSide(tasks, filters = {}, now = new Date()) {
  const q = String(filters.search || '')
    .trim()
    .toLowerCase();
  const roleFilter = String(filters.rol || '').trim();
  const faseFilter = String(filters.faseId || '').trim();
  const subfaseFilter = String(filters.subfaseId || '').trim();
  const assigneeFilter = String(filters.assigneeId || '').trim();
  const estadoFilter = String(filters.estado || '').trim();
  const prioridadFilter = String(filters.prioridad || '').trim();
  const fechaFilter = String(filters.fechaLimite || '').trim();

  return (tasks || []).filter((task) => {
    if (assigneeFilter && task.asignado_id !== assigneeFilter) return false;
    if (faseFilter && task.fase_id !== faseFilter) return false;
    if (subfaseFilter && task.subfase_id !== subfaseFilter) return false;
    if (prioridadFilter && task.prioridad !== prioridadFilter) return false;
    if (roleFilter && task.asignado_rol !== roleFilter) return false;

    if (estadoFilter) {
      if (estadoFilter === 'vencida') {
        if (!isTaskOverdue(task, now)) return false;
      } else if (task.estado !== estadoFilter) {
        return false;
      }
    }

    if (!matchesFechaLimiteFilter(task, fechaFilter, now)) return false;

    if (q) {
      const haystack = [task.titulo, task.descripcion, task.notas]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function validateTaskPayload(body = {}) {
  const titulo = String(body.titulo || '').trim();
  const asignado_id = body.asignado_id ? String(body.asignado_id) : null;
  const asignado_rol = String(body.asignado_rol || '').trim() || null;
  const estado = String(body.estado || 'pendiente').trim();
  const prioridad = String(body.prioridad || 'media').trim();

  if (!titulo) return { ok: false, error: 'El título es obligatorio.' };
  if (!asignado_id) {
    return { ok: false, error: 'Indica la persona asignada.' };
  }
  if (!TASK_ESTADOS.includes(estado)) {
    return { ok: false, error: 'Estado no válido.' };
  }

  return {
    ok: true,
    data: {
      titulo,
      descripcion: String(body.descripcion || '').trim() || null,
      estado,
      prioridad,
      fase_id: body.fase_id ? String(body.fase_id) : null,
      subfase_id: body.subfase_id ? String(body.subfase_id) : null,
      asignado_id,
      asignado_rol,
      alumno_id: body.alumno_id ? String(body.alumno_id) : null,
      fecha_limite: body.fecha_limite || null,
      enlace: String(body.enlace || '').trim() || null,
      notas: String(body.notas || '').trim() || null,
      bloqueada_motivo: String(body.bloqueada_motivo || '').trim() || null,
      checklist: Array.isArray(body.checklist) ? body.checklist : [],
    },
  };
}

export function enrichTaskRow(task, profilesById = {}, phasesById = {}, subphasesById = {}) {
  const asignado = task.asignado_id ? profilesById[task.asignado_id] : null;
  const alumno = task.alumno_id ? profilesById[task.alumno_id] : null;
  const fase = task.fase_id ? phasesById[task.fase_id] : null;
  const subfase = task.subfase_id ? subphasesById[task.subfase_id] : null;
  const now = new Date();

  return {
    ...task,
    asignado,
    alumno,
    fase,
    subfase,
    displayEstado: getDisplayEstado(task, now),
    timeRemaining: getTimeRemainingLabel(task, now),
    cumplimiento: getCumplimientoLabel(task, now),
    isOverdue: isTaskOverdue(task, now),
  };
}
