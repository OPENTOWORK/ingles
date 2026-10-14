const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MAX_TASK_ASSIGNEES = 30;

/** Ids únicos y válidos. Si no llega la lista, usa la persona única antigua. */
export function parseTaskAssigneeIds(body = {}) {
  const raw = Array.isArray(body?.asignados_ids) ? body.asignados_ids : [];
  const ids = [];
  for (const value of raw) {
    const id = String(value || '').trim();
    if (!UUID_RE.test(id) || ids.includes(id)) continue;
    ids.push(id);
  }
  if (!ids.length) {
    const single = String(body?.asignado_id || '').trim();
    if (UUID_RE.test(single)) ids.push(single);
  }
  return ids;
}

/** Ids ya guardados, también si no tienen forma de UUID. */
export function taskAssigneeIds(task = {}) {
  const raw = Array.isArray(task?.asignados_ids) ? task.asignados_ids : [];
  const ids = [];
  for (const value of raw) {
    const id = String(value || '').trim();
    if (!id || ids.includes(id)) continue;
    ids.push(id);
  }
  if (!ids.length) {
    const single = String(task?.asignado_id || '').trim();
    if (single) ids.push(single);
  }
  return ids;
}

export function taskIncludesAssignee(task, userId) {
  const id = String(userId || '').trim().toLowerCase();
  if (!id) return false;
  return taskAssigneeIds(task).some((assigneeId) => assigneeId.toLowerCase() === id);
}

/** Personas enriquecidas. Si solo está el campo antiguo, usa esa. */
export function taskAssigneePeople(task = {}) {
  if (Array.isArray(task.asignados) && task.asignados.length) return task.asignados;
  return task.asignado ? [task.asignado] : [];
}

export function formatTaskAssigneeLabel(task, fallback = 'Sin asignar') {
  const names = taskAssigneePeople(task)
    .map((person) => person?.nombre || person?.email)
    .filter(Boolean);
  if (names.length) return names.join(', ');
  return String(task?.asignado_rol || '').trim() || fallback;
}

/** Una tarea compartida cuenta para cada persona. */
export function buildAssigneeTaskChart(tasks = []) {
  const byPerson = new Map();

  for (const task of tasks) {
    const people = taskAssigneePeople(task);
    const targets = people.length ? people : [{ id: 'unassigned', nombre: 'Sin asignar' }];
    for (const person of targets) {
      const key = person.id || person.email || person.nombre || 'unassigned';
      const row = byPerson.get(key) || {
        name: person.nombre || person.email || 'Sin asignar',
        pendientes: 0,
        completadas: 0,
      };
      if (task.estado === 'completada') row.completadas += 1;
      else if (task.estado !== 'cancelada') row.pendientes += 1;
      byPerson.set(key, row);
    }
  }

  return [...byPerson.values()]
    .filter((row) => row.pendientes + row.completadas > 0)
    .sort((a, b) => b.pendientes + b.completadas - (a.pendientes + a.completadas));
}
