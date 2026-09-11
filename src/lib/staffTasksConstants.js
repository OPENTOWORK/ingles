export const TASK_ESTADOS = [
  'pendiente',
  'en_progreso',
  'en_revision',
  'completada',
  'cancelada',
  'bloqueada',
];

export const TASK_PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];

export const FASE_ESTADOS = [
  'no_iniciada',
  'en_progreso',
  'en_revision',
  'completada',
  'bloqueada',
];

export const TASK_ESTADO_LABELS = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  completada: 'Completada',
  cancelada: 'Cancelada',
  bloqueada: 'Bloqueada',
  vencida: 'Vencida',
};

export const TASK_PRIORIDAD_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const FASE_ESTADO_LABELS = {
  no_iniciada: 'No iniciada',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

export const FASE_ESTADO_COLORS = {
  no_iniciada: 'bg-slate-100 text-slate-700',
  en_progreso: 'bg-blue-100 text-blue-800',
  en_revision: 'bg-amber-100 text-amber-800',
  completada: 'bg-emerald-100 text-emerald-800',
  bloqueada: 'bg-red-100 text-red-800',
};

export const FASE_ESTADO_BORDER = {
  no_iniciada: 'border-slate-200',
  en_progreso: 'border-blue-200',
  en_revision: 'border-amber-200',
  completada: 'border-emerald-200',
  bloqueada: 'border-red-200',
};

export const TASK_ESTADO_COLORS = {
  pendiente: 'bg-slate-100 text-slate-700',
  en_progreso: 'bg-blue-100 text-blue-800',
  en_revision: 'bg-amber-100 text-amber-800',
  completada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-gray-100 text-gray-600',
  bloqueada: 'bg-red-100 text-red-800',
  vencida: 'bg-orange-100 text-orange-900',
};

export const TASK_PRIORIDAD_COLORS = {
  baja: 'bg-gray-100 text-gray-600',
  media: 'bg-violet-100 text-violet-700',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-900',
};

export const CUMPLIMIENTO_LABELS = {
  a_tiempo: 'A tiempo',
  vencida: 'Vencida',
  completada_tarde: 'Completada tarde',
  completada_a_tiempo: 'Completada a tiempo',
  sin_fecha: 'Sin fecha',
};

export const FECHA_LIMITE_FILTERS = [
  { value: '', label: 'Todas las fechas' },
  { value: 'hoy', label: 'Vence hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'prox7', label: 'Próximos 7 días' },
  { value: 'vencidas', label: 'Vencidas' },
];

export const EMPTY_TASK_FORM = {
  titulo: '',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fase_id: '',
  subfase_id: '',
  asignado_id: '',
  asignado_rol: '',
  alumno_id: '',
  fecha_limite: '',
  enlace: '',
  notas: '',
  bloqueada_motivo: '',
  checklist: [],
};

export const EMPTY_FASE_FORM = {
  nombre: '',
  descripcion: '',
  estado: 'no_iniciada',
  orden: 0,
  fecha_inicio: '',
  fecha_limite: '',
  responsable_id: '',
  responsable_rol: '',
  responsables_ids: [],
  responsables_todos: false,
  visible_para_todos: true,
};

export const EMPTY_SUBFASE_FORM = {
  fase_id: '',
  nombre: '',
  descripcion: '',
  estado: 'no_iniciada',
  orden: 0,
  fecha_inicio: '',
  fecha_limite: '',
  visible_para_todos: true,
};

export const STAFF_TASKS_VIEW_STORAGE_KEY = 'dralo_staff_tasks_view_mode';

export const STAFF_TASKS_VIEW_MODES = [
  { id: 'classic', label: 'Vista actual' },
  { id: 'kanban-phases', label: 'Kanban fases' },
  { id: 'kanban-subphases', label: 'Kanban subfases' },
  { id: 'kanban-tasks', label: 'Kanban tareas' },
];

export const KANBAN_FASE_COLUMN_STYLES = {
  no_iniciada: { background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' },
  en_progreso: { background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)' },
  en_revision: { background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)' },
  completada: { background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)' },
  bloqueada: { background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)' },
};

export const KANBAN_TASK_COLUMN_STYLES = {
  pendiente: { background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' },
  en_progreso: { background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)' },
  en_revision: { background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)' },
  completada: { background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)' },
  cancelada: { background: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)' },
  bloqueada: { background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)' },
};

export const EMPTY_TEMPLATE_FORM = {
  nombre: '',
  titulo: '',
  descripcion: '',
  enlace: '',
  prioridad_default: 'media',
  asignado_rol_default: '',
  fase_id: '',
  notas_default: '',
};
