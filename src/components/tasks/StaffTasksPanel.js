'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStaffRoleLabel } from '@/utils/staffBuzon';
import { staffTasksFetch } from '@/lib/staffTasksClient';
import {
  CUMPLIMIENTO_LABELS,
  EMPTY_FASE_FORM,
  EMPTY_SUBFASE_FORM,
  EMPTY_TASK_FORM,
  FECHA_LIMITE_FILTERS,
  TASK_ESTADOS,
  TASK_ESTADO_LABELS,
  TASK_PRIORIDADES,
  TASK_PRIORIDAD_LABELS,
} from '@/lib/staffTasksConstants';
import {
  canCancelStaffTask,
  canDeleteStaffTask,
  canManageStaffPhases,
  canPickAnyAssignee,
  getStaffDepartmentLabel,
  shouldShowSchemaSetupHint,
} from '@/lib/staffTasksPermissions';
import { formatStaffDateLabel, formatStaffDateTimeLabel } from '@/lib/staffTaskHelpers';
import StaffTaskTemplatesSection from '@/components/tasks/StaffTaskTemplatesSection';
import StaffTaskFormModal, { ROL_OPTIONS } from '@/components/tasks/StaffTaskFormModal';
import StaffPhaseFormModal from '@/components/tasks/StaffPhaseFormModal';
import StaffSubphaseFormModal from '@/components/tasks/StaffSubphaseFormModal';
import {
  CumplimientoBadge,
  FaseEstadoBadge,
  ProgressBar,
  TaskEstadoBadge,
  TaskPrioridadBadge,
  TaskTableAssigneeCell,
  TaskTableDeadlineCell,
  TaskTableLocationCell,
  TaskTableTitleCell,
} from '@/components/tasks/StaffTaskBadges';

