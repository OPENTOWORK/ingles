'use client';

import { useMemo, useState } from 'react';
import { FaseEstadoBadge, TaskPrioridadBadge } from '@/components/tasks/StaffTaskBadges';
import styles from './StaffTasksList.module.css';

function toggleId(setter, id) {
  setter((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

export function CompleteCheck({ checked, disabled, onChange, label = 'Marcar completada' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? 'Quitar completada' : label}
      disabled={disabled}
      className={`${styles.check} ${checked ? styles.checkOn : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
    >
      {checked ? '✓' : ''}
    </button>
  );
}

function MiniTrack({ pct = 0 }) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <span className={styles.track} aria-hidden="true">
      <span style={{ width: `${safe}%` }} />
    </span>
  );
}

function TaskRow({ task, loose = false, open, onToggle, saving, onComplete, onOpen, extra }) {
  const done = task.estado === 'completada';
  const tone = styles[`task--${task.estado}`] || '';
  return (
    <article className={`${styles.task} ${tone} ${loose ? styles['task--loose'] : ''}`}>
      <div className={styles.taskMain}>
        <CompleteCheck
          checked={done}
          disabled={saving}
          onChange={() => onComplete(task, done ? 'pendiente' : 'completada')}
        />
        <button type="button" className={styles.chevron} onClick={onToggle} aria-expanded={open}>
          {open ? '▾' : '▸'}
        </button>
        <button
          type="button"
          className={`${styles.taskTitle} ${done ? styles.taskTitleDone : ''}`}
          onClick={onToggle}
        >
          {task.titulo}
        </button>
        <span className={styles.meta}>
          {task.asignado?.nombre || task.asignado?.email || task.asignado_rol || 'Sin asignar'}
        </span>
        {task.timeRemaining ? <span className={styles.meta}>{task.timeRemaining}</span> : null}
        <span className={styles.chips}>
          <TaskPrioridadBadge prioridad={task.prioridad} compact />
        </span>
      </div>
      {open ? (
        <div className={styles.detail}>
          {task.descripcion ? <p>{task.descripcion}</p> : null}
          <p>
            {task.asignado?.nombre || task.asignado_rol || 'Sin asignar'}
            {task.timeRemaining ? ` · ${task.timeRemaining}` : ''}
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={() => onOpen(task)}>
              Ver detalle
            </button>
            {extra}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function StaffTasksListView({
  phases,
  subphases,
  tasks,
  saving,
  onComplete,
  onOpen,
  renderTaskActions,
}) {
  const [openPhases, setOpenPhases] = useState(() => new Set());
  const [openSubphases, setOpenSubphases] = useState(() => new Set());
  const [openTasks, setOpenTasks] = useState(() => new Set());

  const tree = useMemo(() => {
    const phaseIds = new Set(phases.map((phase) => phase.id));
    const subIds = new Set(subphases.map((subphase) => subphase.id));
    const tasksBySub = new Map();
    const tasksByPhase = new Map();
    const loose = [];

    for (const task of tasks) {
      if (task.subfase_id && subIds.has(task.subfase_id)) {
        const bucket = tasksBySub.get(task.subfase_id) || [];
        bucket.push(task);
        tasksBySub.set(task.subfase_id, bucket);
      } else if (task.fase_id && phaseIds.has(task.fase_id)) {
        const bucket = tasksByPhase.get(task.fase_id) || [];
        bucket.push(task);
        tasksByPhase.set(task.fase_id, bucket);
      } else {
        loose.push(task);
      }
    }

    const subsByPhase = new Map();
    for (const subphase of subphases) {
      const bucket = subsByPhase.get(subphase.fase_id) || [];
      bucket.push(subphase);
      subsByPhase.set(subphase.fase_id, bucket);
    }

    return { tasksBySub, tasksByPhase, loose, subsByPhase };
  }, [phases, subphases, tasks]);

  if (!phases.length && !tasks.length) {
    return <p className={styles.empty}>No hay tareas con estos filtros.</p>;
  }

  return (
    <div className={styles.list}>
      {phases.map((phase) => {
        const phaseOpen = openPhases.has(phase.id);
        const subs = tree.subsByPhase.get(phase.id) || [];
        const directTasks = tree.tasksByPhase.get(phase.id) || [];
        return (
          <section key={phase.id} className={`${styles.group} ${styles['group--phase']}`}>
            <button
              type="button"
              className={styles.head}
              aria-expanded={phaseOpen}
              onClick={() => toggleId(setOpenPhases, phase.id)}
            >
              <span className={styles.chevron}>{phaseOpen ? '▾' : '▸'}</span>
              <span className={styles.name}>{phase.nombre}</span>
              <MiniTrack pct={phase.progressPct} />
              <FaseEstadoBadge estado={phase.estado} compact />
              <span className={styles.meta}>
                {phase.completedCount}/{phase.taskCount}
              </span>
            </button>
            {phaseOpen ? (
              <div className={styles.body}>
                {subs.map((subphase) => {
                  const subOpen = openSubphases.has(subphase.id);
                  const subTasks = tree.tasksBySub.get(subphase.id) || [];
                  return (
                    <section key={subphase.id} className={`${styles.group} ${styles['group--sub']}`}>
                      <button
                        type="button"
                        className={styles.head}
                        aria-expanded={subOpen}
                        onClick={() => toggleId(setOpenSubphases, subphase.id)}
                      >
                        <span className={styles.chevron}>{subOpen ? '▾' : '▸'}</span>
                        <span className={styles.name}>{subphase.nombre}</span>
                        <MiniTrack pct={subphase.progressPct} />
                        <FaseEstadoBadge estado={subphase.estado} compact />
                        <span className={styles.meta}>
                          {subphase.completedCount}/{subphase.taskCount}
                        </span>
                      </button>
                      {subOpen
                        ? subTasks.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              open={openTasks.has(task.id)}
                              onToggle={() => toggleId(setOpenTasks, task.id)}
                              saving={saving}
                              onComplete={onComplete}
                              onOpen={onOpen}
                              extra={renderTaskActions?.(task)}
                            />
                          ))
                        : null}
                    </section>
                  );
                })}
                {directTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    loose
                    open={openTasks.has(task.id)}
                    onToggle={() => toggleId(setOpenTasks, task.id)}
                    saving={saving}
                    onComplete={onComplete}
                    onOpen={onOpen}
                    extra={renderTaskActions?.(task)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
      {subphases
        .filter((subphase) => !phases.some((phase) => phase.id === subphase.fase_id))
        .map((subphase) => {
          const subOpen = openSubphases.has(subphase.id);
          const subTasks = tree.tasksBySub.get(subphase.id) || [];
          return (
            <section
              key={subphase.id}
              className={`${styles.group} ${styles['group--sub']} ${styles['group--root']}`}
            >
              <button
                type="button"
                className={styles.head}
                aria-expanded={subOpen}
                onClick={() => toggleId(setOpenSubphases, subphase.id)}
              >
                <span className={styles.chevron}>{subOpen ? '▾' : '▸'}</span>
                <span className={styles.name}>{subphase.nombre}</span>
                <MiniTrack pct={subphase.progressPct} />
                <FaseEstadoBadge estado={subphase.estado} compact />
                <span className={styles.meta}>
                  {subphase.completedCount}/{subphase.taskCount}
                </span>
              </button>
              {subOpen
                ? subTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      open={openTasks.has(task.id)}
                      onToggle={() => toggleId(setOpenTasks, task.id)}
                      saving={saving}
                      onComplete={onComplete}
                      onOpen={onOpen}
                      extra={renderTaskActions?.(task)}
                    />
                  ))
                : null}
            </section>
          );
        })}
      {tree.loose.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          loose
          open={openTasks.has(task.id)}
          onToggle={() => toggleId(setOpenTasks, task.id)}
          saving={saving}
          onComplete={onComplete}
          onOpen={onOpen}
          extra={renderTaskActions?.(task)}
        />
      ))}
    </div>
  );
}
