'use client';

import {
  CUMPLIMIENTO_LABELS,
  FASE_ESTADO_BORDER,
  FASE_ESTADO_COLORS,
  FASE_ESTADO_LABELS,
  TASK_ESTADO_COLORS,
  TASK_ESTADO_LABELS,
  TASK_PRIORIDAD_COLORS,
  TASK_PRIORIDAD_LABELS,
} from '@/lib/staffTasksConstants';

export function TaskEstadoBadge({ estado = 'pendiente', compact = false }) {
  const label = TASK_ESTADO_LABELS[estado] || estado;
  const color = TASK_ESTADO_COLORS[estado] || TASK_ESTADO_COLORS.pendiente;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${
        compact ? 'px-1.5 py-0 text-[10px] leading-5' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {label}
    </span>
  );
}

export function TaskPrioridadBadge({ prioridad = 'media', compact = false }) {
  const label = TASK_PRIORIDAD_LABELS[prioridad] || prioridad;
  const color = TASK_PRIORIDAD_COLORS[prioridad] || TASK_PRIORIDAD_COLORS.media;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${
        compact ? 'px-1.5 py-0 text-[10px] leading-5' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {label}
    </span>
  );
}

export function FaseEstadoBadge({ estado = 'no_iniciada', compact = false }) {
  const label = FASE_ESTADO_LABELS[estado] || estado;
  const color = FASE_ESTADO_COLORS[estado] || FASE_ESTADO_COLORS.no_iniciada;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${
        compact ? 'px-1.5 py-0 text-[10px] leading-5' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
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

function LocationBlock({ label, nombre, estado, borderClass, bgClass, textClass }) {
  if (!nombre) return null;
  return (
    <div
      className={`rounded-lg border px-2.5 py-2 ${borderClass} ${bgClass}`}
      title={`${FASE_ESTADO_LABELS[estado] || estado} · ${nombre}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${textClass}`}>
          {label}
        </span>
        <FaseEstadoBadge estado={estado} compact />
      </div>
      <p className={`text-xs leading-snug line-clamp-2 ${textClass}`}>{nombre}</p>
    </div>
  );
}

export function TaskTableTitleCell({ task, onOpen }) {
  return (
    <div className="min-w-[11rem] max-w-[20rem]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="font-semibold text-gray-900 hover:text-violet-700 text-left leading-snug"
        >
          {task.titulo}
        </button>
        {task.enlace ? (
          <a
            href={task.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-violet-600 hover:bg-violet-50 hover:text-violet-800"
            title="Abrir enlace"
            onClick={(e) => e.stopPropagation()}
          >
            ↗
          </a>
        ) : null}
      </div>
      {task.descripcion ? (
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{task.descripcion}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <TaskEstadoBadge estado={task.displayEstado || task.estado} compact />
        <TaskPrioridadBadge prioridad={task.prioridad} compact />
      </div>
    </div>
  );
}

export function TaskTableLocationCell({ fase, subfase }) {
  if (!fase?.nombre && !subfase?.nombre) {
    return <span className="text-xs text-gray-400">Sin fase</span>;
  }

  return (
    <div className="space-y-2 w-[13rem] max-w-[13rem]">
      <LocationBlock
        label="Fase"
        nombre={fase?.nombre}
        estado={fase?.estado || 'no_iniciada'}
        borderClass={FASE_ESTADO_BORDER[fase?.estado] || FASE_ESTADO_BORDER.no_iniciada}
        bgClass="bg-violet-50/70"
        textClass="text-violet-950"
      />
      <LocationBlock
        label="Subfase"
        nombre={subfase?.nombre}
        estado={subfase?.estado || 'no_iniciada'}
        borderClass={FASE_ESTADO_BORDER[subfase?.estado] || 'border-indigo-200'}
        bgClass="bg-indigo-50/60 ml-2"
        textClass="text-indigo-950"
      />
    </div>
  );
}

export function TaskTableAssigneeCell({ task }) {
  const name = task.asignado?.nombre || task.asignado?.email;
  if (!name) return <span className="text-xs text-gray-400">—</span>;

  const initials = String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="flex items-center gap-2.5 min-w-[8rem]">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">
        {initials || '?'}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        {task.asignado_rol ? (
          <p className="text-xs text-gray-500 truncate">{task.asignado_rol}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TaskTableDeadlineCell({ fechaLabel, timeRemaining, isOverdue, cumplimiento }) {
  return (
    <div className="space-y-1.5 min-w-[7.5rem]">
      {fechaLabel ? (
        <>
          <p className="text-sm text-gray-800 whitespace-nowrap">{fechaLabel}</p>
          <p
            className={`text-xs whitespace-nowrap ${
              isOverdue ? 'text-orange-700 font-semibold' : 'text-gray-500'
            }`}
          >
            {timeRemaining}
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-400">Sin fecha límite</p>
      )}
      <CumplimientoBadge cumplimiento={cumplimiento} />
    </div>
  );
}
