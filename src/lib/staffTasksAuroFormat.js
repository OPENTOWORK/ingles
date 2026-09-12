export function compactTaskForAssistant(task) {
  const assignee = task.asignado?.nombre || task.asignado?.email || '';
  const fase = task.fase?.nombre || '';
  const subfase = task.subfase?.nombre || '';
  return {
    id: task.id,
    titulo: task.titulo,
    descripcion: task.descripcion || '',
    estado: task.estado,
    displayEstado: task.displayEstado || task.estado,
    prioridad: task.prioridad || 'media',
    fecha_limite: task.fecha_limite,
    asignado: assignee,
    asignado_id: task.asignado_id || null,
    fase,
    fase_id: task.fase_id || null,
    subfase,
    subfase_id: task.subfase_id || null,
    enlace: task.enlace || '',
    isOverdue: Boolean(task.isOverdue),
    timeRemaining: task.timeRemaining || '',
    cumplimiento: task.cumplimiento || '',
    completada_at: task.completada_at || null,
  };
}

export function buildStaffTasksAssistantBrief({
  summary = {},
  activeTasks = [],
  pendingTasks = [],
  overdueTasks = [],
  completedTasks = [],
  phases = [],
  subphases = [],
}) {
  const lines = [
    `Panel de tareas Dralo — ${new Date().toISOString()}`,
    `Resumen activas: ${summary.total ?? 0} tareas | pendientes ${summary.pending ?? 0} | en progreso ${summary.inProgress ?? 0} | vencidas ${summary.overdue ?? 0} | bloqueadas ${summary.blocked ?? 0}`,
    `Completadas (tareas + subfases + fases): ${summary.completed ?? 0} (${summary.completedTasks ?? 0} tareas, ${summary.completedSubphases ?? 0} subfases, ${summary.completedPhases ?? 0} fases)`,
    `Fases visibles en panel: ${phases.length}. Subfases visibles: ${subphases.length}.`,
  ];

  if (pendingTasks.length) {
    lines.push('', 'Tareas pendientes activas:');
    pendingTasks.forEach((task, index) => {
      lines.push(
        `${index + 1}. ${task.titulo}${task.asignado ? ` — ${task.asignado}` : ''}${task.fecha_limite ? ` — plazo ${task.fecha_limite}` : ''}`,
      );
    });
  } else {
    lines.push('', 'No hay tareas pendientes activas en el panel.');
  }

  if (overdueTasks.length) {
    lines.push('', 'Tareas vencidas activas:');
    overdueTasks.forEach((task, index) => {
      lines.push(`${index + 1}. ${task.titulo}${task.asignado ? ` — ${task.asignado}` : ''}`);
    });
  }

  if (completedTasks.length) {
    lines.push('', `Tareas completadas (incl. heredadas de fase/subfase): ${completedTasks.length}`);
  }

  return lines.join('\n');
}
