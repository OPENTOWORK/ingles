import { getServiceDb, isSchemaNotReadyError, listStaffAssignees } from '@/lib/coordinatorAccess';
import {
  buildPanelLookupMaps,
  computePanelSummary,
  computePhaseProgress,
  computeSubphaseProgress,
  filterPanelTasks,
  isTaskCompleteForPanel,
  isTaskVisibleInMainPanel,
} from '@/lib/staffTaskHelpers';
import {
  buildStaffTasksAssistantBrief,
  compactTaskForAssistant,
} from '@/lib/staffTasksAuroFormat';
import { enrichTasksList, probeStaffTasksTable } from '@/lib/staffTasksServer';

const FASES_TABLE = 'staff_fases';
const SUBFASES_TABLE = 'staff_subfases';
const TASKS_TABLE = 'staff_tareas';
const TEMPLATES_TABLE = 'staff_tarea_plantillas';

function getPhaseResponsableIds(row = {}) {
  if (row.responsables_todos) return [];
  if (Array.isArray(row.responsables_ids) && row.responsables_ids.length > 0) {
    return row.responsables_ids.filter(Boolean);
  }
  if (row.responsable_id) return [row.responsable_id];
  return [];
}

function mapPhaseRow(row, tasks = []) {
  const progress = computePhaseProgress(row.id, tasks);
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    estado: row.estado,
    orden: row.orden,
    fecha_inicio: row.fecha_inicio,
    fecha_limite: row.fecha_limite,
    responsable_id: row.responsable_id,
    responsable_rol: row.responsable_rol || '',
    responsables_ids: getPhaseResponsableIds(row),
    responsables_todos: row.responsables_todos === true,
    visible_para_todos: row.visible_para_todos !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    taskCount: progress.total,
    completedCount: progress.completed,
    progressPct: progress.pct,
    progressLabel: progress.label,
  };
}

function mapSubphaseRow(row, tasks = [], phasesById = {}) {
  const progress = computeSubphaseProgress(row.id, tasks);
  const fase = row.fase_id ? phasesById[row.fase_id] : null;
  return {
    id: row.id,
    fase_id: row.fase_id,
    fase_nombre: fase?.nombre || '',
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    estado: row.estado,
    orden: row.orden,
    fecha_inicio: row.fecha_inicio,
    fecha_limite: row.fecha_limite,
    visible_para_todos: row.visible_para_todos !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    taskCount: progress.total,
    completedCount: progress.completed,
    progressPct: progress.pct,
    progressLabel: progress.label,
  };
}

function mapTemplateRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    titulo: row.titulo,
    descripcion: row.descripcion || '',
    enlace: row.enlace || '',
    prioridad_default: row.prioridad_default || 'media',
    asignado_rol_default: row.asignado_rol_default || '',
    fase_id: row.fase_id || '',
    checklist_default: row.checklist_default || [],
    notas_default: row.notas_default || '',
    activa: row.activa !== false,
    creado_por: row.creado_por,
    creado_en: row.creado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function loadStaffTasksPanelSnapshot(options = {}) {
  const db = getServiceDb('');
  const estadoFilter = String(options.estado || '').trim();
  const assigneeId = String(options.assigneeId || '').trim();

  const tasksProbe = await probeStaffTasksTable(db);
  if (isSchemaNotReadyError(tasksProbe.error)) {
    return {
      tablesReady: false,
      phases: [],
      subphases: [],
      tasks: [],
      templates: [],
      assignees: [],
      summary: computePanelSummary([], [], []),
      lists: {
        active: [],
        pending: [],
        overdue: [],
        completed: [],
      },
      assistantBrief: 'El panel de tareas aún no está migrado en Supabase.',
    };
  }

  const [phasesRes, subphasesRes, tasksRes, templatesRes, assigneesRes] = await Promise.all([
    db.from(FASES_TABLE).select('*').order('orden', { ascending: true }),
    db.from(SUBFASES_TABLE).select('*').order('orden', { ascending: true }),
    db.from(TASKS_TABLE).select('*').order('created_at', { ascending: false }).limit(1000),
    db.from(TEMPLATES_TABLE).select('*').eq('activa', true).order('nombre', { ascending: true }),
    listStaffAssignees(db),
  ]);

  if (phasesRes.error && !isSchemaNotReadyError(phasesRes.error)) {
    throw phasesRes.error;
  }
  if (subphasesRes.error && !isSchemaNotReadyError(subphasesRes.error)) {
    throw subphasesRes.error;
  }
  if (tasksRes.error) throw tasksRes.error;
  if (templatesRes.error && !isSchemaNotReadyError(templatesRes.error)) {
    throw templatesRes.error;
  }

  const rawTasks = (tasksRes.data || []).filter((task) => {
    if (assigneeId && task.asignado_id !== assigneeId) return false;
    return true;
  });

  const enrichedTasks = await enrichTasksList(db, rawTasks);
  const { phasesById, subphasesById } = buildPanelLookupMaps(
    phasesRes.data || [],
    subphasesRes.data || [],
  );

  const phasesByIdNombre = Object.fromEntries(
    (phasesRes.data || []).map((phase) => [phase.id, phase]),
  );

  const phases = (phasesRes.data || []).map((phase) => mapPhaseRow(phase, enrichedTasks));
  const subphases = (subphasesRes.data || []).map((subphase) =>
    mapSubphaseRow(subphase, enrichedTasks, phasesByIdNombre),
  );
  const templates = (templatesRes.data || []).map(mapTemplateRow).filter(Boolean);
  const assignees = assigneesRes.assignees || [];

  const visibleTasks = filterPanelTasks(
    enrichedTasks,
    estadoFilter,
    '',
    phasesById,
    subphasesById,
  );

  const activeTasks = enrichedTasks
    .filter((task) => isTaskVisibleInMainPanel(task, phasesById, subphasesById))
    .map(compactTaskForAssistant);

  const pendingTasks = activeTasks.filter((task) => task.estado === 'pendiente');
  const overdueTasks = activeTasks.filter((task) => task.isOverdue);
  const completedTasks = enrichedTasks
    .filter((task) => isTaskCompleteForPanel(task, phasesById, subphasesById))
    .map(compactTaskForAssistant);

  const summary = computePanelSummary(enrichedTasks, phases, subphases);
  const assistantBrief = buildStaffTasksAssistantBrief({
    summary,
    activeTasks,
    pendingTasks,
    overdueTasks,
    completedTasks,
    phases: phases.filter((phase) => phase.estado !== 'completada'),
    subphases: subphases.filter((subphase) => subphase.estado !== 'completada'),
  });

  return {
    tablesReady: true,
    generatedAt: new Date().toISOString(),
    filters: {
      estado: estadoFilter || null,
      assigneeId: assigneeId || null,
    },
    summary,
    phases,
    subphases,
    tasks: visibleTasks.map(compactTaskForAssistant),
    templates,
    assignees,
    lists: {
      active: activeTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      completed: completedTasks,
    },
    assistantBrief,
  };
}
