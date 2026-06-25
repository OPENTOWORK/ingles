'use client';

import {
  CUMPLIMIENTO_LABELS,
  FASE_ESTADO_LABELS,
  TASK_ESTADO_COLORS,
  TASK_ESTADO_LABELS,
  TASK_PRIORIDAD_COLORS,
  TASK_PRIORIDAD_LABELS,
} from '@/lib/staffTasksConstants';

export function TaskEstadoBadge({ estado = 'pendiente' }) {
  const label = TASK_ESTADO_LABELS[estado] || estado;
  const color = TASK_ESTADO_COLORS[estado] || TASK_ESTADO_COLORS.pendiente;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export function TaskPrioridadBadge({ prioridad = 'media' }) {
  const label = TASK_PRIORIDAD_LABELS[prioridad] || prioridad;
  const color = TASK_PRIORIDAD_COLORS[prioridad] || TASK_PRIORIDAD_COLORS.media;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export function FaseEstadoBadge({ estado = 'no_iniciada' }) {
  const label = FASE_ESTADO_LABELS[estado] || estado;
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-800">
      {label}
    </span>
  );
}

export function CumplimientoBadge({ cumplimiento = 'sin_fecha' }) {
  const label = CUMPLIMIENTO_LABELS[cumplimiento] || cumplimiento;
  const colors = {
    a_tiempo: 'bg-emerald-50 text-emerald-700',
    vencida: 'bg-orange-100 text-orange-900',
    completada_tarde: 'bg-amber-100 text-amber-900',
    completada_a_tiempo: 'bg-emerald-100 text-emerald-800',
    sin_fecha: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[cumplimiento] || colors.sin_fecha}`}
    >
      {label}
    </span>
  );
}

export function ProgressBar({ pct = 0, className = '' }) {
  const safe = Math.max(0, Math.min(100, pct));
  return (
    <div className={`h-2 w-full rounded-full bg-gray-200 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-violet-600 transition-all"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