function MetricCard({ label, value, hint, accent = 'violet' }) {
  const accents = {
    violet: 'border-violet-100 bg-violet-50/50',
    amber: 'border-amber-100 bg-amber-50/50',
    emerald: 'border-emerald-100 bg-emerald-50/50',
    red: 'border-red-100 bg-red-50/50',
    blue: 'border-blue-100 bg-blue-50/50',
  };
  return (
    <div className={`rounded-xl border p-4 ${accents[accent] || accents.violet}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {hint ? <p className="text-xs text-gray-500 mt-0.5">{hint}</p> : null}
    </div>
  );
}

function formatAssigneeLabel(user) {
  const name = user?.nombre || user?.email || '—';
  const role = getStaffRoleLabel(user?.roleName || '');
  return role ? `${name} (${role})` : name;
}

function taskToForm(task) {
  if (!task) return { ...EMPTY_TASK_FORM };
  return {
    titulo: task.titulo || '',
    descripcion: task.descripcion || '',
    estado: task.estado || 'pendiente',
    prioridad: task.prioridad || 'media',
    fase_id: task.fase_id || '',
    subfase_id: task.subfase_id || '',
    asignado_id: task.asignado_id || '',
    asignado_rol: task.asignado_rol || '',
    fecha_limite: task.fecha_limite
      ? new Date(task.fecha_limite).toISOString().slice(0, 16)
      : '',
    enlace: task.enlace || '',
    notas: task.notas || '',
    bloqueada_motivo: task.bloqueada_motivo || '',
    checklist: task.checklist || [],
  };
}

function phaseToForm(phase) {
  if (!phase) return { ...EMPTY_FASE_FORM };
  const responsables_ids = phase.responsables_ids?.length
    ? phase.responsables_ids
    : phase.responsable_id
      ? [phase.responsable_id]
      : [];
  return {
    nombre: phase.nombre || '',
    descripcion: phase.descripcion || '',
    estado: phase.estado || 'no_iniciada',
    orden: phase.orden ?? 0,
    fecha_inicio: phase.fecha_inicio || '',
    fecha_limite: phase.fecha_limite || '',
    responsable_id: phase.responsable_id || '',
    responsable_rol: phase.responsable_rol || '',
    responsables_ids,
    responsables_todos: phase.responsables_todos === true,
    visible_para_todos: phase.visible_para_todos !== false,
  };
}

function subphaseToForm(subphase) {
  if (!subphase) return { ...EMPTY_SUBFASE_FORM };
  return {
    fase_id: subphase.fase_id || '',
    nombre: subphase.nombre || '',
    descripcion: subphase.descripcion || '',
    estado: subphase.estado || 'no_iniciada',
    orden: subphase.orden ?? 0,
    fecha_inicio: subphase.fecha_inicio || '',
    fecha_limite: subphase.fecha_limite || '',
    visible_para_todos: subphase.visible_para_todos !== false,
  };
}

function formatPhaseResponsablesLabel(phase) {
  if (phase.responsables_todos) return 'Todo el equipo';
  const list = phase.responsables?.length
    ? phase.responsables
    : phase.responsable
      ? [phase.responsable]
      : [];
  if (!list.length) return null;
  return list
    .map((person) => {
      const name = person.nombre || person.email || 'Staff';
      const role = person.roleName ? getStaffRoleLabel(person.roleName) : '';
      return role ? `${name} (${role})` : name;
    })
    .join(', ');
}

export default function StaffTasksPanel({ currentUserId, userRole, embedded = false }) {
  const canPickAssignee = canPickAnyAssignee(userRole);
  const canManagePhases = canManageStaffPhases(userRole);
  const canDelete = canDeleteStaffTask(userRole);
  const canCancel = canCancelStaffTask(userRole);

  const [assignees, setAssignees] = useState([]);
  const [phases, setPhases] = useState([]);
  const [subphases, setSubphases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({});
  const [tasksReady, setTasksReady] = useState(null);
  const [phasesReady, setPhasesReady] = useState(null);
  const [subphasesReady, setSubphasesReady] = useState(null);
  const [phasesLoading, setPhasesLoading] = useState(true);
  const [phasesError, setPhasesError] = useState('');
  const [templatesReady, setTemplatesReady] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    assigneeId: '',
    rol: '',
    faseId: '',
    subfaseId: '',
    estado: '',
    prioridad: '',
    fechaLimite: '',
    search: '',
  });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ ...EMPTY_TASK_FORM });
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [phaseForm, setPhaseForm] = useState({ ...EMPTY_FASE_FORM });
  const [editingPhaseId, setEditingPhaseId] = useState(null);

  const [subphaseModalOpen, setSubphaseModalOpen] = useState(false);
  const [subphaseForm, setSubphaseForm] = useState({ ...EMPTY_SUBFASE_FORM });
  const [editingSubphaseId, setEditingSubphaseId] = useState(null);

  const [detailTask, setDetailTask] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const loadAssignees = useCallback(async () => {
    const data = await staffTasksFetch('/api/coordinator/staff-assignees', {}, { soft: true });
    if (!data.error) setAssignees(data.assignees || []);
  }, []);

  const loadPhases = useCallback(async () => {
    setPhasesLoading(true);
    setPhasesError('');
    try {
      const data = await staffTasksFetch('/api/coordinator/phases', {}, { soft: true });
      if (data.error) {
        setPhasesError(data.error);
        return;
      }
      setPhases(data.phases || []);
      if (typeof data.tablesReady === 'boolean') setPhasesReady(data.tablesReady);
    } finally {
      setPhasesLoading(false);
    }
  }, []);

  const loadSubphases = useCallback(async () => {
    const data = await staffTasksFetch('/api/coordinator/subphases', {}, { soft: true });
    if (!data.error) {
      setSubphases(data.subphases || []);
      if (typeof data.tablesReady === 'boolean') setSubphasesReady(data.tablesReady);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    const data = await staffTasksFetch('/api/coordinator/task-templates', {}, { soft: true });
    if (!data.error) {
      setTemplates(data.templates || []);
      if (typeof data.tablesReady === 'boolean') setTemplatesReady(data.tablesReady);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
      if (filters.estado) params.set('estado', filters.estado);
      if (filters.faseId) params.set('faseId', filters.faseId);
      if (filters.subfaseId) params.set('subfaseId', filters.subfaseId);
      if (filters.prioridad) params.set('prioridad', filters.prioridad);
      if (filters.search) params.set('search', filters.search);
      if (filters.rol) params.set('rol', filters.rol);
      if (filters.fechaLimite) params.set('fechaLimite', filters.fechaLimite);

      const qs = params.toString();
      const data = await staffTasksFetch(
        `/api/coordinator/tasks${qs ? `?${qs}` : ''}`,
        {},
        { soft: true },
      );
      if (data.error) {
        setError(data.error);
        return;
      }
      setTasks(data.tasks || []);
      setSummary(data.summary || {});
      if (typeof data.tablesReady === 'boolean') setTasksReady(data.tablesReady);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadAssignees();
    void loadPhases();
    void loadSubphases();
    void loadTemplates();
  }, [loadAssignees, loadPhases, loadSubphases, loadTemplates]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const taskAssignee = useMemo(
    () => assignees.find((u) => u.id === taskForm.asignado_id),
    [assignees, taskForm.asignado_id],
  );

  const openNewTask = (template = null) => {
    const base = {
      ...EMPTY_TASK_FORM,
      asignado_id: filters.assigneeId || '',
      asignado_rol: template?.asignado_rol_default || '',
      fase_id: template?.fase_id || filters.faseId || '',
      subfase_id: filters.subfaseId || '',
      prioridad: template?.prioridad_default || 'media',
    };
    if (template) {
      Object.assign(base, {
        titulo: template.titulo,
        descripcion: template.descripcion || '',
        enlace: template.enlace || '',
        notas: template.notas_default || '',
      });
    }
    setEditingTaskId(null);
    setTaskForm(base);
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm(taskToForm(task));
    setTaskModalOpen(true);
  };

  const saveTask = async (form) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        fecha_limite: form.fecha_limite ? new Date(form.fecha_limite).toISOString() : null,
        fase_id: form.fase_id || null,
        subfase_id: form.subfase_id || null,
        asignado_id: form.asignado_id || null,
        alumno_id: null,
        asignado_rol:
          form.asignado_rol ||
          (taskAssignee ? getStaffDepartmentLabel(taskAssignee.roleName) : ''),
      };
      await staffTasksFetch('/api/coordinator/tasks', {
        method: 'POST',
        body: JSON.stringify({
          action: editingTaskId ? 'update' : 'create',
          id: editingTaskId || undefined,
          ...payload,
        }),
      });
      setTaskModalOpen(false);
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const quickEstado = async (task, estado) => {
    setSaving(true);
    try {
      await staffTasksFetch('/api/coordinator/tasks', {
        method: 'POST',
        body: JSON.stringify({ action: 'updateEstado', id: task.id, estado }),
      });
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const duplicateTask = async (task) => {
    setSaving(true);
    try {
      await staffTasksFetch('/api/coordinator/tasks', {
        method: 'POST',
        body: JSON.stringify({ action: 'duplicate', id: task.id }),
      });
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    setSaving(true);
    try {
      await staffTasksFetch('/api/coordinator/tasks', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: task.id }),
      });
      setDetailTask(null);
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openNewPhase = () => {
    setEditingPhaseId(null);
    setPhaseForm({ ...EMPTY_FASE_FORM, orden: phases.length + 1 });
    setPhaseModalOpen(true);
  };

  const openEditPhase = (phase) => {
    setEditingPhaseId(phase.id);
    setPhaseForm(phaseToForm(phase));
    setPhaseModalOpen(true);
  };

  const savePhase = async (form) => {
    setSaving(true);
    try {
      await staffTasksFetch('/api/coordinator/phases', {
        method: 'POST',
        body: JSON.stringify({
          action: editingPhaseId ? 'update' : 'create',
          id: editingPhaseId || undefined,
          ...form,
          responsables_ids: form.responsables_ids || [],
          responsables_todos: form.responsables_todos === true,
        }),
      });
      setPhaseModalOpen(false);
      await loadPhases();
      await loadSubphases();
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openNewSubphase = (faseId = '') => {
    const phaseSubphases = subphases.filter((s) => s.fase_id === faseId);
    setEditingSubphaseId(null);
    setSubphaseForm({
      ...EMPTY_SUBFASE_FORM,
      fase_id: faseId || filters.faseId || phases[0]?.id || '',
      orden: phaseSubphases.length + 1,
    });
    setSubphaseModalOpen(true);
  };

  const openEditSubphase = (subphase) => {
    setEditingSubphaseId(subphase.id);
    setSubphaseForm(subphaseToForm(subphase));
    setSubphaseModalOpen(true);
  };

  const saveSubphase = async (form) => {
    setSaving(true);
    try {
      await staffTasksFetch('/api/coordinator/subphases', {
        method: 'POST',
        body: JSON.stringify({
          action: editingSubphaseId ? 'update' : 'create',
          id: editingSubphaseId || undefined,
          ...form,
        }),
      });
      setSubphaseModalOpen(false);
      await loadSubphases();
      await loadTasks();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const visibleSubphases = useMemo(() => {
    if (!filters.faseId) return subphases;
    return subphases.filter((s) => s.fase_id === filters.faseId);
  }, [subphases, filters.faseId]);

  const filterSubphases = useMemo(() => {
    if (!filters.faseId) return subphases;
    return subphases.filter((s) => s.fase_id === filters.faseId);
  }, [subphases, filters.faseId]);

  const clearFilters = () => {
    setFilters({
      assigneeId: '',
      rol: '',
      faseId: '',
      subfaseId: '',
      estado: '',
      prioridad: '',
      fechaLimite: '',
      search: '',
    });
  };

  const schemaHint = shouldShowSchemaSetupHint(tasksReady);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {!embedded ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestión de tareas</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Organiza el trabajo del equipo, controla fechas límite y revisa el avance por fases.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestión de tareas</h2>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openNewTask()}
            disabled={saving || tasksReady === false}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            + Nueva tarea
          </button>
          {canManagePhases ? (
            <>
              <button
                type="button"
                onClick={openNewPhase}
                disabled={saving || phasesReady === false}
                className="px-4 py-2 border border-violet-200 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 disabled:opacity-50"
              >
                + Nueva fase
              </button>
              <button
                type="button"
                onClick={() => openNewSubphase()}
                disabled={saving || subphasesReady === false || !phases.length}
                className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 disabled:opacity-50"
              >
                + Nueva subfase
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            {showTemplates ? 'Ocultar plantillas' : 'Plantillas'}
          </button>
        </div>
      </div>

      {schemaHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Migración pendiente en desarrollo: ejecuta{' '}
          <code className="bg-amber-100 px-1 rounded">scripts/staff_tasks_system.sql</code>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <MetricCard label="Total" value={summary.total ?? 0} accent="violet" />
        <MetricCard label="Pendientes" value={summary.pending ?? 0} accent="blue" />
        <MetricCard label="En progreso" value={summary.inProgress ?? 0} accent="blue" />
        <MetricCard label="En revisión" value={summary.inReview ?? 0} accent="amber" />
        <MetricCard label="Completadas" value={summary.completed ?? 0} accent="emerald" />
        <MetricCard label="Vencidas" value={summary.overdue ?? 0} accent="red" />
        <MetricCard label="Bloqueadas" value={summary.blocked ?? 0} accent="red" />
        <MetricCard
          label="% cumplimiento"
          value={`${summary.compliancePct ?? 0}%`}
          hint="Completadas a tiempo"
          accent="emerald"
        />
      </div>

      {/* Phases */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Fases del proyecto</h3>
            <p className="text-xs text-gray-500 mt-0.5">Visible para todo el equipo</p>
          </div>
        </div>
        {phasesError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 mb-3">
            No se pudieron cargar las fases: {phasesError}
          </div>
        ) : null}
        {phasesLoading ? (
          <p className="text-sm text-gray-500">Cargando fases…</p>
        ) : phases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No hay fases definidas.</p>
            {canManagePhases ? (
              <button
                type="button"
                onClick={openNewPhase}
                className="mt-2 text-violet-600 hover:underline text-sm"
              >
                Crear la primera fase
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border border-violet-100 bg-violet-50/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm leading-snug">{phase.nombre}</h4>
                  {canManagePhases ? (
                    <button
                      type="button"
                      onClick={() => openEditPhase(phase)}
                      className="text-xs text-violet-600 hover:underline shrink-0"
                    >
                      Editar
                    </button>
                  ) : null}
                </div>
                {phase.descripcion ? (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{phase.descripcion}</p>
                ) : null}
                <div className="mt-3 space-y-2">
                  <FaseEstadoBadge estado={phase.estado} />
                  <ProgressBar pct={phase.progressPct} />
                  <p className="text-xs text-gray-600">
                    {phase.completedCount}/{phase.taskCount} tareas · {phase.progressLabel}
                  </p>
                  {(phase.fecha_inicio || phase.fecha_limite) && (
                    <p className="text-xs text-gray-500">
                      {phase.fecha_inicio ? `Inicio: ${formatStaffDateLabel(phase.fecha_inicio)}` : ''}
                      {phase.fecha_limite
                        ? ` · Límite: ${formatStaffDateLabel(phase.fecha_limite)}`
                        : ''}
                    </p>
                  )}
                  {formatPhaseResponsablesLabel(phase) ? (
                    <p className="text-xs text-gray-500">
                      Resp.: {formatPhaseResponsablesLabel(phase)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, faseId: phase.id, subfaseId: '' }))}
                  className="mt-3 text-xs text-violet-700 hover:underline"
                >
                  Ver tareas de esta fase
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subphases */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Subfases del proyecto</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {filters.faseId
                ? 'Subfases de la fase seleccionada'
                : 'Desglose dentro de cada fase'}
            </p>
          </div>
          {canManagePhases && phases.length ? (
            <button
              type="button"
              onClick={() => openNewSubphase(filters.faseId)}
              disabled={saving || subphasesReady === false}
              className="text-sm text-indigo-700 hover:underline disabled:opacity-50"
            >
              + Nueva subfase
            </button>
          ) : null}
        </div>
        {loading && !subphases.length ? (
          <p className="text-sm text-gray-500">Cargando subfases…</p>
        ) : !phases.length ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Crea primero una fase para añadir subfases.
          </p>
        ) : visibleSubphases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No hay subfases definidas{filters.faseId ? ' en esta fase' : ''}.</p>
            {canManagePhases ? (
              <button
                type="button"
                onClick={() => openNewSubphase(filters.faseId)}
                className="mt-2 text-indigo-600 hover:underline text-sm"
              >
                Crear la primera subfase
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {visibleSubphases.map((subphase) => (
              <div
                key={subphase.id}
                className="min-w-[220px] max-w-[260px] flex-shrink-0 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-indigo-600 font-medium truncate">
                      {subphase.fase_nombre || '—'}
                    </p>
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug mt-0.5">
                      {subphase.nombre}
                    </h4>
                  </div>
                  {canManagePhases ? (
                    <button
                      type="button"
                      onClick={() => openEditSubphase(subphase)}
                      className="text-xs text-indigo-600 hover:underline shrink-0"
                    >
                      Editar
                    </button>
                  ) : null}
                </div>
                {subphase.descripcion ? (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{subphase.descripcion}</p>
                ) : null}
                <div className="mt-3 space-y-2">
                  <FaseEstadoBadge estado={subphase.estado} />
                  <ProgressBar pct={subphase.progressPct} />
                  <p className="text-xs text-gray-600">
                    {subphase.completedCount}/{subphase.taskCount} tareas · {subphase.progressLabel}
                  </p>
                  {(subphase.fecha_inicio || subphase.fecha_limite) && (
                    <p className="text-xs text-gray-500">
                      {subphase.fecha_inicio
                        ? `Inicio: ${formatStaffDateLabel(subphase.fecha_inicio)}`
                        : ''}
                      {subphase.fecha_limite
                        ? ` · Límite: ${formatStaffDateLabel(subphase.fecha_limite)}`
                        : ''}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      faseId: subphase.fase_id,
                      subfaseId: subphase.id,
                    }))
                  }
                  className="mt-3 text-xs text-indigo-700 hover:underline"
                >
                  Ver tareas de esta subfase
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      {showTemplates ? (
        <StaffTaskTemplatesSection
          fetchApi={staffTasksFetch}
          templates={templates}
          templatesReady={templatesReady}
          phases={phases}
          saving={saving}
          onTemplatesChange={loadTemplates}
          onUseTemplate={(t) => openNewTask(t)}
        />
      ) : null}

      {/* Filters */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Título o descripción…"
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          {canPickAssignee ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Persona</label>
              <select
                value={filters.assigneeId}
                onChange={(e) => setFilters((f) => ({ ...f, assigneeId: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              >
                <option value="">Todas</option>
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {formatAssigneeLabel(u)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Departamento</label>
            <select
              value={filters.rol}
              onChange={(e) => setFilters((f) => ({ ...f, rol: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Todos</option>
              {ROL_OPTIONS.map((r) => (
                <option key={r.value} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fase</label>
            <select
              value={filters.faseId}
              onChange={(e) => {
                const faseId = e.target.value;
                setFilters((f) => ({
                  ...f,
                  faseId,
                  subfaseId:
                    f.subfaseId &&
                    subphases.some((s) => s.id === f.subfaseId && s.fase_id === faseId)
                      ? f.subfaseId
                      : '',
                }));
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Todas</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subfase</label>
            <select
              value={filters.subfaseId}
              onChange={(e) => setFilters((f) => ({ ...f, subfaseId: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Todas</option>
              {filterSubphases.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Todos</option>
              {[...TASK_ESTADOS, 'vencida'].map((s) => (
                <option key={s} value={s}>
                  {TASK_ESTADO_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
            <select
              value={filters.prioridad}
              onChange={(e) => setFilters((f) => ({ ...f, prioridad: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Todas</option>
              {TASK_PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORIDAD_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha límite</label>
            <select
              value={filters.fechaLimite}
              onChange={(e) => setFilters((f) => ({ ...f, fechaLimite: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              {FECHA_LIMITE_FILTERS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => loadTasks()}
            disabled={loading || saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
              <tr>
                <th className="px-5 py-3.5 w-[28%]">Tarea</th>
                <th className="px-4 py-3.5 w-[18%]">Ubicación</th>
                <th className="px-4 py-3.5 w-[16%]">Asignado</th>
                <th className="px-4 py-3.5 w-[14%]">Plazo</th>
                <th className="px-4 py-3.5 w-[24%] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !tasks.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    Cargando tareas…
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-gray-500">No hay tareas con estos filtros.</p>
                    <button
                      type="button"
                      onClick={() => openNewTask()}
                      className="mt-2 text-violet-600 hover:underline text-sm"
                    >
                      + Crear la primera tarea
                    </button>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-violet-50/30 align-top">
                    <td className="px-5 py-4">
                      <TaskTableTitleCell task={task} onOpen={() => setDetailTask(task)} />
                    </td>
                    <td className="px-4 py-4">
                      <TaskTableLocationCell fase={task.fase} subfase={task.subfase} />
                    </td>
                    <td className="px-4 py-4">
                      <TaskTableAssigneeCell task={task} />
                    </td>
                    <td className="px-4 py-4">
                      <TaskTableDeadlineCell
                        fechaLabel={
                          task.fecha_limite ? formatStaffDateTimeLabel(task.fecha_limite) : ''
                        }
                        timeRemaining={task.timeRemaining}
                        isOverdue={task.isOverdue}
                        cumplimiento={task.cumplimiento}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end gap-2.5 min-w-[9rem]">
                        <select
                          value={task.estado}
                          disabled={saving}
                          onChange={(e) => void quickEstado(task, e.target.value)}
                          className="w-full max-w-[9.5rem] text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                          title="Cambiar estado"
                        >
                          {TASK_ESTADOS.map((s) => (
                            <option key={s} value={s}>
                              {TASK_ESTADO_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                          <button
                            type="button"
                            onClick={() => openEditTask(task)}
                            className="text-xs font-medium text-violet-600 hover:text-violet-800"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void duplicateTask(task)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900"
                          >
                            Duplicar
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => void deleteTask(task)}
                              className="text-xs font-medium text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          ) : canCancel && task.estado !== 'cancelada' ? (
                            <button
                              type="button"
                              onClick={() => void quickEstado(task, 'cancelada')}
                              className="text-xs font-medium text-amber-700 hover:text-amber-900"
                            >
                              Cancelar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail drawer */}
      {detailTask ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
          <div className="w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
              <h3 className="font-semibold">Detalle de tarea</h3>
              <button type="button" onClick={() => setDetailTask(null)} className="text-gray-400 text-xl">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <TaskEstadoBadge estado={detailTask.displayEstado} />
                <TaskPrioridadBadge prioridad={detailTask.prioridad} />
              </div>
              <h4 className="text-lg font-semibold">{detailTask.titulo}</h4>
              {detailTask.descripcion ? <p className="text-gray-600">{detailTask.descripcion}</p> : null}
              <dl className="space-y-2 text-gray-700">
                <div>
                  <dt className="text-xs text-gray-500">Asignado</dt>
                  <dd>{detailTask.asignado?.nombre || detailTask.asignado_rol || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Fase</dt>
                  <dd>{detailTask.fase?.nombre || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Fecha límite</dt>
                  <dd>{detailTask.timeRemaining}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Cumplimiento</dt>
                  <dd>{CUMPLIMIENTO_LABELS[detailTask.cumplimiento]}</dd>
                </div>
                {detailTask.notas ? (
                  <div>
                    <dt className="text-xs text-gray-500">Notas</dt>
                    <dd>{detailTask.notas}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    openEditTask(detailTask);
                    setDetailTask(null);
                  }}
                  className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs"
                >
                  Editar
                </button>
                {detailTask.estado !== 'completada' ? (
                  <button
                    type="button"
                    onClick={() => void quickEstado(detailTask, 'completada')}
                    className="px-3 py-1.5 border rounded-lg text-xs"
                  >
                    Marcar completada
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => void deleteTask(detailTask)}
                    className="px-3 py-1.5 border border-red-200 text-red-700 rounded-lg text-xs"
                  >
                    Eliminar
                  </button>
                ) : canCancel && detailTask.estado !== 'cancelada' ? (
                  <button
                    type="button"
                    onClick={() => void quickEstado(detailTask, 'cancelada')}
                    className="px-3 py-1.5 border border-amber-200 text-amber-800 rounded-lg text-xs"
                  >
                    Cancelar tarea
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <StaffTaskFormModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={saveTask}
        initial={taskForm}
        phases={phases}
        subphases={subphases}
        assignees={canPickAssignee ? assignees : assignees.filter((u) => u.id === currentUserId)}
        onAssigneeChange={setTaskForm}
        saving={saving}
        title={editingTaskId ? 'Editar tarea' : 'Nueva tarea'}
      />

      {canManagePhases ? (
        <>
          <StaffPhaseFormModal
            open={phaseModalOpen}
            onClose={() => setPhaseModalOpen(false)}
            onSave={savePhase}
            initial={phaseForm}
            onChange={setPhaseForm}
            assignees={assignees}
            saving={saving}
            title={editingPhaseId ? 'Editar fase' : 'Nueva fase'}
          />
          <StaffSubphaseFormModal
            open={subphaseModalOpen}
            onClose={() => setSubphaseModalOpen(false)}
            onSave={saveSubphase}
            initial={subphaseForm}
            onChange={setSubphaseForm}
            phases={phases}
            saving={saving}
            title={editingSubphaseId ? 'Editar subfase' : 'Nueva subfase'}
          />
        </>
      ) : null}
    </div>
  );
}
